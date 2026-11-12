import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase'
import { addDays, today, indexPedidos, indexEntregas, custoMedio, cobertura, dia, mesResumo } from './logic'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const TABLES_BY_EVENT = {
  entregas: ['entregas', 'estoque'],
  entradas: ['entradas', 'estoque'],
  pedidos: ['pedidos'],
  clientes: ['clientes'],
  config: ['config'],
  profiles: ['team', 'profile'],
}

export function AppProvider({ session, children }) {
  const uid = session.user.id
  const [profile, setProfile] = useState(null)
  const [rows, setRows] = useState({ clientes: [], entradas: [], pedidos: [], entregas: [], config: null, estoque: { ent: 0, sai: 0 }, team: [] })
  const [ready, setReady] = useState(false)
  const [live, setLive] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [sheet, setSheet] = useState(null)
  const toastTimer = useRef()

  const toast = useCallback((m) => {
    setToastMsg(m)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 3200)
  }, [])

  const gestor = profile?.role === 'gestor' && profile?.ativo

  const load = useCallback(async (key, isGestor) => {
    const since = addDays(today(), -100)
    const q = {
      clientes: () => supabase.from('clientes').select('*'),
      entradas: () => supabase.from('entradas').select('*').order('data', { ascending: false }).order('created_at', { ascending: false }),
      pedidos: () => supabase.from('pedidos').select('*').gte('data', since),
      entregas: () => supabase.from('entregas').select('*').gte('data', since),
      config: () => supabase.from('config').select('*').eq('id', 1).maybeSingle(),
      estoque: () => supabase.from('v_estoque').select('*').single(),
      team: () => supabase.from('profiles').select('*').order('nome'),
    }
    if (!isGestor && ['clientes', 'entradas', 'team'].includes(key)) return
    const { data, error } = await q[key]()
    if (error) { console.error(key, error); return }
    setRows((r) => ({ ...r, [key]: data ?? (key === 'config' ? null : []) }))
  }, [])

  // perfil
  const loadProfile = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    setProfile(data)
    return data
  }, [uid])

  useEffect(() => { loadProfile() }, [loadProfile])

  // dados + tempo real, depois que o perfil estiver ativo
  useEffect(() => {
    if (!profile?.ativo) { setReady(true); return }
    const isG = profile.role === 'gestor'
    let alive = true
    Promise.all(['clientes', 'entradas', 'pedidos', 'entregas', 'config', 'estoque', 'team'].map((k) => load(k, isG))).then(() => alive && setReady(true))
    const ch = supabase
      .channel('app-db')
      .on('postgres_changes', { event: '*', schema: 'public' }, (p) => {
        const keys = TABLES_BY_EVENT[p.table] || []
        keys.forEach((k) => (k === 'profile' ? loadProfile() : load(k, isG)))
        if (p.table === 'pedidos' && !isG && p.eventType !== 'DELETE' && p.new?.data === today() && !p.new.cancelado) {
          toast(`Novo pedido: ${p.new.nome || 'cliente'}`)
          try { navigator.vibrate?.(200) } catch { /* ignora */ }
        }
      })
      .subscribe((status) => setLive(status === 'SUBSCRIBED'))
    return () => { alive = false; supabase.removeChannel(ch) }
  }, [profile?.ativo, profile?.role, load, loadProfile, toast])

  const config = useMemo(() => ({
    precoVenda: +(rows.config?.preco_venda ?? 10), custo: +(rows.config?.custo ?? 6), defaults: !rows.config || (+rows.config.preco_venda === 10 && +rows.config.custo === 6),
  }), [rows.config])

  const d = useMemo(() => {
    const base = { clientes: rows.clientes, pedidos: indexPedidos(rows.pedidos), entregas: indexEntregas(rows.entregas), config }
    base.custo = custoMedio(rows.entradas, config)
    return base
  }, [rows, config])

  const estoque = useMemo(() => ({ ent: rows.estoque?.ent || 0, sai: rows.estoque?.sai || 0, atual: (rows.estoque?.ent || 0) - (rows.estoque?.sai || 0) }), [rows.estoque])
  const names = useMemo(() => Object.fromEntries(rows.team.map((p) => [p.id, p.nome])), [rows.team])

  // ---- ações (todas retornam true/false e avisam o usuário) ----
  const run = useCallback(async (fn, okMsg) => {
    const { error } = await fn()
    if (error) { toast(error.message?.includes('Estoque') ? error.message : 'Sem permissão ou falha ao salvar.'); return false }
    if (okMsg) toast(okMsg)
    return true
  }, [toast])

  const actions = useMemo(() => ({
    saveCliente: (c) => run(() => c.id ? supabase.from('clientes').update(c).eq('id', c.id) : supabase.from('clientes').insert(c), 'Cliente salvo'),
    saveConfig: (c) => run(() => supabase.from('config').upsert({ id: 1, preco_venda: c.precoVenda, custo: c.custo }), 'Configurações salvas'),
    addEntrada: (e) => run(() => supabase.from('entradas').insert({ ...e, criado_por: uid }), e.tipo === 'ajuste' ? 'Ajuste registrado' : 'Entrada registrada'),
    savePedido: (p) => run(() => supabase.from('pedidos').upsert({ ...p, cancelado: false }, { onConflict: 'cliente_id,data' }), 'Pedido enviado'),
    enviarPedidos: (list) => run(() => supabase.from('pedidos').upsert(list, { onConflict: 'cliente_id,data' }), `${list.length} pedido(s) enviados`),
    cancelPedido: (cid, date) => run(() => supabase.from('pedidos').update({ cancelado: true }).eq('cliente_id', cid).eq('data', date), 'Pedido cancelado'),
    setEntrega: (e, msg) => run(() => supabase.from('entregas').upsert({ ...e, vendedor_id: uid }, { onConflict: 'cliente_id,data' }), msg),
    setMembro: (id, patch) => run(() => supabase.from('profiles').update(patch).eq('id', id), 'Equipe atualizada'),
    sair: () => supabase.auth.signOut(),
  }), [run, uid])

  const value = { uid, profile, gestor, ready, live, d, rows, config, estoque, names, actions, toast, toastMsg, sheet, openSheet: setSheet, closeSheet: () => setSheet(null), reloadProfile: loadProfile }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export { cobertura, dia, mesResumo }

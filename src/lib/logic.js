// Regras de negócio puras (sem acesso ao banco): datas, estoque, cobertura, dia e perdas.

export const pad = (n) => String(n).padStart(2, '0')
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d) }
export const today = () => ymd(new Date())
export const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
export const FORMAS = ['Dinheiro', 'Pix', 'Cartão', 'Fiado']
export const MOTIVOS = ['Cliente ausente', 'Sem estoque', 'Sem tempo', 'Cliente cancelou', 'Outro']

export const brl = (n) => (+n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const nf = (n) => (+n || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })

export function fmtDia(s) {
  const d = parse(s), t = today()
  const l = `${DOW[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
  if (s === t) return `Hoje · ${l}`
  if (s === addDays(t, -1)) return `Ontem · ${l}`
  if (s === addDays(t, 1)) return `Amanhã · ${l}`
  return l
}

// ---- conversões das linhas do banco para estruturas por dia ----
export function indexPedidos(rows) {
  const out = {}
  for (const p of rows) {
    ;(out[p.data] ||= {})[p.cliente_id] = {
      nome: p.nome, endereco: p.endereco, bairro: p.bairro, tel: p.tel, obs: p.obs,
      qtd: p.qtd, valorUnit: +p.valor_unit, cancelado: p.cancelado,
    }
  }
  return out
}
export function indexEntregas(rows) {
  const out = {}
  for (const e of rows) {
    ;(out[e.data] ||= {})[e.cliente_id] = {
      status: e.status, qtd: e.qtd, valor: +e.valor, forma: e.forma, motivo: e.motivo, vid: e.vendedor_id,
    }
  }
  return out
}

export function custoMedio(entradas, config) {
  let q = 0, t = 0
  for (const e of entradas) if (e.tipo !== 'ajuste' && e.qtd > 0 && e.custo > 0) { q += e.qtd; t += e.qtd * e.custo }
  return q ? t / q : +config.custo || 0
}

export function cobertura(clientes, est) {
  const ativos = clientes.filter((c) => c.ativo !== false)
  const agenda = ativos.filter((c) => (c.dias || []).length && c.qtd > 0)
  const dem = agenda.reduce((a, c) => a + (c.qtd * c.dias.length) / 7, 0)
  const media = agenda.length ? agenda.reduce((a, c) => a + c.qtd, 0) / agenda.length : 0
  const clientesAtendidos = media ? Math.min(agenda.length, Math.floor(Math.max(est, 0) / media)) : 0
  return { ativos: ativos.length, agenda: agenda.length, dem, dias: dem > 0 ? Math.max(est, 0) / dem : null, clientes: clientesAtendidos }
}

// Resumo de um dia. d = { clientes, pedidos, entregas, config, custo }
// Previstos = pedidos do dia + clientes agendados para aquele dia da semana sem pedido.
// Não atendido = entrega marcada como não feita, ou dia já encerrado sem entrega confirmada.
export function dia(d, date) {
  const t = today()
  const ped = d.pedidos[date] || {}
  const ent = d.entregas[date] || {}
  const dow = parse(date).getDay()
  const rows = [], seen = new Set()
  const mk = (cid, p, enviado) => {
    const e = ent[cid]
    let st
    if (e && e.status === 'entregue') st = 'entregue'
    else if (e && e.status === 'nao_entregue') st = 'nao_entregue'
    else st = date < t ? 'sem_atendimento' : 'pendente'
    const vu = +p.valorUnit || 0, q = +p.qtd || 0
    let perdaQ = 0
    if (st === 'nao_entregue' || st === 'sem_atendimento') perdaQ = q
    else if (st === 'entregue') perdaQ = Math.max(0, q - (+e.qtd || 0))
    return { cid, nome: p.nome, bairro: p.bairro, endereco: p.endereco, tel: p.tel, obs: p.obs, qtd: q, valorUnit: vu, enviado, st, e: e || null, perda: perdaQ * vu, margem: perdaQ * (vu - d.custo) }
  }
  for (const [cid, p] of Object.entries(ped)) { if (p.cancelado) continue; seen.add(cid); rows.push(mk(cid, p, true)) }
  for (const c of d.clientes) {
    if (c.ativo === false || seen.has(c.id) || !(c.dias || []).includes(dow) || (c.criado_em || '0000-00-00') > date) continue
    if (ped[c.id] && ped[c.id].cancelado) continue
    rows.push(mk(c.id, { nome: c.nome, bairro: c.bairro, endereco: c.endereco, tel: c.tel, qtd: c.qtd, valorUnit: d.config.precoVenda }, false))
  }
  rows.sort((a, b) => (a.bairro || '').localeCompare(b.bairro || '') || (a.nome || '').localeCompare(b.nome || ''))
  const r = { rows, total: rows.length, atend: 0, pend: 0, nao: 0, perda: 0, margem: 0, garrPend: 0, caixa: {}, fiado: 0, recebido: 0, entregues: 0 }
  for (const x of rows) {
    if (x.st === 'entregue') {
      r.atend++; r.entregues += +x.e.qtd || 0
      const f = x.e.forma || 'Dinheiro'
      if (f === 'Fiado') r.fiado += +x.e.valor || 0
      else { r.caixa[f] = (r.caixa[f] || 0) + (+x.e.valor || 0); r.recebido += +x.e.valor || 0 }
    } else if (x.st === 'pendente') { r.pend++; r.garrPend += x.qtd }
    else r.nao++
    r.perda += x.perda; r.margem += x.margem
  }
  return r
}

export function mesResumo(d, ym) {
  const [y, m] = ym.split('-').map(Number)
  const last = new Date(y, m, 0).getDate(), t = today()
  const days = [], porCliente = {}
  let perda = 0, margem = 0, nao = 0, atend = 0, total = 0
  for (let i = 1; i <= last; i++) {
    const ds = `${ym}-${pad(i)}`
    if (ds > t) break
    const r = dia(d, ds)
    if (!r.total) continue
    days.push({ ds, r }); perda += r.perda; margem += r.margem; nao += r.nao; atend += r.atend; total += r.total
    for (const x of r.rows) if (x.perda > 0) {
      const o = (porCliente[x.cid] ||= { nome: x.nome, n: 0, perda: 0 }); o.n++; o.perda += x.perda
    }
  }
  return { days, perda, margem, nao, atend, total, rank: Object.values(porCliente).sort((a, b) => b.perda - a.perda).slice(0, 6) }
}

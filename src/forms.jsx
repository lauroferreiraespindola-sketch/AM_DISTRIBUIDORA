import { useState } from 'react'
import { useApp } from './lib/data'
import { DOW, FORMAS, MOTIVOS, brl, today, dia } from './lib/logic'
import { Field } from './ui'

const Buttons = ({ onSave, saveLabel = 'Salvar', tone = 'primary', busy }) => {
  const { closeSheet } = useApp()
  return (
    <div className="actions" style={{ marginTop: 6 }}>
      <button type="button" className="btn grow" onClick={closeSheet}>Cancelar</button>
      <button type="button" className={`btn ${tone} grow`} disabled={busy} onClick={onSave}>{saveLabel}</button>
    </div>
  )
}

function useSave(fn) {
  const { closeSheet } = useApp()
  const [busy, setBusy] = useState(false)
  return [busy, async () => { setBusy(true); const ok = await fn(); setBusy(false); if (ok) closeSheet() }]
}

export function ClienteForm({ cliente }) {
  const { actions, toast } = useApp()
  const c = cliente || { dias: [1, 3, 5], qtd: 1, ativo: true, criado_em: today() }
  const [f, setF] = useState({ nome: c.nome || '', tel: c.tel || '', endereco: c.endereco || '', bairro: c.bairro || '', qtd: c.qtd || 1, dias: c.dias || [], criado_em: c.criado_em || today(), ativo: c.ativo !== false })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const [busy, save] = useSave(async () => {
    if (!f.nome.trim()) { toast('Informe o nome do cliente.'); return false }
    return actions.saveCliente({ ...(cliente ? { id: cliente.id } : {}), nome: f.nome.trim(), tel: f.tel.trim(), endereco: f.endereco.trim(), bairro: f.bairro.trim(), qtd: Math.max(1, +f.qtd || 1), dias: f.dias, criado_em: f.criado_em || today(), ativo: f.ativo })
  })
  const toggle = (i) => setF({ ...f, dias: f.dias.includes(i) ? f.dias.filter((x) => x !== i) : [...f.dias, i].sort() })
  return (
    <>
      <h2>{cliente ? 'Editar cliente' : 'Novo cliente'}</h2>
      <Field id="f-nome" label="Nome"><input id="f-nome" value={f.nome} onChange={set('nome')} autoComplete="off" /></Field>
      <Field id="f-tel" label="Telefone"><input id="f-tel" type="tel" value={f.tel} onChange={set('tel')} /></Field>
      <Field id="f-end" label="Endereço"><input id="f-end" value={f.endereco} onChange={set('endereco')} /></Field>
      <Field id="f-bai" label="Bairro / rota"><input id="f-bai" value={f.bairro} onChange={set('bairro')} /></Field>
      <Field id="f-qtd" label="Garrafões por visita"><input id="f-qtd" type="number" inputMode="numeric" min="1" value={f.qtd} onChange={set('qtd')} /></Field>
      <div className="fld">
        <label>Dias de entrega</label>
        <div className="chips">{DOW.map((d, i) => <button key={d} type="button" className="chip" aria-pressed={f.dias.includes(i)} onClick={() => toggle(i)}>{d}</button>)}</div>
        <span className="hint">Sem dias marcados, o cliente fica sob demanda e só entra com pedido avulso.</span>
      </div>
      <Field id="f-ini" label="Cliente desde"><input id="f-ini" type="date" value={f.criado_em} onChange={set('criado_em')} /></Field>
      <Field id="f-ativo" label="Situação">
        <select id="f-ativo" value={f.ativo ? '1' : '0'} onChange={(e) => setF({ ...f, ativo: e.target.value === '1' })}><option value="1">Ativo</option><option value="0">Inativo</option></select>
      </Field>
      <Buttons onSave={save} busy={busy} />
    </>
  )
}

export function EntradaForm({ ajuste }) {
  const { actions, config, toast } = useApp()
  const [f, setF] = useState({ qtd: '', custo: config.custo, fornecedor: '', motivo: '', data: today() })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const [busy, save] = useSave(async () => {
    const q = ajuste ? Math.trunc(+f.qtd) : Math.floor(+f.qtd)
    if (ajuste ? !q : !(q > 0)) { toast(ajuste ? 'Informe a quantidade (positiva ou negativa).' : 'Informe a quantidade recebida.'); return false }
    return actions.addEntrada(ajuste
      ? { tipo: 'ajuste', qtd: q, motivo: f.motivo.trim() || 'Ajuste', data: f.data || today() }
      : { tipo: 'entrada', qtd: q, custo: +f.custo || 0, fornecedor: f.fornecedor.trim(), data: f.data || today() })
  })
  return (
    <>
      <h2>{ajuste ? 'Ajuste de estoque' : 'Entrada de garrafões'}</h2>
      {ajuste && <p className="hint" style={{ marginTop: -6 }}>Use para quebra, perda, devolução ou correção após contagem. Número negativo retira do estoque.</p>}
      <Field id="e-q" label={ajuste ? 'Quantidade (use − para baixa)' : 'Quantidade recebida'}><input id="e-q" type="number" inputMode="numeric" step="1" value={f.qtd} onChange={set('qtd')} placeholder={ajuste ? '-3' : ''} /></Field>
      {!ajuste && <Field id="e-c" label="Custo por garrafão (R$)"><input id="e-c" type="number" inputMode="decimal" step="0.01" min="0" value={f.custo} onChange={set('custo')} /></Field>}
      {!ajuste && <Field id="e-f" label="Fornecedor / origem"><input id="e-f" value={f.fornecedor} onChange={set('fornecedor')} autoComplete="off" /></Field>}
      {ajuste && <Field id="e-m" label="Motivo"><input id="e-m" value={f.motivo} onChange={set('motivo')} placeholder="Garrafão quebrado, contagem…" autoComplete="off" /></Field>}
      <Field id="e-d" label="Data"><input id="e-d" type="date" value={f.data} onChange={set('data')} /></Field>
      <Buttons onSave={save} busy={busy} saveLabel="Registrar" />
    </>
  )
}

export function ConfigForm() {
  const { config, rows, actions, names, closeSheet } = useApp()
  const [f, setF] = useState({ precoVenda: config.precoVenda, custo: config.custo })
  const [busy, save] = useSave(() => actions.saveConfig({ precoVenda: +f.precoVenda || 0, custo: +f.custo || 0 }))
  const equipe = rows.team
  return (
    <>
      <h2>Configurações</h2>
      <Field id="g-v" label="Preço de venda do garrafão (R$)"><input id="g-v" type="number" inputMode="decimal" step="0.01" value={f.precoVenda} onChange={(e) => setF({ ...f, precoVenda: e.target.value })} /></Field>
      <Field id="g-c" label="Custo padrão do garrafão (R$)" hint="Usado até existirem entradas com custo."><input id="g-c" type="number" inputMode="decimal" step="0.01" value={f.custo} onChange={(e) => setF({ ...f, custo: e.target.value })} /></Field>
      <Buttons onSave={save} busy={busy} />
      <h2 style={{ marginTop: 22 }}>Equipe</h2>
      <p className="hint" style={{ marginTop: -6 }}>Quem se cadastra pelo app entra como vendedor inativo. Libere aqui para ele ver os pedidos.</p>
      <div className="list">
        {equipe.map((p) => (
          <div className="item" key={p.id}>
            <div className="top">
              <div className="nm">{p.nome || names[p.id] || 'Sem nome'}<div className="meta">{p.role === 'gestor' ? 'Gestor' : 'Vendedor'} · {p.ativo ? 'Ativo' : 'Aguardando liberação'}</div></div>
            </div>
            <div className="actions">
              <button className={`btn sm ${p.ativo ? 'danger' : 'primary'}`} onClick={() => actions.setMembro(p.id, { ativo: !p.ativo })}>{p.ativo ? 'Desativar' : 'Liberar acesso'}</button>
              <button className="btn sm ghost" onClick={() => actions.setMembro(p.id, { role: p.role === 'gestor' ? 'vendedor' : 'gestor' })}>{p.role === 'gestor' ? 'Tornar vendedor' : 'Tornar gestor'}</button>
            </div>
          </div>
        ))}
      </div>
      <div className="actions" style={{ marginTop: 14 }}><button className="btn grow" onClick={closeSheet}>Fechar</button></div>
    </>
  )
}

export function PedidoForm({ defaultDay }) {
  const { rows, config, actions, toast, d } = useApp()
  const ativos = rows.clientes.filter((c) => c.ativo !== false).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
  const [f, setF] = useState({ cid: ativos[0]?.id || '', qtd: ativos[0]?.qtd || 1, data: defaultDay < today() ? today() : defaultDay, obs: '' })
  const [busy, save] = useSave(async () => {
    const c = ativos.find((x) => x.id === f.cid)
    if (!c) return false
    if (d.entregas[f.data]?.[c.id]?.status === 'entregue') { toast('Este cliente já foi atendido neste dia.'); return false }
    return actions.savePedido({ cliente_id: c.id, data: f.data, qtd: Math.max(1, +f.qtd || 1), valor_unit: config.precoVenda, nome: c.nome, endereco: c.endereco, bairro: c.bairro, tel: c.tel, obs: f.obs.trim() })
  })
  if (!ativos.length) return <><h2>Novo pedido</h2><p className="hint">Cadastre um cliente primeiro.</p><Buttons onSave={() => {}} saveLabel="OK" /></>
  return (
    <>
      <h2>Novo pedido</h2>
      <Field id="p-c" label="Cliente">
        <select id="p-c" value={f.cid} onChange={(e) => setF({ ...f, cid: e.target.value, qtd: ativos.find((c) => c.id === e.target.value)?.qtd || 1 })}>{ativos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
      </Field>
      <Field id="p-q" label="Garrafões"><input id="p-q" type="number" inputMode="numeric" min="1" value={f.qtd} onChange={(e) => setF({ ...f, qtd: e.target.value })} /></Field>
      <Field id="p-d" label="Data da entrega"><input id="p-d" type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} /></Field>
      <Field id="p-o" label="Observação"><input id="p-o" value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} autoComplete="off" /></Field>
      <Buttons onSave={save} busy={busy} saveLabel="Enviar ao vendedor" />
    </>
  )
}

export function EntregarForm({ row, date }) {
  const { actions, estoque, toast } = useApp()
  const [q, setQ] = useState(row.qtd)
  const [forma, setForma] = useState(FORMAS[0])
  const [busy, save] = useSave(async () => {
    const n = Math.max(0, Math.floor(+q || 0))
    if (n < 1) { toast('Informe ao menos 1 garrafão entregue ou use Não entreguei.'); return false }
    if (n > estoque.atual) { toast(`Estoque insuficiente: restam ${estoque.atual} garrafões.`); return false }
    return actions.setEntrega({ cliente_id: row.cid, data: date, status: 'entregue', qtd: n, valor: n * row.valorUnit, forma, motivo: '' }, 'Entrega confirmada')
  })
  return (
    <>
      <h2>Confirmar entrega</h2>
      <div className="nm">{row.nome}</div>
      <div className="meta" style={{ marginBottom: 12 }}>Pedido: {row.qtd} garrafões · {brl(row.valorUnit)} cada</div>
      <div className="fld"><label htmlFor="d-q">Garrafões entregues</label>
        <div className="stepper">
          <button type="button" className="btn" onClick={() => setQ(Math.max(0, (+q || 0) - 1))}>−</button>
          <input id="d-q" type="number" inputMode="numeric" min="0" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" className="btn" onClick={() => setQ((+q || 0) + 1)}>+</button>
        </div>
      </div>
      <div className="fld"><label>Forma de pagamento</label>
        <div className="chips">{FORMAS.map((x) => <button key={x} type="button" className="chip" aria-pressed={forma === x} onClick={() => setForma(x)}>{x}</button>)}</div>
      </div>
      <Buttons onSave={save} busy={busy} saveLabel="Confirmar" tone="good" />
    </>
  )
}

export function NaoForm({ row, date }) {
  const { actions } = useApp()
  const [m, setM] = useState(MOTIVOS[0])
  const [busy, save] = useSave(() => actions.setEntrega({ cliente_id: row.cid, data: date, status: 'nao_entregue', qtd: 0, valor: 0, forma: '', motivo: m }, 'Registrado'))
  return (
    <>
      <h2>Por que não entregou?</h2>
      <div className="chips">{MOTIVOS.map((x) => <button key={x} type="button" className="chip" aria-pressed={m === x} onClick={() => setM(x)}>{x}</button>)}</div>
      <div style={{ height: 16 }} />
      <Buttons onSave={save} busy={busy} saveLabel="Registrar" tone="danger" />
    </>
  )
}

export { dia }

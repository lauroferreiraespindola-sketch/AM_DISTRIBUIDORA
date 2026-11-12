import { useApp } from './lib/data'
import { brl } from './lib/logic'
import { Pill } from './ui'
import { EntregarForm, NaoForm } from './forms'

// Cartão de um cliente/pedido. mode: 'gestor' (ver e cancelar) ou 'vend' (confirmar entrega).
export default function ItemRow({ r, mode, date }) {
  const { actions, openSheet, uid, names, gestor, profile } = useApp()
  const done = r.st === 'entregue'
  const meu = r.e?.vid === uid
  let right = <div className="qty num">{r.qtd}<small>garrafões</small></div>
  if (done) right = <div className="qty num">{+r.e.qtd || 0}<small>de {r.qtd}</small></div>
  const desfazer = (label) => (
    <div className="actions"><button className="btn sm ghost" onClick={() => actions.setEntrega({ cliente_id: r.cid, data: date, status: 'desfeito', qtd: 0, valor: 0, forma: '', motivo: '' }, 'Voltou para pendente')}>{label}</button></div>
  )
  return (
    <div className={`item${done && mode === 'vend' ? ' done' : ''}`}>
      <div className="top">
        <div style={{ minWidth: 0 }}>
          <div className="nm">{r.nome || 'Cliente'}</div>
          <div className="meta">{[r.endereco, r.bairro].filter(Boolean).join(' · ') || 'Sem endereço'}</div>
          {r.tel && <div className="meta">{r.tel}</div>}
          {r.obs && <div className="meta">“{r.obs}”</div>}
        </div>
        {right}
      </div>
      <div className="actions" style={{ alignItems: 'center' }}>
        <Pill st={r.st} enviado={r.enviado} mode={mode} />
        {r.perda > 0 && mode === 'gestor' && <span className="meta">perda {brl(r.perda)}</span>}
      </div>
      {done && <div className="meta">{r.e.qtd} entregue(s) · {brl(r.e.valor)} · {r.e.forma}{mode === 'gestor' && r.e.vid ? ` · ${names[r.e.vid] || 'vendedor'}` : ''}</div>}
      {r.st === 'nao_entregue' && <div className="meta" style={{ color: 'var(--bad)' }}>Motivo: {r.e?.motivo || '—'}</div>}
      {mode === 'vend' && done && (meu || gestor) && desfazer('Desfazer')}
      {mode === 'vend' && r.st === 'nao_entregue' && desfazer('Voltar para pendente')}
      {mode === 'vend' && r.st === 'pendente' && profile?.ativo && (
        <div className="actions">
          <button className="btn good grow" onClick={() => openSheet(<EntregarForm row={r} date={date} />)}>Entregue</button>
          <button className="btn danger grow" onClick={() => openSheet(<NaoForm row={r} date={date} />)}>Não entreguei</button>
        </div>
      )}
      {mode === 'gestor' && r.enviado && r.st === 'pendente' && (
        <div className="actions"><button className="btn sm ghost danger" onClick={() => actions.cancelPedido(r.cid, date)}>Cancelar pedido</button></div>
      )}
    </div>
  )
}

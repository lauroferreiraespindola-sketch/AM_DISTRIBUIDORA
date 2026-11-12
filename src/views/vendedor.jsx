import { useApp } from '../lib/data'
import { FORMAS, brl, dia, fmtDia, today } from '../lib/logic'
import { Empty } from '../ui'
import ItemRow from '../ItemRow'

export function Entregas() {
  const { d, estoque, profile } = useApp()
  const t = today()
  const vis = dia(d, t).rows.filter((x) => x.enviado)
  const pend = vis.filter((x) => x.st === 'pendente')
  const feitas = vis.filter((x) => x.st !== 'pendente')
  return (
    <>
      <div className="card hero">
        <div className="lbl">{fmtDia(t)}</div>
        <div className="big num">{pend.length}<small>entregas pendentes</small></div>
        <div className="sub">
          <div><b className="num">{pend.reduce((a, x) => a + x.qtd, 0)}</b><span>garrafões a entregar</span></div>
          <div><b className="num">{estoque.atual}</b><span>em estoque</span></div>
        </div>
      </div>
      {!profile?.ativo && <div className="warnbar">Seu acesso ainda não foi liberado.</div>}
      <div className="sec"><h2>A entregar</h2></div>
      {pend.length
        ? <div className="list">{pend.map((x) => <ItemRow key={x.cid} r={x} mode="vend" date={t} />)}</div>
        : <Empty title={vis.length ? 'Tudo entregue por enquanto' : 'Nenhum pedido recebido'}>Novos pedidos do gestor aparecem aqui na hora.</Empty>}
      {feitas.length > 0 && (
        <>
          <div className="sec"><h2>Já registradas</h2></div>
          <div className="list">{feitas.map((x) => <ItemRow key={x.cid} r={x} mode="vend" date={t} />)}</div>
        </>
      )}
    </>
  )
}

export function MeuDia() {
  const { d, uid } = useApp()
  const t = today()
  const mine = dia(d, t).rows.filter((x) => x.e && x.e.vid === uid)
  const ok = mine.filter((x) => x.st === 'entregue')
  const garr = ok.reduce((a, x) => a + (+x.e.qtd || 0), 0)
  const by = {}
  let fiado = 0, rec = 0
  for (const x of ok) {
    const f = x.e.forma || 'Dinheiro', v = +x.e.valor || 0
    if (f === 'Fiado') fiado += v
    else { by[f] = (by[f] || 0) + v; rec += v }
  }
  return (
    <>
      <div className="card hero">
        <div className="lbl">Recebido por mim hoje</div>
        <div className="big num" style={{ fontSize: 44 }}>{brl(rec)}</div>
        <div className="sub"><div><b className="num">{ok.length}</b><span>entregas</span></div><div><b className="num">{garr}</b><span>garrafões</span></div></div>
      </div>
      <div className="card"><h3>Por forma de pagamento</h3>
        <div className="list">{FORMAS.map((f) => <div className="top" key={f}><div className="nm">{f}</div><div className="nm num">{brl(f === 'Fiado' ? fiado : by[f] || 0)}</div></div>)}</div>
      </div>
      <div className="sec"><h2>Minhas entregas</h2></div>
      {mine.length
        ? <div className="list">{mine.map((x) => <ItemRow key={x.cid} r={x} mode="vend" date={t} />)}</div>
        : <Empty title="Nada registrado ainda">Confirme as entregas na aba Entregas.</Empty>}
    </>
  )
}

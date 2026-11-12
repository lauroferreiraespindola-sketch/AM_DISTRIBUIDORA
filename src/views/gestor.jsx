import { useState } from 'react'
import { useApp } from '../lib/data'
import { DOW, MESES, addDays, brl, cobertura, dia, fmtDia, mesResumo, nf, pad, parse, today } from '../lib/logic'
import { DateNav, Empty, Icon, diasTxt } from '../ui'
import { ClienteForm, ConfigForm, EntradaForm, PedidoForm } from '../forms'
import ItemRow from '../ItemRow'

export function Painel({ day, setDay }) {
  const { d, estoque, config, rows, actions, openSheet } = useApp()
  const t = today()
  const C = cobertura(d.clientes, estoque.atual)
  const r = dia(d, day)
  const mes = mesResumo(d, t.slice(0, 7))
  const semEnvio = r.rows.filter((x) => !x.enviado).length
  const pendentesEquipe = rows.team.filter((p) => !p.ativo).length
  const tot = r.total || 1
  const un = r.rows.filter((x) => x.st === 'nao_entregue' || x.st === 'sem_atendimento')
  const dias14 = Array.from({ length: 14 }, (_, i) => addDays(t, i - 13)).map((ds) => ({ ds, r: dia(d, ds) }))
  const mx = Math.max(1, ...dias14.map((x) => x.r.total))
  const enviar = () => {
    const date = day < t ? t : day
    const list = dia(d, date).rows.filter((x) => !x.enviado).map((x) => ({ cliente_id: x.cid, data: date, qtd: x.qtd, valor_unit: x.valorUnit, nome: x.nome || '', endereco: x.endereco || '', bairro: x.bairro || '', tel: x.tel || '', cancelado: false }))
    if (list.length) actions.enviarPedidos(list)
  }
  return (
    <>
      {config.defaults && <div className="warnbar">Preços ainda padrão (venda {brl(config.precoVenda)}, custo {brl(config.custo)}). Ajuste em Configurações.</div>}
      {pendentesEquipe > 0 && <div className="alert warn">{pendentesEquipe} pessoa(s) aguardando liberação de acesso.<br /><button className="btn sm primary" onClick={() => openSheet(<ConfigForm />)}>Abrir equipe</button></div>}
      {day === t && r.garrPend > estoque.atual
        ? <div className="alert bad">Estoque não cobre os pedidos de hoje: faltam {r.garrPend - estoque.atual} garrafões ({r.garrPend} pendentes, {estoque.atual} em estoque). Registre uma entrada.</div>
        : C.dias !== null && C.dias < 2 && <div className="alert warn">Estoque baixo: dura cerca de {nf(C.dias)} dia(s) no ritmo atual.</div>}
      {day >= t && semEnvio > 0 && (
        <div className="alert warn">{semEnvio} cliente(s) previstos ainda sem pedido enviado ao vendedor.<br /><button className="btn sm primary" onClick={enviar}>Enviar pedidos agora</button></div>
      )}
      <div className="card hero">
        <div className="lbl">Estoque de água mineral 20 L</div>
        <div className="big num">{estoque.atual}<small>garrafões</small></div>
        <div className="sub">
          <div><b className="num">{brl(estoque.atual * d.custo)}</b><span>valor a custo</span></div>
          <div><b className="num">{brl(estoque.atual * config.precoVenda)}</b><span>valor a preço de venda</span></div>
        </div>
        <p>{C.agenda ? <>Atende <b>{C.clientes} de {C.agenda}</b> clientes com agenda em uma rodada de entregas{C.dias !== null && <> e dura cerca de <b>{nf(C.dias)} dia(s)</b> (consumo médio {nf(C.dem)}/dia)</>}.</> : 'Cadastre clientes com dias de entrega para calcular quantos dias o estoque dura.'}</p>
      </div>
      <div className="sec"><h2>Dia</h2><DateNav day={day} setDay={setDay} addDays={addDays} /></div>
      <div className="card">
        <div className="grid4">
          <div className="stat"><b className="num">{r.total}</b><span>Previstos</span></div>
          <div className="stat good"><b className="num">{r.atend}</b><span>Atendidos</span></div>
          <div className="stat warn"><b className="num">{r.pend}</b><span>Pendentes</span></div>
          <div className="stat bad"><b className="num">{r.nao}</b><span>Não atendidos</span></div>
        </div>
        <div className="bar" role="img" aria-label={`Atendidos ${r.atend}, pendentes ${r.pend}, não atendidos ${r.nao}`}>
          <i style={{ width: `${(r.atend / tot) * 100}%`, background: 'var(--good)' }} />
          <i style={{ width: `${(r.pend / tot) * 100}%`, background: 'var(--warn)' }} />
          <i style={{ width: `${(r.nao / tot) * 100}%`, background: 'var(--bad)' }} />
        </div>
        <div className="hint">{r.total ? `${Math.round((r.atend / r.total) * 100)}% atendido` : 'Nenhum cliente previsto para este dia'} · saíram {r.entregues} garrafões</div>
      </div>
      <div className="row2">
        <div className="card kv"><span>Caixa do dia</span><b className="num">{brl(r.recebido)}</b>
          <span>{Object.entries(r.caixa).map(([k, v]) => `${k} ${brl(v)}`).join(' · ') || 'sem recebimentos'}</span>
          {r.fiado > 0 && <><br /><span>A receber (fiado): {brl(r.fiado)}</span></>}</div>
        <div className="card kv"><span>Deixou de ganhar</span><b className="num" style={{ color: r.perda ? 'var(--bad)' : 'inherit' }}>{brl(r.perda)}</b>
          <span>no dia · mês: {brl(mes.perda)}</span><br /><span>Margem perdida no mês: {brl(mes.margem)}</span></div>
      </div>
      <div className="sec"><h2>Sem atendimento</h2><span className="hint">{un.length} cliente(s)</span></div>
      {un.length
        ? <div className="list">{un.map((x) => <ItemRow key={x.cid} r={x} mode="gestor" date={day} />)}</div>
        : <Empty title="Ninguém ficou sem atendimento">Quem não for entregue aparece aqui com o motivo e o valor perdido.</Empty>}
      <div className="card">
        <h3>Últimos 14 dias</h3>
        <div className="chartbox">
          {dias14.map((x) => {
            const a = (x.r.atend / mx) * 100, p = (x.r.pend / mx) * 100, n = (x.r.nao / mx) * 100
            return (
              <div className="colw" key={x.ds} title={`${x.ds}: ${x.r.atend} atendidos, ${x.r.nao} não atendidos`}>
                <div className="chart" style={{ margin: 0 }}>
                  <div className="col">
                    {n > 0 && <div className="seg" style={{ height: `${n}%`, background: 'var(--bad)' }} />}
                    {p > 0 && <div className="seg" style={{ height: `${p}%`, background: 'var(--warn)' }} />}
                    {a > 0 && <div className="seg" style={{ height: `${a}%`, background: 'var(--good)' }} />}
                    {!x.r.total && <div className="seg" style={{ height: 2, background: 'var(--line)' }} />}
                  </div>
                </div>
                <div className="lab num">{pad(parse(x.ds).getDate())}</div>
              </div>
            )
          })}
        </div>
        <div className="legend">
          <span><i style={{ background: 'var(--good)' }} />Atendidos</span>
          <span><i style={{ background: 'var(--warn)' }} />Pendentes</span>
          <span><i style={{ background: 'var(--bad)' }} />Não atendidos</span>
        </div>
      </div>
    </>
  )
}

export function Pedidos({ day, setDay }) {
  const { d, actions, openSheet } = useApp()
  const t = today()
  const r = dia(d, day)
  const sem = r.rows.filter((x) => !x.enviado)
  const enviar = () => {
    const date = day < t ? t : day
    const list = dia(d, date).rows.filter((x) => !x.enviado).map((x) => ({ cliente_id: x.cid, data: date, qtd: x.qtd, valor_unit: x.valorUnit, nome: x.nome || '', endereco: x.endereco || '', bairro: x.bairro || '', tel: x.tel || '', cancelado: false }))
    if (list.length) actions.enviarPedidos(list)
  }
  return (
    <>
      <div className="sec"><h2>Pedidos</h2><DateNav day={day} setDay={setDay} addDays={addDays} /></div>
      <div className="actions">
        <button className="btn primary grow" onClick={() => openSheet(<PedidoForm defaultDay={day} />)}><Icon n="plus" />Novo pedido</button>
        {day >= t && <button className="btn grow" disabled={!sem.length} onClick={enviar}>Enviar previstos ({sem.length})</button>}
      </div>
      <div className="hint">O vendedor vê cada pedido enviado no celular em tempo real e confirma na entrega.</div>
      {r.rows.length
        ? <div className="list">{r.rows.map((x) => <ItemRow key={x.cid} r={x} mode="gestor" date={day} />)}</div>
        : <Empty title="Nenhum pedido neste dia">Cadastre clientes com dias de entrega ou crie um pedido avulso.</Empty>}
    </>
  )
}

export function Estoque() {
  const { d, estoque, config, rows, openSheet } = useApp()
  const C = cobertura(d.clientes, estoque.atual)
  const mv = rows.entradas.map((e) => ({ k: 'e' + e.id, data: e.data, txt: `${e.tipo === 'ajuste' ? 'Ajuste' : 'Entrada'}: ${e.fornecedor || e.motivo || ''}`, qtd: e.qtd, sub: e.custo > 0 ? `${brl(e.custo)} / un` : '' }))
  for (const [ds, m] of Object.entries(d.entregas)) {
    const q = Object.values(m).filter((i) => i.status === 'entregue').reduce((a, i) => a + (+i.qtd || 0), 0)
    if (q) mv.push({ k: 's' + ds, data: ds, txt: 'Saídas em entregas', qtd: -q, sub: '' })
  }
  mv.sort((a, b) => b.data.localeCompare(a.data))
  return (
    <>
      <div className="card hero">
        <div className="lbl">Em estoque agora</div>
        <div className="big num">{estoque.atual}<small>garrafões 20 L</small></div>
        <div className="sub"><div><b className="num">{estoque.ent}</b><span>total de entradas</span></div><div><b className="num">{estoque.sai}</b><span>total de saídas</span></div></div>
      </div>
      <div className="row2">
        <div className="card kv"><span>Equivale a (custo médio {brl(d.custo)})</span><b className="num">{brl(estoque.atual * d.custo)}</b></div>
        <div className="card kv"><span>Equivale a (venda {brl(config.precoVenda)})</span><b className="num">{brl(estoque.atual * config.precoVenda)}</b></div>
      </div>
      <div className="card"><h3>Cobertura da carteira</h3>
        <div className="row2">
          <div className="kv"><b className="num">{C.clientes} / {C.agenda}</b><span>clientes atendidos em uma rodada</span></div>
          <div className="kv"><b className="num">{C.dias === null ? '—' : nf(C.dias)}</b><span>dias de estoque (consumo {nf(C.dem)}/dia)</span></div>
        </div>
      </div>
      <div className="actions">
        <button className="btn primary grow" onClick={() => openSheet(<EntradaForm />)}><Icon n="plus" />Registrar entrada</button>
        <button className="btn grow" onClick={() => openSheet(<EntradaForm ajuste />)}>Ajuste / perda</button>
      </div>
      <div className="sec"><h2>Movimentações</h2></div>
      {mv.length
        ? <div className="list">{mv.slice(0, 40).map((m) => (
            <div className="item" key={m.k}><div className="top"><div><div className="nm">{m.txt}</div><div className="meta">{fmtDia(m.data)}{m.sub ? ` · ${m.sub}` : ''}</div></div>
              <div className="qty num" style={{ color: m.qtd < 0 ? 'var(--bad)' : 'var(--good)' }}>{m.qtd > 0 ? '+' : ''}{m.qtd}</div></div></div>))}</div>
        : <Empty title="Sem movimentações">Registre a primeira entrada de garrafões para começar o estoque.</Empty>}
    </>
  )
}

export function Clientes() {
  const { d, rows, openSheet } = useApp()
  const [q, setQ] = useState('')
  const s = q.trim().toLowerCase()
  const list = rows.clientes.filter((c) => !s || [c.nome, c.bairro, c.endereco, c.tel].join(' ').toLowerCase().includes(s)).sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
  const C = cobertura(d.clientes, 0)
  const ativos = rows.clientes.filter((c) => c.ativo !== false).length
  return (
    <>
      <div className="sec"><h2>Carteira de clientes</h2><button className="btn primary sm" onClick={() => openSheet(<ClienteForm />)}><Icon n="plus" />Cliente</button></div>
      <div className="row2">
        <div className="card kv"><span>Clientes ativos</span><b className="num">{ativos}</b></div>
        <div className="card kv"><span>Consumo médio</span><b className="num">{nf(C.dem)}/dia</b></div>
      </div>
      <input className="search" type="search" placeholder="Buscar por nome, bairro ou telefone" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="list">
        {list.length ? list.map((c) => (
          <button key={c.id} className="item" style={{ textAlign: 'left' }} onClick={() => openSheet(<ClienteForm cliente={c} />)}>
            <div className="top">
              <div style={{ minWidth: 0 }}>
                <div className="nm">{c.nome}{c.ativo === false && <> <span className="pill mute">Inativo</span></>}</div>
                <div className="meta">{[c.endereco, c.bairro].filter(Boolean).join(' · ') || 'Sem endereço'}</div>
                <div className="meta">{diasTxt(c.dias)}</div>
              </div>
              <div className="qty num">{c.qtd || 0}<small>por visita</small></div>
            </div>
          </button>
        )) : <Empty title={rows.clientes.length ? 'Nenhum resultado' : 'Nenhum cliente cadastrado'}>{rows.clientes.length ? 'Tente outro nome ou bairro.' : 'Cadastre o primeiro cliente com quantidade e dias de entrega.'}</Empty>}
      </div>
    </>
  )
}

export function Perdas({ month, setMonth, goDay }) {
  const { d } = useApp()
  const m = mesResumo(d, month)
  const [y, mo] = month.split('-').map(Number)
  const shift = (n) => {
    const dt = new Date(y, mo - 1 + n, 1)
    const v = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`
    if (v <= today().slice(0, 7)) setMonth(v)
  }
  return (
    <>
      <div className="sec"><h2>Quanto deixei de ganhar</h2></div>
      <div className="datenav" style={{ justifyContent: 'space-between' }}>
        <button className="iconbtn" aria-label="Mês anterior" onClick={() => shift(-1)}><Icon n="left" /></button>
        <b style={{ fontSize: 16 }}>{MESES[mo - 1]} de {y}</b>
        <button className="iconbtn" aria-label="Próximo mês" onClick={() => shift(1)}><Icon n="right" /></button>
      </div>
      <div className="card hero" style={{ background: 'var(--bad)', color: '#fff' }}>
        <div className="lbl">Receita não realizada no mês</div>
        <div className="big num" style={{ fontSize: 44 }}>{brl(m.perda)}</div>
        <div className="sub"><div><b className="num">{brl(m.margem)}</b><span>margem perdida</span></div><div><b className="num">{m.nao} de {m.total}</b><span>entregas não feitas</span></div></div>
      </div>
      <div className="card"><h3>Por dia (toque para ver os clientes)</h3>
        <div className="scroll"><table className="tbl"><thead><tr><th>Dia</th><th>Prev.</th><th>Atend.</th><th>Não</th><th>Perda</th></tr></thead>
          <tbody>{m.days.length ? m.days.slice().reverse().map((x) => (
            <tr key={x.ds} style={{ cursor: 'pointer' }} onClick={() => goDay(x.ds)}>
              <td>{pad(parse(x.ds).getDate())} {DOW[parse(x.ds).getDay()]}</td><td className="num">{x.r.total}</td><td className="num">{x.r.atend}</td>
              <td className="num" style={{ color: x.r.nao ? 'var(--bad)' : 'inherit' }}>{x.r.nao}</td><td className="num">{brl(x.r.perda)}</td></tr>
          )) : <tr><td colSpan="5" className="hint">Sem dados neste mês.</td></tr>}</tbody></table></div>
      </div>
      <div className="card"><h3>Clientes que mais ficaram sem atendimento</h3>
        {m.rank.length ? <div className="list">{m.rank.map((c) => (
          <div className="top" key={c.nome}><div className="nm">{c.nome}<div className="meta">{c.n} vez(es)</div></div><div className="nm num" style={{ color: 'var(--bad)' }}>{brl(c.perda)}</div></div>
        ))}</div> : <div className="hint">Nenhuma perda registrada.</div>}
      </div>
    </>
  )
}

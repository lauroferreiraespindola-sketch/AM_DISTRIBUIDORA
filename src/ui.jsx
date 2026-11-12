import { useApp } from './lib/data'
import { brl, DOW, fmtDia } from './lib/logic'

const ICON = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  box: 'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10',
  users: 'M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 20v-1a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  down: 'M3 7l6 6 4-4 8 8M21 11v6h-6',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  truck: 'M1 6h13v10H1zM14 10h4l4 3v3h-8zM6 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M17 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3',
  wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l2-3h12M16 14h2',
  left: 'M15 18l-6-6 6-6',
  right: 'M9 18l6-6-6-6',
  plus: 'M12 5v14M5 12h14',
}
export const Icon = ({ n }) => (
  <svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d={ICON[n]} /></svg>
)

export const Pill = ({ st, enviado = true, mode }) => {
  if (mode === 'gestor' && !enviado) return <span className="pill mute">Previsto, não enviado</span>
  const m = { entregue: ['good', 'Entregue'], pendente: ['warn', 'Pendente'], nao_entregue: ['bad', 'Não entregue'], sem_atendimento: ['bad', 'Sem atendimento'] }[st]
  return <span className={`pill ${m[0]}`}>{m[1]}</span>
}

export const Field = ({ id, label, hint, children }) => (
  <div className="fld"><label htmlFor={id}>{label}</label>{children}{hint && <span className="hint">{hint}</span>}</div>
)

export function Sheet() {
  const { sheet, closeSheet } = useApp()
  if (!sheet) return null
  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && closeSheet()}>
      <div className="sheet" role="dialog" aria-modal="true">{sheet}</div>
    </div>
  )
}

export function Toast() {
  const { toastMsg } = useApp()
  return toastMsg ? <div className="toast" role="status">{toastMsg}</div> : null
}

export function DateNav({ day, setDay, addDays }) {
  return (
    <div className="datenav">
      <button className="iconbtn" aria-label="Dia anterior" onClick={() => setDay(addDays(day, -1))}><Icon n="left" /></button>
      <b>{fmtDia(day)}</b>
      <button className="iconbtn" aria-label="Próximo dia" onClick={() => setDay(addDays(day, 1))}><Icon n="right" /></button>
    </div>
  )
}

export const Empty = ({ title, children }) => <div className="empty"><b>{title}</b>{children}</div>

export const diasTxt = (dias) => (dias || []).map((i) => DOW[i]).join(', ') || 'Sob demanda'
export { brl }

const S = {
  nav: { background: 'rgba(239,230,208,0.97)', borderTop: '1px solid rgba(0,0,0,0.1)', display: 'flex', padding: '6px 0', paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))', flexShrink: 0, zIndex: 50 },
  btn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: 4, border: 'none', background: 'none' },
  ic:  { fontSize: 22, lineHeight: 1 },
  add: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none' },
  circle: { width: 54, height: 54, background: '#e67e22', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', marginTop: -20, boxShadow: '0 4px 16px rgba(230,126,34,0.45)' },
}

export default function BottomNav({ current, onChange }) {
  return (
    <nav style={S.nav}>
      <NavBtn icon="🗾" label="マップ"  id="map"     current={current} onChange={onChange} />
      <NavBtn icon="📋" label="記録"    id="records" current={current} onChange={onChange} />
      <button style={S.add} onClick={() => onChange('add')}>
        <div style={S.circle}>＋</div>
      </button>
      <NavBtn icon="🧭" label="行き先"  id="dest"    current={current} onChange={onChange} />
    </nav>
  )
}

function NavBtn({ icon, label, id, current, onChange }) {
  const active = current === id
  return (
    <button style={S.btn} onClick={() => onChange(id)}>
      <span style={S.ic}>{icon}</span>
      <span style={{ fontSize: 10, color: active ? '#e67e22' : '#999' }}>{label}</span>
    </button>
  )
}

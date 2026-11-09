import { usePrefStates } from '../hooks/usePrefStates'
import { PREF_NAMES, STATE_COLORS, STATE_LABELS } from '../constants/prefectures'

const S = {
  screen: (active) => ({
    display: active ? 'flex' : 'none',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    background: '#faf7f0',
  }),
  header: {
    background: '#efe6d0',
    padding: '10px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    flexShrink: 0,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  stats: { display: 'flex', gap: 12 },
  stat: { fontSize: 11, color: '#666' },
  statNum: { fontWeight: 'bold', fontSize: 15, color: '#e67e22' },
  scroll: { flex: 1, overflowY: 'auto', padding: '8px 12px' },
  group: { marginBottom: 16 },
  groupTitle: {
    fontSize: 12, color: '#888', fontWeight: 'bold',
    padding: '4px 8px', letterSpacing: 1,
    borderBottom: '1px solid #e8e0ce', marginBottom: 6,
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 8px', borderRadius: 8,
    background: 'white', marginBottom: 4,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  badge: (color) => ({
    width: 10, height: 10, borderRadius: '50%',
    background: color, flexShrink: 0,
    border: '1px solid rgba(0,0,0,0.1)',
  }),
  prefName: { flex: 1, fontSize: 14, color: '#333' },
  stateLabel: (color) => ({
    fontSize: 11, color, fontWeight: 'bold',
  }),
}

const STATE_ORDER = ['recent', 'stayed', 'visited', 'through']

export default function RecordsScreen({ active }) {
  const { states, getStats } = usePrefStates()
  const stats = getStats()

  const grouped = {}
  STATE_ORDER.forEach(s => { grouped[s] = [] })

  Object.entries(states).forEach(([id, state]) => {
    if (state !== 'unvisited' && grouped[state]) {
      grouped[state].push({ id: +id, name: PREF_NAMES[+id] || `${id}番`, state })
    }
  })

  return (
    <div style={S.screen(active)}>
      <div style={S.header}>
        <div style={S.title}>訪問記録</div>
        <div style={S.stats}>
          <span style={S.stat}><span style={S.statNum}>{stats.visited}</span> / 47 都道府県</span>
          <span style={S.stat}><span style={S.statNum}>{stats.stayed}</span> 宿泊</span>
          <span style={S.stat}><span style={S.statNum}>{stats.through}</span> 通過</span>
        </div>
      </div>
      <div style={S.scroll}>
        {STATE_ORDER.map(state => {
          const prefs = grouped[state]
          if (!prefs.length) return null
          return (
            <div key={state} style={S.group}>
              <div style={S.groupTitle}>{STATE_LABELS[state] || state}</div>
              {prefs.map(p => (
                <div key={p.id} style={S.row}>
                  <div style={S.badge(STATE_COLORS[p.state])} />
                  <span style={S.prefName}>{p.name}</span>
                  <span style={S.stateLabel(STATE_COLORS[p.state])}>{STATE_LABELS[p.state]}</span>
                </div>
              ))}
            </div>
          )
        })}
        {stats.visited === 0 && (
          <div style={{ textAlign: 'center', marginTop: 60, color: '#aaa', fontSize: 14 }}>
            まだ記録がありません<br />
            <span style={{ fontSize: 12, marginTop: 8, display: 'block' }}>マップで都道府県をタップして記録しよう</span>
          </div>
        )}
      </div>
    </div>
  )
}

import { PREF_NAMES, STATE_COLORS } from '../constants/prefectures'

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
  title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 11, color: '#999' },
  scroll: { flex: 1, overflowY: 'auto', padding: '12px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  card: {
    background: 'white',
    border: '1px solid #eee',
    borderRadius: 10,
    padding: '10px 6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    cursor: 'pointer',
  },
  dot: {
    width: 8, height: 8, borderRadius: '50%',
    background: STATE_COLORS.unvisited,
    border: '1px solid rgba(0,0,0,0.1)',
  },
  name: { fontSize: 12, color: '#333', textAlign: 'center' },
  hint: { fontSize: 10, color: '#bbb' },
}

export default function DestScreen({ active, states, showToast }) {
  const unvisited = Object.entries(PREF_NAMES)
    .map(([id, name]) => ({ id: +id, name, state: states[+id] || 'unvisited' }))
    .filter(p => p.state === 'unvisited')

  return (
    <div style={S.screen(active)}>
      <div style={S.header}>
        <div style={S.title}>行き先リスト</div>
        <div style={S.subtitle}>未訪問の都道府県 {unvisited.length}件</div>
      </div>
      <div style={S.scroll}>
        {unvisited.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60, color: '#aaa', fontSize: 14 }}>
            全都道府県を制覇しました！<br />
            <span style={{ fontSize: 24, display: 'block', marginTop: 12 }}>🎉</span>
          </div>
        ) : (
          <div style={S.grid}>
            {unvisited.map(p => (
              <div key={p.id} style={S.card} onClick={() => showToast(`${p.name}に行こう！`)}>
                <div style={S.dot} />
                <div style={S.name}>{p.name}</div>
                <div style={S.hint}>行きたい ☆</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useCallback, useRef } from 'react'
import JapanMap from '../components/JapanMap'
import { STATE_LABELS, STATE_COLORS } from '../constants/prefectures'

const STATES_ORDER = ['unvisited', 'through', 'visited', 'stayed']

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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  legend: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 10,
    color: '#555',
  },
  dot: (color) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: color,
    border: '1px solid rgba(0,0,0,0.12)',
  }),
  mapWrap: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    touchAction: 'none',
  },
  zoomBtns: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.15)',
    background: 'rgba(255,255,255,0.9)',
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  panel: (open) => ({
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    background: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
    transform: open ? 'translateY(0)' : 'translateY(100%)',
    transition: 'transform 0.3s ease',
    padding: '16px 20px 32px',
    zIndex: 100,
  }),
  panelHandle: {
    width: 36, height: 4, borderRadius: 2,
    background: '#ddd', margin: '0 auto 16px',
  },
  prefName: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 14 },
  stateRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  stateBtn: (active, color) => ({
    flex: 1,
    minWidth: 70,
    padding: '9px 4px',
    borderRadius: 10,
    border: active ? `2px solid ${color}` : '2px solid #eee',
    background: active ? color : '#f8f8f8',
    color: active ? 'white' : '#555',
    fontSize: 13,
    fontWeight: active ? 'bold' : 'normal',
    cursor: 'pointer',
  }),
  overlay: (open) => ({
    display: open ? 'block' : 'none',
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    zIndex: 99,
  }),
}

export default function MapScreen({ active, states, setPrefState, showToast }) {
  const [zoom, setZoom] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const mapRef = useRef(null)
  const gestureRef = useRef({})

  const handlePrefClick = useCallback((id, name) => {
    setSelected({ id, name })
    setPanelOpen(true)
  }, [])

  const handleStateChange = (state) => {
    if (!selected) return
    setPrefState(selected.id, state)
    const label = STATE_LABELS[state]
    showToast(`${selected.name} → ${label}`)
    setPanelOpen(false)
  }

  const doZoom = (factor) => {
    setZoom(z => Math.min(5, Math.max(1, z * factor)))
  }

  // Touch pinch zoom + pan
  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      gestureRef.current = { pinching: true, startDist: Math.hypot(dx, dy), startZoom: zoom }
    } else if (e.touches.length === 1) {
      gestureRef.current = { panning: true, startX: e.touches[0].clientX, startY: e.touches[0].clientY, startTx: translate.x, startTy: translate.y }
    }
  }

  const onTouchMove = (e) => {
    e.preventDefault()
    const g = gestureRef.current
    if (g.pinching && e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const newZoom = Math.min(5, Math.max(1, g.startZoom * (dist / g.startDist)))
      setZoom(newZoom)
    } else if (g.panning && e.touches.length === 1) {
      const dx = e.touches[0].clientX - g.startX
      const dy = e.touches[0].clientY - g.startY
      setTranslate({ x: g.startTx + dx, y: g.startTy + dy })
    }
  }

  const onTouchEnd = () => {
    if (zoom <= 1) setTranslate({ x: 0, y: 0 })
    gestureRef.current = {}
  }

  return (
    <div style={S.screen(active)}>
      <div style={S.header}>
        <span style={S.title}>あのころの地図</span>
        <div style={S.legend}>
          {Object.entries(STATE_LABELS).map(([key, label]) => (
            <div key={key} style={S.legendItem}>
              <div style={S.dot(STATE_COLORS[key])} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={mapRef}
        style={S.mapWrap}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div style={{ transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})`, transformOrigin: '50% 30%', width: '100%', height: '100%', transition: gestureRef.current.pinching ? 'none' : 'transform 0.1s' }}>
          <JapanMap states={states} onPrefClick={handlePrefClick} zoomScale={zoom} />
        </div>

        <div style={S.zoomBtns}>
          <button style={S.zoomBtn} onClick={() => doZoom(1.5)}>＋</button>
          <button style={S.zoomBtn} onClick={() => doZoom(1 / 1.5)}>－</button>
        </div>

        <div style={S.overlay(panelOpen)} onClick={() => setPanelOpen(false)} />

        <div style={S.panel(panelOpen)}>
          <div style={S.panelHandle} />
          {selected && (
            <>
              <div style={S.prefName}>{selected.name}</div>
              <div style={S.stateRow}>
                {STATES_ORDER.map(key => {
                  const current = states[selected.id] || 'unvisited'
                  return (
                    <button
                      key={key}
                      style={S.stateBtn(current === key, STATE_COLORS[key])}
                      onClick={() => handleStateChange(key)}
                    >
                      {STATE_LABELS[key]}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

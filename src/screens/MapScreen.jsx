import { useState, useCallback, useRef, useEffect } from 'react'
import JapanMap from '../components/JapanMap'
import { STATE_LABELS, STATE_COLORS } from '../constants/prefectures'

const STATES_ORDER = ['unvisited', 'through', 'visited', 'stayed']

export default function MapScreen({ active, states, setPrefState, showToast }) {
  const [zoom, setZoom] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const mapRef = useRef(null)
  const gestureRef = useRef({})
  const zoomRef = useRef(1)
  const translateRef = useRef({ x: 0, y: 0 })

  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { translateRef.current = translate }, [translate])

  // 非パッシブタッチリスナー（ピンチズーム対応）
  useEffect(() => {
    const el = mapRef.current
    if (!el) return

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        gestureRef.current = {
          pinching: true,
          startDist: Math.hypot(dx, dy),
          startZoom: zoomRef.current,
        }
      } else if (e.touches.length === 1 && zoomRef.current > 1) {
        gestureRef.current = {
          panning: true,
          startX: e.touches[0].clientX,
          startY: e.touches[0].clientY,
          startTx: translateRef.current.x,
          startTy: translateRef.current.y,
        }
      }
    }

    const onTouchMove = (e) => {
      const g = gestureRef.current
      if (!g.pinching && !g.panning) return
      e.preventDefault()
      if (g.pinching && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.hypot(dx, dy)
        const nz = Math.min(5, Math.max(1, g.startZoom * (dist / g.startDist)))
        zoomRef.current = nz
        setZoom(nz)
      } else if (g.panning && e.touches.length === 1) {
        const dx = e.touches[0].clientX - g.startX
        const dy = e.touches[0].clientY - g.startY
        const nt = { x: g.startTx + dx, y: g.startTy + dy }
        translateRef.current = nt
        setTranslate(nt)
      }
    }

    const onTouchEnd = () => {
      if (zoomRef.current <= 1) {
        const z = { x: 0, y: 0 }
        setTranslate(z)
        translateRef.current = z
      }
      gestureRef.current = {}
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const handlePrefClick = useCallback((id, name) => {
    setSelected({ id, name })
    setPanelOpen(true)
  }, [])

  const handleStateChange = (state) => {
    if (!selected) return
    setPrefState(selected.id, state)
    showToast(`${selected.name} → ${STATE_LABELS[state]}`)
    setPanelOpen(false)
  }

  const resetZoom = () => {
    setZoom(1)
    setTranslate({ x: 0, y: 0 })
    zoomRef.current = 1
    translateRef.current = { x: 0, y: 0 }
  }

  const vals = Object.values(states)
  const visitedCount = vals.filter(v => v === 'visited' || v === 'stayed' || v === 'recent').length
  const throughCount = vals.filter(v => v === 'through').length
  const unvisitedCount = 47 - visitedCount - throughCount

  return (
    <div style={{ display: active ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden', background: '#f5f0e8' }}>
      {/* ヘッダー */}
      <div style={{ background: '#efe6d0', padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: '#aaa', marginBottom: 1 }}>走った日本の思い出帳</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 'bold', color: '#222' }}>訪問 {visitedCount}</span>
          <span style={{ fontSize: 13, color: '#888' }}>/ 47都道府県</span>
        </div>
        <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>
          通過 {throughCount}県・未訪問 {unvisitedCount}県　（県タップで変更 / ピンチで拡大）
        </div>
      </div>

      {/* スクロールエリア */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* 地図カード */}
        <div style={{ margin: '12px 12px 0', background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div
            ref={mapRef}
            style={{ position: 'relative', height: 420, overflow: 'hidden', background: '#e8f0f4', touchAction: 'none', userSelect: 'none' }}
          >
            <div style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})`,
              transformOrigin: '50% 30%',
              width: '100%', height: '100%',
            }}>
              <JapanMap states={states} onPrefClick={handlePrefClick} zoomScale={zoom} />
            </div>

            {/* ズームボタン */}
            <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: '+', action: () => { const nz = Math.min(5, zoomRef.current * 1.5); zoomRef.current = nz; setZoom(nz) } },
                { label: '−', action: () => { const nz = Math.max(1, zoomRef.current / 1.5); zoomRef.current = nz; setZoom(nz) } },
                { label: '全体', action: resetZoom },
              ].map(b => (
                <button key={b.label} onClick={b.action} style={{
                  width: b.label === '全体' ? 44 : 38, height: 38,
                  borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)',
                  background: 'rgba(255,255,255,0.93)', fontSize: b.label === '全体' ? 11 : 20,
                  fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                }}>{b.label}</button>
              ))}
            </div>

            {/* ズーム倍率 */}
            {zoom > 1.05 && (
              <div style={{ position: 'absolute', left: 10, bottom: 10, background: 'rgba(0,0,0,0.45)', color: 'white', borderRadius: 8, padding: '3px 8px', fontSize: 12 }}>
                ×{zoom.toFixed(1)}
              </div>
            )}

            {/* 都道府県選択モーダル */}
            {panelOpen && selected && (
              <>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} onClick={() => setPanelOpen(false)} />
                <div style={{
                  position: 'absolute', left: 12, right: 12, bottom: 10,
                  background: 'white', borderRadius: 16, padding: '14px 16px 18px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 'bold', color: '#222' }}>{selected.name}</div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                        いまの状態：{STATE_LABELS[states[selected.id] || 'unvisited']}
                      </div>
                    </div>
                    <button onClick={() => setPanelOpen(false)} style={{ border: 'none', background: 'none', fontSize: 20, color: '#bbb', lineHeight: 1, padding: 2 }}>×</button>
                  </div>
                  <div style={{ display: 'flex', gap: 7 }}>
                    {STATES_ORDER.map(key => {
                      const cur = states[selected.id] || 'unvisited'
                      const on = cur === key
                      return (
                        <button key={key} onClick={() => handleStateChange(key)} style={{
                          flex: 1, padding: '9px 2px', borderRadius: 10,
                          border: `2px solid ${on ? STATE_COLORS[key] : '#eee'}`,
                          background: on ? STATE_COLORS[key] : '#f8f8f8',
                          color: on ? (key === 'unvisited' ? '#555' : 'white') : '#666',
                          fontSize: 12, fontWeight: on ? 'bold' : 'normal',
                        }}>{STATE_LABELS[key]}</button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ padding: '6px 12px', fontSize: 10, color: '#bbb', borderTop: '1px solid #f4f4f4' }}>
            出典：県境は国土数値情報をもとに作成しています。
          </div>
        </div>

        {/* 凡例 */}
        <div style={{ display: 'flex', gap: 12, padding: '10px 16px', flexWrap: 'wrap' }}>
          {[['recent','最近の旅先'],['stayed','宿泊'],['visited','訪問'],['through','通過'],['unvisited','未訪問']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#666' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATE_COLORS[k], border: '1px solid rgba(0,0,0,0.1)' }} />
              {l}
            </div>
          ))}
        </div>

        {/* 進捗サマリー */}
        <div style={{ margin: '0 12px 16px', background: 'white', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>進捗サマリー</span>
            <span style={{ fontSize: 16, fontWeight: 'bold', color: '#e67e22' }}>{visitedCount} / 47県</span>
          </div>
          <div style={{ height: 8, background: '#f0ebe0', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${(visitedCount / 47) * 100}%`, background: '#1e7a34', transition: 'width 0.4s' }} />
            <div style={{ width: `${(throughCount / 47) * 100}%`, background: '#bfe3c8', transition: 'width 0.4s' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: '#888' }}>
            <span>訪問 {visitedCount}県</span>
            <span>通過 {throughCount}県</span>
            <span>未訪問 {unvisitedCount}県</span>
          </div>
        </div>
      </div>
    </div>
  )
}

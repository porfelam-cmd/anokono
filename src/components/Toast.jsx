export default function Toast({ message }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 90,
      left: '50%',
      transform: `translateX(-50%) translateY(${message ? 0 : 12}px)`,
      background: 'rgba(0,0,0,0.78)',
      color: 'white',
      padding: '9px 18px',
      borderRadius: 20,
      fontSize: 12,
      whiteSpace: 'nowrap',
      opacity: message ? 1 : 0,
      transition: 'all 0.25s',
      pointerEvents: 'none',
      zIndex: 300,
    }}>
      {message}
    </div>
  )
}

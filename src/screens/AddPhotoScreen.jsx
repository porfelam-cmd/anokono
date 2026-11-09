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
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  icon: { fontSize: 56, lineHeight: 1 },
  desc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 1.6 },
  btn: {
    background: '#e67e22',
    color: 'white',
    border: 'none',
    borderRadius: 24,
    padding: '13px 32px',
    fontSize: 15,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  note: { fontSize: 11, color: '#bbb', textAlign: 'center' },
}

export default function AddPhotoScreen({ active, showToast }) {
  const handleSelect = (e) => {
    const files = e.target.files
    if (!files || !files.length) return
    showToast(`${files.length}枚を選択しました（準備中）`)
    e.target.value = ''
  }

  return (
    <div style={S.screen(active)}>
      <div style={S.header}>
        <div style={S.title}>写真を追加</div>
      </div>
      <div style={S.body}>
        <div style={S.icon}>📷</div>
        <div style={S.desc}>
          写真のGPS情報から<br />
          訪問した都道府県を自動記録します
        </div>
        <label>
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleSelect}
          />
          <span style={S.btn}>写真を選ぶ</span>
        </label>
        <div style={S.note}>※ この機能は近日公開予定です</div>
      </div>
    </div>
  )
}

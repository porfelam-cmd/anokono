import { useState, useCallback, useRef } from 'react'
import MapScreen from './screens/MapScreen'
import RecordsScreen from './screens/RecordsScreen'
import AddPhotoScreen from './screens/AddPhotoScreen'
import DestScreen from './screens/DestScreen'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import { usePrefStates } from './hooks/usePrefStates'

export default function App() {
  const [screen, setScreen] = useState('map')
  const [toastMsg, setToastMsg] = useState('')
  const toastTimer = useRef(null)
  const { states, setPrefState } = usePrefStates()

  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2200)
  }, [])

  return (
    <>
      <MapScreen active={screen === 'map'} states={states} setPrefState={setPrefState} showToast={showToast} />
      <RecordsScreen active={screen === 'records'} showToast={showToast} />
      <AddPhotoScreen active={screen === 'add'} showToast={showToast} />
      <DestScreen active={screen === 'dest'} states={states} showToast={showToast} />
      <BottomNav current={screen} onChange={setScreen} />
      <Toast message={toastMsg} />
    </>
  )
}

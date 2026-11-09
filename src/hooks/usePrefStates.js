import { useState, useEffect } from 'react'
import { DEFAULT_STATES } from '../constants/prefectures'

const STORAGE_KEY = 'anokono_pref_states'

export function usePrefStates() {
  const [states, setStates] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...DEFAULT_STATES, ...JSON.parse(saved) } : { ...DEFAULT_STATES }
    } catch {
      return { ...DEFAULT_STATES }
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states))
  }, [states])

  const setPrefState = (id, state) => {
    setStates(prev => ({ ...prev, [+id]: state }))
  }

  const getStats = () => {
    const vals = Object.values(states)
    return {
      visited: vals.filter(v => v === 'visited' || v === 'stayed' || v === 'recent').length,
      stayed:  vals.filter(v => v === 'stayed').length,
      through: vals.filter(v => v === 'through').length,
    }
  }

  return { states, setPrefState, getStats }
}

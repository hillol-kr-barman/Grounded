import { useState, useCallback } from 'react'
import { api } from '../lib/api'

export function useKnowledgeBase(token) {
  const [kbs, setKbs] = useState([])
  const [selectedKB, setSelectedKB] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadKBs = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      setKbs(await api.listKBs(token))
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const createKB = useCallback(
    async (name, description) => {
      const kb = await api.createKB(token, { name, description })
      setKbs((prev) => [kb, ...prev])
      setSelectedKB(kb)
      return kb
    },
    [token],
  )

  const deleteKB = useCallback(
    async (id) => {
      await api.deleteKB(token, id)
      setKbs((prev) => prev.filter((k) => k.id !== id))
      if (selectedKB?.id === id) setSelectedKB(null)
    },
    [token, selectedKB],
  )

  return { kbs, selectedKB, setSelectedKB, isLoading, error, loadKBs, createKB, deleteKB }
}

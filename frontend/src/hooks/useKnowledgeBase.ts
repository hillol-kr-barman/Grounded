import { useState, useCallback } from 'react'
import { api } from '../lib/api'
import type { KnowledgeBase } from '../types'

export function useKnowledgeBase(token: string | null) {
  const [kbs, setKbs] = useState<KnowledgeBase[]>([])
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadKBs = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      setKbs(await api.listKBs(token))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load knowledge bases.')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const createKB = useCallback(
    async (name: string, description: string | null): Promise<KnowledgeBase> => {
      if (!token) throw new Error('Not authenticated.')
      const kb = await api.createKB(token, { name, description })
      setKbs((prev) => [kb, ...prev])
      setSelectedKB(kb)
      return kb
    },
    [token],
  )

  const deleteKB = useCallback(
    async (id: string): Promise<void> => {
      if (!token) throw new Error('Not authenticated.')
      await api.deleteKB(token, id)
      setKbs((prev) => prev.filter((k) => k.id !== id))
      if (selectedKB?.id === id) setSelectedKB(null)
    },
    [token, selectedKB],
  )

  return { kbs, selectedKB, setSelectedKB, isLoading, error, loadKBs, createKB, deleteKB }
}

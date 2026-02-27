import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Response } from '../types/database'

export function useResponses(sessionId: string | undefined) {
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResponses([])
      setLoading(false)
      return
    }

    async function fetchResponses() {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching responses:', error)
      } else {
        setResponses(data || [])
      }
      setLoading(false)
    }

    fetchResponses()

    const channel = supabase
      .channel(`responses-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setResponses((prev) => {
            const exists = prev.some((r) => r.id === (payload.new as Response).id)
            if (exists) return prev
            return [...prev, payload.new as Response]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  return { responses, loading }
}

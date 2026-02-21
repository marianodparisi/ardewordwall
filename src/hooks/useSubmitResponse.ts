import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getEmojiForWord } from '../lib/gemini'
import {
  getSubmissionId,
  incrementSubmissionCount,
  getCooldownRemaining,
  startCooldown,
} from '../lib/anonymous-id'

export function useSubmitResponse(sessionId: string | undefined) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldownMs, setCooldownMs] = useState(() =>
    sessionId ? getCooldownRemaining(sessionId) : 0
  )

  const onCooldown = cooldownMs > 0

  async function submit(word: string, authorName?: string) {
    if (!sessionId) return

    // Re-check cooldown from localStorage
    const remaining = getCooldownRemaining(sessionId)
    if (remaining > 0) {
      setCooldownMs(remaining)
      setError('Espera a que termine el timer')
      return
    }

    const trimmed = word.trim()
    if (!trimmed) {
      setError('Escribe una palabra')
      return
    }
    if (trimmed.length > 30) {
      setError('Maximo 30 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    const anonymousId = getSubmissionId()
    const name = authorName?.trim() || null

    // Get emoji from Gemini (non-blocking — null on failure)
    const emoji = await getEmojiForWord(trimmed)

    const { error: insertError } = await supabase.from('responses').insert({
      session_id: sessionId,
      word: trimmed,
      emoji,
      anonymous_id: anonymousId,
      author_name: name,
    })

    if (insertError) {
      setError('Error al enviar. Intenta de nuevo.')
      console.error('Submit error:', insertError)
    } else {
      incrementSubmissionCount()
      startCooldown(sessionId)
      setCooldownMs(5 * 60 * 1000)
    }

    setLoading(false)
  }

  return { submit, loading, error, onCooldown, cooldownMs, setCooldownMs }
}

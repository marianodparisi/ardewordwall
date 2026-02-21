import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSubmitResponse } from '../hooks/useSubmitResponse'

interface SubmitFormProps {
  sessionId: string
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function SubmitForm({ sessionId }: SubmitFormProps) {
  const [word, setWord] = useState('')
  const [showName, setShowName] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const { submit, loading, error, onCooldown, cooldownMs, setCooldownMs } =
    useSubmitResponse(sessionId)

  // Countdown timer
  useEffect(() => {
    if (cooldownMs <= 0) return
    const interval = setInterval(() => {
      setCooldownMs((prev: number) => {
        const next = prev - 1000
        return next <= 0 ? 0 : next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldownMs > 0, setCooldownMs])

  if (onCooldown) {
    return (
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-primary px-6 py-3 rounded-xl mb-3">
          <span className="material-icons text-accent">check_circle</span>
          <span className="font-semibold">Respuesta enviada</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
          <span className="material-icons text-sm">timer</span>
          <span className="text-sm font-medium">
            Podes enviar otra en <strong className="text-primary">{formatTime(cooldownMs)}</strong>
          </span>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-accent hover:text-primary font-semibold transition-colors"
        >
          <span className="material-icons text-base">visibility</span>
          Ver el muro de palabras
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submit(word, showName ? authorName : undefined)
    if (!error) setWord('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="relative">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          maxLength={30}
          placeholder="Escribe tu respuesta..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 text-gray-800
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50
                     focus:border-accent transition-all text-sm"
          disabled={loading}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          {word.length}/30
        </span>
      </div>

      {/* Checkbox para dejar nombre */}
      <div className="mt-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showName}
            onChange={(e) => setShowName(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-accent/50"
          />
          <span className="text-sm text-gray-600">Dejar mi nombre</span>
        </label>
        {!showName && (
          <p className="text-xs text-gray-400 mt-1 ml-6">
            Si no lo marcas, tu respuesta sera anonima.
          </p>
        )}
        {showName && (
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={30}
            placeholder="Tu nombre..."
            className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50
                       focus:border-accent transition-all text-sm"
            disabled={loading}
          />
        )}
      </div>

      {error && (
        <p className="text-secondary text-xs mt-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !word.trim()}
        className="mt-3 w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                   disabled:cursor-not-allowed text-white font-bold py-3.5 px-8 rounded-xl
                   shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5
                   flex items-center justify-center gap-2 text-base"
      >
        <span className="material-icons text-xl">add_circle</span>
        {loading ? 'Enviando...' : 'Enviar respuesta'}
      </button>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Max 30 caracteres. Timer de 5 min entre envios.
        </p>
        <Link
          to="/"
          className="text-xs text-accent hover:text-primary font-semibold transition-colors"
        >
          Ver muro
        </Link>
      </div>
    </form>
  )
}

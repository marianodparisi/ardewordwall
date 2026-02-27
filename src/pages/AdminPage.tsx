import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getSessionConfig, SESSION_THEMES, type SessionTheme } from '../lib/session-config'
import type { Session, Response } from '../types/database'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
const AUTH_KEY = 'wordwall_admin_auth'

type SessionWithCount = Session & { response_count: number }

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() =>
    sessionStorage.getItem(AUTH_KEY) === 'true'
  )
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setAuthenticated(true)
      setPasswordError('')
    } else {
      setPasswordError('Password incorrecto')
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 w-full max-w-sm">
          <img src="/arde.png" alt="Arde" className="w-12 h-12 rounded-xl mx-auto mb-4 object-contain" />
          <h1 className="text-xl font-bold text-gray-800 text-center mb-6">
            Admin Access
          </h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50
                         focus:border-accent transition-all text-sm"
              autoFocus
            />
            {passwordError && (
              <p className="text-secondary text-xs mt-2">{passwordError}</p>
            )}
            <button
              type="submit"
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-white font-bold
                         py-3 rounded-xl shadow-lg shadow-primary/20 transition-all"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <AdminPanel />
}

function AdminPanel() {
  const [sessions, setSessions] = useState<SessionWithCount[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [theme, setTheme] = useState<SessionTheme>('classic')
  const [maxChars, setMaxChars] = useState(30)
  const [allowEmoji, setAllowEmoji] = useState(true)
  const [allowName, setAllowName] = useState(true)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [sessionResponses, setSessionResponses] = useState<Record<string, Response[]>>({})
  const [selectedResponses, setSelectedResponses] = useState<Record<string, string[]>>({})
  const [deletingBySession, setDeletingBySession] = useState<Record<string, boolean>>({})

  async function fetchSessions() {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, responses(count)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      return
    }

    const mapped = (data || []).map((s) => ({
      ...s,
      response_count: (s.responses as unknown as { count: number }[])?.[0]?.count ?? 0,
    }))
    setSessions(mapped)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions()
  }, [])

  async function createSession(e: React.FormEvent) {
    e.preventDefault()
    if (!newQuestion.trim()) return

    setCreateError('')
    setCreating(true)

    await supabase.from('sessions').update({ is_active: false }).eq('is_active', true)

    const token = crypto.randomUUID()
    const { error } = await supabase.from('sessions').insert({
      question: newQuestion.trim(),
      is_active: true,
      token,
      theme,
      max_chars: Math.min(Math.max(Math.round(maxChars), 10), 120),
      allow_emoji: allowEmoji,
      allow_name: allowName,
    })

    if (error) {
      console.error('Error creating session:', error)
      setCreateError(error.message || 'Error al crear la sesion.')
    } else {
      setNewQuestion('')
      setTheme('classic')
      setMaxChars(30)
      setAllowEmoji(true)
      setAllowName(true)
      await fetchSessions()
    }

    setCreating(false)
  }

  async function endSession(sessionId: string) {
    await supabase.from('sessions').update({ is_active: false }).eq('id', sessionId)
    await fetchSessions()
  }

  async function toggleResponses(sessionId: string) {
    if (expandedSession === sessionId) {
      setExpandedSession(null)
      return
    }

    if (!sessionResponses[sessionId]) {
      const { data } = await supabase
        .from('responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      setSessionResponses((prev) => ({ ...prev, [sessionId]: data || [] }))
    }

    setExpandedSession(sessionId)
  }

  function toggleResponseSelection(sessionId: string, responseId: string) {
    setSelectedResponses((prev) => {
      const current = prev[sessionId] || []
      const exists = current.includes(responseId)
      return {
        ...prev,
        [sessionId]: exists
          ? current.filter((id) => id !== responseId)
          : [...current, responseId],
      }
    })
  }

  function toggleSelectAllResponses(sessionId: string) {
    const responses = sessionResponses[sessionId] || []
    const selected = selectedResponses[sessionId] || []

    if (!responses.length) return

    if (selected.length === responses.length) {
      setSelectedResponses((prev) => ({ ...prev, [sessionId]: [] }))
    } else {
      setSelectedResponses((prev) => ({
        ...prev,
        [sessionId]: responses.map((r) => r.id),
      }))
    }
  }

  async function deleteSelectedResponses(sessionId: string) {
    const ids = selectedResponses[sessionId] || []
    if (!ids.length) return

    setDeletingBySession((prev) => ({ ...prev, [sessionId]: true }))

    const { error } = await supabase
      .from('responses')
      .delete()
      .eq('session_id', sessionId)
      .in('id', ids)

    if (error) {
      console.error('Error deleting responses:', error)
    } else {
      setSessionResponses((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] || []).filter((r) => !ids.includes(r.id)),
      }))
      setSelectedResponses((prev) => ({ ...prev, [sessionId]: [] }))
      await fetchSessions()
    }

    setDeletingBySession((prev) => ({ ...prev, [sessionId]: false }))
  }

  const activeSession = sessions.find((s) => s.is_active)
  const pastSessions = sessions.filter((s) => !s.is_active)

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <img src="/arde.png" alt="Arde" className="w-10 h-10 rounded-lg object-contain" />
          <h1 className="text-2xl font-bold text-gray-800">Arde <span className="text-primary">Admin</span></h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-icons text-accent">add_circle</span>
            Nueva Pregunta
          </h2>
          <form onSubmit={createSession}>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Escribe la pregunta para los participantes..."
              maxLength={180}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50
                         focus:border-accent transition-all text-sm"
            />

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm text-gray-600">
                Tema
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as SessionTheme)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800
                             focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                >
                  {SESSION_THEMES.map((themeOption) => (
                    <option key={themeOption.value} value={themeOption.value}>
                      {themeOption.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-gray-600">
                Max caracteres por respuesta
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={maxChars}
                  onChange={(e) => setMaxChars(Number(e.target.value))}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800
                             focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                />
              </label>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={allowEmoji}
                  onChange={(e) => setAllowEmoji(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-accent/50"
                />
                Permitir emojis automaticos
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={allowName}
                  onChange={(e) => setAllowName(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-accent/50"
                />
                Permitir opcion de nombre
              </label>
            </div>

            {createError && (
              <p className="text-secondary text-xs mt-3">{createError}</p>
            )}

            <button
              type="submit"
              disabled={creating || !newQuestion.trim()}
              className="mt-3 w-full bg-primary hover:bg-primary/90 disabled:opacity-50
                         text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20
                         transition-all"
            >
              {creating ? 'Creando...' : 'Crear Sesion'}
            </button>
          </form>
        </div>

        {activeSession && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-accent mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Sesion Activa
              </h2>
              <span className="text-xs bg-accent/10 text-primary px-3 py-1 rounded-full font-semibold">
                {activeSession.response_count} respuestas
              </span>
            </div>
            <p className="text-gray-600 font-medium mb-2">{activeSession.question}</p>
            <SessionSettings session={activeSession} />
            <div className="flex gap-3">
              <button
                onClick={() => toggleResponses(activeSession.id)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold
                           py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-1"
              >
                <span className="material-icons text-sm">visibility</span>
                {expandedSession === activeSession.id ? 'Ocultar' : 'Ver respuestas'}
              </button>
              <button
                onClick={() => endSession(activeSession.id)}
                className="flex-1 bg-secondary/10 hover:bg-secondary/20 text-secondary font-semibold
                           py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-1"
              >
                <span className="material-icons text-sm">stop_circle</span>
                Terminar
              </button>
            </div>
            {expandedSession === activeSession.id && sessionResponses[activeSession.id] && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  {sessionResponses[activeSession.id].map((r) => (
                    <span
                      key={r.id}
                      className="bg-accent/10 text-primary px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {r.word}
                    </span>
                  ))}
                  {sessionResponses[activeSession.id].length === 0 && (
                    <p className="text-gray-400 text-sm">Sin respuestas aun.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <span className="material-icons text-accent text-3xl animate-spin">refresh</span>
          </div>
        )}

        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-icons text-gray-400">history</span>
              Historial
            </h2>
            <div className="space-y-3">
              {pastSessions.map((s) => {
                const config = getSessionConfig(s)
                const responses = sessionResponses[s.id] || []
                const selected = selectedResponses[s.id] || []
                const allSelected = responses.length > 0 && selected.length === responses.length
                const deleting = deletingBySession[s.id]

                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium truncate">{s.question}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(s.created_at).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' · '}
                          {s.response_count} respuestas
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Tema: {config.theme} · Max: {config.max_chars} · Emoji: {config.allow_emoji ? 'ON' : 'OFF'} · Nombre: {config.allow_name ? 'ON' : 'OFF'}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleResponses(s.id)}
                        className="ml-3 text-gray-400 hover:text-primary transition-colors"
                      >
                        <span className="material-icons text-xl">
                          {expandedSession === s.id ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                    </div>
                    {expandedSession === s.id && (
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <button
                            onClick={() => toggleSelectAllResponses(s.id)}
                            disabled={!responses.length}
                            className="text-xs font-semibold text-gray-500 hover:text-primary disabled:opacity-40 transition-colors"
                          >
                            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                          </button>
                          <button
                            onClick={() => deleteSelectedResponses(s.id)}
                            disabled={!selected.length || deleting}
                            className="text-xs font-semibold bg-secondary/10 hover:bg-secondary/20 text-secondary
                                       px-3 py-1.5 rounded-lg disabled:opacity-40 transition-all"
                          >
                            {deleting ? 'Borrando...' : `Borrar seleccionadas (${selected.length})`}
                          </button>
                        </div>

                        <div className="space-y-2">
                          {responses.map((r) => {
                            const checked = selected.includes(r.id)
                            return (
                              <label
                                key={r.id}
                                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleResponseSelection(s.id, r.id)}
                                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-accent/50"
                                />
                                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
                                  {r.word}
                                  {r.author_name ? ` · ${r.author_name}` : ''}
                                </span>
                              </label>
                            )
                          })}
                          {responses.length === 0 && (
                            <p className="text-gray-400 text-sm">Sin respuestas.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SessionSettings({ session }: { session: Session }) {
  const config = getSessionConfig(session)

  return (
    <p className="text-xs text-gray-400 mb-4">
      Tema: {config.theme} · Max: {config.max_chars} · Emoji: {config.allow_emoji ? 'ON' : 'OFF'} · Nombre: {config.allow_name ? 'ON' : 'OFF'}
    </p>
  )
}

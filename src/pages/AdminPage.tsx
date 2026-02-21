import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Session, Response } from '../types/database'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
const AUTH_KEY = 'wordwall_admin_auth'

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
  const [sessions, setSessions] = useState<(Session & { response_count: number })[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [sessionResponses, setSessionResponses] = useState<Record<string, Response[]>>({})

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
    fetchSessions()
  }, [])

  async function createSession(e: React.FormEvent) {
    e.preventDefault()
    if (!newQuestion.trim()) return

    setCreating(true)

    // Deactivate all existing sessions
    await supabase.from('sessions').update({ is_active: false }).eq('is_active', true)

    // Create new one with unique token
    const token = crypto.randomUUID()
    const { error } = await supabase.from('sessions').insert({
      question: newQuestion.trim(),
      is_active: true,
      token,
    })

    if (error) {
      console.error('Error creating session:', error)
    } else {
      setNewQuestion('')
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

  const activeSession = sessions.find((s) => s.is_active)
  const pastSessions = sessions.filter((s) => !s.is_active)

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <img src="/arde.png" alt="Arde" className="w-10 h-10 rounded-lg object-contain" />
          <h1 className="text-2xl font-bold text-gray-800">Arde <span className="text-primary">Admin</span></h1>
        </div>

        {/* Create new session */}
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50
                         focus:border-accent transition-all text-sm"
            />
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

        {/* Active session */}
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
            <p className="text-gray-600 font-medium mb-4">{activeSession.question}</p>
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

        {/* Past sessions */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-icons text-gray-400">history</span>
              Historial
            </h2>
            <div className="space-y-3">
              {pastSessions.map((s) => (
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
                  {expandedSession === s.id && sessionResponses[s.id] && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <div className="flex flex-wrap gap-2">
                        {sessionResponses[s.id].map((r) => (
                          <span
                            key={r.id}
                            className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium"
                          >
                            {r.word}
                          </span>
                        ))}
                        {sessionResponses[s.id].length === 0 && (
                          <p className="text-gray-400 text-sm">Sin respuestas.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

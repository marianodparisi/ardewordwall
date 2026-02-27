import { useSearchParams } from 'react-router-dom'
import { useActiveSession } from '../hooks/useActiveSession'
import { useResponses } from '../hooks/useResponses'
import { BackgroundPattern } from '../components/BackgroundPattern'
import { QuestionCard } from '../components/QuestionCard'
import { SubmitForm } from '../components/SubmitForm'
import { getSessionConfig, getThemeStyle } from '../lib/session-config'

export function SubmitPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t')
  const { session, loading: sessionLoading } = useActiveSession()
  const { responses, loading: responsesLoading } = useResponses(session?.id)
  const config = getSessionConfig(session)
  const themeStyle = getThemeStyle(config.theme)

  if (sessionLoading || responsesLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center" style={themeStyle}>
        <div className="text-center">
          <span className="material-icons text-accent text-4xl animate-spin">refresh</span>
          <p className="text-gray-500 mt-3 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center" style={themeStyle}>
        <BackgroundPattern theme={config.theme} />
        <div className="relative z-10 text-center p-8">
          <img src="/arde.png" alt="Arde" className="w-16 h-16 rounded-xl mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            No hay sesion activa
          </h1>
          <p className="text-gray-500">
            Espera a que el administrador cree una nueva pregunta.
          </p>
        </div>
      </div>
    )
  }

  // Validate token — must match the active session's token
  if (!token || token !== session.token) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center" style={themeStyle}>
        <BackgroundPattern theme={config.theme} />
        <div className="relative z-10 text-center p-8">
          <img src="/arde.png" alt="Arde" className="w-16 h-16 rounded-xl mx-auto mb-4 object-contain" />
          <span className="material-icons text-secondary text-5xl mb-3 block">lock</span>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Acceso no autorizado
          </h1>
          <p className="text-gray-500 max-w-xs mx-auto">
            Escanea el codigo QR del evento para poder responder.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light relative overflow-hidden" style={themeStyle}>
      <BackgroundPattern theme={config.theme} />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <QuestionCard
          question={session.question}
          responseCount={responses.length}
          theme={config.theme}
        >
          <p className="text-gray-500 max-w-sm mx-auto mb-4 text-sm">
            Envia tu respuesta y mira como crece el muro de palabras.
          </p>
          <SubmitForm
            sessionId={session.id}
            maxChars={config.max_chars}
            allowName={config.allow_name}
            allowEmoji={config.allow_emoji}
          />
        </QuestionCard>
      </main>
    </div>
  )
}

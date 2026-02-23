import { QRCodeSVG } from 'qrcode.react'
import { useActiveSession } from '../hooks/useActiveSession'
import { useResponses } from '../hooks/useResponses'
import { BackgroundPattern } from '../components/BackgroundPattern'
import { QuestionCard } from '../components/QuestionCard'
import { WordCloud } from '../components/WordCloud'
import { getSessionConfig, getThemeColors, getThemeStyle } from '../lib/session-config'

export function PublicWall() {
  const { session, loading: sessionLoading } = useActiveSession()
  const { responses, loading: responsesLoading } = useResponses(session?.id)
  const config = getSessionConfig(session)
  const themeStyle = getThemeStyle(config.theme)
  const themeColors = getThemeColors(config.theme)

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
        <BackgroundPattern />
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

  return (
    <div className="min-h-screen bg-background-light relative overflow-hidden" style={themeStyle}>
      <BackgroundPattern />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <QuestionCard
          question={session.question}
          responseCount={responses.length}
        >
          <a
            href={`/preguntar?t=${session.token}`}
            className="md:hidden inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-primary to-accent text-white font-semibold text-base px-6 py-3 rounded-full shadow-md active:scale-95 transition-transform"
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>edit</span>
            Responder
          </a>
        </QuestionCard>
        <WordCloud
          responses={responses}
          showEmoji={config.allow_emoji}
          showNames={config.allow_name}
        />
      </main>

      {/* QR code top-right — desktop only */}
      <div className="hidden md:flex fixed top-6 right-6 z-50 bg-white rounded-2xl shadow-lg p-5 border border-gray-100 flex-col items-center gap-2">
        <QRCodeSVG
          value={`${window.location.origin}/preguntar?t=${session.token}`}
          size={180}
          bgColor={themeColors.background}
          fgColor={themeColors.primary}
          level="M"
        />
        <span className="text-sm font-semibold text-primary">Escanea y responde</span>
      </div>
    </div>
  )
}

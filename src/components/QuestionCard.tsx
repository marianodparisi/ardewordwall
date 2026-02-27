import type { SessionTheme } from '../lib/session-config'

interface QuestionCardProps {
  question: string
  responseCount: number
  theme?: SessionTheme
  children?: React.ReactNode
}

export function QuestionCard({ question, responseCount, theme = 'classic', children }: QuestionCardProps) {
  const isTropical = theme === 'tropical'

  return (
    <div className="relative inline-block z-20">
      <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-xl rounded-full" />
      <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-[4px] shadow-xl relative max-w-lg mx-auto">
      <div className="bg-white rounded-[20px] p-6 md:p-10">
        <img
          src="/arde.png"
          alt="Arde"
          className="w-16 h-16 md:w-20 md:h-20 rounded-xl mx-auto mb-3 md:mb-4 object-contain"
        />

        <h1
          className={`text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-3 leading-tight text-center ${isTropical ? 'tropical-display' : 'font-extrabold tracking-tight'}`}
          style={{ fontFamily: 'var(--font-display, var(--font-sans))' }}
        >
          {question}
        </h1>

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse" />
          <span className="text-base font-semibold text-gray-500">
            {responseCount} {responseCount === 1 ? 'respuesta' : 'respuestas'}
          </span>
        </div>

        <div className="text-center">{children}</div>
      </div>
      </div>
    </div>
  )
}

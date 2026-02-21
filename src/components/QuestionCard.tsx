interface QuestionCardProps {
  question: string
  responseCount: number
  children?: React.ReactNode
}

export function QuestionCard({ question, responseCount, children }: QuestionCardProps) {
  return (
    <div className="relative inline-block z-20">
      <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-xl rounded-full" />
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-[3px] shadow-xl relative max-w-md mx-auto">
      <div className="bg-white rounded-[13px] p-5 md:p-8">
        <img
          src="/arde.png"
          alt="Arde"
          className="w-12 h-12 md:w-16 md:h-16 rounded-xl mx-auto mb-3 md:mb-4 object-contain"
        />

        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-3 tracking-tight leading-tight text-center">
          {question}
        </h1>

        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-gray-500">
            {responseCount} {responseCount === 1 ? 'respuesta' : 'respuestas'}
          </span>
        </div>

        <div className="text-center">{children}</div>
      </div>
      </div>
    </div>
  )
}

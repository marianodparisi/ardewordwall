interface WordCardProps {
  word: string
  emoji?: string | null
  index: number
  authorName?: string | null
  count?: number
}

const ACCENT_COLORS = [
  { badge: 'bg-primary', tag: 'bg-primary text-white' },
  { badge: 'bg-secondary', tag: 'bg-secondary text-white' },
  { badge: 'bg-accent', tag: 'bg-accent text-white' },
]

export function WordCard({ word, emoji, index, authorName, count = 1 }: WordCardProps) {
  const colors = ACCENT_COLORS[index % 3]

  return (
    <div className="relative">
      {/* Main card */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="flex items-stretch">
          {/* Like counter — left side */}
          {count > 1 && (
            <div className={`${colors.badge} flex flex-col items-center justify-center px-3 md:px-4 text-white`}>
              <span className="material-icons" style={{ fontSize: '16px' }}>favorite</span>
              <span className="text-sm font-bold leading-none mt-0.5">+{count}</span>
            </div>
          )}

          {/* Word + emoji — uppercase, fills the card */}
          <div className="p-3 px-4 md:p-4 md:px-6 flex items-center gap-2">
            {emoji && <span className="text-lg md:text-xl leading-none">{emoji}</span>}
            <span className="font-extrabold text-base md:text-lg text-gray-800 uppercase tracking-wide">
              {word}
            </span>
          </div>
        </div>
      </div>

      {/* Author tag — overlapping bottom-right like an attached badge */}
      {authorName && (
        <span
          className={`absolute -bottom-3 -right-2 text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-md ${colors.tag}`}
        >
          {authorName}
        </span>
      )}
    </div>
  )
}

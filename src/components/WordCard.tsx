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
            <div className={`${colors.badge} flex flex-col items-center justify-center px-2.5 md:px-3 text-white`}>
              <span className="material-icons" style={{ fontSize: '14px' }}>favorite</span>
              <span className="text-xs font-bold leading-none mt-0.5">+{count}</span>
            </div>
          )}

          {/* Word + emoji — uppercase, fills the card */}
          <div className="p-2.5 px-3.5 md:p-3 md:px-5 flex items-center gap-1.5">
            {emoji && <span className="text-base md:text-lg leading-none">{emoji}</span>}
            <span className="font-extrabold text-sm md:text-base text-gray-800 uppercase tracking-wide">
              {word}
            </span>
          </div>
        </div>
      </div>

      {/* Author tag — overlapping bottom-right like an attached badge */}
      {authorName && (
        <span
          className={`absolute -bottom-3 -right-2 text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md ${colors.tag}`}
        >
          {authorName}
        </span>
      )}
    </div>
  )
}

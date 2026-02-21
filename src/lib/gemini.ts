const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`

/** Common words → emoji (instant, no API call) */
const EMOJI_MAP: Record<string, string> = {
  amor: '❤️', love: '❤️',
  felicidad: '😊', feliz: '😊', happiness: '😊', happy: '😊',
  paz: '☮️', peace: '☮️',
  fuerza: '💪', strength: '💪', fuerte: '💪',
  familia: '👨‍👩‍👧‍👦', family: '👨‍👩‍👧‍👦',
  musica: '🎵', música: '🎵', music: '🎵',
  libertad: '🕊️', freedom: '🕊️',
  paciencia: '🧘', patience: '🧘',
  esperanza: '🌱', hope: '🌱',
  alegria: '🎉', alegría: '🎉', joy: '🎉',
  trabajo: '💼', work: '💼',
  dinero: '💰', money: '💰', plata: '💰',
  comida: '🍽️', food: '🍽️',
  cafe: '☕', café: '☕', coffee: '☕',
  fiesta: '🎊', party: '🎊',
  sol: '☀️', sun: '☀️',
  luna: '🌙', moon: '🌙',
  fuego: '🔥', fire: '🔥',
  agua: '💧', water: '💧',
  naturaleza: '🌿', nature: '🌿',
  perro: '🐶', dog: '🐶',
  gato: '🐱', cat: '🐱',
  corazon: '❤️', corazón: '❤️', heart: '❤️',
  risa: '😂', laugh: '😂',
  miedo: '😨', fear: '😨',
  tristeza: '😢', sad: '😢', triste: '😢',
  enojo: '😤', anger: '😤', bronca: '😤',
  sueño: '💤', sleep: '💤', dormir: '💤',
  viaje: '✈️', travel: '✈️', viajar: '✈️',
  casa: '🏠', home: '🏠', hogar: '🏠',
  amigos: '🤝', friends: '🤝', amistad: '🤝',
  deporte: '⚽', sport: '⚽',
  libro: '📖', book: '📖', leer: '📖',
  estrella: '⭐', star: '⭐',
  tiempo: '⏰', time: '⏰',
  vida: '🌟', life: '🌟',
  muerte: '💀', death: '💀',
  dios: '🙏', god: '🙏', fe: '🙏',
  salud: '💚', health: '💚',
  creatividad: '🎨', creativity: '🎨', arte: '🎨',
  tecnologia: '💻', technology: '💻', tech: '💻',
  educacion: '📚', education: '📚',
  respeto: '🫡', respect: '🫡',
  pasion: '🔥', pasión: '🔥', passion: '🔥',
  valentia: '🦁', valentía: '🦁', courage: '🦁',
  sabiduria: '🦉', sabiduría: '🦉', wisdom: '🦉',
  gratitud: '🙏', gratitude: '🙏',
  empatia: '🤗', empatía: '🤗', empathy: '🤗',
  confianza: '🤝', trust: '🤝',
  humildad: '🙇', humility: '🙇',
  resiliencia: '🌊', resilience: '🌊',
}

/** Runtime cache for Gemini responses (avoids duplicate API calls) */
const runtimeCache = new Map<string, string>()

/**
 * Get an emoji for a word.
 * 1. Check local map (instant)
 * 2. Check runtime cache (instant)
 * 3. Call Gemini Flash Lite (fast, cheap)
 * Returns emoji string or null (never blocks submit).
 */
export async function getEmojiForWord(word: string): Promise<string | null> {
  const key = word.toLowerCase().trim()

  // 1. Local map
  const local = EMOJI_MAP[key]
  if (local) return local

  // 2. Runtime cache
  const cached = runtimeCache.get(key)
  if (cached) return cached

  // 3. Gemini API
  if (!GEMINI_API_KEY) return null

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Respond with ONLY a single emoji (no text, no spaces, no punctuation) that best represents this Spanish word: "${word}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 10,
        },
      }),
    })

    // Rate limited — retry once after 1s
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1500))
      const retry = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Respond with ONLY a single emoji for: "${word}"` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 10 },
        }),
      })
      if (!retry.ok) return null
      const data = await retry.json()
      const emoji = extractEmoji(data)
      if (emoji) runtimeCache.set(key, emoji)
      return emoji
    }

    if (!res.ok) return null

    const data = await res.json()
    const emoji = extractEmoji(data)
    if (emoji) runtimeCache.set(key, emoji)
    return emoji
  } catch {
    return null
  }
}

function extractEmoji(data: Record<string, unknown>): string | null {
  const text: string =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  const match = text.match(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/u)
  return match ? match[0] : null
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

/**
 * Ask Gemini for a single emoji that represents a word.
 * Returns the emoji string or null on failure (never blocks the submit flow).
 */
export async function getEmojiForWord(word: string): Promise<string | null> {
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
                text: `Respond with ONLY a single emoji (no text, no spaces, no punctuation) that best represents this word: "${word}"`,
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

    if (!res.ok) return null

    const data = await res.json()
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

    // Extract only emoji characters — discard any text leakage
    const emojiMatch = text.match(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/u)
    return emojiMatch ? emojiMatch[0] : null
  } catch {
    return null
  }
}

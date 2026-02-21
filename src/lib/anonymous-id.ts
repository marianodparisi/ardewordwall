const STORAGE_KEY = 'wordwall_anonymous_id'
const COOLDOWN_KEY = 'wordwall_cooldown'

export function getAnonymousId(): string {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}

/** Returns a unique anonymous_id per submission (base id + counter) */
export function getSubmissionId(): string {
  const base = getAnonymousId()
  const count = getSubmissionCount()
  return count === 0 ? base : `${base}-${count}`
}

function getSubmissionCount(): number {
  return parseInt(localStorage.getItem('wordwall_submission_count') || '0', 10)
}

export function incrementSubmissionCount(): void {
  const count = getSubmissionCount()
  localStorage.setItem('wordwall_submission_count', String(count + 1))
}

/** Get remaining cooldown ms for a session. Returns 0 if no cooldown active. */
export function getCooldownRemaining(sessionId: string): number {
  const raw = localStorage.getItem(`${COOLDOWN_KEY}_${sessionId}`)
  if (!raw) return 0
  const expiresAt = parseInt(raw, 10)
  const remaining = expiresAt - Date.now()
  return remaining > 0 ? remaining : 0
}

/** Start a 5-minute cooldown for a session */
export function startCooldown(sessionId: string): void {
  const expiresAt = Date.now() + 5 * 60 * 1000
  localStorage.setItem(`${COOLDOWN_KEY}_${sessionId}`, String(expiresAt))
}

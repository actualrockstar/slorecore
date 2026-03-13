export type BadgeSession = {
  sessionId: string
  badgeType: string
  subtitle: string
  approvedCount: number
  triggerWarnedCount: number
  history: ('approve' | 'flag')[]
  createdAt: string
}

const KEY = 'twBadgeSession'

export function saveBadgeSession(session: BadgeSession): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function loadBadgeSession(): BadgeSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      typeof parsed.sessionId === 'string' &&
      typeof parsed.badgeType === 'string' &&
      typeof parsed.subtitle === 'string' &&
      typeof parsed.approvedCount === 'number' &&
      typeof parsed.triggerWarnedCount === 'number' &&
      Array.isArray(parsed.history) &&
      typeof parsed.createdAt === 'string'
    ) {
      return parsed as BadgeSession
    }
    return null
  } catch {
    return null
  }
}

export function clearBadgeSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}

export function generateSessionId(): string {
  return 'tw_' + Math.random().toString(36).slice(2, 9).toUpperCase()
}

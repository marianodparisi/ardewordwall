import type { CSSProperties } from 'react'
import type { Session } from '../types/database'

export type SessionTheme = 'classic' | 'oceano' | 'sunset' | 'tropical'

export interface SessionConfig {
  theme: SessionTheme
  max_chars: number
  allow_emoji: boolean
  allow_name: boolean
}

const DEFAULT_CONFIG: SessionConfig = {
  theme: 'classic',
  max_chars: 30,
  allow_emoji: true,
  allow_name: true,
}

const THEME_STYLES: Record<SessionTheme, Record<string, string>> = {
  classic: {
    '--color-primary': '#E8583A',
    '--color-secondary': '#F5B731',
    '--color-accent': '#F07C5A',
    '--color-warm': '#D94425',
    '--color-background-light': '#FFF8F0',
    '--font-display': '"Plus Jakarta Sans", sans-serif',
  },
  oceano: {
    '--color-primary': '#0F766E',
    '--color-secondary': '#38BDF8',
    '--color-accent': '#14B8A6',
    '--color-warm': '#0E7490',
    '--color-background-light': '#ECFEFF',
    '--font-display': '"Plus Jakarta Sans", sans-serif',
  },
  sunset: {
    '--color-primary': '#7C2D12',
    '--color-secondary': '#FB7185',
    '--color-accent': '#F97316',
    '--color-warm': '#B91C1C',
    '--color-background-light': '#FFF7ED',
    '--font-display': '"Plus Jakarta Sans", sans-serif',
  },
  tropical: {
    '--color-primary': '#0D6F78',
    '--color-secondary': '#E48B1F',
    '--color-accent': '#2CA6A1',
    '--color-warm': '#075A5F',
    '--color-background-light': '#F0DE97',
    '--font-display': '"Bungee", sans-serif',
  },
}

const THEME_COLORS: Record<SessionTheme, { primary: string; background: string }> = {
  classic: { primary: '#E8583A', background: '#FFF8F0' },
  oceano: { primary: '#0F766E', background: '#ECFEFF' },
  sunset: { primary: '#7C2D12', background: '#FFF7ED' },
  tropical: { primary: '#0D6F78', background: '#EFD98E' },
}

function normalizeTheme(theme: Session['theme']): SessionTheme {
  if (theme === 'classic' || theme === 'oceano' || theme === 'sunset' || theme === 'tropical') {
    return theme
  }
  return DEFAULT_CONFIG.theme
}

export function getSessionConfig(session: Session | null | undefined): SessionConfig {
  const maxChars = Number(session?.max_chars)

  return {
    theme: normalizeTheme(session?.theme),
    max_chars: Number.isFinite(maxChars) ? Math.min(Math.max(Math.round(maxChars), 10), 120) : DEFAULT_CONFIG.max_chars,
    allow_emoji: session?.allow_emoji ?? DEFAULT_CONFIG.allow_emoji,
    allow_name: session?.allow_name ?? DEFAULT_CONFIG.allow_name,
  }
}

export function getThemeStyle(theme: Session['theme']): CSSProperties {
  const normalized = normalizeTheme(theme)
  return THEME_STYLES[normalized] as CSSProperties
}

export function getThemeColors(theme: Session['theme']) {
  const normalized = normalizeTheme(theme)
  return THEME_COLORS[normalized]
}

export const SESSION_THEMES: Array<{ value: SessionTheme; label: string }> = [
  { value: 'classic', label: 'Clasico' },
  { value: 'oceano', label: 'Oceano' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'tropical', label: 'Tropical' },
]

import { useEffect, useRef, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import type { Response } from '../types/database'
import { WordCard } from './WordCard'

const FLOATING_LOGOS = [
  { src: '/arde.png', alt: 'Arde Logo' },
  { src: '/arde2.png', alt: 'Arde Logo 2' },
  { src: '/arde.png', alt: 'Arde Logo' },
  { src: '/arde2.png', alt: 'Arde Logo 2' },
  { src: '/arde.png', alt: 'Arde Logo' },
  { src: '/arde2.png', alt: 'Arde Logo 2' },
  { src: '/arde.png', alt: 'Arde Logo' },
  { src: '/arde2.png', alt: 'Arde Logo 2' },
]

interface WordCloudProps {
  responses: Response[]
  showEmoji?: boolean
  showNames?: boolean
}

interface GroupedResponse {
  key: string
  word: string
  emoji: string | null
  count: number
  authorName: string | null
}

interface CardState {
  vx: number
  vy: number
}

function groupResponses(
  responses: Response[],
  showEmoji: boolean,
  showNames: boolean
): GroupedResponse[] {
  const map = new Map<string, GroupedResponse>()
  for (const r of responses) {
    const key = r.word.toLowerCase().trim()
    const existing = map.get(key)
    if (existing) {
      existing.count++
      if (showNames && !existing.authorName && r.author_name) {
        existing.authorName = r.author_name
      }
      if (showEmoji && !existing.emoji && r.emoji) {
        existing.emoji = r.emoji
      }
    } else {
      map.set(key, {
        key,
        word: r.word,
        emoji: showEmoji ? r.emoji : null,
        count: 1,
        authorName: showNames ? r.author_name : null,
      })
    }
  }
  return Array.from(map.values())
}

function randomStartPosition(): { x: number; y: number } {
  return {
    x: 2 + Math.random() * 85,
    y: 2 + Math.random() * 85,
  }
}

function randomVelocity(): { vx: number; vy: number } {
  const speed = 0.015 + Math.random() * 0.025
  const angle = Math.random() * Math.PI * 2
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed }
}

export function WordCloud({ responses, showEmoji = true, showNames = true }: WordCloudProps) {
  const grouped = useMemo(
    () => groupResponses(responses, showEmoji, showNames),
    [responses, showEmoji, showNames]
  )

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const statesRef = useRef<CardState[]>([])
  const positionsRef = useRef<{ x: number; y: number }[]>([])
  const rafRef = useRef<number>(0)
  const prevCountRef = useRef(0)

  // Floating logo refs
  const logoRefs = useRef<(HTMLDivElement | null)[]>([])
  const logoStatesRef = useRef<CardState[]>([])
  const logoPositionsRef = useRef<{ x: number; y: number }[]>([])
  const logosInitRef = useRef(false)

  const setCardRef = useCallback((el: HTMLDivElement | null, i: number) => {
    cardRefs.current[i] = el
  }, [])

  const setLogoRef = useCallback((el: HTMLDivElement | null, i: number) => {
    logoRefs.current[i] = el
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Initialize floating logos (once)
    if (!logosInitRef.current) {
      for (let i = 0; i < FLOATING_LOGOS.length; i++) {
        const startPos = randomStartPosition()
        const vel = randomVelocity()
        // Slightly slower than word cards for visual variety
        vel.vx *= 0.6
        vel.vy *= 0.6
        logoPositionsRef.current[i] = { x: startPos.x, y: startPos.y }
        logoStatesRef.current[i] = { vx: vel.vx, vy: vel.vy }

        const el = logoRefs.current[i]
        if (el) {
          const startRotation = (Math.random() - 0.5) * 20
          gsap.set(el, { left: `${startPos.x}%`, top: `${startPos.y}%`, opacity: 0, scale: 0.3, rotation: startRotation })
          gsap.to(el, { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.4)', delay: 0.3 + i * 0.15 })
          const swingAmount = 5 + Math.random() * 8
          const swingDuration = 5 + Math.random() * 5
          gsap.to(el, {
            rotation: startRotation + swingAmount,
            duration: swingDuration,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: Math.random() * 3,
          })
        }
      }
      logosInitRef.current = true
    }

    // Initialize new word cards
    for (let i = prevCountRef.current; i < grouped.length; i++) {
      const startPos = randomStartPosition()
      const vel = randomVelocity()
      positionsRef.current[i] = { x: startPos.x, y: startPos.y }
      statesRef.current[i] = { vx: vel.vx, vy: vel.vy }

      const el = cardRefs.current[i]
      if (el) {
        const startRotation = (Math.random() - 0.5) * 12
        gsap.set(el, { left: `${startPos.x}%`, top: `${startPos.y}%`, opacity: 0, scale: 0.5, rotation: startRotation })
        gsap.to(el, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: i * 0.05 })
        const swingAmount = 3 + Math.random() * 5
        const swingDuration = 4 + Math.random() * 4
        gsap.to(el, {
          rotation: startRotation + swingAmount,
          duration: swingDuration,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 2,
        })
      }
    }
    prevCountRef.current = grouped.length

    function animate() {
      const rect = container.getBoundingClientRect()
      if (!rect.width || !rect.height) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }

      // Animate floating logos
      for (let i = 0; i < FLOATING_LOGOS.length; i++) {
        const el = logoRefs.current[i]
        const pos = logoPositionsRef.current[i]
        const state = logoStatesRef.current[i]
        if (!el || !pos || !state) continue

        const elRect = el.getBoundingClientRect()
        const wPct = (elRect.width / rect.width) * 100
        const hPct = (elRect.height / rect.height) * 100

        pos.x += state.vx
        pos.y += state.vy

        if (pos.x <= 0) { pos.x = 0; state.vx = Math.abs(state.vx) }
        if (pos.x + wPct >= 100) { pos.x = 100 - wPct; state.vx = -Math.abs(state.vx) }
        if (pos.y <= 0) { pos.y = 0; state.vy = Math.abs(state.vy) }
        if (pos.y + hPct >= 100) { pos.y = 100 - hPct; state.vy = -Math.abs(state.vy) }

        el.style.left = `${pos.x}%`
        el.style.top = `${pos.y}%`
      }

      // Animate word cards
      for (let i = 0; i < grouped.length; i++) {
        const el = cardRefs.current[i]
        const pos = positionsRef.current[i]
        const state = statesRef.current[i]
        if (!el || !pos || !state) continue

        const cardRect = el.getBoundingClientRect()
        const cardWPct = (cardRect.width / rect.width) * 100
        const cardHPct = (cardRect.height / rect.height) * 100

        pos.x += state.vx
        pos.y += state.vy

        if (pos.x <= 0) { pos.x = 0; state.vx = Math.abs(state.vx) }
        if (pos.x + cardWPct >= 100) { pos.x = 100 - cardWPct; state.vx = -Math.abs(state.vx) }
        if (pos.y <= 0) { pos.y = 0; state.vy = Math.abs(state.vy) }
        if (pos.y + cardHPct >= 100) { pos.y = 100 - cardHPct; state.vy = -Math.abs(state.vy) }

        el.style.left = `${pos.x}%`
        el.style.top = `${pos.y}%`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [grouped.length])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Floating logo images */}
      {FLOATING_LOGOS.map((logo, i) => (
        <div
          key={`logo-${i}`}
          ref={(el) => setLogoRef(el, i)}
          className="absolute pointer-events-none"
          style={{ left: '0%', top: '0%' }}
        >
          <div className="bg-white rounded-full p-1.5 md:p-2 shadow-lg ring-2 ring-primary/20">
            <img
              src={logo.src}
              alt={logo.alt}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
            />
          </div>
        </div>
      ))}

      {/* Word cards */}
      {grouped.map((g, i) => (
        <div
          key={g.key}
          ref={(el) => setCardRef(el, i)}
          className="absolute pointer-events-auto"
          style={{ left: '0%', top: '0%' }}
        >
          <WordCard word={g.word} emoji={g.emoji} index={i} authorName={g.authorName} count={g.count} />
        </div>
      ))}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useAnimationMode } from './animation-mode/AnimationModeProvider'

/**
 * Toggles the ambient animation mode (default ⟷ Avengers). Mirrors ThemeSwitch:
 * a mounted guard keeps SSR markup stable, and the icon reflects the *current*
 * mode. Switching *into* Avengers fires a one-shot comic "POW!" overlay
 * (pure CSS animation, auto-disabled under prefers-reduced-motion).
 */
export default function AnimationModeSwitch() {
  const { mode, setMode } = useAnimationMode()
  const [pow, setPow] = useState(false)

  // null until mounted — render a neutral placeholder so the layout doesn't shift
  if (mode === null) {
    return <span className="block h-6 w-6 md:h-8 md:w-8" aria-hidden />
  }

  const isAvengers = mode === 'avengers'

  const onClick = () => {
    const next = isAvengers ? 'default' : 'avengers'
    setMode(next)
    if (next === 'avengers') {
      setPow(true)
      window.setTimeout(() => setPow(false), 950)
    }
  }

  return (
    <>
      <button
        onClick={onClick}
        aria-pressed={isAvengers}
        aria-label={isAvengers ? 'Switch to default animation' : 'Switch to Avengers animation'}
        title={isAvengers ? 'Default mode' : 'Avengers mode'}
        className={`transition-colors ${isAvengers ? 'text-amber-500' : 'text-muted hover:text-foreground'}`}
      >
        {isAvengers ? <Bolt /> : <Sparkle />}
      </button>
      {pow && (
        <span className="avengers-pow" aria-hidden>
          POW!
        </span>
      )}
    </>
  )
}

// default mode → a quiet sparkle
const Sparkle = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-8 md:h-8">
    <path d="M12 3l1.6 4.8L18 9.4l-4.4 1.6L12 16l-1.6-5L6 9.4l4.4-1.6L12 3Z" className="stroke-current" />
    <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" className="stroke-current" />
  </svg>
)

// Avengers mode → an energised bolt
const Bolt = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-8 md:h-8">
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" className="fill-amber-400/20 stroke-current" />
  </svg>
)

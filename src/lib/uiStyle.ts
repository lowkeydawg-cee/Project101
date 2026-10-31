import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

/**
 * The visitor's own setup: light or dark, minimal or glass.
 *
 * Both live on <html> (the `dark` class and `data-style`), set before first
 * paint by the small script in index.html so nobody sees the wrong look flash.
 * This module keeps React in step with those two attributes and remembers the
 * choice on the visitor's device.
 *
 * Every switch, of either kind, runs the print-layer sweep: the new look is
 * laid down in thin horizontal bands from the bottom up, each band drawn left
 * to right like a print head laying a layer.
 */

export type UiStyle = 'minimal' | 'glass'
export type UiTheme = 'dark' | 'light'

interface UiState {
  style: UiStyle
  theme: UiTheme
}

const STYLE_KEY = 'safehouse-style'
const THEME_KEY = 'safehouse-theme'

const listeners = new Set<() => void>()

function read(): UiState {
  if (typeof document === 'undefined') return { style: 'minimal', theme: 'dark' }
  const el = document.documentElement
  return {
    style: el.dataset.style === 'glass' ? 'glass' : 'minimal',
    theme: el.classList.contains('dark') ? 'dark' : 'light',
  }
}

let snapshot: UiState = read()

function emit() {
  snapshot = read()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useUi(): UiState {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot)
}

function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Private windows can refuse storage. The choice still applies for this visit.
  }
}

/* ── the print-layer sweep ─────────────────────────────────────────── */

const BANDS = 22
const DURATION = 1400

let frames: Keyframe[] | null = null

/**
 * Keyframes for a staircase clip-path. Band 0 is the bottom layer. Each band
 * starts a little after the one below it and grows from the left edge to the
 * right, so the revealed region is always a staircase that climbs the screen.
 * Every keyframe has the same number of points, which is what lets the
 * browser interpolate between them.
 */
function layerFrames(): Keyframe[] {
  const steps = 48
  const h = 100 / BANDS
  const lead = 0.6 // share of the run spent starting new layers
  const d = 1 - lead // how long one layer takes to draw across
  const out: Keyframe[] = []

  for (let k = 0; k <= steps; k++) {
    const t = k / steps
    const pts = ['0% 100%']
    for (let i = 0; i < BANDS; i++) {
      const start = (i / (BANDS - 1)) * lead
      const p = Math.min(1, Math.max(0, (t - start) / d))
      const w = (1 - Math.pow(1 - p, 3)) * 100
      const bottom = 100 - i * h
      const top = 100 - (i + 1) * h
      pts.push(`${w.toFixed(2)}% ${bottom.toFixed(3)}%`, `${w.toFixed(2)}% ${top.toFixed(3)}%`)
    }
    pts.push('0% 0%')
    out.push({ clipPath: `polygon(${pts.join(', ')})` })
  }
  return out
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> }
}

function change(mutate: () => void) {
  const commit = () => {
    mutate()
    flushSync(emit)
  }

  const doc = document as ViewTransitionDoc
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Older browsers and anyone who asked for less motion get an instant switch.
  if (!doc.startViewTransition || calm) {
    commit()
    return
  }

  const transition = doc.startViewTransition(commit)
  transition.ready
    .then(() => {
      frames ??= layerFrames()
      document.documentElement.animate(frames, {
        duration: DURATION,
        easing: 'linear',
        pseudoElement: '::view-transition-new(root)',
      })
    })
    .catch(() => {
      // If the animation cannot run, the switch has already happened. Nothing to undo.
    })
}

/* ── public setters ────────────────────────────────────────────────── */

export function setStyle(style: UiStyle) {
  if (snapshot.style === style) return
  change(() => {
    document.documentElement.dataset.style = style
    remember(STYLE_KEY, style)
  })
}

export function setTheme(theme: UiTheme) {
  if (snapshot.theme === theme) return
  change(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    remember(THEME_KEY, theme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0b0b0a' : '#f2f1eb')
  })
}

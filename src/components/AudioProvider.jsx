import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

// Audio context to manage global sound state, volume, and tone playback
// - Synth uses Web Audio API (tiny footprint)
// - Fallback: optional <audio> elements (can be supplied via Settings or assets)
// - Respects prefers-reduced-motion and a custom prefers-reduced-sensory flag if available

const AudioCtx = createContext(null)

export function useAudio() {
  return useContext(AudioCtx)
}

function getPrefersReducedMotion() {
  if (typeof window === 'undefined') return false
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

const STORAGE_KEYS = {
  enabled: 'nightquad_sound_enabled',
  volume: 'nightquad_sound_volume',
  shimmer: 'nightquad_keypress_shimmer',
}

export default function AudioProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    const v = localStorage.getItem(STORAGE_KEYS.enabled)
    return v === null ? true : v === 'true'
  })
  const [volume, setVolume] = useState(() => {
    const v = localStorage.getItem(STORAGE_KEYS.volume)
    return v === null ? 0.3 : Math.min(1, Math.max(0, parseFloat(v)))
  })
  const [keypressShimmer, setKeypressShimmer] = useState(() => {
    const v = localStorage.getItem(STORAGE_KEYS.shimmer)
    return v === 'true'
  })

  const reducedMotion = getPrefersReducedMotion()

  // Defer AudioContext creation until first user gesture to avoid autoplay restrictions
  const audioCtxRef = useRef(null)
  const gesturePrimedRef = useRef(false)

  const primeAudio = () => {
    if (gesturePrimedRef.current) return
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return
      audioCtxRef.current = new Ctx()
      gesturePrimedRef.current = true
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const save = () => {
      localStorage.setItem(STORAGE_KEYS.enabled, String(enabled))
      localStorage.setItem(STORAGE_KEYS.volume, String(volume))
      localStorage.setItem(STORAGE_KEYS.shimmer, String(keypressShimmer))
    }
    save()
  }, [enabled, volume, keypressShimmer])

  // Core tone synth: short warm bell-like "tinn"
  const playTinn = ({ freq = 880, duration = 0.22, gain = volume * 0.9 } = {}) => {
    if (!enabled || reducedMotion) return
    const ctx = audioCtxRef.current
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Sine + Triangle blend for warmth with a slight detune
    osc.type = 'sine'
    osc.frequency.value = freq
    osc2.type = 'triangle'
    osc2.frequency.value = Math.round(freq * 1.997)

    // Envelope: fast attack, quick exponential decay
    const min = 0.0001
    gainNode.gain.setValueAtTime(min, now)
    gainNode.gain.exponentialRampToValueAtTime(Math.max(min, gain), now + 0.005)
    gainNode.gain.exponentialRampToValueAtTime(min, now + duration)

    // Gentle lowpass to keep it soft
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = Math.min(8000, freq * 6)

    osc.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(filter)
    filter.connect(ctx.destination)

    osc.start(now)
    osc2.start(now)
    osc.stop(now + duration + 0.02)
    osc2.stop(now + duration + 0.02)
  }

  // Brighter tinn for success (save/create/update)
  const playSuccess = () => {
    if (!enabled || reducedMotion) return
    const ctx = audioCtxRef.current
    if (!ctx) return
    // two-note pleasant dyad
    playTinn({ freq: 932, duration: 0.18, gain: volume * 0.9 })
    setTimeout(() => playTinn({ freq: 1244, duration: 0.16, gain: volume * 0.8 }), 70)
  }

  // Lower tinn for delete
  const playDelete = () => {
    if (!enabled || reducedMotion) return
    const ctx = audioCtxRef.current
    if (!ctx) return
    playTinn({ freq: 392, duration: 0.16, gain: volume * 0.7 })
    setTimeout(() => playTinn({ freq: 330, duration: 0.12, gain: volume * 0.6 }), 60)
  }

  // Optional very subtle shimmer while typing (debounced, default off)
  let shimmerTimeout = useRef(null)
  const playShimmer = () => {
    if (!keypressShimmer || !enabled || reducedMotion) return
    const ctx = audioCtxRef.current
    if (!ctx) return
    if (shimmerTimeout.current) return
    shimmerTimeout.current = setTimeout(() => {
      shimmerTimeout.current = null
    }, 300)
    playTinn({ freq: 740, duration: 0.08, gain: volume * 0.2 })
  }

  // Public API
  const value = useMemo(() => ({
    enabled,
    setEnabled: (v) => setEnabled(Boolean(v)),
    volume,
    setVolume: (v) => setVolume(Math.min(1, Math.max(0, v))),
    keypressShimmer,
    setKeypressShimmer,
    playTinn,
    playSuccess,
    playDelete,
    playShimmer,
    primeAudio,
    reducedMotion,
  }), [enabled, volume, keypressShimmer, reducedMotion])

  return (
    <AudioCtx.Provider value={value}>
      <div onPointerDown={primeAudio} onKeyDown={primeAudio}>
        {children}
      </div>
    </AudioCtx.Provider>
  )
}

/*
How to replace with audio files instead of synth:
- Place files in /public/audio, e.g., input.mp3, success.mp3, delete.mp3
- Create HTMLAudioElement instances and call .play() where playTinn/playSuccess/playDelete are called
- Keep durations short and volumes low. Respect enabled & reducedMotion
*/

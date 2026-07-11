import { useEffect, useRef, useState } from 'react'

// Badge de score ludique. Quand le score MONTE, un "+N" flotte et le badge
// fait un petit pop — feedback de jeu, jamais de feedback négatif.
const TINTS = {
  emerald: 'bg-emerald-100 text-emerald-700',
  lime: 'bg-lime-100 text-lime-700',
  amber: 'bg-amber-100 text-amber-700',
  slate: 'bg-slate-100 text-slate-500',
}

function tintFor(v) {
  if (v >= 80) return 'emerald'
  if (v >= 55) return 'lime'
  if (v >= 30) return 'amber'
  return 'slate'
}

export default function ScoreBadge({ score, size = 'md' }) {
  const prev = useRef(null)
  const [delta, setDelta] = useState(0)
  const [pop, setPop] = useState(false)

  const value = score?.value ?? null
  useEffect(() => {
    if (prev.current != null && value != null && value > prev.current) {
      setDelta(value - prev.current)
      setPop(true)
      const t = setTimeout(() => {
        setDelta(0)
        setPop(false)
      }, 1000)
      prev.current = value
      return () => clearTimeout(t)
    }
    prev.current = value
  }, [value])

  if (!score) return null
  const tint = TINTS[tintFor(score.value)]
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1.5 text-sm'

  return (
    <span className="relative inline-flex">
      {delta > 0 && (
        <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 animate-floatUp font-display text-sm font-800 text-emerald-500">
          +{delta}
        </span>
      )}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-display font-800 ${pad} ${tint} ${
          pop ? 'animate-pop' : ''
        }`}
      >
        <span>{score.emoji}</span>
        <span>{score.value}</span>
        <span className="opacity-50">/100</span>
        <span className="font-700 opacity-80">· {score.label}</span>
      </span>
    </span>
  )
}

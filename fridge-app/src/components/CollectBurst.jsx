// Effet visuel "collecté !" : un anneau qui éclate + un "+" qui flotte.
// Purement décoratif, monté brièvement au moment d'une collecte.
export default function CollectBurst({ label = '+1', accent = '#7bc86c' }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <span
        className="absolute h-12 w-12 animate-burst rounded-full"
        style={{ boxShadow: `0 0 0 4px ${accent}` }}
      />
      <span
        className="absolute animate-floatUp font-display text-lg font-800 drop-shadow"
        style={{ color: accent }}
      >
        {label}
      </span>
    </div>
  )
}

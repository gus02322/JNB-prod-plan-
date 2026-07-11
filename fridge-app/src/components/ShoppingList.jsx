// Liste de courses déduite : chaque ingrédient manquant, avec le nombre
// de plats qu'il débloque. Triée par plats débloqués (le plus rentable en haut).
export default function ShoppingList({ courses }) {
  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center">
        <span className="text-3xl">🎉</span>
        <p className="mt-1 font-display text-sm font-800 text-emerald-600">
          Rien à acheter — tout est cuisinable !
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {courses.map((c) => (
        <div
          key={c.nom}
          className="flex items-center gap-3 rounded-2xl border-2 border-white bg-white/80 p-2.5 shadow-tile"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-xl">
            🛒
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm font-800 text-slate-800">
              Achète {c.nom}
            </div>
            <div className="truncate text-[11px] font-700 text-slate-400">
              {c.plats.join(' · ')}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center rounded-xl bg-emerald-400 px-3 py-1 text-white">
            <span className="font-display text-lg font-800 leading-none">{c.count}</span>
            <span className="text-[9px] font-700 uppercase tracking-wide">
              plat{c.count > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

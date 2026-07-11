import { useState } from 'react'
import { NIVEAU_META } from '../utils/menu'
import { scoreMeal } from '../utils/score'
import Macros from './Macros'
import ScoreBadge from './ScoreBadge'

// Palette par niveau de déblocage (verrouillé / à un pas / prêt).
const TINTS = {
  emerald: {
    card: 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-white',
    badge: 'bg-emerald-400 text-white',
    bar: 'bg-emerald-400',
  },
  amber: {
    card: 'border-amber-200 bg-gradient-to-b from-amber-50 to-white',
    badge: 'bg-amber-400 text-white',
    bar: 'bg-amber-400',
  },
  slate: {
    card: 'border-slate-200 bg-gradient-to-b from-slate-50 to-white',
    badge: 'bg-slate-400 text-white',
    bar: 'bg-slate-300',
  },
}

export default function RecipeCard({ recette }) {
  const [open, setOpen] = useState(recette.niveau === 'cuisinable')
  const meta = NIVEAU_META[recette.niveau]
  const tint = TINTS[meta.tint]
  const total = recette.ingredients.length
  const present = total - recette.manquants
  const locked = recette.niveau === 'ambitieuse'
  const score = scoreMeal(recette)

  return (
    <div
      className={`overflow-hidden rounded-2xl border-2 shadow-tile transition ${tint.card} ${
        locked ? 'opacity-90' : ''
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="text-3xl">{meta.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-800 text-slate-800">
            {recette.titre}
          </div>
          <div className="flex items-center gap-2 text-xs font-700 text-slate-400">
            <span
              className={`rounded-full px-2 py-0.5 font-display ${tint.badge}`}
            >
              {meta.label}
            </span>
            {recette.temps_min != null && <span>⏱ {recette.temps_min} min</span>}
            {recette.portions_base != null && <span>👤 {recette.portions_base}</span>}
          </div>
        </div>
        <span className="shrink-0 font-body text-xs font-700 text-slate-400">
          {present}/{total}
        </span>
      </button>

      {/* Barre d'avancement des ingrédients */}
      <div className="mx-3 h-1.5 overflow-hidden rounded-full bg-black/5">
        <div
          className={`h-full rounded-full ${tint.bar}`}
          style={{ width: `${total ? (present / total) * 100 : 0}%` }}
        />
      </div>

      {/* Nutrition + score d'équilibre du repas */}
      <div className="flex flex-wrap items-center gap-2 px-3 pt-2.5">
        <ScoreBadge score={score} size="sm" />
        <Macros recette={recette} />
      </div>

      {open && (
        <div className="animate-slideUp space-y-3 p-3">
          <div className="flex flex-wrap gap-1.5">
            {recette.ingredients.map((ing, i) => (
              <span
                key={i}
                className={`rounded-full px-2.5 py-1 text-xs font-700 ${
                  ing.present
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-50 text-rose-500 line-through decoration-rose-300'
                }`}
                title={ing.present ? "Tu l'as" : 'À acheter'}
              >
                {ing.present ? '✓' : '🛒'} {ing.nom}
                {ing.quantite != null && ing.unite ? (
                  <span className="opacity-60"> · {ing.quantite} {ing.unite}</span>
                ) : null}
              </span>
            ))}
          </div>

          {recette.etapes.length > 0 && (
            <ol className="space-y-1.5 pl-1">
              {recette.etapes.map((etape, i) => (
                <li key={i} className="flex gap-2 font-body text-sm text-slate-600">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white font-display text-[11px] font-800 text-slate-500 shadow-chunky">
                    {i + 1}
                  </span>
                  <span>{etape}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}

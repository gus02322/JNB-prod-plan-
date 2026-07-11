import ItemSprite from './ItemSprite'
import { NIVEAUX } from '../data/catalog'

// Libellé lisible de la quantité selon l'unité ludique.
function quantiteLabel(item) {
  if (item.unite === 'niveau') {
    return NIVEAUX[Math.min(item.quantite, NIVEAUX.length) - 1] ?? NIVEAUX[0]
  }
  const n = item.quantite
  const u = item.unite || 'pièce'
  const plural = n > 1 && u !== 'niveau' ? 's' : ''
  return `${n} ${u}${plural}`
}

export default function ItemCard({ item, onInc, onDec, onToggle, onRemove }) {
  const isStaple = item.type === 'staple'
  const present = item.present !== false // les staples par défaut sont "j'en ai"

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-2xl border-2 bg-white/80 p-2.5 pr-3 shadow-tile backdrop-blur transition
        ${isStaple && !present ? 'border-slate-200 opacity-55' : 'border-white'}`}
    >
      <ItemSprite categorie={item.categorie} icon={item.icon} size="md" />

      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[15px] font-700 text-slate-800">
          {item.nom}
        </div>
        {isStaple ? (
          <div className="text-xs font-700 text-slate-400">
            {present ? "J'en ai ✓" : "Plus rien"}
          </div>
        ) : (
          <div className="font-body text-sm font-700 text-slate-500">
            {quantiteLabel(item)}
          </div>
        )}
      </div>

      {isStaple ? (
        <button
          onClick={onToggle}
          className={`shrink-0 rounded-xl px-3 py-2 font-display text-xs font-700 shadow-chunky transition active:translate-y-0.5
            ${present
              ? 'bg-emerald-400 text-white hover:bg-emerald-500'
              : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
        >
          {present ? "J'en ai" : "J'en ai plus"}
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={onDec}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-display text-lg font-800 text-slate-500 shadow-chunky transition hover:bg-slate-200 active:translate-y-0.5"
            aria-label="Retirer"
          >
            −
          </button>
          <span className="min-w-[1.6rem] text-center font-display text-lg font-800 text-slate-700">
            {item.unite === 'niveau' ? NIVEAUX[Math.min(item.quantite, 3) - 1]?.[0]?.toUpperCase() : item.quantite}
          </span>
          <button
            onClick={onInc}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 font-display text-lg font-800 text-white shadow-chunky transition hover:bg-emerald-500 active:translate-y-0.5"
            aria-label="Ajouter"
          >
            +
          </button>
        </div>
      )}

      <button
        onClick={onRemove}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-400 text-xs font-800 text-white opacity-0 shadow transition group-hover:opacity-100"
        aria-label="Supprimer du frigo"
        title="Supprimer"
      >
        ×
      </button>
    </div>
  )
}

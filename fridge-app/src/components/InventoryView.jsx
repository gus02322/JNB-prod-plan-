import { useMemo, useState } from 'react'
import { ZONES } from '../data/catalog'
import { scoreFridge } from '../utils/score'
import ZoneColumn from './ZoneColumn'
import AddItemFlow from './AddItemFlow'
import ScoreBadge from './ScoreBadge'

// Vue inventaire (étape 1) : les 3 zones + l'ajout façon petit jeu.
export default function InventoryView({ items, actions, collect, muted }) {
  const [adding, setAdding] = useState(false)

  const byZone = useMemo(() => {
    const map = { frigo: [], sec: [], epices: [] }
    items.forEach((it) => map[it.zone]?.push(it))
    return map
  }, [items])

  const score = useMemo(() => scoreFridge(items), [items])

  return (
    <>
      {/* Score d'équilibre du frigo (récompense la variété) */}
      <div className="mb-3 flex items-center gap-2 rounded-2xl border-2 border-white bg-white/70 p-2.5 shadow-tile">
        <span className="font-display text-xs font-800 uppercase tracking-wide text-slate-400">
          Équilibre du frigo
        </span>
        <span className="ml-auto">
          <ScoreBadge score={score} size="sm" />
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ZONES.map((zone) => (
          <ZoneColumn
            key={zone.id}
            zone={zone}
            items={byZone[zone.id]}
            actions={actions}
          />
        ))}
      </div>

      <button
        onClick={() => setAdding(true)}
        className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald-400 px-6 py-3.5 font-display text-lg font-800 text-white shadow-lg transition hover:-translate-x-1/2 hover:-translate-y-0.5 hover:bg-emerald-500 active:translate-y-0"
      >
        <span className="text-2xl leading-none">＋</span>
        Ranger des courses
      </button>

      {adding && (
        <AddItemFlow
          muted={muted}
          onClose={() => setAdding(false)}
          onCollect={collect}
        />
      )}
    </>
  )
}

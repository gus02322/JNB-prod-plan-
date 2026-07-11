import ItemCard from './ItemCard'

const ZONE_TINT = {
  frigo: 'from-cyan-50 to-sky-100 border-cyan-200',
  sec: 'from-amber-50 to-orange-100 border-amber-200',
  epices: 'from-rose-50 to-orange-50 border-rose-200',
}

export default function ZoneColumn({ zone, items, actions }) {
  const count = items.length

  return (
    <section
      className={`flex min-h-[240px] flex-col rounded-3xl border-2 bg-gradient-to-b p-3 shadow-tile ${ZONE_TINT[zone.id]}`}
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className="text-2xl">{zone.emoji}</span>
        <div className="flex-1">
          <h2 className="font-display text-lg font-800 leading-none text-slate-700">
            {zone.nom}
          </h2>
          <p className="text-[11px] font-700 uppercase tracking-wide text-slate-400">
            {zone.hint}
          </p>
        </div>
        <span className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-white/80 px-2 font-display text-sm font-800 text-slate-500">
          {count}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-2">
        {count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/70 py-8 text-center">
            <span className="text-3xl opacity-40">🍽️</span>
            <p className="mt-1 px-4 font-body text-sm font-700 text-slate-400">
              Rien ici… ajoute des trucs !
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="animate-slideUp">
              <ItemCard
                item={item}
                onInc={() => actions.inc(item.id)}
                onDec={() => actions.dec(item.id)}
                onToggle={() => actions.toggle(item.id)}
                onRemove={() => actions.remove(item.id)}
              />
            </div>
          ))
        )}
      </div>
    </section>
  )
}

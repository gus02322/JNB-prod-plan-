import { useMemo, useState } from 'react'
import { ZONES } from './data/catalog'
import { useLocalStorage } from './hooks/useLocalStorage'
import ZoneColumn from './components/ZoneColumn'
import AddItemFlow from './components/AddItemFlow'

const STORAGE_KEY = 'frigo.items.v1'

export default function App() {
  const [items, setItems] = useLocalStorage(STORAGE_KEY, [])
  const [muted, setMuted] = useLocalStorage('frigo.muted.v1', false)
  const [adding, setAdding] = useState(false)

  // Répartition des items par zone.
  const byZone = useMemo(() => {
    const map = { frigo: [], sec: [], epices: [] }
    items.forEach((it) => map[it.zone]?.push(it))
    return map
  }, [items])

  // Total "collecté" affiché dans le compteur du bandeau.
  const total = useMemo(
    () =>
      items.reduce(
        (n, it) => n + (it.type === 'staple' ? 1 : it.quantite || 0),
        0,
      ),
    [items],
  )

  // Ajout / fusion d'un item collecté.
  function collect(tpl, extras) {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === tpl.id)
      if (existing) {
        return prev.map((x) => {
          if (x.id !== tpl.id) return x
          if (tpl.type === 'staple') return { ...x, present: true }
          if (tpl.unite === 'niveau') return { ...x, quantite: extras.quantite }
          return { ...x, quantite: Math.min(99, x.quantite + extras.quantite) }
        })
      }
      const base = {
        id: tpl.id,
        nom: tpl.nom,
        icon: tpl.icon,
        categorie: tpl.categorie,
        zone: tpl.zone,
        type: tpl.type,
        unite: tpl.unite,
      }
      return tpl.type === 'staple'
        ? [...prev, { ...base, present: true }]
        : [...prev, { ...base, quantite: extras.quantite }]
    })
  }

  const actions = {
    inc: (id) =>
      setItems((prev) =>
        prev.map((x) =>
          x.id === id
            ? { ...x, quantite: Math.min(x.unite === 'niveau' ? 3 : 99, x.quantite + 1) }
            : x,
        ),
      ),
    dec: (id) =>
      setItems((prev) =>
        prev.flatMap((x) => {
          if (x.id !== id) return [x]
          return x.quantite <= 1 ? [] : [{ ...x, quantite: x.quantite - 1 }]
        }),
      ),
    toggle: (id) =>
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, present: x.present === false } : x)),
      ),
    remove: (id) => setItems((prev) => prev.filter((x) => x.id !== id)),
  }

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col px-4 pb-28 pt-5">
      {/* Bandeau */}
      <header className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧊</span>
          <div>
            <h1 className="font-display text-2xl font-800 leading-none text-slate-800">
              Mon Frigo
            </h1>
            <p className="text-xs font-700 uppercase tracking-wide text-slate-400">
              Inventaire · niveau 1
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 shadow-tile">
            <span className="text-lg">🧺</span>
            <span className="font-display text-lg font-800 text-slate-700">{total}</span>
            <span className="text-xs font-700 text-slate-400">en stock</span>
          </div>
          <button
            onClick={() => setMuted((m) => !m)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-lg shadow-tile transition active:translate-y-0.5"
            title={muted ? 'Activer le son' : 'Couper le son'}
            aria-label="Son"
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      {/* Les 3 zones */}
      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
        {ZONES.map((zone) => (
          <ZoneColumn
            key={zone.id}
            zone={zone}
            items={byZone[zone.id]}
            actions={actions}
          />
        ))}
      </div>

      {/* Bouton d'ajout flottant */}
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
    </div>
  )
}

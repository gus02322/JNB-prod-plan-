import { useMemo, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { normNom } from './utils/planning'
import InventoryView from './components/InventoryView'
import MenuView from './components/MenuView'
import WeekView from './components/WeekView'
import ProfileView from './components/ProfileView'

const STORAGE_KEY = 'frigo.items.v1'

const TABS = [
  { id: 'frigo', label: 'Frigo', emoji: '🧊' },
  { id: 'cuisine', label: 'Cuisine', emoji: '🍳' },
  { id: 'semaine', label: 'Semaine', emoji: '📅' },
  { id: 'profil', label: 'Profil', emoji: '👤' },
]

export default function App() {
  const [items, setItems] = useLocalStorage(STORAGE_KEY, [])
  const [muted, setMuted] = useLocalStorage('frigo.muted.v1', false)
  const [view, setView] = useState('frigo')

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

  // "J'ai cuisiné" : décrémente du frigo les ingrédients TRACKÉS consommés
  // par une recette (déjà mise à l'échelle). Les staples ne bougent pas.
  // Renvoie le nombre d'items du frigo réellement touchés (pour le feedback).
  function cookRecette(scaled) {
    const besoins = scaled.ingredients.filter((i) => i.present)
    const touched = items.filter(
      (it) =>
        it.type === 'tracke' &&
        besoins.some((ing) => normNom(ing.nom) === normNom(it.nom)),
    ).length

    setItems((prev) => {
      let next = prev
      for (const ing of besoins) {
        const key = normNom(ing.nom)
        next = next.flatMap((it) => {
          if (it.type !== 'tracke' || normNom(it.nom) !== key) return [it]
          const conso = it.unite === 'niveau' ? 1 : ing.quantite ?? 1
          const q = it.quantite - conso
          return q > 0 ? [{ ...it, quantite: q }] : []
        })
      }
      return next
    })

    return touched
  }

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col px-4 pb-28 pt-5">
      {/* Bandeau */}
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🧊</span>
          <div>
            <h1 className="font-display text-2xl font-800 leading-none text-slate-800">
              Mon Frigo
            </h1>
            <p className="text-xs font-700 uppercase tracking-wide text-slate-400">
Frigo · cuisine · semaine · nutrition
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

      {/* Onglets */}
      <div className="mb-5 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-display text-sm font-800 shadow-chunky transition active:translate-y-0.5 ${
              view === tab.id
                ? 'bg-slate-800 text-white'
                : 'bg-white/80 text-slate-500 hover:bg-white'
            }`}
          >
            <span className="text-base">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'frigo' && (
        <InventoryView
          items={items}
          actions={actions}
          collect={collect}
          muted={muted}
        />
      )}
      {view === 'cuisine' && <MenuView items={items} muted={muted} />}
      {view === 'semaine' && <WeekView onCook={cookRecette} muted={muted} />}
      {view === 'profil' && <ProfileView />}

      {/* Mention discrète */}
      <p className="mt-8 text-center text-[10px] font-600 text-slate-300">
        Estimations ludiques, pas un conseil médical ni un régime.
      </p>
    </div>
  )
}

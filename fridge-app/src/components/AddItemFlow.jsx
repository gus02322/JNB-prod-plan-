import { useState } from 'react'
import { CATALOG, NIVEAUX, findZone } from '../data/catalog'
import ItemSprite from './ItemSprite'
import CollectBurst from './CollectBurst'
import { playCollect } from '../utils/sound'

// Flow d'ajout façon petit jeu : catégorie → item → quantité, avec
// un feedback "collecté" satisfaisant (anneau + "+n" + son + compteur).
export default function AddItemFlow({ onClose, onCollect, muted }) {
  const [catId, setCatId] = useState(null)
  const [sheet, setSheet] = useState(null) // item tracké en cours de quantité
  const [collected, setCollected] = useState(0) // compteur de session
  const [burstKey, setBurstKey] = useState(null) // id d'item qui vient d'éclater

  const category = CATALOG.find((c) => c.id === catId)

  function fireFeedback(itemId, amount) {
    if (!muted) playCollect()
    setCollected((n) => n + 1)
    setBurstKey({ id: itemId, amount, ts: Date.now() })
    setTimeout(() => setBurstKey((b) => (b && b.id === itemId ? null : b)), 900)
  }

  // Tap sur un item du rayon.
  function handleItemTap(tpl) {
    if (tpl.type === 'staple') {
      onCollect(tpl, { present: true })
      fireFeedback(tpl.id, '+1')
    } else {
      setSheet(tpl)
    }
  }

  // Validation de la quantité d'un item tracké.
  function confirmQuantite(quantite) {
    onCollect(sheet, { quantite })
    fireFeedback(sheet.id, sheet.unite === 'niveau' ? '+' : `+${quantite}`)
    setSheet(null)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl">
        {/* Barre du haut */}
        <div className="flex items-center gap-2 border-b-2 border-black/5 px-4 py-3">
          {catId ? (
            <button
              onClick={() => setCatId(null)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-800 text-slate-500 shadow-chunky active:translate-y-0.5"
            >
              ‹
            </button>
          ) : (
            <span className="text-2xl">🧺</span>
          )}
          <h2 className="flex-1 font-display text-lg font-800 text-slate-700">
            {category ? category.nom : 'Que ranges-tu ?'}
          </h2>
          <span className="rounded-full bg-emerald-100 px-3 py-1 font-display text-sm font-800 text-emerald-600">
            {collected} collecté{collected > 1 ? 's' : ''}
          </span>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-800 text-slate-400 shadow-chunky active:translate-y-0.5"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {!category ? (
            <CategoryGrid onPick={setCatId} />
          ) : (
            <ItemGrid
              category={category}
              onTap={handleItemTap}
              burst={burstKey}
            />
          )}
        </div>
      </div>

      {/* Feuille de quantité (items trackés) */}
      {sheet && (
        <QuantitySheet
          item={sheet}
          onCancel={() => setSheet(null)}
          onConfirm={confirmQuantite}
        />
      )}
    </div>
  )
}

function CategoryGrid({ onPick }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {CATALOG.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c.id)}
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-white bg-white/80 p-4 shadow-tile transition hover:-translate-y-0.5 active:translate-y-0"
          style={{ boxShadow: `0 6px 0 ${c.accent}44` }}
        >
          <span className="text-4xl">{c.emoji}</span>
          <span className="font-display text-sm font-800 text-slate-700">
            {c.nom}
          </span>
        </button>
      ))}
    </div>
  )
}

function ItemGrid({ category, onTap, burst }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {category.items.map((tpl) => {
        const zone = findZone(tpl.zone)
        const showBurst = burst && burst.id === tpl.id
        return (
          <button
            key={tpl.id}
            onClick={() => onTap({ ...tpl, categorie: category.id })}
            className="relative flex flex-col items-center gap-1.5 rounded-2xl border-2 border-white bg-white/80 p-3 shadow-tile transition hover:-translate-y-1 active:translate-y-0"
          >
            {showBurst && <CollectBurst label={burst.amount} accent={category.accent} />}
            <ItemSprite
              categorie={category.id}
              icon={tpl.icon}
              size="md"
              animate={showBurst}
            />
            <span className="font-display text-xs font-800 leading-tight text-slate-700">
              {tpl.nom}
            </span>
            <span className="text-[10px] font-700 text-slate-400">
              {zone?.emoji} {tpl.type === 'staple' ? 'présence' : tpl.unite}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function QuantitySheet({ item, onCancel, onConfirm }) {
  const isNiveau = item.unite === 'niveau'
  const [n, setN] = useState(isNiveau ? 2 : 1)
  const zone = findZone(item.zone)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm animate-slideUp rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <ItemSprite categorie={item.categorie} icon={item.icon} size="lg" />
          <h3 className="font-display text-xl font-800 text-slate-800">{item.nom}</h3>
          <p className="text-xs font-700 uppercase tracking-wide text-slate-400">
            {zone?.emoji} {zone?.nom} · combien ?
          </p>
        </div>

        <div className="my-5">
          {isNiveau ? (
            <div className="grid grid-cols-3 gap-2">
              {NIVEAUX.map((lvl, i) => (
                <button
                  key={lvl}
                  onClick={() => setN(i + 1)}
                  className={`rounded-2xl border-2 py-3 font-display text-sm font-800 capitalize transition
                    ${n === i + 1
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                      : 'border-slate-200 bg-white text-slate-500'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setN((v) => Math.max(1, v - 1))}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 font-display text-2xl font-800 text-slate-500 shadow-chunky active:translate-y-0.5"
              >
                −
              </button>
              <div className="flex min-w-[5rem] flex-col items-center">
                <span className="font-display text-4xl font-800 text-slate-800">{n}</span>
                <span className="text-xs font-700 text-slate-400">
                  {item.unite}{n > 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setN((v) => Math.min(99, v + 1))}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400 font-display text-2xl font-800 text-white shadow-chunky active:translate-y-0.5"
              >
                +
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => onConfirm(n)}
          className="w-full rounded-2xl bg-emerald-400 py-3.5 font-display text-lg font-800 text-white shadow-chunky transition hover:bg-emerald-500 active:translate-y-0.5"
        >
          Collecter ! 🧺
        </button>
      </div>
    </div>
  )
}

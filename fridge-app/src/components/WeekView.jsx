import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  REPAS,
  initWeek,
  formatShort,
  scaleRecette,
} from '../utils/planning'
import { NIVEAU_META } from '../utils/menu'
import { besoinCalorique, couverture } from '../utils/nutrition'
import { scoreDay } from '../utils/score'
import { playCollect } from '../utils/sound'
import CollectBurst from './CollectBurst'
import Macros from './Macros'
import ScoreBadge from './ScoreBadge'

const NIVEAU_DOT = {
  cuisinable: 'bg-emerald-400',
  presque: 'bg-amber-400',
  ambitieuse: 'bg-slate-400',
}

// Calendrier semaine : menu assigné par jour/repas, mise à l'échelle
// aux convives, et boucle "j'ai cuisiné" qui vide le frigo.
export default function WeekView({ onCook, muted }) {
  const [week, setWeek] = useLocalStorage('frigo.planning.v1', initWeek())
  const [menu] = useLocalStorage('frigo.menu.v1', [])
  const [profil] = useLocalStorage('frigo.profil.v1', null)
  const besoin = profil?.besoin ?? besoinCalorique(profil)
  const [picker, setPicker] = useState(null) // { di, mi }
  const [flash, setFlash] = useState(null) // { di, mi, count }

  function updateMeal(di, mi, patch) {
    setWeek((prev) =>
      prev.map((day, i) =>
        i !== di
          ? day
          : {
              ...day,
              repas: day.repas.map((m, j) => (j !== mi ? m : { ...m, ...patch })),
            },
      ),
    )
  }

  function assigner(recette) {
    if (picker) updateMeal(picker.di, picker.mi, { recette, cuisine: false })
    setPicker(null)
  }

  function cuisiner(di, mi, meal) {
    if (!meal.recette || meal.cuisine) return
    const scaled = scaleRecette(meal.recette, meal.convives)
    const count = onCook(scaled) // décrémente le frigo, renvoie le nb d'items touchés
    updateMeal(di, mi, { cuisine: true })
    if (!muted) playCollect()
    setFlash({ di, mi, count })
    setTimeout(() => setFlash((f) => (f && f.di === di && f.mi === mi ? null : f)), 1000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className="text-2xl">📅</span>
        <div>
          <h2 className="font-display text-xl font-800 leading-none text-slate-800">
            Ma semaine
          </h2>
          <p className="text-[11px] font-700 uppercase tracking-wide text-slate-400">
            Assigne un plat, règle les convives, coche « j'ai cuisiné »
          </p>
        </div>
      </div>

      {week.map((day, di) => {
        const recettesJour = day.repas.map((m) => m.recette).filter(Boolean)
        const dayScore = scoreDay(recettesJour)
        const dayCouv =
          besoin &&
          recettesJour.reduce((s, r) => s + (couverture(r.calories, besoin) || 0), 0)
        return (
        <div
          key={day.date}
          className="rounded-2xl border-2 border-white bg-white/70 p-3 shadow-tile"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
            <span className="font-display text-base font-800 text-slate-700">
              {day.jour}
            </span>
            <span className="font-body text-xs font-700 text-slate-400">
              {formatShort(day.date)}
            </span>
            <span className="ml-auto flex items-center gap-2">
              {dayCouv ? (
                <span className="rounded-full bg-orange-50 px-2 py-0.5 font-display text-[11px] font-800 text-orange-500">
                  ≈{dayCouv}% du besoin
                </span>
              ) : null}
              {dayScore && <ScoreBadge score={dayScore} size="sm" />}
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {day.repas.map((meal, mi) => {
              const meta = REPAS[mi]
              const scaled = meal.recette
                ? scaleRecette(meal.recette, meal.convives)
                : null
              const showFlash = flash && flash.di === di && flash.mi === mi
              return (
                <div
                  key={meal.type}
                  className="relative rounded-xl border-2 border-slate-100 bg-white p-2.5"
                >
                  {showFlash && (
                    <CollectBurst label={`−${flash.count} 🧊`} accent="#7bc86c" />
                  )}

                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-base">{meta.emoji}</span>
                    <span className="flex-1 font-display text-xs font-800 uppercase tracking-wide text-slate-400">
                      {meta.label}
                    </span>
                    {/* Convives */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateMeal(di, mi, {
                            convives: Math.max(1, meal.convives - 1),
                          })
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 font-800 text-slate-500 active:translate-y-0.5"
                        aria-label="Moins de convives"
                      >
                        −
                      </button>
                      <span className="min-w-[2.6rem] text-center font-display text-xs font-800 text-slate-600">
                        {meal.convives} 👥
                      </span>
                      <button
                        onClick={() =>
                          updateMeal(di, mi, {
                            convives: Math.min(12, meal.convives + 1),
                          })
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 font-800 text-slate-500 active:translate-y-0.5"
                        aria-label="Plus de convives"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {scaled ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${NIVEAU_DOT[scaled.niveau]}`}
                          title={NIVEAU_META[scaled.niveau].label}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-display text-sm font-800 text-slate-800">
                            {scaled.titre}
                          </div>
                          <div className="text-[11px] font-700 text-slate-400">
                            {scaled.temps_min != null && <>⏱ {scaled.temps_min} min · </>}
                            pour {scaled.portions} 👥
                          </div>
                        </div>
                      </div>

                      {/* Aperçu des quantités mises à l'échelle */}
                      <div className="flex flex-wrap gap-1">
                        {scaled.ingredients.map((ing, k) => (
                          <span
                            key={k}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-700 ${
                              ing.present
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-50 text-rose-400'
                            }`}
                          >
                            {ing.nom}
                            {ing.quantite != null ? ` ×${ing.quantite}` : ''}
                          </span>
                        ))}
                      </div>

                      {/* Nutrition + couverture du besoin (par portion) */}
                      <Macros recette={scaled} />
                      {scaled.calories != null &&
                        (besoin ? (
                          <p className="text-[11px] font-700 text-slate-400">
                            🔥 Ce repas couvre ~
                            <span className="text-orange-500">
                              {couverture(scaled.calories, besoin)}%
                            </span>{' '}
                            de ton besoin
                          </p>
                        ) : (
                          <p className="text-[11px] font-700 text-slate-300">
                            Renseigne ton profil pour la couverture
                          </p>
                        ))}

                      <div className="flex items-center gap-1.5">
                        {meal.cuisine ? (
                          <span className="flex-1 rounded-lg bg-emerald-50 py-1.5 text-center font-display text-xs font-800 text-emerald-500">
                            ✓ Cuisiné !
                          </span>
                        ) : (
                          <button
                            onClick={() => cuisiner(di, mi, meal)}
                            className="flex-1 rounded-lg bg-emerald-400 py-1.5 font-display text-xs font-800 text-white shadow-chunky transition hover:bg-emerald-500 active:translate-y-0.5"
                          >
                            🍳 J'ai cuisiné
                          </button>
                        )}
                        <button
                          onClick={() => updateMeal(di, mi, { recette: null, cuisine: false })}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-800 text-slate-400 active:translate-y-0.5"
                          title="Retirer"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPicker({ di, mi })}
                      className="w-full rounded-lg border-2 border-dashed border-slate-200 py-3 font-display text-xs font-800 text-slate-400 transition hover:border-emerald-300 hover:text-emerald-500"
                    >
                      ＋ Assigner un plat
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        )
      })}

      {picker && (
        <AssignModal menu={menu} onPick={assigner} onClose={() => setPicker(null)} />
      )}
    </div>
  )
}

function AssignModal({ menu, onPick, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl">
        <div className="flex items-center gap-2 border-b-2 border-black/5 px-4 py-3">
          <span className="text-2xl">🍽️</span>
          <h3 className="flex-1 font-display text-lg font-800 text-slate-700">
            Choisir un plat
          </h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white font-800 text-slate-400 shadow-chunky active:translate-y-0.5"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {menu.length === 0 ? (
            <p className="px-4 py-10 text-center font-display text-sm font-800 text-slate-400">
              Génère d'abord un menu dans l'onglet Cuisine 🍳
            </p>
          ) : (
            <div className="space-y-2">
              {menu.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onPick(r)}
                  className="flex w-full items-center gap-3 rounded-2xl border-2 border-white bg-white/80 p-2.5 text-left shadow-tile transition hover:-translate-y-0.5"
                >
                  <span className="text-2xl">{NIVEAU_META[r.niveau].emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm font-800 text-slate-800">
                      {r.titre}
                    </div>
                    <div className="text-[11px] font-700 text-slate-400">
                      {NIVEAU_META[r.niveau].label}
                      {r.temps_min != null && <> · ⏱ {r.temps_min} min</>}
                      {r.portions_base != null && <> · base {r.portions_base} 👥</>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

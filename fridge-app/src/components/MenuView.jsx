import { useMemo, useState } from 'react'
import { genererMenu } from '../api/anthropic'
import { normalizeMenu, buildListeCourses } from '../utils/menu'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { playCollect } from '../utils/sound'
import RecipeCard from './RecipeCard'
import ShoppingList from './ShoppingList'

export default function MenuView({ items, muted }) {
  // Dernier menu généré, persisté (pas de backend).
  const [recettes, setRecettes] = useLocalStorage('frigo.menu.v1', [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Paramètres de génération.
  const [tempsMax, setTempsMax] = useLocalStorage('frigo.tempsMax.v1', 45)
  const [express, setExpress] = useState(false)

  const courses = useMemo(() => buildListeCourses(recettes), [recettes])
  const cuisinables = recettes.filter((r) => r.niveau === 'cuisinable').length

  async function handleGenerer(opts = {}) {
    const isExpress = opts.express ?? express
    setLoading(true)
    setError(null)
    try {
      const brutes = await genererMenu(items, { tempsMax, express: isExpress })
      let menu = normalizeMenu(brutes)
      // Garde-fou : on applique la contrainte même si l'IA la relâche.
      if (isExpress) {
        menu = menu.filter(
          (r) => r.niveau === 'cuisinable' && (r.temps_min == null || r.temps_min <= 20),
        )
      } else {
        menu = menu.filter((r) => r.temps_min == null || r.temps_min <= tempsMax)
      }
      if (menu.length === 0) {
        setError('Aucune recette ne respecte la contrainte de temps. Réessaie ou augmente le temps.')
      } else if (!muted) {
        playCollect()
      }
      setRecettes(menu)
    } catch (e) {
      setError(e.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <h2 className="font-display text-xl font-800 text-slate-800">
            Qu'est-ce qu'on cuisine ?
          </h2>
          <p className="text-xs font-700 text-slate-400">
            {recettes.length > 0
              ? `${cuisinables} plat${cuisinables > 1 ? 's' : ''} prêt${cuisinables > 1 ? 's' : ''} · ${recettes.length} idées`
              : 'Le chef pioche dans ton frigo'}
          </p>
        </div>
        <button
          onClick={() => handleGenerer()}
          disabled={loading}
          className="flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 font-display text-base font-800 text-white shadow-chunky transition hover:bg-emerald-500 active:translate-y-0.5 disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="inline-block animate-wiggle text-xl">🍳</span>
              Le chef réfléchit…
            </>
          ) : (
            <>
              <span className="text-xl">✨</span>
              {recettes.length > 0 ? 'Régénérer' : 'Générer le menu'}
            </>
          )}
        </button>
      </div>

      {/* Paramètres de génération */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-white bg-white/70 p-3 shadow-tile">
        <div className="flex min-w-[220px] flex-1 items-center gap-3">
          <span className="text-xl">⏱</span>
          <div className="flex-1">
            <div className="flex items-center justify-between font-display text-sm font-800 text-slate-700">
              <span>Temps de prépa max</span>
              <span className={express ? 'text-slate-300 line-through' : 'text-emerald-600'}>
                {tempsMax} min
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={tempsMax}
              disabled={express}
              onChange={(e) => setTempsMax(Number(e.target.value))}
              className="mt-1 w-full accent-emerald-400 disabled:opacity-40"
            />
          </div>
        </div>

        <button
          onClick={() => {
            const next = !express
            setExpress(next)
            handleGenerer({ express: next })
          }}
          disabled={loading}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 font-display text-sm font-800 shadow-chunky transition active:translate-y-0.5 disabled:opacity-60 ${
            express
              ? 'bg-amber-400 text-white'
              : 'bg-white text-slate-600 hover:bg-amber-50'
          }`}
        >
          <span className="text-lg">⚡</span>
          J'ai 20 min
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-3 font-body text-sm font-700 text-rose-600">
          ⚠️ {error}
        </div>
      )}

      {loading && recettes.length === 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border-2 border-white bg-white/60"
            />
          ))}
        </div>
      )}

      {!loading && recettes.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white bg-white/50 py-14 text-center">
          <span className="text-5xl">👨‍🍳</span>
          <p className="mt-2 px-6 font-display text-base font-800 text-slate-500">
            Appuie sur « Générer le menu » pour voir ce que ton frigo permet.
          </p>
        </div>
      )}

      {recettes.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-2.5">
            {recettes.map((r) => (
              <RecipeCard key={r.id} recette={r} />
            ))}
          </div>

          <aside className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="text-2xl">🧾</span>
              <div>
                <h3 className="font-display text-lg font-800 leading-none text-slate-700">
                  Liste de courses
                </h3>
                <p className="text-[11px] font-700 uppercase tracking-wide text-slate-400">
                  Ce qui débloque le plus de plats
                </p>
              </div>
            </div>
            <ShoppingList courses={courses} />
          </aside>
        </div>
      )}
    </div>
  )
}

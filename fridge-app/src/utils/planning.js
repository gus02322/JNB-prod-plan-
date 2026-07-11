// Planning hebdo + mise à l'échelle des recettes selon les convives,
// et logique de consommation du frigo ("j'ai cuisiné").

export const JOURS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
]

// Modèle repas : { type:"dej"|"diner", convives:int, recette?, cuisine?:bool }
export const REPAS = [
  { type: 'dej', label: 'Déjeuner', emoji: '☀️' },
  { type: 'diner', label: 'Dîner', emoji: '🌙' },
]

// Semaine courante (lundi → dimanche). Jour : { date, jour, repas:[...] }
export function initWeek(base = new Date()) {
  const day = base.getDay() // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(base)
  monday.setDate(base.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  return JOURS.map((jour, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      date: d.toISOString().slice(0, 10),
      jour,
      repas: REPAS.map((r) => ({
        type: r.type,
        convives: 2,
        recette: null,
        cuisine: false,
      })),
    }
  })
}

export function formatShort(dateISO) {
  const [, m, d] = dateISO.split('-')
  return `${d}/${m}`
}

// Normalisation de nom pour matcher ingrédient IA ↔ item du frigo.
export function normNom(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .toLowerCase()
    .trim()
}

// Facteur d'échelle : convives / portions de base de la recette.
export function facteur(recette, convives) {
  const base =
    recette?.portions_base && recette.portions_base > 0
      ? recette.portions_base
      : 2
  return convives / base
}

// Met une recette à l'échelle d'un nombre de convives (unités ludiques).
export function scaleRecette(recette, convives) {
  const f = facteur(recette, convives)
  return {
    ...recette,
    portions: convives,
    ingredients: recette.ingredients.map((ing) =>
      ing.quantite == null
        ? { ...ing } // niveau (peu/moyen/beaucoup) : pas de calcul numérique
        : { ...ing, quantite: Math.max(1, Math.round(ing.quantite * f)) },
    ),
  }
}

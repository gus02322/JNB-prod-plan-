// Système de points LUDIQUE et de RÉCOMPENSE (jamais punitif).
// On note l'ÉQUILIBRE et la VARIÉTÉ d'un repas / d'une journée / du frigo,
// jamais les aliments un par un. On récompense la diversité, on ne punit
// aucun "mauvais" aliment. Tous les libellés restent encourageants.

import { CATALOG } from '../data/catalog'
import { normNom } from './planning'

// nom d'ingrédient → catégorie du catalogue (matching insensible aux accents).
const NOM_TO_CAT = {}
CATALOG.forEach((c) => c.items.forEach((it) => (NOM_TO_CAT[normNom(it.nom)] = c.id)))

const VEGETAL = new Set(['legumes', 'fruits'])
const PROTEINE = new Set(['proteines', 'laitier'])
const LIPIDE = new Set(['condiments', 'laitier'])

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)))

function paliers(v) {
  if (v >= 80) return { label: 'Équilibré', emoji: '🌈' }
  if (v >= 60) return { label: 'Bien joué', emoji: '💪' }
  if (v >= 40) return { label: 'Ça marche', emoji: '🙂' }
  return { label: 'À compléter', emoji: '✨' } // invite, ne culpabilise pas
}

function catsOf(ingredients = []) {
  const set = new Set()
  ingredients.forEach((i) => {
    const c = NOM_TO_CAT[normNom(i.nom)]
    if (c) set.add(c)
  })
  return set
}

// Score d'un repas : combo légumes + protéines + bons lipides + variété.
export function scoreMeal(recette) {
  if (!recette) return null
  const ings = recette.ingredients || []
  const cats = catsOf(ings)
  const some = (grp) => [...cats].some((c) => grp.has(c))

  const hasVeg = some(VEGETAL)
  const hasProt = some(PROTEINE) || recette.proteines >= 12
  const hasLip = some(LIPIDE) || recette.lipides >= 8

  let v = 35
  if (hasVeg) v += 18
  if (hasProt) v += 18
  if (hasLip) v += 12
  v += Math.min(17, ings.length * 3) // variété d'ingrédients
  v = clamp(v)
  return { value: v, ...paliers(v) }
}

// Score d'une journée : moyenne des repas + bonus de variété entre repas.
export function scoreDay(recettes) {
  const list = (recettes || []).filter(Boolean)
  if (list.length === 0) return null
  const meals = list.map(scoreMeal)
  const avg = meals.reduce((s, m) => s + m.value, 0) / meals.length
  const cats = new Set()
  list.forEach((r) => catsOf(r.ingredients).forEach((c) => cats.add(c)))
  const v = clamp(avg + Math.min(15, cats.size * 3))
  return { value: v, ...paliers(v) }
}

// Score du frigo : un frigo mono-catégorie marque peu (on ne peut rien en
// faire d'équilibré) ; la diversité + les 3 familles rapportent gros.
export function scoreFridge(items) {
  const list = items || []
  if (list.length === 0) return { value: 0, label: 'Frigo vide', emoji: '🫙' }
  const cats = new Set(list.map((i) => i.categorie))
  const some = (grp) => [...cats].some((c) => grp.has(c))

  let v = 25
  v += Math.min(24, cats.size * 8)
  if (some(VEGETAL)) v += 15
  if (some(PROTEINE)) v += 18
  if (some(LIPIDE)) v += 13
  v = clamp(v)

  const label =
    v >= 80
      ? { label: 'Frigo au top', emoji: '🧺' }
      : v >= 55
        ? { label: 'Belle variété', emoji: '🥗' }
        : v >= 30
          ? { label: 'Bon début', emoji: '🌱' }
          : { label: 'Ajoute de la variété', emoji: '✨' }
  return { value: v, ...label }
}

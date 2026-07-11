// Traitement des recettes renvoyées par l'IA : normalisation, tri par
// niveau de déblocage, et déduction de la liste de courses.

// État de déblocage façon jeu, par niveau.
export const NIVEAU_META = {
  cuisinable: { rang: 0, label: 'Prêt', emoji: '🍳', tint: 'emerald' },
  presque: { rang: 1, label: 'À un pas', emoji: '🔓', tint: 'amber' },
  ambitieuse: { rang: 2, label: 'Verrouillé', emoji: '🔒', tint: 'slate' },
}

// Normalise une recette brute et RECALCULE son niveau à partir des
// ingrédients manquants — on ne fait jamais confiance au libellé de l'IA.
export function normalizeRecette(r, index) {
  const ingredients = (Array.isArray(r?.ingredients) ? r.ingredients : [])
    .map((i) => ({
      nom: String(i?.nom ?? '').trim(),
      quantite: i?.quantite ?? null,
      unite: String(i?.unite ?? '').trim(),
      present: i?.present === true,
    }))
    .filter((i) => i.nom)

  const manquants = ingredients.filter((i) => !i.present).length
  const niveau =
    manquants === 0 ? 'cuisinable' : manquants === 1 ? 'presque' : 'ambitieuse'

  return {
    id: `${index}-${String(r?.titre ?? '').slice(0, 24)}`,
    titre: String(r?.titre ?? 'Recette sans nom').trim(),
    niveau,
    manquants,
    ingredients,
    etapes: (Array.isArray(r?.etapes) ? r.etapes : []).map(String).filter(Boolean),
    temps_min: Number.isFinite(+r?.temps_min) ? +r.temps_min : null,
    portions_base: Number.isFinite(+r?.portions_base) ? +r.portions_base : null,
    // Nutrition estimée par portion (étape 4). Null si absent.
    calories: num(r?.calories),
    proteines: num(r?.proteines),
    lipides: num(r?.lipides),
    glucides: num(r?.glucides),
  }
}

const num = (v) => (Number.isFinite(+v) && v != null && v !== '' ? Math.round(+v) : null)

// Recettes triées : cuisinable en haut, puis presque, puis ambitieuse.
export function normalizeMenu(recettesBrutes) {
  return recettesBrutes
    .map(normalizeRecette)
    .filter((r) => r.ingredients.length > 0)
    .sort(
      (a, b) =>
        NIVEAU_META[a.niveau].rang - NIVEAU_META[b.niveau].rang ||
        a.manquants - b.manquants ||
        (a.temps_min ?? 999) - (b.temps_min ?? 999),
    )
}

// Liste de courses : agrège tous les ingrédients manquants et compte,
// pour chacun, combien de plats il débloque. Trié par plats débloqués.
export function buildListeCourses(recettes) {
  const map = new Map()
  for (const r of recettes) {
    for (const ing of r.ingredients) {
      if (ing.present) continue
      const key = ing.nom.toLowerCase()
      if (!map.has(key)) {
        map.set(key, { nom: ing.nom, unite: ing.unite, plats: [] })
      }
      map.get(key).plats.push(r.titre)
    }
  }
  return [...map.values()]
    .map((e) => ({ ...e, count: e.plats.length }))
    .sort((a, b) => b.count - a.count || a.nom.localeCompare(b.nom))
}

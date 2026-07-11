// Besoin calorique quotidien (Mifflin-St Jeor) + couverture d'un repas.
// Estimations ludiques — pas un conseil médical ni un régime.

export const SEXES = [
  { id: 'femme', label: 'Femme' },
  { id: 'homme', label: 'Homme' },
]

export const ACTIVITES = [
  { id: 'sedentaire', label: 'Sédentaire', emoji: '🛋️', facteur: 1.2 },
  { id: 'actif', label: 'Actif', emoji: '🚶', facteur: 1.55 },
  { id: 'sportif', label: 'Sportif', emoji: '🏃', facteur: 1.725 },
]

// Mifflin-St Jeor : BMR = 10·poids(kg) + 6.25·taille(cm) − 5·âge + s
//   s = +5 (homme) / −161 (femme). Besoin = BMR × facteur d'activité.
export function besoinCalorique(profil) {
  if (!profil) return null
  const { sexe, age, poids, taille, activite } = profil
  if (!(age > 0) || !(poids > 0) || !(taille > 0)) return null
  const s = sexe === 'homme' ? 5 : -161
  const bmr = 10 * poids + 6.25 * taille - 5 * age + s
  const facteur = ACTIVITES.find((a) => a.id === activite)?.facteur ?? 1.2
  return Math.round(bmr * facteur)
}

// % du besoin quotidien couvert par un repas (calories par portion).
export function couverture(calories, besoin) {
  if (!(calories > 0) || !(besoin > 0)) return null
  return Math.round((calories / besoin) * 100)
}

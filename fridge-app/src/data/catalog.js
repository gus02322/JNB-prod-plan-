// ─────────────────────────────────────────────────────────────
//  Modèle de données central — réutilisé aux étapes 2 & 3.
//
//  Item : { id, nom, categorie, zone, type, quantite, unite, peremption?, present? }
//    zone   : "frigo" | "sec" | "epices"
//    type   : "tracke"  -> la quantité compte (débloque les plats plus tard)
//             "staple"  -> présence seule (booléen `present` : j'en ai / j'en ai plus)
//    unite  : unités "grosses" et ludiques uniquement :
//             "pièce" | "portion" | "paquet" | "niveau"
//             ("niveau" = échelle peu / moyen / beaucoup, jamais de grammes)
//
//  `peremption` et `present` sont optionnels selon le type d'item.
// ─────────────────────────────────────────────────────────────

export const ZONES = [
  { id: 'frigo', nom: 'Frigo', emoji: '🧊', color: 'frigo', hint: 'Frais & périssable' },
  { id: 'sec', nom: 'Placard sec', emoji: '🏺', color: 'sec', hint: 'Ça se garde' },
  { id: 'epices', nom: 'Épices', emoji: '🧂', color: 'epices', hint: 'Le goût en plus' },
]

// Échelle ludique pour l'unité "niveau"
export const NIVEAUX = ['peu', 'moyen', 'beaucoup']

// Catégories du "menu d'ajout" façon petit jeu.
// Chaque catégorie porte une couleur d'accent + un emoji de rayon.
export const CATEGORIES = [
  { id: 'legumes', nom: 'Légumes', emoji: '🥬', accent: '#7bc86c' },
  { id: 'fruits', nom: 'Fruits', emoji: '🍎', accent: '#f0787a' },
  { id: 'proteines', nom: 'Protéines', emoji: '🍗', accent: '#e8925b' },
  { id: 'laitier', nom: 'Crèmerie', emoji: '🧀', accent: '#f2c94c' },
  { id: 'feculents', nom: 'Féculents', emoji: '🍝', accent: '#d9a066' },
  { id: 'condiments', nom: 'Condiments', emoji: '🫙', accent: '#c98bdb' },
  { id: 'aromates', nom: 'Épices & herbes', emoji: '🌿', accent: '#6fcf97' },
]

// Catalogue des items disponibles à l'ajout.
// `template` = valeurs par défaut d'un item quand on le collecte.
export const CATALOG = [
  // ── Légumes (frigo, tracké, à la pièce) ──
  cat('legumes', [
    it('tomate', 'Tomate', '🍅', 'frigo', 'tracke', 'pièce'),
    it('carotte', 'Carotte', '🥕', 'frigo', 'tracke', 'pièce'),
    it('salade', 'Salade', '🥬', 'frigo', 'tracke', 'pièce'),
    it('poivron', 'Poivron', '🫑', 'frigo', 'tracke', 'pièce'),
    it('courgette', 'Courgette', '🥒', 'frigo', 'tracke', 'pièce'),
    it('oignon', 'Oignon', '🧅', 'sec', 'tracke', 'pièce'),
    it('champignon', 'Champignons', '🍄', 'frigo', 'tracke', 'niveau'),
    it('brocoli', 'Brocoli', '🥦', 'frigo', 'tracke', 'pièce'),
  ]),

  // ── Fruits (frigo / sec, tracké) ──
  cat('fruits', [
    it('pomme', 'Pomme', '🍎', 'sec', 'tracke', 'pièce'),
    it('banane', 'Banane', '🍌', 'sec', 'tracke', 'pièce'),
    it('citron', 'Citron', '🍋', 'frigo', 'tracke', 'pièce'),
    it('orange', 'Orange', '🍊', 'sec', 'tracke', 'pièce'),
    it('fraise', 'Fraises', '🍓', 'frigo', 'tracke', 'niveau'),
    it('avocat', 'Avocat', '🥑', 'frigo', 'tracke', 'pièce'),
  ]),

  // ── Protéines (frigo, tracké) ──
  cat('proteines', [
    it('oeuf', 'Œufs', '🥚', 'frigo', 'tracke', 'pièce'),
    it('poulet', 'Poulet', '🍗', 'frigo', 'tracke', 'portion'),
    it('boeuf', 'Bœuf', '🥩', 'frigo', 'tracke', 'portion'),
    it('poisson', 'Poisson', '🐟', 'frigo', 'tracke', 'portion'),
    it('tofu', 'Tofu', '🧊', 'frigo', 'tracke', 'paquet'),
    it('jambon', 'Jambon', '🥓', 'frigo', 'tracke', 'paquet'),
  ]),

  // ── Crèmerie (frigo) ──
  cat('laitier', [
    it('lait', 'Lait', '🥛', 'frigo', 'tracke', 'paquet'),
    it('beurre', 'Beurre', '🧈', 'frigo', 'staple'),
    it('fromage', 'Fromage', '🧀', 'frigo', 'tracke', 'niveau'),
    it('yaourt', 'Yaourt', '🍶', 'frigo', 'tracke', 'pièce'),
    it('creme', 'Crème', '🥛', 'frigo', 'staple'),
  ]),

  // ── Féculents (placard sec, tracké) ──
  cat('feculents', [
    it('pates', 'Pâtes', '🍝', 'sec', 'tracke', 'paquet'),
    it('riz', 'Riz', '🍚', 'sec', 'tracke', 'paquet'),
    it('farine', 'Farine', '🌾', 'sec', 'tracke', 'paquet'),
    it('pain', 'Pain', '🍞', 'sec', 'tracke', 'pièce'),
    it('patate', 'Pommes de terre', '🥔', 'sec', 'tracke', 'niveau'),
    it('lentilles', 'Lentilles', '🫘', 'sec', 'tracke', 'paquet'),
  ]),

  // ── Condiments (sec / frigo, staple : présence seule) ──
  cat('condiments', [
    it('huile', "Huile d'olive", '🫒', 'sec', 'staple'),
    it('vinaigre', 'Vinaigre', '🧴', 'sec', 'staple'),
    it('moutarde', 'Moutarde', '🟡', 'frigo', 'staple'),
    it('ketchup', 'Ketchup', '🍅', 'frigo', 'staple'),
    it('soja', 'Sauce soja', '🫗', 'sec', 'staple'),
    it('miel', 'Miel', '🍯', 'sec', 'staple'),
  ]),

  // ── Épices & herbes (épices, staple) ──
  cat('aromates', [
    it('sel', 'Sel', '🧂', 'epices', 'staple'),
    it('poivre', 'Poivre', '⚫', 'epices', 'staple'),
    it('cumin', 'Cumin', '🟤', 'epices', 'staple'),
    it('paprika', 'Paprika', '🔴', 'epices', 'staple'),
    it('curry', 'Curry', '🟠', 'epices', 'staple'),
    it('herbes', 'Herbes de Provence', '🌿', 'epices', 'staple'),
    it('ail', 'Ail', '🧄', 'epices', 'staple'),
    it('basilic', 'Basilic', '🌱', 'epices', 'staple'),
  ]),
]

// ── helpers de construction ──
function cat(id, items) {
  const meta = CATEGORIES.find((c) => c.id === id)
  return { ...meta, items }
}

function it(id, nom, icon, zone, type, unite = null) {
  return { id, nom, icon, zone, type, unite }
}

// Index plat { "categorie/itemId": template } pour retrouver un item vite fait.
export const CATALOG_INDEX = CATALOG.reduce((acc, c) => {
  c.items.forEach((i) => {
    acc[`${c.id}/${i.id}`] = { ...i, categorie: c.id }
  })
  return acc
}, {})

export function findZone(zoneId) {
  return ZONES.find((z) => z.id === zoneId)
}

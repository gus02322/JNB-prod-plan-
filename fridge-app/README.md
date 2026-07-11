# Frigo virtuel 🧊 — App complète (3 / 3)

Un frigo virtuel gamifié pour cuisiner.
**Étape 1 : l'inventaire. Étape 2 : le menu par IA. Étape 3 : planning & cuisine.**
React + Vite + Tailwind, état React + `localStorage`, pas de backend applicatif.

## Lancer

```bash
cd fridge-app
npm install
npm run dev
```

Pour l'étape 2, la clé Anthropic n'est **jamais** exposée au navigateur : le
front appelle un chemin relatif `/v1/messages`, et le proxy de dev de Vite
(`vite.config.js`) y injecte `x-api-key` côté serveur depuis
`ANTHROPIC_API_KEY`. Rien à saisir dans l'UI.

```bash
export ANTHROPIC_API_KEY=sk-...   # lu par le proxy de dev, jamais bundlé
npm run dev
```

## Ce que contient l'étape 1

- **3 zones** d'inventaire : Frigo, Placard sec, Épices.
- **Ajout façon petit jeu** : catégorie → item → quantité, avec feedback
  « collecté » satisfaisant (anneau qui éclate, `+n` qui flotte, petit son,
  compteur qui monte).
- Items **`tracké`** : la quantité compte (stepper `+ / −` ou niveau
  peu/moyen/beaucoup). Items **`staple`** : présence seule (toggle
  « j'en ai / j'en ai plus »).
- **Persistance** `localStorage`.

## Ce que contient l'étape 2

- Onglet **Cuisine** : bouton « Générer le menu » qui envoie l'inventaire à
  l'API Anthropic (`POST /v1/messages`, modèle `claude-sonnet-4-6`).
- **Règles strictes** : l'IA répond uniquement en JSON structuré (parsé en
  sécurité, jamais de confiance aveugle), pioche uniquement dans les
  ingrédients présents, et classe chaque recette en 3 niveaux :
  `cuisinable` (0 manquant), `presque` (1 manquant), `ambitieuse` (2+).
  Le niveau est **recalculé côté client** à partir des ingrédients manquants.
- **Recettes triées** par niveau (cuisinable en haut) avec un état de
  déblocage visuel type jeu : prêt 🍳 / à un pas 🔓 / verrouillé 🔒.
- **Liste de courses déduite** : agrège les ingrédients manquants et indique,
  pour chacun, combien de plats il débloque (« Achète du lait de coco →
  débloque 3 plats »), triée par plats débloqués.
- Dernier menu persisté dans `localStorage`.

Fichiers clés : `src/api/anthropic.js` (appel + parse sécurisé),
`src/utils/menu.js` (normalisation, tri, liste de courses),
`src/components/{MenuView,RecipeCard,ShoppingList}.jsx`.

## Ce que contient l'étape 3

- **Paramètres de génération** envoyés à l'IA en plus de l'inventaire :
  curseur de **temps de prépa max** (minutes) et **mode express**
  (« ⚡ J'ai 20 min ») qui force `temps_min <= 20` et niveau `cuisinable`
  (contrainte appliquée aussi en garde-fou côté client).
- **Planning hebdo** (onglet Semaine) : 7 jours, 2 repas/jour, avec un
  nombre de **convives réglable par repas**. Modèle
  `Jour : { date, jour, repas:[{ type:"dej"|"diner", convives, recette?, cuisine? }] }`.
- **Calendrier** : chaque repas affiche le plat assigné et ses quantités
  **mises à l'échelle** selon les convives (`convives / portions_base`).
- **Boucle « J'ai cuisiné »** : décrémente automatiquement du frigo les
  ingrédients **trackés** consommés (les **staples** ne bougent pas), avec
  un petit feedback de jeu (burst + son). Le stock diminue dans l'onglet Frigo.

Fichiers clés étape 3 : `src/utils/planning.js` (semaine, mise à l'échelle,
consommation), `src/components/WeekView.jsx`.

## Modèle de données (réutilisé sur les 3 étapes)

```
Item : { id, nom, categorie, zone, type, quantite, unite, peremption?, present? }
  zone  : "frigo" | "sec" | "epices"
  type  : "tracke" (quantité) | "staple" (présence booléenne `present`)
  unite : "pièce" | "portion" | "paquet" | "niveau"   // jamais de grammes
```

Le catalogue (catégories + items) vit dans `src/data/catalog.js`.

## Sprites

Tout le visuel d'un item passe par **un seul composant** :
`src/components/ItemSprite.jsx` (emoji + tuile colorée par catégorie
pour l'instant). Les sprites isométriques par catégorie se brancheront
ici via `SPRITE_SOURCES`, sans toucher au reste de l'app.

# Frigo virtuel 🧊 — Étape 1 / 3

Un frigo virtuel gamifié pour cuisiner. **Étape 1 : l'inventaire.**
React + Vite + Tailwind, 100 % local (état React + `localStorage`, pas de backend).

## Lancer

```bash
cd fridge-app
npm install
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

## Modèle de données (réutilisé aux étapes 2 & 3)

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

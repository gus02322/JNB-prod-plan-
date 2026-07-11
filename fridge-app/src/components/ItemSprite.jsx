import { CATEGORIES } from '../data/catalog'

// ─────────────────────────────────────────────────────────────
//  <ItemSprite /> — point d'entrée UNIQUE pour le visuel d'un item.
//
//  Pour l'instant : un emoji posé sur une tuile colorée par catégorie.
//  Plus tard (étapes suivantes) : brancher ici des sprites isométriques
//  par catégorie sans toucher au reste de l'app. Il suffira de remplir
//  SPRITE_SOURCES puis de rendre <img>/<canvas> à la place de l'emoji.
//
//  Toute l'app passe par ce composant — ne pas rendre d'emoji ailleurs.
// ─────────────────────────────────────────────────────────────

// Emplacement futur des sprites isométriques, indexés par catégorie.
// Ex. plus tard : { legumes: '/sprites/iso/legumes.png', ... }
const SPRITE_SOURCES = {
  // legumes: null, fruits: null, ...  (à remplir à l'étape sprites)
}

const SIZES = {
  sm: 'w-9 h-9 text-xl rounded-lg',
  md: 'w-14 h-14 text-3xl rounded-2xl',
  lg: 'w-20 h-20 text-5xl rounded-3xl',
}

function accentFor(categorie) {
  return CATEGORIES.find((c) => c.id === categorie)?.accent ?? '#cbd5e1'
}

export default function ItemSprite({
  categorie,
  icon = '📦',
  size = 'md',
  className = '',
  animate = false,
}) {
  const accent = accentFor(categorie)
  const sprite = SPRITE_SOURCES[categorie]

  return (
    <span
      className={`relative inline-flex select-none items-center justify-center ${SIZES[size]} ${className}`}
      style={{
        background: `linear-gradient(160deg, ${accent}33, ${accent}14)`,
        boxShadow: `inset 0 0 0 2px ${accent}55`,
      }}
      aria-hidden="true"
    >
      {sprite ? (
        // Chemin futur : sprite isométrique par catégorie.
        <img src={sprite} alt="" className="h-full w-full object-contain p-1" />
      ) : (
        <span className={animate ? 'animate-wiggle' : ''}>{icon}</span>
      )}
    </span>
  )
}

// Affichage nutrition d'une recette : calories + macros, PAR PORTION.
// Indicatif — pas un suivi médical.
export default function Macros({ recette, className = '' }) {
  if (recette?.calories == null) return null
  const macro = (val, label, tint) =>
    val == null ? null : (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-800 ${tint}`}>
        {label} {val}g
      </span>
    )

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="rounded-full bg-orange-100 px-2 py-0.5 font-display text-[11px] font-800 text-orange-600">
        {recette.calories} kcal
      </span>
      {macro(recette.proteines, 'P', 'bg-rose-50 text-rose-500')}
      {macro(recette.lipides, 'L', 'bg-amber-50 text-amber-600')}
      {macro(recette.glucides, 'G', 'bg-sky-50 text-sky-500')}
      <span className="text-[10px] font-700 text-slate-300">/ portion</span>
    </div>
  )
}

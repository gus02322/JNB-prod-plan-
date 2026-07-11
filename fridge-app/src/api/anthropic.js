// ─────────────────────────────────────────────────────────────
//  Génération de menu par IA — API Anthropic (POST /v1/messages).
//
//  La clé n'est jamais passée ici : la requête part vers un chemin
//  relatif proxyé par le serveur de dev (voir vite.config.js), qui
//  injecte `x-api-key` côté serveur. Rien à configurer côté front.
//
//  L'IA reçoit l'inventaire en JSON et répond UNIQUEMENT en JSON.
//  On parse la réponse en sécurité (jamais de confiance aveugle).
// ─────────────────────────────────────────────────────────────

const ENDPOINT = import.meta.env.VITE_ANTHROPIC_URL || '/v1/messages'
const MODEL = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `Tu es le chef d'un jeu de cuisine. On te donne l'inventaire d'un frigo en JSON.

RÈGLES STRICTES :
- Tu réponds UNIQUEMENT avec un objet JSON valide. Aucun texte, aucune explication, aucun markdown, aucune balise de code.
- Tu ne piocheras QUE dans les ingrédients réellement présents dans l'inventaire fourni. Un ingrédient absent de l'inventaire est "manquant".
- Pour chaque recette, marque chaque ingrédient avec present:true (dans l'inventaire) ou present:false (à acheter).
- Classe chaque recette selon le nombre d'ingrédients manquants :
  - "cuisinable" : 0 ingrédient manquant.
  - "presque"    : exactement 1 ingrédient manquant.
  - "ambitieuse" : 2 ingrédients manquants ou plus.
- Unités ludiques uniquement : "pièce", "portion", "paquet", ou un niveau "peu"/"moyen"/"beaucoup". Jamais de grammes précis.
- Estime aussi la valeur nutritionnelle approximative PAR PORTION : calories (kcal), proteines (g), lipides (g), glucides (g). Valeurs entières, réalistes.
- Propose 6 à 8 recettes variées, avec un mélange des trois niveaux (au moins 1 ou 2 "cuisinable").

FORMAT EXACT (réponds avec cet objet et rien d'autre) :
{
  "recettes": [
    {
      "titre": "string",
      "niveau": "cuisinable" | "presque" | "ambitieuse",
      "ingredients": [
        { "nom": "string", "quantite": 1, "unite": "pièce", "present": true }
      ],
      "etapes": ["string", "string"],
      "temps_min": 20,
      "portions_base": 2,
      "calories": 450,
      "proteines": 30,
      "lipides": 15,
      "glucides": 40
    }
  ]
}`

// Réduit l'inventaire à ce que l'IA a besoin de savoir : ce qui est présent.
function toPayload(items) {
  return items
    .filter((it) => (it.type === 'staple' ? it.present !== false : (it.quantite ?? 0) > 0))
    .map((it) => ({
      nom: it.nom,
      categorie: it.categorie,
      zone: it.zone,
      type: it.type,
      ...(it.type === 'staple'
        ? { present: true }
        : { quantite: it.quantite, unite: it.unite }),
    }))
}

// Extraction JSON défensive : retire d'éventuelles fences, isole l'objet.
function safeParseJson(text) {
  if (!text || typeof text !== 'string') throw new Error('Réponse vide')
  let t = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Aucun JSON dans la réponse')
  return JSON.parse(t.slice(start, end + 1))
}

// Contraintes de génération → instructions supplémentaires pour l'IA.
function contraintesText({ tempsMax, express }) {
  const c = []
  if (express) {
    c.push(
      'Mode EXPRESS : propose UNIQUEMENT des recettes de niveau "cuisinable" (0 ingrédient manquant) avec temps_min <= 20 minutes.',
    )
  } else if (tempsMax) {
    c.push(`Chaque recette doit avoir temps_min <= ${tempsMax} minutes.`)
  }
  return c.length ? `\n\nContraintes supplémentaires :\n- ${c.join('\n- ')}` : ''
}

// Appelle l'IA et renvoie le tableau brut de recettes (non normalisé).
// options : { tempsMax?:number, express?:boolean }
export async function genererMenu(items, options = {}) {
  const inventaire = toPayload(items)
  if (inventaire.length === 0) {
    throw new Error('Frigo vide — ajoute des ingrédients avant de cuisiner !')
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Voici mon inventaire :\n${JSON.stringify(inventaire)}${contraintesText(options)}\n\nGénère le menu en JSON.`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Erreur API (${res.status}). ${detail.slice(0, 160)}`)
  }

  const data = await res.json()
  const text = Array.isArray(data.content)
    ? data.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
    : ''

  const parsed = safeParseJson(text)
  const recettes = Array.isArray(parsed.recettes) ? parsed.recettes : []
  if (recettes.length === 0) throw new Error('Aucune recette générée')
  return recettes
}

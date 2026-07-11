// Petit "son visuel" de collecte via WebAudio — un blip discret facultatif.
// Aucune dépendance, aucun fichier audio : synthèse à la volée.
// Se désactive proprement si l'AudioContext n'est pas dispo.

let ctx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

// Un petit "pop" montant qui fait plaisir.
export function playCollect() {
  const ac = getCtx()
  if (!ac) return
  try {
    if (ac.state === 'suspended') ac.resume()
    const now = ac.currentTime
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(520, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
    osc.connect(gain).connect(ac.destination)
    osc.start(now)
    osc.stop(now + 0.24)
  } catch {
    // silencieux
  }
}

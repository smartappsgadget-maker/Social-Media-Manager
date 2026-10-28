// Matchday & Squad Local Persistence Service
// Allows managing the entire season journey by journey (Jornada 1, 2, 3, 4, 5...)
// Preserves player portraits across all matchdays so photos are only uploaded once!
// Each matchday stores its own Lineup Template, 11 Starters, 7 Subs, Result Template, and Score/Scorers.

const SQUAD_STORAGE_KEY = 'gral_squad_roster_v1'
const MATCHDAYS_STORAGE_KEY = 'gral_season_matchdays_v3'
const ACTIVE_MATCHDAY_KEY = 'gral_active_matchday_id_v3'

// Default initial matchday (Jornada 4) with official squad roster
export const INITIAL_MATCHDAY_4 = {
  id: 'jornada-4',
  roundNumber: '4ª',
  isHome: true,
  opponentName: 'G.R.A.L.',
  date: 'HOJE',
  venue: 'CAMPO DE JOGOS',
  lineupBgImage: '/template_onze_inicial.jpg',
  resultBgImage: null,
  starters: Array.from({ length: 11 }, () => ({ number: '', name: '', isCaptain: false })),
  substitutes: Array.from({ length: 7 }, () => ({ number: '', name: '' })),
  result: {
    myScore: 0,
    opponentScore: 0,
    status: 'FINAL',
    penaltyMyScore: '',
    penaltyOpponentScore: '',
    scorers: []
  },
  createdAt: new Date().toISOString()
}

// Sanitize matchday object ensuring all fields exist
export function sanitizeMatchday(m) {
  if (!m) return INITIAL_MATCHDAY_4
  return {
    id: m.id || `jornada-${Date.now().toString(36)}`,
    roundNumber: m.roundNumber || '4ª',
    isHome: m.isHome !== false,
    opponentName: m.opponentName || '',
    date: m.date || 'HOJE',
    venue: m.venue || 'CAMPO DE JOGOS',
    lineupBgImage: m.lineupBgImage !== undefined 
      ? m.lineupBgImage 
      : (m.id === 'jornada-4' ? '/template_onze_inicial.jpg' : null),
    resultBgImage: m.resultBgImage !== undefined 
      ? m.resultBgImage 
      : null,
    starters: Array.isArray(m.starters) && m.starters.length === 11 
      ? m.starters 
      : Array.from({ length: 11 }, () => ({ number: '', name: '', isCaptain: false })),
    substitutes: Array.isArray(m.substitutes) && m.substitutes.length === 7 
      ? m.substitutes 
      : Array.from({ length: 7 }, () => ({ number: '', name: '' })),
    result: m.result && typeof m.result === 'object' ? m.result : {
      myScore: 0,
      opponentScore: 0,
      status: 'FINAL',
      penaltyMyScore: '',
      penaltyOpponentScore: '',
      scorers: []
    },
    createdAt: m.createdAt || new Date().toISOString()
  }
}

// Load all saved matchdays from local storage
export function loadMatchdays() {
  try {
    const raw = localStorage.getItem(MATCHDAYS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(sanitizeMatchday)
      }
    }
    // Also try migrating from v2 if available
    const legacyV2 = localStorage.getItem('gral_season_matchdays_v2')
    if (legacyV2) {
      const parsedV2 = JSON.parse(legacyV2)
      if (Array.isArray(parsedV2) && parsedV2.length > 0) {
        const sanitized = parsedV2.map(sanitizeMatchday)
        saveAllMatchdays(sanitized)
        return sanitized
      }
    }
  } catch (err) {
    console.error('Error reading matchdays:', err)
  }
  return [INITIAL_MATCHDAY_4]
}

// Save all matchdays
export function saveAllMatchdays(matchdays) {
  try {
    localStorage.setItem(MATCHDAYS_STORAGE_KEY, JSON.stringify(matchdays))
  } catch (err) {
    console.error('Error saving matchdays:', err)
  }
}

// Get active matchday ID
export function getActiveMatchdayId() {
  try {
    return localStorage.getItem(ACTIVE_MATCHDAY_KEY) || 'jornada-4'
  } catch {
    return 'jornada-4'
  }
}

// Set active matchday ID
export function setActiveMatchdayId(id) {
  try {
    localStorage.setItem(ACTIVE_MATCHDAY_KEY, id)
  } catch {}
}

// Create a new matchday (e.g. 5ª Jornada)
export function createNewMatchday(roundNumber, isHome = true, opponentName = '') {
  const matchdays = loadMatchdays()
  const cleanNum = roundNumber.replace(/[^\d]/g, '') || String(matchdays.length + 1)
  const id = `jornada-${cleanNum}-${Date.now().toString(36)}`

  const newMatchday = {
    id,
    roundNumber: roundNumber.includes('ª') ? roundNumber : `${cleanNum}ª`,
    isHome,
    opponentName: opponentName || '',
    date: 'PRÓXIMO JOGO',
    venue: isHome ? 'CAMPO DE JOGOS' : 'CAMPO ADVERSÁRIO',
    lineupBgImage: null, // Ready for this jornada's specific template upload
    resultBgImage: null, // Ready for this jornada's specific result template upload
    starters: Array.from({ length: 11 }, () => ({ number: '', name: '', isCaptain: false })),
    substitutes: Array.from({ length: 7 }, () => ({ number: '', name: '' })),
    result: {
      myScore: 0,
      opponentScore: 0,
      status: 'FINAL',
      penaltyMyScore: '',
      penaltyOpponentScore: '',
      scorers: []
    },
    createdAt: new Date().toISOString()
  }

  const updatedList = [...matchdays, newMatchday]
  saveAllMatchdays(updatedList)
  setActiveMatchdayId(id)
  return newMatchday
}

// Delete a matchday
export function deleteMatchday(id) {
  const matchdays = loadMatchdays()
  if (matchdays.length <= 1) return matchdays // keep at least one

  const updated = matchdays.filter(m => m.id !== id)
  saveAllMatchdays(updated)
  setActiveMatchdayId(updated[0].id)
  return updated
}

// Load permanent squad photos map: { '1': dataUrl, '7': dataUrl, ... }
export function loadSquadPhotos() {
  try {
    const raw = localStorage.getItem(SQUAD_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading squad photos:', err)
  }
  return {}
}

// Save permanent squad photos map
export function saveSquadPhotos(photos) {
  try {
    localStorage.setItem(SQUAD_STORAGE_KEY, JSON.stringify(photos))
  } catch (err) {
    console.error('Error saving squad photos:', err)
  }
}

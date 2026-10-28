// Matchday & Squad Local Persistence Service
// Allows managing the entire season journey by journey (Jornada 1, 2, 3, 4, 5...)
// Preserves player portraits across all matchdays so photos are only uploaded once!

const SQUAD_STORAGE_KEY = 'gral_squad_roster_v1'
const MATCHDAYS_STORAGE_KEY = 'gral_season_matchdays_v1'
const ACTIVE_MATCHDAY_KEY = 'gral_active_matchday_id_v1'

// Default initial matchday (Jornada 4) with official squad roster
const INITIAL_MATCHDAY_4 = {
  id: 'jornada-4',
  roundNumber: '4ª',
  isHome: true,
  opponentName: 'G.R.A.L.',
  date: 'HOJE',
  venue: 'CAMPO DE JOGOS',
  coach: 'MISTER',
  starters: [
    { number: '31', name: 'JOÃO ANDREZO' },
    { number: '45', name: 'MIEIRO' },
    { number: '5', name: 'TAREMI' },
    { number: '6', name: 'CHICO' },
    { number: '7', name: 'CHICO CARVALHO' },
    { number: '8', name: 'GARCEZ' },
    { number: '9', name: 'ALAN' },
    { number: '10', name: 'CLAUDIO' },
    { number: '11', name: 'JOTA' },
    { number: '12', name: 'DUARTE' },
    { number: '14', name: 'DAVID' }
  ],
  substitutes: [
    { number: '16', name: 'DANIEL' },
    { number: '17', name: 'JOÃO' },
    { number: '18', name: 'LUIS MOREIRA' },
    { number: '19', name: 'WALDECK' },
    { number: '20', name: 'ZÉ' },
    { number: '21', name: 'SIMÃO' },
    { number: '22', name: 'GONÇALO' }
  ],
  createdAt: new Date().toISOString()
}

// Load all saved matchdays from local storage
export function loadMatchdays() {
  try {
    const raw = localStorage.getItem(MATCHDAYS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Auto-migrate if stored matchday still has old placeholder players (MIGUEL)
        if (parsed[0]?.starters?.[0]?.name === 'MIGUEL') {
          parsed[0].starters = INITIAL_MATCHDAY_4.starters
          parsed[0].substitutes = INITIAL_MATCHDAY_4.substitutes
          if (parsed[0].opponentName === 'ADVERSÁRIO') parsed[0].opponentName = 'G.R.A.L.'
          saveAllMatchdays(parsed)
        }
        return parsed
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

// Create a new matchday (e.g. 5ª Jornada) copying previous squad setup
export function createNewMatchday(roundNumber, isHome = true, opponentName = '', copyFromId = null) {
  const matchdays = loadMatchdays()
  const previous = copyFromId
    ? matchdays.find(m => m.id === copyFromId)
    : matchdays[matchdays.length - 1] || INITIAL_MATCHDAY_4

  const cleanNum = roundNumber.replace(/[^\d]/g, '') || String(matchdays.length + 1)
  const id = `jornada-${cleanNum}-${Date.now().toString(36)}`

  const newMatchday = {
    id,
    roundNumber: roundNumber.includes('ª') ? roundNumber : `${cleanNum}ª`,
    isHome,
    opponentName: opponentName || 'PRÓXIMO ADVERSÁRIO',
    date: 'PRÓXIMO JOGO',
    venue: isHome ? 'CAMPO DO G.R.A.L.' : 'CAMPO ADVERSÁRIO',
    coach: previous.coach || 'MISTER',
    starters: JSON.parse(JSON.stringify(previous.starters || INITIAL_MATCHDAY_4.starters)),
    substitutes: JSON.parse(JSON.stringify(previous.substitutes || INITIAL_MATCHDAY_4.substitutes)),
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

// Save squad photos (persists photos for player #1, #7 etc across the whole season!)
export function saveSquadPhotos(photosMap) {
  try {
    localStorage.setItem(SQUAD_STORAGE_KEY, JSON.stringify(photosMap))
  } catch (err) {
    // If quota exceeded due to large base64, warn in console
    console.warn('Storage limit warning for photos:', err)
  }
}

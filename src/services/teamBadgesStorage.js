// Team Badges & Opponent Database Service
// Our Club is permanently set to AD Guimarei
// Allows storing opponent emblems for the entire league so picking an opponent automatically loads their crest!

const LEAGUE_TEAMS_STORAGE_KEY = 'afast_league_teams_v1'
const MY_CLUB_STORAGE_KEY = 'afast_my_club_v1'

export const DEFAULT_MY_CLUB = {
  name: 'AD GUIMAREI',
  shortName: 'ADG',
  fullName: 'Associação Desportiva de Guimarei',
  crestUrl: null // will store AD Guimarei emblem
}

// Default known clubs in AFAST / Santo Tirso Concelhio
export const INITIAL_LEAGUE_TEAMS = [
  { id: 'tarrio', name: 'AD TARRIO', logoUrl: null },
  { id: 'candal', name: 'AR CANDAL', logoUrl: null },
  { id: 'roriz', name: 'AM RORIZ', logoUrl: null },
  { id: 'vila-nova', name: 'GD VILA NOVA', logoUrl: null },
  { id: 'areias', name: 'SC AREIAS', logoUrl: null },
  { id: 'rebordons', name: 'AD REBORDÕES', logoUrl: null },
  { id: 'vilarinho', name: 'FC VILARINHO', logoUrl: null },
  { id: 'couto-mineiro', name: 'GD COUTO MINEIRO', logoUrl: null }
]

// Load our club profile
export function loadMyClub() {
  try {
    const raw = localStorage.getItem(MY_CLUB_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading my club:', err)
  }
  return DEFAULT_MY_CLUB
}

// Save our club profile
export function saveMyClub(club) {
  try {
    localStorage.setItem(MY_CLUB_STORAGE_KEY, JSON.stringify(club))
  } catch (err) {}
}

// Load all opponent league teams
export function loadLeagueTeams() {
  try {
    const raw = localStorage.getItem(LEAGUE_TEAMS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Error reading league teams:', err)
  }
  return INITIAL_LEAGUE_TEAMS
}

// Save all opponent league teams
export function saveLeagueTeams(teams) {
  try {
    localStorage.setItem(LEAGUE_TEAMS_STORAGE_KEY, JSON.stringify(teams))
  } catch (err) {}
}

// Add or update an opponent team
export function upsertLeagueTeam(name, logoUrl) {
  const teams = loadLeagueTeams()
  const cleanName = name.trim().toUpperCase()
  const existingIdx = teams.findIndex(t => t.name.toUpperCase() === cleanName)

  if (existingIdx >= 0) {
    teams[existingIdx].logoUrl = logoUrl || teams[existingIdx].logoUrl
  } else {
    teams.push({
      id: 'team-' + Date.now().toString(36),
      name: cleanName,
      logoUrl
    })
  }

  saveLeagueTeams(teams)
  return teams
}

// Batch import opponent team crests from files (named by team name or code)
export function processOpponentEmblemsBatch(files, onComplete) {
  const teams = loadLeagueTeams()
  let processed = 0

  Array.from(files).forEach((file) => {
    // Clean name: e.g. "Tarrio.png" -> "AD TARRIO" or "TARRIO"
    const baseName = file.name.replace(/\.[^/.]+$/, '').trim().toUpperCase()
    const reader = new FileReader()

    reader.onload = (event) => {
      const dataUrl = event.target.result
      // Match existing team or add new
      const foundIdx = teams.findIndex(t => 
        t.name.toUpperCase().includes(baseName) || baseName.includes(t.name.toUpperCase())
      )

      if (foundIdx >= 0) {
        teams[foundIdx].logoUrl = dataUrl
      } else {
        teams.push({
          id: 'team-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4),
          name: baseName,
          logoUrl: dataUrl
        })
      }

      processed++
      if (processed === files.length) {
        saveLeagueTeams(teams)
        onComplete && onComplete(teams)
      }
    }

    reader.readAsDataURL(file)
  })
}

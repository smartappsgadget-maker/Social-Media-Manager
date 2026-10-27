// Official Matchday Lineup Configuration (11 Titulares 3+3+3+2 e 7 Suplentes)

export const DEFAULT_TEMPLATE_IMAGE = '/template_onze_inicial.jpg'

export const ROW_LAYOUTS = [
  {
    id: '3-3-3-2',
    name: '3 + 3 + 3 + 2 (Padrão Oficial)',
    rows: [3, 3, 3, 2],
    desc: 'Linha 1 (3), Linha 2 (3), Linha 3 (3) e Linha 4 (2)'
  },
  {
    id: '1-4-3-3',
    name: '1 + 4 + 3 + 3',
    rows: [1, 4, 3, 3],
    desc: '1 GR, 4 Defesas, 3 Médios e 3 Avançados'
  },
  {
    id: '1-4-4-2',
    name: '1 + 4 + 4 + 2',
    rows: [1, 4, 4, 2],
    desc: '1 GR, 4 Defesas, 4 Médios e 2 Avançados'
  }
]

export const CLUB_THEMES = [
  { 
    id: 'gral-blue', 
    name: 'G.R.A.L. Azul & Branco (Oficial)', 
    primaryColor: '#0052cc', 
    accentColor: '#00d2ff', 
    textColor: '#ffffff',
    badgeColor: '#0033aa',
    cardBg: 'rgba(255, 255, 255, 0.92)',
    cardBorder: 'rgba(0, 82, 204, 0.35)',
    nameColor: '#002677'
  },
  { 
    id: 'dark-navy', 
    name: 'Azul Escuro & Branco', 
    primaryColor: '#0a194f', 
    accentColor: '#38bdf8', 
    textColor: '#ffffff',
    badgeColor: '#0f2b82',
    cardBg: 'rgba(10, 25, 79, 0.88)',
    cardBorder: 'rgba(56, 189, 248, 0.4)',
    nameColor: '#ffffff'
  },
  { 
    id: 'glass-clean', 
    name: 'Efeito Vidro / Glass Clean', 
    primaryColor: '#0066ff', 
    accentColor: '#facc15', 
    textColor: '#ffffff',
    badgeColor: '#0055ee',
    cardBg: 'rgba(255, 255, 255, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.6)',
    nameColor: '#0f172a'
  }
]

// 11 Titulares
export const DEFAULT_STARTING_XI = [
  { number: '1', name: 'MIGUEL' },
  { number: '2', name: 'TIAGO' },
  { number: '3', name: 'DIOGO', isCaptain: true },
  { number: '4', name: 'RÚBEN' },
  { number: '5', name: 'ANDRÉ' },
  { number: '6', name: 'JOÃO' },
  { number: '7', name: 'GONÇALO' },
  { number: '8', name: 'BRUNO' },
  { number: '9', name: 'PEDRO' },
  { number: '10', name: 'RAFAEL' },
  { number: '11', name: 'BERNARDO' }
]

// Exatamente 7 Suplentes conforme as regras oficiais de jogo
export const DEFAULT_SUBSTITUTES = [
  { number: '12', name: 'LUÍS (GR)' },
  { number: '13', name: 'DANIEL' },
  { number: '14', name: 'FRANCISCO' },
  { number: '15', name: 'TOMÁS' },
  { number: '16', name: 'RODRIGO' },
  { number: '17', name: 'MARTIM' },
  { number: '18', name: 'AFONSO' }
]

export const DEFAULT_MATCH_DETAILS = {
  teamName: 'G.R.A.L.',
  competition: 'CAMPEONATO CONCELHIO AFAST',
  matchRound: '4ª JORNADA',
  season: '26/27',
  coach: 'MISTER'
}

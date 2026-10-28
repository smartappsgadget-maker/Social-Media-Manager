// Official Matchday Lineup Configuration (11 Titulares & 7 Suplentes)

export const DEFAULT_TEMPLATE_IMAGE = '/template_onze_inicial.jpg'

export const DISPLAY_MODES = [
  {
    id: 'list',
    name: 'Lista Oficial Poster (Gótico / Oficial)',
    desc: 'Alinhamento em lista com a tipografia gótica do template oficial'
  },
  {
    id: 'tactical',
    name: 'Formação Tática 3+3+3+2',
    desc: 'Linha 1 (3), Linha 2 (3), Linha 3 (3) e Linha 4 (2) com suporte a fotos'
  }
]

export const FONT_STYLES = [
  {
    id: 'pirata',
    name: 'Pirata One (Gótico Oficial)',
    fontFamily: '"Pirata One", "UnifrakturCook", cursive, serif',
    desc: 'Tipo de letra oficial idêntico ao template'
  },
  {
    id: 'unifraktur',
    name: 'UnifrakturCook (Fraktur Koch Tradicional)',
    fontFamily: '"UnifrakturCook", cursive, serif',
    desc: 'Letra gótica tradicional com traços afiados'
  },
  {
    id: 'germania',
    name: 'Germania One (Fraktur Moderno)',
    fontFamily: '"Germania One", cursive, serif',
    desc: 'Letra gótica encorpada e de fácil leitura'
  },
  {
    id: 'grenze',
    name: 'Grenze Gotisch (Textura Medieval)',
    fontFamily: '"Grenze Gotisch", cursive, serif',
    desc: 'Estilo clássico medieval afiado'
  }
]

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

// Plantel Oficial Completo da Época (27 Jogadores)
export const FULL_CLUB_SQUAD = [
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
  { number: '14', name: 'DAVID' },
  { number: '16', name: 'DANIEL' },
  { number: '17', name: 'JOÃO' },
  { number: '18', name: 'LUIS MOREIRA' },
  { number: '19', name: 'WALDECK' },
  { number: '20', name: 'ZÉ' },
  { number: '21', name: 'SIMÃO' },
  { number: '22', name: 'GONÇALO' },
  { number: '24', name: 'RAFA' },
  { number: '25', name: 'ALEX' },
  { number: '26', name: 'MARTO' },
  { number: '28', name: 'NELSON' },
  { number: '29', name: 'FININHO' },
  { number: '88', name: 'SIEGHOLD' },
  { number: '30', name: 'DANY' },
  { number: '95', name: 'TELMO' },
  { number: '95', name: 'ANDRE' }
]

// Slots em branco para 11 Titulares e 7 Suplentes (a preencher pelo utilizador através do número)
export const EMPTY_STARTING_XI = Array.from({ length: 11 }, () => ({
  number: '',
  name: '',
  isCaptain: false
}))

export const EMPTY_SUBSTITUTES = Array.from({ length: 7 }, () => ({
  number: '',
  name: ''
}))

export const DEFAULT_STARTING_XI = EMPTY_STARTING_XI
export const DEFAULT_SUBSTITUTES = EMPTY_SUBSTITUTES

export const DEFAULT_MATCH_DETAILS = {
  teamName: 'G.R.A.L.',
  competition: 'CAMPEONATO CONCELHIO AFAST',
  matchRound: '4ª JORNADA',
  season: '26/27'
}

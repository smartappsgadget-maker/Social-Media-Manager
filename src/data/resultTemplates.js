// Match Result Configuration & Defaults

export const DEFAULT_RESULT_TEMPLATE_IMAGE = null

export const MATCH_STATUSES = [
  { id: 'FINAL', label: 'Resultado Final' },
  { id: 'INTERVALO', label: 'Intervalo' },
  { id: 'PROLONGAMENTO', label: 'Após Prolongamento' },
  { id: 'PENALTIS', label: 'Após Grandes Penalidades' }
]

export const DEFAULT_RESULT_DATA = {
  myScore: 0,
  opponentScore: 0,
  status: 'FINAL',
  penaltyMyScore: '',
  penaltyOpponentScore: '',
  scorers: [], // [{ id: '1', number: '', name: '', minute: '', goals: 1 }]
  scoreY: 860, // Central Y position of score
  scoreSize: 130, // Font size for score
  scorersY: 1100, // Central Y position of scorers
  displayScorers: true
}

import React, { useState, useRef, useEffect } from 'react'
import {
  Trophy,
  Upload,
  Download,
  Copy,
  Check,
  ArrowRight,
  Image as ImageIcon,
  Plus,
  Trash2,
  Sliders,
  Type,
  Users,
  Camera,
  Shirt
} from 'lucide-react'
import { FULL_CLUB_SQUAD } from '../../data/lineupTemplates'
import { MATCH_STATUSES, DEFAULT_RESULT_DATA } from '../../data/resultTemplates'
import { loadSquadPhotos } from '../../services/matchdayStorage'
import { renderResultToCanvas } from '../../services/resultRenderer'
import confetti from 'canvas-confetti'

export default function ResultStudio({ onSendToWatermark, onSwitchToLineup }) {
  // Template image
  const [bgImage, setBgImage] = useState(null)

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('score') // 'template' | 'score' | 'scorers'

  // Score details
  const [myScore, setMyScore] = useState(2)
  const [opponentScore, setOpponentScore] = useState(1)
  const [status, setStatus] = useState('FINAL')
  const [penaltyMyScore, setPenaltyMyScore] = useState('')
  const [penaltyOpponentScore, setPenaltyOpponentScore] = useState('')

  // Scorers list: [{ id, number, name, minute, goals }]
  const [scorers, setScorers] = useState([])
  const [newScorerNumber, setNewScorerNumber] = useState('')
  const [newScorerMinute, setNewScorerMinute] = useState('')

  // Styling & Position offsets
  const [selectedFont, setSelectedFont] = useState('pirata')
  const [scoreY, setScoreY] = useState(860)
  const [scoreSize, setScoreSize] = useState(140)
  const [scorersY, setScorersY] = useState(1140)
  const [displayScorers, setDisplayScorers] = useState(true)

  // Squad photos memory
  const [playerPhotos, setPlayerPhotos] = useState({})

  // Feedback states
  const [copiedCaption, setCopiedCaption] = useState(false)
  const canvasRef = useRef(null)

  // Load photos from permanent squad roster on mount
  useEffect(() => {
    const loadedPhotos = loadSquadPhotos()
    setPlayerPhotos(loadedPhotos)
  }, [])

  // Handle template upload
  const handleTemplateUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setBgImage(event.target.result)
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } })
      }
      reader.readAsDataURL(file)
    }
  }

  // Render canvas whenever data changes
  useEffect(() => {
    if (canvasRef.current) {
      const activeFontFamily = selectedFont === 'germania'
        ? '"Germania One", cursive, serif'
        : selectedFont === 'unifraktur'
        ? '"UnifrakturCook", cursive, serif'
        : selectedFont === 'grenze'
        ? '"Grenze Gotisch", cursive, serif'
        : '"Pirata One", "UnifrakturCook", "Germania One", cursive, serif'

      renderResultToCanvas(canvasRef.current, {
        bgImage,
        myScore,
        opponentScore,
        status,
        penaltyMyScore,
        penaltyOpponentScore,
        scorers,
        playerPhotos,
        fontFamily: activeFontFamily,
        scoreY,
        scoreSize,
        scorersY,
        displayScorers
      })
    }
  }, [
    bgImage,
    myScore,
    opponentScore,
    status,
    penaltyMyScore,
    penaltyOpponentScore,
    scorers,
    playerPhotos,
    selectedFont,
    scoreY,
    scoreSize,
    scorersY,
    displayScorers
  ])

  // Add scorer by number
  const handleAddScorer = (e) => {
    e?.preventDefault()
    const cleanNum = String(newScorerNumber).trim()
    if (!cleanNum) return

    const intNum = parseInt(cleanNum, 10)
    const matched = FULL_CLUB_SQUAD.find(p => p.number === cleanNum || (!isNaN(intNum) && parseInt(p.number, 10) === intNum))

    const newScorer = {
      id: `${Date.now()}-${Math.random()}`,
      number: cleanNum,
      name: matched ? matched.name : `JOGADOR ${cleanNum}`,
      minute: newScorerMinute.trim(),
      goals: 1
    }

    setScorers(prev => [...prev, newScorer])
    setNewScorerNumber('')
    setNewScorerMinute('')
    confetti({ particleCount: 25, spread: 40, origin: { y: 0.7 } })
  }

  // Update existing scorer
  const updateScorer = (id, field, value) => {
    setScorers(prev => prev.map(s => {
      if (s.id !== id) return s
      if (field === 'number') {
        const cleanNum = String(value).trim()
        const intNum = parseInt(cleanNum, 10)
        const matched = FULL_CLUB_SQUAD.find(p => p.number === cleanNum || (!isNaN(intNum) && parseInt(p.number, 10) === intNum))
        return {
          ...s,
          number: value,
          name: matched ? matched.name : s.name
        }
      }
      return { ...s, [field]: value }
    }))
  }

  // Remove scorer
  const removeScorer = (id) => {
    setScorers(prev => prev.filter(s => s.id !== id))
  }

  // Download high-resolution image
  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `resultado-jogo-${myScore}-${opponentScore}-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL('image/png', 0.95)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } })
  }

  // Copy social media caption
  const handleCopyCaption = () => {
    const scorersText = scorers
      .filter(s => s.name)
      .map(s => `⚽ #${s.number} ${s.name}${s.minute ? ` (${s.minute})` : ''}`)
      .join('\n')

    const statusTitle = status === 'FINAL' ? 'FIM DO JOGO' : status

    const text = `🏆 ${statusTitle} 🔥⚽\n\nAD GUIMAREI ${myScore} - ${opponentScore} ADVERSÁRIO\n\n${scorersText ? `GOLOS:\n${scorersText}\n\n` : ''}#GRAL #ResultadoFinal #AFAST #FutebolConcelhio #DiaDeJogo`

    navigator.clipboard.writeText(text)
    setCopiedCaption(true)
    setTimeout(() => setCopiedCaption(false), 2500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top Studio Switcher Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/95 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Cartaz de Resultado do Jogo
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Ativo
              </span>
            </div>
            <p className="text-xs text-white font-bold mt-0.5">
              Placar Oficial & Marcadores de Golos
            </p>
          </div>
        </div>

        {/* Quick Switch to Lineup */}
        {onSwitchToLineup && (
          <button
            onClick={onSwitchToLineup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700/80 transition-all hover:scale-105"
          >
            <Shirt className="w-4 h-4 text-blue-400" />
            <span>Alternar para 11 Inicial & Suplentes</span>
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Live Canvas View */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                Cartaz de Resultado ({myScore} - {opponentScore})
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {bgImage ? 'Template Carregado' : 'Sem Template de Fundo'}
              </span>
            </div>

            {/* Canvas Container */}
            <div className="relative w-full max-h-[640px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 p-1 shadow-2xl">
              <canvas
                ref={canvasRef}
                className="max-h-[620px] w-auto max-w-full object-contain rounded-xl aspect-[9/16]"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
                >
                  {copiedCaption ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaption ? 'Legenda Copiada!' : 'Copiar Legenda'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar HD</span>
                </button>
              </div>

              {onSendToWatermark && (
                <button
                  onClick={() => {
                    if (canvasRef.current) {
                      onSendToWatermark(canvasRef.current.toDataURL('image/png'))
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
                >
                  <span>Marca de Água</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT: Controls Panel */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/90 space-y-6">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 pb-3 gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('score')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'score'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Placar & Golos</span>
            </button>

            <button
              onClick={() => setActiveTab('scorers')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'scorers'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Marcadores ({scorers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('template')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'template'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Template & Posição</span>
            </button>
          </div>

          {/* TAB 1: PLACAR & RESULTADO */}
          {activeTab === 'score' && (
            <div className="space-y-4">
              
              {/* Score Inputs Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Resultado do Jogo (Golos)</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  {/* My Team */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                      A Nossa Equipa
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setMyScore(prev => Math.max(0, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={myScore}
                        onChange={(e) => setMyScore(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-16 bg-slate-950 text-white font-mono text-2xl font-black text-center py-1 rounded-lg border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setMyScore(prev => prev + 1)}
                        className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Opponent Team */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Adversário
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setOpponentScore(prev => Math.max(0, prev - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={opponentScore}
                        onChange={(e) => setOpponentScore(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-16 bg-slate-950 text-white font-mono text-2xl font-black text-center py-1 rounded-lg border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setOpponentScore(prev => prev + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    Estado do Jogo:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MATCH_STATUSES.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatus(st.id)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                          status === st.id
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Penalties score if selected */}
                {status === 'PENALTIS' && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2 animate-fade-in">
                    <span className="text-[11px] font-bold text-amber-400 block">
                      Desempate por Grandes Penalidades:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="0"
                        value={penaltyMyScore}
                        onChange={(e) => setPenaltyMyScore(e.target.value)}
                        placeholder="Nossos Penáltis (ex: 4)"
                        className="w-full glass-input px-3 py-1.5 rounded-lg text-xs text-white font-bold"
                      />
                      <input
                        type="number"
                        min="0"
                        value={penaltyOpponentScore}
                        onChange={(e) => setPenaltyOpponentScore(e.target.value)}
                        placeholder="Penáltis Adversário (ex: 2)"
                        className="w-full glass-input px-3 py-1.5 rounded-lg text-xs text-white font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: MARCADORES DE GOLOS */}
          {activeTab === 'scorers' && (
            <div className="space-y-4">
              
              {/* Add Scorer by Number Form */}
              <form onSubmit={handleAddScorer} className="p-4 rounded-2xl bg-slate-950 border border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Adicionar Marcador por Número:</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold">Associação automática</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newScorerNumber}
                    onChange={(e) => setNewScorerNumber(e.target.value)}
                    placeholder="Nº Jogador (ex: 10)"
                    className="w-28 glass-input px-3 py-2 rounded-xl text-xs text-white font-mono font-bold placeholder:text-slate-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newScorerMinute}
                    onChange={(e) => setNewScorerMinute(e.target.value)}
                    placeholder="Minuto (ex: 23', 45'+2)"
                    className="flex-1 glass-input px-3 py-2 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition-all whitespace-nowrap flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Digita o número do jogador que marcou golo. O nome e a foto são associados imediatamente do plantel oficial!
                </p>
              </form>

              {/* Scorers List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-slate-400">
                    Marcadores do Jogo ({scorers.length}):
                  </span>
                  {scorers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setScorers([])}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Limpar Todos
                    </button>
                  )}
                </div>

                {scorers.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                    Nenhum marcador adicionado. Se o jogo terminou 0-0 ou não quiseres exibir marcadores, deixa vazio.
                  </div>
                ) : (
                  scorers.map((scorer) => {
                    const hasPhoto = Boolean(playerPhotos[scorer.number])
                    return (
                      <div key={scorer.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        {/* Number */}
                        <input
                          type="text"
                          value={scorer.number}
                          onChange={(e) => updateScorer(scorer.id, 'number', e.target.value)}
                          placeholder="Nº"
                          className="w-11 bg-slate-900 text-white font-mono text-xs px-1.5 py-1 rounded-lg border border-slate-700 text-center font-bold"
                        />

                        {/* Name */}
                        <input
                          type="text"
                          value={scorer.name}
                          onChange={(e) => updateScorer(scorer.id, 'name', e.target.value)}
                          placeholder="Nome do Jogador"
                          className="flex-1 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-700 uppercase font-semibold focus:outline-none"
                        />

                        {/* Minute */}
                        <input
                          type="text"
                          value={scorer.minute}
                          onChange={(e) => updateScorer(scorer.id, 'minute', e.target.value)}
                          placeholder="Minuto"
                          className="w-16 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg border border-slate-700 text-center font-mono"
                        />

                        {/* Quick Squad Picker */}
                        <select
                          value=""
                          onChange={(e) => {
                            const p = FULL_CLUB_SQUAD[e.target.value]
                            if (p) {
                              updateScorer(scorer.id, 'number', p.number)
                              updateScorer(scorer.id, 'name', p.name)
                            }
                          }}
                          className="bg-slate-900 text-slate-400 hover:text-white border border-slate-700 rounded-lg px-1.5 py-1 text-[11px] cursor-pointer"
                          title="Escolher do plantel"
                        >
                          <option value="">Plantel ▼</option>
                          {FULL_CLUB_SQUAD.map((sq, sqIdx) => (
                            <option key={sqIdx} value={sqIdx} className="bg-slate-950 text-white">
                              #{sq.number} {sq.name}
                            </option>
                          ))}
                        </select>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => removeScorer(scorer.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remover golo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 3: TEMPLATE & AJUSTES */}
          {activeTab === 'template' && (
            <div className="space-y-4">
              
              {/* Template Upload Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Template de Fundo do Resultado</span>
                  </h4>
                  <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    Proporção 9:16 HD
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Carrega a imagem do teu template de resultado de jogo. O sistema utiliza-a como fundo e <strong>apenas completa com o placar oficial e os marcadores de golos</strong>!
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02]">
                    <Upload className="w-4 h-4" />
                    <span>Carregar Template de Resultado</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTemplateUpload}
                      className="hidden"
                    />
                  </label>

                  {bgImage && (
                    <button
                      type="button"
                      onClick={() => setBgImage(null)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Remover Fundo
                    </button>
                  )}
                </div>
              </div>

              {/* Typography */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-amber-400" />
                    <span>Tipo de Letra Oficial</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    Gótico Oficial
                  </span>
                </div>

                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="pirata">Pirata One (Gótico Oficial - Idêntico ao 11 Inicial)</option>
                  <option value="unifraktur">UnifrakturCook (Fraktur Koch Tradicional)</option>
                  <option value="germania">Germania One (Fraktur Moderno)</option>
                  <option value="grenze">Grenze Gotisch (Textura Medieval)</option>
                </select>
              </div>

              {/* Sliders for Score & Scorers positioning */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Ajuste da Posição do Placar</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setScoreY(860)
                      setScoreSize(140)
                      setScorersY(1140)
                    }}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Predefinido
                  </button>
                </div>

                {/* Score Vertical Position */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Altura Vertical do Placar:</span>
                    <span className="font-mono text-amber-400">{scoreY}px</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="1400"
                    step="10"
                    value={scoreY}
                    onChange={(e) => setScoreY(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Score Size */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Tamanho dos Números do Placar:</span>
                    <span className="font-mono text-amber-400">{scoreSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="220"
                    step="5"
                    value={scoreSize}
                    onChange={(e) => setScoreSize(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Scorers Vertical Position */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Altura dos Marcadores de Golos:</span>
                    <span className="font-mono text-amber-400">{scorersY}px</span>
                  </div>
                  <input
                    type="range"
                    min="800"
                    max="1600"
                    step="10"
                    value={scorersY}
                    onChange={(e) => setScorersY(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}

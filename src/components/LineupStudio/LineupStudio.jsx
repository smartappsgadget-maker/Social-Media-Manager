import React, { useState, useRef, useEffect } from 'react'
import { 
  Users, 
  Upload, 
  Download, 
  Shirt, 
  ClipboardList, 
  Copy, 
  Check, 
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  Home,
  Plane,
  FileText,
  Camera,
  Trash2,
  Plus,
  Calendar,
  History,
  FolderPlus,
  Shield,
  CheckCircle2,
  Type,
  LayoutGrid,
  ListOrdered
} from 'lucide-react'
import { 
  DEFAULT_TEMPLATE_IMAGE,
  DEFAULT_STARTING_XI, 
  DEFAULT_SUBSTITUTES, 
  DEFAULT_MATCH_DETAILS,
  DISPLAY_MODES,
  FONT_STYLES,
  FULL_CLUB_SQUAD
} from '../../data/lineupTemplates'
import { 
  loadMatchdays, 
  saveAllMatchdays, 
  getActiveMatchdayId, 
  setActiveMatchdayId, 
  createNewMatchday, 
  deleteMatchday, 
  loadSquadPhotos, 
  saveSquadPhotos 
} from '../../services/matchdayStorage'
import { 
  loadLeagueTeams, 
  saveLeagueTeams, 
  upsertLeagueTeam, 
  processOpponentEmblemsBatch, 
  loadMyClub, 
  saveMyClub 
} from '../../services/teamBadgesStorage'
import { renderLineupToCanvas } from '../../services/lineupRenderer'
import confetti from 'canvas-confetti'

export default function LineupStudio({ onSendToWatermark }) {
  // Season Matchdays state
  const [matchdaysList, setMatchdaysList] = useState([])
  const [currentMatchdayId, setCurrentMatchdayId] = useState('jornada-4')

  // League teams and permanent club
  const [leagueTeams, setLeagueTeams] = useState([])
  const [myClub, setMyClub] = useState({ name: 'AD GUIMAREI', shortName: 'ADG', crestUrl: null })
  const [showLeagueBadgesModal, setShowLeagueBadgesModal] = useState(false)

  // Current active matchday details & squad
  const [starters, setStarters] = useState(DEFAULT_STARTING_XI)
  const [substitutes, setSubstitutes] = useState(DEFAULT_SUBSTITUTES.slice(0, 7))
  const [matchDetails, setMatchDetails] = useState({
    ...DEFAULT_MATCH_DETAILS,
    roundNumber: '4ª',
    isHome: true,
    opponentName: 'ADVERSÁRIO',
    opponentLogoUrl: null,
    myClubLogoUrl: null
  })

  // Permanent squad photos pool: { '1': dataUrl, '7': dataUrl, ... }
  const [playerPhotos, setPlayerPhotos] = useState({})

  // Template image asset
  const [bgImage, setBgImage] = useState(DEFAULT_TEMPLATE_IMAGE)

  // Navigation tab
  const [activeTab, setActiveTab] = useState('match') // 'match' | 'photos' | 'starters' | 'subs'

  // Typography & Layout Mode matching the template
  const [displayMode, setDisplayMode] = useState('list') // 'list' | 'tactical'
  const [selectedFont, setSelectedFont] = useState('pirata') // 'pirata' | 'germania' | 'grenze'
  const [forceDynamicJornada, setForceDynamicJornada] = useState(false)

  // Modals
  const [showNewMatchdayModal, setShowNewMatchdayModal] = useState(false)
  const [newRoundInput, setNewRoundInput] = useState('')
  const [newIsHome, setNewIsHome] = useState(true)
  const [newOpponent, setNewOpponent] = useState('')

  const [showQuickPaste, setShowQuickPaste] = useState(false)
  const [quickPasteText, setQuickPasteText] = useState('')
  const [copiedCaption, setCopiedCaption] = useState(false)

  // Quick inputs by squad numbers
  const [startersNumbersInput, setStartersNumbersInput] = useState('')
  const [subsNumbersInput, setSubsNumbersInput] = useState('')

  const canvasRef = useRef(null)

  // 1. Initialize on Mount: Load matchdays, permanent squad photos & league teams
  useEffect(() => {
    const savedMatchdays = loadMatchdays()
    const activeId = getActiveMatchdayId()
    const loadedPhotos = loadSquadPhotos()
    const loadedTeams = loadLeagueTeams()
    const loadedClub = loadMyClub()

    setMatchdaysList(savedMatchdays)
    setPlayerPhotos(loadedPhotos)
    setLeagueTeams(loadedTeams)
    setMyClub(loadedClub)

    const activeItem = savedMatchdays.find(m => m.id === activeId) || savedMatchdays[0]
    if (activeItem) {
      setCurrentMatchdayId(activeItem.id)
      setStarters(activeItem.starters || DEFAULT_STARTING_XI)
      setSubstitutes((activeItem.substitutes || DEFAULT_SUBSTITUTES).slice(0, 7))

      let oppLogo = activeItem.opponentLogoUrl || null
      if (!oppLogo && activeItem.opponentName) {
        const found = loadedTeams.find(t => t.name.toUpperCase() === activeItem.opponentName.toUpperCase())
        if (found) oppLogo = found.logoUrl
      }

      setMatchDetails({
        ...DEFAULT_MATCH_DETAILS,
        roundNumber: activeItem.roundNumber || '4ª',
        isHome: activeItem.isHome !== false,
        opponentName: activeItem.opponentName || 'ADVERSÁRIO',
        opponentLogoUrl: oppLogo,
        myClubLogoUrl: loadedClub.crestUrl || null,
        coach: activeItem.coach || 'MISTER'
      })
    }
  }, [])

  // 2. Auto-save current matchday when starters, subs or details change
  useEffect(() => {
    if (matchdaysList.length === 0) return

    const updatedList = matchdaysList.map((m) => {
      if (m.id === currentMatchdayId) {
        return {
          ...m,
          roundNumber: matchDetails.roundNumber,
          isHome: matchDetails.isHome,
          opponentName: matchDetails.opponentName,
          opponentLogoUrl: matchDetails.opponentLogoUrl,
          myClubLogoUrl: matchDetails.myClubLogoUrl,
          coach: matchDetails.coach,
          starters,
          substitutes: substitutes.slice(0, 7)
        }
      }
      return m
    })

    saveAllMatchdays(updatedList)
    setMatchdaysList(updatedList)
  }, [starters, substitutes, matchDetails])

  // 3. Switch between saved matchdays (e.g. 1ª, 2ª, 3ª, 4ª, 5ª...)
  const handleSwitchMatchday = (id) => {
    const target = matchdaysList.find(m => m.id === id)
    if (!target) return

    setCurrentMatchdayId(id)
    setActiveMatchdayId(id)
    setStarters(target.starters || DEFAULT_STARTING_XI)
    setSubstitutes((target.substitutes || DEFAULT_SUBSTITUTES).slice(0, 7))

    let oppLogo = target.opponentLogoUrl || null
    if (!oppLogo && target.opponentName) {
      const found = leagueTeams.find(t => t.name.toUpperCase() === target.opponentName.toUpperCase())
      if (found) oppLogo = found.logoUrl
    }

    setMatchDetails({
      ...DEFAULT_MATCH_DETAILS,
      roundNumber: target.roundNumber || '4ª',
      isHome: target.isHome !== false,
      opponentName: target.opponentName || 'ADVERSÁRIO',
      opponentLogoUrl: oppLogo,
      myClubLogoUrl: myClub.crestUrl || null,
      coach: target.coach || 'MISTER'
    })
  }

  // 4. Create a new Matchday for the next round
  const handleCreateNewMatchdaySubmit = (e) => {
    e.preventDefault()
    if (!newRoundInput.trim()) return

    const created = createNewMatchday(
      newRoundInput.trim(),
      newIsHome,
      newOpponent.trim(),
      currentMatchdayId
    )

    let oppLogo = null
    if (newOpponent.trim()) {
      const found = leagueTeams.find(t => t.name.toUpperCase() === newOpponent.trim().toUpperCase())
      if (found) oppLogo = found.logoUrl
    }

    const updatedList = loadMatchdays()
    setMatchdaysList(updatedList)
    setCurrentMatchdayId(created.id)
    setStarters(created.starters)
    setSubstitutes(created.substitutes.slice(0, 7))
    setMatchDetails({
      ...DEFAULT_MATCH_DETAILS,
      roundNumber: created.roundNumber,
      isHome: created.isHome,
      opponentName: created.opponentName,
      opponentLogoUrl: oppLogo,
      myClubLogoUrl: myClub.crestUrl || null,
      coach: created.coach
    })

    setShowNewMatchdayModal(false)
    setNewRoundInput('')
    setNewOpponent('')

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    })
  }

  // 5. Delete current matchday
  const handleDeleteCurrentMatchday = () => {
    if (matchdaysList.length <= 1) {
      alert('Tem de manter pelo menos uma jornada na época.')
      return
    }
    if (confirm(`Tem a certeza que deseja eliminar a ${matchDetails.roundNumber} Jornada?`)) {
      const updated = deleteMatchday(currentMatchdayId)
      setMatchdaysList(updated)
      handleSwitchMatchday(updated[0].id)
    }
  }

  // 6. Re-render canvas whenever data changes
  useEffect(() => {
    if (canvasRef.current) {
      const activeFontFamily = selectedFont === 'germania'
        ? '"Germania One", cursive, serif'
        : selectedFont === 'unifraktur'
        ? '"UnifrakturCook", cursive, serif'
        : selectedFont === 'grenze'
        ? '"Grenze Gotisch", cursive, serif'
        : '"Pirata One", "UnifrakturCook", "Germania One", cursive, serif'

      renderLineupToCanvas(canvasRef.current, {
        bgImage,
        startingXI: starters,
        substitutes: substitutes.slice(0, 7),
        playerPhotos,
        matchDetails,
        displayMode,
        fontFamily: activeFontFamily,
        forceDynamicJornada
      })
    }
  }, [
    bgImage,
    starters,
    substitutes,
    playerPhotos,
    matchDetails,
    displayMode,
    selectedFont,
    forceDynamicJornada
  ])

  // Save photos to permanent squad memory
  const updatePhotosMemory = (newPhotos) => {
    setPlayerPhotos(newPhotos)
    saveSquadPhotos(newPhotos)
  }

  // Handle selecting opponent from league list
  const handleSelectOpponent = (name) => {
    const cleanName = (name || '').trim().toUpperCase()
    const found = leagueTeams.find(t => t.name.toUpperCase() === cleanName)
    setMatchDetails(prev => ({
      ...prev,
      opponentName: cleanName,
      opponentLogoUrl: found ? found.logoUrl : null
    }))
  }

  // Handle uploading logo for currently selected opponent
  const handleUploadOpponentLogo = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const logoUrl = event.target.result
        const oppName = (matchDetails.opponentName || 'ADVERSÁRIO').toUpperCase()
        const updatedTeams = upsertLeagueTeam(oppName, logoUrl)
        setLeagueTeams(updatedTeams)
        setMatchDetails(prev => ({ ...prev, opponentLogoUrl: logoUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle batch uploading league crests
  const handleBatchOpponentLogos = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    processOpponentEmblemsBatch(files, (updatedTeams) => {
      setLeagueTeams([...updatedTeams])
      // Check if current opponent's logo was updated
      const oppName = (matchDetails.opponentName || '').toUpperCase()
      const found = updatedTeams.find(t => t.name.toUpperCase().includes(oppName) || oppName.includes(t.name.toUpperCase()))
      if (found && found.logoUrl) {
        setMatchDetails(prev => ({ ...prev, opponentLogoUrl: found.logoUrl }))
      }
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } })
    })
  }

  // Handle uploading our official club crest (AD Guimarei)
  const handleUploadMyClubLogo = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const crestUrl = event.target.result
        const updated = { ...myClub, crestUrl }
        saveMyClub(updated)
        setMyClub(updated)
        setMatchDetails(prev => ({ ...prev, myClubLogoUrl: crestUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Multi-photo batch upload (automatically matches 1.png, 7.jpg to player numbers!)
  const handleBatchPhotosUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach((file) => {
      const match = file.name.match(/(\d+)/)
      if (match) {
        const number = String(parseInt(match[1], 10))
        const reader = new FileReader()
        reader.onload = (event) => {
          setPlayerPhotos((prev) => {
            const next = { ...prev, [number]: event.target.result }
            saveSquadPhotos(next)
            return next
          })
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Single player photo upload
  const handleSinglePhotoUpload = (number, e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPlayerPhotos((prev) => {
          const next = { ...prev, [number]: event.target.result }
          saveSquadPhotos(next)
          return next
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove player photo
  const removePlayerPhoto = (number) => {
    setPlayerPhotos((prev) => {
      const updated = { ...prev }
      delete updated[number]
      saveSquadPhotos(updated)
      return updated
    })
  }

  // File Import for Player List (.txt or .csv)
  const handlePlayerListFileUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        parsePlayerListString(event.target.result)
      }
      reader.readAsText(file)
    }
  }

  // Parse Player List String
  const parsePlayerListString = (rawText) => {
    if (!rawText || !rawText.trim()) return

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)
    const newStarters = []
    const newSubs = []
    let inSubs = false

    lines.forEach((line) => {
      if (/suplentes|banco|substitutes|bench/i.test(line)) {
        inSubs = true
        return
      }

      const match = line.match(/^#?(\d+)[\.\s\-\:]+(.+)$/)
      if (match) {
        const number = match[1]
        let name = match[2].trim()
        let isCaptain = false

        if (/\(c\)/i.test(name)) {
          isCaptain = true
          name = name.replace(/\(c\)/i, '').trim()
        }

        if (inSubs || newStarters.length >= 11) {
          if (newSubs.length < 7) {
            newSubs.push({ number, name })
          }
        } else {
          newStarters.push({ number, name, isCaptain })
        }
      }
    })

    if (newStarters.length > 0) {
      while (newStarters.length < 11) {
        newStarters.push({ number: String(newStarters.length + 1), name: 'JOGADOR ' + (newStarters.length + 1) })
      }
      setStarters(newStarters.slice(0, 11))
    }

    if (newSubs.length > 0) {
      while (newSubs.length < 7) {
        newSubs.push({ number: String(newSubs.length + 12), name: 'SUPLENTE ' + (newSubs.length + 1) })
      }
      setSubstitutes(newSubs.slice(0, 7))
    }

    setShowQuickPaste(false)
    setQuickPasteText('')
  }

  // Update starter player with automatic squad lookup by number
  const updateStarter = (index, field, value) => {
    setStarters((prev) => {
      const updated = [...prev]
      if (field === 'number') {
        const cleanNum = String(value).trim()
        const matched = FULL_CLUB_SQUAD.find(p => p.number === cleanNum)
        if (matched) {
          updated[index] = { ...updated[index], number: cleanNum, name: matched.name }
        } else {
          updated[index] = { ...updated[index], number: value }
        }
      } else {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }

  // Set captain toggle
  const toggleCaptain = (index) => {
    setStarters((prev) =>
      prev.map((p, i) => ({
        ...p,
        isCaptain: i === index ? !p.isCaptain : false
      }))
    )
  }

  // Update substitute player with automatic squad lookup by number
  const updateSub = (index, field, value) => {
    setSubstitutes((prev) => {
      const updated = [...prev]
      if (field === 'number') {
        const cleanNum = String(value).trim()
        const matched = FULL_CLUB_SQUAD.find(p => p.number === cleanNum)
        if (matched) {
          updated[index] = { ...updated[index], number: cleanNum, name: matched.name }
        } else {
          updated[index] = { ...updated[index], number: value }
        }
      } else {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }

  // Apply 11 Starters directly from numbers string (e.g. "31, 45, 5, 6, 7, 8, 9, 10, 11, 12, 14")
  const handleApplyStartersNumbers = (e) => {
    e?.preventDefault()
    if (!startersNumbersInput.trim()) return

    const numbers = startersNumbersInput
      .split(/[\s,;.-]+/)
      .map(n => n.replace(/[^\d]/g, '').trim())
      .filter(Boolean)

    if (numbers.length === 0) return

    const newStarters = numbers.slice(0, 11).map((num, idx) => {
      const found = FULL_CLUB_SQUAD.find(p => p.number === num)
      const currentPrev = starters[idx]
      return {
        number: num,
        name: found ? found.name : `JOGADOR ${num}`,
        isCaptain: currentPrev?.isCaptain || false
      }
    })

    while (newStarters.length < 11) {
      const nextIdx = newStarters.length + 1
      newStarters.push({ number: String(nextIdx), name: `JOGADOR ${nextIdx}` })
    }

    setStarters(newStarters)
    setStartersNumbersInput('')
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } })
  }

  // Apply 7 Substitutes directly from numbers string (e.g. "16, 17, 18, 19, 20, 21, 22")
  const handleApplySubsNumbers = (e) => {
    e?.preventDefault()
    if (!subsNumbersInput.trim()) return

    const numbers = subsNumbersInput
      .split(/[\s,;.-]+/)
      .map(n => n.replace(/[^\d]/g, '').trim())
      .filter(Boolean)

    if (numbers.length === 0) return

    const newSubs = numbers.slice(0, 7).map((num) => {
      const found = FULL_CLUB_SQUAD.find(p => p.number === num)
      return {
        number: num,
        name: found ? found.name : `SUPLENTE ${num}`
      }
    })

    while (newSubs.length < 7) {
      const nextIdx = newSubs.length + 1
      newSubs.push({ number: String(11 + nextIdx), name: `SUPLENTE ${nextIdx}` })
    }

    setSubstitutes(newSubs)
    setSubsNumbersInput('')
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } })
  }

  // Download high-resolution lineup card
  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `11-inicial-${matchDetails.roundNumber || 'jornada'}-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL('image/png', 0.95)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 }
    })
  }

  // Copy social media caption
  const handleCopyCaption = () => {
    const starList = starters
      .slice(0, 11)
      .map(p => `#${p.number} ${p.name}${p.isCaptain ? ' (C)' : ''}`)
      .join('\n')

    const subList = substitutes.slice(0, 7).map(s => `#${s.number} ${s.name}`).join(', ')
    const local = matchDetails.isHome ? 'EM CASA 🏠' : 'FORA ✈️'

    const text = `📋 ONZE INICIAL • ${matchDetails.roundNumber || '4ª'} JORNADA 🔥⚽\n\n🏆 ${matchDetails.competition || 'Campeonato Concelhio AFAST'}\n📍 Jogo: ${local} vs ${matchDetails.opponentName || 'Adversário'}\n📅 Época 26/27\n\n11 TITULAR (3+3+3+2):\n${starList}\n\nBANCO DE SUPLENTES (7):\n${subList}\n\nTREINADOR: ${matchDetails.coach || 'Equipa Técnica'}\n\n#GRAL #OnzeInicial #AFAST #FutebolConcelhio #DiaDeJogo #VamosEquipa`

    navigator.clipboard.writeText(text)
    setCopiedCaption(true)
    setTimeout(() => setCopiedCaption(false), 2500)
  }

  const photosCount = Object.keys(playerPhotos).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* 1. MATCHDAY SEASON MANAGER BAR */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/95 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Matchday Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Época 26/27 • Jornada Ativa:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Guardado Auto
              </span>
            </div>
            
            {/* Dropdown selector */}
            <div className="flex items-center gap-2 mt-1">
              <select
                value={currentMatchdayId}
                onChange={(e) => handleSwitchMatchday(e.target.value)}
                className="bg-slate-950 text-white font-bold text-sm px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {matchdaysList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.roundNumber} Jornada • {m.isHome ? 'Casa' : 'Fora'} vs {m.opponentName || 'Adversário'}
                  </option>
                ))}
              </select>

              {matchdaysList.length > 1 && (
                <button
                  onClick={handleDeleteCurrentMatchday}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Eliminar esta jornada"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action: Add New Matchday */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const nextNum = matchdaysList.length + 1
              setNewRoundInput(`${nextNum}ª`)
              setShowNewMatchdayModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-105 whitespace-nowrap"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Adicionar Próxima Jornada</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{matchDetails.roundNumber} Jornada</span>
            <span className="text-sm font-semibold text-slate-400">
              ({matchDetails.isHome ? 'Jogo em Casa 🏠' : 'Jogo Fora ✈️'} vs {matchDetails.opponentName})
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            As fotos dos jogadores ficam guardadas para toda a época. A cada jornada que passa, basta selecionar os 11 titulares e os 7 suplentes!
          </p>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer border border-slate-700/60 transition-colors">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Importar Ficheiro (.txt)</span>
            <input type="file" accept=".txt,.csv" onChange={handlePlayerListFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => setShowQuickPaste(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors"
          >
            <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
            <span>Colar Lista</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Imagem HD</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Live Canvas View */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800 text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                Cartaz da {matchDetails.roundNumber} Jornada • {matchDetails.isHome ? 'CASA 🏠' : 'FORA ✈️'}
              </span>
              <span className="font-mono text-blue-400 font-bold">
                {photosCount} Fotos no Plantel
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
              <button
                onClick={handleCopyCaption}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? 'Legenda Copiada!' : 'Copiar Legenda do Jogo'}</span>
              </button>

              <button
                onClick={() => {
                  if (canvasRef.current) {
                    onSendToWatermark(canvasRef.current.toDataURL('image/png'))
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              >
                <span>Proteger com Marca de Água</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT: Controls Panel */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/90 space-y-6">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-800 pb-3 gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('match')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'match'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Jogo & Casa/Fora</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'photos'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Plantel ({photosCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('starters')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'starters'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>11 Titular</span>
            </button>

            <button
              onClick={() => setActiveTab('subs')}
              className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'subs'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>7 Suplentes</span>
            </button>
          </div>

          {/* TAB 1: MATCH DETAILS (JORNADA & CASA/FORA & EMBLEMAS) */}
          {activeTab === 'match' && (
            <div className="space-y-4">
              {/* Casa vs Fora Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Localização Desta Jornada:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMatchDetails({ ...matchDetails, isHome: true })}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      matchDetails.isHome
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>JOGO EM CASA 🏠</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMatchDetails({ ...matchDetails, isHome: false })}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      !matchDetails.isHome
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plane className="w-4 h-4" />
                    <span>JOGO FORA ✈️</span>
                  </button>
                </div>
              </div>

              {/* Número da Jornada & Treinador */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Número da Jornada
                  </label>
                  <input
                    type="text"
                    value={matchDetails.roundNumber || ''}
                    onChange={(e) => setMatchDetails({ ...matchDetails, roundNumber: e.target.value })}
                    placeholder="Ex: 4ª, 5ª, 6ª"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Atualiza o símbolo da jornada no canto inferior direito
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Treinador / Equipa Técnica
                  </label>
                  <input
                    type="text"
                    value={matchDetails.coach || ''}
                    onChange={(e) => setMatchDetails({ ...matchDetails, coach: e.target.value })}
                    placeholder="Ex: MISTER"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white font-semibold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Aparece no rodapé junto aos 7 suplentes
                  </span>
                </div>
              </div>

              {/* Estilo do Cartaz & Tipografia Oficial */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-blue-400" />
                    <span>Estilo & Tipografia Oficial do Template</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                    Gótico Oficial
                  </span>
                </div>

                {/* Mode Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    Modo de Apresentação do 11 Inicial:
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setDisplayMode('list')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                        displayMode === 'list'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>Lista Oficial Poster</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDisplayMode('tactical')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                        displayMode === 'tactical'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Formação 3+3+3+2</span>
                    </button>
                  </div>
                </div>

                {/* Font Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Tipo de Letra (Gótico Oficial):
                  </label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full bg-slate-950 text-white font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="pirata">Pirata One (Gótico Oficial - Idêntico ao Template)</option>
                    <option value="unifraktur">UnifrakturCook (Fraktur Koch Tradicional)</option>
                    <option value="germania">Germania One (Fraktur Moderno)</option>
                    <option value="grenze">Grenze Gotisch (Textura Medieval)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Todos os 11 titulares, 7 suplentes, treinador e jornada usam esta mesma fonte oficial.
                  </span>
                </div>
              </div>

              {/* Equipas & Emblemas Oficiais */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Equipas & Emblemas do Jogo</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowLeagueBadgesModal(true)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <span>Gerir Liga ({leagueTeams.length})</span>
                  </button>
                </div>

                {/* Card 1: A Nossa Equipa (AD GUIMAREI) */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-blue-900/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full bg-blue-950 border border-blue-500/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {myClub.crestUrl ? (
                        <img src={myClub.crestUrl} alt="AD Guimarei" className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-xs font-black text-blue-300">ADG</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white">{myClub.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                          A Nossa Equipa
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Clube fixo em todos os cartazes de jogo
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-blue-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{myClub.crestUrl ? 'Alterar' : 'Emblema'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadMyClubLogo}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Card 2: Adversário da Jornada */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Selecionar Adversário da Liga AFAST:
                    </label>
                    <select
                      value={matchDetails.opponentName || ''}
                      onChange={(e) => handleSelectOpponent(e.target.value)}
                      className="w-full bg-slate-900 text-white font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="">-- Escolher Adversário --</option>
                      {leagueTeams.map((t) => (
                        <option key={t.id || t.name} value={t.name}>
                          {t.name} {t.logoUrl ? '🛡️ (Com Emblema)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {matchDetails.opponentLogoUrl ? (
                        <img src={matchDetails.opponentLogoUrl} alt={matchDetails.opponentName} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Shield className="w-5 h-5 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={matchDetails.opponentName || ''}
                        onChange={(e) => handleSelectOpponent(e.target.value)}
                        placeholder="Nome do Adversário"
                        className="w-full glass-input px-3 py-1.5 rounded-xl text-xs text-white uppercase font-bold"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Podes editar o nome ou escrever qualquer novo clube
                      </span>
                    </div>

                    <label className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0" title="Carregar emblema para este adversário">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Emblema</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadOpponentLogo}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Batch Upload for Opponent Badges */}
                  <label className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-dashed border-slate-700 hover:border-blue-500/60 text-xs font-semibold cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Carregar Todos os Emblemas da Liga (Lote de Imagens)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleBatchOpponentLogos}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PERMANENT SQUAD PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Plantel Permanente da Época</span>
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-bold">{photosCount} fotos gravadas</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  As fotos carregadas aqui <strong>ficam gravadas para todas as jornadas</strong> (1ª, 2ª, 3ª, 4ª, 5ª...). Basta carregar as fotos uma única vez!
                </p>

                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-blue-600/25 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Selecionar Fotos em Lote (1.png, 7.jpg...)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleBatchPhotosUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Player list with photos */}
              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                <span className="text-[11px] font-bold text-slate-400 pl-1">
                  Plantel Oficial ({FULL_CLUB_SQUAD.length} Jogadores):
                </span>

                {FULL_CLUB_SQUAD.map((player, idx) => {
                  const hasPhoto = Boolean(playerPhotos[player.number])
                  const isStarter = starters.some(s => s.number === player.number)
                  const isSub = substitutes.some(s => s.number === player.number)
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        {hasPhoto ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-blue-400">
                            <img src={playerPhotos[player.number]} alt={player.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-slate-400">
                            #{player.number}
                          </div>
                        )}

                        <div>
                          <p className="font-bold text-white text-[11px]">#{player.number} {player.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {isStarter ? '⭐ No 11 Titular' : isSub ? '🔵 No Banco de Suplentes' : 'Plantel Geral'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasPhoto ? (
                          <button
                            onClick={() => removePlayerPhoto(player.number)}
                            className="text-[11px] text-rose-400 hover:underline p-1"
                            title="Remover foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <label className="text-[11px] text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                            <span>Adicionar</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSinglePhotoUpload(player.number, e)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 11 TITULARES */}
          {activeTab === 'starters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>11 Titulares da <strong>{matchDetails.roundNumber} Jornada</strong></span>
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDisplayMode('list')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${displayMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Lista Poster
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayMode('tactical')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${displayMode === 'tactical' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    3+3+3+2
                  </button>
                </div>
              </div>

              {/* Quick Numbers Bar for 11 Starters */}
              <form onSubmit={handleApplyStartersNumbers} className="p-3 rounded-2xl bg-slate-950 border border-blue-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Definir 11 Titulares por Números:</span>
                  </label>
                  <span className="text-[10px] text-blue-400 font-semibold">Associação automática</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={startersNumbersInput}
                    onChange={(e) => setStartersNumbersInput(e.target.value)}
                    placeholder="Ex: 31, 45, 5, 6, 7, 8, 9, 10, 11, 12, 14"
                    className="flex-1 glass-input px-3 py-1.5 rounded-xl text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all whitespace-nowrap"
                  >
                    Aplicar 11
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Digita os números dos 11 jogadores separados por vírgula. Os nomes e fotos do plantel são associados instantaneamente!
                </p>
              </form>

              {/* 11 Players Inputs Grouped into 4 Rows */}
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {[
                  { label: 'Linha 1 (3 Jogadores)', range: [0, 1, 2] },
                  { label: 'Linha 2 (3 Jogadores)', range: [3, 4, 5] },
                  { label: 'Linha 3 (3 Jogadores)', range: [6, 7, 8] },
                  { label: 'Linha 4 (2 Jogadores)', range: [9, 10] }
                ].map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase pl-1">
                      {group.label}
                    </span>

                    {group.range.map((idx) => {
                      const player = starters[idx] || { number: '', name: '' }
                      const hasPhoto = Boolean(playerPhotos[player.number])
                      return (
                        <div key={idx} className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
                          {/* Number */}
                          <input
                            type="text"
                            value={player.number}
                            onChange={(e) => updateStarter(idx, 'number', e.target.value)}
                            placeholder="Nº"
                            className="w-11 bg-slate-900 text-white font-mono text-xs px-1.5 py-1 rounded-lg border border-slate-700 text-center font-bold"
                          />

                          {/* Name */}
                          <input
                            type="text"
                            value={player.name}
                            onChange={(e) => updateStarter(idx, 'name', e.target.value)}
                            placeholder="Nome do Jogador"
                            className="flex-1 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-700 uppercase font-semibold focus:outline-none"
                          />

                          {/* Quick Squad Picker */}
                          <select
                            value=""
                            onChange={(e) => {
                              const p = FULL_CLUB_SQUAD[e.target.value]
                              if (p) {
                                updateStarter(idx, 'number', p.number)
                                updateStarter(idx, 'name', p.name)
                              }
                            }}
                            className="bg-slate-900 text-slate-400 hover:text-white border border-slate-700 rounded-lg px-1.5 py-1 text-[11px] cursor-pointer focus:outline-none"
                            title="Escolher do plantel oficial"
                          >
                            <option value="">Plantel ▼</option>
                            {FULL_CLUB_SQUAD.map((sq, sqIdx) => (
                              <option key={sqIdx} value={sqIdx} className="bg-slate-950 text-white">
                                #{sq.number} {sq.name}
                              </option>
                            ))}
                          </select>

                          {/* Photo status */}
                          <label className="cursor-pointer p-1" title={hasPhoto ? 'Foto associada da memória' : 'Adicionar foto'}>
                            <Camera className={`w-3.5 h-3.5 ${hasPhoto ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`} />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSinglePhotoUpload(player.number, e)}
                              className="hidden"
                            />
                          </label>

                          {/* Captain toggle */}
                          <button
                            type="button"
                            onClick={() => toggleCaptain(idx)}
                            className={`w-6 h-6 rounded-lg text-xs font-bold transition-colors flex items-center justify-center ${
                              player.isCaptain ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                            }`}
                            title={player.isCaptain ? 'Capitão da equipa' : 'Marcar como capitão'}
                          >
                            C
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: 7 SUPLENTES */}
          {activeTab === 'subs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>7 Suplentes da <strong>{matchDetails.roundNumber} Jornada</strong></span>
                <span className="text-[11px] text-blue-400">Slots 1 a 7</span>
              </div>

              {/* Quick Numbers Bar for 7 Substitutes */}
              <form onSubmit={handleApplySubsNumbers} className="p-3 rounded-2xl bg-slate-950 border border-blue-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span>Definir 7 Suplentes por Números:</span>
                  </label>
                  <span className="text-[10px] text-blue-400 font-semibold">Associação automática</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subsNumbersInput}
                    onChange={(e) => setSubsNumbersInput(e.target.value)}
                    placeholder="Ex: 16, 17, 18, 19, 20, 21, 22"
                    className="flex-1 glass-input px-3 py-1.5 rounded-xl text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all whitespace-nowrap"
                  >
                    Aplicar 7
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Digita os números dos 7 suplentes separados por vírgula. Os nomes e fotos do plantel são associados instantaneamente!
                </p>
              </form>

              {/* 7 Substitutes Inputs */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {substitutes.slice(0, 7).map((sub, idx) => {
                  const hasPhoto = Boolean(playerPhotos[sub.number])
                  return (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[11px] font-mono text-slate-500 w-5 text-center">
                        {idx + 1}
                      </span>

                      {/* Number input */}
                      <input
                        type="text"
                        value={sub.number}
                        onChange={(e) => updateSub(idx, 'number', e.target.value)}
                        placeholder="Nº"
                        className="w-12 bg-slate-900 text-white font-mono text-xs px-1.5 py-1 rounded-lg border border-slate-700 text-center font-bold"
                      />

                      {/* Name input */}
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => updateSub(idx, 'name', e.target.value)}
                        placeholder={`Nome do Suplente ${idx + 1}`}
                        className="flex-1 bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-semibold focus:outline-none"
                      />

                      {/* Quick Squad Picker */}
                      <select
                        value=""
                        onChange={(e) => {
                          const p = FULL_CLUB_SQUAD[e.target.value]
                          if (p) {
                            updateSub(idx, 'number', p.number)
                            updateSub(idx, 'name', p.name)
                          }
                        }}
                        className="bg-slate-900 text-slate-400 hover:text-white border border-slate-700 rounded-lg px-1.5 py-1 text-[11px] cursor-pointer focus:outline-none"
                        title="Escolher do plantel oficial"
                      >
                        <option value="">Plantel ▼</option>
                        {FULL_CLUB_SQUAD.map((sq, sqIdx) => (
                          <option key={sqIdx} value={sqIdx} className="bg-slate-950 text-white">
                            #{sq.number} {sq.name}
                          </option>
                        ))}
                      </select>

                      {/* Photo indicator */}
                      <label className="cursor-pointer p-1" title={hasPhoto ? 'Foto associada' : 'Adicionar foto'}>
                        <Camera className={`w-3.5 h-3.5 ${hasPhoto ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'}`} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSinglePhotoUpload(sub.number, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal: Create New Matchday */}
      {showNewMatchdayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleCreateNewMatchdaySubmit} className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-blue-400" />
              <span>Criar Nova Jornada da Época</span>
            </h3>
            <p className="text-xs text-slate-400">
              O plantel e as fotos dos jogadores são mantidos automaticamente. Só precisas de indicar o número da nova jornada e o adversário:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número da Jornada (ex: 5ª, 6ª, 7ª...)
              </label>
              <input
                type="text"
                required
                value={newRoundInput}
                onChange={(e) => setNewRoundInput(e.target.value)}
                placeholder="Ex: 5ª"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Próximo Adversário
              </label>
              <select
                value={newOpponent}
                onChange={(e) => setNewOpponent(e.target.value)}
                className="w-full bg-slate-950 text-white font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer mb-2"
              >
                <option value="">-- Escolher da Lista da Liga --</option>
                {leagueTeams.map((t) => (
                  <option key={t.id || t.name} value={t.name}>
                    {t.name} {t.logoUrl ? '🛡️ (Com Emblema)' : ''}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={newOpponent}
                onChange={(e) => setNewOpponent(e.target.value)}
                placeholder="Ou escreva novo adversário"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs text-white uppercase font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Onde é o Jogo?
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewIsHome(true)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    newIsHome ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EM CASA 🏠
                </button>
                <button
                  type="button"
                  onClick={() => setNewIsHome(false)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    !newIsHome ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  FORA ✈️
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewMatchdayModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Criar e Começar Jornada
              </button>
            </div>
          </form>
        </div>
      )}

      {/* League Badges Manager Modal */}
      {showLeagueBadgesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Base de Dados de Emblemas da Liga AFAST
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Os emblemas carregados ficam gravados na memória para todas as jornadas
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLeagueBadgesModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Top action: Batch upload */}
            <div className="py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70">
              <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Carregar Lote de Emblemas (Ficheiros)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBatchOpponentLogos}
                  className="hidden"
                />
              </label>

              {/* Add new team manually */}
              <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                <input
                  type="text"
                  placeholder="Nome do Novo Clube"
                  value={newTeamNameInput}
                  onChange={(e) => setNewTeamNameInput(e.target.value)}
                  className="glass-input px-2.5 py-1.5 rounded-xl text-xs text-white uppercase flex-1 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTeamNameInput.trim()) {
                      const updated = upsertLeagueTeam(newTeamNameInput.trim(), null)
                      setLeagueTeams([...updated])
                      setNewTeamNameInput('')
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                >
                  + Adicionar
                </button>
              </div>
            </div>

            {/* Teams List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
              {/* Permanent AD Guimarei */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-950 border border-blue-400 flex items-center justify-center overflow-hidden">
                    {myClub.crestUrl ? (
                      <img src={myClub.crestUrl} alt="ADG" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-[11px] font-black text-blue-300">ADG</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{myClub.name}</span>
                    <span className="text-[10px] text-blue-400 block font-semibold">O Nosso Clube (Permanente)</span>
                  </div>
                </div>

                <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all">
                  <span>Alterar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadMyClubLogo}
                    className="hidden"
                  />
                </label>
              </div>

              {/* League Opponents */}
              {leagueTeams.map((team) => (
                <div key={team.id || team.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Shield className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">{team.name}</span>
                      <span className={`text-[10px] block ${team.logoUrl ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {team.logoUrl ? '✓ Emblema Configurado' : 'Sem Emblema'}
                      </span>
                    </div>
                  </div>

                  <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all">
                    <span>{team.logoUrl ? 'Substituir' : 'Carregar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const updated = upsertLeagueTeam(team.name, event.target.result)
                            setLeagueTeams([...updated])
                            if ((matchDetails.opponentName || '').toUpperCase() === team.name.toUpperCase()) {
                              setMatchDetails(prev => ({ ...prev, opponentLogoUrl: event.target.result }))
                            }
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowLeagueBadgesModal(false)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Paste Modal */}
      {showQuickPaste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">
              Colar Lista da {matchDetails.roundNumber} Jornada
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Cole a convocatória com os 11 titulares e os 7 suplentes:
            </p>

            <textarea
              rows={9}
              value={quickPasteText}
              onChange={(e) => setQuickPasteText(e.target.value)}
              placeholder={`1 Miguel\n2 Tiago\n3 Diogo (C)\n4 Rúben\n5 André\n6 João\n7 Gonçalo\n8 Bruno\n9 Pedro\n10 Rafael\n11 Bernardo\n\nSuplentes:\n12 Luís (GR)\n13 Daniel\n14 Francisco\n15 Tomás\n16 Rodrigo\n17 Martim\n18 Afonso`}
              className="w-full glass-input px-3.5 py-2.5 rounded-2xl text-xs text-white font-mono focus:outline-none resize-none"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowQuickPaste(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => parsePlayerListString(quickPasteText)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Importar Lista
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

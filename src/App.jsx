import React, { useState } from 'react'
import Navbar from './components/Navbar'
import LineupStudio from './components/LineupStudio/LineupStudio'
import ResultStudio from './components/ResultStudio/ResultStudio'
import WatermarkStudio from './components/WatermarkStudio/WatermarkStudio'
import VideoStudio from './components/VideoStudio/VideoStudio'
import MatchdayHeaderBar from './components/Common/MatchdayHeaderBar'
import ErrorBoundary from './components/Common/ErrorBoundary'
import {
  loadMatchdays,
  saveAllMatchdays,
  getActiveMatchdayId,
  setActiveMatchdayId,
  createNewMatchday,
  deleteMatchday
} from './services/matchdayStorage'

export default function App() {
  const [activeTab, setActiveTab] = useState('generator')
  const [forwardedImage, setForwardedImage] = useState(null)

  // Season Matchdays state (governs both Lineup & Result studios)
  const [matchdaysList, setMatchdaysList] = useState(() => loadMatchdays())
  const [currentMatchdayId, setCurrentMatchdayId] = useState(() => getActiveMatchdayId())

  const currentMatchday = matchdaysList.find(m => m.id === currentMatchdayId) || matchdaysList[0]

  // Switch active matchday
  const handleSwitchMatchday = (id) => {
    setCurrentMatchdayId(id)
    setActiveMatchdayId(id)
  }

  // Create new matchday
  const handleAddMatchday = (roundNumber) => {
    const created = createNewMatchday(roundNumber)
    const updatedList = loadMatchdays()
    setMatchdaysList(updatedList)
    setCurrentMatchdayId(created.id)
  }

  // Delete matchday
  const handleDeleteMatchday = (id) => {
    const updatedList = deleteMatchday(id)
    setMatchdaysList(updatedList)
    if (updatedList.length > 0) {
      setCurrentMatchdayId(updatedList[0].id)
    }
  }

  // Update current matchday properties (templates, starters, subs, result)
  const handleUpdateCurrentMatchday = (updates) => {
    setMatchdaysList(prev => {
      const nextList = prev.map(m => {
        if (m.id === currentMatchdayId) {
          return { ...m, ...updates }
        }
        return m
      })
      saveAllMatchdays(nextList)
      return nextList
    })
  }

  // Handler to forward image from Lineup / Result Studio to Watermark tab
  const handleSendToWatermark = (dataUrl) => {
    setForwardedImage(dataUrl)
    setActiveTab('watermark')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <ErrorBoundary>
        <main className="flex-1">
          {/* Matchday Header Bar - Unifies Jornadas for Lineup & Result */}
          {(activeTab === 'generator' || activeTab === 'result') && (
            <MatchdayHeaderBar
              matchdaysList={matchdaysList}
              currentMatchdayId={currentMatchdayId}
              onSwitchMatchday={handleSwitchMatchday}
              onAddMatchday={handleAddMatchday}
              onDeleteMatchday={handleDeleteMatchday}
              activeStudio={activeTab}
              onSwitchStudio={setActiveTab}
            />
          )}

          {activeTab === 'generator' && (
            <LineupStudio
              currentMatchday={currentMatchday}
              onUpdateMatchday={handleUpdateCurrentMatchday}
              onSendToWatermark={handleSendToWatermark}
              onSwitchToResult={() => setActiveTab('result')}
            />
          )}

          {activeTab === 'result' && (
            <ResultStudio
              currentMatchday={currentMatchday}
              onUpdateMatchday={handleUpdateCurrentMatchday}
              onSendToWatermark={handleSendToWatermark}
              onSwitchToLineup={() => setActiveTab('generator')}
            />
          )}

          {activeTab === 'video' && (
            <VideoStudio />
          )}

          {activeTab === 'watermark' && (
            <WatermarkStudio
              initialImage={forwardedImage}
            />
          )}
        </main>
      </ErrorBoundary>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <span>Desenvolvido para criar o 11 inicial, resultados de jogo por jornada, editar vídeos e aplicar marcas de água.</span>
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setActiveTab('generator')} className="hover:text-emerald-400 transition-colors">
              11 Inicial & Suplentes
            </button>
            <button onClick={() => setActiveTab('result')} className="hover:text-amber-400 transition-colors">
              Resultado de Jogo
            </button>
            <button onClick={() => setActiveTab('video')} className="hover:text-pink-400 transition-colors">
              Editor de Vídeo
            </button>
            <button onClick={() => setActiveTab('watermark')} className="hover:text-cyan-400 transition-colors">
              Marcas de Água
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

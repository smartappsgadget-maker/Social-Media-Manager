import React, { useState } from 'react'
import Navbar from './components/Navbar'
import LineupStudio from './components/LineupStudio/LineupStudio'
import WatermarkStudio from './components/WatermarkStudio/WatermarkStudio'
import VideoStudio from './components/VideoStudio/VideoStudio'

export default function App() {
  const [activeTab, setActiveTab] = useState('generator')
  const [forwardedImage, setForwardedImage] = useState(null)

  // Handler to forward image from Lineup Studio to Watermark tab
  const handleSendToWatermark = (dataUrl) => {
    setForwardedImage(dataUrl)
    setActiveTab('watermark')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'generator' && (
          <LineupStudio
            onSendToWatermark={handleSendToWatermark}
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

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <span>Desenvolvido para criar o 11 inicial e suplentes, editar vídeos e aplicar marcas de água de forma prática.</span>
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setActiveTab('generator')} className="hover:text-emerald-400 transition-colors">
              11 Inicial & Suplentes
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

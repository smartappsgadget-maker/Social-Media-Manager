import React, { useState } from 'react'
import { 
  Shirt, 
  Trophy,
  Stamp, 
  Video, 
  HelpCircle, 
  Layers, 
  ExternalLink,
  X,
  CheckCircle2
} from 'lucide-react'

export default function Navbar({ activeTab, setActiveTab }) {
  const [showHelp, setShowHelp] = useState(false)

  const tabs = [
    {
      id: 'generator',
      label: '11 Inicial',
      icon: Shirt,
      desc: '11 Inicial & 7 Suplentes'
    },
    {
      id: 'result',
      label: 'Resultado de Jogo',
      icon: Trophy,
      desc: 'Placar & Marcadores de Golos'
    },
    {
      id: 'video',
      label: 'Editor de Vídeo',
      icon: Video,
      desc: 'Corte, Formatos & Overlays'
    },
    {
      id: 'watermark',
      label: 'Marcas de Água',
      icon: Stamp,
      desc: 'Individual ou em Lote'
    }
  ]

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  CreatorFlow
                </span>
                <span className="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  STUDIO
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800/80">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors"
                title="Guia & Instruções"
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Ajuda & Dicas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto px-3 py-2 border-t border-slate-800/60 gap-1 bg-slate-900/60">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Como Funciona o CreatorFlow Studio</h3>
                <p className="text-xs text-slate-400">A tua central completa para criação e edição de conteúdos</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">1. Templates de 11 Inicial & Suplentes</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Carrega a imagem de fundo que quiseres (relvado, estádio ou imagem da equipa). Insere os 11 jogadores titulares com os seus números, posições e capitão, define os suplentes e o treinador, escolhe a formação tática (4-3-3, 4-4-2, etc.) e gera cartazes de dia de jogo com qualidade profissional de transmissão televisiva!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">2. Marcas de Água em Lote (Batch)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Arrasta dezenas de fotografias ao mesmo tempo. Aplica o teu logótipo ou texto de direitos de autor em segundos, com opção de grelha diagonal (modo anti-roubo) e download de tudo num ficheiro .ZIP com um único clique.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">3. Editor de Vídeo Fácil & Prático</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Corta o início e o fim de vídeos com a linha de tempo visual, converte qualquer vídeo para o formato 9:16 (TikTok/Reels com fundo desfocado), adiciona faixas de texto chamativo e marcas de água, com exportação rápida direta no navegador.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
              >
                Entendido, Vamos Começar!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

import React, { useState } from 'react'
import { Sparkles, Wand2, RefreshCw, LayoutTemplate } from 'lucide-react'
import { ASPECT_RATIOS, VISUAL_STYLES } from '../../data/templates'

export const INSPIRATION_PROMPTS = [
  'Promoção relâmpago de 40% em ténis desportivos até domingo',
  '3 segredos para aumentar o alcance orgânico no Instagram',
  'Frase de mentalidade: O sucesso é construído nos dias em que não te apetece treinar',
  'Lançamento oficial da nova mentoria de negócios digitais',
  'Alerta de última hora: Nova funcionalidade surpreendente lançada hoje',
  'Café especial 100% arábica com notas de caramelo e avelã'
]

export default function PromptBar({ onGenerate, isGenerating }) {
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [style, setStyle] = useState('modern-dark')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!prompt.trim() || isGenerating) return
    onGenerate(prompt.trim(), { aspectRatio, style })
  }

  const handleQuickPrompt = (p) => {
    setPrompt(p)
    onGenerate(p, { aspectRatio, style })
  }

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Criador Inteligente de Conteúdos</h2>
            <p className="text-xs text-slate-400">Diz o que queres e a IA gera a imagem, os textos, o design e as legendas</p>
          </div>
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Formato:</span>
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.id}
                type="button"
                onClick={() => setAspectRatio(ratio.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                  aspectRatio === ratio.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={ratio.desc}
              >
                {ratio.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Prompt Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Promoção de 50% em sapatilhas de corrida, ou 3 dicas para organizar a tua rotina..."
              className="w-full glass-input px-4 py-3.5 pr-10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>A Gerar Conteúdo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar com IA</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Inspiration Pills */}
      <div className="mt-4 pt-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-300">Sugestões Rápidas:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {INSPIRATION_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPrompt(p)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/40 transition-colors text-left truncate max-w-xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

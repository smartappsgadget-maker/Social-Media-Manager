import React, { useState } from 'react'
import { Copy, Check, Camera, Share2, Sparkles, Hash } from 'lucide-react'

export default function CaptionPanel({ captions }) {
  const [activeNetwork, setActiveNetwork] = useState('instagram')
  const [copiedKey, setCopiedKey] = useState(null)

  if (!captions) return null

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/80 mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Legendas & Hashtags Estratégicas com IA</h3>
            <p className="text-xs text-slate-400">Copys prontas a publicar otimizadas para engajamento em cada rede</p>
          </div>
        </div>

        {/* Network switch */}
        <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveNetwork('instagram')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              activeNetwork === 'instagram'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Instagram
          </button>
          <button
            onClick={() => setActiveNetwork('tiktok')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              activeNetwork === 'tiktok'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            TikTok
          </button>
          <button
            onClick={() => setActiveNetwork('linkedin')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              activeNetwork === 'linkedin'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LinkedIn
          </button>
        </div>
      </div>

      {/* Caption Content Box */}
      <div className="relative p-4 rounded-2xl bg-slate-950/80 border border-slate-800 font-sans text-sm text-slate-200 whitespace-pre-line leading-relaxed">
        {captions[activeNetwork]}

        <button
          onClick={() => handleCopy(captions[activeNetwork], activeNetwork)}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-all shadow-sm"
        >
          {copiedKey === activeNetwork ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Legenda</span>
            </>
          )}
        </button>
      </div>

      {/* Hashtags section */}
      {captions.hashtags && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 overflow-hidden mr-3">
            <Hash className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{captions.hashtags}</span>
          </div>
          <button
            onClick={() => handleCopy(captions.hashtags, 'hashtags')}
            className="flex-shrink-0 flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            {copiedKey === 'hashtags' ? 'Hashtags Copiadas!' : 'Copiar Hashtags'}
          </button>
        </div>
      )}
    </div>
  )
}

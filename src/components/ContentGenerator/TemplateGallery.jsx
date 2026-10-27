import React, { useState } from 'react'
import { TEMPLATE_CATEGORIES, INITIAL_TEMPLATES } from '../../data/templates'
import { Sparkles, Tag, Quote, Lightbulb, Bell, Mic, Star, Calendar } from 'lucide-react'

const ICON_MAP = {
  Sparkles,
  Tag,
  Quote,
  Lightbulb,
  Bell,
  Mic,
  Star,
  Calendar
}

export default function TemplateGallery({ onSelectTemplate, currentTemplateId }) {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredTemplates = selectedCategory === 'all'
    ? INITIAL_TEMPLATES
    : INITIAL_TEMPLATES.filter(t => t.category === selectedCategory)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Biblioteca de Templates Prontos</h3>
          <p className="text-xs text-slate-400">Escolhe um modelo base para personalizar ao teu gosto</p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-none">
        {TEMPLATE_CATEGORIES.map(cat => {
          const Icon = ICON_MAP[cat.icon] || Sparkles
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          )
        })}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {filteredTemplates.map((template) => {
          const isSelected = currentTemplateId === template.id
          return (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`group cursor-pointer rounded-2xl p-3 border transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50'
                  : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900 hover:scale-[1.02]'
              }`}
            >
              {/* Mini visual mockup preview */}
              <div 
                className="w-full aspect-square rounded-xl overflow-hidden relative flex flex-col justify-between p-2 shadow-inner border border-white/10"
                style={{
                  background: template.bgGradient || '#1e1b4b',
                  backgroundImage: template.bgImage ? `url(${template.bgImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]" />
                
                {/* Badge mockup */}
                <div className="relative z-10 self-start">
                  <span 
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white inline-block shadow-sm"
                    style={{ backgroundColor: template.accentColor }}
                  >
                    {template.badge.slice(0, 14)}...
                  </span>
                </div>

                {/* Headline mockup */}
                <div className="relative z-10 my-auto text-center px-1">
                  <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight">
                    {template.headline}
                  </p>
                </div>

                {/* Aspect ratio label */}
                <div className="relative z-10 flex justify-between items-center text-[9px] text-slate-300 font-medium">
                  <span className="px-1 py-0.5 rounded bg-black/60">{template.aspectRatio}</span>
                  <span className="text-[8px] opacity-75">{template.category}</span>
                </div>
              </div>

              <div className="mt-2 text-center">
                <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-300">
                  {template.title}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

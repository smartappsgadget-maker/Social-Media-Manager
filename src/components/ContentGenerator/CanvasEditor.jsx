import React, { useRef, useEffect, useState } from 'react'
import { 
  Download, 
  Upload, 
  Sparkles, 
  Type, 
  Palette, 
  Image as ImageIcon, 
  Layers, 
  ArrowRight,
  Maximize2,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react'
import { renderTemplateToCanvas } from '../../services/canvasRenderer'
import { getAIImageUrl } from '../../services/aiGenerator'
import confetti from 'canvas-confetti'

const FONTS = [
  { id: 'Montserrat', name: 'Montserrat (Moderno)' },
  { id: 'Bebas Neue', name: 'Bebas Neue (Impacto/Viral)' },
  { id: 'Poppins', name: 'Poppins (Elegante Clean)' },
  { id: 'Playfair Display', name: 'Playfair (Luxo/Editorial)' },
  { id: 'Oswald', name: 'Oswald (Notícias/Forte)' },
  { id: 'Inter', name: 'Inter (Padrão Sofisticado)' }
]

const ACCENT_PRESETS = [
  '#f59e0b', // Amber/Yellow
  '#ef4444', // Red
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316'  // Orange
]

export default function CanvasEditor({
  template,
  onUpdateTemplate,
  onSendToWatermark
}) {
  const canvasRef = useRef(null)
  const [activeTab, setActiveTab] = useState('text') // 'text' | 'visuals' | 'image'
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState('png') // 'png' | 'jpeg'
  const [copiedNotification, setCopiedNotification] = useState(false)

  // Re-render canvas whenever template changes
  useEffect(() => {
    if (canvasRef.current && template) {
      renderTemplateToCanvas(canvasRef.current, template, 1)
    }
  }, [template])

  // Handle image upload from user computer
  const handleCustomImageUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpdateTemplate({
          ...template,
          bgImage: event.target.result,
          bgType: 'custom'
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpdateTemplate({
          ...template,
          logoUrl: event.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Regenerate background image with AI
  const handleRegenerateAIImage = () => {
    setIsRegeneratingImage(true)
    const prompt = template.aiImagePrompt || template.title || 'abstract modern visual marketing'
    const newImageUrl = getAIImageUrl(prompt, template.width || 1080, template.height || 1080)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = newImageUrl
    img.onload = () => {
      onUpdateTemplate({
        ...template,
        bgImage: newImageUrl,
        bgType: 'ai-image'
      })
      setIsRegeneratingImage(false)
    }
    img.onerror = () => {
      // If error, just update url
      onUpdateTemplate({
        ...template,
        bgImage: newImageUrl,
        bgType: 'ai-image'
      })
      setIsRegeneratingImage(false)
    }
  }

  // Download high-resolution image
  const handleDownload = () => {
    if (!canvasRef.current) return
    const mime = downloadFormat === 'jpeg' ? 'image/jpeg' : 'image/png'
    const ext = downloadFormat === 'jpeg' ? 'jpg' : 'png'
    const dataUrl = canvasRef.current.toDataURL(mime, 0.95)

    const link = document.createElement('a')
    link.download = `criacao-conteudo-${Date.now()}.${ext}`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Trigger celebratory confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    })
  }

  // Send current image to other tabs
  const handleForwardToWatermark = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    onSendToWatermark(dataUrl)
  }

  const handleForwardToPhotoEditor = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    onSendToPhotoEditor(dataUrl)
  }

  if (!template) return null

  const isStory = template.aspectRatio === '9:16'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
      
      {/* LEFT: Live Interactive Canvas Preview */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center">
          
          <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">
                Pré-visualização em Tempo Real ({template.aspectRatio})
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value)}
                className="bg-slate-800 text-xs text-slate-300 rounded-lg px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="png">PNG (Alta Fidelidade)</option>
                <option value="jpeg">JPG (Mais Leve)</option>
              </select>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar</span>
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div 
            className="relative flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-slate-800 max-h-[600px] w-full"
            style={{ backgroundColor: '#090d16' }}
          >
            <canvas
              ref={canvasRef}
              className={`max-h-[580px] w-auto object-contain transition-all duration-150 ${
                isStory ? 'aspect-[9/16]' : 'aspect-square'
              }`}
            />
          </div>

          {/* Quick Forward Actions */}
          <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium">Usar este design noutras ferramentas:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleForwardToWatermark}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              >
                <span>Proteger com Marca de Água</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Customization Controls Panel */}
      <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/90">
        
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 pb-3 mb-5 gap-2">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'text'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Textos & Tipografia</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'image'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Imagem & Fundo</span>
          </button>

          <button
            onClick={() => setActiveTab('visuals')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'visuals'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Cores & Marca</span>
          </button>
        </div>

        {/* TAB 1: TEXTS */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            
            {/* Badge */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Selo / Tag Superior
              </label>
              <input
                type="text"
                value={template.badge || ''}
                onChange={(e) => onUpdateTemplate({ ...template, badge: e.target.value })}
                placeholder="Ex: PROMOÇÃO LIMITADA 🔥"
                className="w-full glass-input px-3 py-2 rounded-xl text-sm text-white focus:outline-none"
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Título Principal (Headline de Alto Impacto)
              </label>
              <textarea
                rows={2}
                value={template.headline || ''}
                onChange={(e) => onUpdateTemplate({ ...template, headline: e.target.value })}
                placeholder="Ex: 50% DE DESCONTO EM TUDO"
                className="w-full glass-input px-3 py-2 rounded-xl text-sm text-white focus:outline-none resize-none font-bold"
              />
            </div>

            {/* Headline Font Family */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fonte do Título
              </label>
              <select
                value={template.fontHeadline || 'Montserrat'}
                onChange={(e) => onUpdateTemplate({ ...template, fontHeadline: e.target.value })}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none bg-slate-900"
              >
                {FONTS.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Subheadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subtítulo / Descrição / Tópicos
              </label>
              <textarea
                rows={3}
                value={template.subheadline || ''}
                onChange={(e) => onUpdateTemplate({ ...template, subheadline: e.target.value })}
                placeholder="Escreve detalhes ou pontos numerados..."
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            {/* CTA */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Botão de Ação (CTA)
              </label>
              <input
                type="text"
                value={template.cta || ''}
                onChange={(e) => onUpdateTemplate({ ...template, cta: e.target.value })}
                placeholder="Ex: COMPRA JÁ NO LINK DA BIO"
                className="w-full glass-input px-3 py-2 rounded-xl text-sm text-white focus:outline-none font-semibold"
              />
            </div>
          </div>
        )}

        {/* TAB 2: IMAGE & BACKGROUND */}
        {activeTab === 'image' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Imagem de Fundo Gerada por IA
              </label>
              <button
                type="button"
                onClick={handleRegenerateAIImage}
                disabled={isRegeneratingImage}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isRegeneratingImage ? 'animate-spin' : ''}`} />
                <span>{isRegeneratingImage ? 'A Gerar Nova Imagem com IA...' : 'Gerar Nova Variação com IA'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Ou Carregar Imagem do Teu Computador
              </label>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-dashed border-slate-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Escolher Ficheiro de Imagem</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Background Opacity Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Visibilidade da Imagem de Fundo
                </label>
                <span className="text-xs text-indigo-400 font-bold">
                  {Math.round((template.bgOpacity || 0.4) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={template.bgOpacity || 0.4}
                onChange={(e) => onUpdateTemplate({ ...template, bgOpacity: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        )}

        {/* TAB 3: VISUALS & BRANDING */}
        {activeTab === 'visuals' && (
          <div className="space-y-5">
            {/* Accent Color Preset Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Cor de Destaque (Selo & Botão CTA)
              </label>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {ACCENT_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onUpdateTemplate({ ...template, accentColor: color })}
                    className={`w-7 h-7 rounded-xl border-2 transition-transform ${
                      template.accentColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={template.accentColor || '#f59e0b'}
                  onChange={(e) => onUpdateTemplate({ ...template, accentColor: e.target.value })}
                  className="w-7 h-7 rounded-xl cursor-pointer bg-transparent border-0"
                  title="Escolher cor personalizada"
                />
              </div>
            </div>

            {/* Logo upload */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Logótipo da Marca (Canto Superior)
              </label>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>{template.logoUrl ? 'Substituir Logótipo' : 'Carregar Logótipo PNG Transparente'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {template.logoUrl && (
                <button
                  type="button"
                  onClick={() => onUpdateTemplate({ ...template, logoUrl: null })}
                  className="text-xs text-rose-400 hover:underline mt-1.5 block"
                >
                  Remover logótipo
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

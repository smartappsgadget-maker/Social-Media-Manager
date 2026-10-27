import React, { useState, useRef, useEffect } from 'react'
import { 
  Image as ImageIcon, 
  Upload, 
  Download, 
  Sliders, 
  Sparkles, 
  Type, 
  RefreshCcw, 
  Layers,
  Palette,
  Film,
  Frame,
  Check,
  ChevronRight,
  Sun
} from 'lucide-react'
import { PHOTOSHOP_TEMPLATES, PHOTOSHOP_DOC_PRESETS, DUOTONE_PALETTES } from '../../data/photoshopTemplates'
import { renderPhotoshopTemplateToCanvas } from '../../services/photoshopRenderer'
import PhotoshopAdjustmentsPanel from './PhotoshopAdjustmentsPanel'
import confetti from 'canvas-confetti'

// Sample photo if user opens studio without an uploaded file
const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80'

export default function PhotoStudio({ initialImage }) {
  const [imageSrc, setImageSrc] = useState(initialImage || SAMPLE_PHOTO)
  const [imageElement, setImageElement] = useState(null)

  // Selected Photoshop template
  const [selectedTemplate, setSelectedTemplate] = useState(PHOTOSHOP_TEMPLATES[0]) // Fine Art Gallery default
  const [activeTab, setActiveTab] = useState('adjust') // 'adjust' | 'templates' | 'text' | 'effects'

  // Photoshop-grade Adjustments (Identical to Adobe Photoshop)
  const [psAdjustments, setPsAdjustments] = useState({
    brightness: 0,         // -100 to +100
    contrast: 0,           // -100 to +100
    inBlack: 0,            // 0 to 255
    gamma: 1.0,            // 0.1 to 3.0
    inWhite: 255,          // 0 to 255
    exposure: 0,           // -2.5 to +2.5 EV
    offset: 0,             // -0.1 to +0.1
    hue: 0,                // -180 to +180 deg
    saturation: 0,         // -100 to +100
    lightness: 0,          // -100 to +100
    colorBalanceCR: 0,     // Cyan <-> Red
    colorBalanceMG: 0,     // Magenta <-> Green
    colorBalanceYB: 0,     // Yellow <-> Blue
    curvesPreset: 'linear' // linear | medium-contrast | strong-contrast | lighter | darker | cross-process
  })

  // Photoshop Camera Raw Effects
  const [grain, setGrain] = useState(0)
  const [vignette, setVignette] = useState(0)
  const [selectedDuotone, setSelectedDuotone] = useState(DUOTONE_PALETTES[0])

  // Editable template texts
  const [customTexts, setCustomTexts] = useState({
    title: '',
    subtitle: '',
    credit: '',
    tagline: '',
    releaseDate: '',
    noteText: '',
    issueDate: ''
  })

  const canvasRef = useRef(null)

  // Load image element whenever imageSrc changes
  useEffect(() => {
    if (imageSrc) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        setImageElement(img)
      }
      img.src = imageSrc
    }
  }, [imageSrc])

  // Update custom texts default values when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setCustomTexts({
        title: selectedTemplate.title || '',
        subtitle: selectedTemplate.subtitle || '',
        credit: selectedTemplate.credit || '',
        tagline: selectedTemplate.tagline || '',
        releaseDate: selectedTemplate.releaseDate || '',
        noteText: selectedTemplate.noteText || '',
        issueDate: selectedTemplate.issueDate || ''
      })
    }
  }, [selectedTemplate])

  // Render on canvas whenever any setting changes
  useEffect(() => {
    if (!canvasRef.current || !imageElement) return

    renderPhotoshopTemplateToCanvas(
      canvasRef.current,
      imageElement,
      selectedTemplate,
      {
        grain,
        vignette,
        duotonePalette: selectedDuotone,
        customTexts,
        psAdjustments
      }
    )
  }, [
    imageElement,
    selectedTemplate,
    psAdjustments,
    grain,
    vignette,
    selectedDuotone,
    customTexts
  ])

  // Handle custom file upload
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setImageSrc(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Reset all adjustments to Photoshop neutral zero
  const resetAllAdjustments = () => {
    setPsAdjustments({
      brightness: 0,
      contrast: 0,
      inBlack: 0,
      gamma: 1.0,
      inWhite: 255,
      exposure: 0,
      offset: 0,
      hue: 0,
      saturation: 0,
      lightness: 0,
      colorBalanceCR: 0,
      colorBalanceMG: 0,
      colorBalanceYB: 0,
      curvesPreset: 'linear'
    })
    setGrain(0)
    setVignette(0)
  }

  // Download high-resolution photo
  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `photoshop-edit-${selectedTemplate?.id || 'foto'}-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL('image/png', 0.95)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/25">
              <Sun className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Ajustes de Imagem & Templates Photoshop
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Photoshop Engine • Níveis & Curvas
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Controlos precisos idênticos ao Adobe Photoshop: Brilho/Contraste (-100 a +100), Níveis (Levels com Histograma), Curvas (Curves), Matiz/Saturação e Equilíbrio de Cores.
          </p>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer border border-slate-700/60 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Carregar Foto</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Baixar em Alta Resolução</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Live Canvas View */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center">
            
            {/* Top Canvas Bar */}
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">
                  {selectedTemplate?.name || 'Edição Livre'} ({selectedTemplate?.aspectRatio || 'Auto'})
                </span>
              </div>

              <button
                onClick={resetAllAdjustments}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
              >
                <RefreshCcw className="w-3 h-3" />
                <span>Repor Ajustes a Zero</span>
              </button>
            </div>

            {/* Canvas Container */}
            <div className="relative w-full max-h-[580px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 p-2">
              <canvas
                ref={canvasRef}
                className="max-h-[550px] w-auto max-w-full object-contain shadow-2xl rounded-lg"
              />
            </div>

            <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Fidelidade profissional Adobe Photoshop (RGB 24-bit).</span>
              <span className="font-mono">{selectedTemplate?.canvasWidth || 1200}x{selectedTemplate?.canvasHeight || 1200}px</span>
            </div>

          </div>
        </div>

        {/* RIGHT: Photoshop Controls Panel */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/90 space-y-6">
          
          {/* Main Mode Tabs */}
          <div className="flex border-b border-slate-800 pb-3 gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'adjust'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Ajustes Photoshop</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Frame className="w-3.5 h-3.5" />
              <span>Templates & Mockups</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Textos</span>
            </button>

            <button
              onClick={() => setActiveTab('effects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'effects'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Camera Raw</span>
            </button>
          </div>

          {/* TAB 1: ADOBE PHOTOSHOP ADJUSTMENTS (Levels, Brightness/Contrast, Curves, HSL, Color Balance, Exposure) */}
          {activeTab === 'adjust' && (
            <PhotoshopAdjustmentsPanel
              adjustments={psAdjustments}
              onUpdateAdjustments={setPsAdjustments}
              canvasRef={canvasRef}
              onReset={resetAllAdjustments}
            />
          )}

          {/* TAB 2: PHOTOSHOP TEMPLATES SELECTION */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Escolhe o Modelo de Estilo Photoshop:
              </label>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {/* Raw Photo Option */}
                <div
                  onClick={() => setSelectedTemplate({ id: 'none', name: 'Foto Original Sem Moldura', aspectRatio: 'Auto' })}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedTemplate?.id === 'none'
                      ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/50'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">
                      RAW
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Foto Limpa (Sem Template)</h4>
                      <p className="text-[11px] text-slate-400">Edição direta de cor e iluminação</p>
                    </div>
                  </div>
                  {selectedTemplate?.id === 'none' && (
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {PHOTOSHOP_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate?.id === tmpl.id
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/50'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {tmpl.aspectRatio}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-blue-300">
                            {tmpl.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {tmpl.desc}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EDITABLE TEMPLATE TEXTS */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Personaliza os textos presentes no template selecionado:
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título Principal
                </label>
                <input
                  type="text"
                  value={customTexts.title}
                  onChange={(e) => setCustomTexts({ ...customTexts, title: e.target.value })}
                  placeholder="Ex: VOGUE, ORIGENS, etc."
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtítulo / Descrição
                </label>
                <input
                  type="text"
                  value={customTexts.subtitle}
                  onChange={(e) => setCustomTexts({ ...customTexts, subtitle: e.target.value })}
                  placeholder="Ex: Fotografia Autoral • Série Limitada"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {selectedTemplate?.id === 'fine-art-gallery' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Instituição / Museu / Ano
                  </label>
                  <input
                    type="text"
                    value={customTexts.credit}
                    onChange={(e) => setCustomTexts({ ...customTexts, credit: e.target.value })}
                    placeholder="Ex: MUSEU DE ARTE CONTEMPORÂNEA • 2026"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {selectedTemplate?.id === 'movie-poster' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Frase de Efeito (Tagline)
                  </label>
                  <input
                    type="text"
                    value={customTexts.tagline}
                    onChange={(e) => setCustomTexts({ ...customTexts, tagline: e.target.value })}
                    placeholder="Ex: UMA HISTÓRIA NUNCA ANTES CONTADA"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {selectedTemplate?.id === 'polaroid-retro' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nota Manuscrita da Polaroid
                  </label>
                  <input
                    type="text"
                    value={customTexts.noteText}
                    onChange={(e) => setCustomTexts({ ...customTexts, noteText: e.target.value })}
                    placeholder="Ex: Momentos inesquecíveis • 2026 ✨"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {selectedTemplate?.id === 'editorial-magazine' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data da Edição & Número
                  </label>
                  <input
                    type="text"
                    value={customTexts.issueDate}
                    onChange={(e) => setCustomTexts({ ...customTexts, issueDate: e.target.value })}
                    placeholder="Ex: OUTUBRO 2026 • Nº 342"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CAMERA RAW EFFECTS & DUOTONE */}
          {activeTab === 'effects' && (
            <div className="space-y-5">
              {/* Film Grain */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-slate-300 font-semibold">Grão de Película (Film Grain)</span>
                  <span className="text-blue-400 font-mono font-bold">{grain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={grain}
                  onChange={(e) => setGrain(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Radial Vignette */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-slate-300 font-semibold">Vinheta Radial (Vignette)</span>
                  <span className="text-blue-400 font-mono font-bold">{vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vignette}
                  onChange={(e) => setVignette(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Duotone Selector */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Paleta Gradient Map (Duotone)
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {DUOTONE_PALETTES.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDuotone(d)
                        if (selectedTemplate?.id !== 'duotone-spotify') {
                          setSelectedTemplate(PHOTOSHOP_TEMPLATES.find(t => t.id === 'duotone-spotify'))
                        }
                      }}
                      className={`p-2 rounded-xl flex items-center justify-between border transition-all ${
                        selectedDuotone.id === d.id && selectedTemplate?.id === 'duotone-spotify'
                          ? 'border-blue-500 bg-blue-950/40 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-semibold">{d.name}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: d.dark }} />
                        <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: d.light }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}

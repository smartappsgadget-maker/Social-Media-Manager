import React, { useState, useEffect, useRef } from 'react'
import { 
  Sun, 
  BarChart2, 
  Activity, 
  Palette, 
  Scale, 
  Zap, 
  RefreshCcw,
  Sliders
} from 'lucide-react'
import { calculateHistogram } from '../../services/photoshopAdjustments'

export default function PhotoshopAdjustmentsPanel({
  adjustments,
  onUpdateAdjustments,
  canvasRef,
  onReset
}) {
  const [activeTab, setActiveTab] = useState('brightness') // 'brightness' | 'levels' | 'curves' | 'hsl' | 'color-balance' | 'exposure'
  const [histogramData, setHistogramData] = useState(null)
  const histogramCanvasRef = useRef(null)

  // Draw Photoshop-grade histogram whenever canvas changes
  useEffect(() => {
    if (!canvasRef?.current) return

    try {
      const mainCanvas = canvasRef.current
      const ctx = mainCanvas.getContext('2d')
      const imgData = ctx.getImageData(0, 0, Math.min(mainCanvas.width, 400), Math.min(mainCanvas.height, 400))
      const hist = calculateHistogram(imgData)
      setHistogramData(hist)

      if (histogramCanvasRef.current) {
        drawHistogramCanvas(histogramCanvasRef.current, hist)
      }
    } catch {
      // Ignore if tainted
    }
  }, [canvasRef, adjustments])

  const drawHistogramCanvas = (canvas, hist) => {
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // Background grid
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, w, h)

    // Draw Luminance Histogram Curve
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
    ctx.beginPath()
    ctx.moveTo(0, h)

    for (let i = 0; i < 256; i++) {
      const val = hist.luma[i] || 0
      const barH = (val / hist.max) * (h - 8)
      const x = (i / 255) * w
      const y = h - barH
      ctx.lineTo(x, y)
    }

    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()

    // Draw RGB lines overlay
    const drawChannel = (data, strokeColor) => {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 1.2
      ctx.beginPath()
      for (let i = 0; i < 256; i++) {
        const val = data[i] || 0
        const barH = (val / hist.max) * (h - 8)
        const x = (i / 255) * w
        const y = h - barH
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    drawChannel(hist.r, 'rgba(239, 68, 68, 0.7)')
    drawChannel(hist.g, 'rgba(34, 197, 94, 0.7)')
    drawChannel(hist.b, 'rgba(59, 130, 246, 0.7)')
  }

  // Update a single adjustment property
  const setVal = (key, val) => {
    onUpdateAdjustments({
      ...adjustments,
      [key]: val
    })
  }

  return (
    <div className="space-y-5">
      
      {/* 1. Real Photoshop Histogram Display */}
      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              Histograma RGB (Photoshop)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"/> R</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> G</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> B</span>
          </div>
        </div>

        <div className="w-full h-20 rounded-xl overflow-hidden border border-slate-800">
          <canvas
            ref={histogramCanvasRef}
            width={300}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1 px-1">
          <span>0 (Pretos)</span>
          <span>128 (Meios-tons)</span>
          <span>255 (Brancos)</span>
        </div>
      </div>

      {/* 2. Photoshop Adjustment Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'brightness', label: 'Brilho', icon: Sun },
          { id: 'levels', label: 'Níveis', icon: BarChart2 },
          { id: 'curves', label: 'Curvas', icon: Activity },
          { id: 'hsl', label: 'Matiz/Sat', icon: Palette },
          { id: 'color-balance', label: 'Equilíbrio', icon: Scale },
          { id: 'exposure', label: 'Exposição', icon: Zap }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 3. SUB-TAB: BRIGHTNESS / CONTRAST (Igual ao Photoshop) */}
      {activeTab === 'brightness' && (
        <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-white">Brilho / Contraste (Brightness / Contrast)</h4>
            <span className="text-[10px] text-slate-400">Escala Photoshop (-100 a +100)</span>
          </div>

          {/* Brightness */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300 font-semibold">Brilho:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="-100"
                  max="100"
                  value={adjustments.brightness}
                  onChange={(e) => setVal('brightness', parseInt(e.target.value) || 0)}
                  className="w-14 bg-slate-900 text-white font-mono text-xs px-1.5 py-0.5 rounded border border-slate-700 text-center"
                />
                <button
                  onClick={() => setVal('brightness', 0)}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                  title="Repor em 0"
                >
                  ↺
                </button>
              </div>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.brightness}
              onChange={(e) => setVal('brightness', parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300 font-semibold">Contraste:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="-100"
                  max="100"
                  value={adjustments.contrast}
                  onChange={(e) => setVal('contrast', parseInt(e.target.value) || 0)}
                  className="w-14 bg-slate-900 text-white font-mono text-xs px-1.5 py-0.5 rounded border border-slate-700 text-center"
                />
                <button
                  onClick={() => setVal('contrast', 0)}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                  title="Repor em 0"
                >
                  ↺
                </button>
              </div>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.contrast}
              onChange={(e) => setVal('contrast', parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      )}

      {/* 4. SUB-TAB: LEVELS (Níveis de Entrada & Gama) */}
      {activeTab === 'levels' && (
        <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-white">Níveis de Entrada (Input Levels)</h4>
            <span className="text-[10px] text-slate-400">Ctrl + L</span>
          </div>

          {/* Black Point */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300 font-semibold">Ponto Preto (Shadows):</span>
              <span className="font-mono text-blue-400 font-bold">{adjustments.inBlack}</span>
            </div>
            <input
              type="range"
              min="0"
              max={adjustments.inWhite - 10}
              value={adjustments.inBlack}
              onChange={(e) => setVal('inBlack', parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Gamma (Midtones) */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300 font-semibold">Gama / Meios-tons:</span>
              <span className="font-mono text-blue-400 font-bold">{adjustments.gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.05"
              value={adjustments.gamma}
              onChange={(e) => setVal('gamma', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* White Point */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300 font-semibold">Ponto Branco (Highlights):</span>
              <span className="font-mono text-blue-400 font-bold">{adjustments.inWhite}</span>
            </div>
            <input
              type="range"
              min={adjustments.inBlack + 10}
              max="255"
              value={adjustments.inWhite}
              onChange={(e) => setVal('inWhite', parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setVal('inBlack', 0)
                setVal('gamma', 1.0)
                setVal('inWhite', 255)
              }}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Repor Níveis Padrão (0 • 1.00 • 255)
            </button>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB: CURVES (Curvas de Tom do Photoshop) */}
      {activeTab === 'curves' && (
        <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-white">Curvas de Contraste (Curves)</h4>
            <span className="text-[10px] text-slate-400">Ctrl + M</span>
          </div>

          {/* Curves 4x4 Grid Mockup */}
          <div className="w-full h-24 bg-slate-900 rounded-xl relative border border-slate-800 overflow-hidden flex items-center justify-center p-2">
            <div className="w-full h-full grid grid-cols-4 grid-rows-4 border border-slate-800/80">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="border border-slate-800/40" />
              ))}
            </div>
            {/* Visual curve line */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-3">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(100,116,139,0.3)" strokeDasharray="3,3" />
                {adjustments.curvesPreset === 'strong-contrast' ? (
                  <path d="M 0,100 C 35,95 65,5 100,0" fill="none" stroke="#3b82f6" strokeWidth="3" />
                ) : adjustments.curvesPreset === 'medium-contrast' ? (
                  <path d="M 0,100 C 30,85 70,15 100,0" fill="none" stroke="#3b82f6" strokeWidth="3" />
                ) : adjustments.curvesPreset === 'lighter' ? (
                  <path d="M 0,100 Q 40,20 100,0" fill="none" stroke="#3b82f6" strokeWidth="3" />
                ) : adjustments.curvesPreset === 'darker' ? (
                  <path d="M 0,100 Q 60,80 100,0" fill="none" stroke="#3b82f6" strokeWidth="3" />
                ) : (
                  <line x1="0" y1="100" x2="100" y2="0" stroke="#3b82f6" strokeWidth="3" />
                )}
              </svg>
            </div>
          </div>

          {/* Curves Presets Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'linear', label: 'Linear (Padrão)' },
              { id: 'medium-contrast', label: 'Contraste Médio' },
              { id: 'strong-contrast', label: 'Curva S (Forte)' },
              { id: 'lighter', label: 'Clarear Curva' },
              { id: 'darker', label: 'Escurecer Curva' },
              { id: 'cross-process', label: 'Cross Process' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setVal('curvesPreset', c.id)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                  adjustments.curvesPreset === c.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. SUB-TAB: HUE / SATURATION (Matiz / Saturação) */}
      {activeTab === 'hsl' && (
        <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-white">Matiz / Saturação (Hue / Saturation)</h4>
            <span className="text-[10px] text-slate-400">Ctrl + U</span>
          </div>

          {/* Rainbow Spectral Reference Bar */}
          <div 
            className="w-full h-3 rounded-full shadow-inner"
            style={{
              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
            }}
          />

          {/* Hue */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300 font-semibold">Matiz (Hue):</span>
              <span className="font-mono text-blue-400 font-bold">{adjustments.hue}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={adjustments.hue}
              onChange={(e) => setVal('hue', parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Saturation */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300 font-semibold">Saturação:</span>
              <span className="font-mono text-blue-400 font-bold">{adjustments.saturation}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.saturation}
              onChange={(e) => setVal('saturation', parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Lightness */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300 font-semibold">Luminosidade:</span>
              <span className="font-mono text-blue-400 font-bold">{adjustments.lightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.lightness}
              onChange={(e) => setVal('lightness', parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      )}

      {/* 7. SUB-TAB: COLOR BALANCE (Equilíbrio de Cores) */}
      {activeTab === 'color-balance' && (
        <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-white">Equilíbrio de Cores (Color Balance)</h4>
            <span className="text-[10px] text-slate-400">Ctrl + B</span>
          </div>

          {/* Cyan - Red */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
              <span className="text-cyan-400">Ciano</span>
              <span className="font-mono text-white">{adjustments.colorBalanceCR}</span>
              <span className="text-rose-500">Vermelho</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.colorBalanceCR}
              onChange={(e) => setVal('colorBalanceCR', parseInt(e.target.value))}
              className="w-full accent-rose-500"
            />
          </div>

          {/* Magenta - Green */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
              <span className="text-pink-500">Magenta</span>
              <span className="font-mono text-white">{adjustments.colorBalanceMG}</span>
              <span className="text-emerald-400">Verde</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.colorBalanceMG}
              onChange={(e) => setVal('colorBalanceMG', parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Yellow - Blue */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[11px] font-bold">
              <span className="text-amber-400">Amarelo</span>
              <span className="font-mono text-white">{adjustments.colorBalanceYB}</span>
              <span className="text-blue-500">Azul</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.colorBalanceYB}
              onChange={(e) => setVal('colorBalanceYB', parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      )}

      {/* 8. SUB-TAB: EXPOSURE (Exposição EV) */}
      {activeTab === 'exposure' && (
        <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-white">Exposição (Exposure Stops)</h4>
            <span className="text-[10px] text-slate-400">EV Stops</span>
          </div>

          {/* EV Exposure */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300 font-semibold">Exposição:</span>
              <span className="font-mono text-blue-400 font-bold">{adjustments.exposure.toFixed(2)} EV</span>
            </div>
            <input
              type="range"
              min="-2.5"
              max="2.5"
              step="0.05"
              value={adjustments.exposure}
              onChange={(e) => setVal('exposure', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Offset */}
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-slate-300 font-semibold">Deslocamento (Offset):</span>
              <span className="font-mono text-blue-400 font-bold">{adjustments.offset.toFixed(3)}</span>
            </div>
            <input
              type="range"
              min="-0.1"
              max="0.1"
              step="0.005"
              value={adjustments.offset}
              onChange={(e) => setVal('offset', parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      )}

      {/* Quick Reset All Adjustments */}
      <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
        <span className="text-[11px] text-slate-500 font-medium">Adobe Photoshop Engine</span>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCcw className="w-3 h-3" />
          <span>Repor Todos os Ajustes (0)</span>
        </button>
      </div>

    </div>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import { 
  Stamp, 
  Upload, 
  Download, 
  Archive, 
  Image as ImageIcon, 
  Type, 
  Grid, 
  Trash2, 
  Check, 
  Eye, 
  Sliders, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react'
import { applyWatermarkToCanvas, loadImage } from '../../services/canvasRenderer'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import confetti from 'canvas-confetti'

const POSITIONS = [
  { id: 'top-left', label: 'Canto Sup. Esquerdo' },
  { id: 'top-center', label: 'Topo Centro' },
  { id: 'top-right', label: 'Canto Sup. Direito' },
  { id: 'middle-left', label: 'Centro Esquerda' },
  { id: 'center', label: 'Centro' },
  { id: 'middle-right', label: 'Centro Direita' },
  { id: 'bottom-left', label: 'Canto Inf. Esquerdo' },
  { id: 'bottom-center', label: 'Base Centro' },
  { id: 'bottom-right', label: 'Canto Inf. Direito' },
]

export default function WatermarkStudio({ initialImage }) {
  const [images, setImages] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  // Watermark configuration
  const [watermarkType, setWatermarkType] = useState('text') // 'text' | 'image'
  const [text, setText] = useState('@omeuinstagram')
  const [textColor, setTextColor] = useState('#ffffff')
  const [fontFamily, setFontFamily] = useState('Montserrat')
  const [fontSize, setFontSize] = useState(48)
  const [position, setPosition] = useState('bottom-right')
  const [opacity, setOpacity] = useState(0.85)
  const [scalePercent, setScalePercent] = useState(25)
  const [rotation, setRotation] = useState(0)
  const [isTiled, setIsTiled] = useState(false)
  const [hasShadow, setHasShadow] = useState(true)
  const [hasOutline, setHasOutline] = useState(true)
  const [outlineColor, setOutlineColor] = useState('#000000')

  // Logo state
  const [logoDataUrl, setLogoDataUrl] = useState(null)
  const [logoImgElement, setLogoImgElement] = useState(null)

  // Status
  const [isProcessingZip, setIsProcessingZip] = useState(false)
  const mainPreviewCanvasRef = useRef(null)

  // Load initial image if sent from Content Generator
  useEffect(() => {
    if (initialImage) {
      const img = new Image()
      img.onload = () => {
        setImages([{
          id: 'img-' + Date.now(),
          name: 'conteudo-gerado.png',
          dataUrl: initialImage,
          imgElement: img
        }])
      }
      img.src = initialImage
    }
  }, [initialImage])

  // Handle uploaded photos (single or multiple batch)
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target.result
        const img = new Image()
        img.onload = () => {
          setImages((prev) => [
            ...prev,
            {
              id: 'img-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
              name: file.name,
              dataUrl,
              imgElement: img
            }
          ])
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    })
  }

  // Handle logo watermark upload
  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target.result
        const img = new Image()
        img.onload = () => {
          setLogoDataUrl(dataUrl)
          setLogoImgElement(img)
          setWatermarkType('image')
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    }
  }

  // Re-render main preview canvas whenever options or selected image change
  useEffect(() => {
    const currentImg = images[selectedImageIndex]
    if (mainPreviewCanvasRef.current && currentImg && currentImg.imgElement) {
      applyWatermarkToCanvas(mainPreviewCanvasRef.current, currentImg.imgElement, {
        type: watermarkType,
        text,
        textColor,
        fontFamily,
        fontSize,
        position,
        opacity,
        scalePercent,
        rotation,
        isTiled,
        hasShadow,
        hasOutline,
        outlineColor,
        logoImage: logoImgElement
      })
    }
  }, [
    images,
    selectedImageIndex,
    watermarkType,
    text,
    textColor,
    fontFamily,
    fontSize,
    position,
    opacity,
    scalePercent,
    rotation,
    isTiled,
    hasShadow,
    hasOutline,
    outlineColor,
    logoImgElement
  ])

  // Download currently previewed single image
  const handleDownloadSingle = () => {
    if (!mainPreviewCanvasRef.current) return
    const currentImg = images[selectedImageIndex]
    const filename = currentImg ? `marca-dagua-${currentImg.name}` : `marca-dagua-${Date.now()}.png`
    const link = document.createElement('a')
    link.download = filename
    link.href = mainPreviewCanvasRef.current.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Download all images processed in batch as a .ZIP file
  const handleDownloadAllZip = async () => {
    if (images.length === 0) return
    setIsProcessingZip(true)

    try {
      const zip = new JSZip()
      const folder = zip.folder('fotos-com-marca-de-agua')
      const offscreenCanvas = document.createElement('canvas')

      for (let i = 0; i < images.length; i++) {
        const item = images[i]
        await applyWatermarkToCanvas(offscreenCanvas, item.imgElement, {
          type: watermarkType,
          text,
          textColor,
          fontFamily,
          fontSize,
          position,
          opacity,
          scalePercent,
          rotation,
          isTiled,
          hasShadow,
          hasOutline,
          outlineColor,
          logoImage: logoImgElement
        })

        const base64Data = offscreenCanvas.toDataURL('image/png').split(',')[1]
        folder.file(`protegida_${i + 1}_${item.name}`, base64Data, { base64: true })
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      saveAs(zipBlob, `fotos-com-marca-de-agua-${Date.now()}.zip`)

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 }
      })
    } catch (err) {
      alert('Erro ao gerar ficheiro ZIP: ' + err.message)
    } finally {
      setIsProcessingZip(false)
    }
  }

  const removeImage = (index, e) => {
    e.stopPropagation()
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (selectedImageIndex >= next.length) {
        setSelectedImageIndex(Math.max(0, next.length - 1))
      }
      return next
    })
  }

  const clearAllImages = () => {
    setImages([])
    setSelectedImageIndex(0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/25">
              <Stamp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Estúdio de Marcas de Água
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Batch & Anti-Roubo
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Aplica a tua assinatura, marca d'água ou logótipo numa foto ou em dezenas de fotografias ao mesmo tempo.
          </p>
        </div>

        {/* Top actions if images exist */}
        {images.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={clearAllImages}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Todas</span>
            </button>

            <button
              onClick={handleDownloadAllZip}
              disabled={isProcessingZip}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isProcessingZip ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A compactar {images.length} fotos...</span>
                </>
              ) : (
                <>
                  <Archive className="w-4 h-4" />
                  <span>Baixar Todas em .ZIP ({images.length})</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls & Settings */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/90 space-y-6">
          
          {/* 1. Upload Trigger */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Adicionar Fotos para Marcar (Suporta Lote)
            </label>
            <label className="w-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/60 hover:bg-slate-900 cursor-pointer transition-all group">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 transition-colors mb-2" />
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                Arrasta fotos ou clica para selecionar
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                Podes selecionar várias fotografias em simultâneo (PNG, JPG, WebP)
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* 2. Watermark Type Switch */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Tipo de Marca de Água
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setWatermarkType('text')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  watermarkType === 'text'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Texto / Assinatura</span>
              </button>

              <button
                type="button"
                onClick={() => setWatermarkType('image')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  watermarkType === 'image'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Logótipo (PNG)</span>
              </button>
            </div>
          </div>

          {/* Conditional Options: Text vs Image */}
          {watermarkType === 'text' ? (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Texto da Marca de Água
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ex: @omeunome ou © 2026 Fotografia"
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cor do Texto
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs text-slate-400 uppercase">{textColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tamanho Base
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              {/* Readability checkboxes */}
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOutline}
                    onChange={(e) => setHasOutline(e.target.checked)}
                    className="rounded accent-cyan-500"
                  />
                  <span>Contorno de contraste</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasShadow}
                    onChange={(e) => setHasShadow(e.target.checked)}
                    className="rounded accent-cyan-500"
                  />
                  <span>Sombra suave</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ficheiro do Logótipo (PNG Transparente Recomendado)
                </label>
                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{logoDataUrl ? 'Substituir Logótipo' : 'Carregar Imagem de Logótipo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {logoDataUrl && (
                <div className="p-2.5 rounded-xl bg-slate-950 flex items-center justify-between border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img src={logoDataUrl} alt="Logo" className="w-8 h-8 object-contain rounded bg-white/5 p-1" />
                    <span className="text-xs text-slate-300 font-medium">Logótipo carregado</span>
                  </div>
                  <button
                    onClick={() => { setLogoDataUrl(null); setLogoImgElement(null); }}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Remover
                  </button>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Escala do Logótipo (% da imagem)
                  </label>
                  <span className="text-xs text-cyan-400 font-bold">{scalePercent}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={scalePercent}
                  onChange={(e) => setScalePercent(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          )}

          {/* 3. Positioning & Style Controls */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            {/* 3x3 Position Grid */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  Posição na Foto
                </label>
                <label className="flex items-center gap-1.5 text-xs text-cyan-400 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={isTiled}
                    onChange={(e) => setIsTiled(e.target.checked)}
                    className="rounded accent-cyan-500"
                  />
                  <span>Modo Mosaico (Anti-Roubo Total)</span>
                </label>
              </div>

              {!isTiled ? (
                <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto bg-slate-950 p-2 rounded-2xl border border-slate-800">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPosition(pos.id)}
                      className={`h-9 rounded-xl flex items-center justify-center transition-all ${
                        position === pos.id
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400'
                      }`}
                      title={pos.label}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${position === pos.id ? 'bg-white' : 'bg-slate-500'}`} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-cyan-400" />
                  <span>A marca d'água será repetida continuamente por toda a imagem em padrão de segurança.</span>
                </div>
              )}
            </div>

            {/* Opacity & Rotation Sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Opacidade</label>
                  <span className="text-xs text-cyan-400 font-bold">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Rotação</label>
                  <span className="text-xs text-cyan-400 font-bold">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Preview & Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Large Preview */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {images.length > 0
                    ? `A Pré-visualizar: ${images[selectedImageIndex]?.name || 'Foto'}`
                    : 'Nenhuma foto carregada'}
                </span>
                {images.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    Foto {selectedImageIndex + 1} de {images.length}
                  </span>
                )}
              </div>

              {images.length > 0 && (
                <button
                  onClick={handleDownloadSingle}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all hover:scale-105"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Esta Foto</span>
                </button>
              )}
            </div>

            {/* Canvas Display */}
            {images.length > 0 ? (
              <div className="relative w-full max-h-[520px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                <canvas
                  ref={mainPreviewCanvasRef}
                  className="max-h-[500px] w-auto max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full py-20 flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                <div className="w-16 h-16 rounded-3xl bg-slate-800/80 flex items-center justify-center text-slate-500 mb-4">
                  <Stamp className="w-8 h-8 text-cyan-400/60" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Arrasta fotos para aplicar marcas de água
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Adiciona o teu logótipo ou texto de direitos de autor com proteção anti-cópia em segundos.
                </p>
                <label className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-cyan-600/25 transition-all">
                  <span>Selecionar Fotos do Computador</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Batch Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="glass-panel p-4 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-300">
                  Galeria de Fotos em Lote ({images.length})
                </h4>
                <span className="text-[11px] text-slate-400">
                  Clica para alternar a pré-visualização principal
                </span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {images.map((item, idx) => {
                  const isSelected = selectedImageIndex === idx
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isSelected
                          ? 'border-cyan-500 scale-105 shadow-md shadow-cyan-500/25'
                          : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => removeImage(idx, e)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-rose-600 text-white transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

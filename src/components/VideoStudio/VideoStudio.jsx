import React, { useState, useRef, useEffect } from 'react'
import { 
  Video, 
  Upload, 
  Scissors, 
  Play, 
  Pause, 
  Download, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Type, 
  Stamp, 
  Sliders, 
  RefreshCw, 
  Check, 
  Maximize,
  AlertCircle
} from 'lucide-react'
import { VIDEO_RATIOS, formatTime, drawVideoFrame, exportProcessedVideo } from '../../services/videoProcessor'
import confetti from 'canvas-confetti'

// Sample video for instant testing if user has no file ready
const SAMPLE_VIDEOS = [
  {
    name: 'Exemplo: Natureza & Cidade',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    name: 'Exemplo: Café & Estilo',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
  }
]

export default function VideoStudio() {
  const [videoSrc, setVideoSrc] = useState(null)
  const [videoName, setVideoName] = useState('')
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Trim settings
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)

  // Formatting & Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [bgStyle, setBgStyle] = useState('blur') // 'blur' | 'black' | 'gradient'

  // Headline Hook Bar
  const [headlineText, setHeadlineText] = useState('')
  const [headlinePos, setHeadlinePos] = useState('top') // 'top' | 'bottom'
  const [headlineBg, setHeadlineBg] = useState('#facc15')
  const [headlineTextColor, setHeadlineTextColor] = useState('#000000')

  // Watermark
  const [watermarkText, setWatermarkText] = useState('')
  const [watermarkPos, setWatermarkPos] = useState('top-right')
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.85)

  // Filters
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [filterPreset, setFilterPreset] = useState('none') // 'none' | 'vibrant' | 'vintage' | 'grayscale' | 'cyber' | 'warm'

  // Audio
  const [muteAudio, setMuteAudio] = useState(false)

  // Export progress & result
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportedVideoUrl, setExportedVideoUrl] = useState(null)
  const [exportTask, setExportTask] = useState(null)

  // Refs
  const videoRef = useRef(null)
  const previewCanvasRef = useRef(null)
  const animFrameRef = useRef(null)

  // Handle video upload
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setVideoSrc(url)
    setVideoName(file.name)
    setExportedVideoUrl(null)
  }

  // Load sample video
  const handleLoadSample = (sample) => {
    setVideoSrc(sample.url)
    setVideoName(sample.name)
    setExportedVideoUrl(null)
  }

  // When video metadata is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration
      setDuration(dur)
      setStartTime(0)
      setEndTime(Math.min(dur, 60)) // default first 60s or full
      setCurrentTime(0)
    }
  }

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      if (videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime
      }
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  // Real-time canvas rendering loop while playing or adjusting controls
  useEffect(() => {
    const renderPreview = () => {
      if (videoRef.current && previewCanvasRef.current) {
        const video = videoRef.current
        const canvas = previewCanvasRef.current
        const ctx = canvas.getContext('2d')
        const dims = VIDEO_RATIOS[aspectRatio] || VIDEO_RATIOS['9:16']

        if (canvas.width !== dims.width || canvas.height !== dims.height) {
          canvas.width = dims.width
          canvas.height = dims.height
        }

        drawVideoFrame(
          ctx,
          video,
          {
            aspectRatio,
            bgStyle,
            filters: { brightness, contrast, saturation, filterPreset },
            watermark: { text: watermarkText, position: watermarkPos, opacity: watermarkOpacity },
            headline: { text: headlineText, position: headlinePos, bgColor: headlineBg, textColor: headlineTextColor }
          },
          dims.width,
          dims.height
        )

        // Keep inside trimmed bounds during playback
        if (isPlaying && video.currentTime >= endTime) {
          video.currentTime = startTime
        }
      }

      animFrameRef.current = requestAnimationFrame(renderPreview)
    }

    animFrameRef.current = requestAnimationFrame(renderPreview)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [
    videoSrc,
    isPlaying,
    aspectRatio,
    bgStyle,
    brightness,
    contrast,
    saturation,
    filterPreset,
    watermarkText,
    watermarkPos,
    watermarkOpacity,
    headlineText,
    headlinePos,
    headlineBg,
    headlineTextColor,
    startTime,
    endTime
  ])

  // Update current time on video timeupdate
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  // Scrub video
  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  // Export video
  const handleExport = () => {
    if (!videoRef.current) return
    setIsExporting(true)
    setExportProgress(0)
    setExportedVideoUrl(null)

    const task = exportProcessedVideo({
      videoElement: videoRef.current,
      startTime,
      endTime,
      aspectRatio,
      bgStyle,
      filters: { brightness, contrast, saturation, filterPreset },
      watermark: { text: watermarkText, position: watermarkPos, opacity: watermarkOpacity },
      headline: { text: headlineText, position: headlinePos, bgColor: headlineBg, textColor: headlineTextColor },
      muteAudio,
      onProgress: (p) => setExportProgress(p),
      onComplete: (url) => {
        setIsExporting(false)
        setExportedVideoUrl(url)
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 }
        })
      },
      onError: (err) => {
        setIsExporting(false)
        alert('Erro na exportação: ' + err)
      }
    })

    setExportTask(task)
  }

  const cancelExport = () => {
    if (exportTask) {
      exportTask.cancel()
    }
    setIsExporting(false)
  }

  const trimmedDuration = Math.max(0, endTime - startTime)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-pink-600/25">
              <Video className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Editor de Vídeo Fácil & Prático
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
              Reels • TikTok • Shorts
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Corta, ajusta proporções com fundo blur, adiciona marcas de água e barras de texto virais em segundos.
          </p>
        </div>

        {/* Video Actions */}
        {videoSrc && (
          <div className="flex items-center gap-2.5">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer border border-slate-700/60 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Trocar Vídeo</span>
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-600/25 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A Renderizar ({exportProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Exportar Vídeo Editado</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Hidden Native Video Element for Decoding */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          crossOrigin="anonymous"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
          playsInline
        />
      )}

      {!videoSrc ? (
        /* Empty Upload State */
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-12">
          <div className="w-20 h-20 rounded-3xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20 mb-5 shadow-xl shadow-pink-500/5">
            <Video className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Carrega o teu vídeo para começar a editar
          </h2>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            Suporta formatos MP4, WebM e MOV. Podes cortar trechos, converter para 9:16 vertical, colocar o teu @ e criar ganchos de texto de alto engajamento.
          </p>

          <label className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm cursor-pointer shadow-lg shadow-pink-600/25 transition-all hover:scale-105 mb-4">
            <Upload className="w-4 h-4" />
            <span>Selecionar Ficheiro de Vídeo</span>
            <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Quick test buttons */}
          <div className="pt-4 border-t border-slate-800/80 w-full flex flex-col items-center">
            <span className="text-[11px] text-slate-500 font-semibold mb-2">Não tens um vídeo à mão? Experimenta um exemplo:</span>
            <div className="flex gap-2">
              {SAMPLE_VIDEOS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadSample(s)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Video Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Live Canvas Video Preview & Timeline Player */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center">
              
              {/* Aspect Ratio & Mute top bar */}
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Formato: <strong className="text-white">{VIDEO_RATIOS[aspectRatio].label}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMuteAudio(!muteAudio)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                      muteAudio
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {muteAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{muteAudio ? 'Áudio Desligado' : 'Áudio Original'}</span>
                  </button>
                </div>
              </div>

              {/* Video Render Canvas */}
              <div 
                className="relative flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-slate-800 max-h-[540px] w-full bg-black cursor-pointer group"
                onClick={togglePlay}
              >
                <canvas
                  ref={previewCanvasRef}
                  className="max-h-[520px] w-auto object-contain"
                />

                {/* Center Play/Pause Overlay indicator */}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-60' : 'opacity-100'}`}>
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-2xl">
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </div>
                </div>
              </div>

              {/* Video Timeline & Trimmer Bar */}
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Atual: <strong className="text-white">{formatTime(currentTime)}</strong></span>
                  <span className="text-pink-400 font-bold">
                    Duração Cortada: {formatTime(trimmedDuration)}
                  </span>
                  <span>Total: <strong className="text-slate-300">{formatTime(duration)}</strong></span>
                </div>

                {/* Scrubber Slider */}
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                {/* Trimmer Controls (Start & End points) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-bold text-white">Pontos de Corte (Trim):</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Início:</span>
                      <input
                        type="number"
                        min="0"
                        max={endTime}
                        step="0.1"
                        value={startTime.toFixed(1)}
                        onChange={(e) => setStartTime(Math.max(0, Math.min(parseFloat(e.target.value) || 0, endTime)))}
                        className="w-16 bg-slate-900 text-white font-mono text-xs px-2 py-1 rounded border border-slate-700 text-center"
                      />
                      <button
                        onClick={() => setStartTime(currentTime)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-pink-300 font-semibold text-[11px]"
                        title="Marcar início no segundo atual"
                      >
                        Marcar
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Fim:</span>
                      <input
                        type="number"
                        min={startTime}
                        max={duration}
                        step="0.1"
                        value={endTime.toFixed(1)}
                        onChange={(e) => setEndTime(Math.min(duration, Math.max(parseFloat(e.target.value) || 0, startTime)))}
                        className="w-16 bg-slate-900 text-white font-mono text-xs px-2 py-1 rounded border border-slate-700 text-center"
                      />
                      <button
                        onClick={() => setEndTime(currentTime)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-pink-300 font-semibold text-[11px]"
                        title="Marcar fim no segundo atual"
                      >
                        Marcar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Progress / Download Box */}
              {isExporting && (
                <div className="w-full mt-4 p-4 rounded-2xl bg-slate-950 border border-pink-500/30">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-bold text-white flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-400" />
                      A processar vídeo quadro a quadro...
                    </span>
                    <span className="font-mono text-pink-400 font-bold">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-rose-500 h-full transition-all duration-150"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <button
                    onClick={cancelExport}
                    className="mt-3 text-xs text-slate-400 hover:text-rose-400"
                  >
                    Cancelar processamento
                  </button>
                </div>
              )}

              {exportedVideoUrl && (
                <div className="w-full mt-4 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Vídeo pronto com sucesso!</h4>
                      <p className="text-[11px] text-slate-400">Renderizado com todas as edições e marca d'água.</p>
                    </div>
                  </div>

                  <a
                    href={exportedVideoUrl}
                    download={`video-editado-${Date.now()}.webm`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all hover:scale-105"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Vídeo Final</span>
                  </a>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT: Video Styling & Overlays Panel */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/90 space-y-6">
            
            {/* 1. Format & Framing */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Proporção do Ecrã (Aspect Ratio)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(VIDEO_RATIOS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setAspectRatio(key)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      aspectRatio === key
                        ? 'border-pink-500 bg-pink-950/30 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <p className="text-xs font-bold">{key}</p>
                    <p className="text-[10px] opacity-75">{item.label.split('(')[1]?.replace(')', '') || key}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Framing Style (Blur vs Black vs Gradient) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Fundo de Preenchimento das Bordas
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBgStyle('blur')}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    bgStyle === 'blur' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Desfoque (Blur)
                </button>
                <button
                  type="button"
                  onClick={() => setBgStyle('black')}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    bgStyle === 'black' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Preto Puro
                </button>
                <button
                  type="button"
                  onClick={() => setBgStyle('gradient')}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    bgStyle === 'gradient' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Gradiente
                </button>
              </div>
            </div>

            {/* 2. Viral Hook / Headline Bar */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-pink-400" />
                  <span>Faixa de Texto Viral (Hook Bar)</span>
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setHeadlinePos('top')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      headlinePos === 'top' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Topo
                  </button>
                  <button
                    onClick={() => setHeadlinePos('bottom')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      headlinePos === 'bottom' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Fundo
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={headlineText}
                onChange={(e) => setHeadlineText(e.target.value)}
                placeholder="Ex: ESPERA ATÉ AO FIM 😱 ou DICA INCRÍVEL"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none"
              />

              {headlineText && (
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Fundo:</span>
                    <input
                      type="color"
                      value={headlineBg}
                      onChange={(e) => setHeadlineBg(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Texto:</span>
                    <input
                      type="color"
                      value={headlineTextColor}
                      onChange={(e) => setHeadlineTextColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Watermark on Video */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Stamp className="w-3.5 h-3.5 text-pink-400" />
                <span>Marca de Água no Vídeo</span>
              </label>

              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Ex: @oteucanal ou @marca"
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none"
              />

              {watermarkText && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Posição</label>
                    <select
                      value={watermarkPos}
                      onChange={(e) => setWatermarkPos(e.target.value)}
                      className="w-full bg-slate-950 text-white text-xs px-2 py-1.5 rounded-lg border border-slate-800"
                    >
                      <option value="top-right">Canto Sup. Direito</option>
                      <option value="top-left">Canto Sup. Esquerdo</option>
                      <option value="bottom-right">Canto Inf. Direito</option>
                      <option value="bottom-left">Canto Inf. Esquerdo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Opacidade ({Math.round(watermarkOpacity * 100)}%)</label>
                    <input
                      type="range"
                      min="0.2"
                      max="1"
                      step="0.05"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Video Filters & Adjustments */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-pink-400" />
                <span>Filtros Rápidos de Vídeo</span>
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'none', label: 'Original' },
                  { id: 'vibrant', label: 'Vibrante' },
                  { id: 'warm', label: 'Quente' },
                  { id: 'vintage', label: 'Vintage' },
                  { id: 'grayscale', label: 'Noir P&B' },
                  { id: 'cyber', label: 'Cyberpunk' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterPreset(f.id)}
                    className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filterPreset === f.id
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

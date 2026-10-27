// Browser-based Real-time Video Processing & Exporting

// Aspect ratio dimensions for video canvas
export const VIDEO_RATIOS = {
  '9:16': { width: 720, height: 1280, label: '9:16 (TikTok / Reels / Shorts)' },
  '1:1': { width: 720, height: 720, label: '1:1 (Feed Quadrado)' },
  '16:9': { width: 1280, height: 720, label: '16:9 (YouTube / Ecrã Inteiro)' },
  '4:5': { width: 720, height: 900, label: '4:5 (Instagram Retrato)' }
}

// Format seconds into MM:SS.S
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00.0'
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(1)
  return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`
}

// Draw a single video frame with all filters, aspect ratio framing, watermarks and text banners onto canvas
export function drawVideoFrame(ctx, video, options, canvasWidth, canvasHeight) {
  const {
    aspectRatio = '9:16',
    bgStyle = 'blur', // 'blur' | 'black' | 'gradient'
    filters = { brightness: 100, contrast: 100, saturation: 100, filterPreset: 'none' },
    watermark = { text: '', logoImg: null, position: 'top-right', opacity: 0.8 },
    headline = { text: '', position: 'top', bgColor: '#facc15', textColor: '#000000', fontSize: 24 }
  } = options

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 1. Draw Background
  if (bgStyle === 'blur') {
    ctx.save()
    ctx.filter = 'blur(20px) brightness(0.6)'
    // Scale up video to cover canvas
    ctx.drawImage(video, -20, -20, canvasWidth + 40, canvasHeight + 40)
    ctx.restore()
  } else if (bgStyle === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight)
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(1, '#1e1b4b')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  } else {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }

  // 2. Draw Main Video (Fitted with aspect ratio preserved)
  const vidW = video.videoWidth || 720
  const vidH = video.videoHeight || 1280
  const vidRatio = vidW / vidH
  const canvasRatio = canvasWidth / canvasHeight

  let renderW, renderH, renderX, renderY

  if (vidRatio > canvasRatio) {
    // Video is wider than canvas
    renderW = canvasWidth
    renderH = canvasWidth / vidRatio
    renderX = 0
    renderY = (canvasHeight - renderH) / 2
  } else {
    // Video is taller or same
    renderH = canvasHeight
    renderW = canvasHeight * vidRatio
    renderX = (canvasWidth - renderW) / 2
    renderY = 0
  }

  // Apply visual filters
  ctx.save()
  let filterStr = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`
  if (filters.filterPreset === 'grayscale') filterStr += ' grayscale(100%)'
  else if (filters.filterPreset === 'vintage') filterStr += ' sepia(60%) contrast(110%)'
  else if (filters.filterPreset === 'vibrant') filterStr += ' saturate(160%) contrast(115%)'
  else if (filters.filterPreset === 'cyber') filterStr += ' hue-rotate(180deg) saturate(140%)'
  else if (filters.filterPreset === 'warm') filterStr += ' sepia(30%) saturate(130%)'

  ctx.filter = filterStr
  ctx.drawImage(video, renderX, renderY, renderW, renderH)
  ctx.restore()

  // 3. Draw Watermark if specified
  if (watermark.text || watermark.logoImg) {
    ctx.save()
    ctx.globalAlpha = watermark.opacity || 0.8

    if (watermark.logoImg) {
      const logoW = canvasWidth * 0.16
      const logoH = (watermark.logoImg.height / watermark.logoImg.width) * logoW
      let lx = canvasWidth - logoW - 24
      let ly = 24
      if (watermark.position === 'top-left') { lx = 24; ly = 24 }
      else if (watermark.position === 'bottom-left') { lx = 24; ly = canvasHeight - logoH - 24 }
      else if (watermark.position === 'bottom-right') { lx = canvasWidth - logoW - 24; ly = canvasHeight - logoH - 24 }

      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 8
      ctx.drawImage(watermark.logoImg, lx, ly, logoW, logoH)
    } else if (watermark.text) {
      ctx.font = '700 18px "Montserrat", sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 6

      let tx = canvasWidth - 24
      let ty = 36
      ctx.textAlign = 'right'

      if (watermark.position === 'top-left') {
        tx = 24
        ctx.textAlign = 'left'
      } else if (watermark.position === 'bottom-right') {
        tx = canvasWidth - 24
        ty = canvasHeight - 24
        ctx.textAlign = 'right'
      } else if (watermark.position === 'bottom-left') {
        tx = 24
        ty = canvasHeight - 24
        ctx.textAlign = 'left'
      }

      ctx.strokeText(watermark.text, tx, ty)
      ctx.fillText(watermark.text, tx, ty)
    }
    ctx.restore()
  }

  // 4. Draw Viral Headline / Caption Bar
  if (headline.text && headline.text.trim()) {
    ctx.save()
    const fontSize = headline.fontSize || 24
    ctx.font = `800 ${fontSize}px "Montserrat", sans-serif`
    const text = headline.text.toUpperCase()
    const textWidth = ctx.measureText(text).width
    const padX = 24
    const padY = 12
    const bannerW = Math.min(canvasWidth * 0.9, textWidth + padX * 2)
    const bannerH = fontSize + padY * 2
    const bannerX = (canvasWidth - bannerW) / 2
    const bannerY = headline.position === 'top' ? canvasHeight * 0.12 : canvasHeight * 0.82

    // Background box
    ctx.fillStyle = headline.bgColor || '#facc15'
    ctx.shadowColor = 'rgba(0,0,0,0.4)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 4
    ctx.beginPath()
    const r = 12
    ctx.roundRect ? ctx.roundRect(bannerX, bannerY, bannerW, bannerH, r) : ctx.rect(bannerX, bannerY, bannerW, bannerH)
    ctx.fill()

    // Text inside box
    ctx.fillStyle = headline.textColor || '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvasWidth / 2, bannerY + bannerH / 2, bannerW - 20)
    ctx.restore()
  }
}

// Export / Render video with WebCodecs or MediaRecorder
export function exportProcessedVideo({
  videoElement,
  startTime = 0,
  endTime,
  aspectRatio = '9:16',
  bgStyle = 'blur',
  filters,
  watermark,
  headline,
  muteAudio = false,
  onProgress,
  onComplete,
  onError
}) {
  const dims = VIDEO_RATIOS[aspectRatio] || VIDEO_RATIOS['9:16']
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = dims.width
  exportCanvas.height = dims.height
  const ctx = exportCanvas.getContext('2d', { alpha: false })

  const duration = (endTime || videoElement.duration) - startTime
  if (duration <= 0) {
    onError && onError('Duração inválida do vídeo.')
    return
  }

  // Setup stream
  const canvasStream = exportCanvas.captureStream(30)
  let combinedStream = canvasStream

  // Audio track handling
  try {
    if (!muteAudio) {
      // Capture audio from video if possible
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaElementSource(videoElement)
      const destination = audioCtx.createMediaStreamDestination()
      source.connect(destination)
      source.connect(audioCtx.destination) // keep audio audible or destination only

      destination.stream.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track)
      })
    }
  } catch {
    // If audio element already connected or cross-origin, continue with canvasStream
  }

  // MediaRecorder setup with supported mime type
  let mimeType = 'video/webm;codecs=vp9'
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm'
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/mp4'
    }
  }

  let recorder
  try {
    recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 4000000 // 4 Mbps high quality
    })
  } catch (err) {
    recorder = new MediaRecorder(combinedStream)
  }

  const chunks = []
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data)
    }
  }

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' })
    const url = URL.createObjectURL(blob)
    onComplete && onComplete(url, blob)
  }

  // Seek video to startTime and start playback & frame recording loop
  videoElement.currentTime = startTime
  videoElement.muted = muteAudio

  let animationFrameId = null
  let isRecording = true

  const stopExport = () => {
    if (!isRecording) return
    isRecording = false
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    if (recorder.state === 'recording') {
      recorder.stop()
    }
    videoElement.pause()
  }

  const processFrame = () => {
    if (!isRecording) return

    // Draw frame
    drawVideoFrame(ctx, videoElement, { aspectRatio, bgStyle, filters, watermark, headline }, dims.width, dims.height)

    // Progress
    const elapsed = videoElement.currentTime - startTime
    const progress = Math.min(100, Math.max(0, Math.round((elapsed / duration) * 100)))
    onProgress && onProgress(progress)

    // Check if reached endTime
    if (videoElement.currentTime >= endTime || videoElement.ended) {
      stopExport()
      return
    }

    animationFrameId = requestAnimationFrame(processFrame)
  }

  videoElement.onseeked = () => {
    videoElement.onseeked = null
    recorder.start(100) // emit chunk every 100ms
    videoElement.play().then(() => {
      processFrame()
    }).catch(err => {
      stopExport()
      onError && onError('Erro ao reproduzir vídeo para gravação: ' + err.message)
    })
  }

  return {
    cancel: () => stopExport()
  }
}

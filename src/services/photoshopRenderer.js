// Photoshop Template & Mockup Canvas Rendering Engine

import { applyPhotoshopAdjustments } from './photoshopAdjustments'

// Helper to convert hex to RGB
function hexToRgb(hex) {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16)
    const g = parseInt(clean[1] + clean[1], 16)
    const b = parseInt(clean[2] + clean[2], 16)
    return { r, g, b }
  }
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

// Render complete Photoshop template onto canvas
export function renderPhotoshopTemplateToCanvas(canvas, imageElement, template, options = {}) {
  if (!canvas || !imageElement) return

  const ctx = canvas.getContext('2d')
  const {
    brightness = 100,
    contrast = 100,
    saturation = 100,
    warmth = 0,
    grain = 0,
    vignette = 0,
    duotonePalette = null, // { dark, light }
    customTexts = {}, // overrides for template fields
    cropMode = 'cover' // 'cover' | 'contain'
  } = options

  const templateId = template?.id || 'none'
  const width = template?.canvasWidth || imageElement.naturalWidth || 1200
  const height = template?.canvasHeight || imageElement.naturalHeight || 1200

  canvas.width = width
  canvas.height = height

  ctx.save()
  ctx.clearRect(0, 0, width, height)

  // 1. If standard photo mode (no template)
  if (templateId === 'none') {
    renderRawPhoto(ctx, imageElement, 0, 0, width, height, options)
    ctx.restore()
    return
  }

  // 2. Dispatch to specific Photoshop template style
  switch (templateId) {
    case 'fine-art-gallery':
      renderFineArtGallery(ctx, imageElement, template, customTexts, options, width, height)
      break
    case 'editorial-magazine':
      renderEditorialMagazine(ctx, imageElement, template, customTexts, options, width, height)
      break
    case 'polaroid-retro':
      renderPolaroidRetro(ctx, imageElement, template, customTexts, options, width, height)
      break
    case 'movie-poster':
      renderMoviePoster(ctx, imageElement, template, customTexts, options, width, height)
      break
    case 'film-strip-35mm':
      renderFilmStrip35mm(ctx, imageElement, template, customTexts, options, width, height)
      break
    case 'duotone-spotify':
      renderDuotoneSpotify(ctx, imageElement, template, customTexts, options, width, height)
      break
    case 'minimalist-swiss':
      renderMinimalistSwiss(ctx, imageElement, template, customTexts, options, width, height)
      break
    default:
      renderRawPhoto(ctx, imageElement, 0, 0, width, height, options)
  }

  ctx.restore()
}

// Helper to draw photo with adjustments, filter and optional grain/vignette
function renderRawPhoto(ctx, image, x, y, w, h, options = {}) {
  const { 
    brightness = 0, 
    contrast = 0, 
    saturation = 0, 
    warmth = 0, 
    vignette = 0, 
    grain = 0,
    psAdjustments = {}
  } = options

  ctx.save()
  // Setup clipping to bounding box
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  // Base warmth / sepia filter if set
  if (warmth > 0) {
    ctx.filter = `sepia(${warmth}%)`
  }

  // Draw image to cover box
  const imgRatio = image.width / image.height
  const boxRatio = w / h
  let dw, dh, dx, dy

  if (imgRatio > boxRatio) {
    dh = h
    dw = h * imgRatio
    dx = x + (w - dw) / 2
    dy = y
  } else {
    dw = w
    dh = w / imgRatio
    dx = x
    dy = y + (h - dh) / 2
  }

  ctx.drawImage(image, dx, dy, dw, dh)
  ctx.restore()

  // Apply True Photoshop Pixel Adjustments (Levels, Brightness/Contrast, Curves, Exposure, Color Balance, HSL)
  try {
    const imgData = ctx.getImageData(x, y, w, h)
    applyPhotoshopAdjustments(imgData, {
      brightness: psAdjustments.brightness !== undefined ? psAdjustments.brightness : brightness,
      contrast: psAdjustments.contrast !== undefined ? psAdjustments.contrast : contrast,
      inBlack: psAdjustments.inBlack || 0,
      gamma: psAdjustments.gamma || 1.0,
      inWhite: psAdjustments.inWhite || 255,
      exposure: psAdjustments.exposure || 0,
      offset: psAdjustments.offset || 0,
      hue: psAdjustments.hue || 0,
      saturation: psAdjustments.saturation !== undefined ? psAdjustments.saturation : saturation,
      lightness: psAdjustments.lightness || 0,
      colorBalanceCR: psAdjustments.colorBalanceCR || 0,
      colorBalanceMG: psAdjustments.colorBalanceMG || 0,
      colorBalanceYB: psAdjustments.colorBalanceYB || 0,
      curvesPreset: psAdjustments.curvesPreset || 'linear'
    })
    ctx.putImageData(imgData, x, y)
  } catch (err) {
    // If getImageData fails due to crossOrigin, fallback to CSS filters
  }

  // Apply Vignette if enabled
  if (vignette > 0) {
    ctx.save()
    const radial = ctx.createRadialGradient(
      x + w / 2, y + h / 2, Math.min(w, h) * 0.3,
      x + w / 2, y + h / 2, Math.max(w, h) * 0.7
    )
    radial.addColorStop(0, 'rgba(0,0,0,0)')
    radial.addColorStop(1, `rgba(0,0,0,${vignette / 100 * 0.85})`)
    ctx.fillStyle = radial
    ctx.fillRect(x, y, w, h)
    ctx.restore()
  }

  // Apply Film Grain if enabled
  if (grain > 0) {
    applyFilmGrain(ctx, x, y, w, h, grain)
  }
}

// Simulated Photoshop Camera Raw Film Grain
function applyFilmGrain(ctx, x, y, w, h, intensity) {
  const grainCanvas = document.createElement('canvas')
  const gW = Math.min(400, w)
  const gH = Math.min(400, h)
  grainCanvas.width = gW
  grainCanvas.height = gH
  const gCtx = grainCanvas.getContext('2d')
  const imgData = gCtx.createImageData(gW, gH)
  const data = imgData.data

  const factor = (intensity / 100) * 80
  for (let i = 0; i < data.length; i += 4) {
    const val = (Math.random() - 0.5) * factor
    data[i] = 128 + val
    data[i + 1] = 128 + val
    data[i + 2] = 128 + val
    data[i + 3] = (intensity / 100) * 140
  }
  gCtx.putImageData(imgData, 0, 0)

  ctx.save()
  ctx.globalCompositeOperation = 'overlay'
  ctx.drawImage(grainCanvas, x, y, w, h)
  ctx.restore()
}

// 1. Fine Art Gallery Template
function renderFineArtGallery(ctx, image, template, texts, options, w, h) {
  // Outer gallery frame
  ctx.fillStyle = template.frameColor || '#0f172a'
  ctx.fillRect(0, 0, w, h)

  // Subtle 3D frame bevel
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 4
  ctx.strokeRect(10, 10, w - 20, h - 20)

  // Inner Matting / Passe-Partout
  const frameBorder = 50
  const matX = frameBorder
  const matY = frameBorder
  const matW = w - frameBorder * 2
  const matH = h - frameBorder * 2

  ctx.fillStyle = template.matColor || '#f8fafc'
  ctx.fillRect(matX, matY, matW, matH)

  // Matting subtle texture/bevel
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 2
  ctx.strokeRect(matX + 15, matY + 15, matW - 30, matH - 30)

  // Photo Opening
  const photoPadding = 110
  const photoX = matX + photoPadding
  const photoY = matY + photoPadding
  const photoW = matW - photoPadding * 2
  const photoH = matH - photoPadding * 2 - 130 // leave room for gallery plate

  // Inner Bevel Shadow falling on photo
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 6
  ctx.fillStyle = '#000000'
  ctx.fillRect(photoX, photoY, photoW, photoH)
  ctx.restore()

  // Draw Photo
  renderRawPhoto(ctx, image, photoX, photoY, photoW, photoH, options)

  // Gallery Brass/Steel Museum Plate
  const plateW = 420
  const plateH = 75
  const plateX = (w - plateW) / 2
  const plateY = photoY + photoH + 30

  ctx.save()
  // Plate shadow
  ctx.shadowColor = 'rgba(0,0,0,0.15)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 3
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(plateX, plateY, plateW, plateH, 6) : ctx.rect(plateX, plateY, plateW, plateH)
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  // Plate Typography
  ctx.save()
  const title = texts.title || template.title || 'EXPOSIÇÃO DE ARTE CONTEMPORÂNEA'
  const subtitle = texts.subtitle || template.subtitle || 'Fotografia Autoral • Série Limitada'
  const credit = texts.credit || template.credit || 'MUSEU DE ARTE MODERNA • 2026'

  ctx.textAlign = 'center'
  ctx.fillStyle = '#0f172a'
  ctx.font = '800 13px "Montserrat", sans-serif'
  ctx.fillText(title.toUpperCase(), w / 2, plateY + 24)

  ctx.fillStyle = '#475569'
  ctx.font = '500 11px "Inter", sans-serif'
  ctx.fillText(subtitle, w / 2, plateY + 44)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '700 9px "Inter", sans-serif'
  ctx.fillText(credit, w / 2, plateY + 62)
  ctx.restore()
}

// 2. Editorial Magazine (Vogue / High Fashion)
function renderEditorialMagazine(ctx, image, template, texts, options, w, h) {
  // Draw full bleed photo
  renderRawPhoto(ctx, image, 0, 0, w, h, options)

  // Editorial Magazine Masthead
  const mastheadText = texts.title || template.title || 'V O G U E'
  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 4
  ctx.font = '900 115px "Playfair Display", serif'
  ctx.fillText(mastheadText, w / 2, 160)
  ctx.restore()

  // Date & Issue header banner
  const issueDate = texts.issueDate || template.issueDate || 'OUTUBRO 2026 • Nº 342'
  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 12px "Montserrat", sans-serif'
  ctx.letterSpacing = '4px'
  ctx.fillText(issueDate, w / 2, 210)
  ctx.restore()

  // Editorial Callouts / Headlines on left side
  const headlines = texts.headlines || template.headlines || [
    'O NOVO FUTURO DA CRIATIVIDADE',
    'ESTILO, MINIMALISMO & FORMA',
    'EXCLUSIVO: OS SEGREDOS DO ANO'
  ]

  ctx.save()
  ctx.textAlign = 'left'
  let startY = h * 0.48
  headlines.forEach((hl, i) => {
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetY = 2

    // Category pill
    ctx.fillStyle = '#f59e0b'
    ctx.font = '800 12px "Montserrat", sans-serif'
    ctx.fillText(`FEATURE 0${i + 1}`, 70, startY)

    // Headline bold text
    ctx.fillStyle = '#ffffff'
    ctx.font = '800 24px "Playfair Display", serif'
    ctx.fillText(hl, 70, startY + 30)

    startY += 100
  })
  ctx.restore()

  // Realistic Barcode at bottom right
  renderBarcode(ctx, w - 240, h - 130, 180, 75)
}

// 3. Polaroid Retro Template
function renderPolaroidRetro(ctx, image, template, texts, options, w, h) {
  // Background desk
  ctx.fillStyle = template.bgColor || '#18181b'
  ctx.fillRect(0, 0, w, h)

  // Polaroid Card Container
  const cardPadX = 90
  const cardPadTop = 80
  const cardW = w - cardPadX * 2
  const cardH = h - cardPadTop * 2
  const cardX = cardPadX
  const cardY = cardPadTop

  // Soft Floating Drop Shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
  ctx.shadowBlur = 35
  ctx.shadowOffsetY = 15
  ctx.fillStyle = template.paperColor || '#fafafa'
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(cardX, cardY, cardW, cardH, 8) : ctx.rect(cardX, cardY, cardW, cardH)
  ctx.fill()
  ctx.restore()

  // Inner Photo Window
  const innerPad = 50
  const photoX = cardX + innerPad
  const photoY = cardY + innerPad
  const photoW = cardW - innerPad * 2
  const photoH = cardH - innerPad - 240 // large polaroid chin at bottom

  // Subtle inner border around photo
  ctx.fillStyle = '#000000'
  ctx.fillRect(photoX, photoY, photoW, photoH)

  // Draw Photo
  renderRawPhoto(ctx, image, photoX, photoY, photoW, photoH, options)

  // Handwritten Style Note in the chin
  const note = texts.noteText || template.noteText || 'Momentos inesquecíveis • 2026 ✨'
  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#1c1917'
  ctx.font = '600 28px "Playfair Display", italic, serif'
  ctx.fillText(note, w / 2, cardY + cardH - 110)
  ctx.restore()

  // Washi tape at top center
  ctx.save()
  const tapeW = 160
  const tapeH = 45
  const tapeX = (w - tapeW) / 2
  const tapeY = cardY - 20
  ctx.fillStyle = 'rgba(251, 191, 36, 0.75)'
  ctx.shadowColor = 'rgba(0,0,0,0.15)'
  ctx.shadowBlur = 6
  ctx.fillRect(tapeX, tapeY, tapeW, tapeH)
  ctx.restore()
}

// 4. Movie Poster Template
function renderMoviePoster(ctx, image, template, texts, options, w, h) {
  // Draw photo
  renderRawPhoto(ctx, image, 0, 0, w, h, options)

  // Dramatic bottom vignette for credits
  ctx.save()
  const grad = ctx.createLinearGradient(0, h * 0.45, 0, h)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.65, 'rgba(0,0,0,0.85)')
  grad.addColorStop(1, 'rgba(0,0,0,0.98)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  ctx.restore()

  // Tagline
  const tagline = texts.tagline || template.tagline || 'UMA HISTÓRIA NUNCA ANTES CONTADA'
  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f59e0b'
  ctx.font = '700 16px "Montserrat", sans-serif'
  ctx.shadowColor = 'rgba(0,0,0,0.8)'
  ctx.shadowBlur = 12
  ctx.fillText(tagline.toUpperCase(), w / 2, h * 0.70)
  ctx.restore()

  // Movie Title
  const title = texts.title || template.title || 'ORIGENS'
  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = '900 85px "Bebas Neue", sans-serif'
  ctx.shadowColor = 'rgba(0,0,0,0.9)'
  ctx.shadowBlur = 24
  ctx.fillText(title.toUpperCase(), w / 2, h * 0.78)
  ctx.restore()

  // Release Date
  const release = texts.releaseDate || template.releaseDate || 'BREVEMENTE EM TODAS AS SALAS DE CINEMA'
  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = '700 13px "Montserrat", sans-serif'
  ctx.fillText(release.toUpperCase(), w / 2, h * 0.83)
  ctx.restore()

  // Hollywood Billing Block (Credits)
  const billing = texts.billingBlock || template.billingBlock || ''
  ctx.save()
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.font = '500 10px "Inter", sans-serif'
  const lines = billing.split('\n')
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, h * 0.88 + i * 18)
  })
  ctx.restore()
}

// 5. Film Strip 35mm Template
function renderFilmStrip35mm(ctx, image, template, texts, options, w, h) {
  // Black border
  ctx.fillStyle = '#09090b'
  ctx.fillRect(0, 0, w, h)

  // Film code on top
  const code = texts.filmCode || template.filmCode || 'KODAK PORTRA 400 • 36 EXP • ISO 400 • 24A'
  ctx.save()
  ctx.fillStyle = '#ea580c'
  ctx.font = '700 14px "Inter", monospace'
  ctx.fillText(code, 70, 48)
  ctx.restore()

  // Sprocket holes on top and bottom
  const holeW = 32
  const holeH = 46
  const holeRadius = 6
  const step = 70

  ctx.fillStyle = '#18181b'
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1

  // Top holes
  for (let x = 60; x < w - 60; x += step) {
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(x, 65, holeW, holeH, holeRadius) : ctx.rect(x, 65, holeW, holeH)
    ctx.fill()
    ctx.stroke()
  }

  // Bottom holes
  for (let x = 60; x < w - 60; x += step) {
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(x, h - 110, holeW, holeH, holeRadius) : ctx.rect(x, h - 110, holeW, holeH)
    ctx.fill()
    ctx.stroke()
  }

  // Photographic frame area inside
  const frameX = 80
  const frameY = 140
  const frameW = w - 160
  const frameH = h - 280

  renderRawPhoto(ctx, image, frameX, frameY, frameW, frameH, options)
}

// 6. Duotone Spotify Template
function renderDuotoneSpotify(ctx, image, template, texts, options, w, h) {
  // Render photo
  renderRawPhoto(ctx, image, 0, 0, w, h, options)

  // Apply Photoshop Gradient Map (Duotone)
  const colors = options.duotonePalette || { dark: '#1e1b4b', light: '#ec4899' }
  applyDuotoneGradientMap(ctx, 0, 0, w, h, colors.dark, colors.light)

  // Big Typography Overlay
  const title = texts.title || template.title || 'DAILY MIX'
  const subtitle = texts.subtitle || template.subtitle || 'AS TUAS FAIXAS MAIS OUVIDAS'

  ctx.save()
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.font = '900 80px "Montserrat", sans-serif'
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 16
  ctx.fillText(title, 80, h - 140)

  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '700 20px "Inter", sans-serif'
  ctx.fillText(subtitle, 80, h - 90)
  ctx.restore()
}

// 7. Minimalist Swiss Grid Template
function renderMinimalistSwiss(ctx, image, template, texts, options, w, h) {
  ctx.fillStyle = template.bgColor || '#f1f5f9'
  ctx.fillRect(0, 0, w, h)

  // Grid lines
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(80, 0); ctx.lineTo(80, h)
  ctx.moveTo(w - 80, 0); ctx.lineTo(w - 80, h)
  ctx.moveTo(0, 100); ctx.lineTo(w, 100)
  ctx.stroke()

  // Top Swiss typography
  ctx.save()
  ctx.fillStyle = '#0f172a'
  ctx.font = '800 14px "Inter", sans-serif'
  ctx.fillText('SWISS DESIGN SERIES / 01', 80, 75)

  ctx.textAlign = 'right'
  ctx.fillText(texts.year || template.year || 'ED. 2026', w - 80, 75)
  ctx.restore()

  // Main Photo Box
  const photoX = 80
  const photoY = 130
  const photoW = w - 160
  const photoH = h - 330

  renderRawPhoto(ctx, image, photoX, photoY, photoW, photoH, options)

  // Bottom Swiss Typography
  const title = texts.title || template.title || 'NEUE GESTALTUNG'
  const subtitle = texts.subtitle || template.subtitle || 'ESTUDO DE FORMA, ESPAÇO E LUZ'

  ctx.save()
  ctx.textAlign = 'left'
  ctx.fillStyle = '#0f172a'
  ctx.font = '900 36px "Inter", sans-serif'
  ctx.fillText(title, 80, h - 130)

  ctx.fillStyle = '#64748b'
  ctx.font = '600 15px "Inter", sans-serif'
  ctx.fillText(subtitle, 80, h - 95)
  ctx.restore()
}

// Photoshop Duotone Gradient Map Algorithm
function applyDuotoneGradientMap(ctx, x, y, w, h, darkHex, lightHex) {
  const imgData = ctx.getImageData(x, y, w, h)
  const data = imgData.data

  const darkRgb = hexToRgb(darkHex)
  const lightRgb = hexToRgb(lightHex)

  for (let i = 0; i < data.length; i += 4) {
    // Luminance
    const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255

    // Map luminance between darkRgb (shadows) and lightRgb (highlights)
    data[i] = darkRgb.r + (lightRgb.r - darkRgb.r) * lum
    data[i + 1] = darkRgb.g + (lightRgb.g - darkRgb.g) * lum
    data[i + 2] = darkRgb.b + (lightRgb.b - darkRgb.b) * lum
  }

  ctx.putImageData(imgData, x, y)
}

// Barcode Generator for Editorial Magazine
function renderBarcode(ctx, x, y, w, h) {
  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, w, h)

  // Black bars
  ctx.fillStyle = '#000000'
  let bx = x + 12
  const maxW = x + w - 12
  const barH = h - 22

  while (bx < maxW) {
    const barWidth = Math.random() > 0.6 ? 3 : 1.5
    ctx.fillRect(bx, y + 8, barWidth, barH)
    bx += barWidth + (Math.random() > 0.5 ? 2 : 1)
  }

  // Digits
  ctx.font = '700 8px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('9 770042 784001', x + w / 2, y + h - 4)
  ctx.restore()
}

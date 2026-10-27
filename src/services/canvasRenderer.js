// Canvas Rendering Utilities for High Resolution Export and Real-Time Preview

// Load an image asynchronously safely
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (err) => {
      // If crossOrigin fails or image blocked, retry without crossOrigin or reject
      const fallback = new Image()
      fallback.onload = () => resolve(fallback)
      fallback.onerror = () => reject(err)
      fallback.src = src
    }
    img.src = src
  })
}

// Render complete template to canvas
export async function renderTemplateToCanvas(canvas, template, scale = 1) {
  if (!canvas || !template) return

  const ctx = canvas.getContext('2d')
  const width = (template.width || 1080) * scale
  const height = (template.height || 1080) * scale

  canvas.width = width
  canvas.height = height

  // 1. Draw Background
  if (template.bgGradient) {
    // Parse gradient or default
    const grad = ctx.createLinearGradient(0, 0, width, height)
    grad.addColorStop(0, '#0f172a')
    grad.addColorStop(0.5, '#1e1b4b')
    grad.addColorStop(1, '#312e81')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)
  } else {
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, width, height)
  }

  // 2. Draw Background Image if available
  if (template.bgImage) {
    try {
      const img = await loadImage(template.bgImage)
      ctx.save()
      ctx.globalAlpha = template.bgOpacity !== undefined ? template.bgOpacity : 0.4
      
      // Cover fit
      const imgRatio = img.width / img.height
      const canvasRatio = width / height
      let renderW, renderH, offsetX, offsetY

      if (imgRatio > canvasRatio) {
        renderH = height
        renderW = height * imgRatio
        offsetX = (width - renderW) / 2
        offsetY = 0
      } else {
        renderW = width
        renderH = width / imgRatio
        offsetX = 0
        offsetY = (height - renderH) / 2
      }

      ctx.drawImage(img, offsetX, offsetY, renderW, renderH)
      ctx.restore()
    } catch {
      // Fallback: draw decorative shapes if image fails
      ctx.save()
      ctx.fillStyle = template.accentColor || '#6366f1'
      ctx.globalAlpha = 0.15
      ctx.beginPath()
      ctx.arc(width * 0.8, height * 0.2, width * 0.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  // Dark/Tint Overlay
  ctx.save()
  ctx.fillStyle = template.overlayColor || 'rgba(15, 23, 42, 0.75)'
  ctx.fillRect(0, 0, width, height)
  ctx.restore()

  // 3. Draw Decorative border / framing
  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 2 * scale
  ctx.strokeRect(30 * scale, 30 * scale, width - 60 * scale, height - 60 * scale)
  ctx.restore()

  // 4. Draw Badge / Tag
  if (template.badge) {
    ctx.save()
    const badgeText = template.badge.toUpperCase()
    const fontSize = 24 * scale
    ctx.font = `700 ${fontSize}px Inter, sans-serif`
    const textWidth = ctx.measureText(badgeText).width
    const badgePaddingX = 24 * scale
    const badgePaddingY = 12 * scale
    const badgeX = (width - textWidth - badgePaddingX * 2) / 2
    const badgeY = height * 0.16

    // Badge pill background
    ctx.fillStyle = template.accentColor || '#6366f1'
    ctx.beginPath()
    const r = 20 * scale
    const bw = textWidth + badgePaddingX * 2
    const bh = fontSize + badgePaddingY * 2
    ctx.roundRect ? ctx.roundRect(badgeX, badgeY, bw, bh, r) : ctx.rect(badgeX, badgeY, bw, bh)
    ctx.fill()

    // Badge text
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(badgeText, width / 2, badgeY + bh / 2)
    ctx.restore()
  }

  // 5. Draw Headline
  if (template.headline) {
    ctx.save()
    const isStory = height > width * 1.4
    const baseFontSize = isStory ? 68 * scale : 62 * scale
    const fontName = template.fontHeadline || 'Montserrat'
    ctx.font = `800 ${baseFontSize}px "${fontName}", sans-serif`
    ctx.fillStyle = template.textColor || '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    // Multi-line wrap
    const maxTextWidth = width * 0.82
    const lines = wrapText(ctx, template.headline, maxTextWidth)
    const lineHeight = baseFontSize * 1.15
    const totalHeadlineH = lines.length * lineHeight
    const startY = height * (isStory ? 0.28 : 0.32)

    lines.forEach((line, i) => {
      // Glow/Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.6)'
      ctx.shadowBlur = 15 * scale
      ctx.shadowOffsetY = 4 * scale
      ctx.fillText(line, width / 2, startY + i * lineHeight)
    })
    ctx.restore()
  }

  // 6. Draw Subheadline / Bullets
  if (template.subheadline) {
    ctx.save()
    const isStory = height > width * 1.4
    const fontSize = isStory ? 34 * scale : 30 * scale
    ctx.font = `500 ${fontSize}px "${template.fontBody || 'Inter'}", sans-serif`
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'

    const maxTextWidth = width * 0.78
    const rawLines = template.subheadline.split('\n')
    let allLines = []
    rawLines.forEach(rl => {
      allLines = allLines.concat(wrapText(ctx, rl, maxTextWidth))
    })

    const lineHeight = fontSize * 1.35
    const startY = height * (isStory ? 0.54 : 0.56)

    allLines.forEach((line, i) => {
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 8 * scale
      ctx.fillText(line, width / 2, startY + i * lineHeight)
    })
    ctx.restore()
  }

  // 7. Draw CTA (Call To Action Box)
  if (template.cta) {
    ctx.save()
    const ctaText = template.cta
    const fontSize = 28 * scale
    ctx.font = `700 ${fontSize}px Inter, sans-serif`
    const textWidth = ctx.measureText(ctaText).width
    const ctaPadX = 32 * scale
    const ctaPadY = 18 * scale
    const ctaW = textWidth + ctaPadX * 2
    const ctaH = fontSize + ctaPadY * 2
    const ctaX = (width - ctaW) / 2
    const ctaY = height * 0.82

    // Button background
    ctx.fillStyle = template.accentColor || '#6366f1'
    ctx.shadowColor = 'rgba(0,0,0,0.4)'
    ctx.shadowBlur = 16 * scale
    ctx.shadowOffsetY = 6 * scale
    ctx.beginPath()
    const r = 16 * scale
    ctx.roundRect ? ctx.roundRect(ctaX, ctaY, ctaW, ctaH, r) : ctx.rect(ctaX, ctaY, ctaW, ctaH)
    ctx.fill()

    // Button text
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ctaText, width / 2, ctaY + ctaH / 2)
    ctx.restore()
  }

  // 8. Custom Logo if attached
  if (template.logoUrl) {
    try {
      const logoImg = await loadImage(template.logoUrl)
      ctx.save()
      const logoH = 60 * scale
      const logoW = (logoImg.width / logoImg.height) * logoH
      const logoX = 60 * scale
      const logoY = 60 * scale
      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH)
      ctx.restore()
    } catch {
      // Ignore logo error
    }
  }
}

// Helper to wrap text into multiple lines
export function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let currentLine = words[0] || ''

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = ctx.measureText(currentLine + ' ' + word).width
    if (width < maxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }
  return lines
}

// Apply Watermark to an image onto Canvas
export async function applyWatermarkToCanvas(canvas, baseImage, watermarkOptions = {}) {
  if (!canvas || !baseImage) return

  const ctx = canvas.getContext('2d')
  const width = baseImage.naturalWidth || baseImage.width
  const height = baseImage.naturalHeight || baseImage.height

  canvas.width = width
  canvas.height = height

  // 1. Draw base image
  ctx.drawImage(baseImage, 0, 0, width, height)

  const {
    type = 'text', // 'text' | 'image'
    text = '@omeuinstagram',
    textColor = '#ffffff',
    fontFamily = 'Montserrat',
    fontSize = 42,
    position = 'bottom-right', // 'top-left'|'top-center'|'top-right'|'middle-left'|'center'|'middle-right'|'bottom-left'|'bottom-center'|'bottom-right'
    opacity = 0.8,
    scalePercent = 20, // relative to image width
    rotation = 0,
    offsetX = 40,
    offsetY = 40,
    isTiled = false,
    tiledSpacing = 220,
    logoImage = null,
    hasShadow = true,
    hasOutline = true,
    outlineColor = '#000000'
  } = watermarkOptions

  ctx.save()
  ctx.globalAlpha = opacity

  if (isTiled) {
    // Tiled pattern across the whole image
    ctx.rotate((rotation * Math.PI) / 180)
    const step = tiledSpacing * (width / 1000)

    if (type === 'text') {
      const scaledFontSize = Math.max(20, (fontSize * width) / 1000)
      ctx.font = `700 ${scaledFontSize}px "${fontFamily}", sans-serif`
      ctx.fillStyle = textColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Loop over a large area to cover rotation
      const diag = Math.sqrt(width * width + height * height)
      for (let x = -diag; x < diag * 2; x += step) {
        for (let y = -diag; y < diag * 2; y += step) {
          ctx.fillText(text, x, y)
        }
      }
    } else if (type === 'image' && logoImage) {
      const logoW = Math.max(50, (width * (scalePercent / 100)) * 0.6)
      const logoH = (logoImage.height / logoImage.width) * logoW
      const diag = Math.sqrt(width * width + height * height)

      for (let x = -diag; x < diag * 2; x += step) {
        for (let y = -diag; y < diag * 2; y += step) {
          ctx.drawImage(logoImage, x - logoW / 2, y - logoH / 2, logoW, logoH)
        }
      }
    }
  } else {
    // Single placement at chosen grid position
    let targetX = 0
    let targetY = 0

    if (type === 'image' && logoImage) {
      const logoW = Math.max(40, width * (scalePercent / 100))
      const logoH = (logoImage.height / logoImage.width) * logoW

      // Calculate position
      if (position.includes('left')) targetX = offsetX
      else if (position.includes('right')) targetX = width - logoW - offsetX
      else targetX = (width - logoW) / 2

      if (position.includes('top')) targetY = offsetY
      else if (position.includes('bottom')) targetY = height - logoH - offsetY
      else targetY = (height - logoH) / 2

      ctx.translate(targetX + logoW / 2, targetY + logoH / 2)
      if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180)

      if (hasShadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
      }

      ctx.drawImage(logoImage, -logoW / 2, -logoH / 2, logoW, logoH)
    } else {
      // Text watermark
      const scaledFontSize = Math.max(16, (fontSize * width) / 1000)
      ctx.font = `700 ${scaledFontSize}px "${fontFamily}", sans-serif`
      const textMetrics = ctx.measureText(text)
      const textW = textMetrics.width
      const textH = scaledFontSize

      if (position.includes('left')) {
        targetX = offsetX + textW / 2
        ctx.textAlign = 'center'
      } else if (position.includes('right')) {
        targetX = width - offsetX - textW / 2
        ctx.textAlign = 'center'
      } else {
        targetX = width / 2
        ctx.textAlign = 'center'
      }

      if (position.includes('top')) {
        targetY = offsetY + textH / 2
      } else if (position.includes('bottom')) {
        targetY = height - offsetY - textH / 2
      } else {
        targetY = height / 2
      }

      ctx.translate(targetX, targetY)
      if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180)

      ctx.textBaseline = 'middle'

      if (hasShadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.7)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
      }

      if (hasOutline) {
        ctx.strokeStyle = outlineColor
        ctx.lineWidth = Math.max(2, scaledFontSize * 0.1)
        ctx.strokeText(text, 0, 0)
      }

      ctx.fillStyle = textColor
      ctx.fillText(text, 0, 0)
    }
  }

  ctx.restore()
}

// Lineup Canvas Renderer tailored for completing user-provided matchday templates
// Only renders the 11 Starters (Titulares) and 7 Substitutes (Suplentes) + Coach,
// using the authentic Gothic/Blackletter typeface matching the official template.

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      const fallback = new Image()
      fallback.onload = () => resolve(fallback)
      fallback.onerror = () => reject(new Error('Image load failed'))
      fallback.src = src
    }
    img.src = src
  })
}

// Pre-load Gothic & Blackletter fonts to ensure canvas draws with the exact font immediately
export async function ensureGothicFontsLoaded() {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await Promise.allSettled([
        document.fonts.load('700 48px "Pirata One"'),
        document.fonts.load('700 48px "UnifrakturCook"'),
        document.fonts.load('700 48px "Germania One"'),
        document.fonts.load('700 48px "Grenze Gotisch"')
      ])
    } catch {}
  }
}

export async function renderLineupToCanvas(canvas, lineupData) {
  if (!canvas || !lineupData) return

  // Ensure fonts are ready
  await ensureGothicFontsLoaded()

  const ctx = canvas.getContext('2d')
  const {
    bgImage = null,
    startingXI = [],
    substitutes = [],
    playerPhotos = {}, // map: { '31': dataUrl, '5': dataUrl, ... }
    matchDetails = {},
    displayMode = 'list', // 'list' | 'tactical'
    fontFamily = '"Pirata One", "UnifrakturCook", "Germania One", "Grenze Gotisch", cursive, serif',
    startersX = 540, // Horizontal center anchor on 1080 canvas
    startersY = 340, // Vertical start position
    startersFontSize = 48, // Name font size (numbers are scaled proportionally)
    subsY = 1180, // Vertical start position for 7 substitutes
    subsFontSize = 34 // Substitutes font size
  } = lineupData

  // High-resolution canvas matching the template aspect ratio (9:16)
  const width = 1080
  const height = 1920

  canvas.width = width
  canvas.height = height

  ctx.save()
  ctx.clearRect(0, 0, width, height)

  // 1. Draw the user-provided Template Image as the pure base
  if (bgImage) {
    try {
      const loadedBgImg = await loadImage(bgImage)
      ctx.drawImage(loadedBgImg, 0, 0, width, height)
    } catch {
      drawFallbackLineupBackground(ctx, width, height)
    }
  } else {
    drawFallbackLineupBackground(ctx, width, height)
  }

  // 2. Render ONLY the 11 Starters (Titulares)
  // Perfectly centered horizontally on the canvas with larger font sizes
  const startersHeight = 780
  if (displayMode === 'tactical') {
    await renderStartersTactical(ctx, startingXI, playerPhotos, 200, startersY, 680, startersHeight, fontFamily)
  } else {
    // Default Official Poster List Mode
    await renderStartersList(ctx, startingXI, playerPhotos, {
      centerX: startersX,
      startY: startersY,
      totalH: startersHeight,
      fontName: fontFamily,
      fontSize: startersFontSize
    })
  }

  // 3. Render ONLY the 7 Substitutes (Suplentes)
  // Balanced in two columns centered horizontally
  const subsHeight = 360
  await renderSubstitutesSection(ctx, substitutes, playerPhotos, {
    centerX: startersX,
    startY: subsY,
    totalW: 860,
    totalH: subsHeight,
    fontName: fontFamily,
    fontSize: subsFontSize
  })

  ctx.restore()
}

// =========================================================================
// 11 TITULARES - LISTA OFICIAL DO POSTER
// Unified with the template's Gothic/Blackletter font and colors
// =========================================================================
async function renderStartersList(ctx, starters, playerPhotos, opts) {
  const centerX = typeof opts === 'object' && opts.centerX !== undefined ? opts.centerX : 540
  const startY = typeof opts === 'object' && opts.startY !== undefined ? opts.startY : 340
  const totalH = typeof opts === 'object' && opts.totalH !== undefined ? opts.totalH : 780
  const fontName = typeof opts === 'object' ? opts.fontName : (arguments[7] || '"Pirata One"')
  const fontSize = typeof opts === 'object' && opts.fontSize !== undefined ? opts.fontSize : 48

  const rowCount = Math.min(starters.length, 11)
  if (rowCount === 0) return

  const rowH = totalH / 11
  const numberFontSize = Math.round(fontSize * 1.18) // ~56px
  const captainFontSize = Math.round(fontSize * 0.75) // ~36px

  // Centering anchors:
  // Numbers right-align at centerX - 40
  // Photos sit around centerX - 12
  // Names left-align starting at centerX + 18
  const numRightX = centerX - 40
  const photoCenterX = centerX - 12
  const nameLeftX = centerX + 18
  const nameNoPhotoLeftX = centerX - 15

  for (let i = 0; i < rowCount; i++) {
    const player = starters[i]
    if (!player || (!player.number?.trim() && !player.name?.trim())) {
      continue
    }

    const rowY = startY + i * rowH + rowH / 2
    const photoSrc = playerPhotos[player.number] || player.photoUrl

    ctx.save()

    // 1. Squad Number in Gothic Font (Royal Blue + White Outline)
    ctx.font = `700 ${numberFontSize}px ${fontName}`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    // Crisp white outline
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 4
    ctx.strokeText(player.number || '', numRightX, rowY)

    ctx.fillStyle = '#0044cc'
    ctx.fillText(player.number || '', numRightX, rowY)

    // 2. Optional Circular Photo Thumbnail
    let currentNameX = photoSrc ? nameLeftX : nameNoPhotoLeftX
    if (photoSrc) {
      try {
        const pImg = await loadImage(photoSrc)
        const photoRadius = Math.round(fontSize * 0.48)
        const photoCy = rowY

        ctx.save()
        ctx.beginPath()
        ctx.arc(photoCenterX, photoCy, photoRadius, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.clip()
        ctx.drawImage(pImg, photoCenterX - photoRadius, photoCy - photoRadius, photoRadius * 2, photoRadius * 2)
        ctx.restore()

        // Border ring
        ctx.beginPath()
        ctx.arc(photoCenterX, photoCy, photoRadius, 0, Math.PI * 2)
        ctx.strokeStyle = '#0044cc'
        ctx.lineWidth = 2
        ctx.stroke()
      } catch {}
    }

    // 3. Player Name in Gothic Font (Royal Navy + Crisp White Outline)
    const name = (player.name || '').toUpperCase()
    ctx.font = `700 ${fontSize}px ${fontName}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    const maxNameW = 460
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.lineWidth = 4
    ctx.strokeText(name, currentNameX, rowY, maxNameW)

    ctx.fillStyle = '#002677'
    ctx.fillText(name, currentNameX, rowY, maxNameW)

    // 4. Captain Mark (C) in Golden Gothic Font
    if (player.isCaptain) {
      const nameWidth = Math.min(ctx.measureText(name).width, maxNameW)
      const capX = currentNameX + nameWidth + 14

      ctx.font = `700 ${captainFontSize}px ${fontName}`
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2.5
      ctx.strokeText('(C)', capX, rowY)

      ctx.fillStyle = '#d97706' // gold
      ctx.fillText('(C)', capX, rowY)
    }

    // 5. Subtle row divider line centered at centerX
    const lineY = startY + (i + 1) * rowH - 4
    if (i < rowCount - 1) {
      const dividerW = 680
      const divStartX = centerX - dividerW / 2
      const grad = ctx.createLinearGradient(divStartX, lineY, divStartX + dividerW, lineY)
      grad.addColorStop(0, 'rgba(0, 68, 204, 0)')
      grad.addColorStop(0.25, 'rgba(0, 68, 204, 0.22)')
      grad.addColorStop(0.75, 'rgba(0, 68, 204, 0.22)')
      grad.addColorStop(1, 'rgba(0, 68, 204, 0)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(divStartX, lineY)
      ctx.lineTo(divStartX + dividerW, lineY)
      ctx.stroke()
    }

    ctx.restore()
  }
}

// =========================================================================
// 11 TITULARES - FORMAÇÃO TÁTICA 3+3+3+2
// =========================================================================
async function renderStartersTactical(ctx, starters, playerPhotos, startX, startY, totalW, totalH, fontName) {
  const rowsPattern = [3, 3, 3, 2]
  const rowCount = rowsPattern.length
  const rowSpacing = totalH / rowCount

  const gapX = 14
  const cardW = (totalW - gapX * 2) / 3
  const cardH = 145

  let playerIdx = 0

  for (let rIdx = 0; rIdx < rowCount; rIdx++) {
    const numInRow = rowsPattern[rIdx]
    const rowW = numInRow * cardW + (numInRow - 1) * gapX
    const rowStartX = startX + (totalW - rowW) / 2
    const rowY = startY + rIdx * rowSpacing + (rowSpacing - cardH) / 2

    for (let c = 0; c < numInRow; c++) {
      if (playerIdx >= starters.length) break
      const player = starters[playerIdx]
      playerIdx++
      if (!player || (!player.number?.trim() && !player.name?.trim())) {
        continue
      }
      const px = rowStartX + c * (cardW + gapX)
      const photoSrc = playerPhotos[player.number] || player.photoUrl

      await drawTacticalPlayerCard(ctx, px, rowY, cardW, cardH, player, photoSrc, fontName)
    }
  }
}

async function drawTacticalPlayerCard(ctx, x, y, w, h, player, photoSrc, fontName) {
  if (!player || (!player.number?.trim() && !player.name?.trim())) {
    return
  }
  ctx.save()

  const centerX = x + w / 2
  const badgeSize = Math.min(w * 0.44, 82)
  const badgeY = y + 4
  const badgeX = centerX - badgeSize / 2

  if (photoSrc) {
    try {
      const pImg = await loadImage(photoSrc)
      ctx.beginPath()
      ctx.arc(centerX, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.stroke()

      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, badgeY + badgeSize / 2, badgeSize / 2 - 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(pImg, badgeX, badgeY, badgeSize, badgeSize)
      ctx.restore()

      // Number tag in Gothic font
      const tagW = 28
      const tagH = 24
      const tagX = badgeX - 4
      const tagY = badgeY + badgeSize - 20

      ctx.fillStyle = '#0044cc'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect ? ctx.roundRect(tagX, tagY, tagW, tagH, 6) : ctx.rect(tagX, tagY, tagW, tagH)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = `700 16px ${fontName}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(player.number || '0', tagX + tagW / 2, tagY + tagH / 2 + 1)
    } catch {
      drawTacticalNumberBadge(ctx, badgeX, badgeY, badgeSize, centerX, player, fontName)
    }
  } else {
    drawTacticalNumberBadge(ctx, badgeX, badgeY, badgeSize, centerX, player, fontName)
  }

  // Captain mark
  if (player.isCaptain) {
    const capSize = 22
    const capX = badgeX + badgeSize - 6
    const capY = badgeY - 4
    ctx.fillStyle = '#f59e0b'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(capX, capY, capSize / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#000000'
    ctx.font = `700 14px ${fontName}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('C', capX, capY + 1)
  }

  // Name pill in Gothic font
  const nameY = badgeY + badgeSize + 8
  const nameH = 34
  const nameW = w - 6
  const nameX = x + 3

  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
  ctx.strokeStyle = '#0044cc'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(nameX, nameY, nameW, nameH, 10) : ctx.rect(nameX, nameY, nameW, nameH)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#002677'
  ctx.font = `700 22px ${fontName}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText((player.name || '').toUpperCase(), centerX, nameY + nameH / 2 + 1, nameW - 10)

  ctx.restore()
}

function drawTacticalNumberBadge(ctx, badgeX, badgeY, badgeSize, centerX, player, fontName) {
  const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeSize)
  grad.addColorStop(0, '#0055ff')
  grad.addColorStop(1, '#002677')

  ctx.fillStyle = grad
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 16) : ctx.rect(badgeX, badgeY, badgeSize, badgeSize)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = `700 42px ${fontName}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(player.number || '0', centerX, badgeY + badgeSize / 2 + 1)
}

// =========================================================================
// 7 SUPLENTES
// Unified with the template's Gothic/Blackletter font and colors
// =========================================================================
async function renderSubstitutesSection(ctx, substitutes, playerPhotos, opts) {
  const centerX = typeof opts === 'object' && opts.centerX !== undefined ? opts.centerX : 540
  const startY = typeof opts === 'object' && opts.startY !== undefined ? opts.startY : 1180
  const totalW = typeof opts === 'object' && opts.totalW !== undefined ? opts.totalW : 860
  const fontName = typeof opts === 'object' ? opts.fontName : (arguments[7] || '"Pirata One"')
  const fontSize = typeof opts === 'object' && opts.fontSize !== undefined ? opts.fontSize : 34

  ctx.save()

  // 1. Header: "◆   SUPLENTES   ◆" in Gothic Font
  const headerY = startY + 16
  const headerFontSize = Math.round(fontSize * 1.12)
  ctx.font = `700 ${headerFontSize}px ${fontName}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.lineWidth = 3.5
  ctx.strokeText('◆   SUPLENTES   ◆', centerX, headerY)

  ctx.fillStyle = '#0044cc'
  ctx.fillText('◆   SUPLENTES   ◆', centerX, headerY)

  // 2. The 7 Substitutes in 2 Balanced Columns Centered Around centerX
  const subsList = substitutes.slice(0, 7)
  const colGap = 40
  const colW = (totalW - colGap) / 2
  const col1Left = centerX - colGap / 2 - colW
  const col2Left = centerX + colGap / 2
  const rowStartSubY = headerY + 48
  const rowH = 62

  const numberFontSize = Math.round(fontSize * 1.15)

  for (let idx = 0; idx < subsList.length; idx++) {
    const sub = subsList[idx]
    if (!sub || (!sub.number?.trim() && !sub.name?.trim())) {
      continue
    }

    const isCol1 = idx < 4
    const colLeft = isCol1 ? col1Left : col2Left
    const rowIdx = isCol1 ? idx : idx - 4
    const itemY = rowStartSubY + rowIdx * rowH

    const numStr = sub.number || ''
    const nameStr = (sub.name || '').toUpperCase()

    ctx.save()

    // Squad Number in Gothic Font (Royal Blue + White Outline)
    ctx.font = `700 ${numberFontSize}px ${fontName}`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    const numX = colLeft + 50
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.strokeText(numStr, numX, itemY)

    ctx.fillStyle = '#0044cc'
    ctx.fillText(numStr, numX, itemY)

    // Substitute Name in Gothic Font (Royal Navy + White Outline)
    const nameX = numX + 16
    const maxSubNameW = colW - 70
    ctx.font = `700 ${fontSize}px ${fontName}`
    ctx.textAlign = 'left'

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.lineWidth = 3
    ctx.strokeText(nameStr, nameX, itemY, maxSubNameW)

    ctx.fillStyle = '#002677'
    ctx.fillText(nameStr, nameX, itemY, maxSubNameW)

    ctx.restore()
  }

  ctx.restore()
}

// Fallback background when no template has been uploaded yet for this matchday
function drawFallbackLineupBackground(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0a194f')
  grad.addColorStop(0.3, '#1e3a8a')
  grad.addColorStop(0.7, '#1e3a8a')
  grad.addColorStop(1, '#050c26')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
  ctx.lineWidth = 4
  ctx.strokeRect(30, 30, w - 60, h - 60)

  // Prompt text
  ctx.font = '700 28px sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('📁 Carrega a imagem do teu template de jogo', w / 2, 220)
}

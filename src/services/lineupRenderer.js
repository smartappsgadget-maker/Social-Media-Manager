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
    bgImage = '/template_onze_inicial.jpg',
    startingXI = [],
    substitutes = [],
    playerPhotos = {}, // map: { '31': dataUrl, '5': dataUrl, ... }
    matchDetails = {},
    displayMode = 'list', // 'list' | 'tactical'
    fontFamily = '"Pirata One", "UnifrakturCook", "Germania One", "Grenze Gotisch", cursive, serif'
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
      // Fallback: blue/white gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, '#0a194f')
      grad.addColorStop(0.3, '#ffffff')
      grad.addColorStop(0.7, '#ffffff')
      grad.addColorStop(1, '#0a194f')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    }
  }

  // 2. Render ONLY the 11 Starters (Titulares)
  // Positioned in the central open zone (between top emblems and bottom crystal)
  const startersStartY = 350
  const startersHeight = 780
  if (displayMode === 'tactical') {
    await renderStartersTactical(ctx, startingXI, playerPhotos, 200, startersStartY, 680, startersHeight, fontFamily)
  } else {
    // Default Official Poster List Mode
    await renderStartersList(ctx, startingXI, playerPhotos, 200, startersStartY, 680, startersHeight, fontFamily)
  }

  // 3. Render ONLY the 7 Substitutes (Suplentes) + Coach
  const subsStartY = startersStartY + startersHeight + 25
  const subsHeight = 360
  await renderSubstitutesSection(ctx, substitutes, playerPhotos, matchDetails.coach, 200, subsStartY, 680, subsHeight, fontFamily)

  ctx.restore()
}

// =========================================================================
// 11 TITULARES - LISTA OFICIAL DO POSTER
// Unified with the template's Gothic/Blackletter font and colors
// =========================================================================
async function renderStartersList(ctx, starters, playerPhotos, startX, startY, totalW, totalH, fontName) {
  const rowCount = Math.min(starters.length, 11)
  if (rowCount === 0) return

  const rowH = totalH / 11 // ~70.9px per row

  for (let i = 0; i < rowCount; i++) {
    const player = starters[i]
    if (!player || (!player.number?.trim() && !player.name?.trim())) {
      continue
    }

    const rowY = startY + i * rowH + rowH / 2
    const photoSrc = playerPhotos[player.number] || player.photoUrl

    ctx.save()

    // 1. Squad Number in Gothic Font (Royal Blue + White Outline)
    const numX = startX + 50
    ctx.font = `700 42px ${fontName}`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    // Crisp white outline for contrast against textured background
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.strokeText(player.number || '', numX, rowY)

    ctx.fillStyle = '#0044cc'
    ctx.fillText(player.number || '', numX, rowY)

    // 2. Optional Circular Photo Thumbnail
    let nameStartX = numX + 28
    if (photoSrc) {
      try {
        const pImg = await loadImage(photoSrc)
        const photoRadius = 22
        const photoCx = numX + 30
        const photoCy = rowY

        ctx.save()
        ctx.beginPath()
        ctx.arc(photoCx, photoCy, photoRadius, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.clip()
        ctx.drawImage(pImg, photoCx - photoRadius, photoCy - photoRadius, photoRadius * 2, photoRadius * 2)
        ctx.restore()

        // Border ring
        ctx.beginPath()
        ctx.arc(photoCx, photoCy, photoRadius, 0, Math.PI * 2)
        ctx.strokeStyle = '#0044cc'
        ctx.lineWidth = 1.8
        ctx.stroke()

        nameStartX = photoCx + photoRadius + 16
      } catch {}
    }

    // 3. Player Name in Gothic Font (Royal Navy + Crisp White Outline)
    const name = (player.name || '').toUpperCase()
    ctx.font = `700 36px ${fontName}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    // Crisp white outline
    const maxNameW = Math.max(totalW - (nameStartX - startX) - 40, 160)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.lineWidth = 3.5
    ctx.strokeText(name, nameStartX, rowY, maxNameW)

    // Deep royal navy fill
    ctx.fillStyle = '#002677'
    ctx.fillText(name, nameStartX, rowY, maxNameW)

    // 4. Captain Mark (C) in Golden Gothic Font
    if (player.isCaptain) {
      const nameWidth = ctx.measureText(name).width
      const capX = nameStartX + nameWidth + 14

      ctx.font = `700 30px ${fontName}`
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.strokeText('(C)', capX, rowY)

      ctx.fillStyle = '#d97706' // gold
      ctx.fillText('(C)', capX, rowY)
    }

    // 5. Subtle row divider line
    const lineY = startY + (i + 1) * rowH - 4
    if (i < rowCount - 1) {
      const grad = ctx.createLinearGradient(startX + 10, lineY, startX + totalW - 10, lineY)
      grad.addColorStop(0, 'rgba(0, 68, 204, 0)')
      grad.addColorStop(0.25, 'rgba(0, 68, 204, 0.18)')
      grad.addColorStop(0.75, 'rgba(0, 68, 204, 0.18)')
      grad.addColorStop(1, 'rgba(0, 68, 204, 0)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(startX + 10, lineY)
      ctx.lineTo(startX + totalW - 10, lineY)
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
// 7 SUPLENTES + TREINADOR
// Unified with the template's Gothic/Blackletter font and colors
// =========================================================================
async function renderSubstitutesSection(ctx, substitutes, playerPhotos, coach, startX, startY, totalW, totalH, fontName) {
  ctx.save()

  const centerX = startX + totalW / 2

  // 1. Header: "◆   SUPLENTES   ◆" in Gothic Font
  const headerY = startY + 16
  ctx.font = `700 32px ${fontName}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.lineWidth = 3
  ctx.strokeText('◆   SUPLENTES   ◆', centerX, headerY)

  ctx.fillStyle = '#0044cc'
  ctx.fillText('◆   SUPLENTES   ◆', centerX, headerY)

  // 2. The 7 Substitutes in 2 Balanced Columns
  const subsList = substitutes.slice(0, 7)
  const colW = (totalW - 40) / 2
  const col1X = startX + 15
  const col2X = startX + totalW / 2 + 20
  const rowStartSubY = headerY + 45
  const rowH = 58

  for (let idx = 0; idx < subsList.length; idx++) {
    const sub = subsList[idx]
    if (!sub || (!sub.number?.trim() && !sub.name?.trim())) {
      continue
    }

    const isCol1 = idx < 4
    const colX = isCol1 ? col1X : col2X
    const rowIdx = isCol1 ? idx : idx - 4
    const itemY = rowStartSubY + rowIdx * rowH

    const numStr = sub.number || ''
    const nameStr = (sub.name || '').toUpperCase()

    // Squad Number in Gothic Font (Royal Blue + White Outline)
    ctx.font = `700 30px ${fontName}`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    const numX = colX + 38
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.5
    ctx.strokeText(numStr, numX, itemY)

    ctx.fillStyle = '#0044cc'
    ctx.fillText(numStr, numX, itemY)

    // Substitute Name in Gothic Font (Royal Navy + White Outline)
    const nameX = numX + 16
    const maxSubNameW = Math.max(colW - (nameX - colX) - 10, 120)
    ctx.font = `700 26px ${fontName}`
    ctx.textAlign = 'left'

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.lineWidth = 2.5
    ctx.strokeText(nameStr, nameX, itemY, maxSubNameW)

    ctx.fillStyle = '#002677'
    ctx.fillText(nameStr, nameX, itemY, maxSubNameW)
  }

  // 3. Coach (Treinador) in Gothic Font at the bottom
  if (coach) {
    const coachY = startY + totalH - 12
    const coachText = `TREINADOR: ${coach.toUpperCase()}`

    ctx.font = `700 23px ${fontName}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.lineWidth = 2.5
    ctx.strokeText(coachText, centerX, coachY)

    ctx.fillStyle = '#002677'
    ctx.fillText(coachText, centerX, coachY)
  }

  ctx.restore()
}

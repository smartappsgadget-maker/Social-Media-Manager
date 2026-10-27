// Lineup Canvas Renderer tailored for the official 9:16 Matchday Template
// Supports player photos by number, dynamic Matchday/Jornada, Home/Away condition, 3+3+3+2 Starters & 7 Substitutes

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

export async function renderLineupToCanvas(canvas, lineupData) {
  if (!canvas || !lineupData) return

  const ctx = canvas.getContext('2d')
  const {
    bgImage = '/template_onze_inicial.jpg',
    startingXI = [],
    substitutes = [],
    playerPhotos = {}, // map: { '1': dataUrl, '7': dataUrl, ... }
    matchDetails = {},
    clubTheme = {
      primaryColor: '#0052cc',
      accentColor: '#00d2ff',
      nameColor: '#002677'
    }
  } = lineupData

  // High-resolution canvas matching the template aspect ratio (9:16)
  const width = 1080
  const height = 1920

  canvas.width = width
  canvas.height = height

  ctx.save()
  ctx.clearRect(0, 0, width, height)

  // 1. Draw the Official Background Template Image
  if (bgImage) {
    try {
      const img = await loadImage(bgImage)
      ctx.drawImage(img, 0, 0, width, height)
    } catch {
      // Fallback: draw icy blue gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, '#0a194f')
      grad.addColorStop(0.3, '#ffffff')
      grad.addColorStop(0.7, '#ffffff')
      grad.addColorStop(1, '#0a194f')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    }
  }

  // 2. Dynamic Match Info Overlays (Casa/Fora e Jornada)
  await renderMatchDetailsOverlays(ctx, matchDetails, width, height)

  // 3. Define the Usable Center Zone (between "ONZE INICIAL" and "CAMPEONATO CONCELHIO AFAST")
  const usableLeft = 190
  const usableRight = 895
  const usableWidth = usableRight - usableLeft // ~705px

  // Top graphics end around y = 330; Bottom graphics start around y = 1630.
  const startersStartY = 350
  const startersHeight = 770 // Area for the 4 rows of the 11 starters

  // 4. Render 11 Starters in 3 + 3 + 3 + 2 Rows with Player Photos
  await renderStartersRows(ctx, startingXI, playerPhotos, usableLeft, startersStartY, usableWidth, startersHeight, clubTheme)

  // 5. Render Section for the 7 Substitutes (and Coach)
  const subsStartY = startersStartY + startersHeight + 35
  const subsHeight = 440 // Area for the 7 substitutes
  await renderSevenSubstitutes(ctx, substitutes, playerPhotos, matchDetails.coach, usableLeft, subsStartY, usableWidth, subsHeight, clubTheme)

  ctx.restore()
}

// Render dynamic overlays for Jornada, Home/Away and Opponent Crests
async function renderMatchDetailsOverlays(ctx, match, w, h) {
  ctx.save()

  // 1. Dynamic Jornada in bottom right corner (covers/replaces the static 4ª with the exact user round!)
  const jornadaText = (match.roundNumber || '4ª').toUpperCase()
  const jornadaX = w - 165
  const jornadaY = h - 235

  // Subtle frosted cover badge for the jornada number to allow any round (e.g. 1ª, 5ª, 12ª)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'
  ctx.strokeStyle = '#0044cc'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(jornadaX - 45, jornadaY - 45, 95, 75, 12) : ctx.rect(jornadaX - 45, jornadaY - 45, 95, 75)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#0044cc'
  ctx.font = '900 48px "Bebas Neue", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(jornadaText, jornadaX + 2, jornadaY - 6)

  // 2. Home / Away & Opponent Match Banner
  const isHome = match.isHome !== false // default home
  const locationTag = isHome ? 'CASA 🏠' : 'FORA ✈️'
  const opponentName = (match.opponentName || 'ADVERSÁRIO').toUpperCase()
  const myClubName = (match.myClubName || 'AD GUIMAREI').toUpperCase()

  const homeTeamName = isHome ? myClubName : opponentName
  const homeTeamLogo = isHome ? match.myClubLogoUrl : match.opponentLogoUrl
  const homeTeamCode = isHome ? 'ADG' : opponentName.slice(0, 3)

  const awayTeamName = isHome ? opponentName : myClubName
  const awayTeamLogo = isHome ? match.opponentLogoUrl : match.myClubLogoUrl
  const awayTeamCode = isHome ? opponentName.slice(0, 3) : 'ADG'

  const bannerH = 42
  const bannerY = 278
  const bannerW = 620
  const bannerX = (w - bannerW) / 2

  // Banner background
  ctx.shadowColor = 'rgba(0, 38, 119, 0.4)'
  ctx.shadowBlur = 12
  ctx.fillStyle = 'rgba(10, 25, 79, 0.94)'
  ctx.strokeStyle = '#0055ff'
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 14) : ctx.rect(bannerX, bannerY, bannerW, bannerH)
  ctx.fill()
  ctx.stroke()
  ctx.shadowColor = 'transparent'

  // Draw Home Team Crest (Left)
  const crestRadius = 15
  const leftCrestX = bannerX + 24
  const crestY = bannerY + bannerH / 2
  await drawTeamCrestOrBadge(ctx, leftCrestX, crestY, crestRadius, homeTeamLogo, homeTeamCode)

  // Draw Away Team Crest (Right)
  const rightCrestX = bannerX + bannerW - 24
  await drawTeamCrestOrBadge(ctx, rightCrestX, crestY, crestRadius, awayTeamLogo, awayTeamCode)

  // Draw Center "VS • CASA/FORA" pill
  const pillW = 96
  const pillH = 26
  const pillX = w / 2 - pillW / 2
  const pillY = bannerY + (bannerH - pillH) / 2

  ctx.fillStyle = '#051139'
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(pillX, pillY, pillW, pillH, 8) : ctx.rect(pillX, pillY, pillW, pillH)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#38bdf8'
  ctx.font = '800 10px "Montserrat", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`VS • ${locationTag}`, w / 2, pillY + pillH / 2 + 1)

  // Draw Home Team Name (Left of VS)
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 13px "Montserrat", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const leftTextX = (bannerX + 44 + pillX) / 2
  ctx.fillText(homeTeamName, leftTextX, bannerY + bannerH / 2 + 1, pillX - bannerX - 52)

  // Draw Away Team Name (Right of VS)
  const rightTextX = (pillX + pillW + bannerX + bannerW - 44) / 2
  ctx.fillText(awayTeamName, rightTextX, bannerY + bannerH / 2 + 1, (bannerX + bannerW) - (pillX + pillW) - 52)

  ctx.restore()
}

// Helper to draw team crest image or stylized circular badge
async function drawTeamCrestOrBadge(ctx, cx, cy, radius, logoUrl, fallbackLetters) {
  ctx.save()
  if (logoUrl) {
    try {
      const img = await loadImage(logoUrl)
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.clip()
      ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2)
      ctx.restore()

      // Border ring
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = '#38bdf8'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.restore()
      return
    } catch {}
  }

  // Fallback monogram badge
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = '#0a194f'
  ctx.fill()
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 10px "Montserrat", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText((fallbackLetters || '').slice(0, 3).toUpperCase(), cx, cy + 1)
  ctx.restore()
}

// Render the 11 Starters in rows: Row 1 (3), Row 2 (3), Row 3 (3), Row 4 (2)
async function renderStartersRows(ctx, starters, playerPhotos, startX, startY, totalW, totalH, theme) {
  const rowsPattern = [3, 3, 3, 2] // 3 + 3 + 3 + 2 = 11
  const rowCount = rowsPattern.length // 4 rows
  const rowSpacing = totalH / rowCount

  const gapX = 14
  const cardW = (totalW - gapX * 2) / 3 // ~225px width
  const cardH = 145 // Height of card

  let playerIdx = 0

  for (let rIdx = 0; rIdx < rowCount; rIdx++) {
    const numInRow = rowsPattern[rIdx]
    const rowW = numInRow * cardW + (numInRow - 1) * gapX
    const rowStartX = startX + (totalW - rowW) / 2
    const rowY = startY + rIdx * rowSpacing + (rowSpacing - cardH) / 2

    for (let c = 0; c < numInRow; c++) {
      if (playerIdx >= starters.length) break
      const player = starters[playerIdx]
      const px = rowStartX + c * (cardW + gapX)
      const photoSrc = playerPhotos[player.number] || player.photoUrl

      await drawStarterPlayer(ctx, px, rowY, cardW, cardH, player, photoSrc, theme)
      playerIdx++
    }
  }
}

// Draw individual starter player card (With Player Photo if available, Number Badge + Name)
async function drawStarterPlayer(ctx, x, y, w, h, player, photoSrc, theme) {
  ctx.save()

  const centerX = x + w / 2
  const badgeSize = Math.min(w * 0.44, 82)
  const badgeY = y + 4
  const badgeX = centerX - badgeSize / 2

  // 1. Draw Player Photo OR Number Badge
  if (photoSrc) {
    try {
      const pImg = await loadImage(photoSrc)

      // Circular Photo Frame with Glow
      ctx.shadowColor = 'rgba(0, 38, 119, 0.45)'
      ctx.shadowBlur = 14
      ctx.shadowOffsetY = 4

      // White/Blue circular background
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#0044cc'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Clip image to circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(centerX, badgeY + badgeSize / 2, badgeSize / 2 - 2, 0, Math.PI * 2)
      ctx.clip()

      // Draw photo fitted
      ctx.drawImage(pImg, badgeX, badgeY, badgeSize, badgeSize)
      ctx.restore()

      // Squad Number Tag on the corner of the photo
      const tagW = 28
      const tagH = 22
      const tagX = badgeX - 4
      const tagY = badgeY + badgeSize - 20

      ctx.fillStyle = '#0044cc'
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect ? ctx.roundRect(tagX, tagY, tagW, tagH, 6) : ctx.rect(tagX, tagY, tagW, tagH)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 13px "Montserrat", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(player.number || '0', tagX + tagW / 2, tagY + tagH / 2 + 1)

    } catch {
      drawDefaultNumberBadge(ctx, badgeX, badgeY, badgeSize, centerX, player)
    }
  } else {
    // Standard Number Badge if no photo uploaded
    drawDefaultNumberBadge(ctx, badgeX, badgeY, badgeSize, centerX, player)
  }

  // Captain (C) badge if marked
  if (player.isCaptain) {
    const capSize = 22
    const capX = badgeX + badgeSize - 6
    const capY = badgeY - 4
    ctx.fillStyle = '#f59e0b'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(capX, capY, capSize / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#000000'
    ctx.font = '900 12px "Inter", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('C', capX, capY + 1)
  }

  // 2. Name Banner Pill below the badge
  const nameY = badgeY + badgeSize + 8
  const nameH = 34
  const nameW = w - 6
  const nameX = x + 3

  ctx.shadowColor = 'rgba(0, 38, 119, 0.2)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 2

  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
  ctx.strokeStyle = '#0044cc'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(nameX, nameY, nameW, nameH, 10) : ctx.rect(nameX, nameY, nameW, nameH)
  ctx.fill()
  ctx.stroke()

  // Name text
  const name = (player.name || '').toUpperCase()
  ctx.fillStyle = '#002677'
  ctx.font = '800 15px "Montserrat", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'transparent'
  ctx.fillText(name, centerX, nameY + nameH / 2 + 1, nameW - 10)

  ctx.restore()
}

// Fallback Number Badge
function drawDefaultNumberBadge(ctx, badgeX, badgeY, badgeSize, centerX, player) {
  ctx.shadowColor = 'rgba(0, 38, 119, 0.35)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 4

  const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeSize)
  badgeGrad.addColorStop(0, '#0055ff')
  badgeGrad.addColorStop(1, '#002677')

  ctx.fillStyle = badgeGrad
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 16) : ctx.rect(badgeX, badgeY, badgeSize, badgeSize)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.lineWidth = 1
  ctx.strokeRect(badgeX + 3, badgeY + 3, badgeSize - 6, badgeSize - 6)

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 36px "Montserrat", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 6
  ctx.fillText(player.number || '0', centerX, badgeY + badgeSize / 2 + 1)
}

// Render Section for the 7 Substitutes (with photo support)
async function renderSevenSubstitutes(ctx, substitutes, playerPhotos, coach, x, y, w, h, theme) {
  ctx.save()

  // 1. Container Card for Substitutes
  ctx.shadowColor = 'rgba(0, 38, 119, 0.25)'
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 4

  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
  ctx.strokeStyle = '#0044cc'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(x, y, w, h, 20) : ctx.rect(x, y, w, h)
  ctx.fill()
  ctx.stroke()

  // 2. Header Bar: "SUPLENTES" & Coach
  const headerH = 46
  ctx.fillStyle = '#0044cc'
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(x, y, w, headerH, [20, 20, 0, 0]) : ctx.rect(x, y, w, headerH)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 18px "Bebas Neue", sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('BANCO DE SUPLENTES', x + 24, y + headerH / 2 + 1)

  if (coach) {
    ctx.textAlign = 'right'
    ctx.font = '800 12px "Montserrat", sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`TREINADOR: ${coach.toUpperCase()}`, x + w - 24, y + headerH / 2 + 1)
  }

  // 3. Grid for exactly 7 Substitutes (2 columns: 4 on left, 3 on right)
  const subsList = substitutes.slice(0, 7) // exact 7 substitutes
  const contentY = y + headerH + 20
  const colW = (w - 56) / 2
  const rowH = 70

  for (let idx = 0; idx < subsList.length; idx++) {
    const sub = subsList[idx]
    const colIdx = idx < 4 ? 0 : 1
    const rowIdx = idx < 4 ? idx : idx - 4
    const itemX = x + 20 + colIdx * (colW + 16)
    const itemY = contentY + rowIdx * rowH

    // Individual Sub Item Box
    ctx.fillStyle = 'rgba(240, 245, 255, 0.95)'
    ctx.strokeStyle = 'rgba(0, 82, 204, 0.3)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(itemX, itemY, colW, 54, 12) : ctx.rect(itemX, itemY, colW, 54)
    ctx.fill()
    ctx.stroke()

    // Left Number Badge or Mini Photo
    const bSize = 38
    const bx = itemX + 8
    const by = itemY + 8
    const photoSrc = playerPhotos[sub.number]

    if (photoSrc) {
      try {
        const pImg = await loadImage(photoSrc)
        ctx.save()
        ctx.beginPath()
        ctx.arc(bx + bSize / 2, by + bSize / 2, bSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(pImg, bx, by, bSize, bSize)
        ctx.restore()

        // Mini number overlay
        ctx.fillStyle = '#0044cc'
        ctx.beginPath()
        ctx.arc(bx + bSize - 4, by + bSize - 4, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = '800 9px "Montserrat", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(sub.number || '0', bx + bSize - 4, by + bSize - 1)
      } catch {
        drawDefaultSubBadge(ctx, bx, by, bSize, sub)
      }
    } else {
      drawDefaultSubBadge(ctx, bx, by, bSize, sub)
    }

    // Substitute Name
    ctx.textAlign = 'left'
    ctx.fillStyle = '#002677'
    ctx.font = '800 14px "Montserrat", sans-serif'
    const nameX = bx + bSize + 12
    const name = (sub.name || '').toUpperCase()
    ctx.fillText(name, nameX, itemY + 27, colW - bSize - 24)
  }

  ctx.restore()
}

function drawDefaultSubBadge(ctx, bx, by, bSize, sub) {
  ctx.fillStyle = '#0044cc'
  ctx.beginPath()
  ctx.roundRect ? ctx.roundRect(bx, by, bSize, bSize, 8) : ctx.rect(bx, by, bSize, bSize)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 18px "Montserrat", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(sub.number || '0', bx + bSize / 2, by + bSize / 2 + 1)
}

// Match Result Canvas Renderer tailored for user-provided templates
// Renders the Final Score (Placar) and Scorers (Marcadores de Golos)
// using the authentic Gothic/Blackletter typeface matching the club templates.

import { loadImage, ensureGothicFontsLoaded } from './lineupRenderer'

export async function renderResultToCanvas(canvas, resultData) {
  if (!canvas || !resultData) return

  await ensureGothicFontsLoaded()

  const ctx = canvas.getContext('2d')
  const {
    bgImage = null,
    myScore = 0,
    opponentScore = 0,
    status = 'FINAL',
    penaltyMyScore = '',
    penaltyOpponentScore = '',
    scorers = [],
    playerPhotos = {},
    fontFamily = '"Pirata One", "UnifrakturCook", "Germania One", "Grenze Gotisch", cursive, serif',
    scoreY = 860,
    scoreSize = 140,
    scorersY = 1140,
    displayScorers = true
  } = resultData

  // High-resolution canvas matching 9:16 aspect ratio
  const width = 1080
  const height = 1920

  canvas.width = width
  canvas.height = height

  ctx.save()
  ctx.clearRect(0, 0, width, height)

  // 1. Draw Template Background
  if (bgImage) {
    try {
      const loadedBgImg = await loadImage(bgImage)
      ctx.drawImage(loadedBgImg, 0, 0, width, height)
    } catch {
      drawFallbackResultBackground(ctx, width, height)
    }
  } else {
    drawFallbackResultBackground(ctx, width, height)
  }

  // 2. Render Score (Placar)
  renderScore(ctx, {
    myScore,
    opponentScore,
    status,
    penaltyMyScore,
    penaltyOpponentScore,
    fontFamily,
    centerY: scoreY,
    fontSize: scoreSize,
    w: width
  })

  // 3. Render Scorers (Marcadores de Golos)
  if (displayScorers && scorers.length > 0) {
    await renderScorersList(ctx, {
      scorers,
      playerPhotos,
      fontFamily,
      startY: scorersY,
      w: width
    })
  }

  ctx.restore()
}

// Fallback background when no template is uploaded yet
function drawFallbackResultBackground(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#0a194f')
  grad.addColorStop(0.3, '#1e3a8a')
  grad.addColorStop(0.7, '#1e3a8a')
  grad.addColorStop(1, '#050c26')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Decorative border
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
  ctx.lineWidth = 4
  ctx.strokeRect(30, 30, w - 60, h - 60)

  // Subtle prompt text
  ctx.font = '700 28px sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('📁 Carrega a imagem do teu template de resultado', w / 2, 340)
}

// Render Placar / Score Numbers
function renderScore(ctx, opts) {
  const {
    myScore,
    opponentScore,
    status,
    penaltyMyScore,
    penaltyOpponentScore,
    fontFamily,
    centerY,
    fontSize,
    w
  } = opts

  ctx.save()

  const centerX = w / 2
  const scoreText = `${myScore} - ${opponentScore}`

  // 1. Status Tag (e.g. "RESULTADO FINAL" / "INTERVALO")
  if (status) {
    const statusLabel = status === 'FINAL' 
      ? 'RESULTADO FINAL' 
      : status === 'INTERVALO' 
      ? 'INTERVALO' 
      : status === 'PROLONGAMENTO'
      ? 'APÓS PROLONGAMENTO'
      : 'GRANDES PENALIDADES'

    const tagY = centerY - fontSize * 0.7
    ctx.font = `700 28px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Pill background
    const tagWidth = ctx.measureText(statusLabel).width + 36
    const tagHeight = 40
    const tagX = centerX - tagWidth / 2

    ctx.fillStyle = 'rgba(0, 38, 119, 0.85)'
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(tagX, tagY - tagHeight / 2, tagWidth, tagHeight, 20) : ctx.rect(tagX, tagY - tagHeight / 2, tagWidth, tagHeight)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.fillText(statusLabel, centerX, tagY + 1)
  }

  // 2. Score Numbers in Gothic Font
  ctx.font = `700 ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Shadow / Glow
  ctx.shadowColor = 'rgba(0, 68, 204, 0.6)'
  ctx.shadowBlur = 25

  // Crisp White Outline
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 7
  ctx.strokeText(scoreText, centerX, centerY)

  // Gradient fill Royal Blue / Navy
  const textGrad = ctx.createLinearGradient(0, centerY - fontSize / 2, 0, centerY + fontSize / 2)
  textGrad.addColorStop(0, '#0055ff')
  textGrad.addColorStop(0.5, '#003da5')
  textGrad.addColorStop(1, '#002677')

  ctx.shadowBlur = 0
  ctx.fillStyle = textGrad
  ctx.fillText(scoreText, centerX, centerY)

  // 3. Optional Penalties Score: e.g. "(4 - 2 g.p.)"
  if (penaltyMyScore !== '' && penaltyOpponentScore !== '') {
    const penY = centerY + fontSize * 0.62
    const penText = `(${penaltyMyScore} - ${penaltyOpponentScore} g.p.)`

    ctx.font = `700 36px ${fontFamily}`
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.5
    ctx.strokeText(penText, centerX, penY)

    ctx.fillStyle = '#f59e0b' // gold
    ctx.fillText(penText, centerX, penY)
  }

  ctx.restore()
}

// Render Scorers List
async function renderScorersList(ctx, opts) {
  const {
    scorers,
    playerPhotos,
    fontFamily,
    startY,
    w
  } = opts

  const validScorers = scorers.filter(s => s && (s.number?.trim() || s.name?.trim()))
  if (validScorers.length === 0) return

  ctx.save()

  const centerX = w / 2

  // 1. Header: "◆   MARCADORES   ◆"
  ctx.font = `700 34px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.lineWidth = 3
  ctx.strokeText('◆   GOLOS   ◆', centerX, startY)

  ctx.fillStyle = '#0044cc'
  ctx.fillText('◆   GOLOS   ◆', centerX, startY)

  // 2. Scorers items
  const rowH = 62
  const listStartY = startY + 45
  const boxW = 580
  const boxX = centerX - boxW / 2

  for (let i = 0; i < validScorers.length; i++) {
    const scorer = validScorers[i]
    const rowY = listStartY + i * rowH

    const numStr = scorer.number ? `#${scorer.number}` : ''
    const nameStr = (scorer.name || '').toUpperCase()
    const minuteStr = scorer.minute ? `${scorer.minute}` : ''
    const goalsCount = scorer.goals && scorer.goals > 1 ? `${scorer.goals}x ⚽` : '⚽'

    ctx.save()

    // Squad number in Gothic
    ctx.font = `700 32px ${fontFamily}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    const numX = boxX + 15
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.5
    ctx.strokeText(numStr, numX, rowY)

    ctx.fillStyle = '#0044cc'
    ctx.fillText(numStr, numX, rowY)

    // Player Photo circle (if available)
    let nameX = numX + 65
    const photoSrc = playerPhotos[scorer.number] || scorer.photoUrl
    if (photoSrc) {
      try {
        const pImg = await loadImage(photoSrc)
        const photoRadius = 20
        const photoCx = nameX + 10
        const photoCy = rowY

        ctx.save()
        ctx.beginPath()
        ctx.arc(photoCx, photoCy, photoRadius, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.clip()
        ctx.drawImage(pImg, photoCx - photoRadius, photoCy - photoRadius, photoRadius * 2, photoRadius * 2)
        ctx.restore()

        ctx.beginPath()
        ctx.arc(photoCx, photoCy, photoRadius, 0, Math.PI * 2)
        ctx.strokeStyle = '#0044cc'
        ctx.lineWidth = 1.8
        ctx.stroke()

        nameX = photoCx + photoRadius + 14
      } catch {}
    }

    // Player name in Gothic
    ctx.font = `700 30px ${fontFamily}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    const maxNameW = boxW - (nameX - boxX) - 130
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.lineWidth = 3
    ctx.strokeText(nameStr, nameX, rowY, maxNameW)

    ctx.fillStyle = '#002677'
    ctx.fillText(nameStr, nameX, rowY, maxNameW)

    // Goal tag & minute at right
    const tagX = boxX + boxW - 10
    const detailText = minuteStr ? `${goalsCount} ${minuteStr}` : goalsCount

    ctx.font = `700 24px ${fontFamily}`
    ctx.textAlign = 'right'

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeText(detailText, tagX, rowY)

    ctx.fillStyle = '#d97706' // amber/gold
    ctx.fillText(detailText, tagX, rowY)

    // Row divider
    if (i < validScorers.length - 1) {
      const lineY = rowY + rowH / 2
      const grad = ctx.createLinearGradient(boxX + 20, lineY, boxX + boxW - 20, lineY)
      grad.addColorStop(0, 'rgba(0, 68, 204, 0)')
      grad.addColorStop(0.3, 'rgba(0, 68, 204, 0.2)')
      grad.addColorStop(0.7, 'rgba(0, 68, 204, 0.2)')
      grad.addColorStop(1, 'rgba(0, 68, 204, 0)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(boxX + 20, lineY)
      ctx.lineTo(boxX + boxW - 20, lineY)
      ctx.stroke()
    }

    ctx.restore()
  }

  ctx.restore()
}

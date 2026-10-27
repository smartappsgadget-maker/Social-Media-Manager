// Photoshop Color Science & Image Adjustments Engine
// Implements Adobe Photoshop's Brightness/Contrast, Levels, Curves, Hue/Sat, Exposure and Color Balance

// Calculate RGB & Luminance histogram from ImageData (0-255 bins)
export function calculateHistogram(imageData) {
  const data = imageData.data
  const rBin = new Array(256).fill(0)
  const gBin = new Array(256).fill(0)
  const bBin = new Array(256).fill(0)
  const lumaBin = new Array(256).fill(0)

  // Sample every 4th pixel for high performance
  const step = 4 * 4
  let maxCount = 0

  for (let i = 0; i < data.length; i += step) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b)

    rBin[r]++
    gBin[g]++
    bBin[b]++
    lumaBin[luma]++

    if (lumaBin[luma] > maxCount) maxCount = lumaBin[luma]
  }

  return { r: rBin, g: gBin, b: bBin, luma: lumaBin, max: maxCount || 1 }
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return [h * 360, s * 100, l * 100]
}

// Convert HSL to RGB
function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

// Build 256-value Lookup Table (LUT) for Photoshop Levels
export function buildLevelsLUT(inBlack = 0, gamma = 1.0, inWhite = 255, outBlack = 0, outWhite = 255) {
  const lut = new Uint8Array(256)
  const rangeIn = Math.max(1, inWhite - inBlack)
  const rangeOut = outWhite - outBlack
  const invGamma = 1 / Math.max(0.01, gamma)

  for (let i = 0; i < 256; i++) {
    if (i <= inBlack) {
      lut[i] = outBlack
    } else if (i >= inWhite) {
      lut[i] = outWhite
    } else {
      const normalized = (i - inBlack) / rangeIn
      const mapped = Math.pow(normalized, invGamma)
      lut[i] = Math.min(255, Math.max(0, Math.round(outBlack + mapped * rangeOut)))
    }
  }
  return lut
}

// Build 256-value Lookup Table (LUT) for Curves presets
export function buildCurvesLUT(presetName = 'linear') {
  const lut = new Uint8Array(256)
  for (let i = 0; i < 256; i++) {
    const norm = i / 255
    let out = norm

    switch (presetName) {
      case 'strong-contrast':
        // S-curve
        out = 1 / (1 + Math.exp(-10 * (norm - 0.5)))
        break
      case 'medium-contrast':
        // Mild S-curve
        out = 1 / (1 + Math.exp(-6 * (norm - 0.5)))
        break
      case 'lighter':
        out = Math.pow(norm, 0.7)
        break
      case 'darker':
        out = Math.pow(norm, 1.4)
        break
      case 'cross-process':
        out = norm < 0.5 ? Math.pow(norm * 2, 1.2) / 2 : 1 - Math.pow((1 - norm) * 2, 1.2) / 2
        break
      case 'linear':
      default:
        out = norm
        break
    }

    lut[i] = Math.min(255, Math.max(0, Math.round(out * 255)))
  }
  return lut
}

// Apply Photoshop-grade pixel adjustments
export function applyPhotoshopAdjustments(imageData, params = {}) {
  const {
    // Brightness / Contrast (-100 to +100, default 0)
    brightness = 0,
    contrast = 0,

    // Levels (0-255, gamma 0.1-5.0, 0-255)
    inBlack = 0,
    gamma = 1.0,
    inWhite = 255,

    // Exposure (-3.0 to +3.0 EV, offset -0.2 to +0.2)
    exposure = 0,
    offset = 0,

    // Hue / Saturation / Lightness
    hue = 0, // -180 to +180
    saturation = 0, // -100 to +100
    lightness = 0, // -100 to +100

    // Color Balance (-100 to +100)
    colorBalanceCR = 0, // Cyan (-) <-> Red (+)
    colorBalanceMG = 0, // Magenta (-) <-> Green (+)
    colorBalanceYB = 0, // Yellow (-) <-> Blue (+)

    // Curves Preset
    curvesPreset = 'linear'
  } = params

  const data = imageData.data
  const len = data.length

  // Check if any adjustments are non-default
  const isLevelsActive = inBlack !== 0 || gamma !== 1.0 || inWhite !== 255
  const isCurvesActive = curvesPreset !== 'linear'
  const isExposureActive = exposure !== 0 || offset !== 0
  const isColorBalanceActive = colorBalanceCR !== 0 || colorBalanceMG !== 0 || colorBalanceYB !== 0
  const isHslActive = hue !== 0 || saturation !== 0 || lightness !== 0

  // 1. Build Levels & Curves LUTs
  const levelsLut = isLevelsActive ? buildLevelsLUT(inBlack, gamma, inWhite) : null
  const curvesLut = isCurvesActive ? buildCurvesLUT(curvesPreset) : null

  // 2. Pre-calculate Photoshop Brightness / Contrast factor
  // In modern Photoshop, contrast factor formula:
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  const exposureMult = Math.pow(2, exposure)
  const offsetAdd = offset * 255

  for (let i = 0; i < len; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]

    // Step A: Exposure
    if (isExposureActive) {
      r = r * exposureMult + offsetAdd
      g = g * exposureMult + offsetAdd
      b = b * exposureMult + offsetAdd
    }

    // Step B: Brightness / Contrast
    if (brightness !== 0) {
      r += brightness * 2.55
      g += brightness * 2.55
      b += brightness * 2.55
    }

    if (contrast !== 0) {
      r = contrastFactor * (r - 128) + 128
      g = contrastFactor * (g - 128) + 128
      b = contrastFactor * (b - 128) + 128
    }

    // Clamp
    r = Math.min(255, Math.max(0, Math.round(r)))
    g = Math.min(255, Math.max(0, Math.round(g)))
    b = Math.min(255, Math.max(0, Math.round(b)))

    // Step C: Levels LUT
    if (levelsLut) {
      r = levelsLut[r]
      g = levelsLut[g]
      b = levelsLut[b]
    }

    // Step D: Curves LUT
    if (curvesLut) {
      r = curvesLut[r]
      g = curvesLut[g]
      b = curvesLut[b]
    }

    // Step E: Color Balance
    if (isColorBalanceActive) {
      r = Math.min(255, Math.max(0, r + colorBalanceCR * 1.2))
      g = Math.min(255, Math.max(0, g + colorBalanceMG * 1.2))
      b = Math.min(255, Math.max(0, b + colorBalanceYB * 1.2))
    }

    // Step F: Hue / Saturation / Lightness
    if (isHslActive) {
      const [h, s, l] = rgbToHsl(r, g, b)
      let newH = (h + hue) % 360
      if (newH < 0) newH += 360
      let newS = Math.min(100, Math.max(0, s + saturation))
      let newL = Math.min(100, Math.max(0, l + lightness))
      const [finalR, finalG, finalB] = hslToRgb(newH, newS, newL)
      r = finalR
      g = finalG
      b = finalB
    }

    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }

  return imageData
}

// Photoshop-style Mockup & Document Templates
export const PHOTOSHOP_DOC_PRESETS = [
  { id: 'custom', name: 'Foto Original', width: 0, height: 0, category: 'foto' },
  { id: 'insta-square', name: 'Feed Quadrado (1:1)', width: 1080, height: 1080, category: 'social' },
  { id: 'insta-story', name: 'Story / Reel (9:16)', width: 1080, height: 1920, category: 'social' },
  { id: 'photo-portrait', name: 'Retrato Fotográfico (2:3)', width: 1200, height: 1800, category: 'foto' },
  { id: 'photo-landscape', name: 'Paisagem Clássica (3:2)', width: 1800, height: 1200, category: 'foto' },
  { id: 'print-a4', name: 'Poster A4 (300 DPI)', width: 1240, height: 1754, category: 'print' },
  { id: 'cinema-wide', name: 'Ecrã Cinema (16:9)', width: 1920, height: 1080, category: 'foto' }
]

export const PHOTOSHOP_TEMPLATES = [
  {
    id: 'fine-art-gallery',
    name: 'Moldura de Galeria Fine Art',
    desc: 'Passe-partout de museu contemporâneo com moldura elegante e placa de autor',
    category: 'mockup',
    aspectRatio: '4:5',
    canvasWidth: 1200,
    canvasHeight: 1500,
    photoPadding: 160,
    frameColor: '#0f172a',
    matColor: '#f8fafc',
    title: 'EXPOSIÇÃO DE ARTE CONTEMPORÂNEA',
    subtitle: 'Fotografia Autoral • Série Limitada',
    credit: 'MUSEU DE ARTE MODERNA • 2026',
    showPlate: true
  },
  {
    id: 'editorial-magazine',
    name: 'Capa de Revista Vogue / Editorial',
    desc: 'Layout de alta moda com tipografia editorial, manchetes e código de barras',
    category: 'editorial',
    aspectRatio: '3:4',
    canvasWidth: 1200,
    canvasHeight: 1600,
    photoPadding: 0,
    title: 'V O G U E',
    subtitle: 'EDIÇÃO DE COLECIONADOR • TENDÊNCIAS GLOBAIS',
    headlines: [
      'O NOVO FUTURO DA CRIATIVIDADE',
      'ESTILO, MINIMALISMO & FORMA',
      'EXCLUSIVO: OS SEGREDOS DO ANO'
    ],
    issueDate: 'OUTUBRO 2026 • Nº 342',
    barcode: true
  },
  {
    id: 'polaroid-retro',
    name: 'Polaroid Instantânea Retrô',
    desc: 'Estilo clássico instantâneo com margens brancas largas e nota manuscrita',
    category: 'retro',
    aspectRatio: '4:5',
    canvasWidth: 1200,
    canvasHeight: 1500,
    photoPadding: 100,
    bottomPadding: 320,
    bgColor: '#18181b',
    paperColor: '#fafafa',
    noteText: 'Momentos inesquecíveis • 2026 ✨',
    tapeStyle: true
  },
  {
    id: 'movie-poster',
    name: 'Cartaz de Cinema de Hollywood',
    desc: 'Proporção 2:3 dramática com créditos oficiais de cinema (Billing Block) na base',
    category: 'cinema',
    aspectRatio: '2:3',
    canvasWidth: 1200,
    canvasHeight: 1800,
    photoPadding: 0,
    title: 'ORIGENS',
    tagline: 'UMA HISTÓRIA NUNCA ANTES CONTADA',
    releaseDate: 'BREVEMENTE EM TODAS AS SALAS DE CINEMA',
    billingBlock: 'UNIVERSAL PICTURES PRESENTS A CREATORFLOW PRODUCTION "ORIGENS" DIRECTED BY DIOGO SILVA\nEXECUTIVE PRODUCER WARNER BROS MUSIC COMPOSED BY HANS ZIMMER CINEMATOGRAPHY BY ROGER DEAKINS\nSOUNDTRACK AVAILABLE ON ALL PLATFORMS COPYRIGHT © 2026 ALL RIGHTS RESERVED'
  },
  {
    id: 'film-strip-35mm',
    name: 'Rolo de Filme 35mm Negativo',
    desc: 'Moldura autêntica de rolo analógico Kodak/Fuji com perfurações laterais',
    category: 'retro',
    aspectRatio: '3:2',
    canvasWidth: 1800,
    canvasHeight: 1200,
    frameColor: '#050505',
    sprocketHoles: true,
    filmCode: 'KODAK PORTRA 400 • 36 EXP • ISO 400 • 24A'
  },
  {
    id: 'duotone-spotify',
    name: 'Duotone Gradiente Spotify',
    desc: 'Efeito Gradient Map clássico do Photoshop com tipografia impactante',
    category: 'duotone',
    aspectRatio: '1:1',
    canvasWidth: 1200,
    canvasHeight: 1200,
    duotoneColors: ['#3b82f6', '#ec4899'], // blue to pink
    title: 'DAILY MIX',
    subtitle: 'AS TUAS FAIXAS MAIS OUVIDAS'
  },
  {
    id: 'minimalist-swiss',
    name: 'Grelha Suíça & Arquitetura',
    desc: 'Design limpo internacional com passe-partout assimétrico e linhas de corte',
    category: 'minimal',
    aspectRatio: '4:5',
    canvasWidth: 1200,
    canvasHeight: 1500,
    bgColor: '#f1f5f9',
    title: 'NEUE GESTALTUNG',
    subtitle: 'ESTUDO DE FORMA, ESPAÇO E LUZ',
    year: 'ED. 2026'
  }
]

export const DUOTONE_PALETTES = [
  { id: 'spotify-neon', name: 'Cyber Neon', dark: '#1e1b4b', light: '#ec4899' },
  { id: 'sunset-amber', name: 'Sunset Amber', dark: '#450a0a', light: '#f59e0b' },
  { id: 'emerald-mint', name: 'Emerald & Mint', dark: '#064e3b', light: '#34d399' },
  { id: 'classic-cobalt', name: 'Cobalt & Warm', dark: '#0f172a', light: '#38bdf8' },
  { id: 'gold-noir', name: 'Gold & Noir', dark: '#0a0a0a', light: '#fbbf24' }
]

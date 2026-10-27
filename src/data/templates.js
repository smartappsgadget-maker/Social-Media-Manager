// Preset templates and category configurations for social media
export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'Todos os Templates', icon: 'Sparkles' },
  { id: 'promo', name: 'Promoções & Vendas', icon: 'Tag' },
  { id: 'quote', name: 'Citações & Motivação', icon: 'Quote' },
  { id: 'tips', name: 'Dicas & Educação', icon: 'Lightbulb' },
  { id: 'news', name: 'Notícias & Alertas', icon: 'Bell' },
  { id: 'podcast', name: 'Vídeo & Podcast', icon: 'Mic' },
  { id: 'review', name: 'Depoimentos & Reviews', icon: 'Star' },
  { id: 'event', name: 'Eventos & Lançamentos', icon: 'Calendar' }
]

export const ASPECT_RATIOS = [
  { id: '1:1', name: 'Quadrado (Feed)', width: 1080, height: 1080, icon: 'Square', desc: 'Instagram, Facebook, LinkedIn' },
  { id: '9:16', name: 'Vertical (Stories/Reels)', width: 1080, height: 1920, icon: 'Smartphone', desc: 'TikTok, Reels, Shorts, Stories' },
  { id: '16:9', name: 'Horizontal (Vídeo)', width: 1920, height: 1080, icon: 'Monitor', desc: 'YouTube, Twitter, Apresentações' },
  { id: '4:5', name: 'Retrato (Feed Vertical)', width: 1080, height: 1350, icon: 'RectangleVertical', desc: 'Instagram Feed Otimizado' }
]

export const VISUAL_STYLES = [
  { id: 'modern-dark', name: 'Dark Futurista', bgGradient: 'from-slate-900 via-purple-950 to-slate-900', textColor: '#ffffff', accentColor: '#a855f7' },
  { id: 'vibrant-bold', name: 'Bold & Vibrante', bgGradient: 'from-amber-500 via-rose-500 to-indigo-600', textColor: '#ffffff', accentColor: '#facc15' },
  { id: 'minimal-clean', name: 'Minimalista Clean', bgGradient: 'from-slate-100 to-slate-200', textColor: '#0f172a', accentColor: '#2563eb' },
  { id: 'luxury-gold', name: 'Luxury Gold', bgGradient: 'from-neutral-950 via-zinc-900 to-neutral-950', textColor: '#f8fafc', accentColor: '#fbbf24' },
  { id: 'cyber-neon', name: 'Cyber Neon', bgGradient: 'from-cyan-950 via-black to-fuchsia-950', textColor: '#22d3ee', accentColor: '#f43f5e' },
  { id: 'pastel-warm', name: 'Pastel Quente', bgGradient: 'from-orange-100 via-rose-50 to-amber-100', textColor: '#1c1917', accentColor: '#ea580c' }
]

export const INITIAL_TEMPLATES = [
  {
    id: 'tmpl-promo-1',
    category: 'promo',
    title: 'Super Promoção de Flash Sale',
    aspectRatio: '1:1',
    badge: 'OFERTA LIMITADA 🔥',
    headline: 'DESCONTO DE 50% EM TUDO',
    subheadline: 'Aproveita até domingo à meia-noite. Estoque ultra limitado!',
    cta: 'COMPRA JÁ NO LINK DA BIO',
    bgType: 'gradient',
    bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #312e81 100%)',
    bgImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1080&q=80',
    bgOpacity: 0.35,
    overlayColor: 'rgba(15, 23, 42, 0.75)',
    textColor: '#ffffff',
    accentColor: '#facc15',
    fontHeadline: 'Montserrat',
    fontBody: 'Inter'
  },
  {
    id: 'tmpl-quote-1',
    category: 'quote',
    title: 'Frase de Alto Impacto',
    aspectRatio: '1:1',
    badge: 'PENSAMENTO DO DIA 💡',
    headline: '"O sucesso não é o final, o fracasso não é fatal: a coragem de continuar é o que conta."',
    subheadline: 'Winston Churchill',
    cta: 'Guarda para te inspirares quando precisares 📌',
    bgType: 'gradient',
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    bgImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&q=80',
    bgOpacity: 0.25,
    overlayColor: 'rgba(15, 23, 42, 0.85)',
    textColor: '#ffffff',
    accentColor: '#38bdf8',
    fontHeadline: 'Playfair Display',
    fontBody: 'Inter'
  },
  {
    id: 'tmpl-story-tips',
    category: 'tips',
    title: '3 Segredos para Crescer nas Redes',
    aspectRatio: '9:16',
    badge: 'DICA DE OURO 🚀',
    headline: 'COMO TRIPLICAR O TEU ALCANCE ESTE MÊS',
    subheadline: '1. Consistência diária\n2. Ganchos fortes nos primeiros 3s\n3. Responde a TODOS os comentários na primeira hora!',
    cta: 'Arrasta para cima ou clica na Bio',
    bgType: 'gradient',
    bgGradient: 'linear-gradient(180deg, #18181b 0%, #27272a 100%)',
    bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80',
    bgOpacity: 0.3,
    overlayColor: 'rgba(0, 0, 0, 0.8)',
    textColor: '#ffffff',
    accentColor: '#4ade80',
    fontHeadline: 'Bebas Neue',
    fontBody: 'Poppins'
  },
  {
    id: 'tmpl-news-alert',
    category: 'news',
    title: 'Alerta / Urgente',
    aspectRatio: '1:1',
    badge: 'ÚLTIMA HORA 🚨',
    headline: 'GRANDE ATUALIZAÇÃO DO ALGORITMO',
    subheadline: 'O que precisas de mudar hoje mesmo na tua estratégia de conteúdo para não perder visualizações.',
    cta: 'Lê a análise completa na legenda 👇',
    bgType: 'gradient',
    bgGradient: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #1c1917 100%)',
    bgImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&q=80',
    bgOpacity: 0.3,
    overlayColor: 'rgba(15, 23, 42, 0.8)',
    textColor: '#ffffff',
    accentColor: '#ef4444',
    fontHeadline: 'Oswald',
    fontBody: 'Inter'
  },
  {
    id: 'tmpl-podcast-1',
    category: 'podcast',
    title: 'Novo Episódio Disponível',
    aspectRatio: '16:9',
    badge: 'EPISÓDIO #42 NO AR 🎙️',
    headline: 'O FUTURO DA CRIAÇÃO DE CONTEÚDO COM INTELIGÊNCIA ARTIFICIAL',
    subheadline: 'Com o convidado especial Diogo Silva. Já no Spotify & YouTube.',
    cta: 'Disponível em todas as plataformas',
    bgType: 'gradient',
    bgGradient: 'linear-gradient(90deg, #111827 0%, #312e81 100%)',
    bgImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1280&q=80',
    bgOpacity: 0.35,
    overlayColor: 'rgba(17, 24, 39, 0.85)',
    textColor: '#ffffff',
    accentColor: '#818cf8',
    fontHeadline: 'Montserrat',
    fontBody: 'Inter'
  },
  {
    id: 'tmpl-story-event',
    category: 'event',
    title: 'Lançamento Exclusivo',
    aspectRatio: '9:16',
    badge: 'LIVE ESPECIAL 🔴',
    headline: 'MASTERCLASS GRATUITA DE MARKETING DIGITAL',
    subheadline: 'Quinta-feira, às 20h. Vagas 100% gratuitas mas restritas à capacidade da sala.',
    cta: 'Inscreve-te já no link da bio',
    bgType: 'gradient',
    bgGradient: 'linear-gradient(180deg, #3b0764 0%, #1e1b4b 100%)',
    bgImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1080&q=80',
    bgOpacity: 0.4,
    overlayColor: 'rgba(15, 23, 42, 0.75)',
    textColor: '#ffffff',
    accentColor: '#ec4899',
    fontHeadline: 'Poppins',
    fontBody: 'Inter'
  }
]

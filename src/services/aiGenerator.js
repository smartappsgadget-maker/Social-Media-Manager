// AI Content & Image Generation Service
// Handles intelligent layout generation, AI image generation (Pollinations AI / Unsplash), and social captions

// Curated Unsplash photo pools by niche for instant fallbacks and crisp visuals
const NICHE_IMAGES = {
  coffee: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&q=80'
  ],
  fitness: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200&q=80'
  ],
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80'
  ],
  business: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80'
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80'
  ],
  nature: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=80'
  ],
  marketing: [
    'https://images.unsplash.com/photo-1557838923-2985c318be48?w=1200&q=80',
    'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80'
  ],
  luxury: [
    'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=1200&q=80',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=80'
  ]
}

// Function to generate an AI image URL via Pollinations Flux/Turbo
export function getAIImageUrl(prompt, width = 1080, height = 1080, seed = null) {
  const randomSeed = seed || Math.floor(Math.random() * 999999)
  // Enhance prompt for social media graphic quality
  const enhancedPrompt = `${prompt}, commercial advertising photography, 8k resolution, cinematic lighting, ultra detailed, modern aesthetic, professional studio, trending on dribbble and behance`
  const encoded = encodeURIComponent(enhancedPrompt)
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${randomSeed}&nologo=true&enhance=true`
}

// Generate smart content, visual styling and copy based on user prompt
export function generateContentFromPrompt(userPrompt, options = {}) {
  const promptLower = userPrompt.toLowerCase()
  const aspectRatio = options.aspectRatio || '1:1'
  const style = options.style || 'modern-dark'

  // Determine width & height based on aspect ratio
  let width = 1080
  let height = 1080
  if (aspectRatio === '9:16') {
    height = 1920
  } else if (aspectRatio === '16:9') {
    width = 1920
    height = 1080
  } else if (aspectRatio === '4:5') {
    height = 1350
  }

  // Detect niche & theme
  let niche = 'business'
  if (/café|coffee|cafeteria|expresso/i.test(promptLower)) niche = 'coffee'
  else if (/treino|fitness|ginásio|musculação|saúde|dieta|pernas|exercício/i.test(promptLower)) niche = 'fitness'
  else if (/ia|ia|software|tecnologia|computador|código|app|web|cyber|programador/i.test(promptLower)) niche = 'tech'
  else if (/comida|restaurante|pizza|hambúrguer|doce|pastel|culinária|chef/i.test(promptLower)) niche = 'food'
  else if (/moda|roupa|vestuário|estilo|look|sapatos|acessórios/i.test(promptLower)) niche = 'fashion'
  else if (/natureza|viagem|turismo|montanha|praia|verde|ecologia/i.test(promptLower)) niche = 'nature'
  else if (/marketing|vendas|redes sociais|instagram|tráfego|leads|negócio/i.test(promptLower)) niche = 'marketing'
  else if (/luxo|imóveis|carro|joia|ouro|premium|exclusivo/i.test(promptLower)) niche = 'luxury'

  // Detect purpose (promo, tips, quote, news, launch)
  let purpose = 'promo'
  if (/dica|como fazer|segredo|passo a passo|tutorial|aprende|guia/i.test(promptLower)) purpose = 'tips'
  else if (/frase|motivação|inspiração|pensamento|mentalidade|reflexão/i.test(promptLower)) purpose = 'quote'
  else if (/alerta|notícia|atenção|urgente|atualização|novidade|última hora/i.test(promptLower)) purpose = 'news'
  else if (/lançamento|live|evento|webinar|estreia|inscrição/i.test(promptLower)) purpose = 'event'

  // Generate Titles, Badges, CTAs based on detected tone
  let badge = 'OFERTA ESPECIAL 🔥'
  let headline = userPrompt.toUpperCase()
  let subheadline = 'Garante já o teu acesso antes que esgote. Qualidade de excelência pensada em ti.'
  let cta = 'Clica no link da bio para saber mais'
  let accentColor = '#3b82f6'
  let fontHeadline = 'Montserrat'
  let fontBody = 'Inter'

  if (purpose === 'promo') {
    badge = 'PROMOÇÃO LIMITADA 🏷️'
    headline = headline.length > 50 ? headline.slice(0, 50) + '...' : headline
    subheadline = 'Aproveita até 40% de desconto exclusivo por tempo limitado. Não deixes escapar esta oportunidade única!'
    cta = 'COMPRA JÁ NO LINK DA BIO 🛒'
    accentColor = '#f59e0b'
  } else if (purpose === 'tips') {
    badge = 'DICA DE OURO 💡'
    headline = headline.startsWith('COMO') ? headline : `COMO DOMINAR: ${headline}`
    subheadline = '1. Aplica consistência diária\n2. Foca-te no valor real para a tua audiência\n3. Analisa métricas e ajusta o teu plano semanalmente!'
    cta = 'Guarda este post para consulta futura 📌'
    accentColor = '#10b981'
    fontHeadline = 'Poppins'
  } else if (purpose === 'quote') {
    badge = 'PENSAMENTO & MENTALIDADE ✨'
    headline = `"${userPrompt.trim()}"`
    subheadline = 'Lembra-te: o processo é tão importante quanto o destino final. Continua a focar-te na evolução diária.'
    cta = 'Partilha com alguém que precisa de ler isto hoje ✈️'
    accentColor = '#8b5cf6'
    fontHeadline = 'Playfair Display'
  } else if (purpose === 'news') {
    badge = 'ÚLTIMA HORA 🚨'
    headline = `URGENTE: ${headline}`
    subheadline = 'Tudo o que precisas de saber sobre as novas mudanças no mercado e como tirar partido imediato.'
    cta = 'Lê todos os detalhes na legenda abaixo 👇'
    accentColor = '#ef4444'
    fontHeadline = 'Oswald'
  } else if (purpose === 'event') {
    badge = 'LANÇAMENTO OFICIAL 🚀'
    headline = headline
    subheadline = 'Vagas limitadas. Uma oportunidade prática e direta ao ponto para elevar os teus resultados.'
    cta = 'INSCREVE-TE GRÁTIS NO LINK DA BIO 🔗'
    accentColor = '#ec4899'
    fontHeadline = 'Bebas Neue'
  }

  // Pick an Unsplash fallback image from pool
  const pool = NICHE_IMAGES[niche] || NICHE_IMAGES.business
  const fallbackImage = pool[Math.floor(Math.random() * pool.length)]

  // Generate dynamic AI image prompt
  const aiImagePrompt = `${userPrompt}, modern aesthetic, clean composition, high contrast, vibrant lighting`
  const aiImageUrl = getAIImageUrl(aiImagePrompt, width, height)

  // Generate Social Captions & Hashtags
  const captions = generateCaptions(userPrompt, niche, purpose, cta)

  return {
    id: 'ai-gen-' + Date.now(),
    title: userPrompt,
    aspectRatio,
    width,
    height,
    badge,
    headline,
    subheadline,
    cta,
    bgType: 'ai-image',
    aiImagePrompt,
    bgImage: aiImageUrl,
    fallbackImage,
    bgOpacity: 0.35,
    overlayColor: 'rgba(15, 23, 42, 0.78)',
    textColor: '#ffffff',
    accentColor,
    fontHeadline,
    fontBody,
    niche,
    captions
  }
}

// Generate Instagram, TikTok, LinkedIn captions & hashtags
function generateCaptions(prompt, niche, purpose, cta) {
  const hashtagsMap = {
    coffee: '#cafe #cafeartezanal #barista #coffeetime #caféportugal #bomdia #coffeeaddict #specialtycoffee',
    fitness: '#fitnesspt #treinointenso #hipertrofia #saudeebemestar #motivacaofitness #vidasaudavel #treinodiario #foco',
    tech: '#tecnologia #inteligenciaartificial #inovacao #programacao #futuro #techtrends #digitaltransformation #ai',
    business: '#empreendedorismo #negocios #sucesso #lideranca #estrategia #crescimento #produtividade #mindset',
    food: '#gastronomia #comidaboa #culinaria #receitas #restaurante #foodie #sabores #delicia',
    fashion: '#modafeminina #lookdodia #estilo #tendencia #fashionpt #elegancia #acessorios #outfit',
    nature: '#natureza #viagens #fotografia #aventura #ecoturismo #paisagens #liberdade #destinos',
    marketing: '#marketingdigital #socialmediamanager #criacaodeconteudo #trafegopago #copywriting #branding #vendas'
  }

  const baseHashtags = hashtagsMap[niche] || '#criatividade #conteudo #redessociais #sucesso #inovacao #portugal'

  const instagram = `✨ ${prompt}\n\nSe procuras resultados reais e queres dar o próximo passo, não deixes isto passar ao lado!\n\n💡 O que achas desta perspetiva? Deixa a tua opinião nos comentários!\n\n👉 ${cta}\n\n.\n.\n.\n${baseHashtags} #instagramtips #viralpost`

  const tiktok = `🔥 ${prompt} | Salva este vídeo antes que percas! \n\nQual é a tua maior dúvida sobre isto? Diz-me nos comentários! 👇\n\n${baseHashtags} #fyp #viral #foryoupage #dicasuteis`

  const linkedin = `Reflexão sobre ${prompt}:\n\nNo panorama atual, a capacidade de inovar e manter a consistência é o verdadeiro diferenciador competitivo.\n\nPrincipais pontos a reter:\n• Antecipar tendências e adaptar o posicionamento com agilidade.\n• Focar na experiência e no valor concreto entregue ao cliente.\n• Medir resultados continuamente para iterar com precisão.\n\nQual tem sido a vossa experiência prática nesta matéria? Partilhem nos comentários.\n\n#liderança #negócios #inovação #estratégia ${baseHashtags}`

  return {
    instagram,
    tiktok,
    linkedin,
    hashtags: baseHashtags
  }
}

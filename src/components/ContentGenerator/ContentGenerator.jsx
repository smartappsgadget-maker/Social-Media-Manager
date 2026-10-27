import React, { useState } from 'react'
import PromptBar from './PromptBar'
import TemplateGallery from './TemplateGallery'
import CanvasEditor from './CanvasEditor'
import CaptionPanel from './CaptionPanel'
import { INITIAL_TEMPLATES } from '../../data/templates'
import { generateContentFromPrompt } from '../../services/aiGenerator'

export default function ContentGenerator({ onSendToWatermark }) {
  const [currentTemplate, setCurrentTemplate] = useState(INITIAL_TEMPLATES[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [captions, setCaptions] = useState({
    instagram: `✨ ${INITIAL_TEMPLATES[0].headline}\n\n${INITIAL_TEMPLATES[0].subheadline}\n\n👉 ${INITIAL_TEMPLATES[0].cta}\n\n#marketing #promocao #conteudo #redessociais #sucesso`,
    tiktok: `🔥 ${INITIAL_TEMPLATES[0].headline} | Salva este vídeo antes que termine a oferta! #fyp #viral #ofertas`,
    linkedin: `Análise estratégica sobre campanhas promocionais e geração de valor no mercado digital.\n\nPrincipais aprendizagens:\n• Clareza na mensagem\n• Proposta de valor irresistível\n• Sentido de urgência real\n\n#gestao #vendas #estrategia`,
    hashtags: '#marketingdigital #ofertas #conteudo #branding #socialmedia'
  })

  // Handle AI generation from user prompt
  const handleGenerate = (userPrompt, options) => {
    setIsGenerating(true)
    
    // Simulate slight delay for rich feeling
    setTimeout(() => {
      const generated = generateContentFromPrompt(userPrompt, options)
      setCurrentTemplate(generated)
      setCaptions(generated.captions)
      setIsGenerating(false)
    }, 600)
  }

  // Handle selection from Template Gallery
  const handleSelectTemplate = (template) => {
    setCurrentTemplate(template)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Top AI Prompt Bar */}
      <PromptBar
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      {/* Main Interactive Canvas Editor */}
      <CanvasEditor
        template={currentTemplate}
        onUpdateTemplate={setCurrentTemplate}
        onSendToWatermark={onSendToWatermark}
      />

      {/* Captions and Hashtags Panel */}
      <CaptionPanel
        captions={captions}
      />

      {/* Preset Templates Library Carousel / Grid */}
      <TemplateGallery
        onSelectTemplate={handleSelectTemplate}
        currentTemplateId={currentTemplate.id}
      />

    </div>
  )
}

import React, { useState } from 'react'
import { Calendar, FolderPlus, Trash2, Shirt, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function MatchdayHeaderBar({
  matchdaysList = [],
  currentMatchdayId,
  onSwitchMatchday,
  onAddMatchday,
  onDeleteMatchday,
  activeStudio,
  onSwitchStudio
}) {
  const [showModal, setShowModal] = useState(false)
  const [newRoundInput, setNewRoundInput] = useState('')

  const currentMatchday = (matchdaysList && matchdaysList.find(m => m.id === currentMatchdayId)) || (matchdaysList && matchdaysList[0]) || { roundNumber: '4ª' }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    if (!newRoundInput.trim()) return

    onAddMatchday(newRoundInput.trim())
    setShowModal(false)
    setNewRoundInput('')

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 }
    })
  }

  const handleDelete = () => {
    if (matchdaysList.length <= 1) {
      alert('Tem de manter pelo menos uma jornada na época.')
      return
    }
    if (confirm(`Tem a certeza que deseja eliminar a ${currentMatchday?.roundNumber || ''} Jornada?`)) {
      onDeleteMatchday(currentMatchdayId)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="glass-panel p-4 rounded-3xl border border-slate-800 shadow-xl bg-slate-900/95 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left: Matchday Selector */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Época 26/27 • Jornada Selecionada:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Guardado Auto
              </span>
            </div>
            
            {/* Dropdown selector */}
            <div className="flex items-center gap-2 mt-1">
              <select
                value={currentMatchdayId}
                onChange={(e) => onSwitchMatchday(e.target.value)}
                className="bg-slate-950 text-white font-bold text-sm px-3.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {(matchdaysList || []).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.roundNumber} Jornada
                  </option>
                ))}
              </select>

              {(matchdaysList?.length || 0) > 1 && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Eliminar esta jornada"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  const nextNum = (matchdaysList?.length || 0) + 1
                  setNewRoundInput(`${nextNum}ª`)
                  setShowModal(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/80 transition-all hover:scale-105"
                title="Adicionar nova jornada à época"
              >
                <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Nova Jornada</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Studio Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => onSwitchStudio('generator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeStudio === 'generator'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>11 Inicial & Suplentes</span>
          </button>

          <button
            onClick={() => onSwitchStudio('result')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeStudio === 'result'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Resultado de Jogo</span>
          </button>
        </div>

      </div>

      {/* Modal: Add New Matchday */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleCreateSubmit} className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-blue-400" />
              <span>Criar Nova Jornada</span>
            </h3>
            <p className="text-xs text-slate-400">
              Cada jornada tem o seu próprio template de 11 inicial, suplentes, template de resultado e placar. O plantel e as fotos dos jogadores mantêm-se partilhados!
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número da Jornada:
              </label>
              <input
                type="text"
                required
                autoFocus
                value={newRoundInput}
                onChange={(e) => setNewRoundInput(e.target.value)}
                placeholder="Ex: 5ª, 6ª, 7ª..."
                className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm text-white font-bold"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Criar Jornada
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

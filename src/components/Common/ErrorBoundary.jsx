import React from 'react'
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleResetStorage = () => {
    try {
      localStorage.removeItem('gral_season_matchdays_v3')
      localStorage.removeItem('gral_active_matchday_id_v3')
    } catch (e) {
      console.error(e)
    }
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Ocorreu um erro inesperado
            </h2>
            <p className="text-xs text-slate-400">
              A aplicação encontrou um problema ao apresentar os dados desta jornada. Pode recarregar a página ou repor a memória de segurança.
            </p>
            {this.state.error && (
              <pre className="text-[10px] bg-slate-950 p-3 rounded-xl text-rose-300 font-mono text-left overflow-x-auto max-h-32">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-lg shadow-blue-600/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recarregar Página</span>
              </button>
              <button
                onClick={this.handleResetStorage}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Repor Memória</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

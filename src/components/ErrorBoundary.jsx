import { Component } from 'react'

/**
 * Frontera de errores: si un componente revienta, el gameflow se queda en negro
 * y sin pistas. Este limite muestra la excepcion real y permite reintentar.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { error: null, info: null }
    }

    static getDerivedStateFromError(error) {
        return { error }
    }

    componentDidCatch(error, info) {
        this.setState({ info })
        // Queda en la consola para depuracion con el navegador abierto.
        console.error('Gameflow: fallo de render', error, info)
    }

    render() {
        const { error, info } = this.state
        if (!error) return this.props.children

        return (
            <div className="flex h-full w-full items-center justify-center bg-ink-950 p-8">
                <div className="panel max-w-lg rounded-2xl p-5">
                    <h1 className="mb-2 font-display text-base font-semibold text-aura-rose">
                        Algo falló al dibujar el gameflow
                    </h1>
                    <p className="mb-3 text-[12.5px] leading-relaxed text-slate-400">
                        El error quedó registrado en la consola del navegador. Puedes reintentar sin perder tus
                        piezas ni tu progreso.
                    </p>
                    <pre className="sin-scrollbar mb-4 max-h-48 overflow-auto rounded-xl border border-ink-700/60 bg-ink-950/80 p-3 font-mono text-[11px] leading-relaxed text-aura-rose">
                        {String(error?.stack || error?.message || error)}
                    </pre>
                    {info?.componentStack && (
                        <pre className="sin-scrollbar mb-4 max-h-32 overflow-auto rounded-xl border border-ink-700/60 bg-ink-950/80 p-3 font-mono text-[10.5px] leading-relaxed text-slate-500">
                            {info.componentStack}
                        </pre>
                    )}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => this.setState({ error: null, info: null })}
                            className="rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-4 py-2 font-display text-[12.5px] font-semibold text-ink-950 transition-opacity hover:opacity-90"
                        >
                            Reintentar
                        </button>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="rounded-xl border border-ink-600 px-4 py-2 font-display text-[12.5px] text-slate-300 transition-colors hover:border-ink-400 hover:text-white"
                        >
                            Recargar
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

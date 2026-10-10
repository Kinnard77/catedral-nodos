import { useEffect, useState } from 'react'

/**
 * LA PREGUNTA 0 DEL DISEÑO: ¿en qué catedral vamos a trabajar?
 *
 * No es un ajuste ni un filtro: es la premisa de la que cuelga todo. La
 * catedral decide qué misterios existen, así que sin ella no hay nada que
 * diseñar. Por eso el lienzo abre aquí y no preguntando qué queremos que
 * descubra el jugador: esa pregunta solo se puede contestar cuando ya se sabe
 * en qué catedral se está.
 *
 * La lista de catedrales la da el diseñador, no la herramienta. Y los misterios
 * de cada una nacen vacíos: se recopilan con su fuente, no se inventan.
 */
export default function ElegirCatedral({ abierto, catedrales, catedralActiva, onElegir, onAgregar, onCerrar }) {
    const [nueva, setNueva] = useState('')

    useEffect(() => {
        if (abierto) setNueva('')
    }, [abierto])

    if (!abierto) return null

    const agregar = () => {
        const id = onAgregar(nueva)
        if (id) {
            setNueva('')
            onElegir(id)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/85 p-6 backdrop-blur-sm">
            <div className="panel w-full max-w-2xl animate-node-in rounded-2xl p-5 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <div className="mb-1 font-display text-[10.5px] font-semibold uppercase tracking-wider text-aura-cyan">
                            Paso 0 · La premisa
                        </div>
                        <h2 className="font-display text-lg font-semibold text-white">
                            ¿En qué catedral vamos a trabajar?
                        </h2>
                        <p className="mt-1.5 max-w-xl text-[12px] leading-relaxed text-slate-400">
                            De aquí parte todo. La catedral es el{' '}
                            <span className="text-slate-200">escenario real</span> donde se juega —el
                            turista la recorre con el móvil— y a la vez es lo que decide{' '}
                            <span className="text-slate-200">qué misterios existen</span>. No podemos
                            descubrir el Santo Grial en Sevilla porque está en Valencia, así que el
                            vínculo entre un misterio y una catedral se documenta, no se supone.
                        </p>
                    </div>
                    {catedralActiva && (
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="shrink-0 rounded-lg border border-ink-700 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:border-ink-500 hover:text-white"
                        >
                            Cerrar
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {catedrales.map((catedral) => {
                        const elegida = catedralActiva?.id === catedral.id
                        const misterios = catedral.misterios?.length || 0
                        return (
                            <button
                                key={catedral.id}
                                type="button"
                                data-catedral={catedral.id}
                                onClick={() => onElegir(catedral.id)}
                                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                                    elegida
                                        ? 'border-aura-cyan/70 bg-aura-cyan/10'
                                        : 'border-ink-700/70 bg-ink-850/50 hover:border-aura-cyan/50 hover:bg-ink-800/60'
                                }`}
                            >
                                <span className="min-w-0">
                                    <span className="block truncate font-display text-[13px] font-semibold text-slate-100">
                                        {catedral.nombre}
                                    </span>
                                    <span className="block text-[10.5px] text-slate-500">
                                        {misterios === 0
                                            ? 'sin misterios estudiados'
                                            : `${misterios} misterio(s)`}
                                    </span>
                                </span>
                                {elegida && (
                                    <span className="shrink-0 text-[10px] font-semibold text-aura-cyan">
                                        ELEGIDA
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Añadir otra: la lista es del diseñador y crece */}
                <div className="mt-4 rounded-xl border border-ink-700/60 bg-ink-900/50 p-3">
                    <label
                        htmlFor="catedral-nueva"
                        className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-wider text-slate-400"
                    >
                        Añadir otra catedral
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="catedral-nueva"
                            type="text"
                            value={nueva}
                            onChange={(e) => setNueva(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    agregar()
                                }
                            }}
                            placeholder="Ej. Catedral de Toledo"
                            className="min-w-0 flex-1 rounded-xl border border-ink-700 bg-ink-950/70 px-3 py-2 text-[12.5px] text-slate-100 placeholder:text-slate-500 focus:border-aura-cyan/70 focus:outline-none"
                        />
                        <button
                            type="button"
                            data-accion="agregar-catedral"
                            onClick={agregar}
                            disabled={!nueva.trim()}
                            className="shrink-0 rounded-xl border border-ink-600 px-3 py-2 text-[12px] text-slate-300 transition-colors hover:border-aura-cyan/60 hover:text-aura-cyan disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Añadir
                        </button>
                    </div>
                </div>

                <p className="mt-3 text-[10.5px] leading-relaxed text-slate-500">
                    Los misterios de cada catedral nacen vacíos a propósito. Se recopilan en el paso
                    siguiente, cada uno con la fuente que justifique por qué pertenece a esa catedral.
                </p>
            </div>
        </div>
    )
}

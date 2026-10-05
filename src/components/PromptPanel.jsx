import { useEffect, useRef, useState } from 'react'
import { subjectBreakdown, totalMinutes } from '../data/catalog.js'
import { subjectOf } from '../domain/lesson.js'

const EJEMPLOS = [
    'Quiero aprender el teorema de Pitágoras',
    'Enséñame a programar desde cero',
    'Quiero entender probabilidad y Bayes',
    'Curso de estadística para analizar datos',
    'Física: fuerzas y leyes de Newton',
    'Quiero escribir ensayos argumentativos',
]

/** Panel izquierdo: la caja de texto que alimenta al clasificador. */
export default function PromptPanel({
    prompt,
    setPrompt,
    onSubmit,
    onCancelar,
    estado,
    historial,
    catalogo,
    generadas,
    clasificador,
    onAbrirAjustes,
    onReproducirRuta,
    ruta,
}) {
    const [texto, setTexto] = useState(prompt || '')
    const areaRef = useRef(null)
    const cargando = estado === 'clasificando'

    useEffect(() => {
        if (prompt && prompt !== texto) setTexto(prompt)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prompt])

    useEffect(() => {
        const area = areaRef.current
        if (!area) return
        area.style.height = 'auto'
        area.style.height = `${Math.min(180, area.scrollHeight)}px`
    }, [texto])

    const enviar = (valor = texto) => {
        const limpio = valor.trim()
        if (!limpio || cargando) return
        setTexto(limpio)
        onSubmit(limpio)
    }

    const materias = subjectBreakdown(catalogo)

    return (
        <aside className="flex h-full w-[330px] shrink-0 flex-col border-r border-ink-700/60 bg-ink-900/70">
            {/* Marca */}
            <div className="border-b border-ink-700/60 px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-aura-cyan to-aura-violet font-display text-sm font-bold text-ink-950">
                        A
                    </span>
                    <div className="leading-tight">
                        <div className="font-display text-sm font-semibold text-white">Academia</div>
                        <div className="text-[11px] text-slate-400">Rutas de aprendizaje en nodos</div>
                    </div>
                </div>
            </div>

            {/* Caja de prompt */}
            <div className="border-b border-ink-700/60 p-4">
                <label
                    htmlFor="prompt-academia"
                    className="mb-2 block font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                >
                    ¿Qué quieres aprender?
                </label>
                <div className="relative">
                    <textarea
                        id="prompt-academia"
                        ref={areaRef}
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                enviar()
                            }
                        }}
                        rows={3}
                        placeholder="Ej. Quiero aprender el teorema de Pitágoras aplicado a problemas reales"
                        className="sin-scrollbar w-full resize-none rounded-xl border border-ink-700 bg-ink-950/70 px-3 py-2.5 text-[13px] leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-aura-cyan/70 focus:outline-none"
                    />
                    <div className="mt-2 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => enviar()}
                            disabled={!texto.trim() || cargando}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-3 py-2.5 font-display text-[13px] font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {cargando ? (
                                <>
                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink-950/40 border-t-ink-950" />
                                    Clasificando…
                                </>
                            ) : (
                                <>Clasificar lecciones</>
                            )}
                        </button>
                        {cargando && (
                            <button
                                type="button"
                                onClick={onCancelar}
                                className="rounded-xl border border-ink-600 px-3 py-2.5 text-[12px] text-slate-300 transition-colors hover:border-ink-400 hover:text-white"
                            >
                                Cancelar
                            </button>
                        )}
                        {!cargando && ruta && (
                            <button
                                type="button"
                                onClick={onReproducirRuta}
                                title="Volver a desplegar la ruta en el grafo"
                                className="rounded-xl border border-aura-cyan/50 px-3 py-2.5 font-display text-[12px] font-semibold text-aura-cyan transition-colors hover:bg-aura-cyan/10"
                            >
                                ▶ Play
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-3">
                    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Ejemplos
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {EJEMPLOS.map((ejemplo) => (
                            <button
                                key={ejemplo}
                                type="button"
                                onClick={() => enviar(ejemplo)}
                                disabled={cargando}
                                className="rounded-lg border border-ink-700/70 bg-ink-850/60 px-2 py-1 text-left text-[10.5px] leading-tight text-slate-300 transition-colors hover:border-aura-cyan/60 hover:text-aura-cyan disabled:opacity-40"
                            >
                                {ejemplo}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onAbrirAjustes}
                    className="mt-3 flex w-full items-center justify-between rounded-xl border border-ink-700/70 bg-ink-850/50 px-3 py-2 text-left transition-colors hover:border-ink-500"
                >
                    <span className="text-[11px] text-slate-300">
                        Clasificador:{' '}
                        <span className="font-semibold text-aura-cyan">{clasificador.label}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Ajustes</span>
                </button>
            </div>

            {/* Historial */}
            <div className="sin-scrollbar flex-1 overflow-y-auto">
                {historial.length > 0 && (
                    <div className="border-b border-ink-700/60 p-4">
                        <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Consultas recientes
                        </div>
                        <ul className="space-y-1">
                            {historial.slice(0, 6).map((entrada) => (
                                <li key={entrada.at}>
                                    <button
                                        type="button"
                                        onClick={() => enviar(entrada.prompt)}
                                        className="w-full truncate rounded-lg px-2 py-1.5 text-left text-[11.5px] text-slate-400 transition-colors hover:bg-ink-800/70 hover:text-slate-100"
                                        title={entrada.prompt}
                                    >
                                        {entrada.prompt}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Catalogo */}
                <div className="p-4">
                    <div className="mb-2 flex items-baseline justify-between">
                        <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Catálogo
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{catalogo.length}</span>
                    </div>
                    <div className="space-y-1.5">
                        {materias.map(({ subject, count }) => {
                            const info = subjectOf({ subject })
                            return (
                                <div key={subject} className="flex items-center gap-2">
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ backgroundColor: info.color }}
                                    />
                                    <span className="flex-1 text-[11.5px] text-slate-400">{info.label}</span>
                                    <span className="font-mono text-[10.5px] text-slate-500">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Metrica etiqueta="Minutos" valor={totalMinutes(catalogo)} />
                        <Metrica etiqueta="Generadas" valor={generadas.length} acento />
                    </div>
                </div>
            </div>
        </aside>
    )
}

function Metrica({ etiqueta, valor, acento }) {
    return (
        <div className="rounded-xl border border-ink-700/60 bg-ink-850/50 px-2.5 py-2">
            <div className={`font-display text-sm font-semibold ${acento ? 'text-aura-violet' : 'text-slate-200'}`}>
                {valor}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{etiqueta}</div>
        </div>
    )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { LessonContent } from './LessonBlocks.jsx'
import { levelOf, subjectOf } from '../domain/lesson.js'
import { obtenerNuevas } from '../graph/graphEngine.js'

/**
 * Lector de leccion a pantalla completa.
 * Al pie vive la accion que da nombre al producto: "ver continuación",
 * que cierra el lector y despliega el siguiente anillo de nodos.
 */
export default function LessonReader({
    lesson,
    onCerrar,
    onContinuar,
    onSeleccionar,
    catalogoIndex,
    visibles,
    cursada,
    onMarcar,
    siguientePaso,
}) {
    const [leido, setLeido] = useState(0)
    const scrollRef = useRef(null)

    useEffect(() => {
        setLeido(0)
        scrollRef.current?.scrollTo({ top: 0 })
    }, [lesson?.id])

    useEffect(() => {
        const alTeclear = (e) => {
            if (e.key === 'Escape') onCerrar()
        }
        window.addEventListener('keydown', alTeclear)
        return () => window.removeEventListener('keydown', alTeclear)
    }, [onCerrar])

    const alScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        const avance = scrollHeight <= clientHeight ? 1 : scrollTop / (scrollHeight - clientHeight)
        setLeido(Math.min(1, Math.max(0, avance)))
    }

    const relacionadas = useMemo(() => {
        if (!lesson) return { previas: [], siguientes: [] }
        const visiblesSet = new Set(visibles)
        const pendientes = obtenerNuevas(lesson, visiblesSet, catalogoIndex)
        return {
            previas: lesson.prereq.map((id) => catalogoIndex.get(id)).filter(Boolean),
            siguientes: lesson.unlocks.map((id) => catalogoIndex.get(id)).filter(Boolean),
            nuevas: pendientes,
        }
    }, [lesson, visibles, catalogoIndex])

    if (!lesson) return null

    const materia = subjectOf(lesson)
    const nivel = levelOf(lesson)
    const completo = leido > 0.92

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-950/85 p-4 backdrop-blur-sm sm:p-8">
            <div className="panel flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl shadow-2xl">
                {/* Encabezado */}
                <header className="relative border-b border-ink-700/60 px-5 py-4">
                    {/* Barra de avance de lectura */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-ink-700/60">
                        <div
                            className="h-full bg-gradient-to-r from-aura-cyan to-aura-mint transition-[width] duration-150"
                            style={{ width: `${leido * 100}%` }}
                        />
                    </div>

                    <div className="flex items-start gap-3">
                        <span
                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-sm"
                            style={{ backgroundColor: `${materia.color}22`, color: materia.color }}
                        >
                            {materia.glyph}
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-[10.5px] uppercase tracking-wider text-slate-400">
                                <span>{materia.label}</span>
                                <span className="text-slate-600">·</span>
                                <span>{nivel.label}</span>
                                <span className="text-slate-600">·</span>
                                <span>{lesson.durationMin} Min. juego</span>
                                {lesson.origin === 'generado' && (
                                    <span className="rounded bg-aura-violet/15 px-1.5 py-0.5 font-semibold normal-case text-aura-violet">
                                        generada por el motor
                                    </span>
                                )}
                                {cursada && (
                                    <span className="rounded bg-aura-mint/15 px-1.5 py-0.5 font-semibold normal-case text-aura-mint">
                                        definida
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-0.5 font-display text-lg font-semibold leading-snug text-white">
                                {lesson.title}
                            </h1>
                            <p className="mt-0.5 text-[12px] leading-relaxed text-slate-400">{lesson.summary}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onCerrar}
                            title="Cerrar (Esc)"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-ink-700 hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                </header>

                <div className="flex min-h-0 flex-1">
                    {/* Contenido */}
                    <div ref={scrollRef} onScroll={alScroll} className="sin-scrollbar flex-1 overflow-y-auto">
                        <div className="mx-auto max-w-2xl px-6 py-6">
                            {lesson.objectives?.length > 0 && (
                                <div className="mb-6 rounded-xl border border-ink-700/60 bg-ink-850/40 p-4">
                                    <div className="mb-2 font-display text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                                        Al terminar podrás
                                    </div>
                                    <ul className="space-y-1.5">
                                        {lesson.objectives.map((objetivo, i) => (
                                            <li
                                                key={i}
                                                className="flex gap-2 text-[12.5px] leading-relaxed text-slate-300"
                                            >
                                                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-aura-mint/80" />
                                                {objetivo}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <LessonContent content={lesson.content} />

                            {/* Cierre: ver continuacion */}
                            <div className="mt-8 rounded-2xl border border-aura-cyan/30 bg-gradient-to-br from-aura-cyan/[0.08] to-aura-violet/[0.06] p-4">
                                <div className="mb-1 font-display text-[13px] font-semibold text-white">
                                    {completo ? 'Nodo terminado' : '¿Sigues ahí?'}
                                </div>
                                <p className="mb-3 text-[12px] leading-relaxed text-slate-400">
                                    {siguientePaso
                                        ? `Siguiente en el gameflow: ${siguientePaso.title}.`
                                        : 'El motor puede seguir desplegando nodos relacionados con lo que acabas de estudiar.'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onContinuar(lesson.id)}
                                        className="rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-4 py-2.5 font-display text-[13px] font-semibold text-ink-950 transition-opacity hover:opacity-90"
                                    >
                                        Ver continuación →
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onSeleccionar(lesson.id)}
                                        className="rounded-xl border border-ink-600 px-4 py-2.5 font-display text-[12.5px] text-slate-300 transition-colors hover:border-ink-400 hover:text-white"
                                    >
                                        Ubicar en el grafo
                                    </button>
                                    {!cursada && (
                                        <button
                                            type="button"
                                            onClick={() => onMarcar(lesson.id)}
                                            className="rounded-xl border border-aura-mint/50 px-4 py-2.5 font-display text-[12.5px] text-aura-mint transition-colors hover:bg-aura-mint/10"
                                        >
                                            Marcar como definida
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="h-6" />
                        </div>
                    </div>

                    {/* Barra lateral de relaciones */}
                    <aside className="sin-scrollbar hidden w-[240px] shrink-0 overflow-y-auto border-l border-ink-700/60 bg-ink-850/30 px-4 py-5 lg:block">
                        <Relacion
                            titulo="Requiere antes"
                            items={relacionadas.previas}
                            color="text-aura-amber"
                            onSeleccionar={onSeleccionar}
                            vacio="Sin prerrequisitos"
                        />
                        <Relacion
                            titulo="Habilita después"
                            items={relacionadas.siguientes}
                            color="text-aura-violet"
                            onSeleccionar={onSeleccionar}
                            vacio="Sin continuaciones declaradas"
                        />
                        {relacionadas.nuevas?.length > 0 && (
                            <div className="mt-5 rounded-xl border border-aura-cyan/30 bg-aura-cyan/[0.06] p-3">
                                <div className="font-display text-[11px] font-semibold text-aura-cyan">
                                    {relacionadas.nuevas.length} nodo(s) por desplegar
                                </div>
                                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                                    Pulsa «ver continuación» para abrirlos en el grafo.
                                </p>
                            </div>
                        )}
                        <div className="mt-5">
                            <div className="mb-2 font-display text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                                Habilidades
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {(lesson.skills || []).map((skill) => (
                                    <span
                                        key={skill}
                                        className="rounded-md bg-ink-700/60 px-1.5 py-0.5 text-[10px] text-slate-300"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

function Relacion({ titulo, items, color, onSeleccionar, vacio }) {
    return (
        <div className="mb-5">
            <div className="mb-1.5 font-display text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                {titulo}
            </div>
            {items?.length ? (
                <ul className="space-y-1">
                    {items.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onSeleccionar(item.id)}
                                className={`w-full rounded-lg px-2 py-1.5 text-left text-[11.5px] leading-snug transition-colors hover:bg-ink-800/70 ${color}`}
                            >
                                {item.title}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-[11px] text-slate-600">{vacio}</p>
            )}
        </div>
    )
}

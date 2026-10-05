import { useState } from 'react'
import Markdown from './Markdown.jsx'
import Tex from './Tex.jsx'

const ESTILO_NOTA = {
    nota: {
        borde: 'border-l-aura-cyan/70',
        fondo: 'bg-aura-cyan/[0.07]',
        etiqueta: 'Nota',
        color: 'text-aura-cyan',
    },
    aviso: {
        borde: 'border-l-aura-amber/70',
        fondo: 'bg-aura-amber/[0.07]',
        etiqueta: 'Ojo con esto',
        color: 'text-aura-amber',
    },
}

/** Renderiza un bloque de contenido de leccion segun su tipo. */
export function Block({ bloque }) {
    switch (bloque.type) {
        case 'formula':
            return (
                <figure className="my-5 rounded-xl border border-ink-700/70 bg-ink-900/60 px-4 py-4">
                    <Tex tex={bloque.tex} display />
                    {bloque.caption && (
                        <figcaption className="mt-2 text-center text-xs text-slate-400">
                            {bloque.caption}
                        </figcaption>
                    )}
                </figure>
            )

        case 'codigo':
            return (
                <figure className="my-5 overflow-hidden rounded-xl border border-ink-700/70">
                    <div className="flex items-center justify-between border-b border-ink-700/70 bg-ink-850/80 px-3 py-1.5">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                            {bloque.lang || 'text'}
                        </span>
                        {bloque.caption && (
                            <span className="truncate pl-3 text-[11px] text-slate-400">{bloque.caption}</span>
                        )}
                    </div>
                    <pre className="sin-scrollbar overflow-x-auto bg-ink-950/80 px-4 py-3">
                        <code className="font-mono text-[12.5px] leading-relaxed text-slate-200">
                            {bloque.text}
                        </code>
                    </pre>
                </figure>
            )

        case 'lista':
            return (
                <div className="my-4">
                    {bloque.text && <Markdown text={bloque.text} />}
                    <ul className="space-y-1.5">
                        {bloque.items.map((item, i) => (
                            <li key={i} className="flex gap-2.5 text-[0.95rem] text-slate-300">
                                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-aura-cyan/70" />
                                <Markdown text={item} className="[&>p]:mb-0" />
                            </li>
                        ))}
                    </ul>
                </div>
            )

        case 'datos': {
            const columnas = Object.keys(bloque.rows[0])
            return (
                <figure className="my-5">
                    <div className="sin-scrollbar overflow-x-auto rounded-xl border border-ink-700/70">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-ink-850/80">
                                    {columnas.map((col) => (
                                        <th
                                            key={col}
                                            className="whitespace-nowrap border-b border-ink-700/70 px-3 py-2 font-display text-xs font-semibold uppercase tracking-wide text-slate-300"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bloque.rows.map((fila, i) => (
                                    <tr key={i} className="odd:bg-ink-900/40">
                                        {columnas.map((col) => (
                                            <td
                                                key={col}
                                                className="border-b border-ink-800/60 px-3 py-2 align-top text-slate-300"
                                            >
                                                <Markdown text={String(fila[col] ?? '')} className="[&>p]:mb-0" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {bloque.caption && (
                        <figcaption className="mt-2 text-xs text-slate-400">{bloque.caption}</figcaption>
                    )}
                </figure>
            )
        }

        case 'nota':
        case 'aviso': {
            const estilo = ESTILO_NOTA[bloque.type]
            return (
                <aside className={`my-5 rounded-r-xl border-l-4 ${estilo.borde} ${estilo.fondo} px-4 py-3`}>
                    <div className={`mb-1 font-display text-xs font-semibold uppercase tracking-wide ${estilo.color}`}>
                        {estilo.etiqueta}
                    </div>
                    <Markdown text={bloque.text} className="[&>p:last-child]:mb-0" />
                </aside>
            )
        }

        case 'quiz':
            return <Quiz quiz={bloque.quiz} />

        case 'markdown':
        default:
            return <Markdown text={bloque.text} />
    }
}

/** Pregunta de comprobacion con retroalimentacion inmediata. */
export function Quiz({ quiz }) {
    const [elegida, setElegida] = useState(null)
    if (!quiz) return null
    const contestada = elegida !== null
    const correcta = elegida === quiz.answer

    return (
        <div className="my-6 rounded-xl border border-ink-700/70 bg-ink-900/50 p-4">
            <div className="mb-3 flex items-center gap-2">
                <span className="rounded-md bg-aura-violet/15 px-2 py-0.5 font-display text-[11px] font-semibold uppercase tracking-wide text-aura-violet">
                    Comprueba
                </span>
            </div>
            <Markdown text={quiz.q} className="[&>p:last-child]:mb-3" />
            <div className="space-y-2">
                {quiz.options.map((opcion, i) => {
                    const esCorrecta = i === quiz.answer
                    const seleccionada = i === elegida
                    let clases =
                        'border-ink-700/70 bg-ink-850/60 hover:border-aura-cyan/50 hover:bg-ink-800/60'
                    if (contestada && esCorrecta) {
                        clases = 'border-aura-mint/70 bg-aura-mint/10'
                    } else if (contestada && seleccionada && !esCorrecta) {
                        clases = 'border-aura-rose/70 bg-aura-rose/10'
                    } else if (contestada) {
                        clases = 'border-ink-800/70 bg-ink-850/40 opacity-60'
                    }
                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={contestada}
                            onClick={() => setElegida(i)}
                            className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${clases}`}
                        >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-ink-600/80 font-mono text-[11px] text-slate-300">
                                {String.fromCharCode(65 + i)}
                            </span>
                            <Markdown text={opcion} className="flex-1 text-sm [&>p]:mb-0" />
                        </button>
                    )
                })}
            </div>
            {contestada && (
                <div
                    className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                        correcta
                            ? 'bg-aura-mint/10 text-aura-mint'
                            : 'bg-aura-amber/10 text-aura-amber'
                    }`}
                >
                    <span className="font-semibold">{correcta ? 'Correcto. ' : 'Revisa: '}</span>
                    <Markdown text={quiz.why || ''} className="inline [&>p]:mb-0 [&>p]:inline" />
                </div>
            )}
        </div>
    )
}

/** Secuencia completa de bloques de una leccion. */
export function LessonContent({ content }) {
    return (
        <div>
            {(content || []).map((bloque, i) => (
                <Block key={i} bloque={bloque} />
            ))}
        </div>
    )
}

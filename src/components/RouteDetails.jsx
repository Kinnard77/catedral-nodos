import { useState } from 'react'
import { levelOf, subjectOf } from '../domain/lesson.js'

const ETIQUETA_ROL = {
    fundamento: { texto: 'Fundamento', color: 'text-aura-amber', fondo: 'bg-aura-amber/10' },
    nucleo: { texto: 'Núcleo', color: 'text-aura-cyan', fondo: 'bg-aura-cyan/10' },
    practica: { texto: 'Práctica', color: 'text-aura-mint', fondo: 'bg-aura-mint/10' },
    extension: { texto: 'Extensión', color: 'text-aura-violet', fondo: 'bg-aura-violet/10' },
}

/** Panel derecho: la ruta clasificada, la leccion activa y el catalogo. */
export default function RouteDetails({
    ruta,
    estado,
    error,
    pasos,
    activo,
    catalogo,
    catalogoIndex,
    generadas,
    completadas,
    progreso,
    ultimoDespliegue,
    onReproducir,
    onContinuar,
    onAbrir,
    onSeleccionar,
    onNuevaConsulta,
}) {
    const [pestana, setPestana] = useState('ruta')
    const clasificando = estado === 'clasificando'

    return (
        <aside
            data-panel="ruta"
            className="flex h-full w-[360px] shrink-0 flex-col border-l border-ink-700/60 bg-ink-900/70"
        >
            <div className="flex items-center gap-1 border-b border-ink-700/60 p-2">
                <Pestana activa={pestana === 'ruta'} onClick={() => setPestana('ruta')}>
                    Gameflow
                </Pestana>
                <Pestana activa={pestana === 'activa'} onClick={() => setPestana('activa')}>
                    Nodo activo
                </Pestana>
                <Pestana activa={pestana === 'catalogo'} onClick={() => setPestana('catalogo')}>
                    Piezas
                </Pestana>
            </div>

            <div className="sin-scrollbar flex-1 overflow-y-auto">
                {pestana === 'ruta' && (
                    <SeccionRuta
                        ruta={ruta}
                        estado={estado}
                        error={error}
                        pasos={pasos}
                        progreso={progreso}
                        completadas={completadas}
                        ultimoDespliegue={ultimoDespliegue}
                        onReproducir={onReproducir}
                        onContinuar={onContinuar}
                        onSeleccionar={onSeleccionar}
                        onNuevaConsulta={onNuevaConsulta}
                        clasificando={clasificando}
                    />
                )}

                {pestana === 'activa' && (
                    <SeccionActiva
                        lesson={activo ? catalogoIndex.get(activo) : null}
                        cursada={activo ? completadas.includes(activo) : false}
                        onAbrir={onAbrir}
                        onContinuar={onContinuar}
                        catalogoIndex={catalogoIndex}
                        onSeleccionar={onSeleccionar}
                    />
                )}

                {pestana === 'catalogo' && (
                    <SeccionCatalogo
                        catalogo={catalogo}
                        generadas={generadas}
                        completadas={completadas}
                        onSeleccionar={onSeleccionar}
                    />
                )}
            </div>
        </aside>
    )
}

function Pestana({ children, activa, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 rounded-lg px-2 py-1.5 font-display text-[11.5px] font-semibold transition-colors ${
                activa ? 'bg-ink-700/80 text-white' : 'text-slate-400 hover:bg-ink-800/70 hover:text-slate-200'
            }`}
        >
            {children}
        </button>
    )
}

function SeccionRuta({
    ruta,
    estado,
    error,
    pasos,
    progreso,
    completadas = [],
    ultimoDespliegue,
    onReproducir,
    onContinuar,
    onSeleccionar,
    onNuevaConsulta,
    clasificando,
}) {
    const [verDetalle, setVerDetalle] = useState(false)

    if (clasificando) {
        return (
            <div className="space-y-3 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-ink-700" />
                <div className="h-3 w-full animate-pulse rounded bg-ink-800" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-ink-800" />
                <div className="mt-4 space-y-2">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-14 animate-pulse rounded-xl bg-ink-850/70" />
                    ))}
                </div>
                <p className="pt-1 text-center text-[11px] text-slate-500">
                    Interpretando la petición y ordenando el gameflow…
                </p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="rounded-xl border border-aura-rose/40 bg-aura-rose/[0.07] p-3">
                    <div className="mb-1 font-display text-[12px] font-semibold text-aura-rose">
                        El motor falló
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-slate-300">{error}</p>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                        Si estás usando un LLM, revisa endpoint, modelo y API key en Ajustes. El modo local
                        sigue disponible sin conexión.
                    </p>
                </div>
            </div>
        )
    }

    if (estado === 'inicial' && !ruta) {
        return (
            <div className="p-4">
                <div className="mb-3 font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Cómo funciona
                </div>
                <ol className="space-y-2.5">
                    {[
                        'Elige la catedral. Es el escenario real y lo que decide qué material existe.',
                        'Mira qué tenemos: las opciones que ya existen allí, por los cuatro pilares.',
                        'Abre el grafo de un anclaje: abre por el FINAL, por la herejía, no por la piedra.',
                        'En cada nodo, "ver continuación" revela lo que hace falta antes.',
                    ].map((texto, i) => (
                        <li key={i} className="flex gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-ink-700/70 font-mono text-[10px] text-aura-cyan">
                                {i + 1}
                            </span>
                            <span className="text-[12px] leading-relaxed text-slate-400">{texto}</span>
                        </li>
                    ))}
                </ol>
            </div>
        )
    }

    if (!ruta) return null

    const materia = subjectOf({ subject: ruta.subject })
    const pct = Math.round((progreso?.ratio || 0) * 100)

    return (
        <div className="p-4">
            <div className="mb-1 flex items-center gap-2">
                <span
                    className="rounded-md px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: `${materia.color}22`, color: materia.color }}
                >
                    {materia.label}
                </span>
                <span className="text-[10.5px] text-slate-500">
                    {ruta.estimatedMin ? `${ruta.estimatedMin} Min. juego` : ''}
                </span>
                <span className="ml-auto font-mono text-[10px] text-slate-500">{ruta.generatedBy}</span>
            </div>

            <h2 className="mb-1.5 font-display text-[15px] font-semibold leading-snug text-white">
                {ruta.title}
            </h2>
            {ruta.summary && (
                <p className="mb-3 text-[12px] leading-relaxed text-slate-400">{ruta.summary}</p>
            )}

            {ruta.fallbackReason && (
                <div className="mb-3 rounded-lg border border-aura-amber/30 bg-aura-amber/[0.07] px-2.5 py-2 text-[10.5px] text-aura-amber">
                    Se usó el motor local: {ruta.fallbackReason}
                </div>
            )}

            <div className="mb-3 flex gap-2">
                <button
                    type="button"
                    onClick={() => onReproducir()}
                    className="flex-1 rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-3 py-2.5 font-display text-[13px] font-semibold text-ink-950 transition-opacity hover:opacity-90"
                >
                    ▶ Play gameflow
                </button>
                <button
                    type="button"
                    onClick={() => onContinuar()}
                    className="rounded-xl border border-aura-cyan/50 px-3 py-2.5 font-display text-[12px] font-semibold text-aura-cyan transition-colors hover:bg-aura-cyan/10"
                >
                    Ver continuación
                </button>
            </div>

            <div className="mb-4">
                <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-[10.5px] uppercase tracking-wider text-slate-500">Avance</span>
                    <span className="font-mono text-[10.5px] text-slate-400">
                        {progreso?.hechas || 0}/{progreso?.total || 0} · {pct}%
                    </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-aura-cyan to-aura-mint transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {ruta.rationale && (
                <div className="mb-4 rounded-xl border border-ink-700/60 bg-ink-850/40 p-3">
                    <div className="mb-1 font-display text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Por qué este gameflow
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-slate-400">{ruta.rationale}</p>
                </div>
            )}

            {ultimoDespliegue?.ids?.length > 0 && (
                <div className="mb-3 rounded-xl border border-aura-cyan/30 bg-aura-cyan/[0.06] px-3 py-2 text-[11px] text-aura-cyan">
                    Desplegados {ultimoDespliegue.ids.length} nodo(s): {ultimoDespliegue.motivo}
                </div>
            )}

            <div className="mb-2 flex items-baseline justify-between">
                <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Secuencia ({pasos.length})
                </span>
                {ruta.rejectedSteps > 0 && (
                    <span className="text-[10px] text-slate-500">{ruta.rejectedSteps} descartado(s)</span>
                )}
            </div>

            <ol className="space-y-2">
                {pasos.map((paso) => (
                    <PasoRuta
                        key={paso.lessonId}
                        paso={paso}
                        cursada={completadas.includes(paso.lessonId)}
                        onClick={() => onSeleccionar(paso.lessonId)}
                    />
                ))}
            </ol>

            <button
                type="button"
                onClick={onNuevaConsulta}
                className="mt-4 w-full rounded-xl border border-ink-700/70 px-3 py-2 text-[11.5px] text-slate-400 transition-colors hover:border-ink-500 hover:text-slate-200"
            >
                Descartar gameflow
            </button>

            <button
                type="button"
                onClick={() => setVerDetalle((v) => !v)}
                className="mt-3 w-full text-left text-[10.5px] text-slate-500 transition-colors hover:text-slate-300"
            >
                {verDetalle ? '▾' : '▸'} Detalles del motor
            </button>
            {verDetalle && (
                <pre className="sin-scrollbar mt-2 overflow-x-auto rounded-lg border border-ink-700/60 bg-ink-950/70 p-2.5 font-mono text-[10px] leading-relaxed text-slate-400">
                    {JSON.stringify(
                        {
                            proveedor: ruta.generatedBy,
                            modo: ruta.subject,
                            pasos: ruta.steps.length,
                            nuevas: ruta.newLessons.length,
                            catalogoEnviado: ruta.catalogSize ?? 'completo',
                            catalogoTotal: ruta.totalCatalogSize ?? undefined,
                            uso: ruta.usage ?? undefined,
                            descartados: ruta.rejectedSteps ?? 0,
                        },
                        null,
                        2,
                    )}
                </pre>
            )}
        </div>
    )
}

function PasoRuta({ paso, cursada, onClick }) {
    const lesson = paso.lesson
    if (!lesson) return null
    const materia = subjectOf(lesson)
    const nivel = levelOf(lesson)
    const rol = ETIQUETA_ROL[paso.role] || ETIQUETA_ROL.nucleo

    return (
        <li>
            <button
                type="button"
                onClick={onClick}
                className="group flex w-full gap-2.5 rounded-xl border border-ink-700/60 bg-ink-850/40 p-2.5 text-left transition-colors hover:border-aura-cyan/50 hover:bg-ink-800/60"
            >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-ink-700/70 font-mono text-[11px] text-slate-300">
                    {paso.order}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: materia.color }}
                        />
                        <span
                            className={`rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide ${rol.fondo} ${rol.color}`}
                        >
                            {rol.texto}
                        </span>
                        <span className="ml-auto text-[9.5px] text-slate-500">{nivel.short}</span>
                        {cursada && <span className="text-[10px] text-aura-mint">✓</span>}
                    </span>
                    <span className="mt-1 block truncate font-display text-[12.5px] font-semibold text-slate-100">
                        {lesson.title}
                    </span>
                    {paso.rationale && (
                        <span className="mt-0.5 line-clamp-2 block text-[10.5px] leading-relaxed text-slate-400">
                            {paso.rationale}
                        </span>
                    )}
                </span>
            </button>
        </li>
    )
}

function SeccionActiva({ lesson, cursada, onAbrir, onContinuar, catalogoIndex, onSeleccionar }) {
    if (!lesson) {
        return (
            <div className="p-4 text-[12px] text-slate-500">
                Ningún nodo seleccionado. Haz clic en un nodo del grafo.
            </div>
        )
    }

    const materia = subjectOf(lesson)
    const nivel = levelOf(lesson)

    return (
        <div className="p-4">
            <div className="mb-2 flex items-center gap-2">
                <span
                    className="flex h-6 w-6 items-center justify-center rounded-lg font-mono text-[11px]"
                    style={{ backgroundColor: `${materia.color}22`, color: materia.color }}
                >
                    {materia.glyph}
                </span>
                <span className="font-display text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                    {materia.label} · {nivel.label} · {lesson.durationMin} Min. juego
                </span>
            </div>

            <h2 className="mb-2 font-display text-[15px] font-semibold leading-snug text-white">
                {lesson.title}
            </h2>
            <p className="mb-3 text-[12px] leading-relaxed text-slate-400">{lesson.summary}</p>

            {cursada && (
                <div className="mb-3 rounded-lg bg-aura-mint/10 px-2.5 py-1.5 text-[11px] text-aura-mint">
                    Ya marcada como definida
                </div>
            )}

            <div className="mb-4 flex gap-2">
                <button
                    type="button"
                    onClick={() => onAbrir(lesson.id)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-3 py-2.5 font-display text-[12.5px] font-semibold text-ink-950 transition-opacity hover:opacity-90"
                >
                    Leer nodo
                </button>
                <button
                    type="button"
                    onClick={() => onContinuar(lesson.id)}
                    className="rounded-xl border border-aura-cyan/50 px-3 py-2.5 font-display text-[12px] font-semibold text-aura-cyan transition-colors hover:bg-aura-cyan/10"
                >
                    Ver continuación
                </button>
            </div>

            {lesson.objectives?.length > 0 && (
                <Bloque titulo="Al terminar podrás">
                    <ul className="space-y-1.5">
                        {lesson.objectives.map((objetivo, i) => (
                            <li key={i} className="flex gap-2 text-[11.5px] leading-relaxed text-slate-400">
                                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-aura-mint" />
                                {objetivo}
                            </li>
                        ))}
                    </ul>
                </Bloque>
            )}

            <Relaciones
                titulo="Requiere antes"
                ids={lesson.prereq}
                catalogoIndex={catalogoIndex}
                onSeleccionar={onSeleccionar}
                color="text-aura-amber"
            />
            <Relaciones
                titulo="Habilita después"
                ids={lesson.unlocks}
                catalogoIndex={catalogoIndex}
                onSeleccionar={onSeleccionar}
                color="text-aura-violet"
            />

            {lesson.tags?.length > 0 && (
                <Bloque titulo="Etiquetas">
                    <div className="flex flex-wrap gap-1.5">
                        {lesson.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-md border border-ink-700/70 px-1.5 py-0.5 text-[10px] text-slate-400"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </Bloque>
            )}
        </div>
    )
}

function Relaciones({ titulo, ids, catalogoIndex, onSeleccionar, color }) {
    if (!ids?.length) return null
    return (
        <Bloque titulo={titulo}>
            <ul className="space-y-1">
                {ids.map((id) => {
                    const lesson = catalogoIndex.get(id)
                    return (
                        <li key={id}>
                            <button
                                type="button"
                                onClick={() => onSeleccionar(id)}
                                className={`w-full truncate rounded-lg px-2 py-1 text-left text-[11.5px] transition-colors hover:bg-ink-800/70 ${color}`}
                            >
                                → {lesson ? lesson.title : id}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </Bloque>
    )
}

function Bloque({ titulo, children }) {
    return (
        <div className="mb-4">
            <div className="mb-1.5 font-display text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {titulo}
            </div>
            {children}
        </div>
    )
}

function SeccionCatalogo({ catalogo, generadas, completadas, onSeleccionar }) {
    const [filtro, setFiltro] = useState('')
    const [soloGeneradas, setSoloGeneradas] = useState(false)

    const lista = catalogo.filter((lesson) => {
        if (soloGeneradas && lesson.origin !== 'generado') return false
        if (!filtro.trim()) return true
        const heno = `${lesson.title} ${lesson.tags.join(' ')} ${lesson.summary}`.toLowerCase()
        return heno.includes(filtro.trim().toLowerCase())
    })

    return (
        <div className="p-4">
            <input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Filtrar nodos…"
                className="mb-2 w-full rounded-xl border border-ink-700 bg-ink-950/70 px-3 py-2 text-[12px] text-slate-100 placeholder:text-slate-500 focus:border-aura-cyan/70 focus:outline-none"
            />
            <div className="mb-3 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setSoloGeneradas((v) => !v)}
                    className={`rounded-lg border px-2 py-1 text-[10.5px] transition-colors ${
                        soloGeneradas
                            ? 'border-aura-violet/60 text-aura-violet'
                            : 'border-ink-700/70 text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Solo generadas ({generadas.length})
                </button>
                <span className="ml-auto font-mono text-[10.5px] text-slate-500">{lista.length}</span>
            </div>

            <ul className="space-y-1.5">
                {lista.map((lesson) => {
                    const materia = subjectOf(lesson)
                    const cursada = completadas.includes(lesson.id)
                    return (
                        <li key={lesson.id}>
                            <button
                                type="button"
                                onClick={() => onSeleccionar(lesson.id)}
                                className="w-full rounded-xl border border-ink-700/60 bg-ink-850/40 p-2.5 text-left transition-colors hover:border-aura-cyan/50 hover:bg-ink-800/60"
                            >
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ backgroundColor: materia.color }}
                                    />
                                    <span className="text-[9.5px] uppercase tracking-wide text-slate-500">
                                        {materia.label} · {levelOf(lesson).label}
                                    </span>
                                    {lesson.origin === 'generado' && (
                                        <span className="rounded bg-aura-violet/15 px-1 text-[9px] font-semibold text-aura-violet">
                                            nueva
                                        </span>
                                    )}
                                    {cursada && <span className="ml-auto text-[10px] text-aura-mint">✓</span>}
                                </span>
                                <span className="mt-1 block font-display text-[12.5px] font-semibold leading-snug text-slate-100">
                                    {lesson.title}
                                </span>
                            </button>
                        </li>
                    )
                })}
            </ul>
            {!lista.length && (
                <p className="py-6 text-center text-[11.5px] text-slate-500">Sin resultados.</p>
            )}
        </div>
    )
}

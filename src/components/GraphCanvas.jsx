import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { NodeCard } from './NodeCard.jsx'
import { EdgeHitAreas, EdgeLayer } from './EdgeLayer.jsx'
import {
    centrarEn,
    centroDe,
    encuadrar,
    NODE_H,
    NODE_W,
    pendientesDe,
} from '../graph/graphEngine.js'
import { levelOf, subjectOf } from '../domain/lesson.js'

const MIN_ZOOM = 0.25
const MAX_ZOOM = 2.2

// La tarjeta del nodo activo vive abajo a la derecha: el encuadre automatico
// reserva ese alto para no tapar nodos. A lo ancho NO reserva nada, porque el
// grafo se centra mejor y la tarjeta se puede esquivar arrastrando el lienzo.
const AREA_TARJETA = { derecha: 0, abajo: 300 }

/** Lienzo interactivo: pan, zoom, nodos dinamicos y conexiones. */
export default function GraphCanvas({
    lecciones,
    posiciones,
    edges,
    activo,
    completadas,
    rutaIds,
    ultimoDespliegue,
    catalogoIndex,
    onSeleccionar,
    onContinuar,
    onAbrir,
    onMarcarCursada,
    onAnadirAntes,
    progreso,
    onReiniciar,
    pendientesActivos,
    desplegando,
    onViewport,
    catedral,
    material,
}) {
    const contenedorRef = useRef(null)
    const [viewport, setViewport] = useState({ width: 900, height: 640 })
    const [vista, setVista] = useState({ scale: 1, tx: 40, ty: 40 })
    const [arrastrando, setArrastrando] = useState(false)
    const unionRef = useRef(null)
    const encuadradoRef = useRef('')
    const animacionRef = useRef(null)
    // Nodo en el que ya se ha centrado la camara: evita repetir la animacion.
    const centradoRef = useRef(null)

    // Referencia viva de la camara: las animaciones parten del valor actual
    // sin re-suscribir callbacks.
    const vistaRef = useRef(vista)
    useEffect(() => {
        vistaRef.current = vista
    }, [vista])

    // --- Medicion del contenedor -------------------------------------------
    useLayoutEffect(() => {
        const nodo = contenedorRef.current
        if (!nodo) return undefined
        const observador = new ResizeObserver(([entrada]) => {
            const { width, height } = entrada.contentRect
            setViewport((prev) =>
                Math.round(prev.width) === Math.round(width) && Math.round(prev.height) === Math.round(height)
                    ? prev
                    : { width, height },
            )
        })
        observador.observe(nodo)
        return () => observador.disconnect()
    }, [])

    // El layout necesita el alto real para decidir cuantas filas caben.
    useEffect(() => {
        onViewport?.(viewport)
    }, [onViewport, viewport])

    // --- Encuadre automatico cuando cambia la composicion del grafo ---------
    useEffect(() => {
        if (!posiciones.size) return
        const firma = `${[...posiciones.keys()].sort().join('|')}:${Math.round(viewport.width)}x${Math.round(viewport.height)}`
        if (encuadradoRef.current === firma) return
        encuadradoRef.current = firma
        const objetivo = encuadrar(posiciones, viewport, { reservado: AREA_TARJETA })
        if (objetivo) animarHacia(objetivo)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posiciones, viewport])

    // --- Animacion suave de camara -----------------------------------------
    const animarHacia = useCallback((objetivo) => {
        cancelAnimationFrame(animacionRef.current)
        const inicio = performance.now()
        const desde = { ...vistaRef.current }
        const duracion = 460

        const paso = (ahora) => {
            const t = Math.min(1, (ahora - inicio) / duracion)
            const suave = 1 - Math.pow(1 - t, 3)
            setVista({
                scale: desde.scale + (objetivo.scale - desde.scale) * suave,
                tx: desde.tx + (objetivo.tx - desde.tx) * suave,
                ty: desde.ty + (objetivo.ty - desde.ty) * suave,
            })
            if (t < 1) animacionRef.current = requestAnimationFrame(paso)
        }
        animacionRef.current = requestAnimationFrame(paso)
    }, [])

    useEffect(() => () => cancelAnimationFrame(animacionRef.current), [])

    const centrarEnNodo = useCallback(
        (lessonId) => {
            const posicion = posiciones.get(lessonId)
            if (!posicion) return
            const objetivo = centrarEn(posicion, viewport, vistaRef.current.scale)
            animarHacia({ ...vistaRef.current, ...objetivo })
        },
        [animarHacia, posiciones, viewport],
    )

    // Centra la camara en el nodo activo cuando cambia.
    //
    // LA GUARDA ES LO IMPORTANTE, y es la que faltaba: se centra UNA vez por
    // activacion, no una vez por render. Sin ella, si `posiciones` cambiaba de
    // identidad en cada render, cada render volvia a lanzar la animacion;
    // `animarHacia` cancela la anterior y empieza otra, asi que la camara no
    // llegaba nunca y la app se quedaba ocupada para siempre. El sintoma era
    // justo ese: el grafo se queda frickeado, no se mueve, y hay que recargar.
    //
    // El encuadre automatico de arriba ya tenia su guarda (`encuadradoRef`).
    // Esta es la misma idea.
    useEffect(() => {
        if (!activo) return
        if (centradoRef.current === activo) return
        const posicion = posiciones.get(activo)
        if (!posicion) return
        const centro = centroDe(posicion)
        // Se lee la camara VIVA, no la del cierre: si no, el calculo va con retraso.
        const camara = vistaRef.current
        const fueraX =
            centro.x < -camara.tx / camara.scale ||
            centro.x > (-camara.tx + viewport.width) / camara.scale
        const fueraY =
            centro.y < -camara.ty / camara.scale ||
            centro.y > (-camara.ty + viewport.height) / camara.scale
        // Se marca como centrado PASE LO QUE PASE: si el nodo ya esta a la vista,
        // tambien queda resuelto. Si no, el efecto volveria a mirarlo en cada
        // render para siempre.
        centradoRef.current = activo
        if (fueraX || fueraY) centrarEnNodo(activo)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activo, posiciones])

    // --- Pan y zoom --------------------------------------------------------
    // RED DE SEGURIDAD DEL ARRASTRE. Si el `pointerup` no llega —se suelta
    // fuera de la ventana, se pierde el foco, se cambia de pestana— `unionRef`
    // se queda puesto y el lienzo sigue al raton SIN boton pulsado: no se puede
    // mover nada mas y hay que recargar. Se escucha en la VENTANA, que es donde
    // el evento acaba llegando siempre.
    useEffect(() => {
        const soltar = () => {
            if (!unionRef.current) return
            unionRef.current = null
            setArrastrando(false)
        }
        window.addEventListener('pointerup', soltar)
        window.addEventListener('pointercancel', soltar)
        window.addEventListener('blur', soltar)
        return () => {
            window.removeEventListener('pointerup', soltar)
            window.removeEventListener('pointercancel', soltar)
            window.removeEventListener('blur', soltar)
        }
    }, [])
    const alPresionar = (e) => {
        if (e.button !== 0 && e.button !== 1) return
        const objetivo = e.currentTarget
        objetivo.setPointerCapture?.(e.pointerId)
        unionRef.current = { x: e.clientX, y: e.clientY, tx: vista.tx, ty: vista.ty, movido: false }
        setArrastrando(true)
    }

    const alMover = (e) => {
        const union = unionRef.current
        if (!union) return
        const dx = e.clientX - union.x
        const dy = e.clientY - union.y
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) union.movido = true
        setVista((v) => ({ ...v, tx: union.tx + dx, ty: union.ty + dy }))
    }

    const alSoltar = (e) => {
        unionRef.current = null
        setArrastrando(false)
        e.currentTarget.releasePointerCapture?.(e.pointerId)
    }

    const alRodar = (e) => {
        e.preventDefault()
        const caja = contenedorRef.current?.getBoundingClientRect()
        if (!caja) return
        const x = e.clientX - caja.left
        const y = e.clientY - caja.top
        const factor = Math.exp(-e.deltaY * 0.0016)
        setVista((v) => {
            const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.scale * factor))
            const k = scale / v.scale
            return { scale, tx: x - (x - v.tx) * k, ty: y - (y - v.ty) * k }
        })
    }

    const zoom = (factor) =>
        setVista((v) => {
            const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.scale * factor))
            const k = scale / v.scale
            const x = viewport.width / 2
            const y = viewport.height / 2
            return { scale, tx: x - (x - v.tx) * k, ty: y - (y - v.ty) * k }
        })

    const encuadrarTodo = () => {
        const objetivo = encuadrar(posiciones, viewport, { reservado: AREA_TARJETA })
        if (objetivo) animarHacia(objetivo)
    }

    // Nodos con continuacion pendiente, para dibujar el boton "+".
    const pendientes = useMemo(() => {
        const visiblesSet = new Set(lecciones.map((l) => l.id))
        const mapa = new Map()
        for (const lesson of lecciones) {
            mapa.set(lesson.id, pendientesDe(lesson.id, visiblesSet, catalogoIndex))
        }
        return mapa
    }, [lecciones, catalogoIndex])

    const rutaSet = useMemo(() => new Set(rutaIds || []), [rutaIds])
    const nuevasIds = useMemo(() => new Set(ultimoDespliegue?.ids || []), [ultimoDespliegue])
    const resaltadas = useMemo(() => (activo ? [activo] : []), [activo])

    // Las etiquetas de arista: lo que cada nodo entrega a los que dependen de
    // el. Es la diferencia entre un diagrama y un diseno.
    const etiquetas = useMemo(() => {
        const mapa = new Map()
        for (const edge of edges) {
            const entrega = catalogoIndex.get(edge.from)?.entrega
            if (entrega) mapa.set(edge.id, entrega)
        }
        return mapa
    }, [edges, catalogoIndex])

    const vacio = !lecciones.length

    return (
        <div
            className="relative h-full w-full overflow-hidden bg-grid"
            data-lienzo
            data-viewport={`${Math.round(viewport.width)}x${Math.round(viewport.height)}`}
            data-vista={`${vista.scale.toFixed(3)}:${Math.round(vista.tx)}:${Math.round(vista.ty)}`}
        >
            <div
                ref={contenedorRef}
                className={`absolute inset-0 touch-none ${arrastrando ? 'cursor-grabbing' : 'cursor-grab'}`}
                onPointerDown={alPresionar}
                onPointerMove={alMover}
                onPointerUp={alSoltar}
                onPointerCancel={alSoltar}
                onWheel={alRodar}
            >
                <div
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                        transform: `translate3d(${vista.tx}px, ${vista.ty}px, 0) scale(${vista.scale})`,
                        width: NODE_W,
                        height: NODE_H,
                    }}
                >
                    <EdgeLayer
                        edges={edges}
                        posiciones={posiciones}
                        resaltadas={resaltadas}
                        ultimoDespliegue={ultimoDespliegue?.ids || []}
                        etiquetas={etiquetas}
                    />
                    <EdgeHitAreas edges={edges} posiciones={posiciones} onSeleccionar={() => {}} />

                    {lecciones.map((lesson) => {
                        const posicion = posiciones.get(lesson.id)
                        if (!posicion) return null
                        return (
                            <NodeCard
                                key={lesson.id}
                                lesson={lesson}
                                posicion={posicion}
                                activo={lesson.id === activo}
                                cursada={completadas.includes(lesson.id)}
                                nueva={nuevasIds.has(lesson.id)}
                                pendientes={pendientes.get(lesson.id) || 0}
                                enRuta={rutaSet.has(lesson.id)}
                                onSeleccionar={onSeleccionar}
                                onContinuar={onContinuar}
                            />
                        )
                    })}
                </div>
            </div>

            {vacio && <LienzoVacio catedral={catedral} material={material} />}

            {/* Barra de herramientas del lienzo */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                <PlaybackBar progreso={progreso} onReiniciar={onReiniciar} visible={!vacio} />
                <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-ink-700/70 bg-ink-900/85 p-1 backdrop-blur">
                    <BotonLienzo onClick={() => zoom(1.2)} titulo="Acercar">
                        +
                    </BotonLienzo>
                    <BotonLienzo onClick={() => zoom(1 / 1.2)} titulo="Alejar">
                        −
                    </BotonLienzo>
                    <BotonLienzo onClick={encuadrarTodo} titulo="Encuadrar todo" ancho>
                        Encuadrar
                    </BotonLienzo>
                    <span className="px-1 font-mono text-[10px] text-slate-500">
                        {Math.round(vista.scale * 100)}%
                    </span>
                </div>
            </div>

            {/* Tarjeta del nodo activo */}
            {activo && (
                <TarjetaActiva
                    lesson={catalogoIndex.get(activo)}
                    cursada={completadas.includes(activo)}
                    pendientes={pendientesActivos}
                    desplegando={desplegando}
                    onContinuar={() => onContinuar(activo)}
                    onAbrir={() => onAbrir(activo)}
                    onCerrar={() => onSeleccionar(null)}
                    onMarcar={() => onMarcarCursada(activo)}
                    onAnadirAntes={() => onAnadirAntes(activo)}
                    onCentrar={() => centrarEnNodo(activo)}
                />
            )}

            {ultimoDespliegue?.motivo && !vacio && (
                <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="rounded-full border border-ink-700/70 bg-ink-900/90 px-3.5 py-1.5 text-[11px] text-slate-300 backdrop-blur">
                        {ultimoDespliegue.ids.length > 0
                            ? `+${ultimoDespliegue.ids.length} nodo(s): ${ultimoDespliegue.motivo}`
                            : ultimoDespliegue.motivo}
                    </div>
                </div>
            )}
        </div>
    )
}

function BotonLienzo({ children, onClick, titulo, ancho }) {
    return (
        <button
            type="button"
            title={titulo}
            onClick={onClick}
            className={`flex h-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-ink-700 hover:text-white ${
                ancho ? 'px-2 text-[11px] font-medium' : 'w-7 text-sm'
            }`}
        >
            {children}
        </button>
    )
}

function PlaybackBar({ progreso, onReiniciar, visible }) {
    if (!visible) return null
    const pct = Math.round((progreso?.ratio || 0) * 100)
    return (
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-ink-700/70 bg-ink-900/85 px-3 py-2 backdrop-blur">
            <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Gameflow
            </span>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ink-700">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-aura-cyan to-aura-mint transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="font-mono text-[11px] text-slate-400">
                {progreso?.hechas || 0}/{progreso?.total || 0}
            </span>
            <button
                type="button"
                onClick={onReiniciar}
                className="rounded-lg px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:bg-ink-700 hover:text-white"
            >
                Reiniciar
            </button>
        </div>
    )
}

function TarjetaActiva({
    lesson,
    cursada,
    pendientes,
    desplegando,
    onContinuar,
    onAbrir,
    onCerrar,
    onMarcar,
    onAnadirAntes,
    onCentrar,
}) {
    if (!lesson) return null
    const materia = subjectOf(lesson)
    const nivel = levelOf(lesson)

    return (
        <div className="absolute bottom-4 right-4 max-h-[42%] w-[336px] animate-node-in overflow-y-auto sin-scrollbar">
            <div className="panel rounded-2xl p-4 shadow-2xl">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span
                            className="flex h-6 w-6 items-center justify-center rounded-lg font-mono text-[11px]"
                            style={{ backgroundColor: `${materia.color}22`, color: materia.color }}
                        >
                            {materia.glyph}
                        </span>
                        <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {materia.label} · {nivel.label}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="-mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-ink-700 hover:text-white"
                        title="Cerrar"
                    >
                        ×
                    </button>
                </div>

                <h3 className="mb-1 font-display text-[15px] font-semibold leading-snug text-white">
                    {lesson.title}
                </h3>
                <p className="mb-3 text-[12.5px] leading-relaxed text-slate-400">{lesson.summary}</p>

                {lesson.objectives?.length > 0 && (
                    <ul className="mb-3 space-y-1">
                        {lesson.objectives.slice(0, 3).map((objetivo, i) => (
                            <li key={i} className="flex gap-2 text-[11.5px] text-slate-400">
                                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-500" />
                                {objetivo}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mb-3 flex flex-wrap gap-1.5">
                    {cursada && (
                        <span className="rounded-md bg-aura-mint/15 px-2 py-0.5 text-[10px] font-semibold text-aura-mint">
                            ya definida
                        </span>
                    )}
                    <span className="rounded-md bg-ink-700/70 px-2 py-0.5 text-[10px] text-slate-400">
                        {lesson.durationMin} Min. juego
                    </span>
                    {lesson.prereq.length > 0 && (
                        <span className="rounded-md bg-aura-amber/10 px-2 py-0.5 text-[10px] text-aura-amber">
                            {lesson.prereq.length} prerequisito(s)
                        </span>
                    )}
                </div>

                <div className="space-y-2">
                    <button
                        type="button"
                        data-accion="continuar"
                        onClick={onContinuar}
                        disabled={desplegando}
                        className="group flex w-full items-center justify-between rounded-xl border border-aura-cyan/50 bg-aura-cyan/10 px-3 py-2.5 text-left transition-colors hover:bg-aura-cyan/20 disabled:opacity-50"
                    >
                        <span className="font-display text-[13px] font-semibold text-aura-cyan">
                            Ver continuación
                        </span>
                        <span className="text-[11px] text-aura-cyan/80">
                            {desplegando ? 'desplegando…' : pendientes > 0 ? `${pendientes} nodo(s)` : 'buscar más'}
                        </span>
                    </button>

                    {/* La accion del metodo: el diseño va hacia atras. */}
                    <button
                        type="button"
                        data-accion="anadir-antes"
                        onClick={onAnadirAntes}
                        title="Añadir una pieza que tiene que estar resuelta antes de esta"
                        className="flex w-full items-center justify-between rounded-xl border border-aura-violet/50 bg-aura-violet/10 px-3 py-2.5 text-left transition-colors hover:bg-aura-violet/20"
                    >
                        <span className="font-display text-[13px] font-semibold text-aura-violet">
                            ＋ Añadir lo que hace falta antes
                        </span>
                    </button>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onAbrir}
                            className="flex-1 rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-3 py-2 font-display text-[13px] font-semibold text-ink-950 transition-opacity hover:opacity-90"
                        >
                            Estudiar nodo
                        </button>
                        <button
                            type="button"
                            onClick={onMarcar}
                            title={cursada ? 'Ya esta marcada como definida' : 'Marcar como definida'}
                            className={`rounded-xl border px-3 py-2 text-[12px] transition-colors ${
                                cursada
                                    ? 'border-aura-mint/60 text-aura-mint'
                                    : 'border-ink-600 text-slate-300 hover:border-aura-mint/60 hover:text-aura-mint'
                            }`}
                        >
                            {cursada ? '✓' : 'Marcar'}
                        </button>
                        <button
                            type="button"
                            onClick={onCentrar}
                            title="Centrar en el lienzo"
                            className="rounded-xl border border-ink-600 px-3 py-2 text-[12px] text-slate-300 transition-colors hover:border-ink-400 hover:text-white"
                        >
                            ◎
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LienzoVacio({ catedral, material = 0 }) {
    // Sin catedral no hay premisa, y sin premisa no hay nada que diseñar: el
    // lienzo no finge un estado vacío neutro, dice en qué punto está el diseño.
    if (!catedral) {
        return (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="max-w-md text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-700 bg-ink-900/80">
                        <span className="font-mono text-xl text-aura-cyan">⌘</span>
                    </div>
                    <h2 className="mb-2 font-display text-lg font-semibold text-slate-200">
                        Falta la premisa
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-400">
                        Elige primero la catedral: es ella la que decide qué misterios existen.
                    </p>
                </div>
            </div>
        )
    }

    const misterios = catedral.misterios?.length || 0

    if (misterios === 0) {
        return (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="max-w-md text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-aura-cyan/40 bg-ink-900/80">
                        <span className="font-mono text-xl text-aura-cyan">⌘</span>
                    </div>
                    <h2 className="mb-2 font-display text-lg font-semibold text-slate-200">
                        {catedral.nombre}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-400">
                        {material === 0 ? (
                            <>
                                Todavía no hay <span className="text-slate-200">material</span> sobre la
                                mesa. Primero qué tenemos en esta catedral; después, qué misterio podemos
                                inducir con ello.
                            </>
                        ) : (
                            <>
                                <span className="text-slate-200">{material} opción(es)</span> de material
                                sobre la mesa, y todavía ningún misterio estudiado. El paso siguiente es
                                abrir el grafo de un anclaje y empezar por el final.
                            </>
                        )}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-ink-700 bg-ink-900/80">
                    <span className="font-mono text-xl text-aura-cyan">◈</span>
                </div>
                <h2 className="mb-2 font-display text-lg font-semibold text-slate-200">
                    Escribe qué quieres descubrir
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                    El motor buscará en las piezas y propondrá un gameflow. Al aceptarlo, el grafo se
                    despliega nodo por nodo con <span className="text-aura-cyan">ver continuación</span>.
                </p>
            </div>
        </div>
    )
}

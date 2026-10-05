import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildCatalog, createClassifier, DEFAULT_LLM } from '../classifier/index.js'
import { buildEdges, indexById, resolveIds } from '../data/catalog.js'
import { CLAVES, borrarTodo, guardar, leer } from '../lib/storage.js'
import {
    aristasEntre,
    calcularLayout,
    desplegar,
    indexById as indexar,
    inicializarGrafo,
} from '../graph/graphEngine.js'

const SETTINGS_DEFAULT = {
    mode: 'auto',
    llm: { ...DEFAULT_LLM, apiKey: '' },
    jav: { endpoint: '', apiKey: '' },
}

/** Estado de la academia: catalogo, clasificador, ruta y grafo desplegado. */
export function useAcademy({ viewport = null } = {}) {
    const [settings, setSettings] = useState(() => fusionar(leer(CLAVES.settings), SETTINGS_DEFAULT))
    const [generadas, setGeneradas] = useState(() => leer(CLAVES.generated, []) || [])
    const [completadas, setCompletadas] = useState(() => leer(CLAVES.progreso, []) || [])
    const [historial, setHistorial] = useState(() => leer(CLAVES.historial, []) || [])

    const [prompt, setPrompt] = useState('')
    const [estado, setEstado] = useState('inicial') // inicial | clasificando | listo | error
    const [error, setError] = useState(null)
    const [ruta, setRuta] = useState(null)

    const [visibles, setVisibles] = useState([])
    const [contadores, setContadores] = useState({})
    const [grafoEdges, setGrafoEdges] = useState([])
    const [rutaOrden, setRutaOrden] = useState([])
    const [activo, setActivo] = useState(null)
    const [ultimoDespliegue, setUltimoDespliegue] = useState(null)

    const abortRef = useRef(null)

    const catalogo = useMemo(() => {
        const { lessons } = buildCatalog(generadas)
        return { lessons, index: indexById(lessons), edges: buildEdges(lessons) }
    }, [generadas])

    const clasificador = useMemo(() => createClassifier(settings), [settings])

    useEffect(() => {
        guardar(CLAVES.settings, settings)
    }, [settings])
    useEffect(() => {
        guardar(CLAVES.generated, generadas)
    }, [generadas])
    useEffect(() => {
        guardar(CLAVES.progreso, completadas)
    }, [completadas])
    useEffect(() => {
        guardar(CLAVES.historial, historial.slice(0, 20))
    }, [historial])

    /** Vacia el lienzo sin tocar la ruta clasificada. */
    const resetGrafo = useCallback(() => {
        setVisibles([])
        setContadores({})
        setGrafoEdges([])
        setRutaOrden([])
        setActivo(null)
        setUltimoDespliegue(null)
    }, [])

    const limpiarGrafo = resetGrafo

    /** Consulta al clasificador: prompt -> ruta de nodos. */
    const clasificar = useCallback(
        async (texto, options = {}) => {
            const limpio = String(texto || '').trim()
            if (!limpio) return null

            abortRef.current?.abort()
            const controller = new AbortController()
            abortRef.current = controller

            setEstado('clasificando')
            setError(null)
            setPrompt(limpio)
            if (!options.conservarGrafo) {
                resetGrafo()
            }

            try {
                const resultado = await clasificador.classify(limpio, catalogo.lessons, {
                    visibles,
                    completadas,
                    signal: controller.signal,
                })
                setRuta(resultado)

                if (resultado.newLessons?.length) {
                    setGeneradas((prev) => fusionarGeneradas(prev, resultado.newLessons))
                }

                setHistorial((prev) =>
                    [{ prompt: limpio, title: resultado.title, at: new Date().toISOString() }, ...prev]
                        .filter((h, i, arr) => arr.findIndex((x) => x.prompt === h.prompt) === i)
                        .slice(0, 20),
                )
                setEstado('listo')
                return resultado
            } catch (err) {
                if (err?.name === 'AbortError') return null
                setError(err.message || 'Fallo el clasificador.')
                setEstado('error')
                return null
            }
        },
        [catalogo.lessons, clasificador, completadas, resetGrafo, visibles],
    )

    const cancelar = useCallback(() => {
        abortRef.current?.abort()
        setEstado(ruta ? 'listo' : 'inicial')
    }, [ruta])

    /** Convierte la ruta clasificada en grafo y lo despliega. */
    const reproducir = useCallback(
        (rutaObjetivo = ruta) => {
            if (!rutaObjetivo?.steps?.length) return
            const index = indexar(catalogo.lessons)
            const inicial = inicializarGrafo(rutaObjetivo.steps, index)
            if (!inicial.visibles.length) return

            setVisibles(inicial.visibles)
            setContadores(inicial.contadores)
            setGrafoEdges(inicial.edges)
            setRutaOrden(inicial.ruta)
            setActivo(inicial.activo)
            setUltimoDespliegue({
                ids: inicial.visibles,
                motivo: 'la ruta abre por su punto de partida',
            })
        },
        [catalogo.lessons, ruta],
    )

    /**
     * "Ver continuacion": despliega el siguiente anillo de nodos
     * alrededor de la leccion indicada.
     */
    const continuar = useCallback(
        (lessonId = activo) => {
            if (!lessonId) return null
            const index = indexar(catalogo.lessons)
            const resultado = desplegar({
                lessonId,
                visibles,
                contadores,
                ruta: rutaOrden,
                index,
            })

            if (!resultado.ids.length) {
                setUltimoDespliegue({
                    ids: [],
                    motivo: 'no hay mas continuaciones en el catalogo actual para este nodo',
                })
                return { ...resultado, vacio: true }
            }

            setVisibles((prev) => unir(prev, resultado.ids))
            setGrafoEdges((prev) => unirAristas(prev, resultado.edges))
            setContadores(resultado.contadores)
            setUltimoDespliegue({ ids: resultado.ids, motivo: resultado.motivo })
            return resultado
        },
        [activo, catalogo.lessons, contadores, rutaOrden, visibles],
    )

    /** Marca una leccion como cursada; su contenido alimenta futuras rutas. */
    const marcarCursada = useCallback((lessonId) => {
        setCompletadas((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]))
    }, [])

    const desmarcarCursada = useCallback((lessonId) => {
        setCompletadas((prev) => prev.filter((id) => id !== lessonId))
    }, [])

    const abrirLeccion = useCallback(
        (lessonId) => {
            setActivo(lessonId)
            marcarCursada(lessonId)
        },
        [marcarCursada],
    )

    const actualizarSettings = useCallback((parcial) => {
        setSettings((prev) => fusionar(parcial, prev))
    }, [])

    const agregarLeccion = useCallback((lesson) => {
        setGeneradas((prev) => fusionarGeneradas(prev, [lesson]))
    }, [])

    const reiniciarProgreso = useCallback(() => {
        setCompletadas([])
        setGeneradas([])
        borrarTodo()
        resetGrafo()
        setRuta(null)
        setEstado('inicial')
        setPrompt('')
    }, [resetGrafo])

    // --- Derivados para la UI -------------------------------------------------

    const leccionesVisibles = useMemo(
        () => resolveIds(visibles, catalogo.index),
        [visibles, catalogo.index],
    )

    const edgesVisibles = useMemo(
        () => aristasEntre(visibles, grafoEdges),
        [visibles, grafoEdges],
    )

    // La ruta planificada ordena los carriles y el alto real decide cuantas
    // filas caben antes de envolver la capa.
    const layout = useMemo(
        () =>
            calcularLayout(leccionesVisibles, edgesVisibles, {
                ordenPreferido: rutaOrden,
                viewport,
                reservado: { derecha: 0, abajo: 300 },
            }),
        [leccionesVisibles, edgesVisibles, rutaOrden, viewport],
    )

    const pasosVisibles = useMemo(() => {
        if (!ruta?.steps) return []
        return ruta.steps
            .map((paso) => ({ ...paso, lesson: catalogo.index.get(paso.lessonId) }))
            .filter((paso) => paso.lesson)
    }, [ruta, catalogo.index])

    const leccionActiva = activo ? catalogo.index.get(activo) || null : null

    const progreso = useMemo(() => {
        const total = ruta?.steps?.length || 0
        const hechas = ruta?.steps?.filter((s) => completadas.includes(s.lessonId)).length || 0
        return { total, hechas, ratio: total ? hechas / total : 0 }
    }, [ruta, completadas])

    const pendientesActivos = useMemo(() => {
        if (!activo) return 0
        const lesson = catalogo.index.get(activo)
        if (!lesson) return 0
        const setVisibles = new Set(visibles)
        const pendientes = [
            ...lesson.prereq.filter((id) => !setVisibles.has(id)),
            ...lesson.unlocks.filter((id) => !setVisibles.has(id)),
        ]
        return pendientes.length
    }, [activo, catalogo.index, visibles])

    return {
        // catalogo
        catalogo: catalogo.lessons,
        catalogoIndex: catalogo.index,
        // clasificador
        clasificador,
        settings,
        actualizarSettings,
        // consulta
        prompt,
        setPrompt,
        estado,
        error,
        ruta,
        clasificar,
        cancelar,
        historial,
        // grafo
        reproducir,
        continuar,
        limpiarGrafo,
        visibles,
        leccionesVisibles,
        edgesVisibles,
        layout,
        activo,
        setActivo,
        leccionActiva,
        ultimoDespliegue,
        pendientesActivos,
        // progreso
        completadas,
        marcarCursada,
        desmarcarCursada,
        abrirLeccion,
        progreso,
        pasosVisibles,
        // catalogo editable
        generadas,
        agregarLeccion,
        reiniciarProgreso,
    }
}

function fusionar(parcial, base) {
    if (!parcial) return base
    return {
        mode: parcial.mode || base.mode,
        llm: { ...base.llm, ...(parcial.llm || {}) },
        jav: { ...base.jav, ...(parcial.jav || {}) },
    }
}

function fusionarGeneradas(prev, nuevas) {
    const map = new Map(prev.map((l) => [l.id, l]))
    for (const l of nuevas) map.set(l.id, l)
    return [...map.values()]
}

function unir(prev, ids) {
    const set = new Set(prev)
    for (const id of ids) set.add(id)
    return [...set]
}

function unirAristas(prev, nuevas) {
    const map = new Map(prev.map((e) => [e.id, e]))
    for (const e of nuevas) map.set(e.id, e)
    return [...map.values()]
}

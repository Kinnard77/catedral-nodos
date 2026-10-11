import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildCatalog, createClassifier, DEFAULT_LLM } from '../classifier/index.js'
import { buildEdges, indexById, normalizar, resolveIds } from '../data/catalog.js'
import { CATEDRALES, unirCatedrales } from '../data/catedrales.js'
import { elementosDe, faltaFuente, IDIOMA_BASE } from '../domain/elemento.js'
import { proponerMisterios as pedirMisterios } from '../classifier/misterios.js'
import { investigarCatedral } from '../classifier/investigacion.js'
import { materialDe, descartar, desdocumentar, documentar, PILARES, recuperar } from '../domain/material.js'
import { grafoDesdeMaterial, leccionesDesdeMaterial, tieneFinal } from '../domain/puente.js'
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

/** Estado del diseno: catalogo, motor, gameflow y grafo desplegado. */
export function useAcademy({ viewport = null } = {}) {
    const [settings, setSettings] = useState(() => fusionar(leer(CLAVES.settings), SETTINGS_DEFAULT))
    const [generadas, setGeneradas] = useState(() => leer(CLAVES.generated, []) || [])
    const [enlaces, setEnlaces] = useState(() => leer(CLAVES.enlaces, {}) || {})
    const [completadas, setCompletadas] = useState(() => leer(CLAVES.progreso, []) || [])
    const [historial, setHistorial] = useState(() => leer(CLAVES.historial, []) || [])

    // --- La premisa: en qué catedral se trabaja (la pregunta 0 del diseño) ---
    const [catedralesPropias, setCatedralesPropias] = useState(() => leer(CLAVES.catedrales, []) || [])
    const [premisa, setPremisa] = useState(() => leer(CLAVES.premisa, null))

    // --- El material: los elementos de la catedral elegida -------------------
    const [elementos, setElementos] = useState(() => leer(CLAVES.elementos, []) || [])

    // --- El material de las catedrales (el 80% de la investigacion) ----------
    // SIN MATERIAL DE EJEMPLO. Antes se sembraba aqui el material del 4 que
    // escribio el agente, y el disenador lo cazo: aparecia mezclado con lo que
    // trae el motor y no habia forma de saber que era suyo y que era de la IA.
    // «Elimina todos y veamos si la herramienta funciona y nos trae nuevos.»
    //
    // La limpieza es UNA sola vez: lo que hubiera era de ejemplo o de pruebas
    // anteriores. A partir de ahi, lo que haya es lo que haya traido el motor.
    const [material, setMaterial] = useState(() => {
        if (!leer(CLAVES.materialLimpiado, false)) {
            guardar(CLAVES.materialLimpiado, true)
            guardar(CLAVES.material, [])
            return []
        }
        return leer(CLAVES.material, []) || []
    })
    const [investigando, setInvestigando] = useState(false)
    const [errorInvestigacion, setErrorInvestigacion] = useState(null)
    const [avisoInvestigacion, setAvisoInvestigacion] = useState('')
    const [resultadoInvestigacion, setResultadoInvestigacion] = useState('')
    const [anclajeActivo, setAnclajeActivo] = useState(null)
    /** Qué anclaje estaba abierto en cada catedral, para poder reabrirlo. */
    const [anclajesAbiertos, setAnclajesAbiertos] = useState(
        () => leer(CLAVES.anclajesAbiertos, {}) || {},
    )

    // --- Las propuestas del motor, por catedral ------------------------------
    const [propuestas, setPropuestas] = useState(() => leer(CLAVES.propuestas, {}) || {})
    const [proponiendo, setProponiendo] = useState(false)
    const [errorMisterios, setErrorMisterios] = useState(null)

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
        const { lessons } = buildCatalog(generadas, enlaces)
        return { lessons, index: indexById(lessons), edges: buildEdges(lessons) }
    }, [generadas, enlaces])

    const clasificador = useMemo(() => createClassifier(settings), [settings])

    const catedrales = useMemo(() => unirCatedrales(CATEDRALES, catedralesPropias), [catedralesPropias])
    const catedralActiva = useMemo(
        () => (premisa?.catedralId ? catedrales.find((c) => c.id === premisa.catedralId) || null : null),
        [premisa, catedrales],
    )

    useEffect(() => {
        guardar(CLAVES.settings, settings)
    }, [settings])
    useEffect(() => {
        guardar(CLAVES.generated, generadas)
    }, [generadas])
    useEffect(() => {
        guardar(CLAVES.enlaces, enlaces)
    }, [enlaces])
    useEffect(() => {
        guardar(CLAVES.catedrales, catedralesPropias)
    }, [catedralesPropias])
    useEffect(() => {
        guardar(CLAVES.premisa, premisa)
    }, [premisa])
    useEffect(() => {
        guardar(CLAVES.elementos, elementos)
    }, [elementos])
    useEffect(() => {
        guardar(CLAVES.material, material)
    }, [material])
    useEffect(() => {
        guardar(CLAVES.propuestas, propuestas)
    }, [propuestas])
    useEffect(() => {
        guardar(CLAVES.anclajesAbiertos, anclajesAbiertos)
    }, [anclajesAbiertos])
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
            const inicial = inicializarGrafo(rutaObjetivo.steps, index, { conBase: false })
            if (!inicial.visibles.length) return

            setVisibles(inicial.visibles)
            setContadores(inicial.contadores)
            setGrafoEdges(inicial.edges)
            setRutaOrden(inicial.ruta)
            setActivo(inicial.activo)
            setUltimoDespliegue({
                ids: inicial.visibles,
                motivo: 'el lienzo abre por el final del juego',
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
                    motivo: 'no hay más piezas que revelar alrededor de este nodo',
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

    /**
     * LA ACCION DEL METODO: insertar una pieza nueva ANTES de otra.
     *
     * Crea la pieza, la enlaza como prerrequisito del padre y la deja visible de
     * inmediato en el lienzo (acabas de crearla; obligar a pulsar "ver
     * continuación" para verla no tendría sentido). La pieza nueva pasa a ser la
     * activa, porque el paso siguiente del diseño es preguntar qué hace falta
     * antes de ELLA.
     */
    const agregarAntesDe = useCallback(
        (padreId, borrador) => {
            const padre = catalogo.index.get(padreId)
            const titulo = String(borrador?.title || '').trim()
            if (!padre || !titulo) return null

            const id = idDisponible(titulo, catalogo.index)
            const pieza = {
                id,
                title: titulo,
                subject: borrador.subject,
                level: borrador.level,
                durationMin: borrador.durationMin,
                summary: String(borrador.summary || '').trim(),
                objectives: [],
                prereq: [],
                unlocks: [],
                tags: [],
                skills: [],
                content: borrador.content?.length
                    ? borrador.content
                    : [{ type: 'nota', text: 'Pieza añadida a mano: pendiente de desarrollar.' }],
                origin: 'generado',
            }

            setGeneradas((prev) => fusionarGeneradas(prev, [pieza]))
            setEnlaces((prev) => ({
                ...prev,
                [padreId]: [...new Set([...(prev[padreId] || []), id])],
            }))
            setVisibles((prev) => unir(prev, [id]))
            setGrafoEdges((prev) =>
                unirAristas(prev, [
                    { id: `${id}->${padreId}:prereq`, from: id, to: padreId, kind: 'prereq' },
                ]),
            )
            setActivo(id)
            setUltimoDespliegue({
                ids: [id],
                motivo: `se añadió una pieza antes de «${padre.title}»`,
            })
            return { id, padre }
        },
        [catalogo.index],
    )

    const reiniciarProgreso = useCallback(() => {
        setCompletadas([])
        setGeneradas([])
        setEnlaces({})
        setCatedralesPropias([])
        setPremisa(null)
        setElementos([])
        setMaterial([])
        setAnclajeActivo(null)
        setPropuestas({})
        borrarTodo()
        resetGrafo()
        setRuta(null)
        setEstado('inicial')
        setPrompt('')
    }, [resetGrafo])

    // --- La pregunta 0: en qué catedral se trabaja ---------------------------

    /**
     * Elige la catedral. Fija la premisa de todo el diseño: sin catedral no hay
     * nada que diseñar, porque es ella la que decide qué misterios existen.
     * El misterio se elige después (paso 2) y nace vacío a propósito.
     *
     * Y CAMBIAR DE CATEDRAL VACIA EL LIENZO. El grafo, las propuestas del motor,
     * el anclaje activo y la ruta clasificada son el trabajo de la catedral
     * anterior: si se quedan, parecen de esta. Si la catedral nueva no tiene
     * nada trabajado, el lienzo se queda limpio.
     *
     * Lo que NO se borra es el material ni los misterios ya estudiados: cada uno
     * guarda su `catedralId`, así que vuelven solos al volver a esa catedral.
     * Cambiar de catedral cambia la VISTA, no tira el trabajo.
     */
    const elegirCatedral = useCallback(
        (catedralId) => {
            setPremisa({ catedralId, misterioId: null, elegidaEn: new Date().toISOString() })
            resetGrafo()
            setPropuestas({})
            setAnclajeActivo(null)
            setRuta(null)
            setEstado('inicial')
            setPrompt('')
            setError(null)
        },
        [resetGrafo],
    )

    /** Añade una catedral que no estaba en la lista del diseñador. */
    const agregarCatedral = useCallback(
        (nombre) => {
            const limpio = String(nombre || '').trim()
            if (!limpio) return null
            const id = idDeCatedral(limpio, CATEDRALES, catedralesPropias)
            setCatedralesPropias((prev) => [...prev, { id, nombre: limpio, misterios: [] }])
            return id
        },
        [catedralesPropias],
    )

    /** Vuelve a la pregunta 0 sin borrar lo que ya se haya estudiado. */
    const cambiarCatedral = useCallback(() => setPremisa(null), [])

    // --- El material de la catedral elegida ----------------------------------

    const elementosCatedral = useMemo(
        () => elementosDe(elementos, premisa?.catedralId),
        [elementos, premisa],
    )

    // --- El material de la catedral elegida ----------------------------------

    const materialCatedral = useMemo(
        () => materialDe(material, premisa?.catedralId),
        [material, premisa],
    )

    /**
     * LA INVESTIGACION PREVIA (el 80%).
     *
     * El disenador lo pidio asi: que la IA investigue a fondo que hay en la
     * catedral —incluidos los apocrifos convincentes— para que el panel de nodos
     * pueda sacar despues el 20% que falta.
     *
     * Lo que devuelve son CANDIDATOS: nada entra como documentado sin fuente, y
     * el saneado degrada lo que se declare documentado sin ella.
     */
    const investigar = useCallback(
        async (notas = '') => {
            const catedralId = premisa?.catedralId
            if (!catedralId) return null

            setInvestigando(true)
            setErrorInvestigacion(null)
            try {
                const r = await investigarCatedral({
                    settings,
                    catedral: catedralActiva,
                    materialPrevio: materialCatedral,
                    notas,
                })
                // LA INVESTIGACION SUMA, NO SUSTITUYE.
                //
                // Antes se borraba TODO el material de la catedral y se ponia
                // solo lo nuevo: volver a investigar te tiraba lo que ya tenias
                // —incluido lo que ya habias verificado a mano y con su fuente—.
                // Y va contra la regla de la casa: «no se tira nada».
                //
                // Ahora se suma, y **lo que ya estaba MANDA**: si el motor
                // repite una opcion, no pisa la tuya (que puede estar ya
                // documentada o descartada). Solo entran las que son nuevas.
                const clave = (o) => String(o?.titulo || o?.id || '').trim().toLowerCase()
                const yaEstan = new Set(materialCatedral.map(clave))
                const nuevas = r.opciones.filter((o) => !yaEstan.has(clave(o)))
                const repetidas = r.opciones.length - nuevas.length

                setMaterial((prev) => [
                    ...prev.filter((o) => o.catedralId !== catedralId),
                    ...materialCatedral,
                    ...nuevas,
                ])
                setAvisoInvestigacion(r.aviso || '')
                // ESTO NO ES UN ERROR. La investigacion ha funcionado: trajo
                // material. Que viniera marcado como documentado y se haya
                // quedado en «por verificar» es la regla aplicandose, no un
                // fallo — y ensenarlo en rojo hacia creer lo contrario.
                setResultadoInvestigacion(
                    nuevas.length || repetidas
                        ? `Investigación completada: ${nuevas.length} opción(es) nuevas.${
                              repetidas > 0
                                  ? ` ${repetidas} ya estaban sobre la mesa y se han respetado tal como las tenías.`
                                  : ''
                          }${
                              r.degradadas > 0
                                  ? ` ${r.degradadas} venían marcadas como documentadas y quedaron «por verificar»: la IA propone y tú confirmas.`
                                  : ''
                          }`
                        : 'La investigación no trajo ninguna opción válida.',
                )
                return r
            } catch (err) {
                setErrorInvestigacion(err?.message || 'La investigación no respondió.')
                return null
            } finally {
                setInvestigando(false)
            }
        },
        [premisa, settings, catedralActiva, materialCatedral],
    )

    /**
     * PIDE UNA MÁS DE UN PILAR — y no toca los otros tres.
     *
     * El botón global pide un lote de los cuatro pilares: trae un muro de
     * candidatos y relee lo que ya tenías. Esto es lo contrario: **una sola, de
     * un solo pilar**. Preciso, barato, y deja el resto quieto. Con una,
     * decidir es instantáneo.
     *
     * Misma regla que la investigación normal: **SUMA, no sustituye**, y lo que
     * ya estaba manda. Y si el motor se despista y trae de otro pilar, no entra.
     */
    const investigarPilar = useCallback(
        async (pilar, notas = '') => {
            const catedralId = premisa?.catedralId
            if (!catedralId || !pilar) return null

            setInvestigando(true)
            setErrorInvestigacion(null)
            try {
                const r = await investigarCatedral({
                    settings,
                    catedral: catedralActiva,
                    materialPrevio: materialCatedral,
                    notas,
                    pilar,
                    cuantas: 1,
                })
                const suyas = r.opciones.filter((o) => o.pilar === pilar)
                const clave = (o) => String(o?.titulo || o?.id || '').trim().toLowerCase()
                const yaEstan = new Set(materialCatedral.map(clave))
                const nuevas = suyas.filter((o) => !yaEstan.has(clave(o)))

                setMaterial((prev) => [
                    ...prev.filter((o) => o.catedralId !== catedralId),
                    ...materialCatedral,
                    ...nuevas,
                ])
                setAvisoInvestigacion(r.aviso || '')
                setResultadoInvestigacion(
                    nuevas.length
                        ? `Una más para ${PILARES[pilar]?.label || pilar}: «${nuevas[0].titulo}». Los otros pilares no se han tocado.`
                        : `El motor no trajo ninguna opción nueva de ${PILARES[pilar]?.label || pilar}.`,
                )
                return r
            } catch (err) {
                setErrorInvestigacion(err?.message || 'La investigación no respondió.')
                return null
            } finally {
                setInvestigando(false)
            }
        },
        [premisa, settings, catedralActiva, materialCatedral],
    )

    /**
     * VER EL GRAFO DE UN ANCLAJE — el puente, cableado.
     *
     * Antes esto clasificaba el titulo con el motor y desplegaba un grafo que no
     * tenia nada que ver con el material: era el grafo de ejemplo haciendose
     * pasar por el del disenador. Ahora el grafo SE CONSTRUYE CON EL MATERIAL
     * que hay sobre la mesa, y se despliega abriendo por el FINAL.
     *
     * Las lecciones entran ademas en el catalogo, porque «ver continuacion» las
     * necesita para revelar hacia atras. Y se reemplazan solo las de ESTE
     * anclaje: el grafo de una piedra no toca el de otra.
     */
    const verGrafoDe = useCallback(
        (anclajeId) => {
            const catedralId = premisa?.catedralId
            // SIN TRUCOS: la cadena la declara el MISTERIO elegido (su
            // `sostienen`), no el programa rebuscando en todo el material de la
            // catedral. Sin misterio elegido, el grafo es el anclaje y se ve el
            // hueco — que es la verdad.
            const misterio =
                catedralActiva?.misterios?.find((m) => m.id === premisa?.misterioId) || null
            const lecciones = leccionesDesdeMaterial(material, anclajeId, catedralId, misterio)
            if (!lecciones.length) return null

            setAnclajeActivo(anclajeId)
            // Se recuerda qué anclaje estaba abierto EN ESTA catedral, para
            // poder reabrirlo al volver. Es lo único que se guarda.
            setAnclajesAbiertos((prev) => ({ ...prev, [catedralId]: anclajeId }))
            setGeneradas((prev) => [
                ...prev.filter((p) => p.deAnclaje !== anclajeId),
                ...lecciones,
            ])

            // Se despliega YA, con un indice propio que incluye estas lecciones,
            // para no esperar a que el catalogo se vuelva a construir.
            const index = indexar([...catalogo.lessons, ...lecciones])
            const inicial = inicializarGrafo(lecciones, index, { conBase: false })
            if (!inicial.visibles.length) return lecciones

            setVisibles(inicial.visibles)
            setContadores(inicial.contadores)
            setGrafoEdges(inicial.edges)
            setRutaOrden(inicial.ruta)
            setActivo(inicial.activo)
            setUltimoDespliegue({
                ids: inicial.visibles,
                motivo: 'el lienzo abre por el final de este anclaje',
            })
            return lecciones
        },
        [material, premisa, catalogo.lessons, catedralActiva],
    )

    /**
     * Que anclajes pueden abrir su grafo: los que tienen material sobre la mesa.
     * Ya no depende de un mapa fijo de grafos: depende de lo que HAYA.
     */
    const tieneGrafoDeAnclaje = useCallback(
        (anclajeId) => {
            // El anclaje puede abrir su grafo porque ES un grafo, aunque de
            // momento sea solo el y no tenga final. Apagarlo obligaria a elegir
            // misterio a ciegas: el diseñador tiene que poder abrirlo y VER el
            // hueco («todavia no hay cadena ni final»).
            return grafoDesdeMaterial(material, anclajeId, premisa?.catedralId).length > 0
        },
        [material, premisa],
    )

    /**
     * AL VOLVER A UNA CATEDRAL SE REABRE SU ANCLAJE.
     *
     * Al cambiar de catedral el lienzo se vacía —que es lo correcto—, pero al
     * volver se encontraba vacío y parecía que el trabajo se hubiera perdido. No
     * se guarda el grafo dibujado: **se vuelve a construir**, porque el grafo es
     * función del material, del misterio elegido y del anclaje. Solo se recuerda
     * el anclaje. Vale también para una recarga de la página.
     */
    const catedralVista = useRef(null)
    useEffect(() => {
        const id = premisa?.catedralId || null
        if (id === catedralVista.current) return
        catedralVista.current = id
        const recordado = anclajesAbiertos[id]
        if (recordado) verGrafoDe(recordado)
    }, [premisa?.catedralId, anclajesAbiertos, verGrafoDe])

    // --- La verificacion a mano ---------------------------------------------
    //
    // El disenador eligio: *«la IA propone y yo verifico a mano»*. Aqui se
    // confirma opcion a opcion, y solo con fuente se pasa a `documentado`.

    const cambiaOpcion = useCallback((id, transformar) => {
        setMaterial((prev) => prev.map((o) => (o.id === id ? transformar(o) : o)))
    }, [])

    /** Documentar exige fuente: sin ella no se cambia nada y se devuelve el motivo. */
    const documentarOpcion = useCallback(
        (id, fuente) => {
            const opcion = material.find((o) => o.id === id)
            if (!opcion) return { ok: false, motivo: 'No encuentro esa opción.' }
            const r = documentar(opcion, fuente)
            if (r.ok) {
                const final = r.opcion
                setMaterial((prev) => prev.map((o) => (o.id === id ? final : o)))
            }
            return r
        },
        [material],
    )

    const desdocumentarOpcion = useCallback(
        (id) => cambiaOpcion(id, desdocumentar),
        [cambiaOpcion],
    )
    const descartarOpcion = useCallback((id) => cambiaOpcion(id, descartar), [cambiaOpcion])
    const recuperarDescartadas = useCallback(() => {
        setMaterial((prev) => prev.map((o) => (o.descartado ? recuperar(o) : o)))
    }, [])

    /**
     * Añade un elemento al material de la catedral elegida.
     *
     * Un elemento REAL no entra sin fuente: es la regla del Grial aplicada al
     * material. Lo que afirmamos tiene que poder sostenerse, y si no se sostiene
     * se marca como inventado o modificado, que también es una decisión legítima.
     */
    const agregarElemento = useCallback(
        (borrador) => {
            const catedralId = premisa?.catedralId
            if (!catedralId) return { ok: false, motivo: 'Falta elegir la catedral.' }

            const nombre = String(borrador?.nombre || '').trim()
            if (!nombre) return { ok: false, motivo: 'El elemento necesita un nombre.' }

            const candidato = {
                id: '',
                catedralId,
                tipo: borrador.tipo === 'modificable' ? 'modificable' : 'real',
                categoria: borrador.categoria || 'otro',
                textos: {
                    [IDIOMA_BASE]: {
                        nombre,
                        detalle: String(borrador.detalle || '').trim(),
                        fuente: String(borrador.fuente || '').trim(),
                    },
                },
                origen: 'disenador',
                anadidoEn: new Date().toISOString(),
            }

            if (faltaFuente(candidato)) {
                return {
                    ok: false,
                    motivo: 'Un elemento real necesita fuente. Si no la tienes, márcalo como inventado o modificado.',
                }
            }

            candidato.id = idDeElemento(nombre, elementos)
            setElementos((prev) => [...prev, candidato])
            return { ok: true, elemento: candidato }
        },
        [elementos, premisa],
    )

    const borrarElemento = useCallback((id) => {
        setElementos((prev) => prev.filter((e) => e.id !== id))
    }, [])

    // --- El motor proponiendo misterios a partir del material ----------------

    const propuestasCatedral = useMemo(
        () => (premisa?.catedralId ? propuestas[premisa.catedralId] || null : null),
        [propuestas, premisa],
    )

    /**
     * Pide al motor misterios candidatos para la catedral elegida.
     *
     * El motor recibe el material con sus ids y tiene que decir cuáles lo
     * sostienen; lo que se apoye en ids que no existen se descarta. Puede
     * proponer, pero no puede inventarse el suelo que pisa.
     */
    const proponerMisterios = useCallback(async () => {
        const catedralId = premisa?.catedralId
        if (!catedralId) return null

        setProponiendo(true)
        setErrorMisterios(null)
        try {
            const r = await pedirMisterios({
                settings,
                catedral: catedralActiva,
                elementos: elementosCatedral,
            })
            const entrada = {
                candidatos: r.candidatos,
                rechazados: r.rechazados,
                idsInventados: r.idsInventados,
                model: r.model,
                generadoEn: new Date().toISOString(),
            }
            setPropuestas((prev) => ({ ...prev, [catedralId]: entrada }))
            return entrada
        } catch (err) {
            setErrorMisterios(err?.message || 'El motor no respondió.')
            return null
        } finally {
            setProponiendo(false)
        }
    }, [premisa, settings, catedralActiva, elementosCatedral])

    /**
     * El diseñador elige. El misterio elegido se guarda en su catedral y pasa a
     * ser la premisa del gameflow: a partir de aquí ya se puede diseñar.
     */
    const elegirMisterio = useCallback(
        (candidato) => {
            const catedralId = premisa?.catedralId
            if (!catedralId || !candidato?.valido) return null

            const elegido = { ...candidato, elegidoEn: new Date().toISOString() }
            const actual = catedrales.find((c) => c.id === catedralId)
            const previos = actual?.misterios || []

            if (!previos.some((m) => m.id === elegido.id)) {
                setCatedralesPropias((prev) => [
                    ...prev.filter((c) => c.id !== catedralId),
                    {
                        id: catedralId,
                        nombre: actual?.nombre || '',
                        misterios: [...previos, elegido],
                    },
                ])
            }
            setPremisa((prev) => ({ ...(prev || {}), catedralId, misterioId: elegido.id }))
            return elegido
        },
        [catedrales, premisa],
    )

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
        agregarAntesDe,
        enlaces,
        reiniciarProgreso,
        // la premisa (pregunta 0)
        catedrales,
        catedralActiva,
        premisa,
        elegirCatedral,
        agregarCatedral,
        cambiarCatedral,
        // el material
        elementos,
        elementosCatedral,
        agregarElemento,
        borrarElemento,
        // el material de la catedral (la investigacion previa)
        material,
        materialCatedral,
        investigar,
        investigarPilar,
        investigando,
        errorInvestigacion,
        avisoInvestigacion,
        resultadoInvestigacion,
        verGrafoDe,
        tieneGrafoDeAnclaje,
        anclajeActivo,
        // la verificacion a mano
        documentarOpcion,
        desdocumentarOpcion,
        descartarOpcion,
        recuperarDescartadas,
        // el misterio
        propuestasCatedral,
        proponerMisterios,
        proponiendo,
        errorMisterios,
        elegirMisterio,
    }
}

/** Slug estable y libre a partir del nombre de un elemento. */
function idDeElemento(nombre, existentes) {
    const usados = new Set(existentes.map((e) => e.id))
    const slug = normalizar(nombre).replace(/\s+/g, '-').slice(0, 40).replace(/^-+|-+$/g, '')
    const raiz = `elem-${slug || 'elemento'}`
    let id = raiz
    let n = 2
    while (usados.has(id)) id = `${raiz}-${n++}`
    return id
}

/** Slug estable y libre a partir del nombre de una catedral añadida. */
function idDeCatedral(nombre, base, propias) {
    const usados = new Set([...base.map((c) => c.id), ...propias.map((c) => c.id)])
    const slug = normalizar(nombre).replace(/\s+/g, '-').slice(0, 40).replace(/^-+|-+$/g, '')
    const raiz = `cat-${slug || 'catedral'}`
    let id = raiz
    let n = 2
    while (usados.has(id)) id = `${raiz}-${n++}`
    return id
}

/** Slug estable y libre a partir del titulo de una pieza nueva. */
function idDisponible(titulo, index) {
    const slug = normalizar(titulo).replace(/\s+/g, '-').slice(0, 40).replace(/^-+|-+$/g, '')
    const base = `gf-${slug || 'pieza'}`
    let id = base
    let n = 2
    while (index.has(id)) id = `${base}-${n++}`
    return id
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

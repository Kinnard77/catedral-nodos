import { useCallback, useEffect, useMemo, useState } from 'react'
import PromptPanel from './components/PromptPanel.jsx'
import GraphCanvas from './components/GraphCanvas.jsx'
import RouteDetails from './components/RouteDetails.jsx'
import SettingsSheet from './components/SettingsSheet.jsx'
import LessonReader from './components/LessonReader.jsx'
import NuevaPieza from './components/NuevaPieza.jsx'
import ElegirCatedral from './components/ElegirCatedral.jsx'
import { useAcademy } from './hooks/useAcademy.js'
import { tieneGrafo as tieneGrafoDeAnclaje } from './data/gameflow/grafos.js'

export default function App() {
    const [viewport, setViewport] = useState(null)
    const gameflow = useAcademy({ viewport })
    const [ajustesAbiertos, setAjustesAbiertos] = useState(false)
    const [lector, setLector] = useState(null)
    // Id de la pieza ANTES de la cual se está añadiendo una nueva.
    const [nuevaAntesDe, setNuevaAntesDe] = useState(null)
    // La pregunta 0 se reabre a petición; sin catedral está abierta sin remedio.
    const [preguntaAbierta, setPreguntaAbierta] = useState(false)
    // En pantallas estrechas el lienzo se queda sin espacio: los paneles
    // arrancan cerrados y se abren a peticion.
    const [panelIzq, setPanelIzq] = useState(() =>
        typeof window === 'undefined' ? true : window.innerWidth >= 1180,
    )
    const [panelDer, setPanelDer] = useState(() =>
        typeof window === 'undefined' ? true : window.innerWidth >= 1180,
    )

    const {
        catalogo,
        catalogoIndex,
        clasificador,
        settings,
        actualizarSettings,
        prompt,
        setPrompt,
        estado,
        error,
        ruta,
        clasificar,
        cancelar,
        historial,
        reproducir,
        continuar,
        limpiarGrafo,
        visibles,
        leccionesVisibles,
        edgesVisibles,
        layout,
        activo,
        setActivo,
        ultimoDespliegue,
        pendientesActivos,
        completadas,
        marcarCursada,
        abrirLeccion,
        progreso,
        pasosVisibles,
        generadas,
        reiniciarProgreso,
        agregarAntesDe,
        catedrales,
        catedralActiva,
        elegirCatedral,
        agregarCatedral,
        materialCatedral,
        investigar,
        investigando,
        errorInvestigacion,
        avisoInvestigacion,
        resultadoInvestigacion,
        verGrafoDe,
        anclajeActivo,
        documentarOpcion,
        desdocumentarOpcion,
        descartarOpcion,
        recuperarDescartadas,
        // El misterio (fase B) y la ficha de campo quedan retirados de la
        // interfaz: sus hojas siguen en src/components, no borradas.
    } = gameflow

    const lectorLesson = lector ? catalogoIndex.get(lector) : null

    const siguientePaso = useMemo(() => {
        if (!ruta?.steps || !lector) return null
        const i = ruta.steps.findIndex((s) => s.lessonId === lector)
        const siguiente = i >= 0 ? ruta.steps[i + 1] : null
        return siguiente ? catalogoIndex.get(siguiente.lessonId) : null
    }, [ruta, lector, catalogoIndex])

    const abrirLector = useCallback(
        (lessonId) => {
            if (!lessonId) return
            abrirLeccion(lessonId)
            setLector(lessonId)
        },
        [abrirLeccion],
    )

    const cerrarLector = useCallback(() => setLector(null), [])

    /**
     * Inserta la pieza nueva antes de la que estaba activa y cierra el
     * formulario: la pieza recién creada queda activa en el lienzo, así que
     * volver a pulsar "añadir lo que hace falta antes" sigue bajando un nivel.
     */
    const crearPiezaAntesDe = useCallback(
        (borrador) => {
            if (!nuevaAntesDe) return
            const resultado = agregarAntesDe(nuevaAntesDe, borrador)
            if (resultado) setNuevaAntesDe(null)
        },
        [agregarAntesDe, nuevaAntesDe],
    )

    const continuarDesdeLector = useCallback(
        (lessonId) => {
            setLector(null)
            setActivo(lessonId)
            // Pequeno retraso: deja que el lienzo vuelva a estar visible
            // antes de animar el despliegue.
            window.setTimeout(() => continuar(lessonId), 180)
        },
        [continuar, setActivo],
    )

    const abrirDesdePanel = useCallback(
        (lessonId) => {
            if (!lessonId) return
            setActivo(lessonId)
            setPanelDer(true)
        },
        [setActivo],
    )

    const nuevaConsulta = useCallback(() => {
        setPrompt('')
        setLector(null)
        limpiarGrafo()
    }, [limpiarGrafo, setPrompt])

    const enviarPrompt = useCallback(
        async (texto) => {
            const resultado = await clasificar(texto)
            if (resultado?.steps?.length) {
                // Play automatico: la ruta recien clasificada se despliega sola.
                window.setTimeout(() => reproducir(resultado), 240)
            }
        },
        [clasificar, reproducir],
    )

    // Atajos de teclado
    useEffect(() => {
        const alTeclear = (e) => {
            const enCampo = ['INPUT', 'TEXTAREA'].includes(e.target?.tagName)
            if (e.key === 'Escape' && !lector) {
                setActivo(null)
                setAjustesAbiertos(false)
                setNuevaAntesDe(null)
                setPreguntaAbierta(false)
            }
            if (e.key === ' ' && !enCampo && !lector && activo) {
                e.preventDefault()
                continuar(activo)
            }
            if (e.key === 'a' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
                e.preventDefault()
                setAjustesAbiertos(true)
            }
        }
        window.addEventListener('keydown', alTeclear)
        return () => window.removeEventListener('keydown', alTeclear)
    }, [activo, continuar, lector, setActivo])

    return (
        <div className="flex h-full w-full overflow-hidden">
            {panelIzq && (
                <PromptPanel
                    historial={historial}
                    catalogo={catalogo}
                    generadas={generadas}
                    clasificador={clasificador}
                    onAbrirAjustes={() => setAjustesAbiertos(true)}
                    catedral={catedralActiva}
                    material={materialCatedral}
                    onInvestigar={investigar}
                    investigando={investigando}
                    errorInvestigacion={errorInvestigacion}
                    avisoInvestigacion={avisoInvestigacion}
                    resultadoInvestigacion={resultadoInvestigacion}
                    onVerGrafo={verGrafoDe}
                    tieneGrafo={tieneGrafoDeAnclaje}
                    anclajeActivo={anclajeActivo}
                    onDocumentar={documentarOpcion}
                    onDesdocumentar={desdocumentarOpcion}
                    onDescartar={descartarOpcion}
                    onRecuperar={recuperarDescartadas}
                />
            )}

            <main className="relative flex min-w-0 flex-1 flex-col">
                {/* Barra superior del lienzo */}
                <div className="flex items-center gap-2 border-b border-ink-700/60 bg-ink-900/60 px-3 py-2">
                    <button
                        type="button"
                        onClick={() => setPanelIzq((v) => !v)}
                        title={panelIzq ? 'Ocultar el material' : 'Mostrar el material'}
                        className="flex h-7 items-center rounded-lg border border-ink-700/70 px-2 text-[11px] text-slate-400 transition-colors hover:border-ink-500 hover:text-white"
                    >
                        {panelIzq ? '◀' : '▶'} Material
                    </button>

                    <div className="mx-1 h-4 w-px bg-ink-700" />

                    {/* La premisa siempre a la vista: es de lo que cuelga todo. */}
                    <button
                        type="button"
                        data-accion="catedral"
                        onClick={() => setPreguntaAbierta(true)}
                        title={catedralActiva ? 'Cambiar de catedral' : 'Elegir la catedral'}
                        className={`flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2 text-[11px] transition-colors ${
                            catedralActiva
                                ? 'border-aura-cyan/40 bg-aura-cyan/5 text-slate-300 hover:border-aura-cyan/70 hover:text-white'
                                : 'border-aura-rose/50 bg-aura-rose/10 text-aura-rose hover:border-aura-rose'
                        }`}
                    >
                        <span className="font-mono text-aura-cyan">⌘</span>
                        <span className="max-w-[200px] truncate">
                            {catedralActiva ? catedralActiva.nombre : 'Falta la catedral'}
                        </span>
                    </button>

                    <div className="min-w-0 flex-1 truncate font-display text-[12.5px] font-semibold text-slate-300">
                        {ruta ? ruta.title : 'Lienzo de gameflow'}
                    </div>

                    {ruta && (
                        <span className="hidden shrink-0 font-mono text-[10.5px] text-slate-500 sm:block">
                            {leccionesVisibles.length} nodos · {edgesVisibles.length} conexiones
                        </span>
                    )}

                    {activo && (
                        <span className="hidden shrink-0 rounded-lg bg-ink-800/80 px-2 py-0.5 text-[10.5px] text-slate-400 md:block">
                            Espacio: revelar lo que hace falta antes
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => setPanelDer((v) => !v)}
                        title={panelDer ? 'Ocultar panel de gameflow' : 'Mostrar panel de gameflow'}
                        className="flex h-7 items-center rounded-lg border border-ink-700/70 px-2 text-[11px] text-slate-400 transition-colors hover:border-ink-500 hover:text-white"
                    >
                        Gameflow {panelDer ? '▶' : '◀'}
                    </button>
                </div>

                <div className="relative min-h-0 flex-1">
                    <GraphCanvas
                        lecciones={leccionesVisibles}
                        posiciones={layout.posiciones}
                        edges={edgesVisibles}
                        activo={activo}
                        completadas={completadas}
                        rutaIds={ruta?.steps?.map((s) => s.lessonId) || []}
                        ultimoDespliegue={ultimoDespliegue}
                        catalogoIndex={catalogoIndex}
                        onSeleccionar={setActivo}
                        onContinuar={continuar}
                        onAbrir={abrirLector}
                        onMarcarCursada={marcarCursada}
                        onAnadirAntes={setNuevaAntesDe}
                        progreso={progreso}
                        onReiniciar={nuevaConsulta}
                        pendientesActivos={pendientesActivos}
                        desplegando={estado === 'clasificando'}
                        onViewport={setViewport}
                        catedral={catedralActiva}
                        material={materialCatedral.length}
                    />
                </div>
            </main>

            {panelDer && (
                <RouteDetails
                    ruta={ruta}
                    estado={estado}
                    error={error}
                    pasos={pasosVisibles.map((paso) => ({
                        ...paso,
                        cursada: completadas.includes(paso.lessonId),
                    }))}
                    activo={activo}
                    catalogo={catalogo}
                    catalogoIndex={catalogoIndex}
                    generadas={generadas}
                    completadas={completadas}
                    progreso={progreso}
                    ultimoDespliegue={ultimoDespliegue}
                    onReproducir={reproducir}
                    onContinuar={continuar}
                    onAbrir={abrirLector}
                    onSeleccionar={abrirDesdePanel}
                    onNuevaConsulta={nuevaConsulta}
                />
            )}

            <SettingsSheet
                abierto={ajustesAbiertos}
                onCerrar={() => setAjustesAbiertos(false)}
                settings={settings}
                onGuardar={actualizarSettings}
                catalogo={catalogo}
                generadas={generadas}
                completadas={completadas}
                onReiniciarProgreso={reiniciarProgreso}
            />

            {/* Paso 0: la pregunta que abre el diseño. Sin catedral no se cierra. */}
            <ElegirCatedral
                abierto={!catedralActiva || preguntaAbierta}
                catedrales={catedrales}
                catedralActiva={catedralActiva}
                onElegir={(id) => {
                    elegirCatedral(id)
                    setPreguntaAbierta(false)
                }}
                onAgregar={agregarCatedral}
                onCerrar={() => setPreguntaAbierta(false)}
            />

            <NuevaPieza
                padre={nuevaAntesDe ? catalogoIndex.get(nuevaAntesDe) : null}
                onCerrar={() => setNuevaAntesDe(null)}
                onCrear={crearPiezaAntesDe}
            />

            {lectorLesson && (
                <LessonReader
                    lesson={lectorLesson}
                    onCerrar={cerrarLector}
                    onContinuar={continuarDesdeLector}
                    onSeleccionar={(id) => {
                        setLector(null)
                        abrirDesdePanel(id)
                    }}
                    catalogoIndex={catalogoIndex}
                    visibles={visibles}
                    cursada={completadas.includes(lectorLesson.id)}
                    onMarcar={marcarCursada}
                    siguientePaso={siguientePaso}
                />
            )}
        </div>
    )
}

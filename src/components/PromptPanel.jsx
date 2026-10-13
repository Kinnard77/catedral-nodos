import { useEffect, useRef, useState } from 'react'
import { subjectBreakdown, totalMinutes } from '../data/catalog.js'
import { subjectOf } from '../domain/lesson.js'
import { claseOf, ESTADOS, opcionesVivas, PILARES, resumenMaterial } from '../domain/material.js'

/**
 * PANEL IZQUIERDO: EL MATERIAL DE LA CATEDRAL.
 *
 * Antes aqui habia una caja que preguntaba «¿que quieres que descubra el
 * jugador?». Eso estaba mal y el disenador lo dijo claro: *«yo que se!!! eso es
 * lo que tiene que resolver el grafo como primera etapa»*. Si lo supiera, no
 * necesitaria la herramienta.
 *
 * Ahora el panel ensena lo que YA existe en esa catedral: las opciones del
 * mapeo, las linguisticas y el material de los cuatro pilares. Primero que
 * tenemos; despues, que misterio podemos inducir con ello.
 */
export default function PromptPanel({
    historial,
    catalogo,
    generadas,
    clasificador,
    onAbrirAjustes,
    catedral,
    material,
    onInvestigar,
    onInvestigarPilar,
    investigando,
    errorInvestigacion,
    avisoInvestigacion,
    resultadoInvestigacion,
    onVerGrafo,
    tieneGrafo,
    anclajeActivo,
    onDocumentar,
    onDesdocumentar,
    onDescartar,
    onRecuperar,
}) {
    const [notas, setNotas] = useState('')

    /** Qué pilar se está buscando, y el aviso PEGADO a ese pilar. */
    const [buscandoPilar, setBuscandoPilar] = useState('')
    const [avisoPilar, setAvisoPilar] = useState(null)

    /**
     * PEDIR UNA MÁS DE UN PILAR, CON EL AVISO PEGADO AL PILAR.
     *
     * El aviso global sale arriba, junto al botón grande. Para pulsar el ＋ de un
     * pilar hay que bajar por la lista, así que aquel aviso queda fuera de la
     * vista y **parece que no ha pasado nada**. Este sale debajo del pilar que se
     * pulsó, y mientras trabaja el botón lo dice: «buscando…».
     */
    const pedirUnaMas = async (clave) => {
        if (!onInvestigarPilar || buscandoPilar) return
        setBuscandoPilar(clave)
        setAvisoPilar(null)
        try {
            const r = await onInvestigarPilar(clave, notas)
            const donde = PILARES[clave]?.label || clave
            if (!r) {
                setAvisoPilar({ pilar: clave, ok: false, texto: `No hubo respuesta del motor para ${donde}.` })
            } else if (r.ok) {
                setAvisoPilar({
                    pilar: clave,
                    ok: true,
                    texto: `Una más para ${donde}: «${r.titulo}». Los otros pilares no se han tocado.`,
                })
            } else {
                setAvisoPilar({
                    pilar: clave,
                    ok: false,
                    texto: r.motivo || `El motor no trajo ninguna opción nueva de ${donde}.`,
                })
            }
        } catch (e) {
            setAvisoPilar({ pilar: clave, ok: false, texto: e?.message || 'Fallo al investigar.' })
        } finally {
            setBuscandoPilar('')
        }
    }
    const areaRef = useRef(null)
    const resumen = resumenMaterial(material)
    const vivas = opcionesVivas(material)
    const piezas = subjectBreakdown(catalogo)

    useEffect(() => {
        const area = areaRef.current
        if (!area) return
        area.style.height = 'auto'
        area.style.height = `${Math.min(120, area.scrollHeight)}px`
    }, [notas])

    return (
        <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-ink-700/60 bg-ink-900/70">
            {/* Marca */}
            <div className="border-b border-ink-700/60 px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-aura-cyan to-aura-violet font-display text-sm font-bold text-ink-950">
                        G
                    </span>
                    <div className="leading-tight">
                        <div className="font-display text-sm font-semibold text-white">
                            Gameflow de catedrales
                        </div>
                        <div className="text-[11px] text-slate-400">Material y grafo, hacia atrás</div>
                    </div>
                </div>
            </div>

            {/* El material de la catedral */}
            <div className="border-b border-ink-700/60 p-4">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                    <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {catedral ? 'Qué tenemos aquí' : 'Falta la catedral'}
                    </span>
                    {material.length > 0 && (
                        <span className="font-mono text-[10.5px] text-slate-500">
                            {resumen.documentadas} doc · {resumen.sinVerificar} s/verificar
                        </span>
                    )}
                </div>

                {!catedral && (
                    <p className="rounded-xl border border-aura-rose/40 bg-aura-rose/5 px-3 py-2.5 text-[11.5px] leading-relaxed text-slate-300">
                        Elige la catedral en el lienzo. Es el escenario real donde se juega y lo que
                        decide qué material existe.
                    </p>
                )}

                {catedral && (
                    <>
                        {material.length === 0 && (
                            <p className="mb-2.5 rounded-xl border border-ink-700/60 bg-ink-850/40 px-3 py-2.5 text-[11.5px] leading-relaxed text-slate-300">
                                Todavía no hay <span className="text-slate-100">material</span> sobre la
                                mesa. Primero qué tenemos en esta catedral; después, qué misterio podemos
                                inducir con ello.
                            </p>
                        )}

                        <textarea
                            id="material-notas"
                            ref={areaRef}
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            rows={2}
                            placeholder="Para pedir MÁS: di qué no te sirve y qué buscas. Ej. «ninguna me sirve para misterio, dame otra cosa» (opcional)"
                            className="sin-scrollbar mb-2 w-full resize-none rounded-xl border border-ink-700 bg-ink-950/70 px-3 py-2 text-[12px] leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-aura-cyan/70 focus:outline-none"
                        />

                        <button
                            type="button"
                            data-accion="investigar"
                            onClick={() => onInvestigar(notas)}
                            disabled={investigando}
                            className="w-full rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-3 py-2.5 font-display text-[13px] font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {investigando
                                ? 'Investigando la catedral…'
                                : material.length
                                  ? 'Volver a investigar'
                                  : 'Investigar esta catedral'}
                        </button>

                        <p className="mt-2 text-[10.5px] leading-relaxed text-slate-500">
                            La investigación trae candidatos. Nada entra como documentado sin una fuente
                            que lo sostenga.
                        </p>
                        {material.length > 0 && (
                            <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">
                                Si ninguna te sirve,{' '}
                                <span className="text-slate-300">vuelve a investigar</span>: el motor
                                recibe lo que YA tienes y se le piden opciones nuevas, buscando en otro
                                sitio. Las notas de arriba son el volante.
                            </p>
                        )}

                        {errorInvestigacion && (
                            <div className="mt-2 rounded-xl border border-aura-rose/50 bg-aura-rose/10 px-3 py-2 text-[11px] leading-relaxed text-aura-rose">
                                {errorInvestigacion}
                            </div>
                        )}

                        {resultadoInvestigacion && (
                            <div className="mt-2 rounded-xl border border-aura-cyan/50 bg-aura-cyan/10 px-3 py-2 text-[11px] leading-relaxed text-aura-cyan">
                                {resultadoInvestigacion}
                            </div>
                        )}

                        {avisoInvestigacion && (
                            <div className="mt-2 rounded-xl border border-aura-amber/50 bg-aura-amber/10 px-3 py-2 text-[11px] leading-relaxed text-aura-amber">
                                {avisoInvestigacion}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* El material, por pilares */}
            <div className="sin-scrollbar flex-1 overflow-y-auto">
                {catedral && vivas.length > 0 && (
                    <div className="space-y-4 p-4">
                        {Object.entries(PILARES).map(([clave, pilar]) => {
                            const delPilar = vivas.filter((o) => o.pilar === clave)
                            return (
                                <div key={clave}>
                                    <div className="mb-1.5 flex items-center gap-1.5">
                                        <span style={{ color: pilar.color }}>{pilar.glyph}</span>
                                        <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            {pilar.label}
                                        </span>
                                        <span className="font-mono text-[10px] text-slate-500">
                                            {delPilar.length}
                                        </span>
                                        {/* La explicacion del pilar, a mano: es el
                                            filtro con el que el motor decide. */}
                                        <Ayuda texto={pilar.explicacion} />
                                        {/* PIDE UNA MÁS, SOLO DE ESTE PILAR. No toca los
                                            otros tres, y está aunque el pilar esté
                                            vacío: es cuando más falta hace. */}
                                        <button
                                            type="button"
                                            data-pedir-pilar={clave}
                                            onClick={() => pedirUnaMas(clave)}
                                            disabled={investigando || Boolean(buscandoPilar)}
                                            title={`Buscar una más de ${pilar.label}`}
                                            className="ml-auto rounded-md border border-ink-700 px-1.5 py-0.5 font-mono text-[11px] leading-none text-slate-400 transition-colors hover:border-aura-cyan/60 hover:text-aura-cyan disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {buscandoPilar === clave ? (
                                                <span className="inline-flex items-center gap-1 text-aura-cyan">
                                                    <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border border-aura-cyan border-t-transparent" />
                                                    buscando…
                                                </span>
                                            ) : (
                                                '＋'
                                            )}
                                        </button>
                                    </div>
                                    {/* EL AVISO VA AQUÍ, PEGADO AL PILAR: es donde
                                        está mirando quien acaba de pulsar el ＋. */}
                                    {avisoPilar?.pilar === clave && (
                                        <p
                                            data-aviso-pilar={clave}
                                            className={`mb-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] leading-relaxed ${
                                                avisoPilar.ok
                                                    ? 'border-aura-mint/50 bg-aura-mint/10 text-slate-200'
                                                    : 'border-aura-rose/50 bg-aura-rose/10 text-aura-rose'
                                            }`}
                                        >
                                            {avisoPilar.texto}
                                        </p>
                                    )}
                                    {delPilar.length === 0 ? (
                                        <p className="rounded-xl border border-dashed border-ink-700/60 px-3 py-2 text-[11px] text-slate-500">
                                            Nada todavía en este pilar. Pulsa ＋ para pedir una.
                                        </p>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {delPilar.map((o) => (
                                                <TarjetaOpcion
                                                    key={o.id}
                                                    opcion={o}
                                                    tieneGrafo={Boolean(tieneGrafo?.(o.id))}
                                                    activo={anclajeActivo === o.id}
                                                    onVerGrafo={() => onVerGrafo?.(o.id)}
                                                    onDocumentar={onDocumentar}
                                                    onDesdocumentar={onDesdocumentar}
                                                    onDescartar={onDescartar}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Nada se tira: lo descartado se puede recuperar. */}
                        {resumen.descartadas > 0 && (
                            <button
                                type="button"
                                data-accion="recuperar"
                                onClick={onRecuperar}
                                className="w-full rounded-xl border border-ink-700/70 px-3 py-2 text-[11px] text-slate-400 transition-colors hover:border-ink-500 hover:text-slate-200"
                            >
                                {resumen.descartadas} descartada(s) · recuperar
                            </button>
                        )}
                    </div>
                )}

                {/* Historial */}
                {historial.length > 0 && (
                    <div className="border-t border-ink-700/60 p-4">
                        <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Lo último que se desplegó
                        </div>
                        <ul className="space-y-1">
                            {historial.slice(0, 4).map((entrada) => (
                                <li
                                    key={entrada.at}
                                    className="truncate rounded-lg px-2 py-1.5 text-[11px] text-slate-400"
                                    title={entrada.prompt}
                                >
                                    {entrada.prompt}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Catálogo */}
                <div className="border-t border-ink-700/60 p-4">
                    <div className="mb-2 flex items-baseline justify-between">
                        <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            El grafo
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{catalogo.length}</span>
                    </div>
                    <div className="space-y-1.5">
                        {piezas.map(({ subject, count }) => {
                            const info = subjectOf({ tipo: subject, subject })
                            return (
                                <div key={subject} className="flex items-center gap-2">
                                    <span
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ backgroundColor: info.color }}
                                    />
                                    <span className="flex-1 text-[11.5px] text-slate-400">
                                        {info.label}
                                    </span>
                                    <span className="font-mono text-[10.5px] text-slate-500">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Metrica etiqueta="Min. juego" valor={totalMinutes(catalogo)} />
                        <Metrica etiqueta="Añadidas" valor={generadas.length} acento />
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onAbrirAjustes}
                className="mt-auto flex w-full items-center justify-between border-t border-ink-700/70 bg-ink-850/50 px-4 py-2.5 text-left transition-colors hover:bg-ink-800/70"
            >
                <span className="text-[11px] text-slate-300">
                    Motor: <span className="font-semibold text-aura-cyan">{clasificador.label}</span>
                </span>
                <span className="text-[10px] text-slate-500">Ajustes</span>
            </button>
        </aside>
    )
}

function TarjetaOpcion({
    opcion,
    tieneGrafo,
    activo,
    onVerGrafo,
    onDocumentar,
    onDesdocumentar,
    onDescartar,
}) {
    const clase = claseOf(opcion.clase)
    const estado = ESTADOS[opcion.estado] || ESTADOS.por_verificar
    const [abierta, setAbierta] = useState(false)
    const [fuente, setFuente] = useState('')
    const [aviso, setAviso] = useState(null)
    const documentada = opcion.estado === 'documentado'

    const guardarFuente = () => {
        const r = onDocumentar?.(opcion.id, fuente)
        if (!r?.ok) {
            setAviso(r?.motivo || 'No se pudo documentar.')
            return
        }
        setAviso(null)
        setFuente('')
    }

    return (
        <div
            data-opcion={opcion.id}
            className={`rounded-xl border px-3 py-2 transition-colors ${
                activo ? 'border-aura-cyan/60 bg-aura-cyan/5' : 'border-ink-700/60 bg-ink-850/40'
            }`}
        >
            <button
                type="button"
                onClick={() => setAbierta((v) => !v)}
                className="w-full text-left"
                title={abierta ? 'Contraer' : 'Ver el detalle'}
            >
                <span className="flex items-center gap-1.5">
                    <span style={{ color: clase.color }}>{clase.glyph}</span>
                    <span className="min-w-0 flex-1 truncate font-display text-[12px] font-semibold text-slate-100">
                        {opcion.titulo}
                    </span>
                    <span
                        className="shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-semibold"
                        style={{ color: estado.color, backgroundColor: `${estado.color}1f` }}
                    >
                        {estado.label}
                    </span>
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-500">
                    {clase.label}
                    {opcion.ubicacion ? ` · ${opcion.ubicacion}` : ''}
                    {opcion.fuente ? ` · fuente: ${opcion.fuente}` : ''}
                </span>
            </button>

            {abierta && (
                <div className="mt-2 space-y-1.5 border-t border-ink-700/50 pt-2">
                    <p className="text-[11px] leading-relaxed text-slate-300">{opcion.detalle}</p>
                    {opcion.juego && (
                        <p className="text-[10.5px] leading-relaxed text-aura-violet">
                            Juego lingüístico: {opcion.juego}
                        </p>
                    )}
                    <p className="text-[10px] leading-relaxed text-slate-500">{estado.detalle}</p>

                    {/* La señal que ahorra trabajo: ¿esta fuente se puede
                        comprobar o es un recuerdo del modelo? */}
                    {opcion.ejemplo && (
                        <p className="text-[10.5px] leading-relaxed text-aura-violet">
                            ◇ EJEMPLO del §4, escrito por el agente. NO viene del motor: es material de
                            muestra para ver el panel.
                        </p>
                    )}
                    {opcion.fuenteConsultada && (
                        <p className="text-[10.5px] leading-relaxed text-aura-mint">
                            ✓ Fuente consultada de verdad. Solo falta tu visto bueno.
                        </p>
                    )}
                    {opcion.fuenteSospechosa && (
                        <p className="text-[10.5px] leading-relaxed text-aura-amber">
                            ⚠ {opcion.motivoDegradado}. No pierdas el tiempo verificándola.
                        </p>
                    )}

                    {/* LA VERIFICACIÓN A MANO: la IA propone, el diseñador confirma. */}
                    <div className="border-t border-ink-700/50 pt-2">
                        {opcion.estado === 'inventado' ? (
                            // A algo NUESTRO no se le puede pedir una fuente: no la
                            // tiene por definicion. Pedirla empujaba a rellenar la
                            // caja con cualquier cosa.
                            <p className="text-[10.5px] leading-relaxed text-aura-violet">
                                Es nuestro: <span className="text-slate-200">la parte inventada</span>. No se
                                documenta, y no es un defecto — así funciona el apócrifo convincente. Lo que
                                tiene que ser <span className="text-slate-200">googleable</span> es la base
                                real sobre la que se apoya.
                            </p>
                        ) : documentada ? (
                            <div className="space-y-1.5">
                                <p className="text-[10.5px] leading-relaxed text-aura-mint">
                                    Documentada · fuente: {opcion.fuente}
                                </p>
                                <button
                                    type="button"
                                    data-accion="desdocumentar"
                                    onClick={() => onDesdocumentar?.(opcion.id)}
                                    className="w-full rounded-lg border border-ink-700 px-2 py-1 text-[10.5px] text-slate-400 transition-colors hover:border-ink-500 hover:text-slate-200"
                                >
                                    Quitar la fuente y volver a «por verificar»
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <input
                                    type="text"
                                    id={`fuente-${opcion.id}`}
                                    data-fuente={opcion.id}
                                    value={fuente}
                                    onChange={(e) => {
                                        setFuente(e.target.value)
                                        setAviso(null)
                                    }}
                                    placeholder="¿De dónde sale? Libro, archivo, placa, web con autoría…"
                                    className="w-full rounded-lg border border-aura-mint/40 bg-ink-950/70 px-2 py-1.5 text-[11px] text-slate-100 placeholder:text-slate-500 focus:border-aura-mint/70 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    data-accion="documentar"
                                    onClick={guardarFuente}
                                    disabled={!fuente.trim()}
                                    className="w-full rounded-lg border border-aura-mint/50 bg-aura-mint/10 px-2 py-1.5 font-display text-[11px] font-semibold text-aura-mint transition-colors hover:bg-aura-mint/20 disabled:cursor-not-allowed disabled:border-ink-700 disabled:bg-transparent disabled:text-slate-500"
                                >
                                    Darla por documentada
                                </button>
                            </div>
                        )}
                        {aviso && (
                            <p className="mt-1.5 text-[10.5px] leading-relaxed text-aura-amber">
                                {aviso}
                            </p>
                        )}
                    </div>

                    {onVerGrafo && opcion.clase === 'anclaje' && (
                        <button
                            type="button"
                            data-ver-grafo={opcion.id}
                            onClick={onVerGrafo}
                            disabled={!tieneGrafo}
                            className="w-full rounded-lg border border-aura-cyan/50 bg-aura-cyan/10 px-2 py-1.5 font-display text-[11px] font-semibold text-aura-cyan transition-colors hover:bg-aura-cyan/20 disabled:cursor-not-allowed disabled:border-ink-700 disabled:bg-transparent disabled:text-slate-500"
                        >
                            {tieneGrafo ? 'Ver el grafo de este anclaje' : 'Sin grafo todavía'}
                        </button>
                    )}

                    <button
                        type="button"
                        data-descartar={opcion.id}
                        onClick={() => onDescartar?.(opcion.id)}
                        className="w-full rounded-lg border border-ink-700 px-2 py-1 text-[10.5px] text-slate-500 transition-colors hover:border-aura-rose/50 hover:text-aura-rose"
                    >
                        Descartar (no se borra: se puede recuperar)
                    </button>
                </div>
            )}
        </div>
    )
}

/**
 * EL «?» DE BLENDER: un circulito que, al pasar el raton, despliega la
 * explicacion. Sin clics y sin cajas que estorben.
 *
 * Y esa explicacion NO es decorativa: es el MISMO texto que se le da al motor
 * como filtro del pilar. Lo que el disenador lee al pasar el raton es el criterio
 * con el que la IA decide que entra en cada pilar.
 */
function Ayuda({ texto }) {
    if (!texto) return null
    return (
        <span className="group relative inline-flex shrink-0" tabIndex={0}>
            <span
                data-ayuda-pilar
                className="flex h-[14px] w-[14px] cursor-help items-center justify-center rounded-full border border-ink-500 font-mono text-[9px] leading-none text-slate-400 transition-colors group-hover:border-aura-cyan group-hover:text-aura-cyan"
            >
                ?
            </span>
            <span className="pointer-events-none absolute left-0 top-[18px] z-40 hidden w-[300px] rounded-xl border border-ink-600 bg-ink-950/98 p-2.5 text-[10.5px] font-normal normal-case leading-relaxed tracking-normal text-slate-200 shadow-2xl group-hover:block group-focus-within:block">
                {texto}
            </span>
        </span>
    )
}

function Metrica({ etiqueta, valor, acento }) {
    return (
        <div className="rounded-xl border border-ink-700/60 bg-ink-850/50 px-2.5 py-2">
            <div
                className={`font-display text-sm font-semibold ${acento ? 'text-aura-violet' : 'text-slate-200'}`}
            >
                {valor}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{etiqueta}</div>
        </div>
    )
}

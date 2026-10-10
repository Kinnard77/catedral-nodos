import { useEffect, useState } from 'react'
import { PRESETS, probarMotor } from '../classifier/index.js'
import { CATALOGO_GEMINI, formatoDeClave, modeloGemini } from '../classifier/gemini.js'
const MODOS = [
    {
        id: 'auto',
        titulo: 'Automático',
        detalle: 'Usa el LLM si hay API key, JAV si hay endpoint, y si no, el motor local.',
    },
    { id: 'llm', titulo: 'LLM', detalle: 'Fuerza el modelo configurado abajo, sea compatible con OpenAI o la API nativa de Gemini.' },
    { id: 'jav', titulo: 'JAV', detalle: 'Motor institucional por HTTP. Contrato propio, aún fuera de servicio.' },
    { id: 'local', titulo: 'Local', detalle: 'Sin red: recuperación léxica y cierre de prerrequisitos.' },
]

/** Ajustes de conexión del clasificador y del progreso guardado. */
export default function SettingsSheet({
    abierto,
    onCerrar,
    settings,
    onGuardar,
    catalogo,
    generadas,
    completadas = [],
    onReiniciarProgreso,
}) {
    const [borrador, setBorrador] = useState(settings)
    const [confirmando, setConfirmando] = useState(false)
    const [prueba, setPrueba] = useState(null)
    const [probando, setProbando] = useState(false)

    // AL ABRIR la hoja, se copia lo guardado. Y SOLO al abrir.
    //
    // Antes este efecto tambien dependia de `settings`, y eso rompia la pantalla:
    // al conectar bien se guardan los ajustes, `settings` cambia, el efecto se
    // vuelve a ejecutar y **borraba el mensaje de conexion en el mismo instante
    // en que aparecia**. El usuario pulsaba Conectar, conectaba, y no veia nada.
    useEffect(() => {
        if (!abierto) return
        setBorrador(settings)
        setConfirmando(false)
        setPrueba(null)
        setProbando(false)
        // A proposito SIN `settings` en las dependencias: guardar desde aqui no
        // debe borrar el resultado de la conexion.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [abierto])

    if (!abierto) return null

    /**
     * Prueba la conexión con el borrador, no con lo guardado: así se comprueba
     * la clave antes de aplicarla.
     */
    const probar = async () => {
        setProbando(true)
        setPrueba(null)
        try {
            const r = await probarMotor(
                { llm: borrador.llm },
                { catalogoPrevio: borrador.llm.catalogo || [] },
            )

            // 429: no es un fallo de conexion. Se presenta aparte, y el texto se
            // calcula al pintar (no aqui), para que el barrido lo actualice.
            if (r.cuota) {
                setPrueba({
                    ok: false,
                    cuota: true,
                    model: r.model,
                    diagnostico: r.diagnostico,
                    modelos: r.modelos || [],
                    peticiones: r.peticiones || 0,
                })
                return
            }

            // SI LA PRUEBA SALE BIEN, SE GUARDA SOLA.
            // Antes la prueba usaba el borrador pero la investigacion usaba lo
            // guardado: pegabas la clave, salia verde, cerrabas sin guardar, y
            // la investigacion decia que faltaba la clave. Guardar al acertar
            // quita esa trampa de en medio.
            const guardado = {
                ...borrador,
                llm: {
                    ...borrador.llm,
                    model: r.model || borrador.llm.model,
                    catalogo: r.catalogo?.length ? r.catalogo : borrador.llm.catalogo || [],
                },
            }
            onGuardar(guardado)
            setBorrador(guardado)

            setPrueba({
                ok: true,
                texto: `Conectado en ${r.ms} ms · ${r.model} respondió «${String(r.respuesta || 'OK').slice(0, 90)}»`,
                fuentes: r.fuentes || [],
                modelos: r.modelos || [],
                peticiones: r.peticiones || 0,
                guardado: true,
                avisoConexion: r.avisoConexion || '',
                investigacion: r.investigacion || null,
                errorInvestigacion: r.errorInvestigacion || '',
            })
        } catch (err) {
            setPrueba({ ok: false, texto: err?.message || 'No se pudo conectar.' })
        } finally {
            setProbando(false)
        }
    }

    const aplicarPreset = (preset) => {
        setBorrador((prev) => ({
            ...prev,
            llm: {
                ...prev.llm,
                provider: preset.provider || 'compatible',
                baseUrl: preset.baseUrl,
                model: preset.model,
                // La investigación es la tarea pesada, así que arranca con el
                // modelo de razonamiento. Se puede cambiar, y la prueba de
                // conexión lo comprueba para que no falle al investigar.
                modelInvestigacion: preset.modelInvestigacion || '',
            },
        }))
        setPrueba(null)
    }

    const esGoogle = borrador.llm.provider === 'google'
    const presetActual = PRESETS.find((p) => p.id === (esGoogle ? 'google' : null))

    const guardar = () => {
        onGuardar(borrador)
        onCerrar()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/80 p-6 backdrop-blur-sm">
            <div className="panel w-full max-w-xl animate-node-in rounded-2xl p-5 shadow-2xl">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h2 className="font-display text-base font-semibold text-white">
                            Ajustes del motor
                        </h2>
                        <p className="mt-0.5 text-[11.5px] text-slate-400">
                            El motor convierte tu petición en un gameflow de nodos.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-ink-700 hover:text-white"
                    >
                        ×
                    </button>
                </div>

                {/* Modo */}
                <div className="mb-5">
                    <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Modo
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {MODOS.map((modo) => (
                            <button
                                key={modo.id}
                                type="button"
                                onClick={() => setBorrador((prev) => ({ ...prev, mode: modo.id }))}
                                className={`rounded-xl border p-2.5 text-left transition-colors ${
                                    borrador.mode === modo.id
                                        ? 'border-aura-cyan bg-aura-cyan/10'
                                        : 'border-ink-700/70 bg-ink-850/40 hover:border-ink-500'
                                }`}
                            >
                                <div
                                    className={`font-display text-[12px] font-semibold ${
                                        borrador.mode === modo.id ? 'text-aura-cyan' : 'text-slate-200'
                                    }`}
                                >
                                    {modo.titulo}
                                </div>
                                <div className="mt-0.5 text-[10.5px] leading-snug text-slate-400">
                                    {modo.detalle}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* LLM */}
                <div className="mb-5 rounded-xl border border-ink-700/60 bg-ink-850/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {esGoogle ? 'Google · API nativa' : 'Modelo (compatible con OpenAI)'}
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {PRESETS.map((preset) => {
                                const activo = esGoogle
                                    ? preset.provider === 'google'
                                    : preset.provider !== 'google' &&
                                      borrador.llm.baseUrl === preset.baseUrl
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => aplicarPreset(preset)}
                                        className={`rounded-md border px-1.5 py-0.5 text-[10px] transition-colors ${
                                            activo
                                                ? 'border-aura-cyan/60 text-aura-cyan'
                                                : 'border-ink-700/70 text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        {preset.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {esGoogle ? (
                        <div className="mb-2 rounded-lg border border-aura-cyan/40 bg-aura-cyan/5 px-3 py-2 text-[10.5px] leading-relaxed text-slate-300">
                            Se usa la <span className="text-slate-100">API nativa de Gemini</span>, no la capa
                            compatible con OpenAI. No hay Base URL que configurar: la dirección es de Google y
                            la clave viaja solo a Google.
                            <br />
                            <span className="text-aura-cyan">
                                Y esta API sí busca en Google y devuelve las fuentes que consulta.
                            </span>
                            <br />
                            <span className="text-slate-100">
                                No hay que elegir modelo: se conecta y la herramienta usa el que tu clave
                                tenga disponible.
                            </span>
                        </div>
                    ) : (
                        <Campo
                            etiqueta="Base URL"
                            valor={borrador.llm.baseUrl}
                            onChange={(v) => setBorrador((p) => ({ ...p, llm: { ...p.llm, baseUrl: v } }))}
                            placeholder="https://api.deepseek.com/v1"
                        />
                    )}
                    <Campo
                        etiqueta="API key"
                        valor={borrador.llm.apiKey}
                        onChange={(v) => setBorrador((p) => ({ ...p, llm: { ...p.llm, apiKey: v } }))}
                        placeholder="Pega aquí tu clave · Google (AIza… o AQ…) · Moonshot, DeepSeek y OpenAI (sk-…)"
                        tipo="password"
                    />
                    {esGoogle && borrador.llm.apiKey && (
                        <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                            Clave detectada: {formatoDeClave(borrador.llm.apiKey).label}. El prefijo{' '}
                            <span className="text-slate-300">no se valida</span>: valen tanto las nuevas
                            (AQ…) como las antiguas (AIza…). Manda lo que responda Google.
                        </p>
                    )}
                    {/* Los proveedores compatibles no tienen catalogo que consultar,
                        asi que ahi el nombre del modelo si hace falta. */}
                    {!esGoogle && (
                        <Campo
                            etiqueta="Modelo"
                            valor={borrador.llm.model}
                            onChange={(v) => setBorrador((p) => ({ ...p, llm: { ...p.llm, model: v } }))}
                            placeholder="kimi-k3"
                        />
                    )}
                    <p className="mt-1.5 text-[10.5px] leading-relaxed text-aura-amber">
                        La clave se guarda solo en este navegador (localStorage) y viaja directo al
                        proveedor. Para producción, apunta la Base URL a un proxy propio que guarde la clave
                        en el servidor.
                    </p>

                    {/* Probar la conexión: conectar una IA a ciegas es lo peor. */}
                    <div className="mt-3 flex items-center gap-2">
                        <button
                            type="button"
                            data-accion="probar-motor"
                            onClick={probar}
                            disabled={probando || !borrador.llm.apiKey}
                            className="rounded-xl border border-aura-cyan/50 bg-aura-cyan/10 px-3 py-2 font-display text-[12px] font-semibold text-aura-cyan transition-colors hover:bg-aura-cyan/20 disabled:cursor-not-allowed disabled:border-ink-700 disabled:bg-transparent disabled:text-slate-500"
                        >
                            {probando ? 'Conectando…' : 'Conectar'}
                        </button>
                        <span className="text-[10.5px] text-slate-500">
                            Pega la clave y pulsa. De lo demás se encarga la herramienta.
                        </span>
                    </div>

                    {prueba && (
                        <div
                            data-resultado-prueba={
                                prueba.ok ? 'ok' : prueba.cuota ? 'cuota' : 'error'
                            }
                            className={`mt-2 rounded-xl border px-3 py-2 text-[11.5px] leading-relaxed ${
                                prueba.ok
                                    ? 'border-aura-mint/50 bg-aura-mint/10 text-aura-mint'
                                    : prueba.cuota
                                      ? 'border-aura-amber/50 bg-aura-amber/10 text-aura-amber'
                                      : 'border-aura-rose/50 bg-aura-rose/10 text-aura-rose'
                            }`}
                        >
                            {prueba.cuota && (
                                <div className="mb-1 font-semibold">
                                    Google ha rechazado la petición. Esto es lo comprobado, sin
                                    interpretar:
                                </div>
                            )}
                            {prueba.ok && (
                                <div className="mb-1 font-semibold">
                                    ✓ Conectado. El motor responde.
                                </div>
                            )}
                            <div>{prueba.texto || (prueba.cuota ? textoDeCuota(prueba) : '')}</div>
                            {prueba.guardado && (
                                <div className="mt-1 text-[10.5px] opacity-80">
                                    {prueba.avisoConexion
                                        ? `${prueba.avisoConexion} Ajustes guardados: ya puedes investigar.`
                                        : 'Ajustes guardados: ya puedes investigar sin volver aquí.'}
                                </div>
                            )}
                            {/* LO QUE DEVOLVIÓ GOOGLE, TAL CUAL. Sin esto, la
                                herramienta resume lo que no entiende — y ahi es
                                donde se inventan las conclusiones. */}
                            {prueba.cuota && prueba.diagnostico?.crudo && (
                                <details className="mt-2 border-t border-current/20 pt-1.5">
                                    <summary className="cursor-pointer text-[10.5px] opacity-80">
                                        Ver lo que devolvió Google, tal cual
                                    </summary>
                                    <pre className="mt-1 max-h-44 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-ink-950/70 p-2 font-mono text-[10px] leading-relaxed text-slate-300">
                                        {prueba.diagnostico.crudo}
                                    </pre>
                                </details>
                            )}
                            {/* El barrido de modelos por modelos YA NO SE
                                OFRECE: seis peticiones seguidas contra un limite
                                de cinco por minuto es la mejor forma de
                                provocarse uno mismo el `too_many_requests` que
                                se intentaba diagnosticar. */}
                            {/* Si el barrido encontró modelos que SÍ responden, que
                                se puedan usar ya: el diagnóstico es el arreglo. */}
                            {prueba.diagnostico?.responden?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5 border-t border-current/20 pt-2">
                                    {prueba.diagnostico.responden.map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            data-usar-modelo={m}
                                            onClick={() => {
                                                setBorrador((p) => ({
                                                    ...p,
                                                    llm: { ...p.llm, model: m },
                                                }))
                                                setPrueba(null)
                                            }}
                                            className="rounded-lg border border-aura-amber/60 bg-aura-amber/10 px-2 py-1 font-mono text-[10.5px] text-aura-amber transition-colors hover:bg-aura-amber/20"
                                        >
                                            Usar {m}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {prueba.fuentes?.length > 0 && (
                                <div className="mt-1.5 border-t border-current/20 pt-1.5">
                                    <div className="font-semibold">
                                        Buscó en Google y consultó {prueba.fuentes.length} fuente(s):
                                    </div>
                                    <ul className="mt-0.5 space-y-0.5">
                                        {prueba.fuentes.slice(0, 4).map((f) => (
                                            <li key={f.uri} className="truncate">
                                                {f.titulo || f.uri}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {prueba.modelos?.length > 0 && (
                                <div className="mt-1.5 border-t border-current/20 pt-1.5">
                                    Tu clave puede invocar <b>{prueba.modelos.length}</b> modelo(s) de
                                    conversación. Ya están sugeridos arriba.
                                </div>
                            )}
                            {prueba.investigacion && (
                                <div className="mt-1.5 border-t border-current/20 pt-1.5">
                                    El modelo de investigación <b>{prueba.investigacion.model}</b> también
                                    responde ({prueba.investigacion.ms} ms,{' '}
                                    {prueba.investigacion.fuentes.length} fuente(s)).
                                </div>
                            )}
                            {prueba.errorInvestigacion && (
                                <div className="mt-1.5 border-t border-current/20 pt-1.5 font-semibold">
                                    Pero el modelo de investigación falló — {prueba.errorInvestigacion}.
                                </div>
                            )}
                        </div>
                    )}

                    {/* DESPUES DE CONECTAR, y solo si apetece: cambiar de modelo.
                        Antes de conectar no se elige nada; la herramienta resuelve
                        sola cual usar. */}
                    {esGoogle && prueba?.ok && (
                        <div className="mt-3 rounded-xl border border-ink-700/60 bg-ink-850/30 p-3">
                            <SelectorModelo
                                id="modelo-general"
                                etiqueta="Modelo en uso (opcional)"
                                valor={borrador.llm.model}
                                onChange={(v) => setBorrador((p) => ({ ...p, llm: { ...p.llm, model: v } }))}
                                descubiertos={prueba?.modelos || []}
                                ayuda="Elegido por la herramienta entre los que puede usar tu clave."
                            />
                            <label className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="buscar-web"
                                    checked={borrador.llm.buscarWeb !== false}
                                    onChange={(e) =>
                                        setBorrador((p) => ({
                                            ...p,
                                            llm: { ...p.llm, buscarWeb: e.target.checked },
                                        }))
                                    }
                                    className="mt-0.5 accent-aura-cyan"
                                />
                                <span className="text-[11px] leading-relaxed text-slate-300">
                                    Buscar en Google al investigar
                                    <span className="mt-0.5 block text-[10.5px] text-slate-500">
                                        Si lo apagas, la investigación sale de la memoria del modelo:
                                        candidatos que verificas tú.
                                    </span>
                                </span>
                            </label>
                        </div>
                    )}

                    <p className="mt-2 text-[10.5px] leading-relaxed text-slate-500">
                        {esGoogle ? (
                            <>
                                Con la API nativa, la investigación <span className="text-slate-300">busca en
                                Google y cita lo que encuentra</span>. Una fuente que no esté entre las
                                consultadas se rechaza: eso es lo que separa un dato de una invención.
                            </>
                        ) : (
                            <>
                                Este endpoint compatible con OpenAI{' '}
                                <span className="text-slate-300">no navega</span>: el modelo recuerda, no
                                consulta. Para que la investigación traiga fuentes reales, usa{' '}
                                <span className="text-slate-300">Google AI Studio</span> con su API nativa.
                            </>
                        )}
                    </p>
                </div>

                {/* JAV */}
                <div className="mb-5 rounded-xl border border-ink-700/60 bg-ink-850/30 p-3">
                    <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        JAV (motor institucional)
                    </div>
                    <Campo
                        etiqueta="Endpoint"
                        valor={borrador.jav.endpoint}
                        onChange={(v) => setBorrador((p) => ({ ...p, jav: { ...p.jav, endpoint: v } }))}
                        placeholder="https://…/classify"
                    />
                    <Campo
                        etiqueta="Token"
                        valor={borrador.jav.apiKey}
                        onChange={(v) => setBorrador((p) => ({ ...p, jav: { ...p.jav, apiKey: v } }))}
                        placeholder="opcional"
                        tipo="password"
                    />
                    <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">
                        Contrato esperado: POST con {'{ prompt, catalogo, contexto }'} y respuesta con la misma
                        forma de gameflow que devuelve el LLM (title, steps, newLessons).
                    </p>
                </div>

                {/* Estado */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                    <Dato etiqueta="Nodos" valor={catalogo.length} />
                    <Dato etiqueta="Generadas" valor={generadas.length} acento />
                    <Dato etiqueta="Definidas" valor={completadas.length} />
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-ink-700/60 pt-4">
                    {confirmando ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[11.5px] text-aura-rose">
                                ¿Borrar progreso, nodos generados y ajustes?
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    onReiniciarProgreso()
                                    onCerrar()
                                }}
                                className="rounded-lg bg-aura-rose/20 px-3 py-1.5 text-[11.5px] font-semibold text-aura-rose transition-colors hover:bg-aura-rose/30"
                            >
                                Sí, borrar
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmando(false)}
                                className="text-[11.5px] text-slate-400 hover:text-slate-200"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmando(true)}
                            className="text-[11.5px] text-slate-500 transition-colors hover:text-aura-rose"
                        >
                            Reiniciar progreso
                        </button>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="rounded-xl border border-ink-600 px-3 py-2 text-[12px] text-slate-300 transition-colors hover:border-ink-400 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={guardar}
                            className="rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-4 py-2 font-display text-[12.5px] font-semibold text-ink-950 transition-opacity hover:opacity-90"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Campo({ etiqueta, valor, onChange, placeholder, tipo = 'text' }) {
    return (
        <label className="mb-2 block">
            <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-slate-500">{etiqueta}</span>
            <input
                type={tipo}
                value={valor || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                spellCheck={false}
                autoComplete="off"
                className="w-full rounded-lg border border-ink-700 bg-ink-950/70 px-2.5 py-1.5 font-mono text-[11.5px] text-slate-100 placeholder:text-slate-600 focus:border-aura-cyan/70 focus:outline-none"
            />
        </label>
    )
}

/**
 * Selector de modelo de Gemini.
 *
 * Es un campo de texto CON SUGERENCIAS (`datalist`) y no un desplegable cerrado,
 * porque el catalogo de modelos cambia cada pocos meses: si Google saca uno
 * nuevo, se escribe y funciona sin tocar el codigo.
 *
 * Y avisa de los que no sirven para conversar, antes de que Google devuelva un
 * error incomprensible.
 */
function SelectorModelo({ id, etiqueta, valor, onChange, permitirVacio, ayuda, descubiertos = [] }) {
    const lista = `${id}-catalogo`
    const actual = modeloGemini(valor)
    const noConversa = actual && !actual.chat

    // Los modelos que Google dice que ESTA clave puede invocar van primero: son
    // los unicos de los que tenemos constancia real.
    const opciones = [
        ...descubiertos.map((m) => ({ id: m, para: modeloGemini(m)?.para || 'modelo de tu clave' })),
        ...CATALOGO_GEMINI.filter((m) => !descubiertos.includes(m.id)),
    ]

    return (
        <div className="mb-2">
            <label
                htmlFor={id}
                className="mb-1 block text-[10.5px] uppercase tracking-wider text-slate-500"
            >
                {etiqueta}
            </label>
            <input
                id={id}
                list={lista}
                value={valor || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={permitirVacio ? 'vacío = el mismo que el general, con más razonamiento' : 'gemini-3.8-flash'}
                spellCheck={false}
                autoComplete="off"
                className="w-full rounded-lg border border-ink-700 bg-ink-950/70 px-2.5 py-1.5 font-mono text-[11.5px] text-slate-100 placeholder:text-slate-600 focus:border-aura-cyan/70 focus:outline-none"
            />
            <datalist id={lista}>
                {opciones.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.para}
                    </option>
                ))}
            </datalist>
            {noConversa ? (
                <p className="mt-1 text-[10.5px] leading-relaxed text-aura-amber">{actual.para}</p>
            ) : (
                <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                    {actual ? actual.para : ayuda}
                </p>
            )}
        </div>
    )
}

/**
 * Explica un 429 SIN INVENTAR NADA.
 *
 * Regla que salio de un error mio: primero LO OBSERVADO —lo que Google
 * respondio, con su motivo tal cual— y solo despues la interpretacion, y solo
 * si el motivo que da Google permite distinguir. Si no lo permite, se dice que
 * no se sabe, en vez de rellenar el hueco con una conclusion propia.
 */
function textoDeCuota(r) {
    const quien = r.model
    const d = r.diagnostico || {}
    const codigo = d.codigo || 429
    const cola = d.retryAfter ? ` Google pide esperar ${d.retryAfter} s.` : ''

    // LO QUE DIJO GOOGLE, con su nombre y sin adjetivos mios.
    const dicho = d.motivo
        ? `Google dio este motivo: «${d.motivo}».`
        : d.statusGoogle
          ? `Google devolvió el status «${d.statusGoogle}», que es genérico: no distingue ritmo de cuota.`
          : 'Google no dio ningún motivo legible, así que no se interpreta: abajo está su respuesta tal cual.'

    if (d.tipoLimite === 'capacidad') {
        return `«${quien}» no respondió (${codigo}). ${dicho} Eso es CAPACIDAD de Google, no tu cuenta: ese modelo está saturado ahora mismo y suele ser pasajero.`
    }
    if (d.tipoLimite === 'ritmo') {
        return `«${quien}» no respondió (${codigo}). ${dicho} Eso es un LÍMITE DE RITMO, no una cuota agotada, y lo más probable es que lo haya tocado esta prueba: pedía varias cosas seguidas y el plan gratuito da 5 peticiones por minuto.${cola} Espera un minuto y pulsa Conectar UNA vez.`
    }
    if (d.tipoLimite === 'cuota') {
        return `«${quien}» no respondió (${codigo}). ${dicho} Eso es cuota del plan.${cola}`
    }
    if (d.estado === 'otros_modelos') {
        return `«${quien}» no responde (${codigo}). ${dicho} Estos modelos SÍ responden: ${(d.responden || []).join(', ')}.`
    }
    return `«${quien}» no respondió (${codigo}). ${dicho} La conexión y la clave están bien: esto es un límite, no configuración.${cola}`
}

function Dato({ etiqueta, valor, acento }) {
    return (
        <div className="rounded-xl border border-ink-700/60 bg-ink-850/40 px-2.5 py-2">
            <div className={`font-display text-sm font-semibold ${acento ? 'text-aura-violet' : 'text-slate-200'}`}>
                {valor}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{etiqueta}</div>
        </div>
    )
}

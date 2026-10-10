import { createLocalProvider } from './localProvider.js'
import { buildCatalogMessage, callChatCompletions, extractJson, parseRouteResponse, soportaJsonMode, SYSTEM_PROMPT } from './llmProvider.js'
import { CATALOGO_GEMINI, NIVEL_RAZONAMIENTO, listarModelos, normalizarModeloId } from './gemini.js'
import { probarInteraccion } from './interacciones.js'
import { aplicarEnlaces, indexById, mergeLessons, SEED_LESSONS } from '../data/catalog.js'
import { normalizeLesson } from '../domain/lesson.js'
import { emptyRoute, retrieveLessons } from './contract.js'

export const DEFAULT_LLM = {
    provider: 'compatible',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    /**
     * Buscar en Google al investigar.
     */
    buscarWeb: true,
}

/**
 * Proveedores disponibles.
 *
 * `provider` distingue los que hablan el protocolo compatible con OpenAI de los
 * que tienen API propia. Google va por la NATIVA, no por su capa compatible:
 * asi la URL es inequivocamente de Google y, sobre todo, se tiene acceso a la
 * busqueda con fuentes.
 */
export const PRESETS = [
    {
        id: 'google',
        label: 'Google AI Studio',
        provider: 'google',
        baseUrl: '',
        model: 'gemini-3.8-flash',
        nota: 'API NATIVA de Gemini. La clave se saca en aistudio.google.com. El formato cambió: las nuevas empiezan por AQ… y las antiguas por AIza…; valen las dos. La clave NO está atada a un modelo: da acceso a todo el catálogo, y la herramienta elige el que tu clave tenga disponible. Sabe buscar en Google y devuelve las fuentes que consulta.',
    },
    {
        id: 'moonshot',
        label: 'Moonshot · Kimi K3',
        provider: 'compatible',
        baseUrl: 'https://api.moonshot.ai/v1',
        model: 'kimi-k3',
        nota: 'Moonshot AI, compatible con OpenAI. Su plataforma tambien ofrece busqueda web como herramienta aparte.',
    },
    { id: 'deepseek', label: 'DeepSeek', provider: 'compatible', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
    { id: 'openai', label: 'OpenAI', provider: 'compatible', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
    { id: 'together', label: 'Together', provider: 'compatible', baseUrl: 'https://api.together.xyz/v1', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
    { id: 'ollama', label: 'Ollama local', provider: 'compatible', baseUrl: 'http://localhost:11434/v1', model: 'llama3.1' },
]

/**
 * QUE MODELO USAR, DECIDIDO POR LA HERRAMIENTA.
 *
 * El disenador no tiene por que elegir modelo antes de conectar: la clave da
 * acceso al catalogo, asi que se ordena por preferencia y se prueba. Se prefiere
 * `flash` (equilibrado), luego `lite` (ligero) y se dejan para el final las
 * vistas previas, que son las que mas se rompen.
 *
 * Si el usuario ya tenia uno escrito, ese va primero: su eleccion manda.
 */
export function candidatosDe(catalogo = [], preferido = '') {
    const chats = catalogo.filter((m) => m.chat).map((m) => m.id)
    const peso = (id) => (/flash/.test(id) ? 0 : 1) + (/lite/.test(id) ? 1 : 0) + (/preview/.test(id) ? 2 : 0)
    const ordenados = [...chats].sort((a, b) => peso(a) - peso(b) || a.localeCompare(b))
    const elegido = normalizarModeloId(preferido)
    return [...new Set([...(elegido ? [elegido] : []), ...ordenados])]
}

/**
 * LEER EL LIMITE DEL ERROR QUE YA TENEMOS. SIN HACER NI UNA PETICION.
 *
 * Antes esta funcion comprobaba el modelo sin busqueda y barria otros seis, para
 * «averiguar» que se habia agotado. Eso eran hasta siete peticiones mas contra
 * un limite de cinco por minuto: **el diagnostico causaba el problema que
 * diagnosticaba.** Y Google ya dice en el error de que va: `too_many_requests`.
 */
export function diagnosticarCuota({ error } = {}) {
    return {
        codigo: error?.codigo || 0,
        motivo: error?.motivo || '',
        tipoLimite: error?.tipoLimite || 'desconocido',
        statusGoogle: error?.statusGoogle || '',
        retryAfter: error?.retryAfter || '',
        // EL CUERPO CRUDO. Si no sabemos leer el error, el usuario tiene que
        // poder leerlo él: esconder la evidencia y sustituirla por un resumen es
        // exactamente el fallo que se cometio antes.
        crudo: error?.detalle || '',
        estado: 'del_error',
        responden: [],
        candidatos: [],
        peticiones: 0,
        barridoHecho: false,
        pruebas: [],
    }
}

/**
 * EL BARRIDO, A PETICION Y CON EL PRECIO A LA VISTA.
 *
 * Se ofrece como boton aparte porque gasta una peticion por modelo, y en el plan
 * gratuito eso es cuota diaria, no un detalle.
 */
export async function buscarModeloQueResponda({ apiKey, candidatos = [], signal }) {
    const lista = candidatos.slice(0, 6)
    const responden = []
    const pruebas = []

    for (const modelo of lista) {
        try {
            await probarInteraccion({ apiKey, model: modelo, buscar: false, thinkingLevel: 'low', signal })
            responden.push(modelo)
        } catch (err) {
            pruebas.push(`${modelo}: ${err?.motivo || ''} ${err?.message || 'no respondió'}`.trim())
        }
    }

    return { responden, pruebas, peticiones: lista.length }
}

/**
 * PRUEBA DE CONEXION.
 *
 * Un unico mensaje minimo para comprobar que la clave, la URL y el modelo
 * funcionan. Existe porque conectar una IA a ciegas es lo peor: si algo falla,
 * el error tiene que salir aqui y no tres pantallas mas adelante.
 *
 * Con Google ademas pide una BUSQUEDA, asi que la prueba dice dos cosas: si la
 * clave vale y si la busqueda con fuentes funciona.
 */
export async function probarMotor(settings = {}, { signal, catalogoPrevio = [] } = {}) {
    const {
        provider = 'compatible',
        baseUrl = DEFAULT_LLM.baseUrl,
        apiKey = '',
        model = '',
    } = settings.llm || {}
    if (!apiKey) throw new Error('Falta la API key. Pégala y pulsa Conectar.')

    if (provider === 'google') {
        // CONECTAR = **UNA** PETICION.
        //
        // Aqui estaba el problema de verdad, y era mio. Esta funcion hacia hasta
        // cinco peticiones en rafaga: el listado de modelos, tres intentos con
        // modelos distintos y una comprobacion de diagnostico. Contra un limite
        // de 5 por minuto, eso ES el `too_many_requests` que devolvia Google.
        // La herramienta se frenaba a si misma y luego le echaba la culpa al
        // plan del usuario.
        //
        // Ahora: el catalogo solo si no esta ya (y si falla, no pasa nada), y UN
        // unico intento, sin buscador, que es la peticion mas barata posible.
        let catalogo = Array.isArray(catalogoPrevio) ? catalogoPrevio : []
        let peticiones = 0
        try {
            if (!catalogo.length) {
                catalogo = await listarModelos({ apiKey, signal })
                peticiones += 1
            }
        } catch {
            /* sin catalogo se prueba con el modelo que haya: no es un requisito */
        }

        const candidatos = candidatosDe(catalogo, model)
        const elegido = candidatos[0] || normalizarModeloId(model)
        const disponibles = catalogo.filter((m) => m.chat).map((m) => m.id)
        if (!elegido) throw new Error('No hay ningún modelo que probar. Revisa la clave.')

        try {
            const r = await probarInteraccion({
                apiKey,
                model: elegido,
                buscar: false,
                thinkingLevel: NIVEL_RAZONAMIENTO.general,
                signal,
            })
            return {
                ok: true,
                ms: r.ms,
                model: elegido,
                respuesta: String(r.content || '').trim().slice(0, 200),
                buscar: false,
                fuentes: [],
                consultas: [],
                usage: r.usage,
                modelos: disponibles,
                catalogo,
                peticiones: peticiones + 1,
            }
        } catch (err) {
            // 429 = limite de ritmo: insistir con OTRO modelo lo empeora, porque
            // el limite es de la cuenta. Aqui se para.
            if (err?.codigo === 429 || /too_many_requests/i.test(err?.motivo || '')) {
                // SIN peticiones de diagnostico: se lee del error que ya tenemos.
                return {
                    ok: false,
                    cuota: true,
                    model: elegido,
                    modelos: disponibles,
                    catalogo,
                    peticiones: peticiones + 1,
                    diagnostico: diagnosticarCuota({ error: err }),
                }
            }

            // 503 (saturado) o 404 (no existe) NO son culpa de la cuenta, y ahi
            // cambiar de modelo SI arregla las cosas. Se prueba UNO mas.
            const alternativa = candidatos[1]
            if (alternativa && [503, 404, 500].includes(err?.codigo)) {
                try {
                    const r = await probarInteraccion({
                        apiKey,
                        model: alternativa,
                        buscar: false,
                        thinkingLevel: NIVEL_RAZONAMIENTO.general,
                        signal,
                    })
                    return {
                        ok: true,
                        ms: r.ms,
                        model: alternativa,
                        respuesta: String(r.content || '').trim().slice(0, 200),
                        buscar: false,
                        fuentes: [],
                        consultas: [],
                        usage: r.usage,
                        modelos: disponibles,
                        catalogo,
                        peticiones: peticiones + 2,
                        sustituto: true,
                        avisoConexion: `«${elegido}» no respondió (${err?.motivo || err?.codigo}). Conectado con «${alternativa}».`,
                    }
                } catch (segundo) {
                    // Si el segundo tambien falla por LIMITE, es de la cuenta.
                    if (segundo?.codigo === 429 || /too_many_requests/i.test(segundo?.motivo || '')) {
                        return {
                            ok: false,
                            cuota: true,
                            model: alternativa,
                            modelos: disponibles,
                            catalogo,
                            peticiones: peticiones + 2,
                            diagnostico: diagnosticarCuota({ error: segundo }),
                        }
                    }
                    // Si no, se cuentan LOS DOS errores tal cual los dio Google.
                    throw new Error(
                        `${err?.message || 'No se pudo conectar'} (y «${alternativa}»: ${
                            segundo?.message || 'tampoco respondió'
                        }).${
                            disponibles.length
                                ? ` Modelos que puede usar tu clave: ${disponibles.slice(0, 14).join(', ')}.`
                                : ''
                        }`,
                    )
                }
            }
            throw new Error(
                `${err?.message || 'No se pudo conectar con Google'}.${
                    disponibles.length
                        ? ` Modelos que puede usar tu clave: ${disponibles.slice(0, 14).join(', ')}.`
                        : ''
                }`,
            )
        }
    }

    if (!model) throw new Error('Falta el nombre del modelo.')

    const inicio = Date.now()
    const { content, usage } = await callChatCompletions({
        baseUrl,
        apiKey,
        model,
        messages: [
            { role: 'system', content: 'Responde unicamente con la palabra OK.' },
            { role: 'user', content: 'Di OK.' },
        ],
        temperature: 0,
        maxTokens: 16,
        // Sin modo JSON: asi la prueba no falla por un campo opcional que el
        // proveedor no acepte.
        jsonMode: false,
        signal,
    })

    return {
        ok: true,
        ms: Date.now() - inicio,
        model,
        respuesta: String(content || '').trim().slice(0, 80),
        buscar: false,
        fuentes: [],
        usage,
    }
}

/**
 * Cuantas fichas de catalogo se envian al modelo.
 * Con cientos de lecciones, la recuperacion previa evita mandar todo el catalogo.
 */
const MAX_CARDS = 40
const MAX_CARDS_CON_RECUPERACION = 28

/**
 * Envoltorio del proveedor LLM. Hace tres cosas que el proveedor no debe conocer:
 * 1. Recorta el catalogo (recuperacion lexical) para no reventar el contexto.
 * 2. Inyecta prerequisitos de las lecciones recuperadas como contexto extra.
 * 3. Sanea la respuesta contra el catalogo real.
 */
export function createLlmProvider(settings) {
    const { baseUrl = DEFAULT_LLM.baseUrl, apiKey = '', model = DEFAULT_LLM.model } = settings || {}

    return {
        id: 'llm',
        label: `LLM compatible (${model})`,
        async classify(prompt, lessons, index, options = {}) {
            const contexto = buildContext(prompt, lessons, index, options)

            const messages = [
                { role: 'system', content: options.systemPrompt || SYSTEM_PROMPT },
                { role: 'user', content: buildCatalogMessage(prompt, contexto.lecciones, options) },
            ]

            const { content, usage } = await callChatCompletions({
                baseUrl,
                apiKey,
                model,
                messages,
                jsonMode: soportaJsonMode(baseUrl),
                signal: options.signal,
            })

            const parsed = parseRouteResponse(extractJson(content), prompt, index)
            return {
                ...parsed,
                generatedBy: model,
                usage,
                catalogSize: contexto.lecciones.length,
                totalCatalogSize: lessons.length,
            }
        },
    }
}

/**
 * Elige que fichas de catalogo entran al prompt.
 * Poco catalogo -> todo. Mucho catalogo -> recuperacion + prerequisitos.
 */
export function buildContext(prompt, lessons, index, options = {}) {
    const visibles = (options.visibles || []).filter((id) => index.has(id))
    const completadas = (options.completadas || []).filter((id) => index.has(id))

    if (lessons.length <= MAX_CARDS) {
        return { lecciones: lessons, visibles, completadas }
    }

    const recuperadas = retrieveLessons(prompt, lessons, { top: MAX_CARDS_CON_RECUPERACION })
    const seleccion = new Map()
    for (const { lesson } of recuperadas) {
        for (const pre of lesson.prereq) {
            const l = index.get(pre)
            if (l) seleccion.set(l.id, l)
        }
        seleccion.set(lesson.id, lesson)
    }
    for (const id of [...completadas, ...visibles]) seleccion.set(id, index.get(id))

    return { lecciones: [...seleccion.values()], visibles, completadas }
}

/**
 * Cliente para un clasificador remoto propio (el futuro JAV).
 * Contrato: POST { endpoint } con { prompt, catalogo, contexto } -> misma forma de ruta.
 */
export function createRemoteProvider(settings) {
    const { endpoint = '', apiKey = '' } = settings || {}

    return {
        id: 'jav',
        label: 'JAV (clasificador institucional)',
        async classify(prompt, lessons, index, options = {}) {
            if (!endpoint) {
                throw new Error('Falta la URL del servicio JAV en Ajustes.')
            }
            const headers = { 'Content-Type': 'application/json' }
            if (apiKey) headers.Authorization = `Bearer ${apiKey}`

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                signal: options.signal,
                body: JSON.stringify({
                    prompt,
                    catalogo: lessons.map((l) => ({ id: l.id, title: l.title, subject: l.subject, level: l.level, summary: l.summary, tags: l.tags, prereq: l.prereq, unlocks: l.unlocks })),
                    contexto: { visibles: options.visibles || [], completadas: options.completadas || [] },
                }),
            })

            if (!response.ok) {
                throw new Error(`JAV respondio ${response.status}.`)
            }
            const data = await response.json()
            const payload = data?.route || data?.ruta || data
            return { ...parseRouteResponse(payload, prompt, index), generatedBy: 'JAV' }
        },
    }
}

/**
 * Fachada unica del clasificador. La UI solo conoce `classify` y `describe`.
 * `mode`:
 *  - auto   -> usa LLM si hay apiKey, JAV si hay endpoint, si no local
 *  - llm    -> fuerza LLM (falla visible si no hay key)
 *  - jav    -> fuerza clasificador remoto
 *  - local  -> sin red
 */
export function createClassifier(settings = {}) {
    const mode = settings.mode || 'auto'
    const local = createLocalProvider()
    const remoto = createRemoteProvider(settings.jav || {})
    const llm = createLlmProvider(settings.llm || {})

    const tieneLlm = Boolean((settings.llm || {}).apiKey)
    const tieneJav = Boolean((settings.jav || {}).endpoint)

    const elegido =
        mode === 'local'
            ? local
            : mode === 'llm'
              ? llm
              : mode === 'jav'
                ? remoto
                : tieneLlm
                  ? llm
                  : tieneJav
                    ? remoto
                    : local

    return {
        id: elegido.id,
        label: elegido.label,
        mode,
        disponible: {
            llm: tieneLlm,
            jav: tieneJav,
            local: true,
        },
        /** Clasifica con el proveedor elegido y cae a local solo si el modo es auto. */
        async classify(prompt, lessons, options = {}) {
            const index = indexById(lessons)
            try {
                return await elegido.classify(prompt, lessons, index, options)
            } catch (error) {
                if (mode !== 'auto' || elegido.id === 'local') throw error
                const respaldo = await local.classify(prompt, lessons, index, options)
                return {
                    ...respaldo,
                    generatedBy: 'local',
                    fallbackReason: error.message,
                }
            }
        },
    }
}

/** Catalogo base + piezas generadas + enlaces de diseno añadidos a mano. */
export function buildCatalog(generated = [], enlaces = {}) {
    const normales = generated
        .map((l) => ({ ...normalizeLesson(l), origin: l.origin || 'generado' }))
    const lessons = aplicarEnlaces(mergeLessons(SEED_LESSONS, normales), enlaces)
    return {
        lessons,
        seed: SEED_LESSONS,
    }
}

export { emptyRoute }

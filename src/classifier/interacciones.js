/**
 * GOOGLE — INTERACTIONS API (la puerta recomendada).
 *
 * POR QUE SE CAMBIA:
 * La herramienta llamaba a `generateContent`, que Google mantiene pero ya
 * considera **legacy**. El disenador trajo codigo funcionando de la Interactions
 * API y pidio que se usara esa. Y es lo que dice Google para proyectos nuevos:
 * `POST /v1beta/interactions`.
 *
 * LO QUE SE GANA, ADEMAS DE IR POR LA PUERTA BUENA:
 * Aqui la busqueda es una HERRAMIENTA (`tools: [{ type: 'google_search' }]`) y
 * las fuentes vuelven como anotaciones `url_citation` dentro de la respuesta:
 * `{ url, title }`. Es decir, **las paginas que el modelo ha leido de verdad**,
 * que es justo lo que hace falta para que nada entre como documentado sin recibo.
 *
 * `store: false` a proposito: esto es material original del disenador, y no
 * queremos que se guarde en Google para entrenar nada.
 */

import { leerErrorGoogle, normalizarModeloId } from './gemini.js'

const BASE_INTERACCIONES = 'https://generativelanguage.googleapis.com/v1beta/interactions'

export function normalizarModelo(id) {
    return normalizarModeloId(id)
}

/**
 * Llama a la Interactions API.
 *
 * @param {object}  opciones
 * @param {string}  opciones.apiKey     Clave de AI Studio (AIza… o AQ…).
 * @param {string}  opciones.model      Ej. `gemini-3.8-flash`.
 * @param {Array}   opciones.messages   [{ role: 'system'|'user', content }]
 * @param {boolean} opciones.buscar     Activa la herramienta google_search.
 * @param {string}  opciones.thinkingLevel  `low` | `medium` | `high`
 * @returns {{ content, fuentes, consultas, status, id, usage, buscar }}
 */
export async function llamarInteraccion({
    apiKey,
    model,
    messages = [],
    buscar = false,
    thinkingLevel = '',
    jsonMode = false,
    maxTokens = 0,
    signal,
}) {
    if (!apiKey) throw new Error('Falta la API key de Google AI Studio.')
    if (!model) throw new Error('Falta el nombre del modelo de Gemini.')

    const modelo = normalizarModelo(model)
    const refuerzo = jsonMode
        ? '\n\nResponde UNICAMENTE con un objeto JSON valido: sin texto alrededor y sin bloques de codigo.'
        : ''
    const sistema =
        messages
            .filter((m) => m.role === 'system')
            .map((m) => m.content)
            .join('\n\n') + refuerzo
    const entrada = messages
        .filter((m) => m.role !== 'system')
        .map((m) => m.content)
        .join('\n\n')

    const cuerpo = {
        model: modelo,
        input: entrada,
        // No se guarda: material original del disenador.
        store: false,
    }
    // LIBERTAD: el presupuesto de salida y el nivel de razonamiento solo se
    // mandan si alguien los pide. Ponerlos por defecto es limitar al modelo sin
    // motivo, y ya nos costo una peticion de cinco minutos.
    if (maxTokens > 0) cuerpo.generation_config = { max_output_tokens: maxTokens }
    if (sistema) cuerpo.system_instruction = sistema
    if (thinkingLevel) {
        cuerpo.generation_config = { ...(cuerpo.generation_config || {}), thinking_level: thinkingLevel }
    }
    if (buscar) cuerpo.tools = [{ type: 'google_search' }]

    const respuesta = await fetch(BASE_INTERACCIONES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal,
        body: JSON.stringify(cuerpo),
    })

    if (!respuesta.ok) throw await errorDeGoogle(respuesta)

    const datos = await respuesta.json()
    const leido = leerInteraccion(datos)
    if (leido.status === 'failed') {
        throw new Error(`La interacción falló: ${resumir(JSON.stringify(datos?.error || ''), 240)}`)
    }
    // `incomplete` = se quedo sin presupuesto de tokens antes de terminar. Con
    // razonamiento alto eso es facil: los tokens de pensamiento cuentan como
    // salida. Si no hay texto, se dice POR QUE, en vez de un «respondio vacio».
    if (leido.status === 'incomplete' && !leido.content) {
        throw new Error(
            `La interacción se quedó sin presupuesto de tokens (${maxTokens}) antes de responder. Con razonamiento alto, sube el límite.`,
        )
    }
    return { ...leido, buscar, model: modelo }
}

/**
 * Saca el texto Y LAS FUENTES de una respuesta de la Interactions API.
 *
 * La respuesta trae `steps[]`. El texto esta en los pasos `model_output`, y las
 * fuentes en las anotaciones `url_citation` de sus contenidos:
 * `{ type: 'url_citation', url, title }`. Las busquedas que hizo estan en los
 * pasos `google_search_call`, en `arguments.queries`.
 */
export function leerInteraccion(datos) {
    const pasos = Array.isArray(datos?.steps) ? datos.steps : []
    const trozos = []
    const fuentes = []
    const vistos = new Set()
    const consultas = []

    for (const paso of pasos) {
        if (paso?.type === 'google_search_call') {
            for (const q of paso?.arguments?.queries || []) consultas.push(String(q))
            continue
        }
        if (paso?.type !== 'model_output') continue

        for (const pieza of paso?.content || []) {
            if (pieza?.text) trozos.push(String(pieza.text))
            for (const anotacion of pieza?.annotations || []) {
                if (anotacion?.type !== 'url_citation' || !anotacion.url) continue
                const uri = String(anotacion.url).trim()
                if (vistos.has(uri)) continue
                vistos.add(uri)
                fuentes.push({ titulo: String(anotacion.title || '').trim(), uri })
            }
        }
    }

    return {
        content: trozos.join('\n').trim(),
        fuentes,
        consultas,
        status: String(datos?.status || ''),
        id: String(datos?.id || ''),
        usage: datos?.usage || null,
    }
}

/**
 * EL CAMINO DEL AGENTE — el codigo que trajo el disenador.
 *
 * `client.interactions.create(agent='antigravity-preview-09-2026', background=True,
 * tools=[{'type':'code_execution'},{'type':'google_search'},{'type':'url_context'}])`
 *
 * POR QUE ESTE Y NO EL DEL MODELO:
 * juntando la evidencia de toda la sesion —modelo + busqueda da 503 SIEMPRE,
 * modelo solo funciona en 3,5 s, y el agente con busqueda le funciona a el— lo
 * que no entra en esta clave es **la busqueda por la via del modelo simple**.
 * El agente es la via que si la tiene.
 *
 * NO lleva `store: false`: la propia documentacion de Google dice que no
 * guardar es INCOMPATIBLE con la ejecucion en segundo plano. Asi que aqui Google
 * sí guarda la interaccion; se hace porque es la unica forma de que funcione.
 */
export async function llamarAgente({
    apiKey,
    agente,
    input,
    // Las MISMAS tres herramientas y el mismo entorno que el codigo del
    // disenador. Quitarle cosas al agente no lo hace mas ligero: lo rompe.
    tools = [{ type: 'code_execution' }, { type: 'google_search' }, { type: 'url_context' }],
    environment = { type: 'remote', network: 'disabled' },
    cadaSegundos = 10,
    maxEsperas = 60,
    signal,
}) {
    if (!apiKey) throw new Error('Falta la API key de Google AI Studio.')
    if (!agente) throw new Error('Falta el nombre del agente.')

    const cabeceras = { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }

    const creacion = await fetch(BASE_INTERACCIONES, {
        method: 'POST',
        headers: cabeceras,
        signal,
        body: JSON.stringify({ agent: agente, input, background: true, tools, environment }),
    })
    if (!creacion.ok) throw await errorDeGoogle(creacion)

    let datos = await creacion.json()
    let esperas = 0

    while (datos?.status !== 'completed' && datos?.status !== 'failed' && esperas < maxEsperas) {
        await dormir(cadaSegundos * 1000, signal)
        const consulta = await fetch(`${BASE_INTERACCIONES}/${encodeURIComponent(datos.id)}`, {
            headers: { 'x-goog-api-key': apiKey },
            signal,
        })
        if (!consulta.ok) throw await errorDeGoogle(consulta)
        datos = await consulta.json()
        esperas += 1
    }

    const leido = leerInteraccion(datos)
    if (leido.status === 'failed') {
        throw new Error(`El agente falló: ${resumir(JSON.stringify(datos?.error || ''), 240)}`)
    }
    if (leido.status !== 'completed') {
        throw new Error(`El agente no terminó a tiempo (estado: ${leido.status || 'desconocido'}).`)
    }
    return { ...leido, agente, esperas }
}

function dormir(ms, signal) {
    return new Promise((resolver, rechazar) => {
        const t = setTimeout(resolver, ms)
        signal?.addEventListener?.('abort', () => {
            clearTimeout(t)
            rechazar(new Error('Cancelado.'))
        })
    })
}

/** Prueba de conexion: un mensaje minimo, con o sin busqueda. */
export async function probarInteraccion({ apiKey, model, buscar = true, thinkingLevel = '', signal }) {
    const inicio = Date.now()
    const r = await llamarInteraccion({
        apiKey,
        model,
        messages: [
            { role: 'system', content: 'Responde en una sola frase corta.' },
            {
                role: 'user',
                content: buscar
                    ? 'Busca en Google y dime una cosa: ¿de qué color es la fachada de la Catedral de Valencia? Cita la fuente.'
                    : 'Di OK.',
            },
        ],
        buscar,
        thinkingLevel,
        maxTokens: 512,
        signal,
    })
    return { ...r, ms: Date.now() - inicio, model: normalizarModelo(model) }
}

/** ¿Este nombre de modelo sirve para conversar de texto? */
export { sirveParaTexto } from './gemini.js'

async function errorDeGoogle(respuesta) {
    let crudo = ''
    try {
        crudo = await respuesta.text()
    } catch {
        /* sin cuerpo */
    }

    // Se reutiliza el lector de errores de Google: es el unico sitio donde se
    // decide que es un «motivo» y que es solo un `status`. Duplicarlo aqui seria
    // volver a arriesgarse a traducir `RESOURCE_EXHAUSTED` a «cuota».
    let cuerpo = null
    try {
        cuerpo = JSON.parse(crudo)
    } catch {
        /* el cuerpo no era JSON */
    }
    const info = leerErrorGoogle(cuerpo)

    const etiqueta = info.motivo
        ? ` [${info.motivo}]`
        : info.status
          ? ` (status de Google: ${info.status})`
          : ''
    const error = new Error(
        `Google respondio ${respuesta.status}${etiqueta}. ${
            resumir(info.mensaje || crudo, 240) || 'Revisa el modelo y la API key.'
        }`,
    )
    error.codigo = respuesta.status
    error.motivo = info.motivo
    error.tipoLimite = info.tipo
    error.statusGoogle = info.status
    error.detalle = crudo
    error.retryAfter = respuesta.headers?.get?.('retry-after') || ''
    return error
}

function resumir(texto, limite = 300) {
    return String(texto || '').replace(/\s+/g, ' ').slice(0, limite)
}

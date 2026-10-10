/**
 * GOOGLE AI STUDIO — API NATIVA de Gemini.
 *
 * POR QUE NO SE USA LA CAPA COMPATIBLE CON OPENAI:
 * Google ofrece una puerta que habla el protocolo de OpenAI en
 * `generativelanguage.googleapis.com/v1beta/openai`, y funciona, pero su URL
 * confunde a cualquiera (parece de OpenAI y es de Google) y ademas **no da
 * acceso a la busqueda**. La API nativa:
 *
 *  - tiene una URL inequivocamente de Google,
 *  - y sobre todo **sabe buscar en Google** (`google_search`) y devuelve **las
 *    fuentes que ha consultado**.
 *
 * Eso ultimo es lo que resuelve el problema del 80%: sin busqueda, el modelo
 * recuerda y una fuente inventada es indistinguible de una verdadera. Con
 * busqueda, las fuentes son las que ha leido de verdad, y se pueden comprobar.
 */

const BASE_INTERACCIONES = 'https://generativelanguage.googleapis.com/v1beta/interactions'

/**
 * CATALOGO DE MODELOS DE GEMINI — SOLO COMO RESPALDO.
 *
 * La lista de verdad la da Google: `listarModelos()` se la pregunta con tu
 * clave y ensena lo que REALMENTE puedes usar. Esta lista solo sirve para
 * sugerir algo antes de tener conexion.
 *
 * Y hace falta, porque el catalogo cambia muy rapido: el 2.5-flash que traia la
 * documentacion de hace un ano ya no esta disponible para cuentas nuevas, y el
 * modelo del momento es el 3.8-flash. Adivinar nombres de modelos es una forma
 * segura de romper la herramienta cada pocos meses.
 */
export const CATALOGO_GEMINI = [
    { id: 'gemini-3.8-flash', para: 'El mas capaz de la familia Flash. Punto de partida.', chat: true, recomendado: true },
    { id: 'gemini-3.7-flash', para: 'Generacion anterior del Flash.', chat: true },
    { id: 'gemini-3.6-flash', para: 'Generacion anterior del Flash.', chat: true },
    { id: 'gemini-3.5-flash', para: 'Generacion anterior del Flash.', chat: true },
    { id: 'gemini-3.5-flash-lite', para: 'Flash ligero: menos latencia, menos coste.', chat: true },
    { id: 'gemini-3.1-flash-lite', para: 'Flash ligero de la generacion 3.1.', chat: true },
    { id: 'gemini-3.1-pro-preview', para: 'Razonamiento profundo (en vista previa).', chat: true },
    { id: 'gemini-2.5-pro', para: 'Generacion 2.5 de razonamiento.', chat: true },
    { id: 'gemini-2.5-flash', para: 'Generacion 2.5. Ya no se ofrece a cuentas nuevas.', chat: true },
    { id: 'gemma-4-31b-it', para: 'Modelo abierto de Google (Gemma), no Gemini.', chat: true },
]

export function modeloGemini(id) {
    const limpio = normalizarModeloId(id)
    return CATALOGO_GEMINI.find((m) => m.id === limpio) || null
}

/** Google devuelve los nombres con prefijo `models/`. Aqui se acepta con y sin. */
export function normalizarModeloId(id) {
    return String(id || '')
        .trim()
        .replace(/^models\//, '')
}

/**
 * ¿Este modelo entiende `thinkingConfig.thinkingLevel`?
 *
 * Es de la generacion 3 en adelante. En las anteriores el campo no existe y
 * mandarlo podria dar error, asi que solo se manda cuando consta que lo acepta.
 * En Gemini 3, ademas, `temperature` esta retirado: por eso no se manda.
 */
export function soportaThinkingLevel(modelo) {
    const m = /^gemini-(\d+)/.exec(normalizarModeloId(modelo))
    return Boolean(m) && Number(m[1]) >= 3
}

/**
 * EL NIVEL DE RAZONAMIENTO POR TAREA.
 *
 * `high` lo puse yo por iniciativa propia, sin justificarlo, y era un error: la
 * documentacion de Google dice que `medium` es el valor POR DEFECTO y «el mejor
 * para la mayoria de tareas», y que `high` es para «razonamiento profundo,
 * matematicas y tareas dificiles de varios pasos». Generar material sobre una
 * catedral no es un problema de matematicas.
 *
 * Coste de haberme inventado ese `high`: una peticion de CINCO MINUTOS que
 * ademas termino en un 503. Con `medium` la peticion es mucho mas ligera.
 */
export const NIVEL_RAZONAMIENTO = {
    investigacion: 'medium',
    general: 'low',
}

/**
 * ¿Este modelo sirve para CONVERSAR texto?
 *
 * El listado de Google incluye modelos que si aceptan `generateContent` pero no
 * son de texto: imagenes, voz, musica, embeddings. Si se cuelan en el catalogo,
 * la herramienta los sugiere y el usuario prueba uno que no le sirve, o peor:
 * el barrido de cuota gasta intentos en modelos que nunca iban a responder.
 */
const NO_TEXTO =
    /(image|imagen|tts|audio|live|embedding|robotics|lyria|veo|nano-banana|clip|translate|transcribe)/i

export function sirveParaTexto(id) {
    return !NO_TEXTO.test(normalizarModeloId(id))
}

/** Estructura de respuesta del listado de modelos de Google. */
export function leerCatalogo(datos) {
    const lista = Array.isArray(datos?.models) ? datos.models : []
    return lista
        .map((m) => {
            const id = normalizarModeloId(m?.name)
            const metodos = Array.isArray(m?.supportedGenerationMethods)
                ? m.supportedGenerationMethods.map(String)
                : []
            return {
                id,
                descripcion: String(m?.description || '').trim(),
                chat: metodos.includes('generateContent') && sirveParaTexto(id),
                metodos,
            }
        })
        .filter((m) => m.id)
        .sort((a, b) => Number(b.chat) - Number(a.chat) || a.id.localeCompare(b.id))
}

/**
 * PREGUNTA A GOOGLE QUE MODELOS TIENE TU CLAVE.
 *
 * Esta es la cura de raiz: en vez de llevar una lista escrita a mano que caduca,
 * se le pregunta al que manda. Con la clave de AI Studio, el listado responde
 * exactamente lo que esa clave puede invocar.
 */
export async function listarModelos({ apiKey, signal }) {
    if (!apiKey) throw new Error('Falta la API key de Google AI Studio.')
    const base = 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200'

    let respuesta = await fetch(base, { headers: { 'x-goog-api-key': apiKey }, signal })
    if (respuesta.status === 401 || respuesta.status === 403) {
        respuesta = await fetch(`${base}&key=${encodeURIComponent(apiKey)}`, { signal })
    }
    if (!respuesta.ok) {
        const detalle = await textoSeguro(respuesta)
        throw new Error(
            `Google respondio ${respuesta.status} al listar los modelos. ${resumir(detalle) || 'Revisa la API key.'}`,
        )
    }
    return leerCatalogo(await respuesta.json())
}

/**
 * EL FORMATO DE LAS CLAVES DE GOOGLE CAMBIO.
 *
 * Las clasicas empiezan por `AIza` (heredadas de Google Cloud). Las generadas
 * recientemente en proyectos nuevos de AI Studio empiezan por `AQ.` o `AQ`.
 *
 * **Aqui NO se valida el prefijo.** Esto solo informa del formato reconocido,
 * para que nadie reciba un error por el aspecto de su clave en vez de por lo que
 * de verdad falla. Una clave se acepta o se rechaza por lo que responde Google,
 * nunca por como empieza.
 */
export function formatoDeClave(apiKey) {
    const k = String(apiKey || '').trim()
    if (!k) return { id: 'vacia', label: 'sin clave' }
    if (k.startsWith('AIza')) return { id: 'clasica', label: 'formato clásico (AIza…)' }
    if (k.startsWith('AQ')) return { id: 'nueva', label: 'formato nuevo (AQ…)' }
    return { id: 'otra', label: 'formato no reconocido por nosotros' }
}

export function fuenteEstaConsultada(fuente, fuentes = []) {
    const limpia = String(fuente || '').trim()
    if (!limpia) return false
    if (!fuentes.length) return false

    const minus = limpia.toLowerCase()
    return fuentes.some((f) => {
        const uri = String(f.uri || '').toLowerCase()
        const titulo = String(f.titulo || '').toLowerCase()
        if (uri && (minus.includes(uri) || uri.includes(minus))) return true
        if (titulo && titulo.length > 8 && (minus.includes(titulo) || titulo.includes(minus))) return true
        const dominio = uri.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')
        return Boolean(dominio) && dominio.length > 4 && minus.includes(dominio)
    })
}

export function leerErrorGoogle(cuerpo) {
    // Tolerante con la forma: unas APIs envuelven el error en `error` y otras lo
    // mandan plano. Y si no se reconoce ninguna, se devuelve vacio — quien lo use
    // tiene que ENSENAR EL CUERPO CRUDO en vez de resumirlo.
    const e = cuerpo?.error && typeof cuerpo.error === 'object' ? cuerpo.error : cuerpo || {}
    const detalles = Array.isArray(e.details) ? e.details : []
    const conMotivo = detalles.find((d) => d?.reason)

    // SOLO se llama «motivo» a lo que Google llama motivo.
    //
    // `error.status` NO es un motivo: `RESOURCE_EXHAUSTED` es un cajon generico
    // que cubre tanto un limite de ritmo como una cuota agotada. Antes caia aqui
    // y lo clasificaba como «cuota» por contener «EXHAUST», y la pantalla lo
    // ensenaba como «el motivo que da Google es CUOTA». Eso era atribuirle a
    // Google una conclusion mia.
    //
    // PERO en la Interactions API SI hay un motivo explicito, y viene en `code`
    // Y ES TEXTO: `{"error":{"message":"...","code":"too_many_requests"}}`.
    // Decia «demasiadas peticiones» — justo lo contrario de la «cuota» que yo
    // habia afirmado. Y no lo vi porque buscaba un numero, no una cadena.
    const codigoTexto = typeof e.code === 'string' ? e.code.trim() : ''
    const motivo = String(conMotivo?.reason || codigoTexto).trim()

    let tipo = 'desconocido'
    if (/RATE_LIMIT|TOO_MANY_REQUESTS|RATE_LIMITED/i.test(motivo)) tipo = 'ritmo'
    else if (/SERVICE_UNAVAILABLE|UNAVAILABLE|OVERLOADED/i.test(motivo)) tipo = 'capacidad'
    else if (/QUOTA/i.test(motivo)) tipo = 'cuota'

    return {
        code: Number(e.code) || 0,
        status: String(e.status || ''),
        motivo,
        tipo,
        mensaje: String(e.message || '').trim(),
        detalles,
    }
}

function parsearJson(texto) {
    try {
        return JSON.parse(texto)
    } catch {
        return null
    }
}

function resumir(texto, limite = 300) {
    return String(texto || '').replace(/\s+/g, ' ').slice(0, limite)
}

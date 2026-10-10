import { callChatCompletions, extractJson, soportaJsonMode } from './llmProvider.js'
import { NIVEL_RAZONAMIENTO, fuenteEstaConsultada } from './gemini.js'
import { llamarAgente, llamarInteraccion } from './interacciones.js'

/** El agente del codigo que trajo el disenador. */
export const AGENTE_INVESTIGACION = 'antigravity-preview-09-2026'
import { CLASES_MATERIAL, normalizarOpcion, PILARES } from '../domain/material.js'

/**
 * LA INVESTIGACI--N PREVIA: el 80%.
 *
 * El diseñador lo pidió así: *«hay que hacer que la IA haga una investigación
 * previa profunda respecto a lo que hay, incluyendo los Apócrifos Convincentes,
 * o sea ese 80% que hemos hablado. Ese 80% es fundamental para que saquemos con
 * este panel de nodos el 20% que falta.»*
 *
 * El reparto de trabajo es ese: **la IA trae el material; el panel de nodos saca
 * la deducción.** La herramienta no le pregunta al diseñador qué debe descubrir
 * el jugador, porque eso es justo lo que hay que resolver.
 *
 * --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * LÍMITE HONESTO, Y ES GRANDE:
 *
 * El motor que hay conectado (chat completions) NO navega. No puede consultar el
 * archivo de la catedral ni un libro. Todo lo que devuelva lo recuerda de su
 * entrenamiento, y por tanto **una fuente que se invente es indistinguible de una
 * verdadera**. Por eso el prompt le prohíbe inventar fuentes y el saneado
 * DEGRADA a `por_verificar` toda opción que se declare documentada sin fuente.
 *
 * Consecuencia práctica: esta investigación produce CANDIDATOS. Para que algo
 * pase a `documentado` hace falta una fuente de verdad -- un libro, el archivo,
 * una ficha de campo, o un motor con acceso a la web.
 * --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

export const SYSTEM_INVESTIGACION = `Eres el investigador previo de un juego de misterio que se juega con el movil dentro de una catedral real. Tu trabajo NO es escribir el juego: es poner encima de la mesa el MATERIAL con el que despues se disenara.

Recibes el nombre de una catedral. Devuelves las OPCIONES que existen en ella, organizadas por los cuatro pilares:

1. anclaje_visible -- lo que esta a la vista y al alcance del publico: lajas sepulcrales, filacterias en porticos, mensarios, zodiacos, atributos de santos, capiteles historiados.
2. apocrifo -- lo que se puede sostener con fuentes eclesiasticas o notariales, y la deduccion oculta que se le puede colgar: bulas censuradas, clausulas suprimidas, minutas capitulares.
3. dualidad_gremios -- donde choca la autoridad que impone el dogma (Cabildo) con los artifices que labran la materia (canteros, lapicidas, orfebres).
4. secreto_filosofico -- la herejia o ruptura escolastica que se puede plantear. NADA sobrenatural: tiene que formularse como proposicion ontologica, fisica o politica medieval (averroismo latino, nominalismo radical, espiritualismo joaquinita, herejia del cero).

Ademas, para cada inscripcion que encuentres, apunta los JUEGOS LINGUISTICOS posibles segun las reglas paleograficas:
- Regla 1 (titulus polivalente): el trazo horizontal que omite m o n puede leerse como contraccion o como negacion disimulada.
- Regla 2 (inversion palindromica): ROMA/AMOR, DEUS/SUED, MORS/SROM.
- Regla 3 (acrostico de sillar): las iniciales de cada linea de un epitafio de cuatro lineas.
- Regla 4 (puntuacion ficticia): el punto medio no siempre separa palabras; puede romper morfemas y cambiar el caso.

REGLA QUE MANDA SOBRE TODAS -- NO INVENTES FUENTES:
- Si puedes citar una fuente concreta y comprobable (una obra con autor, un fondo de archivo, una publicacion), ponla en "fuente" y "estado": "documentado".
- Si NO puedes citarla con seguridad, deja "fuente" vacio y pon "estado": "por_verificar". Es una respuesta perfectamente valida y es la que se espera de ti la mayor parte del tiempo.
- Nunca escribas una fuente que no puedas sostener. Una fuente inventada es peor que no tener fuente: envenena el juego entero.
- Lo que nos inventemos nosotros, para un puzzle, va con "estado": "inventado".

Devuelve entre 8 y 15 opciones. Cada una con: id corto, clase (anclaje | epigrafia | linguistica | dato_curioso | simbolo | restriccion), pilar, titulo, detalle, ubicacion (si procede), juego (si es linguistica), fuente y estado.

Responde UNICAMENTE con un objeto JSON valido:
{
  "catedral": "nombre",
  "resumen": "dos o tres frases sobre que ofrece esta catedral para un thriller historico",
  "opciones": [
    { "id": "ANC-01", "clase": "anclaje", "pilar": "anclaje_visible", "titulo": "...", "detalle": "...", "ubicacion": "...", "juego": "", "fuente": "", "estado": "por_verificar" }
  ]
}`

/** El encargo de investigación, tal cual va al motor. */
export function buildInvestigacionMensaje(catedral, { materialPrevio = [], notas = '' } = {}) {
    return JSON.stringify({
        catedral: catedral?.nombre || '',
        ciudad: catedral?.ciudad || '',
        pais: catedral?.pais || '',
        material_ya_recogido: materialPrevio.map((o) => ({
            id: o.id,
            clase: o.clase,
            titulo: o.titulo,
            estado: o.estado,
        })),
        notas_del_disenador: notas,
        recordatorio:
            'Solo JSON valido. No inventes fuentes: si no puedes citarla, deja "fuente" vacio y "estado": "por_verificar".',
    })
}

/**
 * Con la busqueda activada, el motor puede CITAR de verdad, asi que se le exige.
 * Y se le avisa de que sus citas se comprueban: una fuente que no haya
 * consultado se rechaza sola.
 */
export function systemInvestigacion({ conBusqueda = false } = {}) {
    if (!conBusqueda) return SYSTEM_INVESTIGACION
    return `${SYSTEM_INVESTIGACION}

BUSQUEDA EN GOOGLE ACTIVADA. Usala: no respondas de memoria.
- Para cada opcion que marques como "documentado", pon en "fuente" la URL o el TITULO EXACTO de la pagina que hayas consultado.
- Sus citas se COMPRUEBAN contra las fuentes que realmente hayas consultado: una fuente que no aparezca ahi se rechaza automaticamente y la opcion baja a "por_verificar".
- Si algo no lo encuentras en la busqueda, no lo pongas como documentado. Es una respuesta correcta.`
}

/**
 * Pide la investigacion al motor y la sanea.
 *
 * Con Google usa la API NATIVA y la BUSQUEDA: asi las fuentes son las que ha
 * leido, no las que recuerda. Es la diferencia entre citar y sonar convincente.
 */
export async function investigarCatedral({
    settings,
    catedral,
    materialPrevio = [],
    notas = '',
    signal,
}) {
    const { provider = 'compatible', baseUrl, apiKey, model } = settings?.llm || {}
    if (!apiKey) {
        throw new Error(
            'Falta la clave del motor en Ajustes. La investigación previa necesita un modelo: el motor local no investiga.',
        )
    }
    if (!catedral?.nombre) {
        throw new Error('Falta elegir la catedral antes de investigar.')
    }

    // UN SOLO MODELO. Habia inventado un «modelo de investigacion» aparte, y el
    // disenador lo corto en seco: «¿por que diferencias un modelo a otro de
    // investigacion? Es lo mismo». Tiene razon: lo que cambia entre tareas es el
    // nivel de razonamiento, no el modelo.
    const modelo = model

    const usuario = buildInvestigacionMensaje(catedral, { materialPrevio, notas })

    if (provider === 'google') {
        const quiereBuscar = settings?.llm?.buscarWeb !== false

        // PRIMERO EL CAMINO DEL AGENTE: es el que trajo el disenador y el unico
        // que le funciona con busqueda. Juntando la evidencia de toda la sesion
        // (modelo + busqueda da 503 SIEMPRE, modelo solo funciona en 3,5 s, y el
        // agente con busqueda le funciona a el), lo que no entra en esta clave es
        // la busqueda por la via del modelo simple.
        let falloAgente = ''
        if (quiereBuscar) {
            try {
                const r = await llamarAgente({
                    apiKey,
                    agente: AGENTE_INVESTIGACION,
                    input: systemInvestigacion({ conBusqueda: true }) + '\n\n---\n\n' + usuario,
                    signal,
                })
                const saneado = parseInvestigacion(extractJson(r.content), catedral.id, {
                    fuentes: r.fuentes,
                })
                return {
                    ...saneado,
                    buscar: true,
                    fuentes: r.fuentes,
                    consultas: r.consultas,
                    usage: r.usage,
                    model: r.agente,
                    aviso: '',
                }
            } catch (err) {
                if (err?.codigo === 429) {
                    return await investigarSinBuscar({
                        apiKey,
                        model: modelo,
                        catedral,
                        usuario,
                        signal,
                        aviso: 'El agente no entro por limite de ritmo. Esta investigacion viene de la MEMORIA del modelo: verificala tu.',
                    })
                }
                // Cualquier otro fallo del agente: se intenta por el modelo,
                // pero SE GUARDA el error. Tragarselo nos dejo a ciegas.
                falloAgente = err?.message || 'el agente no respondio'
            }
        }

        // La busqueda en Google tiene SU PROPIA cuota, aparte de la del modelo:
        // se puede agotar mientras el modelo sigue respondiendo. Y el modo que
        // eligio el disenador --«la IA propone, yo verifico a mano»-- NO necesita
        // busqueda. Asi que si la busqueda falla, se investiga igual y se dice.
        if (quiereBuscar) {
            try {
                const r = await llamarInteraccion({
                    apiKey,
                    model: modelo,
                    messages: [
                        { role: 'system', content: systemInvestigacion({ conBusqueda: true }) },
                        { role: 'user', content: usuario },
                    ],
                    buscar: true,
                    thinkingLevel: NIVEL_RAZONAMIENTO.investigacion,
                    jsonMode: true,
                    maxTokens: 12288,
                    signal,
                })
                const saneado = parseInvestigacion(extractJson(r.content), catedral.id, {
                    fuentes: r.fuentes,
                })
                return {
                    ...saneado,
                    buscar: true,
                    fuentes: r.fuentes,
                    consultas: r.consultas,
                    usage: r.usage,
                    model: modelo,
                    aviso: '',
                }
            } catch (err) {
                // 503 (saturado) o 404 (no existe) NO son culpa de la cuenta: ahi
                // cambiar de modelo SI arregla las cosas. Se prueba UNO mas.
                const alternativa = (settings?.llm?.catalogo || [])
                    .filter((m) => m.chat && m.id !== modelo && /flash/.test(m.id))
                    .map((m) => m.id)
                    .sort((a, b) => a.localeCompare(b))[0]
                if (alternativa && [503, 404, 500].includes(err?.codigo)) {
                    try {
                        const r = await llamarInteraccion({
                            apiKey,
                            model: alternativa,
                            messages: [
                                { role: 'system', content: systemInvestigacion({ conBusqueda: true }) },
                                { role: 'user', content: usuario },
                            ],
                            buscar: true,
                            thinkingLevel: NIVEL_RAZONAMIENTO.investigacion,
                            jsonMode: true,
                            maxTokens: 12288,
                            signal,
                        })
                        const saneado = parseInvestigacion(extractJson(r.content), catedral.id, {
                            fuentes: r.fuentes,
                        })
                        return {
                            ...saneado,
                            buscar: true,
                            fuentes: r.fuentes,
                            consultas: r.consultas,
                            usage: r.usage,
                            model: alternativa,
                            aviso: `«${modelo}» no respondió y se investigó con «${alternativa}».`,
                        }
                    } catch (segundo) {
                        if (segundo?.codigo !== 429) throw segundo
                    }
                }
                if (err?.codigo !== 429) {
                    throw new Error(
                        falloAgente
                            ? `${err.message} | Y el AGENTE fallo antes: ${falloAgente}`
                            : err.message,
                    )
                }
                // 429 = la cuota de la busqueda. Se sigue sin ella.
                return await investigarSinBuscar({
                    apiKey,
                    model: modelo,
                    catedral,
                    usuario,
                    signal,
                    aviso:
                        'La búsqueda en Google no tiene cuota ahora mismo, así que esta investigación viene de la MEMORIA del modelo, no de fuentes. Nada entra como documentado: verifícalo tú.',
                })
            }
        }

        return await investigarSinBuscar({
            apiKey,
            model: modelo,
            catedral,
            usuario,
            signal,
            aviso: '',
        })
    }

    const { content, usage } = await callChatCompletions({
        baseUrl,
        apiKey,
        model: modelo,
        messages: [
            { role: 'system', content: systemInvestigacion({ conBusqueda: false }) },
            { role: 'user', content: usuario },
        ],
        jsonMode: soportaJsonMode(baseUrl),
        signal,
    })

    const saneado = parseInvestigacion(extractJson(content), catedral.id)
    return { ...saneado, buscar: false, fuentes: [], usage, model: modelo, aviso: '' }
}

/** Investigacion sin busqueda: candidatos de memoria, todos por verificar. */
async function investigarSinBuscar({ apiKey, model, catedral, usuario, signal, aviso }) {
    const r = await llamarInteraccion({
        apiKey,
        model,
        messages: [
            { role: 'system', content: systemInvestigacion({ conBusqueda: false }) },
            { role: 'user', content: usuario },
        ],
        buscar: false,
        thinkingLevel: NIVEL_RAZONAMIENTO.investigacion,
        jsonMode: true,
        maxTokens: 12288,
        signal,
    })
    const saneado = parseInvestigacion(extractJson(r.content), catedral.id)
    return {
        ...saneado,
        buscar: false,
        fuentes: [],
        consultas: [],
        usage: r.usage,
        model,
        aviso,
    }
}

/**
 * Sanea la investigación:
 * - descarta opciones sin titulo o sin detalle,
 * - **degrada a `por_verificar` toda opcion que se declare documentada sin fuente**,
 * - y, si hubo busqueda, **degrada tambien la que cite una fuente que el motor no
 *   consultó**: una cita inventada es peor que no tener fuente,
 * - cuenta cuantas se degradaron, para poder decirlo en voz alta.
 */
export function parseInvestigacion(raw, catedralId, { fuentes = [] } = {}) {
    const lista = Array.isArray(raw?.opciones) ? raw.opciones : []
    const opciones = []
    const descartadas = []
    let degradadas = 0

    for (const bruta of lista) {
        const opcion = normalizarOpcion(bruta, catedralId, {
            fuentes,
            comprobarFuente: fuenteEstaConsultada,
        })
        if (!opcion.valido) {
            descartadas.push({ titulo: opcion.titulo || '(sin titulo)', motivo: 'le falta titulo o detalle' })
            continue
        }
        if (opcion.degradado) degradadas += 1
        opciones.push(opcion)
    }

    return {
        resumen: String(raw?.resumen || '').trim(),
        opciones,
        descartadas,
        degradadas,
        total: lista.length,
    }
}

export { CLASES_MATERIAL, PILARES }

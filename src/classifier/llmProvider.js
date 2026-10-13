import { toCatalogCard } from '../domain/lesson.js'
import { normalizar } from '../data/catalog.js'
import { BLOCK_KINDS, normalizeRoute, SUBJECT_KEYS } from './contract.js'

/**
 * Sistema de instrucciones del motor de diseno.
 * Es el corazon del producto: define COMO se piensa un gameflow.
 *
 * El metodo del proyecto es el DISENO INVERSO: se parte del final del juego
 * (que queremos que el jugador sienta y descubra) y se trabaja hacia atras
 * preguntando que tiene que estar resuelto antes.
 */
export const SYSTEM_PROMPT = `Eres el motor de diseno de gameflows de catedrales. Recibes la INTENCION de diseno del autor y el CATALOGO de piezas existentes, y devuelves el GAMEFLOW como secuencia ordenada de nodos.

El metodo es DISENO INVERSO y esto manda sobre todo lo demas:
1. El paso 1 es SIEMPRE el final del juego: la pieza que lleva "ancla" en el catalogo. Es el punto del que cuelga todo el diseno.
2. Los pasos siguientes van HACIA ATRAS: cada uno es una pieza que tiene que estar resuelta antes de lo que ya esta en la lista. Un dependiente aparece siempre antes que sus prerrequisitos, nunca despues.
3. La intencion del autor no elige el punto de partida (que es siempre el final), pero si decide que piezas se marcan y como se justifican. Si la intencion no encaja en el catalogo, dilo en "rationale" en vez de inventar.

Reglas obligatorias:
4. Trabaja con el catalogo. Cada paso debe referenciar el "id" exacto de una pieza del catalogo. Nunca inventes ids.
5. Si falta una pieza imprescindible, puedes proponerla en "newLessons" (maximo 4 por respuesta). Una pieza nueva debe declarar en "prereq" que necesita, y si es una pieza de arranque, "prereq" vacio.
6. Escribe en espanol neutro, claro y directo. Sin adornos ni relleno.
7. El campo "rationale" de cada paso explica en una frase que papel juega esa pieza en el diseno y de que depende lo que viene despues.
8. "role" solo puede ser: fundamento, nucleo, practica, extension.

Contenido de una pieza nueva:
- 2 a 6 bloques. Tipos permitidos: markdown, formula, codigo, lista, nota, aviso, datos, quiz.
- "markdown" usa markdown ligero y puede incluir LaTeX entre $...$ (linea) o $$...$$ (bloque).
- "formula" usa el campo "tex" con LaTeX puro, sin delimitadores.
- "datos" usa "rows": una tabla de comparacion (por ejemplo "que cree el jugador" contra "que descubre").
- "aviso" marca un RIESGO DE DISENO, no una advertencia generica.
- "lista" enumera decisiones concretas, no topicos.
- Nada de contenido de relleno: decisiones de diseno concretas y verificables.

Responde UNICAMENTE con un objeto JSON valido con esta forma exacta:
{
  "title": "titulo corto del gameflow",
  "summary": "una o dos frases sobre el diseno",
  "subject": "final | revelacion | emocion | mecanica | lugar | pista",
  "rationale": "por que este diseno y no otro",
  "estimatedMin": 30,
  "steps": [
    { "order": 1, "lessonId": "id-del-ancla", "role": "nucleo", "rationale": "..." }
  ],
  "newLessons": [
    {
      "id": "gf-slug-corto",
      "title": "...",
      "subject": "revelacion",
      "level": 1,
      "durationMin": 5,
      "summary": "...",
      "objectives": ["..."],
      "prereq": ["id-existente-o-vacio"],
      "unlocks": ["id-existente-o-vacio"],
      "tags": ["..."],
      "skills": ["..."],
      "content": [ { "type": "markdown", "text": "..." } ]
    }
  ]
}`

/**
 * ¿Este proveedor acepta `response_format: json_object`?
 *
 * Google AI Studio (endpoint compatible) lo rechaza en varias versiones de su
 * capa de compatibilidad. Un 400 por un campo OPCIONAL dejaria al usuario sin
 * conexion sin saber por que, asi que ahi se manda sin modo JSON: los parsers ya
 * saben sacar el JSON del texto.
 */
export function soportaJsonMode(baseUrl = '') {
    return !/generativelanguage\.googleapis\.com/i.test(String(baseUrl))
}

const RESPONSE_SCHEMA_HINT = `Recuerda: solo JSON valido, sin texto adicional, sin bloques de codigo alrededor.`

/** Construye el mensaje de usuario con el catalogo recortado a fichas. */
export function buildCatalogMessage(prompt, lessons, contexto = {}) {
    const fichas = lessons.map(toCatalogCard)
    const bloque = {
        peticion_alumno: prompt,
        lecciones_ya_cursadas: contexto.completadas || [],
        lecciones_ya_visibles_en_el_grafo: contexto.visibles || [],
        catalogo: fichas,
        recordatorio: RESPONSE_SCHEMA_HINT,
    }
    return JSON.stringify(bloque)
}

/**
 * Valida y sanea la respuesta del modelo:
 * - descarta pasos con ids inexistentes (anti-alucinacion)
 * - exige que exista al menos un paso valido
 * - sanea bloques de lecciones nuevas
 */
export function parseRouteResponse(raw, prompt, index) {
    const route = normalizeRoute(raw, prompt)

    // Las firmas de los ids del catalogo, para detectar duplicados sin depender
    // de mayusculas, guiones ni acentos.
    const firmas = new Set([...index.keys()].map(firmaDeId))

    const newLessons = route.newLessons
        .map((lesson) => sanitizeNewLesson(lesson, index, firmas))
        .filter(Boolean)

    const idsNuevos = new Set(newLessons.map((l) => l.id))

    const pasosValidos = route.steps.filter((paso) => index.has(paso.lessonId) || idsNuevos.has(paso.lessonId))
    const descartados = route.steps.length - pasosValidos.length

    return {
        ...route,
        steps: pasosValidos.map((paso, i) => ({ ...paso, order: i + 1 })),
        newLessons,
        rejectedSteps: descartados,
        generatedBy: route.generatedBy || 'llm',
    }
}

/**
 * Firma de un id: sin mayusculas, sin acentos y sin separadores.
 *
 * Existe por un fallo real: el saneado normalizaba el id que venia y luego lo
 * buscaba en un indice con las claves ORIGINALES. Con ids en mayusculas y con
 * guion —como los del GNI (`PHIL-01`)— la busqueda fallaba y el motor podia
 * colar un nodo duplicado. Ahora se compara por firma.
 */
function firmaDeId(valor) {
    return normalizar(valor).replace(/\s+/g, '')
}

function sanitizeNewLesson(raw, index, firmas = new Set()) {
    // El id se respeta TAL COMO VIENE: `ANC-01` y no `anc-01`. El disenador usa
    // mayusculas con guion y cambiarlas romperia la convencion.
    const id = String(raw.id || raw.slug || '').trim()
    if (!id || id.length < 3) return null

    const firma = firmaDeId(id)
    if (firmas.has(firma)) return null
    firmas.add(firma)

    const subject = SUBJECT_KEYS.includes(raw.subject) ? raw.subject : 'umbra'
    const level = [1, 2, 3].includes(Number(raw.level)) ? Number(raw.level) : 1

    const content = (Array.isArray(raw.content) ? raw.content : [])
        .filter((bloque) => bloque && BLOCK_KINDS.includes(bloque.type))
        .map((bloque) => sanitizeBlock(bloque))
        .filter(Boolean)

    return {
        id,
        title: String(raw.title || id).trim(),
        subject,
        level,
        durationMin: Number(raw.durationMin) > 0 ? Number(raw.durationMin) : 15,
        summary: String(raw.summary || '').trim(),
        objectives: arrayDe(raw.objectives),
        prereq: arrayDe(raw.prereq).filter((p) => index.has(p) || p !== id),
        unlocks: arrayDe(raw.unlocks).filter((u) => index.has(u) || u !== id),
        tags: arrayDe(raw.tags),
        skills: arrayDe(raw.skills),
        content: content.length ? content : [{ type: 'markdown', text: raw.summary || '' }],
        origin: 'generado',
    }
}

function sanitizeBlock(bloque) {
    switch (bloque.type) {
        case 'formula':
            if (!bloque.tex) return null
            return { type: 'formula', tex: String(bloque.tex), caption: texto(bloque.caption) }
        case 'codigo':
            if (!bloque.text) return null
            return {
                type: 'codigo',
                lang: texto(bloque.lang) || 'text',
                text: String(bloque.text),
                caption: texto(bloque.caption),
            }
        case 'lista': {
            const items = arrayDe(bloque.items)
            return items.length ? { type: 'lista', items, text: texto(bloque.text) } : null
        }
        case 'datos': {
            const rows = Array.isArray(bloque.rows) ? bloque.rows.filter((r) => r && typeof r === 'object') : []
            return rows.length ? { type: 'datos', rows, caption: texto(bloque.caption) } : null
        }
        case 'quiz': {
            const quiz = bloque.quiz || bloque
            const options = arrayDe(quiz.options)
            if (!quiz.q || options.length < 2) return null
            return {
                type: 'quiz',
                quiz: {
                    q: String(quiz.q),
                    options,
                    answer: Number.isInteger(quiz.answer) && quiz.answer < options.length ? quiz.answer : 0,
                    why: texto(quiz.why),
                },
            }
        }
        case 'nota':
        case 'aviso':
            return bloque.text ? { type: bloque.type, text: String(bloque.text) } : null
        case 'markdown':
            return bloque.text ? { type: 'markdown', text: String(bloque.text) } : null
        default:
            return null
    }
}

function arrayDe(value) {
    if (!value) return []
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
    return String(value)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
}

function texto(value) {
    return value ? String(value) : undefined
}

/** Extrae el primer objeto JSON de una respuesta que puede venir con texto alrededor. */
export function extractJson(content) {
    if (!content) throw new Error('El modelo respondio vacio.')
    const limpio = String(content)
        .replace(/^\s*```(?:json)?/i, '')
        .replace(/```\s*$/, '')
        .trim()
    try {
        return JSON.parse(limpio)
    } catch {
        /* sigue con la extraccion por llaves */
    }
    const inicio = limpio.indexOf('{')
    const fin = limpio.lastIndexOf('}')
    if (inicio === -1 || fin <= inicio) {
        throw new Error('La respuesta no contiene JSON reconocible.')
    }
    return JSON.parse(limpio.slice(inicio, fin + 1))
}

/**
 * Cliente de un endpoint compatible con la API de chat completions
 * (DeepSeek, OpenAI, Groq, Together, Ollama, vLLM...).
 */
export async function callChatCompletions({
    baseUrl,
    apiKey,
    model,
    messages,
    temperature = 0.3,
    maxTokens = 4096,
    jsonMode = true,
    signal,
}) {
    const url = joinUrl(baseUrl, '/chat/completions')
    const headers = { 'Content-Type': 'application/json' }
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`

    const cuerpo = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
    }
    // `response_format` no lo aceptan todos los proveedores compatibles. Google
    // AI Studio, por ejemplo, lo rechaza en varias versiones de su capa de
    // compatibilidad, y un 400 por un campo opcional dejaria al usuario sin
    // conexion sin saber por que. Los parsers ya saben sacar el JSON del texto.
    if (jsonMode) cuerpo.response_format = { type: 'json_object' }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        signal,
        body: JSON.stringify(cuerpo),
    })

    if (!response.ok) {
        const detalle = await safeText(response)
        throw new Error(
            `El proveedor respondio ${response.status}. ${resumir(detalle) || 'Revisa endpoint, modelo y API key.'}`,
        )
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    const usage = data?.usage
    return { content, usage }
}

function joinUrl(base, ruta) {
    const limpio = String(base || '').replace(/\/+$/, '')
    return `${limpio}${ruta}`
}

async function safeText(response) {
    try {
        return await response.text()
    } catch {
        return ''
    }
}

function resumir(texto) {
    return String(texto || '').slice(0, 300)
}

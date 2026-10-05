import { toCatalogCard } from '../domain/lesson.js'
import { normalizar } from '../data/catalog.js'
import { BLOCK_KINDS, normalizeRoute, SUBJECT_KEYS } from './contract.js'

/**
 * Sistema de instrucciones del clasificador de lecciones.
 * Es el corazon del producto: define COMO se piensa una ruta.
 */
export const SYSTEM_PROMPT = `Eres el clasificador de una academia digital. Recibes la peticion de un alumno y el CATALOGO de lecciones existentes, y devuelves la RUTA de aprendizaje como secuencia ordenada de nodos.

Reglas obligatorias:
1. Trabaja con el catalogo. Cada paso debe referenciar el "id" exacto de una leccion del catalogo. Nunca inventes ids.
2. Si el catalogo no cubre un concepto necesario, puedes proponer lecciones nuevas en "newLessons". Una leccion nueva puede ser prerequisito (por ejemplo, un fundamento que falta) o continuacion. Maximo 4 por respuesta. Solo cuando sea imprescindible para una ruta coherente.
3. Ordena los pasos de lo simple a lo complejo respetando los prerrequisitos: ningun paso debe exigir algo que aparezca despues.
4. La ruta debe llevar al objetivo del alumno en el menor numero de lecciones que siga siendo pedagogicamente solido. Entre 3 y 8 pasos.
5. Escribe en espanol neutro, claro y directo. Sin adornos ni relleno.
6. El campo "rationale" de cada paso explica en una frase por que ese nodo va ahi y que aporta al objetivo.
7. "role" solo puede ser: fundamento, nucleo, practica, extension.

Contenido de una leccion nueva:
- 4 a 8 bloques. Tipos permitidos: markdown, formula, codigo, lista, nota, aviso, datos, quiz.
- "markdown" usa markdown ligero y puede incluir LaTeX entre $...$ (linea) o $$...$$ (bloque).
- "formula" usa el campo "tex" con LaTeX puro, sin delimitadores.
- "codigo" usa "lang" y "text"; el codigo debe ser correcto y ejecutable.
- "quiz" usa { q, options: string[3], answer: indice correcto, why }.
- Nada de contenido generico: datos concretos, ejemplos resueltos y errores tipicos reales.

Responde UNICAMENTE con un objeto JSON valido con esta forma exacta:
{
  "title": "titulo corto de la ruta",
  "summary": "una o dos frases sobre la ruta",
  "subject": "mate | codigo | fisica | datos | lengua",
  "rationale": "por que esta ruta y no otra",
  "estimatedMin": 90,
  "steps": [
    { "order": 1, "lessonId": "id-del-catalogo", "role": "fundamento", "rationale": "..." }
  ],
  "newLessons": [
    {
      "id": "mate-slug-corto",
      "title": "...",
      "subject": "mate",
      "level": 1,
      "durationMin": 15,
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

    const newLessons = route.newLessons
        .map((lesson) => sanitizeNewLesson(lesson, index))
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

function sanitizeNewLesson(raw, index) {
    const id = normalizar(raw.id || raw.slug || '').replace(/\s+/g, '-')
    if (!id || id.length < 3 || index.has(id)) return null

    const subject = SUBJECT_KEYS.includes(raw.subject) ? raw.subject : 'mate'
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
    signal,
}) {
    const url = joinUrl(baseUrl, '/chat/completions')
    const headers = { 'Content-Type': 'application/json' }
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`

    const response = await fetch(url, {
        method: 'POST',
        headers,
        signal,
        body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
        }),
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

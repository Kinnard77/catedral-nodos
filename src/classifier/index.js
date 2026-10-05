import { createLocalProvider } from './localProvider.js'
import { buildCatalogMessage, callChatCompletions, extractJson, parseRouteResponse, SYSTEM_PROMPT } from './llmProvider.js'
import { indexById, mergeLessons, SEED_LESSONS } from '../data/catalog.js'
import { normalizeLesson } from '../domain/lesson.js'
import { emptyRoute, retrieveLessons } from './contract.js'

export const DEFAULT_LLM = {
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
}

export const PRESETS = [
    { id: 'deepseek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
    { id: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
    { id: 'groq', label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
    { id: 'together', label: 'Together', baseUrl: 'https://api.together.xyz/v1', model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
    { id: 'ollama', label: 'Ollama local', baseUrl: 'http://localhost:11434/v1', model: 'llama3.1' },
]

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

/** Catalogo base + lecciones generadas en sesiones anteriores. */
export function buildCatalog(generated = []) {
    const normales = generated
        .map((l) => ({ ...normalizeLesson(l), origin: l.origin || 'generado' }))
    return {
        lessons: mergeLessons(SEED_LESSONS, normales),
        seed: SEED_LESSONS,
    }
}

export { emptyRoute }

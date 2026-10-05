import { mathLessons } from './lessons/matematicas.js'
import { codeLessons } from './lessons/programacion.js'
import { physicsLessons } from './lessons/fisica.js'
import { dataLessons } from './lessons/datos.js'
import { languageLessons } from './lessons/lengua.js'

/** Catalogo semilla que se envia al clasificador cuando no hay nada generado todavia. */
export const SEED_LESSONS = [
    ...mathLessons,
    ...codeLessons,
    ...physicsLessons,
    ...dataLessons,
    ...languageLessons,
]

/** Une semilla y lecciones generadas sin duplicar IDs (lo generado gana). */
export function mergeLessons(seed, generated = []) {
    const map = new Map()
    for (const lesson of seed) map.set(lesson.id, lesson)
    for (const lesson of generated) map.set(lesson.id, lesson)
    return [...map.values()]
}

/** Indice de acceso rapido por id. */
export function indexById(lessons) {
    const index = new Map()
    for (const lesson of lessons) index.set(lesson.id, lesson)
    return index
}

/**
 * Aristas del grafo. `prereq` marca una dependencia dura:
 * el nodo no deberia abrirse sin ella. `sugerido` viene de `unlocks`
 * y solo ordena la ruta, no la bloquea.
 */
export function buildEdges(lessons) {
    const ids = new Set(lessons.map((l) => l.id))
    const edges = []
    const seen = new Set()

    const push = (from, to, kind) => {
        if (!ids.has(from) || !ids.has(to) || from === to) return
        const key = `${from}->${to}:${kind}`
        if (seen.has(key)) return
        seen.add(key)
        edges.push({ id: key, from, to, kind })
    }

    for (const lesson of lessons) {
        for (const pre of lesson.prereq) push(pre, lesson.id, 'prereq')
        for (const next of lesson.unlocks) push(lesson.id, next, 'sugerido')
    }
    return edges
}

/** Materias presentes en el catalogo, con conteo de lecciones. */
export function subjectBreakdown(lessons) {
    const counts = new Map()
    for (const lesson of lessons) {
        counts.set(lesson.subject, (counts.get(lesson.subject) || 0) + 1)
    }
    return [...counts.entries()].map(([subject, count]) => ({ subject, count }))
}

/** Minutos totales del catalogo: se muestra como tamano de la academia. */
export function totalMinutes(lessons) {
    return lessons.reduce((sum, l) => sum + (l.durationMin || 0), 0)
}

/**
 * Aplana un conjunto de IDs a lecciones, preservando el orden pedido
 * y descartando los que no existen. Es la defensa contra alucinaciones del LLM.
 */
export function resolveIds(ids, index) {
    const out = []
    const vistos = new Set()
    for (const id of ids || []) {
        const limpio = String(id || '').trim()
        if (!limpio || vistos.has(limpio)) continue
        const lesson = index.get(limpio)
        if (!lesson) continue
        vistos.add(limpio)
        out.push(lesson)
    }
    return out
}

/** Encuentra lecciones cuyo id o titulo coincide de forma difusa con un texto. */
export function findByText(texto, lessons) {
    const objetivo = normalizar(texto)
    if (!objetivo) return []
    return lessons.filter((l) => {
        const heno = normalizar(`${l.id} ${l.title} ${l.summary} ${l.tags.join(' ')}`)
        return heno.includes(objetivo)
    })
}

export function normalizar(texto) {
    return String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

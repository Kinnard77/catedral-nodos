import { normalizar } from '../data/catalog.js'

export const SUBJECT_KEYS = ['mate', 'codigo', 'fisica', 'datos', 'lengua']

export const BLOCK_KINDS = ['markdown', 'formula', 'codigo', 'lista', 'nota', 'aviso', 'datos', 'quiz']

/**
 * Contrato que devuelve CUALQUIER clasificador (LLM, JAV remoto o demo local)
 * despues de interpretar el prompt del alumno.
 */
export function emptyRoute(prompt) {
    return {
        prompt,
        title: prompt,
        summary: '',
        subject: null,
        rationale: '',
        steps: [],
        newLessons: [],
        estimatedMin: 0,
        generatedBy: '',
        createdAt: new Date().toISOString(),
    }
}

export function normalizeRoute(raw, prompt) {
    const base = emptyRoute(prompt)
    if (!raw || typeof raw !== 'object') return base

    const steps = Array.isArray(raw.steps) ? raw.steps : []
    return {
        ...base,
        title: String(raw.title || base.title).trim(),
        summary: String(raw.summary || '').trim(),
        subject: SUBJECT_KEYS.includes(raw.subject) ? raw.subject : null,
        rationale: String(raw.rationale || '').trim(),
        estimatedMin: Number(raw.estimatedMin) > 0 ? Number(raw.estimatedMin) : 0,
        newLessons: Array.isArray(raw.newLessons) ? raw.newLessons.filter(Boolean) : [],
        steps: steps
            .map((step, i) => ({
                lessonId: String(step.lessonId || step.id || '').trim(),
                order: Number.isFinite(Number(step.order)) ? Number(step.order) : i + 1,
                rationale: String(step.rationale || step.porQue || '').trim(),
                role: ['fundamento', 'nucleo', 'practica', 'extension'].includes(step.role)
                    ? step.role
                    : 'nucleo',
            }))
            .filter((step) => step.lessonId)
            .sort((a, b) => a.order - b.order),
        generatedBy: String(raw.generatedBy || raw.provider || 'desconocido'),
    }
}

/** Palabras vacias del espanol: no aportan a la recuperacion. */
const STOPWORDS = new Set(
    `a al algo algunas algunos ante antes como con contra cual cuando de del desde donde dos el ella ellas ellos en entre era eres es esa esas ese eso esos esta estas este esto estos fue ha hasta la las le les lo los mas me mi mis mucho muy no nos o os otra otras otro otros para pero poco por porque que quien se segun ser si sin sobre son su sus te tiene todo todos tu tus un una unas uno unos y ya quiero queria necesito necesitaria aprender estudiame ensename dame hazme curso clase leccion lecciones tema sobre como`.split(
        /\s+/,
    ),
)

export function tokenize(texto) {
    return normalizar(texto)
        .split(' ')
        .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

/** Coincidencia parcial de raiz: "pitagoras" contra "pitagorico". */
function raizComun(a, b) {
    const n = Math.min(a.length, b.length, 6)
    if (n < 4) return false
    return a.slice(0, n) === b.slice(0, n)
}

export function scoreLesson(lesson, tokens) {
    if (!tokens.length) return 0
    const title = normalizar(lesson.title)
    const summary = normalizar(lesson.summary)
    const tags = normalizar(lesson.tags.join(' '))
    const objetivos = normalizar(lesson.objectives.join(' '))
    const id = normalizar(lesson.id)

    let score = 0
    for (const token of tokens) {
        if (id.includes(token) || title.includes(token)) score += 6
        if (tags.includes(token)) score += 4
        if (summary.includes(token)) score += 2.5
        if (objetivos.includes(token)) score += 1.5

        if (score === 0) {
            const campos = [title, tags, id]
            if (campos.some((campo) => campo.split(' ').some((palabra) => raizComun(palabra, token)))) {
                score += 2
            }
        }
    }
    return score
}

/** Marca de calidad: prefiere fundamentos cuando hay empate. */
function bonusEstructura(lesson) {
    const prereqPenalizada = Math.max(0, 3 - lesson.level) * 0.4
    const nucleo = lesson.level === 2 ? 0.3 : 0
    return prereqPenalizada + nucleo
}

/**
 * Recupera el subconjunto de lecciones relevantes para un prompt.
 * Con cientos de lecciones esto sustituye a mandar todo el catalogo al LLM.
 */
export function retrieveLessons(prompt, lessons, { top = 8, minScore = 3 } = {}) {
    const tokens = tokenize(prompt)
    const ranking = lessons
        .map((lesson) => ({ lesson, score: scoreLesson(lesson, tokens) + bonusEstructura(lesson) }))
        .filter((row) => row.score >= minScore)
        .sort((a, b) => b.score - a.score)

    if (ranking.length) return ranking.slice(0, top)

    // Sin coincidencias claras: devuelve el punto de entrada por materia
    const materia = detectarMateria(prompt, lessons)
    return lessons
        .filter((l) => (materia ? l.subject === materia : true) && l.level === 1)
        .slice(0, top)
        .map((lesson) => ({ lesson, score: 1 }))
}

/** Adivina la materia dominante del prompt contando coincidencias por materia. */
export function detectarMateria(prompt, lessons) {
    const tokens = tokenize(prompt)
    if (!tokens.length) return null
    const acumulado = new Map()
    for (const lesson of lessons) {
        const s = scoreLesson(lesson, tokens)
        if (s > 0) acumulado.set(lesson.subject, (acumulado.get(lesson.subject) || 0) + s)
    }
    let mejor = null
    let max = 0
    for (const [subject, score] of acumulado) {
        if (score > max) {
            max = score
            mejor = subject
        }
    }
    return max >= 4 ? mejor : null
}

/**
 * Cierre de prerequisitos: dada una leccion objetivo, agrega recursivamente
 * lo que hay que dominar antes. Es lo que convierte una lista de coincidencias
 * en una RUTA con orden pedagogico.
 */
export function prerequisiteClosure(lessonId, index, { max = 6 } = {}) {
    const resultado = []
    const visitados = new Set()

    const visitar = (id, profundidad) => {
        if (visitados.has(id) || profundidad > 4) return
        const lesson = index.get(id)
        if (!lesson) return
        visitados.add(id)
        for (const pre of lesson.prereq) visitar(pre, profundidad + 1)
        resultado.push(lesson)
    }

    visitar(lessonId, 0)
    return resultado.slice(0, max)
}

/**
 * Orden pedagogico por CAPAS topologicas.
 *
 * Ordenar por nivel no basta: dentro del mismo nivel un objetivo puede quedar
 * antes que su propio prerrequisito. Aqui cada leccion recibe una capa igual a
 * la longitud de la cadena de prerrequisitos mas larga que la sostiene, de modo
 * que todo prerrequisito cae siempre en una capa anterior. Los empates se rompen
 * por nivel, luego por cantidad de prerrequisitos y por titulo, para que el
 * resultado sea estable entre ejecuciones.
 */
export function pedagogicalSort(lessons) {
    const conjunto = new Map(lessons.map((l) => [l.id, l]))
    const capas = new Map()

    const capaDe = (id, visitando = new Set()) => {
        if (capas.has(id)) return capas.get(id)
        const lesson = conjunto.get(id)
        if (!lesson || visitando.has(id)) return 0
        visitando.add(id)
        const previas = lesson.prereq
            .filter((pre) => conjunto.has(pre))
            .map((pre) => capaDe(pre, visitando))
        const capa = previas.length ? Math.max(...previas) + 1 : 0
        visitando.delete(id)
        capas.set(id, capa)
        return capa
    }

    for (const lesson of lessons) capaDe(lesson.id)

    return [...lessons].sort(
        (a, b) =>
            capas.get(a.id) - capas.get(b.id) ||
            a.level - b.level ||
            a.prereq.length - b.prereq.length ||
            a.title.localeCompare(b.title, 'es'),
    )
}

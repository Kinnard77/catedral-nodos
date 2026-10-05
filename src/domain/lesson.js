/**
 * Modelo de dominio de la Academia.
 *
 * Una LECCION es la unidad catalogable. Un NODO del grafo es una proyeccion
 * visual de una leccion dentro de una ruta concreta, con estado de desbloqueo.
 *
 * Los objetos se documentan aqui (JS puro, sin TypeScript) para que el contrato
 * quede explicito cuando JAV sustituya al clasificador LLM.
 *
 * @typedef {Object} Lesson
 * @property {string}   id            Identificador estable tipo slug: "mate-pitagoras".
 * @property {string}   title         Titulo legible.
 * @property {string}   subject       Materia: mate | codigo | fisica | datos.
 * @property {string}   level         1 = fundamentos, 2 = intermedio, 3 = avanzado.
 * @property {number}   durationMin   Duracion estimada en minutos.
 * @property {string}   summary       Una o dos frases. Es el texto que ve el clasificador.
 * @property {string[]} objectives    Resultados de aprendizaje verificables.
 * @property {string[]} prereq        IDs que conviene dominar antes.
 * @property {string[]} unlocks       IDs que habilita de forma natural.
 * @property {string[]} tags          Etiquetas libres para recuperacion.
 * @property {string[]} skills        Habilidades evaluables (curriculo).
 * @property {Block[]}  content       Secuencia de bloques renderizables.
 * @property {Object}   [assets]      Recursos opcionales: video, practica, lectura.
 *
 * @typedef {Object} Block
 * @property {string} type  markdown | formula | codigo | lista | nota | aviso | datos | quiz
 * @property {string} [text]     Cuerpo en markdown ligero (soporta $...$ y $$...$$).
 * @property {string} [tex]      Expresion LaTeX cuando type === "formula".
 * @property {string} [caption]  Leyenda de la formula o del bloque de codigo.
 * @property {string} [lang]     Lenguaje del bloque de codigo.
 * @property {string[]} [items]  Elementos cuando type === "lista".
 * @property {Object[]} [rows]   Filas cuando type === "datos" (array de objetos).
 * @property {Object} [quiz]     Pregunta de comprobacion.
 * @property {string} quiz.q
 * @property {string[]} quiz.options
 * @property {number} quiz.answer  Indice de la opcion correcta.
 * @property {string} [quiz.why]   Explicacion de la respuesta.
 */

export const SUBJECTS = {
    mate: { label: 'Matematicas', color: '#38bdf8', glyph: '∑' },
    codigo: { label: 'Programacion', color: '#a78bfa', glyph: '{}' },
    fisica: { label: 'Fisica', color: '#4ade9e', glyph: '⚛' },
    datos: { label: 'Datos e IA', color: '#fbbf24', glyph: '◈' },
    lengua: { label: 'Lengua y escritura', color: '#fb7185', glyph: '¶' },
}

export const LEVELS = {
    1: { label: 'Fundamentos', short: 'Base' },
    2: { label: 'Intermedio', short: 'Inter' },
    3: { label: 'Avanzado', short: 'Avz' },
}

export function subjectOf(lesson) {
    return SUBJECTS[lesson?.subject] || { label: 'General', color: '#94a3b8', glyph: '•' }
}

export function levelOf(lesson) {
    return LEVELS[lesson?.level] || LEVELS[1]
}

/**
 * Normaliza una leccion escrita a mano o devuelta por un LLM,
 * rellenando campos opcionales y garantizando arrays.
 */
export function normalizeLesson(raw) {
    const id = String(raw.id || raw.slug || '').trim()
    return {
        id,
        title: String(raw.title || id).trim(),
        subject: SUBJECTS[raw.subject] ? raw.subject : 'mate',
        level: [1, 2, 3].includes(Number(raw.level)) ? Number(raw.level) : 1,
        durationMin: Number(raw.durationMin) > 0 ? Number(raw.durationMin) : 15,
        summary: String(raw.summary || '').trim(),
        objectives: toStringArray(raw.objectives),
        prereq: toStringArray(raw.prereq),
        unlocks: toStringArray(raw.unlocks),
        tags: toStringArray(raw.tags),
        skills: toStringArray(raw.skills),
        content: Array.isArray(raw.content) ? raw.content.filter(Boolean) : [],
        assets: raw.assets && typeof raw.assets === 'object' ? raw.assets : undefined,
        origin: raw.origin || 'catalogo',
    }
}

function toStringArray(value) {
    if (!value) return []
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
    return String(value)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
}

/**
 * Extrae la leccion en formato "ficha de catalogo": todo menos el contenido.
 * Es exactamente lo que se envia al clasificador para no gastar contexto.
 */
export function toCatalogCard(lesson) {
    return {
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject,
        level: lesson.level,
        durationMin: lesson.durationMin,
        summary: lesson.summary,
        objectives: lesson.objectives,
        prereq: lesson.prereq,
        unlocks: lesson.unlocks,
        tags: lesson.tags,
        skills: lesson.skills,
    }
}

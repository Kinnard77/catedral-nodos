/**
 * Modelo de dominio del Gameflow de catedrales.
 *
 * Una PIEZA DE DISEÑO es la unidad catalogable. Un NODO del grafo es la
 * proyeccion visual de una pieza dentro del gameflow que se esta disenando.
 *
 * El metodo es DISENO INVERSO: se empieza por el final (que queremos que el
 * jugador sienta y descubra) y se trabaja hacia atras preguntando que hace
 * falta antes. Por eso una pieza declara `prereq` (lo que tiene que estar
 * resuelto antes) y el lienzo revela los prerrequisitos primero.
 *
 * Nota sobre los nombres internos: los campos siguen llamandose `subject` y
 * `level` (y las funciones `subjectOf` / `levelOf`) porque renombrarlos
 * tocaria el clasificador, el layout y todos los componentes a la vez. Lo que
 * cambio es su SIGNIFICADO, documentado abajo, y todas las etiquetas visibles.
 *
 * @typedef {Object} Pieza
 * @property {string}   id            Identificador estable tipo slug: "gf-ancla".
 * @property {string}   title         Titulo legible.
 * @property {string}   subject       Tipo de pieza: final | revelacion | emocion | mecanica | lugar | pista.
 * @property {number}   level         Concrecion: 1 = intencion, 2 = mecanica, 3 = escena.
 * @property {number}   durationMin   Minutos de juego estimados.
 * @property {string}   summary       Una o dos frases. Es lo que ve el motor de despliegue.
 * @property {string[]} objectives    Que debe lograr esta pieza en el jugador.
 * @property {string[]} prereq        IDs que tienen que estar resueltos antes.
 * @property {string[]} unlocks       IDs que habilita de forma natural.
 * @property {string[]} tags          Etiquetas libres para recuperacion.
 * @property {string[]} skills        Habilidades o recursos que pone en juego.
 * @property {import('./lesson.js').Block[]} content Secuencia de bloques renderizables.
 * @property {Object}   [assets]      Recursos opcionales: video, practica, lectura.
 * @property {boolean}  [ancla]       true solo en el nodo raiz del diseno: el FINAL
 *                                    del juego. El lienzo abre por el y revela hacia
 *                                    atras. Solo se declara en la semilla.
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

/**
 * Tipos de pieza del gameflow. Ocupa el campo `subject`.
 *
 * Vocabulario UMBRA: `premisa` es la clase de nodo que fija el marco (la
 * catedral), y los cuatro siguientes son las **Cuatro Columnas** del GDD, que
 * sirven para que cada ruta se lea de un color. `umbra` es la convergencia: el
 * metapuzzle, que es el final del juego.
 */
export const SUBJECTS = {
    premisa: { label: 'Premisa', color: '#e2e8f0', glyph: '⌘' },
    arte: { label: 'Arte · Tiempo', color: '#fbbf24', glyph: '★' },
    religion: { label: 'Religión', color: '#38bdf8', glyph: '✚' },
    ciencia: { label: 'Ciencia', color: '#4ade9e', glyph: '⚗' },
    filosofia: { label: 'Filosofía', color: '#fb7185', glyph: 'Φ' },
    umbra: { label: 'UMBRA · convergencia', color: '#a78bfa', glyph: '◆' },
    // Clases de nodo del GNI (especificacion del disenador). Se buscan por
    // el campo `tipo`, no por `subject`: son dos ejes distintos — el tema
    // (Columna) y la clase de nodo.
    anchor: { label: 'Anclaje visible', color: '#fbbf24', glyph: '⌖' },
    red_herring: { label: 'Arenque rojo', color: '#fb7185', glyph: '⚑' },
    epigraphy: { label: 'Epigrafía latina', color: '#38bdf8', glyph: '⁘' },
    calambur: { label: 'Calambur esotérico', color: '#a78bfa', glyph: '⁂' },
    divergence: { label: 'Divergencia', color: '#4ade9e', glyph: '⇄' },
    philosophical: { label: 'Núcleo filosófico', color: '#e2e8f0', glyph: 'Φ' },
}

/**
 * `premisa` NO es un tipo de puzle como los demás: es la clase de nodo que
 * fija el marco del diseño (hoy, la catedral en la que se trabaja). Un puzle se
 * resuelve; una premisa se elige. Es la raíz del PDC, y es una pieza que el
 * Puzzle Dependency Chart clásico no tiene: allí la raíz es siempre un puzle
 * sin dependencias.
 */
export const CLASE_PREMISA = 'premisa'

/** Alias con el nombre del dominio. `SUBJECTS` se mantiene por compatibilidad. */
export const TIPOS = SUBJECTS

/** Altura del nodo en el grafo: puzle de ruta, metapuzzle, o material de lore. */
export const LEVELS = {
    1: { label: 'Puzle', short: 'Puz' },
    2: { label: 'Metapuzzle', short: 'Meta' },
    3: { label: 'Lore', short: 'Lore' },
}

export function subjectOf(pieza) {
    // El GNI manda si esta: la clase de nodo es mas especifica que el tema.
    if (pieza?.tipo && SUBJECTS[pieza.tipo]) return SUBJECTS[pieza.tipo]
    return SUBJECTS[pieza?.subject] || { label: 'General', color: '#94a3b8', glyph: '•' }
}

export function levelOf(pieza) {
    return LEVELS[pieza?.level] || LEVELS[1]
}

/**
 * Normaliza una pieza escrita a mano o devuelta por un LLM,
 * rellenando campos opcionales y garantizando arrays.
 */
export function normalizeLesson(raw) {
    const id = String(raw.id || raw.slug || '').trim()
    return {
        id,
        title: String(raw.title || id).trim(),
        subject: SUBJECTS[raw.subject] ? raw.subject : 'umbra',
        level: [1, 2, 3].includes(Number(raw.level)) ? Number(raw.level) : 1,
        durationMin: Number(raw.durationMin) > 0 ? Number(raw.durationMin) : 5,
        summary: String(raw.summary || '').trim(),
        objectives: toStringArray(raw.objectives),
        prereq: toStringArray(raw.prereq),
        unlocks: toStringArray(raw.unlocks),
        /**
         * LA ETIQUETA DE LA ARISTA: qué te llevas de este nodo y hace falta
         * después. En un PDC la flecha dice QUÉ transfiere, no solo que hay
         * dependencia — sin la etiqueta el dibujo son rayas.
         */
        entrega: String(raw.entrega || '').trim(),
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
 * Extrae la pieza en formato "ficha de catalogo": todo menos el contenido.
 * Es exactamente lo que se envia al motor para no gastar contexto.
 */
export function toCatalogCard(pieza) {
    return {
        id: pieza.id,
        title: pieza.title,
        subject: pieza.subject,
        level: pieza.level,
        durationMin: pieza.durationMin,
        summary: pieza.summary,
        objectives: pieza.objectives,
        prereq: pieza.prereq,
        unlocks: pieza.unlocks,
        entrega: pieza.entrega,
        tags: pieza.tags,
        skills: pieza.skills,
    }
}

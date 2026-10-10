/**
 * Los ELEMENTOS de una catedral: el material con el que se diseña.
 *
 * El diseñador lo dijo así: *«¿qué misterio conviene trabajar en esta catedral
 * si tenemos estos y aquellos elementos reales y ficticios o modificados?»*.
 * Fíjate en la segunda mitad de la frase. Antes de decidir qué misterio
 * conviene hay que tener el material encima de la mesa, porque sin material
 * solo se puede INVENTAR, y no podemos descubrir el Santo Grial en Sevilla
 * porque está en Valencia.
 *
 * De ahí la regla de este fichero: un elemento **real** no se guarda sin la
 * fuente que lo sostiene. Un elemento que nos inventamos o modificamos se marca
 * como tal y no necesita fuente, porque no afirma nada.
 *
 * IDIOMAS: los textos se guardan ya por idioma (`textos.es`), aunque hoy solo se
 * escriba en español. Con ~50 catedrales y cinco idiomas por delante, cambiar la
 * forma de guardar el texto más tarde sería rehacer todo el contenido.
 */

/** Los cinco idiomas objetivo. Hoy solo se escribe en el primero. */
export const IDIOMAS = [
    { id: 'es', label: 'Español' },
    { id: 'en', label: 'English' },
    { id: 'fr', label: 'Français' },
    { id: 'it', label: 'Italiano' },
    { id: 'de', label: 'Deutsch' },
]

export const IDIOMA_BASE = 'es'

/**
 * Las dos clases de material. La distinción es la que sostiene el
 * «¿será verdad?» del final: lo real se documenta, lo demás se declara.
 */
export const TIPOS_ELEMENTO = {
    real: {
        label: 'Real',
        detalle: 'Existe y se puede documentar. Necesita fuente.',
        color: '#4ade9e',
        glyph: '●',
    },
    modificable: {
        label: 'Inventado o modificado',
        detalle: 'Nos lo inventamos o lo alteramos. No afirma nada, así que no necesita fuente.',
        color: '#a78bfa',
        glyph: '◇',
    },
}

/**
 * Las categorías son, a la vez, la clasificación y EL INTERROGATORIO: cada una
 * trae la pregunta que ayuda a acordarse de lo que hay en el edificio. La
 * herramienta pregunta; el diseñador contesta.
 */
export const CATEGORIAS = [
    {
        id: 'arquitectura',
        label: 'Arquitectura',
        pregunta: '¿Qué partes del edificio destacan? Fachada, torre, cúpula, claustro, cripta, capillas…',
    },
    {
        id: 'arte',
        label: 'Arte',
        pregunta: '¿Qué obras hay dentro? Retablos, pinturas, esculturas, vidrieras, rejería, orfebrería…',
    },
    {
        id: 'sepulcro',
        label: 'Sepulcro',
        pregunta: '¿Quién está enterrado aquí? ¿Qué dice su lápida?',
    },
    {
        id: 'personaje',
        label: 'Personaje',
        pregunta: '¿Qué personajes están unidos a este edificio, dentro o fuera de él?',
    },
    {
        id: 'documento',
        label: 'Documento',
        pregunta: '¿Qué documentos, archivos, actas o inscripciones existen?',
    },
    {
        id: 'marca',
        label: 'Marca o símbolo',
        pregunta: '¿Hay marcas de cantero, signos, anagramas o símbolos grabados?',
    },
    {
        id: 'reliquia',
        label: 'Reliquia u objeto',
        pregunta: '¿Qué reliquias u objetos señeros guarda?',
    },
    {
        id: 'leyenda',
        label: 'Leyenda',
        pregunta: '¿Qué se cuenta de esta catedral que no está probado?',
    },
    {
        id: 'otro',
        label: 'Otro',
        pregunta: '¿Qué más hay que no encaje en lo anterior?',
    },
]

export function categoriaOf(id) {
    return CATEGORIAS.find((c) => c.id === id) || CATEGORIAS[CATEGORIAS.length - 1]
}

export function tipoOf(id) {
    return TIPOS_ELEMENTO[id] || TIPOS_ELEMENTO.real
}

/** Lee un campo de texto en el idioma pedido, con el español como respaldo. */
export function texto(elemento, campo, idioma = IDIOMA_BASE) {
    const textos = elemento?.textos || {}
    return textos[idioma]?.[campo] || textos[IDIOMA_BASE]?.[campo] || ''
}

/** Escribe un campo de texto en un idioma sin pisar los demás. */
export function escribirTexto(elemento, campo, valor, idioma = IDIOMA_BASE) {
    return {
        ...elemento,
        textos: {
            ...(elemento?.textos || {}),
            [idioma]: { ...((elemento?.textos || {})[idioma] || {}), [campo]: valor },
        },
    }
}

/**
 * Un elemento real exige fuente. Es la regla del Grial aplicada al material:
 * lo que afirmamos tiene que poder sostenerse.
 */
export function faltaFuente(elemento) {
    return elemento?.tipo === 'real' && !texto(elemento, 'fuente').trim()
}

/** Cuántos elementos hay de cada tipo. Para el resumen del panel. */
export function resumenElementos(elementos = []) {
    const reales = elementos.filter((e) => e.tipo === 'real').length
    return { total: elementos.length, reales, modificables: elementos.length - reales }
}

/** Los elementos de una catedral concreta, en el orden en que se añadieron. */
export function elementosDe(elementos = [], catedralId) {
    return elementos.filter((e) => e.catedralId === catedralId)
}

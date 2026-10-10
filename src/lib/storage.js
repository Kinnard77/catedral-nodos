const PREFIJO = 'gameflow:v1:'

/** Envuelve localStorage para que la app funcione aunque el navegador lo bloquee. */
export function guardar(clave, valor) {
    try {
        localStorage.setItem(PREFIJO + clave, JSON.stringify(valor))
        return true
    } catch {
        return false
    }
}

export function leer(clave, porDefecto = null) {
    try {
        const crudo = localStorage.getItem(PREFIJO + clave)
        if (crudo === null) return porDefecto
        return JSON.parse(crudo)
    } catch {
        return porDefecto
    }
}

export function borrar(clave) {
    try {
        localStorage.removeItem(PREFIJO + clave)
    } catch {
        /* sin persistencia disponible */
    }
}

export function borrarTodo() {
    try {
        for (const clave of Object.keys(localStorage)) {
            if (clave.startsWith(PREFIJO)) localStorage.removeItem(clave)
        }
    } catch {
        /* sin persistencia disponible */
    }
}

export const CLAVES = {
    settings: 'settings',
    generated: 'generated-lessons',
    progreso: 'progreso',
    historial: 'historial',
    /**
     * Enlaces de diseño añadidos a mano: `{ idDelPadre: [idsQueHacenFaltaAntes] }`.
     * Se guardan aparte de las piezas para poder insertar una pieza nueva ANTES
     * de una pieza de la semilla sin mutar el catálogo original.
     */
    enlaces: 'enlaces',
    /**
     * Catedrales añadidas desde el lienzo. La lista base la da el diseñador en
     * `src/data/catedrales.js`; esto solo guarda lo que sume por su cuenta.
     */
    catedrales: 'catedrales',
    /**
     * La premisa elegida: `{ catedralId, misterioId }`. Es la pregunta 0 del
     * diseño — en qué catedral se trabaja — y de ella depende todo lo demás.
     */
    premisa: 'premisa',
    /**
     * Los elementos de cada catedral: el material con el que se diseña. Un
     * elemento real no entra sin la fuente que lo sostiene.
     */
    elementos: 'elementos',
    /**
     * El material de cada catedral: las opciones que trae la investigacion
     * previa (el 80%) y que despues alimentan el grafo.
     */
    material: 'material',
    /** Marca de limpieza unica: el material de ejemplo ya no debe volver. */
    materialLimpiado: 'material-limpiado',
    /**
     * Las propuestas de misterio que devolvió el motor, por catedral. Se
     * guardan para poder volver a mirarlas sin gastar otra llamada.
     */
    propuestas: 'propuestas-misterios',
}

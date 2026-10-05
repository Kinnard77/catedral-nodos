const PREFIJO = 'academia:v1:'

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
}

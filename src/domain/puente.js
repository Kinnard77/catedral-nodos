/**
 * EL PUENTE: DEL MATERIAL AL GRAFO.
 *
 * Hasta ahora habia dos mitades que no se hablaban: el MATERIAL (lo que existe en
 * la catedral, en el panel izquierdo) y el GRAFO (el lienzo). No habia forma de
 * pasar de una a otra, y por eso la herramienta no servia para disenar.
 *
 * Cada opcion del material YA es un nodo del GN-IEC por su clase. Lo unico que
 * faltaba era decirlo y encadenarlos:
 *
 *     anclaje            -> anchor          (la piedra: define de que grafo hablamos)
 *     epigrafia          -> epigraphy
 *     linguistica        -> calambur
 *     dato_curioso       -> red_herring     (la explicacion plausible que atrapa)
 *     pilar secreto      -> philosophical   (EL FINAL: lo primero que se decide)
 *
 * Y la cadena se monta HACIA ATRAS, como manda el metodo: se empieza por el
 * nucleo filosofico —la herejia— y se camina hacia atras hasta la piedra.
 *
 * Los tipos que el material no traiga NO se inventan: se quedan fuera y el
 * disenador los anade con «Anadir lo que hace falta antes». Una cadena con
 * huecos declarados es honesta; una rellenada por la herramienta, no.
 */

/**
 * ¿Que tipo de nodo del GN-IEC es esta opcion de material?
 * Devuelve '' si no es ninguno: una opcion sin tipo no entra en el grafo.
 */
export function tipoDeOpcion(opcion) {
    if (!opcion || opcion.descartado) return ''
    if (opcion.clase === 'anclaje') return 'anchor'
    if (opcion.clase === 'epigrafia') return 'epigraphy'
    if (opcion.clase === 'linguistica') return 'calambur'
    if (opcion.pilar === 'secreto_filosofico') return 'philosophical'
    if (opcion.clase === 'dato_curioso') return 'red_herring'
    return ''
}

/** Los anclajes de una catedral que pueden abrir un grafo (tienen material). */
export function anclajesConMaterial(opciones = [], catedralId) {
    return opciones
        .filter((o) => !o.descartado && o.clase === 'anclaje')
        .filter((o) => !catedralId || o.catedralId === catedralId)
        .map((o) => o.id)
}

function comoNodo(opcion, tipo, prereq, extra = {}) {
    return {
        id: opcion.id,
        titulo: opcion.titulo,
        detalle: opcion.detalle,
        tipo,
        fuente: opcion.fuente,
        estado: opcion.estado,
        juego: opcion.juego || '',
        prereq,
        ...extra,
    }
}

/**
 * El grafo de un anclaje, montado con el material de su catedral.
 *
 * Devuelve la lista de nodos con sus prerrequisitos ya encadenados. El nodo del
 * nucleo filosofico lleva `ancla: true`, porque ES el final: el diseno empieza
 * por el y se camina hacia atras.
 *
 * Si no hay nucleo filosofico, NO hay final, y por tanto no hay grafo que
 * disenar: se devuelve lo que haya, sin final, para que se vea el hueco.
 */
export function grafoDesdeMaterial(opciones = [], anclajeId, catedralId) {
    const vivas = opciones.filter(
        (o) => !o.descartado && (!catedralId || o.catedralId === catedralId),
    )
    const anclaje = vivas.find((o) => o.id === anclajeId && o.clase === 'anclaje')
    if (!anclaje) return []

    const nodos = [comoNodo(anclaje, 'anchor', [])]
    const buscar = (clase, pilar) =>
        vivas.find((o) => o.clase === clase && (!pilar || o.pilar === pilar) && o.id !== anclajeId)

    const epigrafia = buscar('epigrafia')
    const linguistica = buscar('linguistica')
    const arenque = buscar('dato_curioso', 'dualidad_gremios')
    const nucleo = vivas.find((o) => o.pilar === 'secreto_filosofico' && o.id !== anclajeId)

    // La ruta que lee la piedra: anclaje -> epigrafia -> calambur.
    if (epigrafia) nodos.push(comoNodo(epigrafia, 'epigraphy', [anclaje.id]))

    // El arenque rojo cuelga del anclaje: es la explicacion plausible que atrapa.
    if (arenque) nodos.push(comoNodo(arenque, 'red_herring', [anclaje.id]))

    // El calambur necesita la epigrafia; sin ella, cuelga del anclaje.
    if (linguistica) {
        nodos.push(comoNodo(linguistica, 'calambur', [epigrafia ? epigrafia.id : anclaje.id]))
    }

    // EL FINAL: el nucleo filosofico. Es lo primero que se decide.
    if (nucleo) {
        const entradas = [linguistica?.id, arenque?.id, epigrafia?.id].filter(Boolean)
        nodos.push(
            comoNodo(nucleo, 'philosophical', entradas.length ? entradas : [anclaje.id], {
                ancla: true,
            }),
        )
    }

    return nodos
}

/** ¿Este grafo tiene final? Sin nucleo filosofico no hay nada que disenar. */
export function tieneFinal(nodos = []) {
    return nodos.some((n) => n.ancla)
}

/** El orden en que se disena: del final hacia atras. Lo ultimo es la piedra. */
export function ordenDeDiseno(nodos = []) {
    const porId = new Map(nodos.map((n) => [n.id, n]))
    const puestos = new Set()
    const orden = []
    const visitar = (id) => {
        if (puestos.has(id)) return
        const nodo = porId.get(id)
        if (!nodo) return
        puestos.add(id)
        orden.push(nodo)
        for (const previo of nodo.prereq || []) visitar(previo)
    }
    const final = nodos.find((n) => n.ancla)
    if (final) visitar(final.id)
    for (const nodo of nodos) visitar(nodo.id)
    return orden
}

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
 * El grafo de un anclaje, montado con el material DE SU CADENA.
 *
 * SIN TRUCOS. Antes esta funcion rellenaba el grafo cogiendo "una opcion de
 * cada clase" de CUALQUIER sitio del material de la catedral, y el final era el
 * primer `secreto_filosofico` que encontrara. Eso producia cadenas falsas: un
 * anclaje sobre las cadenas del puerto de Marsella terminaba en un nucleo
 * filosofico de otra tarjeta que no tenia nada que ver.
 *
 * Ahora la cadena sale del UNICO sitio donde el diseñador ha declarado que unas
 * piezas van juntas: **el `sostienen` del misterio elegido**. Si no hay misterio
 * elegido, o el anclaje no esta entre sus sostenes, el grafo es el anclaje y
 * nada mas — y sin nucleo filosofico en la cadena, NO HAY FINAL.
 *
 * Eso no es un fallo: es el hueco a la vista. El misterio existe justo para
 * declarar la cadena. Si no la declara, la herramienta lo dice en vez de
 * inventarsela.
 */
export function grafoDesdeMaterial(opciones = [], anclajeId, catedralId, misterio = null) {
    const vivas = opciones.filter(
        (o) => !o.descartado && (!catedralId || o.catedralId === catedralId),
    )
    const anclaje = vivas.find((o) => o.id === anclajeId && o.clase === 'anclaje')
    if (!anclaje) return []

    const nodos = [comoNodo(anclaje, 'anchor', [])]

    // La cadena es SOLO lo que el misterio declara que lo sostiene.
    const sostienen = Array.isArray(misterio?.sostienen) ? misterio.sostienen : []
    const deLaCadena = vivas.filter((o) => o.id !== anclajeId && sostienen.includes(o.id))
    const buscar = (clase, pilar) =>
        deLaCadena.find((o) => o.clase === clase && (!pilar || o.pilar === pilar))

    const epigrafia = buscar('epigrafia')
    const linguistica = buscar('linguistica')
    const arenque = buscar('dato_curioso', 'dualidad_gremios')
    const nucleo = deLaCadena.find((o) => o.pilar === 'secreto_filosofico')

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

/**
 * Las LECCIONES del grafo de un anclaje, listas para el catalogo del lienzo.
 *
 * El lienzo no trabaja con las opciones del material: trabaja con lecciones. Esta
 * es la traduccion, y es lo que hace que el material sirva para disenar de verdad.
 *
 * `deAnclaje` deja claro de que piedra sale cada nodo, para poder reemplazar el
 * grafo de un anclaje sin tocar el de los demas.
 */
export function leccionesDesdeMaterial(opciones = [], anclajeId, catedralId, misterio = null) {
    // EN ORDEN DE DISENO, y eso no es cosmetico: el lienzo abre por el PRIMER
    // elemento de la lista, asi que el primero tiene que ser EL FINAL —el nucleo
    // filosofico—. Si se pasaran en orden de recorrido, el grafo abriria por la
    // piedra y el diseno iria al reves de como manda el metodo.
    return ordenDeDiseno(grafoDesdeMaterial(opciones, anclajeId, catedralId, misterio)).map((nodo) => ({
        id: nodo.id,
        // `lessonId` es lo que el motor del grafo usa para encadenar los pasos.
        lessonId: nodo.id,
        title: nodo.titulo,
        summary: nodo.detalle,
        // `tipo` es lo que pinta el color del nodo en el lienzo (la clase del
        // GN-IEC); `subject` es el tema, y se deja en umbra como red de seguridad.
        tipo: nodo.tipo,
        subject: 'umbra',
        level: 1,
        durationMin: 5,
        prereq: nodo.prereq,
        entrega: nodo.juego || nodo.tipo,
        ancla: nodo.ancla === true,
        deAnclaje: anclajeId,
        fuente: nodo.fuente || '',
        estado: nodo.estado || '',
        origin: 'material',
    }))
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

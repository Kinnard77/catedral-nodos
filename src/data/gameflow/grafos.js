/**
 * UN GRAFO POR ANCLAJE.
 *
 * Decision tomada (y aceptada por el disenador): cada elemento visible que se
 * mapea en una catedral tiene su propio grafo GNI, con su propio final —el
 * nucleo filosofico— por el que se empieza a disenar.
 *
 * Hoy solo hay un anclaje con grafo: el caso del §4 de la especificacion. Los
 * demas anclajes que aparezcan en el material saldran como «sin grafo todavia»,
 * y eso es la verdad, no un hueco que haya que disimular.
 */

export const GRAFOS_POR_ANCLAJE = {
    // VACIO A PROPOSITO.
    //
    // Aqui estaba el grafo de ejemplo del 4, atado al id `ANC-01`. Y el prompt
    // le pide al motor que use ids como `ANC-01`, asi que un anclaje REAL del
    // disenador llamaba a ese boton y el lienzo le ensenaba MI grafo inventado
    // —«El no-ser: averroismo latino en un epitafio»— como si fuera suyo.
    //
    // Eso es mentirle, y es la misma confusion que ya hubo con el material de
    // ejemplo. Un grafo entra aqui cuando el disenador lo disena: el puente
    // material -> anclaje -> grafo esta pendiente de construir.
}

export function grafoDeAnclaje(anclajeId) {
    return GRAFOS_POR_ANCLAJE[anclajeId] || []
}

export function tieneGrafo(anclajeId) {
    return Boolean(GRAFOS_POR_ANCLAJE[anclajeId]?.length)
}

export function anclajesConGrafo() {
    return Object.keys(GRAFOS_POR_ANCLAJE)
}

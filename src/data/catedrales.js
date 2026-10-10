/**
 * Las catedrales del nodo Catedral.
 *
 * ESTA LISTA LA DA EL DISEÑADOR, NO LA HERRAMIENTA. Son las que me diste tú, y
 * dijiste que después aumentarán; por eso se pueden añadir desde el propio
 * lienzo y lo añadido queda guardado.
 *
 * `misterios` nace VACÍO a propósito, y eso es una decisión de diseño, no un
 * olvido. Los misterios no se inventan: salen del estudio que se va
 * recopilando con esta misma herramienta. El Santo Grial está en Valencia, no
 * en Sevilla, así que el vínculo misterio-catedral se DOCUMENTA, no se supone.
 * Ningún misterio entra aquí sin la fuente que justifique por qué pertenece a
 * esta catedral y no a otra.
 */

/** @typedef {{ id: string, nombre: string, misterios: Misterio[] }} Catedral */
/** @typedef {{ id: string, titulo: string, fuente?: string }} Misterio */

export const CATEDRALES = [
    { id: 'sevilla', nombre: 'Catedral de Sevilla', misterios: [] },
    { id: 'valencia', nombre: 'Catedral de Valencia', misterios: [] },
    { id: 'burgos', nombre: 'Catedral de Burgos', misterios: [] },
    { id: 'zaragoza', nombre: 'Catedral de Zaragoza', misterios: [] },
    { id: 'notre-dame', nombre: 'Catedral de Notre Dame', misterios: [] },
    { id: 'estrasburgo', nombre: 'Catedral de Estrasburgo', misterios: [] },
    { id: 'chartres', nombre: 'Catedral de Chartres', misterios: [] },
    { id: 'ciudad-de-mexico', nombre: 'Catedral de Ciudad de México', misterios: [] },
]

/** Une la lista del diseñador con las que haya añadido desde el lienzo. */
export function unirCatedrales(base = CATEDRALES, propias = []) {
    const mapa = new Map(base.map((c) => [c.id, c]))
    for (const c of propias) {
        const previa = mapa.get(c.id)
        mapa.set(c.id, previa ? { ...previa, ...c, misterios: c.misterios || previa.misterios } : c)
    }
    return [...mapa.values()]
}

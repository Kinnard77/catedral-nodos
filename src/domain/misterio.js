/**
 * EL MISTERIO: lo que el jugador descubre al final.
 *
 * Es la pregunta que el diseñador puso en el centro del producto: *«¿qué
 * misterio conviene trabajar en esta catedral si tenemos estos y aquellos
 * elementos reales y ficticios o modificados?»*. La decide **el motor
 * proponiendo candidatos a partir del material**, y el diseñador eligiendo.
 *
 * REGLA QUE SOSTIENE TODO: **un misterio tiene que estar sostenido por
 * elementos que existen sobre la mesa.** Un candidato que se apoye en elementos
 * inventados —o en elementos que no están— se cae. Es la regla del Grial
 * aplicada al misterio: no podemos descubrir el Santo Grial en Sevilla porque
 * está en Valencia, así que un misterio sin material que lo aguante no entra.
 *
 * IDIOMAS: igual que los elementos, los textos se guardan por idioma.
 */

import { IDIOMA_BASE } from './elemento.js'

/** Los campos de un misterio, tal como los devuelve el motor. */
export const CAMPOS = ['titulo', 'descubrimiento', 'encaje', 'duda']

/**
 * Sanea un candidato del motor contra el material real.
 *
 * - `sostienen` solo puede contener ids de elementos que existen de verdad.
 * - Si no queda ninguno, el candidato se marca `sinSosten` y NO es elegible.
 */
export function normalizarMisterio(raw, elementos = []) {
    const existentes = new Map(elementos.map((e) => [e.id, e]))
    const pedidos = Array.isArray(raw?.sostienen) ? raw.sostienen.map((s) => String(s).trim()) : []
    const sostienen = [...new Set(pedidos)].filter((id) => existentes.has(id))

    const titulo = String(raw?.titulo || '').trim()
    const descubrimiento = String(raw?.descubrimiento || '').trim()

    return {
        id: `mis-${slug(titulo) || 'misterio'}`,
        textos: {
            [IDIOMA_BASE]: {
                titulo,
                descubrimiento,
                encaje: String(raw?.encaje || '').trim(),
                duda: String(raw?.duda || '').trim(),
            },
        },
        sostienen,
        // Elementos que el motor se inventó: se descartan y se cuentan, para
        // poder decir en voz alta que el motor se pasó de la raya.
        inventados: pedidos.filter((id) => !existentes.has(id)),
        sinSosten: sostienen.length === 0,
        valido: Boolean(titulo) && Boolean(descubrimiento) && sostienen.length > 0,
        elegidoEn: null,
    }
}

/** ¿El candidato se apoya solo en elementos reales, o también en inventados? */
export function soloConReal(candidato, elementos = []) {
    const porId = new Map(elementos.map((e) => [e.id, e]))
    return candidato.sostienen.every((id) => porId.get(id)?.tipo === 'real')
}

/** Lee un campo de texto del misterio en el idioma pedido. */
export function textoMisterio(misterio, campo, idioma = IDIOMA_BASE) {
    const textos = misterio?.textos || {}
    return textos[idioma]?.[campo] || textos[IDIOMA_BASE]?.[campo] || ''
}

/** Los misterios ya elegidos de una catedral. */
export function misteriosDe(catedral) {
    return catedral?.misterios || []
}

function slug(texto) {
    return String(texto || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 40)
}

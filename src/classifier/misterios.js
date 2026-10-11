import { buildCatalogMessage, callChatCompletions, extractJson, soportaJsonMode } from './llmProvider.js'
import { normalizarMisterio } from '../domain/misterio.js'
import { texto } from '../domain/elemento.js'

/**
 * EL MOTOR PROPONIENDO MISTERIOS.
 *
 * El diseñador eligió esto entre las opciones: *«el motor propone candidatos y
 * yo elijo»*. Y lo pidió sobre *«un material que recolectamos de la catedral
 * misma»*.
 *
 * El motor no puede inventarse el material: recibe la lista exacta de elementos
 * (con su id, su tipo y su fuente) y tiene que decir **cuáles de ellos sostienen
 * cada misterio**. Todo lo que se apoye en un id que no existe se descarta en
 * `normalizarMisterio`. Así el motor puede proponer, pero no puede inventar el
 * suelo que pisa.
 */

export const SYSTEM_MISTERIOS = `Eres el motor de diseno de una AVENTURA DE INVESTIGACION CON TRAMA que se juega con el movil dentro de una catedral real. El jugador es un turista al que la trama convierte en investigador de ultima hora. La referencia de tono es El Codigo Da Vinci.

NO es un juego didactico ni un trivial. No vale un dato que se pueda consultar: vale una IDEA que cambia lo que el jugador ya habia visto.

Recibes el MATERIAL que hemos recolectado de una catedral concreta, separado en elementos REALES (documentados, con fuente) y elementos INVENTADOS O MODIFICADOS. Tu trabajo es proponer MISTERIOS que convenga trabajar en ESA catedral.

Regla que manda sobre todo lo demas:
1. Un misterio solo vale si esta SOSTENIDO por elementos del material. En "sostienen" pon los "id" EXACTOS de los elementos que lo aguantan. Nunca inventes ids ni elementos nuevos.
2. No puedes proponer un misterio que exija algo que esta catedral no tiene. El Santo Grial esta en Valencia: si el material no lo sostiene, no lo propongas.
3. Aprovecha los elementos reales como ancla y los inventados como capa. Una buena mezcla da un misterio tentador que no miente.
4. El juego es DIDACTICO: lo que el jugador pueda comprobar en el edificio tiene que ser verdad. La interpretacion se sugiere, no se afirma.

Para cada misterio devuelve:
- "titulo": corto y con gancho, sin signos de interrogacion.
- "descubrimiento": que descubre el jugador exactamente, en dos o tres frases.
- "encaje": por que este misterio le corresponde a ESTA catedral y no a otra.
- "relectura": LA PIEZA QUE SE RELEE. Que cosa que el turista YA VIO al entrar cambia de significado cuando llega al final. Es el campo mas importante de todos.
- "sostienen": array de ids de elementos del material. Como minimo uno, y mejor dos o mas.
- "duda": la pregunta que le queda al jugador al final. El juego no la responde.

LA RELECTURA MANDA SOBRE TODO LO DEMAS:
5. El descubrimiento final tiene que ser una IDEA, no un objeto ni un sitio. "El Grial es el simbolo de lo femenino y representa una descendencia" es una idea. "El Grial esta en Valencia" NO es una idea: es un dato, y un dato no asombra a nadie.
6. Tiene que producir ASOMBRO: el jugador piensa "eso no lo habia pensado asi".
7. Lo que se relee tiene que salir del material de la columna 1 (anclaje_visible): algo que YA esta a la vista y que el turista miro sin saber leerlo.
8. Si un misterio no tiene relectura, no lo propongas.

Propon entre 3 y 5 misterios, ordenados del que mejor encaja al que peor.

Responde UNICAMENTE con un objeto JSON valido con esta forma exacta:
{
  "misterios": [
    { "titulo": "...", "descubrimiento": "...", "encaje": "...", "relectura": "...", "sostienen": ["id-del-elemento"], "duda": "..." }
  ]
}`

/** El material, tal cual va al motor: ids, tipos y fuentes. */
export function buildMaterialMensaje(catedral, elementos = []) {
    return JSON.stringify({
        catedral: catedral?.nombre || '',
        nota: 'Los elementos REALES estan documentados; los INVENTADOS O MODIFICADOS son declarados como tales por el disenador.',
        material: elementos.map((e) => ({
            id: e.id,
            que_es: texto(e, 'nombre'),
            tipo: e.tipo,
            categoria: e.categoria,
            detalle: texto(e, 'detalle'),
            fuente: e.tipo === 'real' ? texto(e, 'fuente') : null,
        })),
        recordatorio: 'Solo JSON valido, sin texto adicional y sin bloques de codigo alrededor.',
    })
}

/**
 * Pide misterios al motor y los sanea contra el material.
 * Lanza si no hay clave: el motor local no sabe inventar, y fingirlo seria peor
 * que decirlo.
 */
export async function proponerMisterios({ settings, catedral, elementos, signal }) {
    const { baseUrl, apiKey, model } = settings?.llm || {}
    if (!apiKey) {
        throw new Error(
            'Falta la clave del motor. Ponla en Ajustes: el motor local no sabe proponer misterios, solo ordenar lo que ya existe.',
        )
    }
    if (!elementos.length) {
        throw new Error('No hay material sobre la mesa. Sin material, el motor solo podria inventar.')
    }

    const { content, usage } = await callChatCompletions({
        baseUrl,
        apiKey,
        model,
        messages: [
            { role: 'system', content: SYSTEM_MISTERIOS },
            { role: 'user', content: buildMaterialMensaje(catedral, elementos) },
        ],
        jsonMode: soportaJsonMode(baseUrl),
        signal,
    })

    const saneado = parseMisterios(extractJson(content), elementos)
    return { ...saneado, usage, model }
}

/**
 * Sanea la respuesta del motor:
 * - descarta misterios sin titulo o sin descubrimiento,
 * - descarta los que se apoyen en elementos que no existen,
 * - cuenta cuantos ids inventados se descartaron.
 */
export function parseMisterios(raw, elementos = []) {
    const lista = Array.isArray(raw?.misterios) ? raw.misterios : []
    const candidatos = []
    const rechazados = []
    let idsInventados = 0

    for (const bruto of lista) {
        const m = normalizarMisterio(bruto, elementos)
        idsInventados += m.inventados.length
        if (!m.valido || m.sinSosten) {
            rechazados.push({
                titulo: m.textos.es.titulo || '(sin titulo)',
                // Se dice lo mas basico primero: si falta el titulo, eso es lo
                // que hay que arreglar, aunque falten tambien las demas cosas.
                motivo: m.sinSosten
                    ? 'no se apoya en ningun elemento del material'
                    : !m.textos.es.titulo || !m.textos.es.descubrimiento
                      ? 'le falta titulo o descubrimiento'
                      : m.sinRelectura
                        ? 'no tiene relectura: sin ella no hay desenlace, solo un dato'
                        : 'no pasa la validacion',
            })
            continue
        }
        candidatos.push(m)
    }

    return { candidatos, rechazados, idsInventados, total: lista.length }
}

export { buildCatalogMessage }

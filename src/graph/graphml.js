/**
 * GRAPHML — exporta el gameflow para abrirlo y editarlo en yEd.
 *
 * POR QUE EXISTE
 * El lienzo se mira, pero no se puede sacar de la pantalla. Con esto, el diseño
 * inverso que ya esta en el canvas sale a un fichero que se abre en yEd (gratis,
 * de yWorks), donde se le aplica un layout jerarquico y se ve la FORMA del grafo
 * entera de un golpe — que es lo que un PDC sirve para ver.
 *
 * SIRVE PARA LAS DOS FASES
 *   - Fase 1 (el desenlace): exporta el grafo del misterio para ver avances.
 *   - Fase 2 (el gameflow): exporta el grafo del juego.
 * Es el mismo serializador: cambia lo que le pases.
 *
 * DIRECCION DE LAS FLECHAS
 * Se respeta la convencion del proyecto (`graphEngine.inicializarGrafo`): la
 * arista va de la pieza HACIA sus prerrequisitos — `from: pieza, to: prereq` —,
 * que es la direccion del diseño inverso («ver continuacion»). No se invierte,
 * para que el dibujo de yEd coincida con el del lienzo.
 *
 * NO DEPENDE DE NADA
 * Este fichero no importa otros modulos a proposito: lee los campos de forma
 * defensiva. Asi no se rompe si el modelo cambia de nombre a un campo.
 */

/** Los cuatro pilares de `material.js`, con su color. */
const COLOR_PILAR = {
    anclaje_visible: '#fbbf24',
    apocrifo: '#38bdf8',
    dualidad_gremios: '#fb7185',
    secreto_filosofico: '#cbd5e1',
}

/** Los tres estados de `material.js`. */
const COLOR_ESTADO = {
    documentado: '#16a34a',
    por_verificar: '#d97706',
    inventado: '#7c3aed',
}

/**
 * Color por CLASE de nodo del GNI. Se usa cuando la pieza no trae pilar.
 * Los tonos siguen la paleta de `material.js` para que el lienzo y yEd se
 * parezcan.
 */
const COLOR_TIPO = {
    anchor: '#fbbf24',
    red_herring: '#fb7185',
    epigraphy: '#38bdf8',
    calambur: '#a78bfa',
    divergence: '#4ade9e',
    philosophical: '#cbd5e1',
}

const ESC = (v) =>
    String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

/** Lee un campo con varios nombres posibles, sin romperse si no esta. */
const campo = (p, ...nombres) => {
    for (const n of nombres) if (p?.[n] !== undefined && p?.[n] !== null && p?.[n] !== '') return p[n]
    return undefined
}

/** El texto visible del nodo. */
export function etiquetaDe(pieza) {
    const t = campo(pieza, 'titulo', 'label', 'title', 'nombre') || pieza?.id || 'sin titulo'
    return t.length > 46 ? `${t.slice(0, 44)}...` : t
}

/**
 * Serializa un grafo a GraphML de yEd.
 *
 * @param {object[]} piezas  Los nodos. Se leen `id`, `titulo`, `pilar`, `tipo`,
 *                           `subject`, `level`, `estado` y `prereq` si estan.
 * @param {object[]} [edges] Las aristas `{ from, to, kind }`. Si no se pasan,
 *                           se construyen desde `prereq` de cada pieza.
 * @param {{titulo?: string}} [opciones]
 * @returns {string} El XML completo.
 */
export function graphmlDe(piezas = [], edges, { titulo = 'Gameflow de catedral' } = {}) {
    const lista = (piezas || []).filter((p) => p && p.id)

    // Si no vienen aristas, se derivan de `prereq` con la direccion del proyecto.
    let aristas = edges
    if (!Array.isArray(aristas)) {
        aristas = []
        for (const p of lista) {
            for (const q of campo(p, 'prereq', 'requisitos') || []) {
                aristas.push({ from: p.id, to: q, kind: 'prereq' })
            }
        }
    }
    const ids = new Set(lista.map((p) => p.id))

    const out = [
        '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
        '<graphml xmlns="http://graphml.graphdrawing.org/xmlns" ' +
            'xmlns:y="http://www.yworks.com/xml/graphml" ' +
            'xmlns:yed="http://www.yworks.com/xml/yed/3" ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns ' +
            'http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd">',
        '  <key for="node" id="d0" yfiles.type="nodegraphics"/>',
        '  <key for="edge" id="d1" yfiles.type="edgegraphics"/>',
        '  <key attr.name="pilar" attr.type="string" for="node" id="d_pilar"/>',
        '  <key attr.name="tipo" attr.type="string" for="node" id="d_tipo"/>',
        '  <key attr.name="subject" attr.type="string" for="node" id="d_subject"/>',
        '  <key attr.name="level" attr.type="int" for="node" id="d_level"/>',
        '  <key attr.name="estado" attr.type="string" for="node" id="d_estado"/>',
        `  <graph edgedefault="directed" id="G" yed:description="${ESC(titulo)}">`,
    ]

    for (const p of lista) {
        const pilar = campo(p, 'pilar', 'columna') || ''
        const tipo = campo(p, 'tipo') || ''
        const subject = campo(p, 'subject') || ''
        const level = Number(campo(p, 'level', 'nivel') ?? 1)
        const estado = campo(p, 'estado') || ''

        const relleno = COLOR_PILAR[pilar] || COLOR_PILAR[subject] || COLOR_TIPO[tipo] || '#e2e8f0'
        const borde = COLOR_ESTADO[estado] || '#334155'
        // El glifo del tipo delante del titulo: se ve la clase sin abrir el nodo.
        const texto = tipo ? `${tipo} · ${etiquetaDe(p)}` : etiquetaDe(p)

        out.push(
            `    <node id="${ESC(p.id)}">`,
            `      <data key="d_pilar">${ESC(pilar)}</data>`,
            `      <data key="d_tipo">${ESC(tipo)}</data>`,
            `      <data key="d_subject">${ESC(subject)}</data>`,
            `      <data key="d_level">${Number.isFinite(level) ? level : 1}</data>`,
            `      <data key="d_estado">${ESC(estado)}</data>`,
            '      <data key="d0"><y:ShapeNode>',
            '        <y:Geometry height="34.0" width="200.0" x="0.0" y="0.0"/>',
            `        <y:Fill color="${relleno}" transparent="false"/>`,
            `        <y:BorderStyle color="${borde}" raised="false" type="line" width="2.0"/>`,
            '        <y:NodeLabel alignment="center" autoSizePolicy="content" ' +
                'fontFamily="Dialog" fontSize="11" fontStyle="plain" textColor="#1a1a1a" ' +
                `visible="true">${ESC(texto)}</y:NodeLabel>`,
            '        <y:Shape type="roundrectangle"/>',
            '      </y:ShapeNode></data>',
            '    </node>',
        )
    }

    let n = 0
    for (const a of aristas) {
        const from = campo(a, 'from', 'source', 'origen')
        const to = campo(a, 'to', 'target', 'destino')
        if (!ids.has(from) || !ids.has(to)) continue
        n += 1
        const kind = campo(a, 'kind', 'tipo') || 'prereq'
        const color = kind === 'prereq' ? '#64748b' : '#c0392b'
        out.push(
            `    <edge id="e${n}" source="${ESC(from)}" target="${ESC(to)}">`,
            '      <data key="d1"><y:PolyLineEdge>',
            `        <y:LineStyle color="${color}" type="line" width="1.5"/>`,
            '        <y:Arrows source="none" target="standard"/>',
            `        <y:EdgeLabel alignment="center" fontSize="9" textColor="#64748b" ` +
                `visible="true">${ESC(kind === 'prereq' ? '' : kind)}</y:EdgeLabel>`,
            '        <y:BendStyle smoothed="true"/>',
            '      </y:PolyLineEdge></data>',
            '    </edge>',
        )
    }

    out.push('  </graph>', '</graphml>')
    return `${out.join('\n')}\n`
}

/** Resumen corto para la consola. */
export function resumenDe(piezas = [], edges) {
    const porPilar = {}
    for (const p of piezas) {
        const k = campo(p, 'pilar', 'columna') || 'sin pilar'
        porPilar[k] = (porPilar[k] || 0) + 1
    }
    const n = Array.isArray(edges)
        ? edges.length
        : piezas.reduce((s, p) => s + ((campo(p, 'prereq', 'requisitos') || []).length), 0)
    return { nodos: piezas.length, aristas: n, porPilar }
}

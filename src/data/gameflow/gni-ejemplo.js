/**
 * GNI — el ejemplo de la especificación, dibujable.
 *
 * Es el caso que trae el propio documento (§4): una laja sepulcral de girola,
 * un arcediano bienhechor, una abreviatura supralineal y una resegmentación que
 * convierte una oración piadosa en una adhesión al no-ser de Dios.
 *
 * OJO: esto es el EJEMPLO DE LA ESPECIFICACIÓN, no contenido verificado de
 * ninguna catedral. El diseñador dijo que no hay nada definitivo y que esas
 * ciudades son bocetos. Aquí sirve para que la forma del grafo se pueda ver y
 * validar.
 *
 * Topología (§3): ruta dual obligatoria desde el anclaje, que se vuelve a
 * juntar en la divergencia y termina en el núcleo filosófico.
 *
 * DECISIÓN TOMADA sobre la discrepancia: el §2.6 declara para el núcleo
 * filosófico dos entradas (`dialectic_breakthrough` y `conceptual_clue`) y el
 * dibujo del §3 solo traía la flecha de la divergencia. Se ha AÑADIDO la arista
 * del calambur al núcleo, porque un PDC dibuja todas las dependencias que su
 * ficha declara: si el núcleo consume el `conceptual_clue`, esa flecha tiene que
 * estar o el gráfico miente sobre el diseño. Reversible: es una cadena.
 *
 * UN GRAFO = UN ANCLAJE. Este grafo es la investigación de UNA laja. Una
 * catedral tendrá tantos como elementos visibles tenga. El propio validador del
 * §3 recorre «todo nodo Anchor_Visible», así que está escrito para admitir
 * varios: pero el trabajo de campo también es por anclaje (§4: una ficha, un
 * `node_anchor_visible`), y manteniendo un anclaje por grafo el diseño siempre
 * tiene un final claro por el que empezar, que es el método.
 */

import { TIPOS_GNI } from '../../domain/gni.js'

/** Textos de la ficha de campo (§4), tal cual los trae la especificación. */
const FICHA = {
    anchor: {
        location_type: 'laja_pavimento',
        canonical_description: 'Tumba del arcediano Don Fernando, bienhechor de las obras (1384)',
        visual_anomaly: 'Punto medial descentrado entre las palabras 3 y 4 de la bordura',
    },
    red_herring: {
        dogmatic_narrative: 'Tumba del arcediano Don Fernando, bienhechor de las obras (1384)',
        decoy_evidence: 'La heráldica con cinco lises sugiere un legado nobiliario a desentrañar',
        academic_blindspot:
            'Hacer creer al jugador que debe buscar el testamento del arcediano en el archivo',
    },
    epigraphy: {
        raw_inscription: 'HIC · REC · IN · NŌE · DĪ · OMNIP',
        standard_expansion: 'Hic requiescit in nomine Dei omnipotentis',
        paleographic_anomaly: 'Tilde supralineal sobre la N de NŌE, desplazada a la izquierda',
        abbreviations_detected: [
            'REC = Requiescit',
            'NŌE = Nomine (con tilde supralineal)',
            'DĪ = Dei',
            'OMNIP = Omnipotentis',
        ],
    },
    calambur: {
        mechanic_type: 'titulus_deletion',
        surface_reading: 'IN NOMINE DEI',
        hidden_reading: 'HIC · REC · IN · NON · E · DI · OMNIP',
        translation_heretical:
            'Hic requiescit in non est dei omnipotentis — aquí descansa en el no-ser del dios omnipotente',
    },
    divergence: {
        historian_standpoint:
            'Los libros capitulares confirman que el arcediano murió en comunión canónica',
        linguist_standpoint:
            "La tipografía de la palabra 'NON E' fue grabada por otra mano tras el sepelio",
        contradiction:
            'El arcediano financió la tumba en vida para burlar el expurgo inquisitorial póstumo',
    },
    philosophical: {
        school_of_thought: 'averroismo_latino',
        apocryphal_thesis:
            'La aniquilación del alma individual tras la muerte: niega la inmortalidad personal y las penas del Purgatorio',
        institutional_impact:
            'El epitafio funciona como clave para localizar el manuscrito prohibido de Siger de Brabante oculto en la sillería del coro',
        formulable_como: 'ontologica',
    },
}

/** Convierte los campos de la ficha en la ficha que se lee en el lector. */
function contenidoDe(tipo, campos) {
    const definicion = TIPOS_GNI[tipo]
    const filas = definicion.campos
        .map((c) => {
            const valor = campos[c.id]
            if (valor === undefined || valor === '' || (Array.isArray(valor) && !valor.length)) return null
            return { campo: c.label, valor: Array.isArray(valor) ? valor.join(' · ') : valor }
        })
        .filter(Boolean)

    return [
        { type: 'markdown', text: `**${definicion.nombre}** — ${definicion.que_es}` },
        { type: 'datos', rows: filas },
        {
            type: 'nota',
            text: `Entregas: ${definicion.salidas.join(', ')}. De ahí sale la etiqueta que viaja por la flecha.`,
        },
    ]
}

function nodo({ id, tipo, subject, level, title, summary, prereq, entrega, objectives, ancla }) {
    return {
        id,
        tipo,
        ...(ancla ? { ancla: true } : {}),
        title,
        subject,
        level,
        durationMin: 12,
        summary,
        objectives: objectives || [],
        prereq,
        unlocks: [],
        entrega,
        tags: [tipo, 'gni'],
        skills: [],
        campos: FICHA[tipo],
        content: contenidoDe(tipo, FICHA[tipo]),
    }
}

export const gniEjemplo = [
    nodo({
        id: 'ANC-01',
        tipo: 'anchor',
        subject: 'filosofia',
        level: 1,
        title: 'La laja con el punto medial descentrado',
        summary:
            'El punto de entrada es algo que el turista ya mira: una laja sepulcral en la girola. Lo que la delata es un detalle de nada.',
        prereq: [],
        entrega: 'text_data',
        objectives: ['Que el jugador se fije en un detalle que nadie mira'],
    }),
    nodo({
        id: 'RH-01',
        tipo: 'red_herring',
        subject: 'filosofia',
        level: 1,
        title: 'El arcediano bienhechor y sus cinco lises',
        summary:
            'La explicación piadosa: la tumba de un bienhechor de las obras. Es el camuflaje, y también la trampa.',
        prereq: ['ANC-01'],
        entrega: 'dead_end_resolution',
        objectives: ['Satisfacer al historiador tradicional antes de romperle el relato'],
    }),
    nodo({
        id: 'EPI-01',
        tipo: 'epigraphy',
        subject: 'filosofia',
        level: 1,
        title: 'HIC · REC · IN · NŌE · DĪ · OMNIP',
        summary:
            'La capa textual: qué está grabado y cómo. Aquí vive la tilde supralineal que lo cambia todo.',
        prereq: ['ANC-01'],
        entrega: 'latin_tokens',
        objectives: ['Transcribir sin traducir: primero el texto, luego el sentido'],
    }),
    nodo({
        id: 'CAL-01',
        tipo: 'calambur',
        subject: 'filosofia',
        level: 1,
        title: 'La tilde que se convierte en negación',
        summary:
            'Supresión de la tilde y resegmentación: «en el nombre de Dios» pasa a «en el no-ser de Dios».',
        prereq: ['EPI-01'],
        entrega: 'cipher_solution',
        objectives: ['Que el jugador descubra que la piedra dice lo contrario de lo que parece'],
    }),
    nodo({
        id: 'DIV-01',
        tipo: 'divergence',
        subject: 'filosofia',
        level: 1,
        title: 'El archivo dice una cosa y la piedra otra',
        summary:
            'El choque: los libros capitulares lo dan por muerto en comunión, pero la tipografía delata otra mano.',
        prereq: ['RH-01', 'CAL-01'],
        entrega: 'dialectic_breakthrough',
        objectives: ['Obligar a sintetizar las dos miradas'],
    }),
    nodo({
        id: 'PHIL-01',
        tipo: 'philosophical',
        subject: 'filosofia',
        level: 1,
        title: 'El no-ser: averroísmo latino en un epitafio',
        summary:
            'La revelación racional, sin una gota de magia: el alma individual se aniquila tras la muerte. Nada de reliquias.',
        // Las DOS entradas que declara el §2.6: el hallazgo dialectico de la
        // divergencia y la pista conceptual que sale del calambur.
        prereq: ['DIV-01', 'CAL-01'],
        entrega: 'narrative_reward',
        // EL ANCLA ES LA HEREJIA, no la piedra. Se disena desde el final: lo
        // primero que se decide es la revelacion, y lo ultimo la laja que el
        // turista mira. Por eso el lienzo abre aqui y camina hacia atras.
        ancla: true,
        objectives: [
            'Que la recompensa sea intelectual, no sobrenatural',
            'Que el secreto amenace la legitimidad del Cabildo o de Roma',
        ],
    }),
]

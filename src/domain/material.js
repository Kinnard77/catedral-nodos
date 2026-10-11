/**
 * EL MATERIAL DE UNA CATEDRAL: las opciones que ya existen antes de diseñar.
 *
 * El error que corrige este fichero: la herramienta preguntaba «¿qué quieres que
 * descubra el jugador?». Eso es pedirle al diseñador que haga el trabajo del
 * grafo. Si lo supiera, no necesitaria la herramienta.
 *
 * Lo correcto, en palabras del diseñador: *«al elegir Catedral de Valencia, me
 * salen las opciones que tenemos en esa catedral, opciones que se han hecho
 * previamente por parte del mapeo y opciones linguisticas y todo lo que hablamos
 * respecto a los pilares»*. Primero QUE TENEMOS; despues, que misterio podemos
 * inducir con ello.
 *
 * LOS CUATRO PILARES (§1 del GN-IEC) son las cuatro familias de material:
 * anclaje visible, apocrifo convincente, dualidad de gremios y secreto
 * filosofico. Cada opcion pertenece a uno.
 *
 * LA REGLA DE LA FUENTE VALE AQUI TAMBIEN: una opcion `documentado` sin fuente
 * es una afirmacion sin recibo, asi que el saneado la degrada a `por_verificar`.
 */

/** Los cuatro pilares del §1, cada uno con su pregunta de mapeo. */
export const PILARES = {
    anclaje_visible: {
        label: 'Anclaje en lo visible',
        color: '#fbbf24',
        glyph: '⌖',
        pregunta:
            '¿Qué hay a la vista y al alcance del público? Lajas sepulcrales, filacterias en pórticos, mensarios, zodiacos, atributos de santos…',
    },
    apocrifo: {
        label: 'Apócrifo convincente',
        color: '#38bdf8',
        glyph: '⁘',
        pregunta:
            '¿Qué se puede sostener con fuentes eclesiásticas o notariales, y qué deducción oculta se le puede colgar? Bulas censuradas, cláusulas suprimidas, minutas capitulares…',
    },
    dualidad_gremios: {
        label: 'Dualidad de gremios',
        color: '#fb7185',
        glyph: '⇄',
        pregunta:
            '¿Dónde choca la autoridad que impone el dogma con los artífices que labran la materia? Cabildo contra canteros, lapicidas y orfebres.',
    },
    secreto_filosofico: {
        label: 'Secreto sin magia',
        color: '#e2e8f0',
        glyph: 'Φ',
        pregunta:
            '¿Qué herejía filosófica o ruptura escolástica se puede plantear? Nada sobrenatural: tiene que formularse como proposición ontológica, física o política.',
    },
}

/** Las clases de opción que puede haber sobre la mesa. */
export const CLASES_MATERIAL = {
    anclaje: { label: 'Anclaje', color: '#fbbf24', glyph: '⌖' },
    epigrafia: { label: 'Epigrafía', color: '#38bdf8', glyph: '⁘' },
    linguistica: { label: 'Juego lingüístico', color: '#a78bfa', glyph: '⁂' },
    dato_curioso: { label: 'Dato curioso', color: '#4ade9e', glyph: '✦' },
    simbolo: { label: 'Símbolo', color: '#c084fc', glyph: '◇' },
    restriccion: { label: 'Restricción', color: '#fb7185', glyph: '⛒' },
}

/**
 * Estado de una opción. La diferencia importa: solo lo `documentado` puede
 * sostener una afirmación del juego.
 */
export const ESTADOS = {
    documentado: { label: 'Documentado', color: '#4ade9e', detalle: 'Tiene fuente. El juego puede afirmarlo.' },
    por_verificar: {
        label: 'Por verificar',
        color: '#fbbf24',
        detalle: 'Propuesto, sin fuente comprobada. El juego NO puede afirmarlo todavía.',
    },
    inventado: { label: 'Inventado', color: '#a78bfa', detalle: 'Nuestro, y declarado como nuestro.' },
}

export function pilarOf(id) {
    return PILARES[id] || PILARES.anclaje_visible
}

export function claseOf(id) {
    return CLASES_MATERIAL[id] || CLASES_MATERIAL.dato_curioso
}

/**
 * Sanea una opción de material.
 *
 * REGLA DE ORO: **la IA propone, el diseñador confirma.** Nada que salga de una
 * investigación entra como `documentado`, ni con búsqueda ni sin ella:
 *
 *  - Sin búsqueda, una cita del modelo es un recuerdo, y un recuerdo no es un
 *    recibo. Se marca `fuenteSospechosa` para que nadie pierda el tiempo
 *    verificándola.
 *  - Con búsqueda, si la fuente está entre las que consultó de verdad, se marca
 *    `fuenteConsultada`: la verificación del diseñador es un vistazo, no una
 *    investigación. Y si NO está entre las consultadas, es una invención bien
 *    escrita, y se marca `fuenteSospechosa`.
 *
 * Lo único que pasa a `documentado` es lo que confirma una mano humana, con
 * `documentar()`, y siempre con una fuente delante.
 */
export function normalizarOpcion(raw, catedralId, { fuentes = [], comprobarFuente } = {}) {
    const titulo = String(raw?.titulo || '').trim()
    const fuente = String(raw?.fuente || '').trim()
    let estado = ['documentado', 'por_verificar', 'inventado'].includes(raw?.estado)
        ? raw.estado
        : 'por_verificar'
    let motivoDegradado = ''
    let fuenteConsultada = false
    let fuenteSospechosa = false

    if (estado === 'documentado') {
        if (!fuente) {
            motivoDegradado = 'se declaró documentada sin ninguna fuente'
        } else if (!fuentes.length) {
            motivoDegradado = 'sin búsqueda no hay forma de comprobar esa cita'
            fuenteSospechosa = true
        } else if (comprobarFuente && !comprobarFuente(fuente, fuentes)) {
            motivoDegradado = `citó una fuente que no está entre las ${fuentes.length} que consultó`
            fuenteSospechosa = true
        } else {
            motivoDegradado = 'la fuente es una de las que consultó: solo falta tu visto bueno'
            fuenteConsultada = true
        }
        estado = 'por_verificar'
    }

    return {
        id: String(raw?.id || '').trim() || `OP-${titulo.slice(0, 18)}`,
        catedralId,
        clase: CLASES_MATERIAL[raw?.clase] ? raw.clase : 'dato_curioso',
        pilar: PILARES[raw?.pilar] ? raw.pilar : 'anclaje_visible',
        titulo,
        detalle: String(raw?.detalle || '').trim(),
        ubicacion: String(raw?.ubicacion || '').trim(),
        juego: String(raw?.juego || '').trim(),
        fuente,
        estado,
        /**
         * MARCA DE EJEMPLO. El material del §4 lo escribio el AGENTE, no el
         * motor, y si se ensena mezclado con lo que trae la investigacion el
         * disenador no puede saber que es suyo y que es de la IA. Con esta marca
         * la pantalla lo dice.
         */
        ejemplo: Boolean(raw?.ejemplo),
        fuenteConsultada,
        fuenteSospechosa,
        degradado: Boolean(motivoDegradado),
        motivoDegradado,
        valido: Boolean(titulo) && Boolean(String(raw?.detalle || '').trim()),
    }
}

/** Los anclajes: cada uno puede ser el punto de partida de un grafo GN-IEC. */
export function anclajesDe(opciones = []) {
    return opciones.filter((o) => o.clase === 'anclaje' && !o.descartado)
}

// ─────────────────────────────────────────────────────────────────────────────
// LA VERIFICACION A MANO
//
// El disenador eligio esto: *«la IA propone y yo verifico a mano»*. Aqui es
// donde se hace. La IA trae candidatos; el disenador confirma uno a uno, y **solo
// con una fuente se pasa a `documentado`**. La regla deja de ser un aviso y pasa
// a ser una puerta: sin fuente, la herramienta no te deja afirmarlo.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * EL FILTRO DEL PILAR 1 — que el anclaje declare DESDE DONDE SE VE.
 *
 * La condicion del pilar `anclaje_visible` es **UNA sola: que este A LA VISTA**.
 * En una catedral no se toca nada, asi que «al alcance del publico» NO quiere
 * decir que se pueda tocar: quiere decir que **el visitante llega a verlo desde
 * su recorrido**. Y eso solo se puede comprobar si la opcion dice DONDE esta.
 *
 * Sin ese dato, la opcion no es material de calidad para este pilar: podria
 * estar tras una reja, a una altura imposible o en una zona cerrada — que es
 * exactamente lo que dejo fuera las marcas de cantero.
 *
 * Devuelve el motivo si falta, o cadena vacia si la opcion pasa.
 */
export function faltaDondeSeVe(opcion) {
    if (opcion?.clase !== 'anclaje') return ''
    if (String(opcion?.ubicacion || '').trim()) return ''
    return 'Un anclaje tiene que decir DESDE DÓNDE SE VE. Sin eso no se puede comprobar que el visitante llegue a verlo, y el pilar exige que esté A LA VISTA.'
}

/**
 * Marca una opcion como documentada. **Exige la fuente**: si no hay, no se
 * cambia nada y se devuelve el motivo. Es la regla del Grial en forma de boton.
 *
 * Y si es un ANCLAJE, exige ademas **desde donde se ve**: el pilar 1 tiene una
 * condicion —A LA VISTA— y no se puede dar por buena una pieza que no diga
 * donde esta. Mismo molde que la regla de la fuente: es una puerta, no un aviso.
 */
export function documentar(opcion, fuente) {
    const limpia = String(fuente || '').trim()
    if (!limpia) {
        return {
            ok: false,
            opcion,
            motivo:
                'Para darla por documentada hay que anotar de dónde sale. Sin fuente se queda en «por verificar».',
        }
    }
    const sinUbicacion = faltaDondeSeVe(opcion)
    if (sinUbicacion) {
        return { ok: false, opcion, motivo: sinUbicacion }
    }
    return {
        ok: true,
        opcion: { ...opcion, estado: 'documentado', fuente: limpia, degradado: false, descartado: false },
        motivo: '',
    }
}

/** Devuelve una opcion a «por verificar» sin perder la fuente anotada. */
export function desdocumentar(opcion) {
    return { ...opcion, estado: 'por_verificar', descartado: false }
}

/**
 * Descarta una opcion. NO se borra: se marca. El disenador lo dijo claro —«no se
 * tira nada»— y una idea descartada hoy puede volver cuando el grafo pida algo.
 */
export function descartar(opcion) {
    return { ...opcion, descartado: true }
}

export function recuperar(opcion) {
    return { ...opcion, descartado: false }
}

/** Cuántas opciones hay de cada estado y de cada pilar. */
export function resumenMaterial(opciones = []) {
    const porPilar = {}
    for (const p of Object.keys(PILARES)) porPilar[p] = 0
    let documentadas = 0
    let descartadas = 0

    for (const o of opciones) {
        if (o.descartado) {
            descartadas += 1
            continue
        }
        porPilar[o.pilar] = (porPilar[o.pilar] || 0) + 1
        if (o.estado === 'documentado') documentadas += 1
    }

    const vivas = opciones.length - descartadas
    return {
        total: vivas,
        documentadas,
        sinVerificar: vivas - documentadas,
        descartadas,
        porPilar,
    }
}

export function materialDe(opciones = [], catedralId) {
    return opciones.filter((o) => o.catedralId === catedralId)
}

/** Las opciones vivas (ni descartadas), que son las que se enseñan por pilares. */
export function opcionesVivas(opciones = []) {
    return opciones.filter((o) => !o.descartado)
}

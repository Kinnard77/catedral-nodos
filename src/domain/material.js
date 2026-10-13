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
 * LOS CUATRO PILARES (§1 del GNI) son las cuatro familias de material:
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
        /**
         * ESTA EXPLICACION ES TAMBIEN EL FILTRO. El mismo texto que el disenador
         * lee al pasar el raton es el criterio con el que el motor decide si algo
         * entra en este pilar. Una sola fuente de verdad: si cambia aqui, cambia
         * en los dos sitios.
         */
        explicacion:
            'El misterio no debe estar escondido en una cueva remota, sino a la vista. El jugador siente que el secreto estuvo siempre frente a sus ojos y nunca lo notó.',
    },
    apocrifo: {
        label: 'Apócrifo convincente',
        color: '#38bdf8',
        glyph: '⁘',
        pregunta:
            '¿Qué se puede sostener con fuentes eclesiásticas o notariales, y qué deducción oculta se le puede colgar? Bulas censuradas, cláusulas suprimidas, minutas capitulares…',
        explicacion:
            'Combinar 80% de historia real comprobable con un 20% de falsificación elegante. El jugador busca los datos reales, comprueba que son ciertos y asume inconscientemente que el 20% ficticio también es real.',
    },
    dualidad_gremios: {
        label: 'Dualidad de gremios',
        color: '#fb7185',
        glyph: '⇄',
        pregunta:
            '¿Dónde choca la autoridad que impone el dogma con los artífices que labran la materia? Cabildo contra canteros, lapicidas y orfebres.',
        explicacion:
            'Oponer siempre una facción que custodia la técnica/materia (canteros, grabadores, mecánicos) contra una que custodia el dogma (inquisición, órdenes monásticas, cabildos).',
    },
    secreto_filosofico: {
        label: 'Secreto sin magia',
        color: '#e2e8f0',
        glyph: 'Φ',
        pregunta:
            '¿Qué herejía filosófica o ruptura escolástica se puede plantear? Nada sobrenatural: tiene que formularse como proposición ontológica, física o política.',
        explicacion:
            'Si el secreto es sobrenatural puro, rompe la tensión investigativa. Si el secreto es político, biológico, de linaje o un conocimiento tecnológico adelantado a su tiempo, el misterio se mantiene anclado al intelecto del protagonista.',
    },
}

/**
 * Los pilares tal cual, para que el motor los use de FILTRO.
 * Se genera desde PILARES: la pantalla y la IA leen lo mismo.
 */
export function filtrosDePilares() {
    return Object.entries(PILARES)
        .map(([clave, p]) => `- ${clave} — ${p.label}: ${p.explicacion}`)
        .join('\n')
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

/** Los anclajes: cada uno puede ser el punto de partida de un grafo GNI. */
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

/**
 * EL MATERIAL EN TEXTO, para poder sacarlo de aqui.
 *
 * Existe porque el material vive en el localStorage del navegador, y **ningun
 * agente puede leer ahi**. Lo que no esta en un fichero, para un agente no
 * existe. Esto lo convierte en algo que se puede pegar o guardar.
 */
export function materialAMarkdown(opciones = [], catedral = '') {
    const vivas = opciones.filter((o) => !o.descartado)
    if (!vivas.length) return `# Material${catedral ? ` — ${catedral}` : ''}\n\n(No hay nada sobre la mesa.)\n`

    const lineas = [`# Material${catedral ? ` — ${catedral}` : ''}`, '', `${vivas.length} opción(es).`, '']

    for (const [clave, pilar] of Object.entries(PILARES)) {
        const delPilar = vivas.filter((o) => o.pilar === clave)
        if (!delPilar.length) continue
        lineas.push(`## ${pilar.label}`, '')
        for (const o of delPilar) {
            lineas.push(`- **${o.id} · ${o.titulo}** — ${ESTADOS[o.estado]?.label || o.estado}`)
            if (o.detalle) lineas.push(`  ${o.detalle}`)
            if (o.ubicacion) lineas.push(`  Ubicación: ${o.ubicacion}`)
            if (o.juego) lineas.push(`  Juego lingüístico: ${o.juego}`)
            if (o.fuente) lineas.push(`  Fuente: ${o.fuente}`)
            if (o.ejemplo) lineas.push('  (EJEMPLO del §4: escrito por el agente, no por el motor)')
            if (o.motivoDegradado) lineas.push(`  Nota: ${o.motivoDegradado}`)
            lineas.push('')
        }
    }
    return lineas.join('\n')
}

/** Las opciones vivas (ni descartadas), que son las que se enseñan por pilares. */
export function opcionesVivas(opciones = []) {
    return opciones.filter((o) => !o.descartado)
}

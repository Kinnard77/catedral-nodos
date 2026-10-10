/**
 * GN-IEC — Grafo de Nodos de Investigación Epigráfica y Conspirativa.
 *
 * Es la especificación del diseñador, hecha código. La idea que la sostiene:
 * *toda catedral real contiene información fragmentada que permite construir un
 * thriller histórico y filosófico verosímil*. Y la clave de tono: **el secreto
 * NO es una reliquia sobrenatural, es una herejía filosófica** — algo que se
 * puede formular como proposición ontológica, física o política medieval.
 *
 * El grafo de UN anclaje tiene esta forma (una ruta dual que se vuelve a juntar):
 *
 *   [ Anclaje visible ] ────────────────┐
 *          │                            │
 *          ▼                            ▼
 *   [ Arenque rojo ]            [ Epigrafía latina ]
 *          │                            │
 *          │                            ▼
 *          │                    [ Calambur esotérico ]
 *          └──────────► ┌────────────────┘
 *                      ▼
 *            [ Divergencia / choque ]
 *                      │
 *                      ▼
 *            [ Núcleo filosófico ]
 *
 * Se diseña al revés: primero se decide la herejía (el Núcleo filosófico) y se
 * camina hacia atrás hasta la piedra que el turista puede tocar con la mirada.
 *
 * LAS SALIDAS SON LAS ETIQUETAS DE ARISTA. Cada tipo declara qué entrega
 * (`salidas`), y eso es lo que viaja por la flecha hasta el nodo siguiente.
 */

/** Los seis tipos de nodo del GN-IEC, con sus campos y sus salidas. */
export const TIPOS_GNIEC = {
    anchor: {
        label: 'Anclaje visible',
        nombre: 'Anchor_Visible',
        color: '#fbbf24',
        glyph: '⌖',
        que_es: 'El punto de entrada: un elemento tangible y accesible al público.',
        entradas: ['coordenadas espaciales', 'sector arquitectónico'],
        campos: [
            {
                id: 'location_type',
                label: 'Tipo de lugar',
                opts: ['laja_pavimento', 'filacteria_portada', 'capitel_historiado', 'relicario_forja'],
            },
            { id: 'canonical_description', label: 'Lo que dice la audioguía oficial' },
            { id: 'visual_anomaly', label: 'Anomalía visible a simple vista' },
        ],
        salidas: ['text_data', 'spatial_target'],
    },
    red_herring: {
        label: 'Arenque rojo canónico',
        nombre: 'Red_Herring',
        color: '#fb7185',
        glyph: '⚑',
        que_es: 'La explicación piadosa que satisface al historiador tradicional. El camuflaje del puzle.',
        entradas: ['text_data'],
        campos: [
            { id: 'dogmatic_narrative', label: 'Explicación dogmática o convencional' },
            { id: 'decoy_evidence', label: 'Fechas, santos o alegorías que despistan' },
            { id: 'academic_blindspot', label: 'La suposición errónea del jugador' },
        ],
        salidas: ['dead_end_resolution', 'distraction_flag'],
    },
    epigraphy: {
        label: 'Epigrafía latina',
        nombre: 'Epigraphy_Latin',
        color: '#38bdf8',
        glyph: '⁘',
        que_es: 'La capa textual y tipográfica: lo que está grabado y cómo está grabado.',
        entradas: ['text_data'],
        campos: [
            { id: 'raw_inscription', label: 'Transcripción literal (títulos, ligaduras, nexos)' },
            { id: 'standard_expansion', label: 'Lectura litúrgica convencional' },
            { id: 'paleographic_anomaly', label: 'Anomalía paleográfica' },
            { id: 'abbreviations_detected', label: 'Abreviaturas detectadas', lista: true },
        ],
        salidas: ['latin_tokens', 'grapheme_breaks'],
    },
    calambur: {
        label: 'Calambur esotérico',
        nombre: 'Calambur_Esoteric',
        color: '#a78bfa',
        glyph: '⁂',
        que_es: 'La transformación filológica: de lo que se lee a lo que se quiso decir.',
        entradas: ['latin_tokens', 'grapheme_breaks'],
        campos: [
            {
                id: 'mechanic_type',
                label: 'Mecánica',
                opts: ['resegmentation', 'palindromic_reversal', 'titulus_deletion', 'acrostic_cross'],
            },
            { id: 'surface_reading', label: 'Lectura aparente' },
            { id: 'hidden_reading', label: 'Lectura oculta' },
            { id: 'translation_heretical', label: 'Traducción herética' },
        ],
        salidas: ['cipher_solution', 'conceptual_clue'],
    },
    divergence: {
        label: 'Divergencia · choque',
        nombre: 'Divergence_Clash',
        color: '#4ade9e',
        glyph: '⇄',
        que_es: 'Donde el historiador y el lingüista chocan y la versión oficial se cae.',
        entradas: ['dead_end_resolution', 'cipher_solution'],
        campos: [
            { id: 'historian_standpoint', label: 'El historiador (jugador)' },
            { id: 'linguist_standpoint', label: 'El lingüista (antagonista)' },
            { id: 'contradiction', label: 'La contradicción irreconciliable' },
        ],
        salidas: ['dialectic_breakthrough'],
    },
    philosophical: {
        label: 'Núcleo filosófico',
        nombre: 'Philosophical_Core',
        color: '#e2e8f0',
        glyph: 'Φ',
        que_es: 'La revelación racional: una herejía filosófica, nunca una reliquia sobrenatural.',
        entradas: ['dialectic_breakthrough', 'conceptual_clue'],
        campos: [
            {
                id: 'school_of_thought',
                label: 'Escuela',
                opts: [
                    'averroismo_latino',
                    'nominalismo_radical',
                    'espiritualismo_joaquinita',
                    'herejia_del_cero',
                ],
            },
            { id: 'apocryphal_thesis', label: 'Tesis apócrifa' },
            { id: 'institutional_impact', label: 'Por qué amenazaba al Cabildo o a Roma' },
            {
                id: 'formulable_como',
                label: 'Se formula como',
                opts: ['ontologica', 'fisica', 'politica'],
            },
        ],
        salidas: ['quest_climax', 'narrative_reward'],
    },
}

export const CLAVES_GNIEC = Object.keys(TIPOS_GNIEC)

/** El tipo de un nodo, con respaldo por si el dato viene de fuera. */
export function tipoGniecDe(nodo) {
    return TIPOS_GNIEC[nodo?.tipo] || null
}

/** Todas las salidas posibles, para validar etiquetas de arista. */
export const SALIDAS_VALIDAS = new Set(
    Object.values(TIPOS_GNIEC).flatMap((t) => t.salidas),
)

// ─────────────────────────────────────────────────────────────────────────────
// LAS TRES CONDICIONES DE INTEGRIDAD
//
// «Un grafo se considera VÁLIDO Y VEROSÍMIL únicamente si cumple tres
// condiciones.» Aquí están, comprobables. No inventan criterio: aplican el
// suyo.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 1. RUTA DUAL OBLIGATORIA.
 * Todo `Anclaje visible` tiene que bifurcarse a la vez en un `Arenque rojo` y
 * en una `Epigrafía latina`. Sin arenque rojo el puzle se siente artificial:
 * le falta camuflaje en el entorno.
 */
export function validarRutaDual(nodos = []) {
    const porId = new Map(nodos.map((n) => [n.id, n]))
    const problemas = []

    for (const ancla of nodos.filter((n) => n.tipo === 'anchor')) {
        const hijos = nodos.filter((n) => (n.prereq || []).includes(ancla.id))
        const hayArenque = hijos.some((n) => n.tipo === 'red_herring')
        const hayEpigrafia = hijos.some((n) => n.tipo === 'epigraphy')
        if (!hayArenque) {
            problemas.push({
                regla: 'ruta_dual',
                nodo: ancla.id,
                mensaje: 'El anclaje visible no tiene arenque rojo: el puzle queda sin camuflaje.',
            })
        }
        if (!hayEpigrafia) {
            problemas.push({
                regla: 'ruta_dual',
                nodo: ancla.id,
                mensaje: 'El anclaje visible no tiene epigrafía latina: no hay nada que leer.',
            })
        }
        if (hijos.length === 0 && !porId.size) {
            problemas.push({ regla: 'ruta_dual', nodo: ancla.id, mensaje: 'El anclaje está suelto.' })
        }
    }
    return problemas
}

/**
 * 2. FILTRO ANTI-FANTASÍA.
 * El nodo terminal no puede quedarse en lo sobrenatural: la revelación tiene
 * que poder formularse como proposición ontológica, física o política medieval.
 */
export function validarAntiFantasia(nodos = []) {
    const problemas = []
    for (const nucleo of nodos.filter((n) => n.tipo === 'philosophical')) {
        const formulacion = campoDe(nucleo, 'formulable_como')
        if (!formulacion) {
            problemas.push({
                regla: 'anti_fantasia',
                nodo: nucleo.id,
                mensaje:
                    'El núcleo filosófico no declara cómo se formula. Sin eso no se puede descartar que sea sobrenatural.',
            })
            continue
        }
        if (!['ontologica', 'fisica', 'politica'].includes(formulacion)) {
            problemas.push({
                regla: 'anti_fantasia',
                nodo: nucleo.id,
                mensaje: `«${formulacion}» no es ontológica, física ni política.`,
            })
        }
    }
    return problemas
}

/**
 * 3. COMPROBACIÓN DE EPIGRAFÍA REAL.
 * La epigrafía tiene que consignar texto de verdad y su sistema de
 * abreviaturas por suspensión o contracción.
 */
export function validarEpigrafia(nodos = []) {
    const problemas = []
    for (const epi of nodos.filter((n) => n.tipo === 'epigraphy')) {
        if (!String(campoDe(epi, 'raw_inscription') || '').trim()) {
            problemas.push({
                regla: 'epigrafia',
                nodo: epi.id,
                mensaje: 'No hay transcripción literal del texto grabado.',
            })
        }
        const abreviaturas = campoDe(epi, 'abbreviations_detected')
        const cuantas = Array.isArray(abreviaturas) ? abreviaturas.length : 0
        if (cuantas === 0) {
            problemas.push({
                regla: 'epigrafia',
                nodo: epi.id,
                mensaje:
                    'No se ha consignado ninguna abreviatura: sin suspensiones ni contracciones no hay epigrafía medieval.',
            })
        }
    }
    return problemas
}

/** Las tres condiciones, juntas. */
export function validarGrafo(nodos = []) {
    return [...validarRutaDual(nodos), ...validarAntiFantasia(nodos), ...validarEpigrafia(nodos)]
}

/** Lee un campo del nodo, venga en `campos` o en la raíz. */
export function campoDe(nodo, id) {
    return nodo?.campos?.[id] ?? nodo?.[id] ?? ''
}

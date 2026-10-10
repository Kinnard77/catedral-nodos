import { findAncla, normalizar } from '../data/catalog.js'
import { emptyRoute, ordenDeDiseno, prerequisiteClosure, retrieveLessons, tokenize } from './contract.js'

/**
 * Motor local del Gameflow de catedrales. No usa red ni API keys.
 *
 * No "clasifica" un tema: interpreta la INTENCION de diseño que escribe el
 * usuario y monta la ruta en orden de diseño inverso, abriendo por el ancla
 * (el final del juego) y colgando de ella todo lo que hace falta antes.
 *
 * El punto de partida NO depende del prompt: siempre es el final. Lo que el
 * prompt decide es qué piezas de la ruta tocan esa intencion concreta.
 */
export function createLocalProvider() {
    return {
        id: 'local',
        label: 'Motor local (sin conexión)',
        async classify(prompt, lessons, index) {
            const ancla = findAncla(lessons)

            if (!ancla) {
                return {
                    ...emptyRoute(prompt),
                    summary:
                        'Este catálogo no declara ningún nodo ancla. Sin un final no se puede diseñar hacia atrás: marca la pieza final con `ancla: true`.',
                    rationale: 'El diseño inverso necesita un final del que colgar el resto.',
                    generatedBy: 'local',
                }
            }

            // Todas las piezas que sostienen el final, de la más profunda al ancla.
            const camino = prerequisiteClosure(ancla.id, index, { max: 40 })
            // Diseño inverso: el ancla primero, luego lo que hay que resolver antes.
            const piezas = ordenDeDiseno(camino)

            // Piezas que tocan la intencion escrita. `retrieveLessons` rellena
            // con el punto de entrada cuando no hay coincidencia: se descarta
            // ese relleno (score 1) para no marcar medio grafo como relevante.
            const toca = new Set(
                retrieveLessons(prompt, lessons, { top: 12 })
                    .filter((r) => r.score > 1)
                    .map((r) => r.lesson.id),
            )
            const tokens = tokenize(prompt)

            const steps = piezas.map((pieza, i) => ({
                lessonId: pieza.id,
                order: i + 1,
                role: pieza.id === ancla.id ? 'nucleo' : toca.has(pieza.id) ? 'practica' : 'fundamento',
                rationale: razon(pieza, ancla, index, toca, tokens),
            }))

            return {
                ...emptyRoute(prompt),
                title: tituloDe(prompt, ancla.title),
                summary: `Diseño inverso desde el final: ${piezas.length} piezas sostienen «${ancla.title}».`,
                subject: ancla.subject,
                rationale: `El lienzo abre por el final del juego y revela hacia atrás lo que hace falta antes. Bajo «${ancla.title}» cuelgan ${piezas.length - 1} pieza(s).${
                    toca.size
                        ? ` ${toca.size} de ellas tocan la intención que escribiste.`
                        : ' Ninguna coincide literalmente con tu intención todavía: usa el lienzo para agregarlas.'
                }`,
                cobertura: toca.size,
                debil: toca.size === 0,
                estimatedMin: piezas.reduce((s, p) => s + (p.durationMin || 0), 0),
                steps,
                generatedBy: 'local',
            }
        },
    }
}

function tituloDe(prompt, tituloAncla) {
    const limpio = prompt.trim().replace(/[.?!]+$/, '')
    if (!limpio) return `Gameflow hacia ${tituloAncla}`
    if (limpio.length <= 60) return limpio.charAt(0).toUpperCase() + limpio.slice(1)
    return `Diseno alrededor de ${tituloAncla}`
}

/**
 * Explica el lugar de una pieza en el diseno inverso: de que depende lo que
 * viene despues, y si toca o no la intencion que escribio el usuario.
 */
function razon(pieza, ancla, index, toca, tokens) {
    if (pieza.id === ancla.id) {
        return 'El final del juego. Todo el diseño cuelga de aquí, así que es lo primero que se decide.'
    }

    const dependientes = [...index.values()]
        .filter((otra) => otra.prereq.includes(pieza.id))
        .map((otra) => otra.title)

    let base
    if (dependientes.length === 0) {
        base = 'Pieza de arranque: no depende de nada anterior.'
    } else if (dependientes.includes(ancla.title)) {
        base = `Pilar del final: «${ancla.title}» no se sostiene sin esta pieza.`
    } else {
        const lista = dependientes.slice(0, 2).map((t) => `«${t}»`).join(' y ')
        base = `Hace falta antes de ${lista}.`
    }

    if (toca.has(pieza.id)) {
        const compartidos = tokens.filter((t) =>
            normalizar(`${pieza.tags.join(' ')} ${pieza.title} ${pieza.summary}`).includes(t),
        )
        const eco = compartidos.length ? ` (${compartidos.slice(0, 2).join(', ')})` : ''
        return `${base} Toca la intención que escribiste${eco}.`
    }

    return base
}

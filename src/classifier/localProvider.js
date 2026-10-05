import { normalizar } from '../data/catalog.js'
import {
    detectarMateria,
    emptyRoute,
    pedagogicalSort,
    prerequisiteClosure,
    retrieveLessons,
    tokenize,
} from './contract.js'

/**
 * Clasificador local. No usa red ni API keys: recupera por coincidencia
 * lexica, cierra prerequisitos y ordena por nivel. Es el respaldo cuando
 * el LLM no esta configurado, y el punto de comparacion para validar al LLM.
 */
export function createLocalProvider() {
    return {
        id: 'local',
        label: 'Clasificador local (sin conexion)',
        async classify(prompt, lessons, index) {
            const relevancia = retrieveLessons(prompt, lessons, { top: 10 })
            const materia = detectarMateria(prompt, lessons)

            if (!relevancia.length) {
                return {
                    ...emptyRoute(prompt),
                    summary:
                        'No encontre lecciones del catalogo que respondan a esa peticion. Reformula el objetivo o conecta un LLM para generar lecciones nuevas.',
                    rationale: 'Sin coincidencias en el catalogo actual.',
                    generatedBy: 'local',
                }
            }

            // El objetivo de la ruta es la coincidencia mas fuerte; el resto suma.
            const principal = relevancia[0].lesson
            const objetivo = materia && principal.subject !== materia
                ? relevancia.find((r) => r.lesson.subject === materia)?.lesson || principal
                : principal

            const camino = prerequisiteClosure(objetivo.id, index, { max: 7 })
            const ordenado = pedagogicalSort(camino)

            const refuerzos = relevancia
                .map((r) => r.lesson)
                .filter((l) => !ordenado.some((o) => o.id === l.id))
                .filter((l) => l.subject === objetivo.subject)
                .slice(0, 2)

            // Los refuerzos son transversales: si se anexaran al final, un
            // refuerzo podria quedar despues de su propio prerrequisito solo
            // por venir de otra lista. Se reordena todo junto.
            const seleccion = pedagogicalSort([...ordenado, ...refuerzos])
            const tokens = tokenize(prompt)

            // Un acierto debil significa que el catalogo no cubre el objetivo:
            // la ruta es una sugerencia de punto de partida, no una respuesta.
            const cobertura = relevancia[0].score
            const debil = cobertura < 8

            return {
                ...emptyRoute(prompt),
                title: tituloDe(prompt, objetivo.title),
                summary: debil
                    ? `El catálogo no cubre ese objetivo directamente. Estas ${seleccion.length} lecciones son el punto de entrada más cercano.`
                    : `Ruta de ${seleccion.length} lecciones para llegar a "${objetivo.title}".`,
                subject: objetivo.subject,
                rationale: debil
                    ? `La coincidencia más fuerte fue "${objetivo.title}" y es débil. Conecta un LLM para que redacte las lecciones que faltan, o reformula la petición.`
                    : `Coincidencia principal: ${objetivo.title}. Se agregaron ${ordenado.length - 1} prerequisito(s) y ${refuerzos.length} leccion(es) de refuerzo del mismo campo.`,
                cobertura,
                debil,
                estimatedMin: seleccion.reduce((s, l) => s + l.durationMin, 0),
                steps: seleccion.map((lesson, i) => ({
                    lessonId: lesson.id,
                    order: i + 1,
                    role:
                        lesson.id === objetivo.id
                            ? 'nucleo'
                            : refuerzos.some((r) => r.id === lesson.id)
                              ? 'practica'
                              : 'fundamento',
                    rationale: razon(lesson, objetivo, tokens, {
                        directo: objetivo.prereq.includes(lesson.id),
                        esRefuerzo: refuerzos.some((r) => r.id === lesson.id),
                    }),
                })),
                generatedBy: 'local',
            }
        },
    }
}

function tituloDe(prompt, tituloObjetivo) {
    const limpio = prompt.trim().replace(/[.?!]+$/, '')
    if (limpio.length <= 60) {
        const capitalizado = limpio.charAt(0).toUpperCase() + limpio.slice(1)
        return capitalizado
    }
    return `Ruta hacia ${tituloObjetivo}`
}

/**
 * Explica en una frase por que el nodo va en la ruta.
 * Se apoya en la relacion real del catalogo: si la leccion es prerrequisito
 * DIRECTO del objetivo, se dice; si solo es un eslabon intermedio, se marca
 * como base indirecta. Sin repetir la misma frase en toda la secuencia.
 */
function razon(lesson, objetivo, tokens, { directo = false, esRefuerzo = false } = {}) {
    if (lesson.id === objetivo.id) {
        return 'Lección objetivo: cubre directamente lo que pide el prompt.'
    }
    if (esRefuerzo) {
        return `No es requisito declarado, pero comparte campo con ${objetivo.title} y refuerza la misma habilidad.`
    }
    const compartidos = tokens.filter((t) =>
        normalizar(`${lesson.tags.join(' ')} ${lesson.title} ${lesson.summary}`).includes(t),
    )
    const coincidencia = compartidos.length
        ? ` Trabaja ${compartidos.slice(0, 2).join(' y ')}, que reaparecen en el objetivo.`
        : ''

    if (directo) {
        return `Prerrequisito directo de ${objetivo.title}: sin esto, el objetivo se vuelve mecánico.${coincidencia}`
    }
    return `Eslabón intermedio: sostiene la cadena de prerrequisitos hasta ${objetivo.title}.${coincidencia}`
}

/**
 * Prueba de humo de la logica del producto, sin navegador.
 * Ejecutar: node scripts/smoke.mjs
 */
import { buildCatalog, createClassifier } from '../src/classifier/index.js'
import { indexById, buildEdges } from '../src/data/catalog.js'
import { desplegar, inicializarGrafo, calcularLayout } from '../src/graph/graphEngine.js'

let fallos = 0
const ok = (condicion, mensaje) => {
    if (condicion) {
        console.log(`  ok   ${mensaje}`)
    } else {
        fallos += 1
        console.log(`  FALLA ${mensaje}`)
    }
}

const { lessons } = buildCatalog([])
const index = indexById(lessons)
const edgesCatalogo = buildEdges(lessons)

console.log(`\n1. Catalogo (${lessons.length} lecciones, ${edgesCatalogo.length} conexiones)`)
ok(lessons.length >= 20, 'el catalogo semilla tiene al menos 20 lecciones')
const ids = new Set(lessons.map((l) => l.id))
ok(ids.size === lessons.length, 'no hay IDs duplicados')
const prereqRotas = lessons.flatMap((l) => [...l.prereq, ...l.unlocks]).filter((id) => !ids.has(id))
ok(prereqRotas.length === 0, `todas las relaciones apuntan a lecciones existentes (rotas: ${prereqRotas.length})`)
const sinContenido = lessons.filter((l) => !l.content.length)
ok(sinContenido.length === 0, 'todas las lecciones tienen contenido')

// Ciclos: un ciclo en prerequisitos rompe el orden pedagogico.
const color = new Map()
let ciclos = 0
const visitar = (id) => {
    color.set(id, 1)
    for (const pre of index.get(id).prereq) {
        if (color.get(pre) === 1) ciclos += 1
        else if (!color.get(pre)) visitar(pre)
    }
    color.set(id, 2)
}
for (const l of lessons) if (!color.get(l.id)) visitar(l.id)
ok(ciclos === 0, `el grafo de prerrequisitos no tiene ciclos (encontrados: ${ciclos})`)

console.log('\n2. Clasificador local: "Quiero aprender el teorema de Pitagoras"')
const clasificador = createClassifier({ mode: 'local' })
const ruta = await clasificador.classify('Quiero aprender el teorema de Pitagoras', lessons)
ok(ruta.steps.length >= 3, `la ruta tiene al menos 3 pasos (${ruta.steps.length})`)
ok(
    ruta.steps.some((s) => s.lessonId === 'mate-pitagoras'),
    'la ruta incluye la leccion objetivo (mate-pitagoras)',
)
const posicionObjetivo = ruta.steps.findIndex((s) => s.lessonId === 'mate-pitagoras')
ok(posicionObjetivo >= 0, `la leccion objetivo esta en la ruta (posicion ${posicionObjetivo + 1})`)
const prereqAntes = index.get('mate-pitagoras').prereq.every((pre) =>
    ruta.steps.slice(0, posicionObjetivo).some((s) => s.lessonId === pre),
)
ok(prereqAntes, 'los prerrequisitos aparecen antes del objetivo')
console.log(`  -> ${ruta.title}`)
ruta.steps.forEach((s) => console.log(`     ${s.order}. [${s.role}] ${s.lessonId}`))

console.log('\n3. Despliegue progresivo del grafo')
let estado = inicializarGrafo(ruta.steps, index)
const visibles = new Set(estado.visibles)
const contadores = new Map(Object.entries(estado.contadores))
const edges = [...estado.edges]
ok(visibles.size >= 1, `el grafo arranca con ${visibles.size} nodo(s), no con la ruta completa`)
ok(visibles.size < ruta.steps.length, 'no se muestra toda la ruta desde el inicio')

const activo = estado.activo
let ronda = 0
let anterior = visibles.size
while (ronda < 8) {
    const r = desplegar({
        lessonId: activo,
        visibles: [...visibles],
        contadores: Object.fromEntries(contadores),
        ruta: estado.ruta,
        index,
    })
    r.ids.forEach((id) => visibles.add(id))
    edges.push(...r.edges)
    Object.entries(r.contadores).forEach(([k, v]) => contadores.set(k, v))
    ronda += 1
    console.log(
        `  ronda ${ronda}: +${r.ids.length} nodo(s) [${r.ids.join(', ') || 'nada'}] motivo: ${r.motivo || '-'}`,
    )
    if (r.ids.length === 0) break
    anterior = visibles.size
}
ok(visibles.size > 1, `el grafo crecio a ${visibles.size} nodos por despliegue progresivo`)
ok(visibles.size >= anterior, 'el despliegue solo agrega nodos, nunca los quita')

console.log('\n4. Layout y conexiones')
const leccionesVisibles = [...visibles].map((id) => index.get(id)).filter(Boolean)
const edgesVisibles = edges.filter((e) => visibles.has(e.from) && visibles.has(e.to))
const layout = calcularLayout(leccionesVisibles, edgesVisibles, { ordenPreferido: estado.ruta })
ok(layout.posiciones.size === leccionesVisibles.length, 'todos los nodos visibles tienen posicion')
ok(layout.width > 0 && layout.height > 0, `el lienzo mide ${Math.round(layout.width)}x${Math.round(layout.height)}`)
const posicionesUnicas = new Set(
    [...layout.posiciones.values()].map((p) => `${Math.round(p.x)}:${Math.round(p.y)}`),
)
ok(posicionesUnicas.size === layout.posiciones.size, 'no hay dos nodos en la misma posicion')
ok(edgesVisibles.length > 0, `hay ${edgesVisibles.length} conexiones visibles`)

// Invariante clave del flujo: cada nodo queda a la derecha de sus prerrequisitos.
const retrocesos = edgesVisibles.filter((e) => {
    const a = layout.posiciones.get(e.from)
    const b = layout.posiciones.get(e.to)
    return a && b && e.kind === 'prereq' && b.x <= a.x
})
ok(retrocesos.length === 0, `todo prerrequisito queda a la izquierda de su dependiente (retrocesos: ${retrocesos.length})`)

// El layout no debe depender del orden en que llegaron los nodos.
const invertido = calcularLayout([...leccionesVisibles].reverse(), [...edgesVisibles].reverse(), {
    ordenPreferido: estado.ruta,
})
const estable = leccionesVisibles.every((l) => {
    const a = layout.posiciones.get(l.id)
    const b = invertido.posiciones.get(l.id)
    return a && b && Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y)
})
ok(estable, 'el layout es estable ante el orden de llegada de los nodos')

console.log('\n5. Clasificador local con prompt fuera del catalogo')
const rutaRara = await clasificador.classify('Quiero aprender a tocar el violin', lessons)
ok(Array.isArray(rutaRara.steps), 'devuelve una ruta aunque no haya coincidencia fuerte')
console.log(`  -> pasos: ${rutaRara.steps.length}, resumen: ${rutaRara.summary?.slice(0, 90)}`)

console.log('\n6. Validacion anti-alucinacion (respuesta simulada del LLM)')
const { parseRouteResponse } = await import('../src/classifier/llmProvider.js')
const simulada = {
    title: 'Ruta simulada',
    subject: 'mate',
    steps: [
        { order: 1, lessonId: 'mate-inventada-que-no-existe', role: 'nucleo' },
        { order: 2, lessonId: 'mate-pitagoras', role: 'nucleo' },
    ],
    newLessons: [
        {
            id: 'mate-nueva-valida',
            title: 'Leccion nueva',
            subject: 'mate',
            level: 1,
            content: [
                { type: 'markdown', text: 'Texto de prueba.' },
                { type: 'quiz', quiz: { q: '¿2+2?', options: ['4', '5'], answer: 0, why: 'Aritmetica.' } },
                { type: 'basura', text: 'bloque invalido' },
            ],
        },
        { id: 'mate-pitagoras', title: 'Duplicada del catalogo' },
    ],
}
const limpiada = parseRouteResponse(simulada, 'prueba', index)
ok(
    limpiada.steps.every((s) => index.has(s.lessonId) || limpiada.newLessons.some((l) => l.id === s.lessonId)),
    'se descartan los pasos con IDs inexistentes',
)
ok(limpiada.newLessons.length === 1, 'solo se acepta la leccion nueva valida (no la que duplica el catalogo)')
ok(limpiada.newLessons[0].content.length === 2, 'se descartan los bloques con tipo invalido')
ok(limpiada.rejectedSteps === 1, 'se reporta cuantos pasos se descartaron')

console.log(`\n${fallos === 0 ? 'TODO EN VERDE' : `${fallos} PRUEBA(S) FALLIDA(S)`}\n`)
process.exit(fallos === 0 ? 0 : 1)

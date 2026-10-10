/**
 * Prueba de humo de la logica del producto, sin navegador.
 * Ejecutar: node scripts/smoke.mjs
 *
 * Verifica el metodo del proyecto: DISENO INVERSO. El lienzo abre por el final
 * del juego (el ancla) y cada clic revela lo que hace falta ANTES.
 */
import {
    buildCatalog,
    buscarModeloQueResponda,
    candidatosDe,
    createClassifier,
    DEFAULT_LLM,
    PRESETS,
    probarMotor,
} from '../src/classifier/index.js'
import { soportaJsonMode } from '../src/classifier/llmProvider.js'
import {
    CATALOGO_GEMINI,
    fuenteEstaConsultada,
    formatoDeClave,
    leerCatalogo,
    leerErrorGoogle,
    modeloGemini,
    NIVEL_RAZONAMIENTO,
    normalizarModeloId,
    sirveParaTexto,
    soportaThinkingLevel,
} from '../src/classifier/gemini.js'
import { leerInteraccion, llamarAgente, llamarInteraccion } from '../src/classifier/interacciones.js'
import { indexById, buildEdges, findAncla } from '../src/data/catalog.js'
import { CATEDRALES, unirCatedrales } from '../src/data/catedrales.js'
import {
    CATEGORIAS,
    elementosDe,
    escribirTexto,
    faltaFuente,
    IDIOMAS,
    resumenElementos,
    texto,
} from '../src/domain/elemento.js'
import { parseMisterios, proponerMisterios } from '../src/classifier/misterios.js'
import { soloConReal } from '../src/domain/misterio.js'
import {
    CLAVES_GNIEC,
    TIPOS_GNIEC,
    validarAntiFantasia,
    validarEpigrafia,
    validarGrafo,
    validarRutaDual,
} from '../src/domain/gniec.js'
import {
    anclajesDe,
    descartar,
    documentar,
    normalizarOpcion,
    opcionesVivas,
    PILARES,
    recuperar,
    resumenMaterial,
} from '../src/domain/material.js'
import { investigarCatedral, parseInvestigacion } from '../src/classifier/investigacion.js'
import {
    anclajesConMaterial,
    grafoDesdeMaterial,
    ordenDeDiseno,
    tieneFinal,
    tipoDeOpcion,
} from '../src/domain/puente.js'
import { materialValencia } from '../src/data/material/ejemplo-valencia.js'
import { anclajesConGrafo, tieneGrafo } from '../src/data/gameflow/grafos.js'
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
const ancla = findAncla(lessons)

console.log(`\n1. Nodos del grafo (${lessons.length} nodos, ${edgesCatalogo.length} conexiones)`)
ok(lessons.length >= 6, 'el grafo del GN-IEC tiene al menos 6 nodos')
const ids = new Set(lessons.map((l) => l.id))
ok(ids.size === lessons.length, 'no hay IDs duplicados')
const relacionesRotas = lessons.flatMap((l) => [...l.prereq, ...l.unlocks]).filter((id) => !ids.has(id))
ok(relacionesRotas.length === 0, `todas las relaciones apuntan a piezas existentes (rotas: ${relacionesRotas.length})`)
const sinContenido = lessons.filter((l) => !l.content.length)
ok(sinContenido.length === 0, 'todas las piezas tienen contenido')
ok(Boolean(ancla), `el catalogo declara un ancla: ${ancla?.id || 'NINGUNA'}`)
ok(lessons.filter((l) => l.ancla).length === 1, 'hay exactamente un ancla (un solo final)')

// Ciclos: un ciclo en prerrequisitos rompe el orden de diseno.
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

// Todo el diseno tiene que colgar del final: si una pieza no es ancestro del
// ancla, es una isla que el diseno inverso nunca va a revelar.
const ancestros = new Set()
const subir = (id) => {
    for (const pre of index.get(id)?.prereq || []) {
        if (ancestros.has(pre)) continue
        ancestros.add(pre)
        subir(pre)
    }
}
subir(ancla.id)
const islas = lessons.filter((l) => l.id !== ancla.id && !ancestros.has(l.id))
ok(islas.length === 0, `nada queda fuera del final (piezas isla: ${islas.map((l) => l.id).join(', ') || 'ninguna'})`)

console.log('\n2. El motor local arranca por el FINAL, no por el principio')
const motor = createClassifier({ mode: 'local' })
const intencion = 'Que el jugador descubra que las marcas de cantero son firmas'
const ruta = await motor.classify(intencion, lessons)
ok(ruta.steps.length >= 3, `la ruta tiene al menos 3 pasos (${ruta.steps.length})`)
ok(ruta.steps[0]?.lessonId === ancla.id, `el paso 1 es el ancla (${ruta.steps[0]?.lessonId})`)
ok(
    ruta.steps.some((s) => s.lessonId === ancla.id),
    'el final esta en la ruta',
)
const piezasEnRuta = new Set(ruta.steps.map((s) => s.lessonId))
const faltan = [...ancestros].filter((id) => !piezasEnRuta.has(id))
ok(faltan.length === 0, `la ruta incluye todo lo que sostiene el final (faltan: ${faltan.join(', ') || 'nada'})`)

// Propiedad del diseno inverso: en la ruta, el dependiente va ANTES que su prerrequisito.
const posicion = new Map(ruta.steps.map((s, i) => [s.lessonId, i]))
const invertidos = edgesCatalogo.filter(
    (e) =>
        e.kind === 'prereq' &&
        posicion.has(e.from) &&
        posicion.has(e.to) &&
        posicion.get(e.from) < posicion.get(e.to),
)
ok(
    invertidos.length === 0,
    `en la ruta, cada pieza va antes de lo que la necesita (fuera de orden: ${invertidos.length})`,
)
console.log(`  -> ${ruta.title}`)
console.log(`  -> ${ruta.summary}`)
ruta.steps.slice(0, 5).forEach((s) => console.log(`     ${s.order}. [${s.role}] ${s.lessonId}`))
if (ruta.steps.length > 5) console.log(`     … ${ruta.steps.length - 5} mas`)

console.log('\n3. El lienzo abre con el final solo')
let estado = inicializarGrafo(ruta.steps, index, { conBase: false })
const visibles = new Set(estado.visibles)
const edges = [...estado.edges]
ok(visibles.size === 1, `el grafo arranca con 1 nodo (${visibles.size})`)
ok(visibles.has(ancla.id), 'ese nodo es el final del juego')
ok(estado.activo === ancla.id, 'el nodo activo es el final')
ok(
    visibles.size < ruta.steps.length,
    `no se muestra el diseno completo desde el inicio (${visibles.size} de ${ruta.steps.length})`,
)

console.log('\n4. Despliegue hacia atras: cada clic revela lo que hace falta antes')
const primerClic = desplegar({
    lessonId: ancla.id,
    visibles: [...visibles],
    contadores: {},
    ruta: estado.ruta,
    index,
})
const prereqsAncla = index.get(ancla.id).prereq
ok(
    primerClic.ids.length > 0 && primerClic.ids.every((id) => prereqsAncla.includes(id)),
    `el primer clic revela los prerrequisitos del final (${primerClic.ids.join(', ')})`,
)
ok(
    primerClic.edges.every((e) => e.kind === 'prereq' && e.to === ancla.id),
    'las conexiones nuevas apuntan al final, no hacia adelante',
)
console.log(`  motivo: ${primerClic.motivo}`)

// Recorrido completo: se pulsa cada nodo una vez y se comprueba que el diseno
// entero se revela y que el grafo nunca se encoge.
const contadores = { ...primerClic.contadores }
primerClic.ids.forEach((id) => visibles.add(id))
edges.push(...primerClic.edges)
const cola = [...primerClic.ids]
const pulsados = new Set([ancla.id])
let ronda = 0
let minimo = visibles.size
let encogio = false

while (cola.length && ronda < 40) {
    const id = cola.shift()
    if (pulsados.has(id)) continue
    pulsados.add(id)
    const r = desplegar({
        lessonId: id,
        visibles: [...visibles],
        contadores,
        ruta: estado.ruta,
        index,
    })
    Object.assign(contadores, r.contadores)
    r.ids.forEach((nuevo) => visibles.add(nuevo))
    edges.push(...r.edges)
    ronda += 1
    if (visibles.size < minimo) encogio = true
    minimo = Math.min(minimo, visibles.size)
    console.log(
        `  ${String(ronda).padStart(2)}. desde ${id} -> +${r.ids.length} [${r.ids.join(', ') || 'nada'}]`,
    )
    r.ids.forEach((nuevo) => {
        if (!pulsados.has(nuevo)) cola.push(nuevo)
    })
}

ok(visibles.size === lessons.length, `el diseno entero queda revelado (${visibles.size}/${lessons.length})`)
ok(!encogio, 'el despliegue solo agrega nodos, nunca los quita')

console.log('\n5. Layout: el final queda a la derecha y nada se solapa')
const piezasVisibles = [...visibles].map((id) => index.get(id)).filter(Boolean)
const edgesVisibles = edges.filter((e) => visibles.has(e.from) && visibles.has(e.to))
const layout = calcularLayout(piezasVisibles, edgesVisibles, { ordenPreferido: estado.ruta })
ok(layout.posiciones.size === piezasVisibles.length, 'todos los nodos visibles tienen posicion')
ok(layout.width > 0 && layout.height > 0, `el lienzo mide ${Math.round(layout.width)}x${Math.round(layout.height)}`)
const posicionesUnicas = new Set(
    [...layout.posiciones.values()].map((p) => `${Math.round(p.x)}:${Math.round(p.y)}`),
)
ok(posicionesUnicas.size === layout.posiciones.size, 'no hay dos nodos en la misma posicion')
ok(edgesVisibles.length > 0, `hay ${edgesVisibles.length} conexiones visibles`)

const retrocesos = edgesVisibles.filter((e) => {
    const a = layout.posiciones.get(e.from)
    const b = layout.posiciones.get(e.to)
    return a && b && e.kind === 'prereq' && b.x <= a.x
})
ok(
    retrocesos.length === 0,
    `todo prerrequisito queda a la izquierda de su dependiente (retrocesos: ${retrocesos.length})`,
)

const xAncla = layout.posiciones.get(ancla.id)?.x ?? -1
const xMax = Math.max(...[...layout.posiciones.values()].map((p) => p.x))
ok(xAncla === xMax, 'el final es el nodo mas a la derecha del lienzo')

const invertido = calcularLayout([...piezasVisibles].reverse(), [...edgesVisibles].reverse(), {
    ordenPreferido: estado.ruta,
})
const estable = piezasVisibles.every((l) => {
    const a = layout.posiciones.get(l.id)
    const b = invertido.posiciones.get(l.id)
    return a && b && Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y)
})
ok(estable, 'el layout es estable ante el orden de llegada de los nodos')

console.log('\n6. Intencion que no toca ninguna pieza del catalogo')
const rutaRara = await motor.classify('Que el jugador aprenda a tocar el violin', lessons)
ok(Array.isArray(rutaRara.steps), 'devuelve una ruta aunque la intencion no coincida')
ok(rutaRara.steps[0]?.lessonId === ancla.id, 'aun asi arranca por el final (el punto de partida no depende del prompt)')
console.log(`  -> pasos: ${rutaRara.steps.length}, resumen: ${rutaRara.summary?.slice(0, 90)}`)

console.log('\n7. Validacion anti-alucinacion (respuesta simulada del motor LLM)')
const { parseRouteResponse } = await import('../src/classifier/llmProvider.js')
const simulada = {
    title: 'Diseno simulado',
    subject: 'arte',
    steps: [
        { order: 1, lessonId: 'gf-pieza-que-no-existe', role: 'nucleo' },
        { order: 2, lessonId: ancla.id, role: 'nucleo' },
    ],
    newLessons: [
        {
            id: 'gf-nueva-valida',
            title: 'Pieza nueva',
            subject: 'revelacion',
            level: 1,
            content: [
                { type: 'markdown', text: 'Texto de prueba.' },
                { type: 'lista', items: ['Uno', 'Dos'] },
                { type: 'basura', text: 'bloque invalido' },
            ],
        },
        { id: ancla.id, title: 'Duplicada del catalogo' },
    ],
}
const limpiada = parseRouteResponse(simulada, 'prueba', index)
ok(
    limpiada.steps.every((s) => index.has(s.lessonId) || limpiada.newLessons.some((l) => l.id === s.lessonId)),
    'se descartan los pasos con IDs inexistentes',
)
ok(limpiada.newLessons.length === 1, 'solo se acepta la pieza nueva valida (no la que duplica el catalogo)')
ok(limpiada.newLessons[0].content.length === 2, 'se descartan los bloques con tipo invalido')
ok(limpiada.rejectedSteps === 1, 'se reporta cuantos pasos se descartaron')

console.log('\n8. Autoría: insertar una pieza ANTES de otra')
const nueva = {
    id: 'gf-prueba-autoria',
    title: 'Pieza añadida a mano',
    subject: 'revelacion',
    level: 1,
    summary: 'Prueba de insercion hacia atras.',
    content: [{ type: 'nota', text: 'Pieza de prueba.' }],
}
const conEnlace = buildCatalog([nueva], { [ancla.id]: ['gf-prueba-autoria'] })
const idxEnlace = indexById(conEnlace.lessons)
ok(idxEnlace.has('gf-prueba-autoria'), 'la pieza nueva entra en el catalogo')
ok(
    idxEnlace.get(ancla.id).prereq.includes('gf-prueba-autoria'),
    'queda enlazada como prerrequisito del final',
)
ok(
    !index.get(ancla.id).prereq.includes('gf-prueba-autoria'),
    'la semilla NO se muta: el enlace vive aparte',
)

// El motor no sabe que la pieza es un añadido: solo lee `prereq`, así que la
// revela por la rama de diseño inverso igual que a las de la semilla.
const rutaAutoria = await motor.classify('anadir una pieza a mano', conEnlace.lessons)
ok(
    rutaAutoria.steps.some((s) => s.lessonId === 'gf-prueba-autoria'),
    'la pieza nueva entra en la ruta de diseno',
)
const estadoAutoria = inicializarGrafo(rutaAutoria.steps, idxEnlace, { conBase: false })
const clicAutoria = desplegar({
    lessonId: ancla.id,
    visibles: [...estadoAutoria.visibles],
    contadores: {},
    ruta: estadoAutoria.ruta,
    index: idxEnlace,
})
ok(
    clicAutoria.ids.includes('gf-prueba-autoria'),
    'al pulsar el final aparece tambien la pieza añadida',
)
ok(
    clicAutoria.edges.some(
        (e) => e.from === 'gf-prueba-autoria' && e.to === ancla.id && e.kind === 'prereq',
    ),
    'se dibuja la conexion de prerrequisito hacia el final',
)

const conBasura = buildCatalog([], { [ancla.id]: ['gf-no-existe', ancla.id] })
ok(
    conBasura.lessons.find((l) => l.id === ancla.id).prereq.length === index.get(ancla.id).prereq.length,
    'los enlaces rotos o hacia si mismo se descartan',
)

console.log('\n9. La premisa: las catedrales las da el disenador, no la herramienta')
const cat = unirCatedrales(CATEDRALES, [])
const idsCat = new Set(cat.map((c) => c.id))
ok(idsCat.size === cat.length, `no hay catedrales duplicadas (${cat.length})`)
ok(cat.length >= 8, `el nodo Catedral trae las que dio el disenador (${cat.length})`)
const ESPERADAS = [
    'sevilla',
    'valencia',
    'burgos',
    'zaragoza',
    'notre-dame',
    'estrasburgo',
    'chartres',
    'ciudad-de-mexico',
]
const faltantes = ESPERADAS.filter((id) => !idsCat.has(id))
ok(faltantes.length === 0, `estan las 8 que dio el disenador (faltan: ${faltantes.join(', ') || 'ninguna'})`)
ok(
    cat.every((c) => Array.isArray(c.misterios)),
    'todas las catedrales tienen su lista de misterios',
)

// La regla del disenador: el Santo Grial esta en Valencia, no en Sevilla. El
// vinculo misterio-catedral se documenta, asi que aqui no puede haber ni un
// misterio inventado: nacen vacios y los llena el estudio.
const inventados = cat.filter((c) => (c.misterios?.length || 0) > 0)
ok(
    inventados.length === 0,
    `ninguna catedral trae misterios inventados (con misterios: ${inventados.map((c) => c.id).join(', ') || 'ninguna'})`,
)

const ampliada = unirCatedrales(CATEDRALES, [
    { id: 'sevilla', nombre: 'Catedral de Sevilla', misterios: [{ id: 'm1', titulo: 'Prueba' }] },
])
ok(
    ampliada.length === cat.length && ampliada.find((c) => c.id === 'sevilla').misterios.length === 1,
    'una catedral ampliada desde el lienzo se funde con la del disenador sin duplicarse',
)
const conToledo = unirCatedrales(CATEDRALES, [{ id: 'cat-toledo', nombre: 'Catedral de Toledo', misterios: [] }])
ok(conToledo.length === cat.length + 1, 'una catedral anadida desde el lienzo se suma a la lista')

console.log('\n10. El material: los elementos de la catedral')
ok(CATEGORIAS.length >= 8, `hay categorias-interrogatorio (${CATEGORIAS.length})`)
ok(
    CATEGORIAS.every((c) => typeof c.pregunta === 'string' && c.pregunta.length > 15),
    'cada categoria trae su pregunta: la herramienta pregunta, el disenador contesta',
)
ok(
    IDIOMAS.length === 5,
    `los cinco idiomas objetivo estan previstos (${IDIOMAS.map((i) => i.id).join(', ')})`,
)

// La regla del Grial aplicada al material: lo que afirmamos tiene que poder
// sostenerse. Lo inventado no afirma nada, asi que no necesita fuente.
const base = {
    id: 'elem-x',
    catedralId: 'sevilla',
    tipo: 'real',
    categoria: 'marca',
    textos: { es: { nombre: 'Una marca', detalle: '', fuente: '' } },
}
ok(faltaFuente(base), 'un elemento REAL sin fuente no vale')
ok(
    !faltaFuente({ ...base, textos: { es: { nombre: 'Una marca', fuente: 'Archivo de la catedral' } } }),
    'un elemento real con fuente si vale',
)
ok(
    !faltaFuente({ ...base, tipo: 'modificable' }),
    'un elemento inventado o modificado no necesita fuente: no afirma nada',
)

// Los textos se guardan por idioma desde el primer dia aunque hoy solo se
// escriba en espanol: con ~50 catedrales y cinco idiomas, cambiarlo despues
// seria rehacer todo el contenido.
const conIngles = escribirTexto(base, 'nombre', 'A mason mark', 'en')
ok(texto(conIngles, 'nombre', 'en') === 'A mason mark', 'se escribe en otro idioma sin pisar el espanol')
ok(texto(conIngles, 'nombre', 'es') === 'Una marca', 'el espanol sigue intacto')
ok(texto(conIngles, 'nombre', 'fr') === 'Una marca', 'un idioma sin texto cae al espanol')

const mezcla = [
    { id: 'a', catedralId: 'sevilla', tipo: 'real' },
    { id: 'b', catedralId: 'sevilla', tipo: 'modificable' },
    { id: 'c', catedralId: 'burgos', tipo: 'real' },
]
const resumen = resumenElementos(elementosDe(mezcla, 'sevilla'))
ok(
    resumen.total === 2 && resumen.reales === 1 && resumen.modificables === 1,
    `el resumen separa lo real de lo inventado (${JSON.stringify(resumen)})`,
)
ok(
    elementosDe(mezcla, 'sevilla').every((e) => e.catedralId === 'sevilla'),
    'los elementos no se mezclan entre catedrales',
)

console.log('\n11. El misterio: el motor propone, pero no puede inventar el suelo')
const material = [
    {
        id: 'e-real',
        catedralId: 'valencia',
        tipo: 'real',
        categoria: 'marca',
        textos: { es: { nombre: 'Inscripcion del coro', fuente: 'Archivo de la catedral' } },
    },
    {
        id: 'e-inv',
        catedralId: 'valencia',
        tipo: 'modificable',
        categoria: 'leyenda',
        textos: { es: { nombre: 'La campana que sono sola' } },
    },
]
const respuestaDelMotor = {
    misterios: [
        {
            titulo: 'La firma que nadie leyo',
            descubrimiento: 'El jugador descubre que la inscripcion es una firma.',
            encaje: 'Solo tiene sentido en este coro.',
            sostienen: ['e-real', 'e-inv'],
            duda: '¿Sera verdad?',
        },
        {
            // El caso del Grial en Sevilla: se apoya en algo que no existe.
            titulo: 'El grial escondido',
            descubrimiento: 'El jugador encuentra el grial.',
            encaje: 'Valdria para cualquier catedral.',
            sostienen: ['e-que-no-existe'],
            duda: '¿Sera verdad?',
        },
        { titulo: 'Sin nada', descubrimiento: '', sostienen: ['e-real'], duda: '' },
    ],
}
const saneado = parseMisterios(respuestaDelMotor, material)
ok(saneado.total === 3, `el motor propuso 3 (${saneado.total})`)
ok(saneado.candidatos.length === 1, `solo sobrevive el que se apoya en el material (${saneado.candidatos.length})`)
ok(saneado.candidatos[0].sostienen.length === 2, 'conserva los dos elementos que si existen')
ok(saneado.idsInventados === 1, 'cuenta el id que el motor se invento')
ok(saneado.rechazados.length === 2, 'reporta los dos que se cayeron')
ok(
    saneado.rechazados.some((r) => r.motivo.includes('no se apoya')),
    'el que citaba un elemento inexistente cae: la regla del Grial aplicada al misterio',
)
ok(
    saneado.rechazados.some(
        (r) => r.motivo.includes('titulo') || r.motivo.includes('descubrimiento'),
    ),
    'el que venia incompleto tambien cae',
)
ok(
    soloConReal(saneado.candidatos[0], material) === false,
    'se sabe que el candidato mezcla real e inventado',
)
ok(
    saneado.candidatos[0].textos.es.titulo === 'La firma que nadie leyo',
    'el misterio se guarda por idioma, como los elementos',
)

// Ni sin clave ni sin material: fingir que el motor puede seria peor que decirlo.
let falloClave = ''
try {
    await proponerMisterios({ settings: { llm: {} }, catedral: { nombre: 'X' }, elementos: material })
} catch (e) {
    falloClave = e.message
}
ok(falloClave.includes('clave'), 'sin clave el motor lo dice en vez de fingir')
let falloMaterial = ''
try {
    await proponerMisterios({
        settings: { llm: { apiKey: 'x' } },
        catedral: { nombre: 'X' },
        elementos: [],
    })
} catch (e) {
    falloMaterial = e.message
}
ok(falloMaterial.includes('material'), 'sin material tampoco: solo podria inventar')

console.log('\n12. El GN-IEC: la especificacion del disenador, comprobable')
ok(CLAVES_GNIEC.length === 6, `los seis tipos de nodo del GN-IEC (${CLAVES_GNIEC.length})`)
ok(
    CLAVES_GNIEC.every((k) => TIPOS_GNIEC[k].campos.length > 0 && TIPOS_GNIEC[k].salidas.length > 0),
    'cada tipo declara sus campos y sus salidas',
)
ok(
    TIPOS_GNIEC.philosophical.salidas.includes('quest_climax') &&
        TIPOS_GNIEC.epigraphy.salidas.includes('latin_tokens'),
    'las salidas son las etiquetas que viajan por las aristas',
)

const grafo = buildCatalog([]).lessons
const problemasDelEjemplo = validarGrafo(grafo)
ok(
    problemasDelEjemplo.length === 0,
    `el grafo de ejemplo es VALIDO Y VEROSIMIL (${problemasDelEjemplo.length} problema(s))`,
)

// Condicion 1: ruta dual obligatoria.
const sinArenque = grafo
    .filter((n) => n.id !== 'RH-01')
    .map((n) => (n.id === 'DIV-01' ? { ...n, prereq: ['CAL-01'] } : n))
ok(
    validarRutaDual(sinArenque).some((p) => p.mensaje.includes('arenque')),
    'sin arenque rojo el puzle se cae: le falta camuflaje en el entorno',
)
const sinEpigrafia = grafo
    .filter((n) => n.id !== 'EPI-01')
    .map((n) => (n.id === 'CAL-01' ? { ...n, prereq: ['ANC-01'] } : n))
ok(
    validarRutaDual(sinEpigrafia).some((p) => p.mensaje.includes('epigrafía')),
    'sin epigrafia latina no hay nada que leer',
)

// Condicion 2: filtro anti-fantasia.
const sinFormulacion = grafo.map((n) =>
    n.id === 'PHIL-01' ? { ...n, campos: { ...n.campos, formulable_como: '' } } : n,
)
ok(
    validarAntiFantasia(sinFormulacion).length === 1,
    'un nucleo que no declara como se formula no pasa el filtro anti-fantasia',
)
const conMagia = grafo.map((n) =>
    n.id === 'PHIL-01' ? { ...n, campos: { ...n.campos, formulable_como: 'sobrenatural' } } : n,
)
ok(validarAntiFantasia(conMagia).length === 1, 'una revelacion sobrenatural no pasa el filtro')

// Condicion 3: comprobacion de epigrafia real.
const sinAbreviaturas = grafo.map((n) =>
    n.id === 'EPI-01' ? { ...n, campos: { ...n.campos, abbreviations_detected: [] } } : n,
)
ok(
    validarEpigrafia(sinAbreviaturas).length === 1,
    'sin abreviaturas por suspension o contraccion no hay epigrafia medieval',
)

// El ancla es la herejia, no la piedra: se disena desde el final.
ok(
    findAncla(grafo).id === 'PHIL-01' && findAncla(grafo).tipo === 'philosophical',
    'el ancla del GN-IEC es el nucleo filosofico: el diseno empieza por la herejia',
)

// Decisiones tomadas por el agente al delegarlas el disenador, fijadas aqui
// para que se puedan revisar y revertir a proposito.
ok(
    grafo.find((n) => n.id === 'PHIL-01').prereq.length === 2 &&
        grafo.find((n) => n.id === 'PHIL-01').prereq.includes('CAL-01'),
    'el nucleo filosofico tiene las DOS entradas del §2.6: divergencia y calambur',
)
ok(
    grafo.filter((n) => n.tipo === 'anchor').length === 1,
    'un grafo = un anclaje: cada investigacion tiene su propio final por el que empezar',
)

console.log('\n13. El material: las opciones que ya existen en la catedral')
ok(Object.keys(PILARES).length === 4, `los cuatro pilares del §1 (${Object.keys(PILARES).length})`)
ok(
    Object.values(PILARES).every((p) => typeof p.pregunta === 'string' && p.pregunta.length > 20),
    'cada pilar trae su pregunta de mapeo: la herramienta pregunta, el disenador situa',
)
ok(materialValencia.length >= 4, `el material de ejemplo trae opciones (${materialValencia.length})`)
ok(
    materialValencia.every((o) => o.estado === 'por_verificar'),
    'ninguna entra como documentada: el ejemplo del §4 aun no tiene fuente',
)

// La regla del Grial aplicada al material: documentado sin fuente no es documentado.
const sinFuente = normalizarOpcion(
    { titulo: 'X', detalle: 'Y', estado: 'documentado' },
    'valencia',
)
ok(
    sinFuente.estado === 'por_verificar' && sinFuente.degradado,
    'una opcion que se declara documentada sin fuente se degrada a por verificar',
)
const conFuente = normalizarOpcion(
    {
        titulo: 'X',
        detalle: 'Y',
        estado: 'documentado',
        fuente: 'Archivo catedralicio, legajo 12',
    },
    'valencia',
)
ok(
    conFuente.estado === 'por_verificar',
    'y con fuente tampoco: por el camino de la IA no se sale documentado nunca',
)
ok(
    conFuente.fuente === 'Archivo catedralicio, legajo 12',
    'aunque la fuente se conserva como pista para verificar',
)
ok(
    documentar(conFuente, conFuente.fuente).opcion.estado === 'documentado',
    'y con la mano del disenador encima, si: ahi esta la frontera',
)

// La investigacion previa: el motor trae candidatos, pero no puede inventar recibos.
const investigacion = parseInvestigacion(
    {
        opciones: [
            {
                titulo: 'Laja de la girola',
                detalle: 'Con bordura inscrita',
                clase: 'anclaje',
                pilar: 'anclaje_visible',
                estado: 'por_verificar',
            },
            {
                titulo: 'Con fuente falsa',
                detalle: 'Se declara documentada y no cita nada',
                clase: 'dato_curioso',
                pilar: 'apocrifo',
                estado: 'documentado',
                fuente: '',
            },
            { titulo: 'Sin detalle', detalle: '' },
        ],
    },
    'valencia',
)
ok(investigacion.total === 3, `el motor propuso 3 (${investigacion.total})`)
ok(
    investigacion.opciones.length === 2,
    `sobreviven las que traen titulo y detalle (${investigacion.opciones.length})`,
)
ok(investigacion.degradadas === 1, 'cuenta la que venia como documentada sin fuente')
ok(investigacion.descartadas.length === 1, 'reporta la que venia vacia')

let falloClaveInvestigacion = ''
try {
    await investigarCatedral({ settings: { llm: {} }, catedral: { id: 'x', nombre: 'X' } })
} catch (e) {
    falloClaveInvestigacion = e.message
}
ok(
    falloClaveInvestigacion.includes('clave'),
    'sin clave la investigacion lo dice en vez de fingir que investiga',
)

const anclajes = anclajesDe(materialValencia)
ok(anclajes.length === 1, `el material de ejemplo trae un anclaje (${anclajes.length})`)
ok(
    !tieneGrafo('ANC-01'),
    'un anclaje NO tiene grafo por llamarse ANC-01: eso era el grafo de ejemplo colandose',
)
ok(
    anclajesConGrafo().length === 0,
    'y el mapa de grafos esta VACIO: ninguno es del motor todavia',
)
const resumenMat = resumenMaterial(materialValencia)
ok(
    resumenMat.total === materialValencia.length && resumenMat.documentadas === 0,
    `el resumen no da ninguna por documentada (${JSON.stringify(resumenMat)})`,
)

console.log('\n14. La verificacion a mano: la IA propone, el disenador confirma')
const candidata = materialValencia[0]

// Sin fuente no hay documentado. La regla es una puerta, no un aviso.
const sinRecibo = documentar(candidata, '   ')
ok(!sinRecibo.ok, 'documentar sin fuente se rechaza')
ok(
    sinRecibo.opcion.estado === 'por_verificar',
    'y la opcion se queda como estaba: no se degrada a medias',
)
ok(sinRecibo.motivo.includes('de dónde sale'), 'y se explica por que')

const conRecibo = documentar(candidata, 'Libro de fábrica de la catedral, fol. 42')
ok(conRecibo.ok && conRecibo.opcion.estado === 'documentado', 'con fuente si se documenta')
ok(
    conRecibo.opcion.fuente === 'Libro de fábrica de la catedral, fol. 42',
    'y la fuente queda guardada en la opcion',
)

// Descartar no borra: marca. «No se tira nada.»
const descartada = descartar(conRecibo.opcion)
ok(descartada.descartado === true, 'descartar marca la opcion')
ok(descartada.fuente === conRecibo.opcion.fuente, 'y no pierde nada de lo que tenia')
ok(
    opcionesVivas([descartada, candidata]).length === 1,
    'las descartadas no se cuentan entre las vivas',
)
const resumenConDescarte = resumenMaterial([descartada, candidata])
ok(
    resumenConDescarte.total === 1 && resumenConDescarte.descartadas === 1,
    `el resumen separa vivas y descartadas (${JSON.stringify(resumenConDescarte)})`,
)
ok(recuperar(descartada).descartado === false, 'y se puede recuperar')
ok(
    anclajesDe([descartada]).length === 0,
    'un anclaje descartado no se ofrece para abrir su grafo',
)

console.log('\n15. Conectar una IA: Google AI Studio (API nativa) y Kimi K3')
const google = PRESETS.find((p) => p.id === 'google')
ok(Boolean(google), 'el preset de Google AI Studio existe')
ok(google.provider === 'google', 'va por la API NATIVA, no por la capa compatible con OpenAI')
ok(google.baseUrl === '', 'y no pide Base URL: no hay ninguna URL de OpenAI de por medio')
ok(google.model.startsWith('gemini'), `trae un modelo de Gemini (${google.model})`)
ok(
    !PRESETS.some((p) => /googleapis\.com/.test(p.baseUrl)),
    'ninguna URL de Google aparece disfrazada de Base URL',
)

const kimi = PRESETS.find((p) => p.id === 'moonshot')
ok(Boolean(kimi), 'Kimi K3 de Moonshot esta en la lista')
ok(kimi.baseUrl === 'https://api.moonshot.ai/v1', `con su endpoint real (${kimi.baseUrl})`)
ok(kimi.model === 'kimi-k3', `y el modelo kimi-k3 (${kimi.model})`)
ok(!PRESETS.some((p) => p.id === 'groq'), 'Groq ya no esta: lo sustituye Moonshot')
ok(
    PRESETS.every((p) => p.provider),
    'todos los presets declaran su proveedor',
)
ok(soportaJsonMode(kimi.baseUrl), 'a Moonshot si se le manda el modo JSON')

let falloGoogle = ''
try {
    await probarMotor({ llm: { provider: 'google' } })
} catch (e) {
    falloGoogle = e.message
}
ok(falloGoogle.includes('API key'), 'probar Google sin clave lo dice')

// Google cambio el formato de las claves: las nuevas empiezan por AQ… y las
// clasicas por AIza…. NO se valida el prefijo — solo se informa del formato —
// para que nadie reciba un error por el aspecto de su clave.
ok(formatoDeClave('AIzaSyABC123').id === 'clasica', 'reconoce el formato clasico (AIza…)')
ok(formatoDeClave('AQ.Ab8QXYZ').id === 'nueva', 'y el formato nuevo (AQ.Ab…)')
ok(formatoDeClave('AQxyz').id === 'nueva', 'y el que solo empieza por AQ')
ok(formatoDeClave('lo-que-sea').id === 'otra', 'y admite no reconocer el formato')
ok(formatoDeClave('').id === 'vacia', 'y distingue la clave vacia')
ok(
    formatoDeClave('lo-que-sea').label.includes('no reconocido'),
    'sin rechazarla: reconocer no es validar',
)

console.log('\n16. El catalogo lo dice GOOGLE, no una lista escrita a mano')
const catalogoGoogle = leerCatalogo({
    models: [
        {
            name: 'models/gemini-3.8-flash',
            description: 'El mas capaz',
            supportedGenerationMethods: ['generateContent', 'countTokens'],
        },
        {
            name: 'models/text-embedding-004',
            description: 'Embeddings',
            supportedGenerationMethods: ['embedContent'],
        },
        {
            name: 'models/gemini-2.5-pro',
            description: 'Razonamiento',
            supportedGenerationMethods: ['generateContent'],
        },
    ],
})
ok(catalogoGoogle.length === 3, `lee los modelos que devuelve Google (${catalogoGoogle.length})`)
ok(
    catalogoGoogle.every((m) => !m.id.startsWith('models/')),
    'y les quita el prefijo «models/» que pone Google',
)
ok(catalogoGoogle.filter((m) => m.chat).length === 2, 'solo dos sirven para conversar')
ok(
    !catalogoGoogle.find((m) => m.id === 'text-embedding-004').chat,
    'el de embeddings queda marcado: no conversa',
)
ok(
    catalogoGoogle[0].chat,
    'los de conversacion van primero, para elegirlos sin pensar',
)

// El listado de Google trae modelos que no son de texto. Si se cuelan, la
// herramienta sugiere uno que no sirve y el barrido de cuota gasta intentos.
ok(!sirveParaTexto('gemini-3.1-flash-image'), 'un modelo de imagen no sirve para conversar')
ok(!sirveParaTexto('gemini-3.8-flash-lite-tts'), 'ni uno de voz')
ok(!sirveParaTexto('text-embedding-004'), 'ni el de embeddings')
ok(!sirveParaTexto('gemini-2.5-flash-native-audio'), 'ni el de audio en vivo')
ok(sirveParaTexto('gemini-3.8-flash'), 'y el de texto si')
ok(sirveParaTexto('gemma-4-31b-it'), 'y Gemma tambien')
const catalogoMixto = leerCatalogo({
    models: [
        { name: 'models/gemini-3.1-flash-image', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] },
    ],
})
ok(
    catalogoMixto.filter((m) => m.chat).length === 1,
    'y el catalogo deja fuera al de imagen aunque acepte generateContent',
)

ok(normalizarModeloId('models/gemini-3.8-flash') === 'gemini-3.8-flash', 'acepta el nombre con prefijo')
ok(normalizarModeloId('gemini-3.8-flash') === 'gemini-3.8-flash', 'y sin prefijo')

// Gemini 3 RETIRO `temperature` y estreno `thinkingLevel`.
ok(soportaThinkingLevel('gemini-3.8-flash'), 'Gemini 3 entiende thinkingLevel')
ok(soportaThinkingLevel('models/gemini-3.5-flash-lite'), 'y tambien con prefijo')
ok(!soportaThinkingLevel('gemini-2.5-pro'), 'Gemini 2.5 NO: mandarselo podria dar error')
ok(!soportaThinkingLevel('gemma-4-31b-it'), 'y Gemma tampoco')

ok(
    !PRESETS.some((p) => /gemini-2\.5/.test(p.model)),
    'el preset ya no apunta al 2.5, que no se ofrece a cuentas nuevas',
)
ok(google.model === 'gemini-3.8-flash', `apunta al que Google recomienda hoy (${google.model})`)
ok(
    !('modelInvestigacion' in DEFAULT_LLM) && !PRESETS.some((p) => 'modelInvestigacion' in p),
    'NO hay «modelo de investigacion»: es el mismo modelo con mas razonamiento, como dijo el disenador',
)

// Y la herramienta elige el modelo SOLA, entre los que la clave puede usar.
const catalogoOrden = leerCatalogo({
    models: [
        { name: 'models/gemini-3.1-pro-preview', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-3.5-flash-lite', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] },
        { name: 'models/text-embedding-004', supportedGenerationMethods: ['embedContent'] },
    ],
})
const orden = candidatosDe(catalogoOrden)
ok(orden[0] === 'gemini-3.8-flash', `se conecta sola con el flash, no con una vista previa (${orden[0]})`)
ok(!orden.includes('text-embedding-004'), 'y nunca con uno que no conversa')
ok(
    candidatosDe(catalogoOrden, 'gemini-3.1-pro-preview')[0] === 'gemini-3.1-pro-preview',
    'pero si el disenador ya tenia uno escrito, ese manda',
)
ok(candidatosDe([], '').length === 0, 'sin catalogo no inventa candidatos: lo dira Google')
ok(
    NIVEL_RAZONAMIENTO.investigacion === 'medium',
    'la investigacion usa `medium`, que es el valor POR DEFECTO de Gemini 3.8 (el `high` lo invente yo)',
)
ok(
    NIVEL_RAZONAMIENTO.general === 'low',
    'y el trabajo corriente, bajo: es lo que se paga',
)
ok(modeloGemini('gemini-3.8-flash').recomendado, 'el 3.8-flash viene marcado como recomendado')
ok(!modeloGemini('no-existe'), 'y un modelo de fuera devuelve nada, sin romper')
ok(
    CATALOGO_GEMINI.every((m) => typeof m.chat === 'boolean' && m.para),
    'el respaldo tambien dice para que sirve cada uno',
)

console.log('\n17. La peticion: la puerta que Google recomienda (Interactions API)')
const fetchReal = globalThis.fetch
let peticion = null
globalThis.fetch = async (url, opciones = {}) => {
    peticion = {
        url: String(url),
        opciones,
        cuerpo: opciones.body ? JSON.parse(opciones.body) : null,
    }
    return new Response(
        JSON.stringify({
            id: 'v1_x',
            model: 'gemini-3.8-flash',
            object: 'interaction',
            status: 'completed',
            steps: [{ type: 'model_output', content: [{ type: 'text', text: 'ok' }] }],
            usage: { total_tokens: 10 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
}

const llamada = await llamarInteraccion({
    apiKey: 'AQ.falsa',
    model: 'gemini-3.8-flash',
    messages: [{ role: 'user', content: 'hola' }],
    thinkingLevel: 'high',
})
ok(llamada.content === 'ok', 'la llamada devuelve el texto del paso model_output')
ok(
    peticion.url === 'https://generativelanguage.googleapis.com/v1beta/interactions',
    'va a la Interactions API, la que Google recomienda',
)
ok(
    peticion.opciones.headers['x-goog-api-key'] === 'AQ.falsa',
    'la clave va en la cabecera, sin validar su prefijo',
)
ok(peticion.cuerpo.model === 'gemini-3.8-flash', 'el modelo va sin el prefijo «models/»')
ok(
    !('temperature' in (peticion.cuerpo.generation_config || {})),
    'NO se manda temperature: Gemini 3 lo retiro',
)
ok(
    peticion.cuerpo.generation_config.thinking_level === 'high',
    'y se manda thinking_level, que es su sustituto',
)
ok(
    peticion.cuerpo.store === false,
    'store:false: el material del disenador no se guarda en Google',
)

await llamarInteraccion({
    apiKey: 'x',
    model: 'models/gemini-3.8-flash',
    messages: [{ role: 'user', content: 'hola' }],
})
ok(peticion.cuerpo.model === 'gemini-3.8-flash', 'acepta el nombre con prefijo sin duplicarlo')

await llamarInteraccion({
    apiKey: 'x',
    model: 'gemini-3.8-flash',
    messages: [{ role: 'user', content: 'x' }],
    buscar: true,
})
ok(
    peticion.cuerpo.tools?.[0]?.type === 'google_search',
    'la busqueda es una HERRAMIENTA: [{ type: google_search }], como en el codigo del disenador',
)

await llamarInteraccion({
    apiKey: 'x',
    model: 'gemini-3.8-flash',
    messages: [
        { role: 'system', content: 'SOS' },
        { role: 'user', content: 'x' },
    ],
    jsonMode: true,
})
ok(peticion.cuerpo.system_instruction.includes('SOS'), 'la instruccion de sistema va aparte')
ok(peticion.cuerpo.system_instruction.includes('JSON'), 'y el modo JSON se refuerza ahi')

// Un 429 con status generico y SIN motivo explicito: aqui estaba el fallo.
globalThis.fetch = async () =>
    new Response(
        JSON.stringify({
            error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'exceeded your quota' },
        }),
        { status: 429 },
    )
let errorGenerico = null
try {
    await llamarInteraccion({
        apiKey: 'x',
        model: 'gemini-3.8-flash',
        messages: [{ role: 'user', content: 'x' }],
    })
} catch (e) {
    errorGenerico = e
}
ok(errorGenerico?.codigo === 429, 'el 429 viaja con su codigo')
ok(
    errorGenerico?.motivo === '',
    'y NO se inventa un motivo: RESOURCE_EXHAUSTED no es un motivo, es un status',
)
ok(errorGenerico?.statusGoogle === 'RESOURCE_EXHAUSTED', 'el status se guarda APARTE y con su nombre')
ok(
    errorGenerico.detalle.includes('exceeded your quota'),
    'y el cuerpo CRUDO de Google se conserva, para poder ensenarlo sin resumir',
)
// Formas raras: si el cuerpo no trae ni motivo ni status, hay que poder
// ENSENARLO. Resumirlo es de donde salen las conclusiones inventadas.
ok(
    leerErrorGoogle({ code: 429, message: 'algo' }).mensaje === 'algo',
    'y lee tambien un error PLANO, sin envoltorio «error»',
)
ok(
    leerErrorGoogle({ code: 429, message: 'algo' }).motivo === '',
    'sin inventarse un motivo cuando no lo hay',
)
ok(leerErrorGoogle(null).motivo === '' && leerErrorGoogle(null).status === '', 'y aguanta un cuerpo vacio')
ok(
    !errorGenerico.message.includes('[RESOURCE_EXHAUSTED]'),
    'y NO se ensena entre corchetes como si fuera un motivo de Google',
)
ok(
    errorGenerico.message.includes('status de Google'),
    'sino etiquetado como lo que es: un status de Google',
)

// Y si Google SI da un motivo explicito, se usa ese.
globalThis.fetch = async () =>
    new Response(
        JSON.stringify({
            error: {
                code: 429,
                status: 'RESOURCE_EXHAUSTED',
                details: [{ reason: 'RATE_LIMIT_EXCEEDED' }],
            },
        }),
        { status: 429 },
    )
let errorExplicito = null
try {
    await llamarInteraccion({
        apiKey: 'x',
        model: 'gemini-3.8-flash',
        messages: [{ role: 'user', content: 'x' }],
    })
} catch (e) {
    errorExplicito = e
}
ok(errorExplicito?.motivo === 'RATE_LIMIT_EXCEEDED', 'si Google da un motivo explicito, se usa ese')
ok(
    errorExplicito.message.includes('[RATE_LIMIT_EXCEEDED]'),
    'y entonces SI va entre corchetes, porque es suyo',
)
globalThis.fetch = fetchReal
console.log('\n18. Lo que dice Google de un error: SIN RECORTAR y con su motivo')
// Esto existe por un error mio: yo recortaba la respuesta a 300 caracteres, y el
// campo `details[].reason` —que es EL QUE DICE cual de las dos cuotas es— venia
// despues del corte. Tiraba la evidencia y rellenaba el hueco con una conclusion
// mia. Estas pruebas impiden que vuelva a pasar.
const cuerpo429 = {
    error: {
        code: 429,
        // Un mensaje LARGO a proposito: asi el motivo queda mas alla del corte
        // de 300 caracteres que causaba el fallo, y la prueba lo demuestra.
        message:
            'You exceeded your current quota, please check your plan and billing details. ' +
            'For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. ' +
            'To monitor your current usage, head to: https://ai.dev/rate-limit. ' +
            'Quota is measured across requests per minute, requests per day and tokens per minute, ' +
            'and each model has its own limits, so a model can be unavailable while another one works.',
        status: 'RESOURCE_EXHAUSTED',
        details: [
            { '@type': 'type.googleapis.com/google.rpc.QuotaFailure', reason: 'RATE_LIMIT_EXCEEDED' },
        ],
    },
}
ok(
    JSON.stringify(cuerpo429).length > 400,
    'el caso de prueba es mas largo que el corte que causaba el fallo',
)
const leido429 = leerErrorGoogle(cuerpo429)
ok(leido429.motivo === 'RATE_LIMIT_EXCEEDED', `lee el motivo del campo details (${leido429.motivo})`)
ok(leido429.tipo === 'ritmo', 'y distingue un limite de RITMO de uno de plan')
ok(
    leerErrorGoogle({
        error: { code: 429, status: 'RESOURCE_EXHAUSTED', details: [{ reason: 'QUOTA_EXCEEDED' }] },
    }).tipo === 'cuota',
    'y una cuota de PLAN de un limite de ritmo',
)
ok(
    leerErrorGoogle({ error: { code: 429 } }).tipo === 'desconocido',
    'y si Google no lo dice, lo dice: desconocido, en vez de suponer',
)

let errorSinRecortar = null
globalThis.fetch = async () =>
    new Response(JSON.stringify(cuerpo429), { status: 429 })
try {
    await llamarInteraccion({
        apiKey: 'x',
        model: 'gemini-3.8-flash',
        messages: [{ role: 'user', content: 'x' }],
    })
} catch (e) {
    errorSinRecortar = e
}
ok(errorSinRecortar.motivo === 'RATE_LIMIT_EXCEEDED', 'el motivo llega al error que ve la herramienta')
ok(errorSinRecortar.tipoLimite === 'ritmo', 'y con su tipo')
ok(
    errorSinRecortar.message.includes('RATE_LIMIT_EXCEEDED'),
    `y va DELANTE en el mensaje, que es lo que decide qué hacer (${errorSinRecortar.message.slice(0, 70)}…)`,
)
ok(
    errorSinRecortar.detalle.length > 300,
    `y el cuerpo entero de Google se conserva, sin recortar (${errorSinRecortar.detalle.length} caracteres)`,
)
ok(
    errorSinRecortar.detalle.includes('QuotaFailure'),
    'incluido lo que venia DESPUES del corte de 300: ahi estaba la respuesta',
)
globalThis.fetch = fetchReal

console.log('\n17b. El camino del agente: crear, esperar y leer')
// Es la ruta PRINCIPAL de la investigacion, y sin probar: si el sondeo esta mal,
// la investigacion se queda colgada para siempre.
const fetchAgente = globalThis.fetch
let sondeos = 0
globalThis.fetch = async (url, opciones = {}) => {
    if (opciones.method === 'POST') {
        const cuerpo = JSON.parse(opciones.body || '{}')
        ok(cuerpo.agent === 'antigravity-preview-09-2026', 'se crea con el agente del codigo del disenador')
        ok(cuerpo.background === true, 'en segundo plano, como en su codigo')
        ok(
            (cuerpo.tools || []).some((t) => t.type === 'google_search'),
            'con la busqueda de Google entre las herramientas',
        )
        ok(
            (cuerpo.tools || []).length === 3 &&
                ['code_execution', 'url_context'].every((t) => cuerpo.tools.some((x) => x.type === t)),
            'y con LAS TRES del codigo del disenador, no solo una',
        )
        ok(
            cuerpo.environment?.type === 'remote',
            'y con el entorno remoto, que el agente necesita para sus operaciones',
        )
        ok(
            !('store' in cuerpo),
            'y SIN store:false: no guardar es INCOMPATIBLE con la ejecucion en segundo plano',
        )
        return new Response(JSON.stringify({ id: 'v1_ag', status: 'in_progress' }), { status: 200 })
    }
    sondeos += 1
    if (sondeos < 2) {
        return new Response(JSON.stringify({ id: 'v1_ag', status: 'in_progress' }), { status: 200 })
    }
    return new Response(
        JSON.stringify({
            id: 'v1_ag',
            status: 'completed',
            steps: [
                {
                    type: 'model_output',
                    content: [
                        {
                            type: 'text',
                            text: 'listo',
                            annotations: [{ type: 'url_citation', url: 'https://ejemplo.org/a', title: 'A' }],
                        },
                    ],
                },
            ],
        }),
        { status: 200 },
    )
}
const agente = await llamarAgente({
    apiKey: 'x',
    agente: 'antigravity-preview-09-2026',
    input: 'hola',
    cadaSegundos: 0,
})
ok(agente.content === 'listo', 'devuelve el texto cuando el agente termina')
ok(agente.fuentes.length === 1, 'y las fuentes que consulto')
ok(agente.esperas === 2, `habiendo esperado lo necesario (${agente.esperas} sondeos)`)
globalThis.fetch = fetchAgente

console.log('\n18b. Si se queda sin presupuesto de tokens, se dice POR QUE')
// Con razonamiento alto los tokens de pensamiento cuentan como salida: quedarse
// corto deja la respuesta a medias y sin JSON que leer. Antes salia un «respondio
// vacio» que no explicaba nada.
const fetchCorto = globalThis.fetch
globalThis.fetch = async () =>
    new Response(JSON.stringify({ status: 'incomplete', steps: [] }), { status: 200 })
let errorCorto = null
try {
    await llamarInteraccion({
        apiKey: 'x',
        model: 'gemini-3.8-flash',
        messages: [{ role: 'user', content: 'x' }],
        maxTokens: 512,
    })
} catch (e) {
    errorCorto = e
}
ok(errorCorto !== null, 'una interaccion incompleta y vacia da error')
ok(
    errorCorto.message.includes('presupuesto de tokens'),
    `y explica que fue el presupuesto, no una respuesta vacia (${errorCorto.message.slice(0, 50)}…)`,
)
ok(errorCorto.message.includes('512'), 'diciendo cual era el limite')
globalThis.fetch = fetchCorto

console.log('\n19. La busqueda: las fuentes que ha LEIDO, en la Interactions API')
const respuestaInteraccion = {
    id: 'v1_x',
    model: 'gemini-3.8-flash',
    object: 'interaction',
    status: 'completed',
    steps: [
        {
            type: 'google_search_call',
            arguments: { queries: ['catedral de valencia laja girola'] },
        },
        {
            type: 'model_output',
            content: [
                {
                    type: 'text',
                    text: '{"opciones":[]}',
                    annotations: [
                        {
                            type: 'url_citation',
                            url: 'https://www.catedraldevalencia.es/historia',
                            title: 'Historia · Catedral de Valencia',
                        },
                        {
                            type: 'url_citation',
                            url: 'https://es.wikipedia.org/wiki/Catedral_de_Valencia',
                            title: 'Catedral de Valencia - Wikipedia',
                        },
                    ],
                },
            ],
        },
    ],
}
const leido = leerInteraccion(respuestaInteraccion)
ok(leido.content === '{"opciones":[]}', 'saca el texto del paso model_output')
ok(leido.status === 'completed', 'y el estado de la interacción')
ok(leido.fuentes.length === 2, `y las fuentes de las anotaciones url_citation (${leido.fuentes.length})`)
ok(
    leido.fuentes[0].uri === 'https://www.catedraldevalencia.es/historia',
    'con su URL y su título, que es lo que permite comprobarlas',
)
ok(leido.consultas[0].includes('valencia'), 'y las búsquedas del paso google_search_call')
ok(
    fuenteEstaConsultada('https://www.catedraldevalencia.es/historia', leido.fuentes),
    'una URL consultada vale como fuente',
)
ok(
    fuenteEstaConsultada('segun la web oficial catedraldevalencia.es', leido.fuentes),
    'y citar el dominio tambien',
)
ok(
    !fuenteEstaConsultada('segun un libro que nadie ha visto', leido.fuentes),
    'una fuente que NO consulto, no vale',
)

const investigacionConFuentes = parseInvestigacion(
    {
        opciones: [
            {
                titulo: 'Laja',
                detalle: 'Con bordura inscrita',
                clase: 'anclaje',
                pilar: 'anclaje_visible',
                estado: 'documentado',
                fuente: 'https://www.catedraldevalencia.es/historia',
            },
            {
                titulo: 'Inventada',
                detalle: 'Cita un libro fantasma',
                clase: 'dato_curioso',
                pilar: 'apocrifo',
                estado: 'documentado',
                fuente: 'segun un libro que nadie ha visto',
            },
        ],
    },
    'valencia',
    { fuentes: leido.fuentes },
)
ok(investigacionConFuentes.opciones.length === 2, 'las dos traen titulo y detalle')
// La IA propone; el disenador confirma. NADA de lo que sale de una investigacion
// entra como documentado, ni siquiera con la fuente bien citada.
ok(
    investigacionConFuentes.opciones[0].estado === 'por_verificar',
    'lo que propone la IA nunca entra como documentado: lo confirma el disenador',
)
ok(
    investigacionConFuentes.opciones[0].fuenteConsultada,
    'pero si la fuente es una de las que consultó, se marca: verificar es un vistazo',
)
ok(
    investigacionConFuentes.opciones[1].fuenteSospechosa,
    'la que cita una fuente NO consultada se marca como sospechosa',
)
ok(
    investigacionConFuentes.opciones[1].motivoDegradado.includes('no está entre'),
    `con el motivo a la vista (${investigacionConFuentes.opciones[1].motivoDegradado})`,
)
ok(investigacionConFuentes.degradadas === 2, 'y las dos se cuentan como propuestas a confirmar')

// Sin busqueda no hay nada contra lo que comprobar una cita: el modelo recuerda.
const sinFuentes = parseInvestigacion(
    {
        opciones: [
            {
                titulo: 'De memoria',
                detalle: 'Con una cita que nadie puede comprobar',
                estado: 'documentado',
                fuente: 'segun un libro que no he consultado',
            },
        ],
    },
    'valencia',
)
ok(sinFuentes.opciones.length === 1, 'la opcion llega')
ok(
    sinFuentes.opciones[0].estado === 'por_verificar',
    'y una cita de memoria NO vale como fuente',
)
ok(
    sinFuentes.opciones[0].fuenteSospechosa,
    'se marca sospechosa, para no perder el tiempo verificandola',
)
ok(
    sinFuentes.opciones[0].motivoDegradado.includes('sin búsqueda'),
    'y se explica por que',
)

console.log('\n20. Si la cuota de la BUSQUEDA se agota, la investigacion sigue')
// La busqueda tiene su propia cuota, aparte de la del modelo: se puede agotar
// mientras el modelo responde. Y el modo elegido —«la IA propone, yo verifico»—
// no necesita busqueda, asi que no puede quedar bloqueado por ella.
const fetchAntes = globalThis.fetch
globalThis.fetch = async (url, opciones = {}) => {
    const cuerpo = JSON.parse(opciones.body || '{}')
    if (cuerpo.tools) {
        return new Response(
            JSON.stringify({ error: { code: 429, message: 'You exceeded your current quota' } }),
            { status: 429 },
        )
    }
    return new Response(
        JSON.stringify({
            status: 'completed',
            steps: [
                {
                    type: 'model_output',
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                    resumen: 'Material de memoria',
                                    opciones: [
                                        {
                                            id: 'ANC-01',
                                            titulo: 'Laja de la girola',
                                            detalle: 'Con bordura inscrita',
                                            clase: 'anclaje',
                                            pilar: 'anclaje_visible',
                                            estado: 'por_verificar',
                                        },
                                        {
                                            id: 'DC-01',
                                            titulo: 'Fuente citada de memoria',
                                            detalle: 'Se declara documentada',
                                            clase: 'dato_curioso',
                                            pilar: 'apocrifo',
                                            estado: 'documentado',
                                            fuente: 'segun un libro que no he consultado',
                                        },
                                    ],
                                }),
                        },
                    ],
                },
            ],
        }),
        { status: 200 },
    )
}

const sinCuota = await investigarCatedral({
    settings: { llm: { provider: 'google', apiKey: 'x', model: 'gemini-3.8-flash' } },
    catedral: { id: 'valencia', nombre: 'Catedral de Valencia' },
})
ok(sinCuota.buscar === false, 'si la busqueda no tiene cuota, se investiga igual, sin ella')
ok(/ritmo|cuota/i.test(sinCuota.aviso), 'y se dice en voz alta')
ok(sinCuota.aviso.includes('MEMORIA'), 'explicando que viene de memoria, no de fuentes')
ok(sinCuota.fuentes.length === 0, 'sin fuentes, porque no hubo busqueda')
ok(sinCuota.opciones.length === 2, 'y el material llega igual: el modo elegido no necesita busqueda')
ok(
    sinCuota.opciones.every((o) => o.estado === 'por_verificar'),
    'y todo entra por verificar: la IA propone, el disenador confirma',
)
ok(
    sinCuota.opciones.every((o) => !o.fuenteConsultada),
    'y nada puede venir con la fuente ya avalada, porque no hubo busqueda',
)

// Con la busqueda apagada a proposito, ni se intenta.
globalThis.fetch = async (url, opciones = {}) => {
    const cuerpo = JSON.parse(opciones.body || '{}')
    ok(!cuerpo.tools, 'apagando la busqueda, no se manda la herramienta google_search')
    return new Response(
        JSON.stringify({
            status: 'completed',
            steps: [{ type: 'model_output', content: [{ type: 'text', text: '{"opciones":[]}' }] }],
        }),
        { status: 200 },
    )
}
const sinBuscar = await investigarCatedral({
    settings: {
        llm: { provider: 'google', apiKey: 'x', model: 'gemini-3.8-flash', buscarWeb: false },
    },
    catedral: { id: 'valencia', nombre: 'Catedral de Valencia' },
})
ok(sinBuscar.buscar === false && sinBuscar.aviso === '', 'y entonces no hay nada que avisar')
globalThis.fetch = fetchAntes

console.log('\n21. Conectar hace UNA peticion, no cinco')
// Aqui estaba la causa real del `too_many_requests`, y era mia: la conexion
// pedia el catalogo, probaba TRES modelos y luego hacia una comprobacion de
// diagnostico. Cinco peticiones en rafaga contra un limite de 5 por minuto.
const fetchFrugal = globalThis.fetch
let llamadas = []
globalThis.fetch = async (url, opciones = {}) => {
    llamadas.push(String(url))
    if (String(url).includes('/models?')) {
        return new Response(
            JSON.stringify({
                models: [
                    { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] },
                    { name: 'models/gemini-3.5-flash-lite', supportedGenerationMethods: ['generateContent'] },
                ],
            }),
            { status: 200 },
        )
    }
    // Limite de ritmo, con el MISMO cuerpo que devolvio Google de verdad:
    // el motivo viene en `code` y es TEXTO, no un numero ni un `status`.
    return new Response(
        JSON.stringify({
            error: {
                message:
                    'You exceeded your current quota, please check your plan and billing details.',
                code: 'too_many_requests',
            },
        }),
        { status: 429 },
    )
}

const conLimite = await probarMotor(
    { llm: { provider: 'google', apiKey: 'x', model: 'gemini-3.8-flash' } },
    {
        catalogoPrevio: [
            { id: 'gemini-3.8-flash', chat: true },
            { id: 'gemini-3.5-flash-lite', chat: true },
        ],
    },
)
const alModelo = llamadas.filter((u) => !u.includes('/models?'))
ok(alModelo.length === 1, `conectar hace UNA peticion al modelo, no tres (${alModelo.length})`)
ok(llamadas.length === 1, `y en total UNA, sin listado ni diagnostico extra (${llamadas.length})`)
ok(conLimite.cuota === true, 'y el limite se detecta')
ok(
    conLimite.diagnostico.motivo === 'too_many_requests',
    `lee el motivo del campo code, que es TEXTO (${conLimite.diagnostico.motivo})`,
)
ok(
    conLimite.diagnostico.tipoLimite === 'ritmo',
    'y lo clasifica como LÍMITE DE RITMO, no como cuota',
)
ok(
    conLimite.diagnostico.crudo.includes('too_many_requests'),
    'y el cuerpo crudo queda disponible para ensenarlo',
)
ok(conLimite.diagnostico.peticiones === 0, 'el diagnostico NO gasta ni una peticion mas')

// Sin cache del catalogo, se pide una vez: dos peticiones en total, no cinco.
llamadas = []
const sinCache = await probarMotor({ llm: { provider: 'google', apiKey: 'x', model: 'gemini-3.8-flash' } })
ok(sinCache.cuota === true, 'sin catalogo en cache, tambien se detecta el limite')
ok(llamadas.length === 2, `y gasta dos peticiones en total: catalogo + un intento (${llamadas.length})`)

// Un 503 (saturado) NO es culpa de la cuenta: ahi cambiar de modelo SI arregla.
llamadas = []
globalThis.fetch = async (url, opciones = {}) => {
    llamadas.push(String(url))
    if (String(url).includes('/models?')) {
        return new Response(
            JSON.stringify({
                models: [
                    { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] },
                    { name: 'models/gemini-3.5-flash-lite', supportedGenerationMethods: ['generateContent'] },
                ],
            }),
            { status: 200 },
        )
    }
    const cuerpo = JSON.parse(opciones.body || '{}')
    if (cuerpo.model === 'gemini-3.8-flash') {
        return new Response(
            JSON.stringify({
                error: {
                    message: 'gemini-3.8-flash is currently experiencing high demand',
                    code: 'service_unavailable',
                },
            }),
            { status: 503 },
        )
    }
    return new Response(
        JSON.stringify({
            status: 'completed',
            steps: [{ type: 'model_output', content: [{ type: 'text', text: 'ok' }] }],
        }),
        { status: 200 },
    )
}
const conSaturado = await probarMotor(
    { llm: { provider: 'google', apiKey: 'x', model: 'gemini-3.8-flash' } },
    {
        catalogoPrevio: [
            { id: 'gemini-3.8-flash', chat: true },
            { id: 'gemini-3.5-flash-lite', chat: true },
        ],
    },
)
ok(conSaturado.ok === true, 'si el modelo esta SATURADO, se prueba con otro y conecta')
ok(conSaturado.sustituto === true, 'y se marca como sustituto')
ok(conSaturado.model === 'gemini-3.5-flash-lite', `conecta con el siguiente modelo (${conSaturado.model})`)
ok(
    conSaturado.avisoConexion.includes('service_unavailable'),
    `y lo dice, con el motivo de Google (${conSaturado.avisoConexion})`,
)
ok(llamadas.filter((u) => !u.includes('/models?')).length === 2, 'y gasta solo dos intentos')
globalThis.fetch = fetchFrugal
console.log('\n22. Sin porteros: si el modelo no esta en la lista, SE INTENTA igual')
// Esto es lo que pidio el disenador: «solo permite que se conecte, no te pongas
// zancadillas tu mismo». Antes la herramienta pedia el catalogo y, si el modelo
// no estaba en la lista, NI LO INTENTABA. Quien decide es Google.
const fetchPortero = globalThis.fetch
globalThis.fetch = async (url) => {
    if (String(url).includes('/models?')) {
        return new Response(
            JSON.stringify({
                models: [
                    { name: 'models/otro-modelo-distinto', supportedGenerationMethods: ['generateContent'] },
                ],
            }),
            { status: 200 },
        )
    }
    return new Response(
        JSON.stringify({
            status: 'completed',
            steps: [{ type: 'model_output', content: [{ type: 'text', text: 'ok' }] }],
        }),
        { status: 200 },
    )
}
const sinPortero = await probarMotor(
    { llm: { provider: 'google', apiKey: 'x', model: 'gemini-3.8-flash' } },
    { catalogoPrevio: [{ id: 'otro-modelo-distinto', chat: true }] },
)
ok(
    sinPortero.ok === true,
    'aunque la lista NO incluya ese modelo, se llama igual: decide Google',
)
ok(sinPortero.model === 'gemini-3.8-flash', 'y con el modelo que escribio el disenador, tal cual')

// Y si Google dice que no existe, se cuenta lo que dijo Google, con la lista
// solo como AYUDA.
globalThis.fetch = async (url) => {
    if (String(url).includes('/models?')) {
        return new Response(
            JSON.stringify({
                models: [
                    { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] },
                ],
            }),
            { status: 200 },
        )
    }
    return new Response(
        JSON.stringify({ error: { code: 404, message: 'models/foo is not found' } }),
        { status: 404 },
    )
}
let error404 = null
try {
    await probarMotor({ llm: { provider: 'google', apiKey: 'x', model: 'foo' } })
} catch (e) {
    error404 = e
}
ok(error404.message.includes('404'), `un 404 se cuenta tal cual lo dijo Google (${error404.message.slice(0, 50)}…)`)
ok(
    error404.message.includes('gemini-3.8-flash'),
    'y la lista de modelos se anade solo como AYUDA, despues del error de Google',
)
globalThis.fetch = fetchPortero

console.log('\n23. El puente: del material al grafo')
// Hasta ahora el material y el lienzo no se hablaban, y por eso la herramienta no
// servia para disenar. Cada opcion del material ES un nodo del GN-IEC por su clase.
const V = 'valencia'
const op = (id, clase, pilar, extra) =>
    Object.assign(
        { id, catedralId: V, clase, pilar, titulo: 'T ' + id, detalle: 'D ' + id, estado: 'por_verificar', descartado: false },
        extra || {},
    )
const materialPrueba = [
    op('ANC-01', 'anclaje', 'anclaje_visible'),
    op('EPI-01', 'epigrafia', 'apocrifo'),
    op('LIN-01', 'linguistica', 'apocrifo'),
    op('RH-01', 'dato_curioso', 'dualidad_gremios'),
    op('FIL-01', 'dato_curioso', 'secreto_filosofico'),
]

ok(tipoDeOpcion(materialPrueba[0]) === 'anchor', 'un anclaje es un nodo ANCHOR')
ok(tipoDeOpcion(materialPrueba[1]) === 'epigraphy', 'una epigrafia es EPIGRAPHY')
ok(tipoDeOpcion(materialPrueba[2]) === 'calambur', 'un juego linguistico es CALAMBUR')
ok(tipoDeOpcion(materialPrueba[3]) === 'red_herring', 'un dato curioso es un ARENQUE ROJO')
ok(tipoDeOpcion(materialPrueba[4]) === 'philosophical', 'y el secreto sin magia es el NUCLEO')
ok(tipoDeOpcion({ clase: 'restriccion', pilar: 'apocrifo' }) === '', 'una restriccion no entra en el grafo')

ok(
    anclajesConMaterial(materialPrueba, V).join() === 'ANC-01',
    'el anclaje de la catedral puede abrir su grafo',
)
ok(anclajesConMaterial([...materialPrueba, op('ANC-99', 'anclaje', 'anclaje_visible', { descartado: true })], V).length === 1, 'y uno descartado no')

const grafoPuente = grafoDesdeMaterial(materialPrueba, 'ANC-01', V)
ok(grafoPuente.length === 5, `el grafo sale del material entero (${grafo.length} nodos)`)
ok(grafoPuente[0].tipo === 'anchor' && grafoPuente[0].prereq.length === 0, 'la piedra es la raiz y no depende de nada')
ok(
    grafoPuente.find((n) => n.id === 'EPI-01').prereq.join() === 'ANC-01',
    'la epigrafia se lee EN la piedra',
)
ok(
    grafoPuente.find((n) => n.id === 'LIN-01').prereq.join() === 'EPI-01',
    'el calambur necesita la epigrafia',
)
ok(
    grafoPuente.find((n) => n.id === 'RH-01').prereq.join() === 'ANC-01',
    'el arenque rojo cuelga de la piedra: es la explicacion que atrapa',
)
const final = grafoPuente.find((n) => n.ancla)
ok(final?.id === 'FIL-01', 'y el FINAL es el nucleo filosofico')
ok(
    tieneFinal(grafoPuente),
    'el grafo tiene final, que es la condicion para poder disenarlo hacia atras',
)
ok(
    final.prereq.includes('LIN-01') && final.prereq.includes('RH-01'),
    'el final se sostiene sobre el calambur Y sobre el arenque: ruta dual',
)

const ordenPuente = ordenDeDiseno(grafoPuente).map((n) => n.id)
ok(ordenPuente[0] === 'FIL-01', `se empieza por el FINAL, no por la piedra (${ordenPuente[0]})`)
ok(
    ordenPuente.filter((id) => id !== 'RH-01').pop() === 'ANC-01',
    'y la RUTA PRINCIPAL termina en la piedra: lo ultimo que se disena es lo que se ve',
)

// Sin nucleo filosofico no hay final, y por tanto no hay nada que disenar.
const sinFinal = grafoDesdeMaterial(materialPrueba.filter((o) => o.id !== 'FIL-01'), 'ANC-01', V)
ok(sinFinal.length === 4, 'sin secreto filosofico el grafo se queda sin final')
ok(!tieneFinal(sinFinal), 'y se dice: sin final no hay grafo que disenar')
ok(grafoDesdeMaterial(materialPrueba, 'NO-EXISTE', V).length === 0, 'un anclaje inventado no da grafo')

console.log(`\n${fallos === 0 ? 'TODO EN VERDE' : `${fallos} PRUEBA(S) FALLIDA(S)`}\n`)
process.exit(fallos === 0 ? 0 : 1)

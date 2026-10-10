import { indexById } from '../data/catalog.js'

export const NODE_W = 236
export const NODE_H = 96

/** Aristas del grafo: solo entre nodos ya visibles, deduplicadas. */
export function aristasEntre(ids, edges) {
    const set = new Set(ids)
    const vistas = new Set()
    const out = []
    for (const edge of edges) {
        if (!set.has(edge.from) || !set.has(edge.to)) continue
        if (vistas.has(edge.id)) continue
        vistas.add(edge.id)
        out.push(edge)
    }
    return out
}

/** Lecciones relacionadas con `lesson` que aun no estan en el grafo. */
export function obtenerNuevas(lesson, visibles, index) {
    const candidatos = []
    for (const pre of lesson.prereq) {
        const l = index.get(pre)
        if (l && !visibles.has(l.id)) candidatos.push({ lesson: l, kind: 'prereq' })
    }
    for (const next of lesson.unlocks) {
        const l = index.get(next)
        if (l && !visibles.has(l.id)) candidatos.push({ lesson: l, kind: 'sugerido' })
    }
    return candidatos
}

/** Cuantos nodos quedan por revelar alrededor de una leccion. */
export function pendientesDe(lessonId, visibles, index) {
    const lesson = index.get(lessonId)
    if (!lesson) return 0
    return obtenerNuevas(lesson, visibles, index).length
}

/**
 * DESPLIEGUE PROGRESIVO (diseño inverso).
 *
 * Cada clic en "ver continuación" revela un lote de nodos alrededor de la
 * pieza activa. El lote depende del estado del grafo:
 *
 *  - Si la base del nodo aun no se mostro, entra primero lo que hay que
 *    resolver ANTES (sus prerrequisitos). Esta es la rama que hace el diseño
 *    inverso: se empieza por el final y se camina hacia atrás.
 *  - Si ya se mostro la base, avanza hacia el siguiente paso del gameflow
 *    planeado y además una pieza conectada del catálogo.
 *  - Si el gameflow ya terminó o el siguiente paso estaba visible, revela lo
 *    que sigue después del último nodo visible.
 *
 * Devuelve los nodos y aristas que deben agregarse, mas un motivo legible.
 */
export function desplegar({
    lessonId,
    visibles,
    contadores = {},
    ruta = [],
    edges = [],
    index,
}) {
    const lesson = index.get(lessonId)
    if (!lesson) return { ids: [], edges: [], contadores, pendientes: 0, motivo: '' }

    const vistas = new Set(visibles)
    const agregar = new Map()
    const nuevasAristas = []
    let motivo = ''

    const yaMostroBase = (contadores[lessonId] || 0) > 0
    const basePendiente = obtenerNuevas(lesson, vistas, index).filter((c) => c.kind === 'prereq')

    if (!yaMostroBase && basePendiente.length) {
        // Paso 1: lo que hay que resolver antes de este nodo.
        for (const c of basePendiente) agregar.set(c.lesson.id, c)
        motivo = 'se reveló lo que hace falta antes de este nodo'
    } else {
        // Paso 2: la continuacion. Primero el siguiente paso de la ruta planeada,
        // pero solo si de verdad es vecino declarado de este nodo: si no, se
        // dibujaria una conexion que el disenador nunca declaro.
        const posicion = ruta.indexOf(lessonId)
        const siguienteId = posicion >= 0 ? ruta[posicion + 1] : null
        const siguiente = siguienteId ? index.get(siguienteId) : null
        const vecinos = new Set([...lesson.prereq, ...lesson.unlocks])

        if (siguiente && vecinos.has(siguiente.id) && !vistas.has(siguiente.id)) {
            agregar.set(siguiente.id, { lesson: siguiente, kind: 'ruta' })
            motivo = 'se reveló la pieza siguiente del gameflow'
        }

        // Ademas, una continuacion natural declarada por el catalogo.
        const continuacion = obtenerNuevas(lesson, vistas, index).find((c) => c.kind === 'sugerido')
        if (continuacion && !agregar.has(continuacion.lesson.id)) {
            agregar.set(continuacion.lesson.id, continuacion)
            motivo = motivo ? `${motivo} y una pieza conectada` : 'se reveló una pieza conectada'
        }

        // Si la ruta ya termino o el siguiente paso estaba visible, se revela
        // lo que sigue despues del ultimo nodo visible de la ruta.
        if (!agregar.size) {
            const ultimoVisible = [...ruta].reverse().find((id) => vistas.has(id))
            const nodo = ultimoVisible ? index.get(ultimoVisible) : null
            if (nodo) {
                const mas = obtenerNuevas(nodo, vistas, index).filter((c) => c.kind === 'sugerido')
                for (const c of mas.slice(0, 2)) agregar.set(c.lesson.id, c)
                if (agregar.size) motivo = 'el gameflow llegó al final: se abre la pieza conectada'
            }
        }
    }

    for (const [id, c] of agregar) {
        nuevasAristas.push(
            c.kind === 'prereq'
                ? { id: `${id}->${lessonId}:prereq`, from: id, to: lessonId, kind: 'prereq' }
                : { id: `${lessonId}->${id}:${c.kind}`, from: lessonId, to: id, kind: c.kind },
        )
    }

    const contadoresNuevos = { ...contadores, [lessonId]: (contadores[lessonId] || 0) + 1 }

    return {
        ids: [...agregar.keys()],
        edges: nuevasAristas,
        contadores: contadoresNuevos,
        pendientes: pendientesDe(lessonId, new Set([...vistas, ...agregar.keys()]), index),
        motivo,
    }
}

/**
 * Estado inicial del lienzo.
 *
 * En diseño inverso el lienzo abre SOLO con el final (`conBase: false`): el
 * ancla aparece sola y el jugador de diseño decide qué revelar hacia atrás.
 * Con `conBase: true` se recupera el comportamiento anterior, que además
 * mostraba de golpe los prerrequisitos del primer nodo.
 */
export function inicializarGrafo(steps, index, { conBase = false } = {}) {
    const ruta = steps.map((s) => s.lessonId).filter((id) => index.has(id))
    if (!ruta.length) {
        return { visibles: [], contadores: {}, edges: [], ruta: [], activo: null }
    }

    const primer = ruta[0]
    const lesson = index.get(primer)
    const visibles = new Set([primer])
    const edges = []

    if (conBase) {
        for (const pre of lesson.prereq) {
            const l = index.get(pre)
            if (!l) continue
            visibles.add(l.id)
            edges.push({ id: `${l.id}->${primer}:prereq`, from: l.id, to: primer, kind: 'prereq' })
        }
    }

    return {
        visibles: [...visibles],
        contadores: {},
        edges,
        ruta,
        activo: primer,
    }
}

/**
 * Acomoda una capa en sub-columnas sin que dos nodos caigan en la misma
 * casilla. Prueba con pocas columnas y agrega solo las necesarias.
 *
 * Devuelve el numero de columnas y la casilla (sub-columna, fila) de cada nodo,
 * o `null` si ni con el peor caso se libran las colisiones (capas enormes).
 */
function acomodarCapa(total, PASO_Y, alturaSegura) {
    for (let columnas = 1; columnas <= total; columnas++) {
        const filas = Math.ceil(total / columnas)
        const ocupadas = new Set()
        const casillas = []
        let colision = false

        for (let i = 0; i < total && !colision; i++) {
            let asignada = null
            for (let fila = 0; fila < filas && !asignada; fila++) {
                for (let sub = 0; sub < columnas; sub++) {
                    if (ocupadas.has(`${sub}:${fila}`)) continue
                    const alto = fila * PASO_Y + NODE_H
                    if (alto > alturaSegura) continue
                    asignada = { sub, fila }
                    break
                }
            }
            if (!asignada) colision = true
            else {
                ocupadas.add(`${asignada.sub}:${asignada.fila}`)
                casillas.push(asignada)
            }
        }

        if (!colision) return { columnas, filas, casillas }
    }
    return null
}

/**
 * Layout por capas, determinista.
 *
 * dagre reordena los nodos de forma no reproducible: al agregar un nodo, dos
 * vecinos simetricos pueden intercambiar carril o caer uno encima del otro.
 * Como este grafo CRECE por despliegues sucesivos, aqui la estabilidad importa
 * mas que minimizar cruces. La regla es simple y explicable:
 *
 *   capa(x) = 1 + max(capa de sus prerrequisitos visibles)     (0 si no tiene)
 *
 * Cada nodo queda una columna a la derecha de su prerrequisito mas profundo:
 * el aprendizaje avanza hacia la derecha. Dentro de una columna, el orden
 * vertical lo fija `ordenPreferido` (la ruta planeada) y, en su defecto, el
 * titulo. Nada depende del orden en que los nodos llegaron al grafo.
 */
export function calcularLayout(
    lessons,
    edges,
    { ordenPreferido = [], viewport = null, reservado = { derecha: 0, abajo: 0 } } = {},
) {
    if (!lessons.length) return { posiciones: new Map(), capas: new Map(), width: 0, height: 0 }

    const visibles = new Set(lessons.map((l) => l.id))
    const entrantes = new Map(lessons.map((l) => [l.id, []]))
    for (const edge of edges) {
        if (visibles.has(edge.from) && visibles.has(edge.to) && entrantes.has(edge.to)) {
            entrantes.get(edge.to).push(edge.from)
        }
    }

    // Capa por camino mas largo. El limite de saltos evita un bucle infinito
    // si el catalogo trajera un ciclo.
    const capas = new Map()
    const calcular = (id, enCurso = new Set(), saltos = 0) => {
        if (capas.has(id)) return capas.get(id)
        if (saltos > 24 || enCurso.has(id)) return 0
        enCurso.add(id)
        const previos = entrantes.get(id) || []
        const capa = previos.length
            ? Math.max(...previos.map((pre) => calcular(pre, enCurso, saltos + 1))) + 1
            : 0
        enCurso.delete(id)
        capas.set(id, capa)
        return capa
    }
    for (const lesson of lessons) calcular(lesson.id)

    const indiceRuta = new Map(ordenPreferido.map((id, i) => [id, i]))
    const ordenar = (a, b) => {
        const enRutaA = indiceRuta.has(a.id)
        const enRutaB = indiceRuta.has(b.id)
        if (enRutaA !== enRutaB) return enRutaA ? -1 : 1 // lo planificado va arriba
        if (enRutaA && enRutaB && indiceRuta.get(a.id) !== indiceRuta.get(b.id)) {
            return indiceRuta.get(a.id) - indiceRuta.get(b.id)
        }
        return a.title.localeCompare(b.title, 'es')
    }

    const porCapa = new Map()
    for (const lesson of [...lessons].sort(ordenar)) {
        const capa = capas.get(lesson.id) || 0
        if (!porCapa.has(capa)) porCapa.set(capa, [])
        porCapa.get(capa).push(lesson)
    }

    const HUECO_X = 104
    const HUECO_Y = 42
    const PASO_Y = NODE_H + HUECO_Y

    // Area util del lienzo (lo que no tapa la tarjeta del nodo activo).
    const utilW = Math.max(360, (viewport?.width || 1000) - (reservado.derecha || 0))
    const utilH = Math.max(300, (viewport?.height || 700) - (reservado.abajo || 0))

    // Altura a la que el ajuste de camara deja de encoger: si una capa crece
    // mas alla, el texto se vuelve ilegible y conviene envolver en mas columnas.
    const alturaSegura = Math.max(NODE_H * 2, utilH * 1.25)

    const acomodos = new Map()
    for (const [capa, lista] of porCapa) {
        acomodos.set(
            capa,
            acomodarCapa(lista.length, PASO_Y, alturaSegura) || {
                // Capa gigantesca: se apila recto, sin inventar casillas.
                columnas: 1,
                filas: lista.length,
                casillas: lista.map((_, fila) => ({ sub: 0, fila })),
            },
        )
    }

    const alturaMax = Math.max(
        1,
        ...[...acomodos.values()].map((t) => t.filas * NODE_H + (t.filas - 1) * HUECO_Y),
    )

    // Ancho maximo real de una capa, para separar una capa de la siguiente.
    const anchoMaxCapa = Math.max(
        NODE_W,
        ...[...acomodos.values()].map((t) => t.columnas * NODE_W + (t.columnas - 1) * HUECO_X),
    )
    const PASO_CAPA = anchoMaxCapa + HUECO_X

    const posiciones = new Map()
    let xCapa = 0

    for (const [capa, lista] of [...porCapa.entries()].sort((a, b) => a[0] - b[0])) {
        const { columnas, filas, casillas } = acomodos.get(capa)
        const alturaBloque = filas * NODE_H + (filas - 1) * HUECO_Y
        const baseY = (alturaMax - alturaBloque) / 2
        const anchoBloque = columnas * NODE_W + (columnas - 1) * HUECO_X

        lista.forEach((lesson, i) => {
            const { sub, fila } = casillas[i]
            const x = xCapa + sub * (NODE_W + HUECO_X)
            const y = baseY + fila * PASO_Y
            posiciones.set(lesson.id, { x, y, cx: x + NODE_W / 2, cy: y + NODE_H / 2 })
        })

        xCapa += anchoBloque + HUECO_X
    }

    return {
        posiciones,
        capas,
        width: Math.max(NODE_W, xCapa - HUECO_X),
        height: alturaMax,
    }
}

/**
 * Traza una curva de conexion entre dos nodos.
 * Eje horizontal: sale por la derecha del origen y entra por la izquierda del destino.
 * Si el destino queda a la izquierda (retroceso), la curva rodea.
 */
export function trazarConexion(origen, destino) {
    const x1 = origen.x + NODE_W
    const y1 = origen.y + NODE_H / 2
    const x2 = destino.x
    const y2 = destino.y + NODE_H / 2

    const avance = x2 >= x1
    const c = Math.max(42, Math.min(190, Math.abs(x2 - x1) * 0.5))

    if (avance) {
        const cy = Math.abs(y2 - y1) * 0.2 + 6
        return {
            d: `M ${x1} ${y1} C ${x1 + c} ${y1 + (y2 > y1 ? cy : -cy)}, ${x2 - c} ${y2}, ${x2} ${y2}`,
            x1,
            y1,
            x2,
            y2,
        }
    }

    const desvio = Math.max(70, Math.abs(y2 - y1) * 0.4 + 60)
    const signo = y2 >= y1 ? 1 : -1
    return {
        d: `M ${x1} ${y1} C ${x1 + c} ${y1 + signo * desvio}, ${x2 - c} ${y2 - signo * desvio}, ${x2} ${y2}`,
        x1,
        y1,
        x2,
        y2,
    }
}

/** Punto medio entre dos nodos, para etiquetas sobre la conexion. */
export function puntoMedio(origen, destino) {
    const x1 = origen.x + NODE_W
    const y1 = origen.y + NODE_H / 2
    const x2 = destino.x
    const y2 = destino.y + NODE_H / 2
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
}

/** Centro de un nodo, para encuadrar la camara. */
export function centroDe(posicion) {
    return { x: posicion.x + NODE_W / 2, y: posicion.y + NODE_H / 2 }
}

/**
 * Vista de encuadre que contiene todos los nodos.
 *
 * `reservado` aparta el area que ocupa la tarjeta del nodo activo (abajo a la
 * derecha): sin eso, el ajuste automatico centra el grafo justo debajo de la
 * tarjeta y algunos nodos quedan tapados.
 */
export function encuadrar(posiciones, viewport, { padding = 56, reservado = { derecha: 0, abajo: 0 } } = {}) {
    if (!posiciones.size) return null
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const p of posiciones.values()) {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x + NODE_W)
        maxY = Math.max(maxY, p.y + NODE_H)
    }

    const disponibleW = Math.max(320, viewport.width - (reservado.derecha || 0))
    const disponibleH = Math.max(280, viewport.height - (reservado.abajo || 0))

    const ancho = maxX - minX + padding * 2
    const alto = maxY - minY + padding * 2
    const escala = Math.min(1.25, Math.max(0.25, Math.min(disponibleW / ancho, disponibleH / alto)))

    return {
        scale: escala,
        tx: disponibleW / 2 - (minX + (maxX - minX) / 2) * escala,
        ty: (viewport.height - (reservado.abajo || 0)) / 2 - (minY + (maxY - minY) / 2) * escala,
    }
}

/** Ajusta la vista para centrar un nodo concreto. */
export function centrarEn(posicion, viewport, escala) {
    const centro = centroDe(posicion)
    return {
        tx: viewport.width / 2 - centro.x * escala,
        ty: viewport.height / 2 - centro.y * escala,
    }
}

export { indexById }

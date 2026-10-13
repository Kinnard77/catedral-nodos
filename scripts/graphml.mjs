/**
 * EXPORTA EL GAMEFLOW A .graphml — para abrirlo en yEd.
 *
 * USO
 *   node scripts/graphml.mjs --modulo src/data/gameflow/gni-ejemplo.js --out dist/gni.graphml
 *   node scripts/graphml.mjs --in datos.json --out dist/grafo.graphml
 *   node scripts/graphml.mjs --listar
 *
 * Sin `--modulo` ni `--in`, exporta TODOS los gameflow que encuentre en
 * `src/data/gameflow/`, uno por fichero.
 *
 * QUE HACER CON EL RESULTADO
 * Abrir el .graphml en yEd (gratis, yWorks) y aplicar
 *   Layout > Hierarchical   (o Tools > Fit Node to Label)
 * para ver la forma del grafo. Los nodos van coloreados por PILAR y el borde
 * por ESTADO (verde = documentado, ambar = por verificar, morado = inventado).
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { pathToFileURL } from 'node:url'
import { graphmlDe, resumenDe } from '../src/graph/graphml.js'

const args = process.argv.slice(2)
const arg = (n, d) => {
    const i = args.indexOf(n)
    return i >= 0 && args[i + 1] ? args[i + 1] : d
}

const CARPETA = 'src/data/gameflow'

/** Saca las piezas y aristas de lo que exporte un modulo, sea cual sea su forma. */
function extraer(mod) {
    const valores = Object.values(mod || {})
    // 1) un objeto con .piezas / .steps / .lessons
    for (const v of valores) {
        if (!v || typeof v !== 'object' || Array.isArray(v)) continue
        for (const k of ['piezas', 'steps', 'lessons', 'nodos', 'nodes']) {
            if (Array.isArray(v[k]) && v[k].length) {
                return { piezas: v[k], edges: v.edges || v.aristas || undefined, nombre: v.titulo || v.nombre }
            }
        }
    }
    // 2) el primer array de objetos que tengan id
    for (const v of valores) {
        if (Array.isArray(v) && v.length && v[0] && typeof v[0] === 'object' && v[0].id) {
            return { piezas: v, edges: undefined }
        }
    }
    return { piezas: [], edges: undefined }
}

function escribir(piezas, edges, destino, titulo) {
    const xml = graphmlDe(piezas, edges, { titulo })
    mkdirSync(dirname(resolve(destino)), { recursive: true })
    writeFileSync(resolve(destino), xml, 'utf8')
    const r = resumenDe(piezas, edges)
    const pilares = Object.entries(r.porPilar)
        .map(([k, v]) => `${k}:${v}`)
        .join('  ')
    console.log(`  ${destino}`)
    console.log(`    ${r.nodos} nodos, ${r.aristas} aristas  |  ${pilares || 'sin pilares'}`)
}

if (args.includes('--listar') || (!arg('--modulo') && !arg('--in'))) {
    const ficheros = readdirSync(CARPETA).filter((f) => f.endsWith('.js') && f !== 'grafos.js')
    if (args.includes('--listar')) {
        console.log('gameflows disponibles en %s:', CARPETA)
        for (const f of ficheros) console.log('  -', f)
        process.exit(0)
    }
    console.log('exportando los %d gameflows de %s\n', ficheros.length, CARPETA)
    for (const f of ficheros) {
        try {
            const mod = await import(pathToFileURL(resolve(CARPETA, f)).href)
            const { piezas, edges, nombre } = extraer(mod)
            if (!piezas.length) {
                console.log(`  ${f}  -> sin piezas`)
                continue
            }
            const salida = `dist/graphml/${basename(f, '.js')}.graphml`
            escribir(piezas, edges, salida, nombre || basename(f, '.js'))
        } catch (e) {
            console.log(`  ${f}  -> no se pudo leer: ${e.message}`)
        }
    }
    process.exit(0)
}

const entrada = arg('--in')
const modulo = arg('--modulo')
const salida = arg('--out', 'dist/graphml/gameflow.graphml')

if (entrada) {
    const datos = JSON.parse(readFileSync(resolve(entrada), 'utf8'))
    const piezas = Array.isArray(datos) ? datos : datos.piezas || datos.steps || datos.lessons || []
    const edges = Array.isArray(datos) ? undefined : datos.edges || datos.aristas
    escribir(piezas, edges, salida, datos.titulo || basename(entrada, '.json'))
} else {
    const mod = await import(pathToFileURL(resolve(modulo)).href)
    const { piezas, edges, nombre } = extraer(mod)
    if (!piezas.length) {
        console.error(`no encontre piezas en ${modulo}`)
        process.exit(1)
    }
    escribir(piezas, edges, salida, nombre || basename(modulo, '.js'))
}

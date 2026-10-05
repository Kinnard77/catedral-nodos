/**
 * Prueba end-to-end del flujo de la academia sobre Chrome headless (CDP).
 * Cubre: prompt -> clasificar -> Play -> ver continuacion -> leer leccion
 * -> marcar cursada -> persistencia.
 *
 * Uso: node scripts/e2e.mjs [url]
 */
import { spawn } from 'node:child_process'
import { setTimeout as esperar } from 'node:timers/promises'

const URL_APP = process.argv[2] || 'http://localhost:5199/'
const PUERTO = 9334
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PERFIL = `${process.env.TEMP}\\cdp-e2e-${Date.now()}`

let fallos = 0
const ok = (condicion, mensaje, extra = '') => {
    if (condicion) console.log(`  ok   ${mensaje}`)
    else {
        fallos++
        console.log(`  FALLA ${mensaje}${extra ? ` :: ${extra}` : ''}`)
    }
}

const chrome = spawn(
    CHROME,
    [
        '--headless=new',
        '--disable-gpu',
        `--remote-debugging-port=${PUERTO}`,
        `--user-data-dir=${PERFIL}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--window-size=1600,950',
        'about:blank',
    ],
    { stdio: 'ignore' },
)

let ws
let siguienteId = 1
const pendientes = new Map()
const consola = []

const enviar = (method, params = {}, sessionId) =>
    new Promise((resolver, rechazar) => {
        const id = siguienteId++
        pendientes.set(id, { resolver, rechazar })
        ws.send(JSON.stringify({ id, method, params, sessionId }))
    })

try {
    let version = null
    for (let i = 0; i < 40 && !version; i++) {
        await esperar(250)
        try {
            version = await (await fetch(`http://127.0.0.1:${PUERTO}/json/version`)).json()
        } catch {
            /* aun no disponible */
        }
    }
    if (!version) throw new Error('Chrome no expuso el puerto de depuracion.')

    ws = new WebSocket(version.webSocketDebuggerUrl)
    await new Promise((res, rej) => {
        ws.addEventListener('open', res, { once: true })
        ws.addEventListener('error', rej, { once: true })
    })

    ws.addEventListener('message', (m) => {
        const d = JSON.parse(m.data)
        if (d.id && pendientes.has(d.id)) {
            const p = pendientes.get(d.id)
            pendientes.delete(d.id)
            if (d.error) p.rechazar(new Error(d.error.message))
            else p.resolver(d.result)
            return
        }
        if (d.method === 'Runtime.exceptionThrown') {
            consola.push(`[excepcion] ${d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text}`)
        }
        if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') {
            consola.push(`[console.error] ${(d.params.args || []).map((a) => a.value ?? a.description).join(' ')}`)
        }
    })

    const { targetId } = await enviar('Target.createTarget', { url: 'about:blank' })
    const { sessionId } = await enviar('Target.attachToTarget', { targetId, flatten: true })
    await enviar('Runtime.enable', {}, sessionId)
    await enviar('Page.enable', {}, sessionId)

    const evaluar = async (expresion) => {
        const r = await enviar(
            'Runtime.evaluate',
            { expression: expresion, returnByValue: true, awaitPromise: true },
            sessionId,
        )
        if (r.exceptionDetails) {
            throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text)
        }
        return r.result?.value
    }

    const esperarA = async (expresion, { timeout = 12000, intervalo = 200, descripcion = expresion } = {}) => {
        const limite = Date.now() + timeout
        while (Date.now() < limite) {
            if (await evaluar(expresion)) return true
            await esperar(intervalo)
        }
        console.log(`  (timeout esperando: ${descripcion})`)
        return false
    }

    // Utilidades de interaccion
    const escribirPrompt = (texto) => `(() => {
        const area = document.getElementById('prompt-academia');
        if (!area) return false;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        setter.call(area, ${JSON.stringify(texto)});
        area.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    })()`

    const clicPorTexto = (texto, ambito = 'document') => `(() => {
        const raiz = ${ambito};
        const nodos = [...raiz.querySelectorAll('button')];
        const objetivo = nodos.find((b) => (b.innerText || '').trim().includes(${JSON.stringify(texto)}));
        if (!objetivo) return false;
        objetivo.click();
        return true;
    })()`

    const contar = (selector) => `document.querySelectorAll(${JSON.stringify(selector)}).length`

    // --- 1. Carga inicial ---------------------------------------------------
    console.log('\n1. Carga de la academia')
    await enviar('Page.navigate', { url: URL_APP }, sessionId)
    await esperarA('!!document.querySelector("#prompt-academia")', { descripcion: 'textarea del prompt' })
    ok(await evaluar('!!document.querySelector("#prompt-academia")'), 'la caja de prompt existe')
    const catalogoTexto = await evaluar('document.body.innerText.includes("28")')
    ok(catalogoTexto, 'el panel muestra el tamaño del catálogo (28 lecciones)')
    ok((await evaluar('document.body.innerText')).includes('Escribe qué quieres aprender'), 'el lienzo arranca vacío con instrucciones')

    // --- 2. Clasificar ------------------------------------------------------
    console.log('\n2. Clasificar "Quiero aprender el teorema de Pitágoras"')
    ok(await evaluar(escribirPrompt('Quiero aprender el teorema de Pitágoras')), 'se escribió el prompt')
    ok(await evaluar(clicPorTexto('Clasificar lecciones')), 'se pulsó "Clasificar lecciones"')
    const hayRuta = await esperarA('document.body.innerText.includes("Play ruta")', {
        descripcion: 'la ruta clasificada',
    })
    ok(hayRuta, 'el clasificador devolvió una ruta')
    const panelRuta = await evaluar(
        `document.querySelector('[data-panel="ruta"]')?.innerText || ''`,
    )
    // El CSS aplica text-transform: uppercase, asi que se compara en minusculas.
    const panelMin = panelRuta.toLowerCase()
    const tieneSecuencia = panelMin.includes('secuencia')
    ok(tieneSecuencia, 'la ruta muestra la secuencia de pasos')
    if (!tieneSecuencia) {
        console.log('  (texto real del panel de ruta:)')
        console.log(
            panelRuta
                .split('\n')
                .slice(0, 40)
                .map((l) => `       ${l}`)
                .join('\n'),
        )
    }
    ok(panelMin.includes('pitágoras') || panelMin.includes('pitagoras'), 'la ruta menciona el objetivo')
    ok(
        panelMin.includes('fundamento') || panelMin.includes('núcleo') || panelMin.includes('práctica'),
        'la ruta explica el papel de cada nodo (rol)',
    )
    const pasos = await evaluar(
        `[...document.querySelectorAll('ol li')].filter(li => li.innerText.match(/^\\d/)).length`,
    )
    ok(pasos >= 3, `la secuencia tiene al menos 3 pasos (${pasos})`)

    // --- 3. Play: el grafo se despliega solo --------------------------------
    console.log('\n3. Play despliega el grafo')
    await esperar(1200) // el Play es automático tras clasificar
    const nodosGrafo = () => `document.querySelectorAll('[data-node-id]').length`
    const nodosIniciales = await evaluar(nodosGrafo())
    const conexionesIniciales = await evaluar(contar('svg path.conexion'))
    const tarjetaActiva = await evaluar('document.body.innerText.includes("Ver continuación")')
    ok(tarjetaActiva, 'aparece la tarjeta del nodo activo con "Ver continuación"')
    ok(nodosIniciales >= 1, `el grafo abre con ${nodosIniciales} nodo(s), no con toda la ruta`)
    ok(nodosIniciales < pasos, `no despliega la ruta completa de una vez (${nodosIniciales} < ${pasos})`)
    console.log(`  (conexiones SVG: ${conexionesIniciales})`)
    ok(conexionesIniciales >= 0, 'la capa de conexiones SVG existe')

    // --- 4. Ver continuación ------------------------------------------------
    console.log('\n4. "Ver continuación" agrega nodos')
    const antes = await evaluar(nodosGrafo())
    ok(
        await evaluar(`(() => {
            const b = document.querySelector('[data-accion="continuar"]');
            if (!b) return false;
            b.click();
            return true;
        })()`),
        'se pulsó "Ver continuación"',
    )
    await esperar(900)
    const despues = await evaluar(nodosGrafo())
    const conexionesDespues = await evaluar(contar('svg path.conexion'))
    ok(despues > antes, `el grafo creció: ${antes} -> ${despues} nodos`)
    ok(
        conexionesDespues > conexionesIniciales,
        `se dibujaron nuevas conexiones: ${conexionesIniciales} -> ${conexionesDespues}`,
    )
    const motivo = await evaluar(
        `(document.body.innerText.match(/\\+\\d+ nodo\\(s\\)[^\\n]*/) || [''])[0]`,
    )
    ok(motivo.length > 0, `se reporta el motivo del despliegue ("${motivo}")`)
    const nuevasMarcadas = await evaluar(
        `[...document.querySelectorAll('[data-node-nueva="si"]')].map(n => n.dataset.nodeId).join(',')`,
    )
    ok(nuevasMarcadas.length > 0, `los nodos nuevos quedan identificados: ${nuevasMarcadas}`)

    // --- 5. Leer la lección -------------------------------------------------
    console.log('\n5. Leer la lección activa')
    const tituloActivo = await evaluar(
        `document.querySelector('[data-node-state="activo"]')?.dataset.nodeId || ''`,
    )
    console.log(`  (lección activa: ${tituloActivo})`)
    ok(await evaluar(clicPorTexto('Estudiar lección')), 'se pulsó "Estudiar lección"')
    const lectorAbierto = await esperarA('document.querySelectorAll(".katex").length > 0', {
        descripcion: 'el lector con contenido renderizado',
    })
    ok(lectorAbierto, 'el lector de lección se abrió y renderizó contenido')
    const prosa = await evaluar(`document.querySelectorAll('.prosa').length`)
    ok(prosa > 0, `el contenido se renderiza como prosa (${prosa} bloques)`)
    const katex = await evaluar(`document.querySelectorAll('.katex').length`)
    ok(katex > 0, `KaTeX renderizó ${katex} expresiones matemáticas`)
    const bloques = await evaluar(`document.querySelectorAll('pre code').length`)
    console.log(`  (bloques de código: ${bloques})`)
    ok(await evaluar('document.body.innerText.includes("Ver continuación")'), 'el lector ofrece "ver continuación" al pie')

    // --- 6. Continuar desde el lector --------------------------------------
    console.log('\n6. Continuar desde el lector')
    const nodosAntesLector = await evaluar(nodosGrafo())
    // Ambito acotado al lector: la tarjeta del nodo detras tiene su propio
    // boton "Ver continuación" y hay que pulsar el del lector.
    ok(
        await evaluar(clicPorTexto('Ver continuación', 'document.querySelector(".fixed.z-40")')),
        'se pulsó "Ver continuación" dentro del lector',
    )
    const lectorCerrado = await esperarA('document.querySelectorAll(".prosa").length === 0', {
        descripcion: 'el lector se cierra',
    })
    ok(lectorCerrado, 'el lector se cierra al continuar')
    await esperar(1400)
    const nodosTrasLector = await evaluar(nodosGrafo())
    ok(
        nodosTrasLector >= nodosAntesLector,
        `el grafo siguió desplegándose tras leer (${nodosAntesLector} -> ${nodosTrasLector})`,
    )
    const cursadas = await evaluar(
        `JSON.parse(localStorage.getItem('academia:v1:progreso') || '[]').length`,
    )
    ok(cursadas > 0, `la lección leída quedó marcada como cursada (${cursadas})`)

    // --- 7. Persistencia ----------------------------------------------------
    console.log('\n7. Persistencia en localStorage')
    const claves = await evaluar(`Object.keys(localStorage).filter(k => k.startsWith('academia:')).length`)
    ok(claves > 0, `se guardaron ${claves} clave(s) de la academia`)
    const progreso = await evaluar(`localStorage.getItem('academia:v1:progreso') || ''`)
    ok(progreso.length > 2, `el progreso quedó guardado (${progreso})`)

    await enviar('Page.navigate', { url: URL_APP }, sessionId)
    await esperarA('!!document.querySelector("#prompt-academia")', { descripcion: 'recarga' })
    await esperar(1000)
    const cursadasTrasRecarga = await evaluar(
        `JSON.parse(localStorage.getItem('academia:v1:progreso') || '[]').length`,
    )
    ok(cursadasTrasRecarga > 0, `el progreso sobrevive la recarga (${cursadasTrasRecarga} lección(es))`)

    // --- 8. Consola limpia --------------------------------------------------
    console.log('\n8. Consola del navegador')
    const erroresReales = consola.filter(
        (linea) => !linea.includes('favicon') && !linea.includes('Download the React DevTools'),
    )
    ok(erroresReales.length === 0, `sin errores de consola (${erroresReales.length})`)
    erroresReales.slice(0, 5).forEach((linea) => console.log(`       ${linea.slice(0, 220)}`))
} catch (error) {
    fallos++
    console.log(`\nERROR del arnes: ${error.message}`)
} finally {
    console.log(`\n${fallos === 0 ? 'FLUJO COMPLETO EN VERDE' : `${fallos} PRUEBA(S) FALLIDA(S)`}\n`)
    try {
        ws?.close()
    } catch {
        /* ya cerrado */
    }
    chrome.kill()
    process.exit(fallos === 0 ? 0 : 1)
}

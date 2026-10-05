/**
 * Diagnostico: abre la app en Chrome headless por CDP y reporta
 * errores de consola y excepciones no capturadas.
 * Uso: node scripts/diagnostico.mjs [url]
 */
import { spawn } from 'node:child_process'
import { setTimeout as esperar } from 'node:timers/promises'

const URL_APP = process.argv[2] || 'http://localhost:5199/'
const PUERTO = 9333
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PERFIL = `${process.env.TEMP}\\cdp-perfil-${Date.now()}`

const chrome = spawn(
    CHROME,
    [
        '--headless=new',
        '--disable-gpu',
        `--remote-debugging-port=${PUERTO}`,
        `--user-data-dir=${PERFIL}`,
        '--no-first-run',
        '--no-default-browser-check',
        'about:blank',
    ],
    { stdio: 'ignore' },
)

let ws
let siguienteId = 1
const pendientes = new Map()
const eventos = []

const enviar = (method, params = {}, sessionId) =>
    new Promise((resolver, rechazar) => {
        const id = siguienteId++
        pendientes.set(id, { resolver, rechazar })
        ws.send(JSON.stringify({ id, method, params, sessionId }))
    })

try {
    // Espera a que el endpoint de debugging responda.
    let version = null
    for (let i = 0; i < 40 && !version; i++) {
        await esperar(250)
        try {
            const r = await fetch(`http://127.0.0.1:${PUERTO}/json/version`)
            version = await r.json()
        } catch {
            /* aun no levanta */
        }
    }
    if (!version) throw new Error('Chrome no expuso el puerto de depuracion.')

    ws = new WebSocket(version.webSocketDebuggerUrl)
    await new Promise((resolver, rechazar) => {
        ws.addEventListener('open', resolver, { once: true })
        ws.addEventListener('error', rechazar, { once: true })
    })

    ws.addEventListener('message', (mensaje) => {
        const datos = JSON.parse(mensaje.data)
        if (datos.id && pendientes.has(datos.id)) {
            const { resolver, rechazar } = pendientes.get(datos.id)
            pendientes.delete(datos.id)
            if (datos.error) rechazar(new Error(datos.error.message))
            else resolver(datos.result)
            return
        }
        if (datos.method) eventos.push(datos)
    })

    const { targetId } = await enviar('Target.createTarget', { url: 'about:blank' })
    const { sessionId } = await enviar('Target.attachToTarget', { targetId, flatten: true })

    await enviar('Runtime.enable', {}, sessionId)
    await enviar('Log.enable', {}, sessionId)
    await enviar('Page.enable', {}, sessionId)
    await enviar('Page.navigate', { url: URL_APP }, sessionId)

    await esperar(5000)

    const evaluar = async (expresion) => {
        const r = await enviar(
            'Runtime.evaluate',
            { expression: expresion, returnByValue: true, awaitPromise: true },
            sessionId,
        )
        return r.result?.value
    }

    const titulo = await evaluar('document.title')
    const raiz = await evaluar('document.getElementById("root")?.children.length ?? -1')
    const texto = await evaluar('(document.getElementById("root")?.innerText || "").slice(0, 600)')

    console.log(`\nURL: ${URL_APP}`)
    console.log(`Titulo: ${titulo}`)
    console.log(`Hijos en #root: ${raiz}`)
    console.log(`Texto visible (600 chars):\n${texto || '(vacio)'}`)

    const errores = eventos.filter(
        (e) =>
            (e.method === 'Runtime.exceptionThrown') ||
            (e.method === 'Log.entryAdded' && ['error', 'warning'].includes(e.params?.entry?.level)) ||
            (e.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(e.params?.type)),
    )

    console.log(`\nErrores y advertencias (${errores.length}):`)
    for (const e of errores) {
        if (e.method === 'Runtime.exceptionThrown') {
            const d = e.params.exceptionDetails
            console.log(`  [excepcion] ${d.exception?.description || d.text}`)
            const marco = d.stackTrace?.callFrames?.[0]
            if (marco) console.log(`              en ${marco.functionName || '(anon)'} ${marco.url}:${marco.lineNumber + 1}`)
        } else if (e.method === 'Log.entryAdded') {
            console.log(`  [${e.params.entry.level}] ${e.params.entry.text} ${e.params.entry.url || ''}`)
        } else {
            const args = (e.params.args || []).map((a) => a.value ?? a.description ?? '').join(' ')
            console.log(`  [console.${e.params.type}] ${args}`)
        }
    }
    console.log('')
} catch (error) {
    console.error(`\nDiagnostico fallo: ${error.message}\n`)
    process.exitCode = 1
} finally {
    try {
        ws?.close()
    } catch {
        /* ya cerrado */
    }
    chrome.kill()
}

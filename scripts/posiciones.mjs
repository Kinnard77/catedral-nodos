/**
 * Imprime las posiciones REALES del layout en el DOM (no las de pantalla).
 * Uso: node scripts/posiciones.mjs [prompt] [intentos]
 */
import { spawn } from 'node:child_process'
import { setTimeout as esperar } from 'node:timers/promises'

const PUERTO = 9337
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PERFIL = `${process.env.TEMP}\\cdp-pos-${Date.now()}`
const PROMPT = process.argv[2] || 'Que el jugador descubra que las marcas de cantero son firmas'
const INTENTOS = Number(process.argv[3] || 5)

const chrome = spawn(
    CHROME,
    ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PUERTO}`, `--user-data-dir=${PERFIL}`,
     '--no-first-run', '--window-size=1680,1000', 'about:blank'],
    { stdio: 'ignore' },
)

let ws
let id = 1
const pendientes = new Map()
const enviar = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
        const i = id++
        pendientes.set(i, { resolver: res, rechazar: rej })
        ws.send(JSON.stringify({ id: i, method, params, sessionId }))
    })

try {
    let version = null
    for (let i = 0; i < 40 && !version; i++) {
        await esperar(250)
        try {
            version = await (await fetch(`http://127.0.0.1:${PUERTO}/json/version`)).json()
        } catch {
            /* esperando */
        }
    }
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
        }
    })

    const { targetId } = await enviar('Target.createTarget', { url: 'about:blank' })
    const { sessionId } = await enviar('Target.attachToTarget', { targetId, flatten: true })
    await enviar('Runtime.enable', {}, sessionId)
    await enviar('Page.enable', {}, sessionId)

    const evaluar = async (expresion) => {
        const r = await enviar('Runtime.evaluate',
            { expression: expresion, returnByValue: true, awaitPromise: true }, sessionId)
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description)
        return r.result?.value
    }

    await enviar('Page.navigate', { url: 'http://localhost:5199/' }, sessionId)
    await esperar(2500)
    await evaluar(`(() => {
        const area = document.getElementById('prompt-gameflow');
        const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        set.call(area, ${JSON.stringify(PROMPT)});
        area.dispatchEvent(new Event('input', { bubbles: true }));
        [...document.querySelectorAll('button')].find(b => b.innerText.includes('Desplegar')).click();
        return true;
    })()`)
    await esperar(3200)

    const volcar = async (etiqueta) => {
        const crudo = await evaluar(`(() => {
            const nodos = [...document.querySelectorAll('[data-node-id]')].map(n => ({
                id: n.dataset.nodeId,
                transform: n.style.transform,
                duplicados: document.querySelectorAll('[data-node-id="' + n.dataset.nodeId + '"]').length,
            }));
            return JSON.stringify(nodos);
        })()`)
        const nodos = JSON.parse(crudo)
        console.log(`\n${etiqueta} — ${nodos.length} nodo(s) en el DOM`)
        const vistos = new Map()
        for (const n of nodos) {
            const m = /translate3d\(([-\d.]+)px, ([-\d.]+)px/.exec(n.transform || '')
            const x = m ? Number(m[1]) : null
            const y = m ? Number(m[2]) : null
            const choca = x !== null && [...vistos.entries()].some(([, v]) => v.x === x && v.y === y)
            vistos.set(n.id, { x, y })
            console.log(
                `  ${n.id.padEnd(28)} x=${String(x).padStart(5)} y=${String(y).padStart(5)}` +
                    ` instancias=${n.duplicados}${choca ? '  <-- CHOCA' : ''}`,
            )
        }
    }

    await volcar('Tras Play')
    for (let i = 1; i <= INTENTOS; i++) {
        await evaluar(`document.querySelector('[data-accion="continuar"]')?.click()`)
        await esperar(1300)
        await volcar(`Tras despliegue ${i}`)
    }
} catch (error) {
    console.error(`Fallo: ${error.message}`)
    process.exitCode = 1
} finally {
    try {
        ws?.close()
    } catch {
        /* cerrado */
    }
    chrome.kill()
}

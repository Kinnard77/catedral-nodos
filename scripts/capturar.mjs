/**
 * Captura imagenes del flujo para revision visual.
 * Uso: node scripts/capturar.mjs [url]
 */
import { spawn } from 'node:child_process'
import { setTimeout as esperar } from 'node:timers/promises'
import { writeFileSync } from 'node:fs'

const URL_APP = process.argv[2] || 'http://localhost:5199/'
const PUERTO = 9335
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PERFIL = `${process.env.TEMP}\\cdp-shot-${Date.now()}`
const SALIDA = 'C:\\Users\\illus\\MIS_PROYECTOS_IA\\Academia Nodos\\capturas'

const chrome = spawn(
    CHROME,
    [
        '--headless=new',
        '--disable-gpu',
        `--remote-debugging-port=${PUERTO}`,
        `--user-data-dir=${PERFIL}`,
        '--no-first-run',
        '--window-size=1680,1000',
        'about:blank',
    ],
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
    await enviar('Emulation.setDeviceMetricsOverride',
        { width: 1680, height: 1000, deviceScaleFactor: 1, mobile: false }, sessionId)

    const evaluar = async (expresion) => {
        const r = await enviar(
            'Runtime.evaluate',
            { expression: expresion, returnByValue: true, awaitPromise: true },
            sessionId,
        )
        return r.result?.value
    }

    const captura = async (nombre) => {
        const { data } = await enviar('Page.captureScreenshot', { format: 'png' }, sessionId)
        writeFileSync(`${SALIDA}\\${nombre}.png`, Buffer.from(data, 'base64'))
        console.log(`  captura: ${nombre}.png`)
    }

    await enviar('Page.navigate', { url: URL_APP }, sessionId)
    await esperar(2500)

    console.log('1. Estado inicial')
    await captura('01-inicial')

    console.log('2. Ruta clasificada y grafo desplegado')
    await evaluar(`(() => {
        const area = document.getElementById('prompt-academia');
        const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        set.call(area, 'Quiero aprender el teorema de Pitágoras');
        area.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    })()`)
    await evaluar(`[...document.querySelectorAll('button')].find(b => b.innerText.includes('Clasificar')).click()`)
    await esperar(3500)
    await captura('02-ruta-y-grafo')

    console.log('3. Varios despliegues con "ver continuación"')
    for (let i = 0; i < 4; i++) {
        await evaluar(`document.querySelector('[data-accion="continuar"]')?.click()`)
        await esperar(1100)
    }
    await captura('03-grafo-crecido')

    console.log('4. Lector de lección (con matemáticas)')
    await evaluar(`(() => {
        const nodos = [...document.querySelectorAll('[data-node-id]')];
        const pitagoras = nodos.find(n => n.dataset.nodeId === 'mate-pitagoras') || nodos[nodos.length - 1];
        pitagoras?.querySelector('button')?.click();
        return true;
    })()`)
    await esperar(700)
    await evaluar(`[...document.querySelectorAll('button')].find(b => b.innerText.includes('Estudiar lección'))?.click()`)
    await esperar(1600)
    await captura('04-lector')

    console.log('5. Lector desplazado hasta el quiz')
    await evaluar(`(() => {
        const sc = document.querySelector('.sin-scrollbar.flex-1.overflow-y-auto');
        if (sc) sc.scrollTop = sc.scrollHeight;
        return true;
    })()`)
    await esperar(900)
    await captura('05-lector-quiz')

    console.log('6. Ajustes del clasificador')
    await evaluar(`[...document.querySelectorAll('button')].find(b => b.innerText.includes('Ajustes'))?.click()`)
    await esperar(700)
    await captura('06-ajustes')
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

/**
 * Captura imagenes del flujo para revision visual.
 * Uso: node scripts/capturar.mjs [url]
 *
 * Captura el PASO 0 (la catedral) y el GRAFO DEL GDD desplegado desde el final.
 */
import { spawn } from 'node:child_process'
import { setTimeout as esperar } from 'node:timers/promises'
import { writeFileSync } from 'node:fs'

const URL_APP = process.argv[2] || 'http://localhost:5199/'
const PUERTO = 9335
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PERFIL = `${process.env.TEMP}\\cdp-shot-${Date.now()}`
const SALIDA = 'C:\\Users\\illus\\MIS_PROYECTOS_IA\\Catedral-Nodos\\capturas'

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

    /** Espera a que exista un selector, en vez de confiar en un tiempo fijo. */
    const esperarSelector = async (selector, timeout = 20000) => {
        const limite = Date.now() + timeout
        while (Date.now() < limite) {
            if (await evaluar(`!!document.querySelector(${JSON.stringify(selector)})`)) return true
            await esperar(200)
        }
        console.log(`  (timeout esperando ${selector})`)
        return false
    }

    await enviar('Page.navigate', { url: URL_APP }, sessionId)
    await esperarSelector('[data-catedral]')
    await esperar(600)

    console.log('1. La pregunta 0: en qué catedral vamos a trabajar')
    await captura('01-pregunta-catedral')

    console.log('2. Al elegir catedral salen las opciones que ya existen en ella')
    await evaluar(`document.querySelector('[data-catedral="valencia"]')?.click()`)
    await esperarSelector('[data-opcion]')
    await esperar(900)
    await captura('02-material-de-la-catedral')

    console.log('3. El detalle de un anclaje, con su estado y su fuente')
    await evaluar(`document.querySelector('[data-opcion="ANC-01"] button')?.click()`)
    await esperar(700)
    await captura('03-detalle-de-un-anclaje')

    console.log('4. La verificación a mano: sin fuente no se documenta')
    await evaluar(`(() => {
        const campo = document.getElementById('fuente-ANC-01');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(campo, 'Libro de fábrica de la catedral, fol. 42');
        campo.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    })()`)
    await esperar(700)
    await captura('04-verificacion-a-mano')

    console.log('5. El grafo de ese anclaje, desplegado POR EL FINAL')
    await evaluar(`document.querySelector('[data-ver-grafo="ANC-01"]')?.click()`)
    await esperar(3200)
    await captura('05-grafo-desde-el-final')

    console.log('6. El grafo del GNI completo: ruta dual, divergencia y núcleo')
    await evaluar(`document.querySelector('[data-accion="continuar"]')?.click()`)
    await esperar(1400)
    await evaluar(`document.querySelector('[data-node-id="DIV-01"] button')?.click()`)
    await esperar(500)
    await evaluar(`document.querySelector('[data-accion="continuar"]')?.click()`)
    await esperar(1400)
    for (const idNodo of ['CAL-01', 'EPI-01']) {
        await evaluar(`document.querySelector('[data-node-id="${idNodo}"] button')?.click()`)
        await esperar(500)
        await evaluar(`document.querySelector('[data-accion="continuar"]')?.click()`)
        await esperar(1200)
    }
    await captura('06-gni-completo')

    console.log('7. Ajustes: conectar la IA (Google AI Studio)')
    await evaluar(
        `[...document.querySelectorAll('button')].find(b => b.innerText.includes('Ajustes'))?.click()`,
    )
    await esperar(900)
    await evaluar(
        `[...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Google AI Studio')?.click()`,
    )
    await esperar(700)
    // Una clave de ejemplo del formato NUEVO (AQ…), para que se vea que se
    // reconoce sin validarla. No se pulsa Probar: eso haria una llamada real.
    await evaluar(`(() => {
        const campo = [...document.querySelectorAll('input')].find(i => i.type === 'password');
        if (!campo) return false;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(campo, 'AQ.Ab8QEjemploFormatoNuevo');
        campo.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    })()`)
    await esperar(900)
    await captura('07-ajustes-google')
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

/**
 * Prueba end-to-end del Gameflow de catedrales sobre Chrome headless (CDP).
 *
 * Cubre el flujo real de la herramienta, que ya no es «escribe que quieres que
 * descubra el jugador»:
 *
 *   catedral -> material que YA existe en esa catedral -> grafo desde el final
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

    const clicPorTexto = (texto, ambito = 'document') => `(() => {
        const raiz = ${ambito};
        const nodos = [...raiz.querySelectorAll('button')];
        const objetivo = nodos.find((b) => (b.innerText || '').trim().includes(${JSON.stringify(texto)}));
        if (!objetivo) return false;
        objetivo.click();
        return true;
    })()`

    const texto = async () => (await evaluar('document.body.innerText')).toLowerCase()

    const escribirEn = (id, valor, etiqueta = 'input') => `(() => {
        const campo = document.getElementById(${JSON.stringify(id)});
        if (!campo) return false;
        const proto = ${
            etiqueta === 'input' ? 'window.HTMLInputElement' : 'window.HTMLTextAreaElement'
        }.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(campo, ${JSON.stringify(valor)});
        campo.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
    })()`

    // --- 1. El lienzo abre con la pregunta 0 ---------------------------------
    console.log('\n1. El lienzo abre preguntando la catedral')
    await enviar('Page.navigate', { url: URL_APP }, sessionId)
    await esperarA('!!document.querySelector("[data-catedral]")', {
        descripcion: 'el selector de catedral',
    })
    ok(
        (await texto()).includes('¿en qué catedral vamos a trabajar?'),
        'la primera pregunta del lienzo es en qué catedral se trabaja',
    )
    const cuantas = await evaluar(`document.querySelectorAll('[data-catedral]').length`)
    ok(cuantas >= 8, `ofrece las catedrales del diseñador (${cuantas})`)
    for (const nombre of ['sevilla', 'valencia', 'burgos', 'chartres']) {
        ok(
            await evaluar(`!!document.querySelector('[data-catedral="${nombre}"]')`),
            `está la Catedral de ${nombre}`,
        )
    }

    // --- 2. Sin catedral no hay material que enseñar -------------------------
    console.log('\n2. Sin catedral el panel no finge')
    ok(
        !(await evaluar(clicPorTexto('Cerrar'))),
        'la pregunta no se puede cerrar mientras no haya catedral',
    )
    ok(
        (await texto()).includes('elige la catedral en el lienzo'),
        'el panel pide la catedral en vez de preguntar qué queremos que descubra el jugador',
    )
    ok(
        !(await texto()).includes('¿qué quieres que descubra'),
        'ya NO se le pregunta al diseñador qué debe descubrir el jugador: eso lo resuelve el grafo',
    )
    ok(
        !(await evaluar(`!!document.getElementById('material-notas')`)),
        'sin catedral no hay ni caja de investigación',
    )

    // --- 3. Elegir la catedral: aparece SU material --------------------------
    console.log('\n3. Al elegir catedral salen las opciones que ya existen en ella')
    ok(
        await evaluar(`(() => {
            const b = document.querySelector('[data-catedral="valencia"]');
            if (!b) return false;
            b.click();
            return true;
        })()`),
        'se eligió la Catedral de Valencia',
    )
    await esperarA('!!document.querySelector("[data-opcion]")', {
        descripcion: 'el material de Valencia',
    })
    const opciones = await evaluar(`document.querySelectorAll('[data-opcion]').length`)
    ok(opciones === 0, `el panel arranca VACIO, sin material de ejemplo (${opciones})`)
    ok(
        (await texto()).includes('todavía no hay'),
        'y lo dice: primero qué tenemos, después qué misterio inducimos',
    )
    ok(
        await evaluar(`!!document.querySelector('[data-accion="investigar"]')`),
        'y ofrece investigar la catedral',
    )
    ok(
        await evaluar(`!!document.getElementById('material-notas')`),
        'y ya se puede encargar la investigación',
    )

    // --- 4. Ver el detalle de un anclaje -------------------------------------
    // Material de prueba inyectado: los pasos siguientes comprueban el detalle,
    // la verificacion a mano y el grafo, y necesitan un anclaje. Antes venia
    // sembrado en el codigo; ahora se pone aqui, que es donde tiene que estar.
    await evaluar(`(() => {
        const o = (id, extra) => Object.assign({
            id, catedralId: 'valencia', clase: 'anclaje', pilar: 'anclaje_visible',
            titulo: 'Losa de prueba ' + id, detalle: 'Con el punto medial descentrado entre las palabras 3 y 4.',
            ubicacion: 'Girola', juego: '', fuente: '', estado: 'por_verificar',
            fuenteConsultada: false, fuenteSospechosa: false, degradado: false,
            motivoDegradado: '', valido: true, ejemplo: false,
        }, extra || {});
        localStorage.setItem('gameflow:v1:material', JSON.stringify([
            o('ANC-01', { ejemplo: true }),
            o('EPI-01', { clase: 'epigrafia', pilar: 'apocrifo' }),
            o('DC-01', { clase: 'dato_curioso', pilar: 'dualidad_gremios' }),
            o('FIL-01', { clase: 'dato_curioso', pilar: 'secreto_filosofico' }),
        ]));
        return true;
    })()`)
    await enviar('Page.navigate', { url: URL_APP }, sessionId)
    await esperarA('!!document.querySelector("[data-opcion=\\"ANC-01\\"]")', {
        descripcion: 'el material de prueba',
    })
    await esperar(700)

    ok(
        (await texto()).includes('anclaje en lo visible') &&
            (await texto()).includes('apócrifo convincente') &&
            (await texto()).includes('dualidad de gremios') &&
            (await texto()).includes('secreto sin magia'),
        'y salen agrupadas por los cuatro pilares',
    )
    ok(
        (await texto()).includes('por verificar'),
        'cada opción declara su estado: el ejemplo del §4 aún no tiene fuente',
    )
    ok(
        !(await texto()).includes('documentado\n'),
        'ninguna se da por documentada sin fuente',
    )

    console.log('\n4. El detalle de un anclaje')
    ok(
        await evaluar(`(() => {
            const b = document.querySelector('[data-opcion="ANC-01"] button');
            if (!b) return false;
            b.click();
            return true;
        })()`),
        'se abre el anclaje ANC-01',
    )
    await esperar(400)
    ok(
        (await texto()).includes('punto medial'),
        'el detalle dice cuál es la anomalía visible',
    )
    ok(
        await evaluar(`!!document.querySelector('[data-ver-grafo="ANC-01"]')`),
        'y ofrece ver el grafo de ese anclaje',
    )

    // --- 4b. La verificación a mano ------------------------------------------
    console.log('\n4b. La verificación a mano: sin fuente no se documenta')
    ok(
        await evaluar(`(() => {
            const b = document.querySelector('[data-opcion="ANC-01"] [data-accion="documentar"]');
            return !!b && b.disabled;
        })()`),
        'sin fuente el botón está cerrado: la regla es una puerta, no un aviso',
    )
    await evaluar(escribirEn('fuente-ANC-01', 'Libro de fábrica, fol. 42', 'input'))
    await esperar(400)
    ok(
        await evaluar(`(() => {
            const b = document.querySelector('[data-opcion="ANC-01"] [data-accion="documentar"]');
            return !!b && !b.disabled;
        })()`),
        'al anotar la fuente se abre',
    )
    await evaluar(`document.querySelector('[data-opcion="ANC-01"] [data-accion="documentar"]')?.click()`)
    await esperar(600)
    ok(
        (await texto()).includes('documentada · fuente: libro de fábrica'),
        'y la opción queda documentada con su fuente',
    )
    ok((await evaluar('document.body.innerText')).includes('1 doc'), 'el contador lo refleja')
    await evaluar(
        `document.querySelector('[data-opcion="ANC-01"] [data-accion="desdocumentar"]')?.click()`,
    )
    await esperar(500)
    ok((await texto()).includes('por verificar'), 'quitando la fuente vuelve a «por verificar»')

    // Descartar no borra: marca, y se puede recuperar.
    await evaluar(`document.querySelector('[data-descartar="ANC-01"]')?.click()`)
    await esperar(500)
    ok(
        !(await evaluar(`!!document.querySelector('[data-opcion="ANC-01"]')`)),
        'lo descartado desaparece de los pilares',
    )
    ok(
        await evaluar(`!!document.querySelector('[data-accion="recuperar"]')`),
        'pero no se borra: se puede recuperar',
    )
    await evaluar(`document.querySelector('[data-accion="recuperar"]')?.click()`)
    await esperar(500)
    ok(await evaluar(`!!document.querySelector('[data-opcion="ANC-01"]')`), 'y vuelve')

    // --- 5. Investigar sin clave lo dice -------------------------------------
    console.log('\n5. La investigación previa: sin clave lo dice')
    await evaluar(`document.querySelector('[data-accion="investigar"]')?.click()`)
    await esperar(900)
    ok(
        (await texto()).includes('falta la clave del motor'),
        'sin clave no finge que investiga: lo dice',
    )

    // --- 6. El grafo del anclaje, desde el final -----------------------------
    console.log('\n6. El material NO ensena grafos que no sean suyos')
    // Aqui se colaba el grafo de ejemplo del 4: el anclaje real se llamaba ANC-01
    // —el id que el prompt le sugiere al motor— y el lienzo ensenaba MI grafo
    // inventado como si fuera del disenador. Esta prueba impide que vuelva.
    await evaluar(`document.querySelector('[data-opcion="ANC-01"] button')?.click()`)
    await esperar(500)
    ok(
        await evaluar(`(() => {
            const b = document.querySelector('[data-ver-grafo="ANC-01"]');
            return !!b && b.disabled;
        })()`),
        'el anclaje dice «Sin grafo todavía»: no se le cuela un grafo ajeno',
    )
    ok(
        !(await texto()).includes('no-ser'),
        'y el grafo de ejemplo (el averroísmo) no aparece por ninguna parte',
    )
    ok(
        !(await evaluar(`!!document.querySelector('[data-node-id]')`)),
        'el lienzo sigue vacío: nada se ha desplegado solo',
    )

    console.log('\n7. El material no se mezcla entre catedrales')
    ok(await evaluar(clicPorTexto('Catedral de Valencia')), 'se reabre la pregunta 0')
    await esperarA('!!document.querySelector("#catedral-nueva")', { descripcion: 'el campo de alta' })
    await evaluar(escribirEn('catedral-nueva', 'Catedral de Toledo', 'input'))
    await esperar(300)
    await evaluar(`document.querySelector('[data-accion="agregar-catedral"]')?.click()`)
    await esperar(900)
    ok(
        (await evaluar('document.body.innerText')).includes('Catedral de Toledo'),
        'Toledo queda como premisa',
    )
    ok(
        (await evaluar(`document.querySelectorAll('[data-opcion]').length`)) === 0,
        'y no hereda el material de Valencia',
    )
    ok(
        (await texto()).includes('todavía no hay'),
        'sino que dice que todavía no hay material sobre la mesa',
    )

    // --- 8. Persistencia ----------------------------------------------------
    console.log('\n8. La premisa y el material sobreviven la recarga')
    const guardado = await evaluar(`localStorage.getItem('gameflow:v1:material') || ''`)
    ok(
        guardado.includes('ANC-01') && guardado.includes('"catedralId":"valencia"'),
        'el material quedó guardado y atado a su catedral',
    )
    await enviar('Page.navigate', { url: URL_APP }, sessionId)
    await esperarA('!!document.querySelector("[data-accion=\\"catedral\\"]")', { descripcion: 'la barra' })
    await esperar(900)
    ok(
        !(await evaluar(`!!document.querySelector('[data-catedral]')`)),
        'tras recargar no vuelve a preguntar: la premisa está fijada',
    )
    ok(
        (await evaluar('document.body.innerText')).includes('Catedral de Toledo'),
        'la catedral elegida sobrevive la recarga',
    )

    // --- 9. Conectar una IA: Google AI Studio y Kimi K3 ----------------------
    console.log('\n9. Ajustes del motor: Google AI Studio (API nativa) y Kimi K3')
    ok(await evaluar(clicPorTexto('Ajustes')), 'se abren los Ajustes')
    await esperarA('!!document.querySelector(\'[data-accion="probar-motor"]\')', {
        descripcion: 'el panel del motor',
    })
    ok(await evaluar(clicPorTexto('Google AI Studio')), 'se elige el preset de Google AI Studio')
    await esperar(600)
    ok(
        (await texto()).includes('api nativa de gemini'),
        'dice que va por la API nativa, no por la capa compatible con OpenAI',
    )
    ok(
        (await texto()).includes('no hay base url'),
        'y que no hay Base URL que configurar: la dirección es de Google',
    )
    ok(
        !(await evaluar(
            `[...document.querySelectorAll('input')].some(i => i.value.toLowerCase().includes('openai'))`,
        )),
        'no queda ninguna URL de OpenAI de por medio',
    )
    ok(
        (await texto()).includes('no hay que elegir modelo'),
        'y avisa de que NO hay que elegir modelo: la herramienta usa el que tu clave tenga',
    )
    ok(
        !(await evaluar(
            `[...document.querySelectorAll('input')].some(i => (i.value || '').startsWith('gemini'))`,
        )),
        'no hay ningún campo de modelo antes de conectar',
    )
    ok(
        !(await evaluar(`!!document.getElementById('modelo-general')`)),
        'ni selector de modelo: solo la clave',
    )
    ok(
        (await evaluar(`document.querySelector('[data-accion="probar-motor"]')?.innerText`)) ===
            'Conectar',
        'el botón dice Conectar y nada más',
    )
    ok(
        (await texto()).includes('busca en google'),
        'y avisa de que esta API sí busca y cita las fuentes que consulta',
    )
    ok(
        await evaluar(`document.querySelector('[data-accion="probar-motor"]').disabled`),
        'sin clave, el botón de probar está cerrado',
    )

    ok(await evaluar(clicPorTexto('Moonshot')), 'se puede cambiar a Moonshot')
    await esperar(600)
    ok(
        await evaluar(
            `[...document.querySelectorAll('input')].some(i => i.value === 'https://api.moonshot.ai/v1')`,
        ),
        'y trae el endpoint real de Moonshot',
    )
    ok(
        await evaluar(`[...document.querySelectorAll('input')].some(i => i.value === 'kimi-k3')`),
        'y el modelo kimi-k3',
    )

    // --- 9b. Conectar de verdad, con la red simulada ------------------------
    console.log('\n9b. Conectar: el mensaje de éxito no se autodestruye')
    ok(await evaluar(clicPorTexto('Google AI Studio')), 'se vuelve al preset de Google')
    await esperar(600)
    // La red se simula DENTRO del navegador: asi se prueba el flujo entero sin
    // gastar una peticion real y sin necesitar una clave de verdad.
    await evaluar(`(() => {
        window.__fetchReal = window.fetch;
        window.fetch = async (url) => {
            const u = String(url);
            if (u.includes('/models?')) {
                return new Response(JSON.stringify({ models: [
                    { name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] },
                ] }), { status: 200 });
            }
            return new Response(JSON.stringify({ status: 'completed', steps: [
                { type: 'model_output', content: [{ type: 'text', text: 'ok' }] },
            ] }), { status: 200 });
        };
        return true;
    })()`)
    ok(
        await evaluar(`(() => {
            const campo = document.querySelector('input[type="password"]');
            if (!campo) return false;
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(campo, 'AQ.claveDePrueba');
            campo.dispatchEvent(new Event('input', { bubbles: true }));
            return true;
        })()`),
        'se escribe una clave (simulada)',
    )
    await esperar(400)
    await evaluar(`document.querySelector('[data-accion="probar-motor"]')?.click()`)
    ok(
        await esperarA('!!document.querySelector(\'[data-resultado-prueba="ok"]\')', {
            descripcion: 'el resultado de la conexion',
        }),
        'conectar da un resultado visible',
    )
    ok((await texto()).includes('conectado'), 'y dice claramente que ha conectado')

    // LA REGRESION, que es el fallo que se vio en pantalla: guardar los ajustes
    // al conectar cambiaba `settings` y borraba el mensaje en el acto.
    await esperar(1500)
    ok(
        await evaluar(`!!document.querySelector('[data-resultado-prueba="ok"]')`),
        'y el mensaje SIGUE ahí: guardar los ajustes ya no lo borra',
    )
    ok(
        (await evaluar(
            `(JSON.parse(localStorage.getItem('gameflow:v1:settings') || '{}').llm || {}).apiKey`,
        )) === 'AQ.claveDePrueba',
        'y la clave quedó guardada sola, sin pulsar Guardar',
    )
    await evaluar(`(() => { window.fetch = window.__fetchReal; return true })()`)

    // --- 10. Consola limpia -------------------------------------------------
    console.log('\n10. Consola del navegador')
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

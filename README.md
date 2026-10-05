# Academia · Rutas de aprendizaje en nodos

Plataforma de lecciones donde un **clasificador** interpreta lo que el alumno quiere aprender,
busca en el catálogo y devuelve una **ruta**. La ruta se convierte en un grafo de nodos que se
**despliega progresivamente**: cada clic en *ver continuación* revela el siguiente anillo de
lecciones y dibuja sus conexiones.

- Panel izquierdo: la caja de texto con el prompt.
- Centro: el lienzo de nodos con conexiones animadas (pan, zoom, encuadre).
- Panel derecho: la ruta clasificada, la lección activa y el catálogo.
- Modo **Play**: reproduce la ruta desplegando el grafo paso a paso.

---

## Arranque rapido

```bash
npm install
npm run dev      # http://localhost:5199
```

Sin configurar nada funciona: el **clasificador local** (recuperación léxica + cierre de
prerrequisitos) arma rutas reales contra el catálogo semilla de 28 lecciones. Para generar
lecciones nuevas que no existen en el catálogo, conecta un LLM (ver *Ajustes*).

```bash
npm run build    # genera dist/
npm run preview  # sirve dist/ para revisarlo
npm test         # pruebas de lógica (catálogo, rutas, layout, anti-alucinación)
npm run test:e2e # flujo completo en Chrome headless
```

---

## Arquitectura

```
src/
  domain/lesson.js          Modelo de lección + normalizacion + ficha de catalogo
  data/
    catalog.js              Merge semilla/generadas, aristas, recuperacion, estadisticas
    lessons/*.js            Catalogo semilla escrito a mano (5 materias)
  classifier/
    contract.js             Contrato de ruta + recuperacion + orden pedagogico
    localProvider.js        Clasificador sin red (respaldo y linea base)
    llmProvider.js          Prompt del sistema, cliente OpenAI-compatible, saneado
    index.js                Fachada: elige proveedor, recorta catalogo, cae a local
  graph/graphEngine.js      Despliegue progresivo + layout por capas + geometria
  hooks/useAcademy.js       Estado: catalogo, ruta, grafo, progreso, persistencia
  components/               UI (lienzo, nodos, conexiones, lector, paneles, ajustes)
scripts/                    smoke (logica), e2e y diagnostico (navegador), capturas
```

### El flujo, paso a paso

1. **Prompt** → `clasificar(texto)` en `useAcademy`.
2. **Seleccion de contexto**: si el catálogo supera `MAX_CARDS` (40), se recuperan por
   coincidencia léxica las fichas relevantes más sus prerrequisitos. Con cientos de lecciones
   no se manda el catálogo entero al modelo.
3. **Clasificacion**: el proveedor elegido devuelve `{ title, steps[], newLessons[] }`.
4. **Saneado** (`parseRouteResponse`): se descartan pasos con IDs inexistentes y bloques con
   tipo inválido. Es la defensa contra alucinaciones: un paso solo entra si existe en el catálogo
   o si viene acompañado de su lección nueva.
5. **Play** → `inicializarGrafo`: la ruta completa queda en cola, visible solo el primer nodo
   más su base.
6. **Ver continuación** → `desplegar`: revela la base pendiente, o el siguiente paso de la ruta,
   o una continuación del catálogo. Nunca quita nodos.
7. **Leer** → el lector marca la lección como cursada y ofrece continuar desde el propio lector.

### Reglas de diseño que conviene no romper

- **El grafo solo crece.** `desplegar` agrega y jamás elimina; `unirAristas` deduplica por id.
- **Nada depende del orden de llegada.** El layout es determinista: `capa(x) = 1 + max(capa de sus
  prerrequisitos visibles)`. Dagre se descartó justo por no ser reproducible al insertar nodos.
- **Todo prerrequisito queda a la izquierda de su dependiente.** Es una invariante probada en
  `scripts/smoke.mjs`.
- **El contexto del clasificador se recorta, no se recorta la ambición.** Si el catálogo crece,
  se mejora la recuperación, no se manda todo.

---

## El clasificador (JAV y cualquier LLM)

`createClassifier(settings)` elige proveedor según `mode`:

| mode    | Comportamiento                                                                 |
| ------- | ------------------------------------------------------------------------------ |
| `auto`  | LLM si hay API key → JAV si hay endpoint → local. Si el elegido falla, cae a local y lo reporta. |
| `llm`   | Fuerza un modelo compatible con la API de chat completions.                     |
| `jav`   | Fuerza el clasificador institucional por HTTP.                                  |
| `local` | Sin red: recuperación léxica y cierre de prerrequisitos.                        |

### Conectar un LLM (mientras JAV está fuera de servicio)

*Ajustes* → modo **LLM**, con presets para DeepSeek, OpenAI, Groq, Together y Ollama local.
Solo necesita un endpoint compatible con `POST {baseUrl}/chat/completions` y `response_format:
json_object`.

> **La API key se guarda en `localStorage` del navegador.** Para producción, apunta la *Base URL*
> a un proxy propio que guarde la clave en el servidor: así el navegador nunca la ve.

### Conectar JAV

*Ajustes* → modo **JAV** → endpoint. El contrato que espera la app:

```
POST {endpoint}
{ "prompt": "...",
  "catalogo": [ { id, title, subject, level, summary, tags, prereq, unlocks } ],
  "contexto": { "visibles": [...], "completadas": [...] } }
```

Respuesta (misma forma que la del LLM; `route`/`ruta` o el objeto directo):

```json
{
  "title": "...", "summary": "...", "subject": "mate", "rationale": "...", "estimatedMin": 90,
  "steps": [ { "order": 1, "lessonId": "mate-pitagoras", "role": "nucleo", "rationale": "..." } ],
  "newLessons": [ { "id": "...", "title": "...", "content": [ { "type": "markdown", "text": "..." } ] } ]
}
```

La app sanea esa respuesta igual que la de un LLM: IDs inexistentes se descartan.

---

## El catálogo de lecciones

Cada lección es un objeto normalizado (`src/domain/lesson.js`). Lo mínimo:

```js
{
  id: 'mate-pitagoras',        // slug estable y unico
  title: 'El teorema de Pitagoras',
  subject: 'mate',             // mate | codigo | fisica | datos | lengua
  level: 1,                    // 1 fundamentos, 2 intermedio, 3 avanzado
  durationMin: 22,
  summary: '...',              // lo que lee el clasificador
  objectives: ['...'],
  prereq: ['mate-potencias-raices'],   // dependencias duras: ordenan y bloquean
  unlocks: ['mate-semejanza-trigonometria'], // continuaciones sugeridas
  tags: ['geometria', '...'],
  skills: ['demostrar'],
  content: [ /* bloques */ ]
}
```

Bloques soportados: `markdown`, `formula` (`tex`), `codigo` (`lang`, `text`), `lista`, `nota`,
`aviso`, `datos` (tabla), `quiz`. El markdown ligero admite `**negrita**`, `*cursiva*`,
`` `codigo` ``, enlaces y LaTeX entre `$...$` o `$$...$$`.

**Para escalar a cientos de lecciones:** añade archivos en `src/data/lessons/` y agrégalos a
`src/data/catalog.js`. Cuando el catálogo crezca, la recuperación de `buildContext` es el punto
donde conviene pasar de coincidencia léxica a embeddings, sin tocar la UI ni el contrato.

---

## Pruebas

| Comando             | Qué verifica                                                                 |
| ------------------- | ---------------------------------------------------------------------------- |
| `npm test`          | Catálogo sin IDs duplicados, relaciones rotas ni ciclos; orden pedagógico real; despliegue progresivo; layout sin colisiones y estable; saneado anti-alucinación. |
| `npm run test:e2e`  | Flujo completo en Chrome headless por CDP: prompt → clasificar → Play → ver continuación → leer → marcar cursada → persistencia, con consola limpia. |
| `npm run diag`      | Abre la app y reporta excepciones y errores de consola (útil si algo queda en negro). |
| `npm run capturas`  | Genera `capturas/*.png` de cada pantalla para revisión visual.               |

Los scripts de navegador levantan su propia instancia de Chrome; requieren Chrome instalado y el
servidor de desarrollo corriendo en `http://localhost:5199`.

---

## Notas del entorno (Windows)

- `vite.config.js` usa `server.watch.usePolling`. El watcher nativo puede morir con
  `EBUSY ... .tmpdir\archivo.tmp` cuando el editor escribe archivos temporales dentro de `src/`.
  El sondeo evita ese fallo; el proyecto es pequeño y no cuesta nada.
- `root` apunta a `src/`, así que `src/index.html` es la plantilla y el bundle se inyecta solo.
- Las importaciones relativas llevan extensión (`./foo.js`) para que los módulos también
  funcionen con Node directo en las pruebas de lógica.

---

## Despliegue

`npm run build` genera `dist/` con rutas relativas (`base: './'`), así que sirve en cualquier
subcarpeta: GitHub Pages, Vercel, Netlify o un `nginx` propio. No hay backend obligatorio; el
único punto que requiere servidor es el proxy de la API key si conectas un LLM.

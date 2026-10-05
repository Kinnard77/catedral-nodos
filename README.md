# Catedral · Lienzo de Nodos

Canvas de nodos dinamicos que se **despliegan progresivamente**: cada clic en *ver continuación*
revela el siguiente anillo de nodos y dibuja sus conexiones.

Este repositorio nace como **clon de `academia-nodos`** (misma arquitectura, mismo motor de
grafo) para reutilizar la infraestructura con un **objetivo distinto**, todavía por definir.

- Panel izquierdo: caja de texto con el prompt.
- Centro: el **Lienzo de Nodos** — pan, zoom, encuadre automático, conexiones animadas.
- Panel derecho: resultado, nodo activo y catálogo.
- Modo **Play**: reproduce la ruta desplegando el grafo paso a paso.

> **Estado:** infraestructura heredada y funcionando. El objetivo nuevo **no está implementado
> todavía**: la app sigue comportándose como la Academia (clasificador de lecciones). La siguiente
> fase sustituye ese dominio por el de Catedral. Ver *Handoff* al final.

---

## Arranque rapido

```bash
npm install
npm run dev      # http://localhost:5199
```

Sin configurar nada ya funciona con el clasificador local y el catálogo semilla heredado.

```bash
npm run build     # dist/
npm run preview   # sirve dist/
npm test          # pruebas de lógica (catálogo, rutas, layout, anti-alucinación)
npm run test:e2e  # flujo completo en Chrome headless
npm run diag      # reporta excepciones de consola si algo queda en negro
npm run analizar  # imprime posiciones reales del layout (detecta colisiones)
```

---

## Arquitectura heredada

```
src/
  domain/lesson.js          Modelo de nodo + normalizacion + ficha resumida
  data/
    catalog.js              Merge semilla/generadas, aristas, recuperacion, estadisticas
    lessons/*.js            Catalogo semilla (5 materias)
  classifier/
    contract.js             Contrato del resultado + recuperacion + orden topologico
    localProvider.js        Clasificador sin red (respaldo y linea base)
    llmProvider.js          Prompt del sistema, cliente OpenAI-compatible, saneado
    index.js                Fachada: elige proveedor, recorta contexto, cae a local
  graph/graphEngine.js      Despliegue progresivo + layout por capas + geometria
  hooks/useAcademy.js       Estado: catalogo, ruta, grafo, progreso, persistencia
  components/               UI (lienzo, nodos, conexiones, lector, paneles, ajustes)
scripts/                    smoke, e2e, diagnostico, capturas, analisis de layout
```

### Piezas reutilizables tal cual (lo valioso del clon)

Estas tres no dependen del dominio "lecciones" y son el motivo de clonar en vez de empezar de cero:

1. **Motor de despliegue progresivo** — `src/graph/graphEngine.js`
   `desplegar()` revela un lote por clic (base pendiente → siguiente paso → continuación), nunca
   quita nodos, y reporta un motivo legible.
2. **Layout por capas determinista** — mismo archivo.
   `capa(x) = 1 + max(capa de sus predecesores visibles)`, con envolvimiento en sub-columnas según
   el alto real del lienzo y asignación de casillas libre de colisiones. Es reproducible: no
   depende del orden en que llegan los nodos (por eso se descartó dagre).
3. **Fachada de clasificador intercambiable** — `src/classifier/index.js`
   Modos `auto | llm | jav | local`, recorte de contexto por recuperación y saneado de la respuesta
   contra el catálogo real (anti-alucinación).

### Invariantes que conviene no romper

- **El grafo solo crece.** `desplegar` agrega y jamás elimina; las aristas se deduplican por id.
- **Nada depende del orden de llegada.** El layout es determinista; hay prueba de ello.
- **Todo predecesor queda a la izquierda de su dependiente.** Invariante probada en `npm test`.

---

## Handoff para la siguiente fase

El objetivo nuevo de Catedral todavía no está definido. Lo que hay que saber para continuar:

**Lo que cambia** (dominio): de "lecciones con prerrequisitos" a lo que Catedral necesite.
En la práctica esto toca tres puntos y ninguno más:

| Qué                                                  | Dónde                                              |
| ---------------------------------------------------- | -------------------------------------------------- |
| El modelo del nodo (campos, tipos, relaciones)        | `src/domain/lesson.js` + `src/data/catalog.js`      |
| De dónde salen los nodos (catálogo fijo, API, archivo)| `src/data/` y `src/classifier/index.js`             |
| El texto de la UI (hoy dice "lección", "alumno")      | `src/components/`                                   |

**Lo que NO hay que tocar** si el nuevo dominio sigue siendo un grafo dirigido que crece: el motor
de despliegue, el layout, el lienzo (pan/zoom/encuadre), el lector de contenido y las conexiones.

**Riesgo a vigilar:** el layout da por hecho un grafo **acíclico**. Si el dominio de Catedral
admite ciclos, `calcularLayout` los rompe (límite de saltos) y `pedagogicalSort` los tolera, pero
las conexiones de retroceso se dibujan rodeando por arriba o por abajo. Conviene decidirlo pronto.

---

## Notas del entorno (Windows)

- `vite.config.js` usa `server.watch.usePolling`. El watcher nativo puede morir con
  `EBUSY ... .tmpdir\archivo.tmp` cuando el editor escribe temporales dentro de `src/`.
- `root` apunta a `src/`, así que `src/index.html` es la plantilla y el bundle se inyecta solo.
- Las importaciones relativas llevan extensión (`./foo.js`) para que los módulos funcionen también
  con Node directo en las pruebas de lógica.

## Despliegue

`npm run build` genera `dist/` con rutas relativas (`base: './'`), así que sirve en cualquier
subcarpeta o dominio estático. No hay backend obligatorio.

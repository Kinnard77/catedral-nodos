# Catedral · Gameflow de catedrales

Lienzo de nodos para **diseñar gameflows de catedrales**. No es una app para el jugador:
es la herramienta donde se decide el juego antes de construirlo.

El método es un **Puzzle Dependency Chart** (PDC) y se trabaja **hacia atrás desde el
final**: primero se fija el final del juego — qué queremos que el jugador sienta y
descubra — y desde ahí se pregunta qué tiene que estar resuelto antes. El lienzo abre con
una sola pieza y cada clic en *ver continuación* revela lo que hace falta antes, dibujando
la dependencia.

> **El método completo está en [`NARRATIVA.md`](NARRATIVA.md)** — las dos fases, las cuatro
> columnas, las reglas y las cinco piezas del desenlace. Este README solo cuenta cómo se
> arranca y cómo está montado el código.

> **Lo primero es la trama, no los puzles.** El PDC ordena **cómo** se llega al final; la
> historia decide **por qué** existe cada paso. Un objeto nunca es la meta: «no es buscar un
> escudo porque sí, ¿qué sentido tiene en la historia?». El juego se vive como una audioguía
> con enigmas dentro de la catedral, y la referencia de tono es *El Código Da Vinci*. Ver
> [`DECISIONES.md`](DECISIONES.md) §7.

**Pero antes del final va la premisa.** El lienzo no pregunta qué queremos que descubra el
jugador: pregunta **en qué catedral vamos a trabajar**. La catedral es lo que decide qué
misterios existen — no se puede descubrir el Santo Grial en Sevilla porque está en
Valencia — así que esa elección es la raíz de todo el diseño.

- Panel izquierdo: la **intención de diseño** (bloqueada hasta que haya catedral y misterios).
- Centro: el **Lienzo de gameflow** — pan, zoom, encuadre automático, conexiones animadas.
- Panel derecho: la secuencia del gameflow, el nodo activo y las piezas del catálogo.

### Cómo se diseña

El método es un **Puzzle Dependency Chart**, y va **del final hacia atrás**. Las decisiones
tomadas están en [`DECISIONES.md`](DECISIONES.md); este es el flujo:

0. El lienzo abre con **la pregunta 0: ¿en qué catedral vamos a trabajar?** La catedral es el
   **escenario real** donde se juega y, a la vez, lo que decide qué misterios existen. No se
   puede seguir sin ella.
1. **Se pone el material sobre la mesa**: los elementos de esa catedral, separando lo **real**
   —con la fuente que lo sostiene— de lo que nos **inventamos o modificamos**. Primero qué
   tenemos; después, qué misterio podemos inducir con ello.
2. **El motor propone misterios** a partir del material. Cada candidato dice **en qué elementos
   se apoya**, y el que no se apoya en nada se cae antes de llegar a la lista. Tú eliges. Necesita
   una clave de API en Ajustes: el motor local no sabe inventar, y lo dice en vez de fingirlo.
3. Pulsa *ver continuación* para revelar **lo que hace falta antes** del final.
4. Cuando falte algo que el catálogo no tiene, pulsa **＋ Añadir lo que hace falta antes** sobre
   cualquier nodo: describes la pieza, eliges su tipo y su concreción, y queda enlazada como
   prerrequisito suyo. La pieza nueva pasa a ser la activa, así que volver a pulsar el botón
   sigue bajando un nivel.
5. Todo lo que añades se guarda en el navegador y **sobrevive la recarga**.

> **Origen:** este repositorio nace como clon de `academia-nodos` para reutilizar su motor de
> grafo con un objetivo distinto. El repo de Academia es independiente y **no se toca**: son
> carpetas separadas, repos separados y `node_modules` separados.

---

## Arranque rápido

```bash
npm install
npm run dev      # http://localhost:5199
```

Sin configurar nada ya funciona con el motor local y el gameflow semilla de la
Catedral de Dolores Hidalgo.

```bash
npm run build      # dist/
npm run preview    # sirve dist/
npm test           # lógica: catálogo, diseño inverso, despliegue hacia atrás, layout, anti-alucinación
npm run test:e2e   # flujo completo en Chrome headless
npm run diag       # reporta excepciones de consola si algo queda en negro
npm run capturas   # capturas del flujo a capturas/
npm run analizar   # imprime posiciones reales del layout (detecta colisiones)
```

---

## El modelo

Una **pieza de diseño** es la unidad catalogable. Un **nodo** del grafo es su proyección
visual dentro del gameflow. En `src/domain/lesson.js`:

| Campo | Significado |
| --- | --- |
| `subject` | Tipo de pieza: `final`, `revelacion`, `emocion`, `mecanica`, `lugar`, `pista` |
| `level` | Escalera de concreción: `1` Intención → `2` Mecánica → `3` Escena |
| `prereq` | Lo que tiene que estar resuelto **antes** de esta pieza |
| `ancla` | `true` solo en la raíz del diseño: **el final del juego** |

> Los campos siguen llamándose `subject` y `level` (y las funciones `subjectOf` / `levelOf`)
> porque renombrarlos tocaría a la vez el motor, el clasificador y todos los componentes. Lo
> que cambió es su **significado**, documentado arriba, y todas las etiquetas visibles.

### Cómo se despliega hacia atrás

El ancla es el punto de partida del lienzo, no su meta. Al abrir, el grafo muestra **una sola
pieza**: el final. Pulsar *ver continuación* revela sus prerrequisitos; pulsar uno de ellos
revela los suyos. El recorrido es la clausura de prerrequisitos del final, en orden inverso.

En la ruta, el dependiente aparece **antes** que sus prerrequisitos (`ordenDeDiseno` en
`src/classifier/contract.js`), que es justo lo contrario del orden pedagógico de Academia.

El layout sigue siendo el heredado: `capa(x) = 1 + max(capa de sus prerrequisitos)`. Como
consecuencia, **el final queda siempre en el nodo más a la derecha** y el diseño crece hacia
la izquierda. La lectura izquierda→derecha es el orden de juego; el orden de trabajo es el
contrario.

---

## Arquitectura

```
src/
  domain/lesson.js          Modelo de pieza + tipos + escalera de concreción
  data/
    catedrales.js           La premisa: las catedrales que da el diseñador (misterios vacíos)
    gameflow/catedral-dolores.js   Semilla CONGELADA y pendiente de sustituir (ver Estado)
    catalog.js              Merge semilla/generadas + enlaces de diseño, aristas, recuperación, ancla
  classifier/
    contract.js             Contrato de ruta + recuperación + orden de diseño inverso
    localProvider.js        Motor local: arranca por el final y sube por los prerrequisitos
    llmProvider.js          Prompt del sistema (diseño inverso), cliente OpenAI-compatible, saneado
    index.js                Fachada: elige proveedor, recorta contexto, cae a local
  graph/graphEngine.js      Despliegue progresivo hacia atrás + layout por capas + geometría
  hooks/useAcademy.js       Estado: catálogo, ruta, grafo, progreso, persistencia
  components/               UI (lienzo, nodos, conexiones, lector, ElegirCatedral, NuevaPieza, paneles, ajustes)
scripts/                    smoke, e2e, diagnóstico, capturas, análisis de layout
```

### Piezas heredadas que no dependen del dominio

1. **Motor de despliegue progresivo** — `src/graph/graphEngine.js`. `desplegar()` revela un
   lote por clic, nunca quita nodos y reporta un motivo legible.
2. **Layout por capas determinista** — mismo archivo. Reproducible: no depende del orden en
   que llegan los nodos (por eso se descartó dagre).
3. **Fachada de motor intercambiable** — `src/classifier/index.js`. Modos
   `auto | llm | jav | local`, recorte de contexto y saneado contra el catálogo real.

### Invariantes que conviene no romper

- **El grafo solo crece.** `desplegar` agrega y jamás elimina; las aristas se deduplican por id.
- **Nada depende del orden de llegada.** El layout es determinista; hay prueba de ello.
- **Todo prerrequisito queda a la izquierda de su dependiente.**
- **El final es el nodo más a la derecha** y es el paso 1 de la ruta.
- **Toda pieza es ancestro del ancla.** Una pieza que no cuelga del final es una isla que el
  diseño inverso nunca va a revelar; `npm test` lo comprueba.

Todas se verifican en `npm test`.

---

## Estado

El **paso 0** y **el paso 1** están construidos: el lienzo abre preguntando la catedral, y con la
catedral elegida se pone encima de la mesa el material con el que se diseña. Lo que hay:

- El clon está rebautizado y se comporta como herramienta de diseño, no como academia.
- **El nodo Catedral** con las catedrales que dio el diseñador (Sevilla, Valencia, Burgos,
  Zaragoza, Notre Dame, Estrasburgo, Chartres y Ciudad de México), ampliable desde el lienzo.
- **La ficha de elementos**: para la catedral elegida se recoge qué hay, con 9 categorías que
  traen **la pregunta** que ayuda a acordarse (arquitectura, arte, sepulcro, personaje, documento,
  marca, reliquia, leyenda, otro).
- **Un elemento real no se guarda sin fuente.** Es la regla del Grial hecha código: lo que
  afirmamos tiene que poder sostenerse, y si no se sostiene se declara como inventado o
  modificado — que también es una decisión legítima. `npm test` lo comprueba.
- **Los textos se guardan por idioma** (`textos.es`) aunque hoy solo se escriba en español,
  porque con ~50 catedrales y cinco idiomas cambiarlo después sería rehacer el contenido.
- **El motor propone misterios** a partir del material, y el diseñador elige. Un misterio que no
  se apoye en elementos reales de la mesa se descarta, y los ids que el motor se invente se
  cuentan y se reportan. `npm test` lo comprueba con una respuesta simulada.
- El motor de despliegue, el layout, el lector y la autoría de piezas hacia atrás siguen ahí,
  pero **no son alcanzables hasta que exista un misterio**. El lienzo no finge que se pueda
  desplegar: dice en qué punto está el diseño.

### Deuda reconocida

El agente construyó antes de tiempo un final inventado (*«el jugador descubre que él es el
siguiente cantero»*) y 12 piezas de la **Catedral de Dolores Hidalgo**, que **no está en la
lista del diseñador**. Ese contenido no es una decisión suya: queda congelado y se sustituye
en el paso 1, cuando se elija el misterio de verdad. Como consecuencia, las pruebas
end-to-end del despliegue y de la autoría están **aparcadas**; su lógica sigue cubierta sin
navegador en `npm test`.

### Cómo se guardan los añadidos

Los enlaces creados a mano viven en `gameflow:v1:enlaces` como `{ idDelPadre: [idsQueVanAntes] }`,
y `aplicarEnlaces()` los cose al catálogo al construirlo. Así se puede insertar una pieza antes de
una pieza **de la semilla** sin mutarla: la semilla es inmutable y el motor no sabe que esos
prerrequisitos son añadidos — solo lee `prereq`.

Lo que falta, en orden de valor:

1. **El paso 1: recopilar los misterios de la catedral elegida**, cada uno con la fuente que
   justifique por qué pertenece a esa catedral. Es lo que desbloquea el resto del flujo.
2. **Etiquetar las aristas del PDC** con lo que te llevas (la llave, el papel, la linterna) y
   sustituir los tipos de nodo actuales por vocabulario de puzle. Ver `DECISIONES.md`.
3. **Editar lo que ya existe.** Hoy se pueden **añadir** piezas, pero no corregir una pieza,
   borrarla ni reconectar una relación ya declarada.
4. **El análisis del PDC**: ramificación no lineal, grado de entrada y salida, y el grafo de
   ancestros para que los diálogos no mencionen lo que el jugador aún no sabe.
5. **Exportar el gameflow.** Volcar el grafo a JSON para Supabase / Godot en vez de dejarlo
   encerrado en la app y en el navegador de una sola máquina.
6. **Decidir si hay ciclos.** El layout da por hecho un grafo acíclico. Si el diseño admite
   bucles, `calcularLayout` los rompe (límite de saltos) y las conexiones de retroceso se
   dibujan rodeando. Conviene decidirlo pronto.

---

## Notas del entorno (Windows)

- `vite.config.js` usa `server.watch.usePolling`. El watcher nativo puede morir con
  `EBUSY ... .tmpdir\archivo.tmp` cuando el editor escribe temporales dentro de `src/`.
- `root` apunta a `src/`, así que `src/index.html` es la plantilla y el bundle se inyecta solo.
- Las importaciones relativas llevan extensión (`./foo.js`) para que los módulos funcionen
  también con Node directo en las pruebas de lógica.

## Despliegue

`npm run build` genera `dist/` con rutas relativas (`base: './'`), así que sirve en cualquier
subcarpeta o dominio estático. No hay backend obligatorio.

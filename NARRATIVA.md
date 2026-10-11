# NARRATIVA — el método de la Fase 1

Este documento existe para que **no haya que volver a empezar**. Reúne, en un solo sitio, lo
que se ha ido decidiendo en conversación: el método, las cuatro columnas, las reglas que
mandan, y qué falta por construir. Si algo aquí contradice a otro documento, **manda este**.

Los otros tres documentos siguen siendo válidos para lo suyo:

- [`ESTADO.md`](ESTADO.md) — el mapa de la herramienta: qué hay construido y qué no.
- [`DECISIONES.md`](DECISIONES.md) — el registro ronda por ronda, con la historia de por qué
  se decidió cada cosa.
- [`README.md`](README.md) — cómo se arranca y cómo está montado el código.
- [`PDC.md`](PDC.md) — **el análisis del grafo**: los ejes que faltan, la regla del final, el
  arrastre de cada nodo y las cuatro condiciones de integridad.
- [`MANUAL.md`](MANUAL.md) — **cómo se opera el panel, paso a paso**, con lo que hay que ver en
  cada paso para saber que se avanza.
- [`REVISION.md`](REVISION.md) — qué tiene y qué le falta a la herramienta, leído del código.

---

## 1. Qué es el producto

**Una aventura de investigación con trama**, para dar otro sentido a la visita de una
catedral **siendo turista real**. No es una audioguía: es lo que hace que el turista **vea y
entienda cosas que sin el juego no vería**.

- Se juega **en el móvil, dentro de la catedral**, y el juego comprueba que estás allí.
- Las referencias de tono son ***El Código Da Vinci*** —interpretación artística de lo real,
  personajes, y un «¿será verdad?» final que **nunca se confirma**— y ***El nombre de la rosa***,
  de Umberto Eco: el misterio que se resuelve **leyendo signos**, y un desenlace que es una
  relectura de lo que ya estaba a la vista.
- **No es una cadena de puzles y acertijos.** Los puzles existen para contar el final.
- **Lo primero es la trama**: la historia, los personajes y el misterio. Sin ellos no hay
  emoción.
- El jugador es **un turista real al que la trama convierte en investigador de última hora**.
- El recorrido **no es negociable**: si el turista no va a donde el juego le propone, se está
  perdiendo la historia. El jugador elige **el orden, nunca el destino**.

Escala: **~50 catedrales, ~50 juegos**, con una **plantilla común** (estructura de fases,
mecánicas fijas, arco narrativo y el mismo tipo de final) y **contenido distinto** en cada una.

---

## 2. Las dos fases

| Fase | Qué produce | Estado |
| --- | --- | --- |
| **1** | **El desenlace.** Se investiga todo lo necesario para definirlo. | **Ahora** |
| **2** | **Cómo conseguirlo**: los puzles y los dilemas, y la app del jugador. | Después |

**La herramienta NO pregunta el final: lo DISEÑA.** No se le pide al diseñador que diga el
desenlace — se le pide que **elija entre candidatos que salen del material**, y se investiga
lo necesario para que esos candidatos existan. El diseñador de la Fase 2 **todavía no sabe qué
misterio conviene**, y eso es exactamente lo que la Fase 1 resuelve.

**Esto ya está construido a medias**: `src/domain/misterio.js` funciona así — el motor propone
candidatos a partir del material y el diseñador elige.

---

## 3. Las CUATRO COLUMNAS (o pilares)

Están en `src/domain/material.js:23-52`. **No son un índice temático: son el método de
investigación y la forma del misterio a la vez.** Cada columna es una familia de material y
una pregunta de mapeo.

| # | Columna | Pregunta de mapeo (literal del código) | Qué aporta a un misterio |
| --- | --- | --- | --- |
| 1 | **Anclaje en lo visible** | *¿Qué hay a la vista y al alcance del público?* Lajas sepulcrales, filacterias en pórticos, mensarios, zodiacos, atributos de santos… | **Lo que el turista YA VE.** Es lo que se relee al final |
| 2 | **Apócrifo convincente** | *¿Qué se puede sostener con fuentes eclesiásticas o notariales, y qué deducción oculta se le puede colgar?* Bulas censuradas, cláusulas suprimidas, minutas capitulares… | **El dato que se descubre.** Lo que estaba escrito y pasó desapercibido |
| 3 | **Dualidad de gremios** | *¿Dónde choca la autoridad que impone el dogma con los artífices que labran la materia?* Cabildo contra canteros, lapicidas y orfebres. | **Quién tenía motivo** para dejarlo escrito o para borrarlo. Da el conflicto y los personajes |
| 4 | **Secreto sin magia** | *¿Qué herejía filosófica o ruptura escolástica se puede plantear?* Nada sobrenatural: proposición ontológica, física o política. | **La conclusión.** La herejía. Es el final del diseño |

### Por qué funcionan: las columnas SON la derivación

Ésta es la idea que lo cierra todo, y responde a la pregunta que quedó abierta en
`DECISIONES.md` (¿son el orden de diseño o el de la experiencia?):

> **Las cuatro columnas, leídas 4 → 1, son el camino de la derivación. Leídas 1 → 4, son las
> piezas del desenlace y el recorrido del jugador.**

- Se **deriva** desde el **Secreto sin magia** hacia atrás: qué apócrifo lo sostiene → de qué
  conflicto de gremios nace → **sobre qué pieza visible se puede leer**. El ancla visible es
  **lo último que se diseña**, y por eso el lienzo abre por el núcleo filosófico y camina hacia
  atrás hasta la piedra.
- Se **juega** al revés: el turista ve la pieza (1), encuentra lo escrito (2), descubre el
  conflicto (3) y concluye la herejía (4) — y entonces **vuelve a mirar la pieza del principio**.

**El desenlace es una RELECTURA, no un objeto.** El clímax es que el jugador diga *«!!! ahhhh,
ya entendí, lo teníamos enfrente y no lo vimos»*. El mecanismo no es encontrar nada nuevo: es
que **lo que ya estaba a la vista pase a significar otra cosa**. Por eso el ancla visible y el
final del diseño son **la misma pieza**.

**Ése es el criterio de éxito de la Fase 1.** Si el jugador no tiene ese momento, el final está
mal diseñado.

### Corolario: por qué las columnas producen una herejía coherente

Las columnas no son una lista de ocurrencias: son una **cadena de motivación**. La 1 es lo que
se puede señalar, la 2 lo que alguien escribió, la 3 quién tenía interés en escribirlo o en
borrarlo, y la 4 la conclusión. Un misterio que recorre las cuatro **no se puede inventar**:
se deduce. Y de ahí sale el «¿será verdad?», que solo funciona si lo que sostiene la historia
es material real con fuente.

---

## 4. El reparto 80/20

| Parte | Qué es | Para qué sirve |
| --- | --- | --- |
| **El 80%** | El material real de la catedral, recogido por la investigación y **verificado a mano** con fuente | **Que la historia construida parezca verdadera.** Es el suelo |
| **El 20%** | Lo que deducimos encima | **El toque épico y misterioso**, y la conclusión |

- **No somos historiadores** y no pretendemos tenerlo todo documentado. Se documenta
  **solo el 80%, y solo lo que sostiene las cuatro columnas**.
- **La fuente es obligatoria**: si marcas algo como real, la herramienta **no te deja
  guardarlo** sin anotar de dónde sale. Sin fuente se queda en `por_verificar`.
- **La IA propone, el diseñador confirma.** Todo lo que sale de una investigación entra como
  candidato; solo una mano humana, con una fuente delante, lo pasa a `documentado`.
- **Los temas tienen que ser atractivos comercialmente.** No se sacan temas aburridos: es un
  producto que tiene que tener éxito.

---

## 5. Las reglas que mandan

### 5.1 Las dos puertas de todo objeto y toda afirmación

| Puerta | Pregunta | Si falla |
| --- | --- | --- |
| **La trama** | ¿Hace falta **en la historia**? | Es relleno: no entra |
| **La catedral** | ¿Puede estar **ahí**, con fuente? | Es una invención mal puesta: no entra |

> *No podemos jugar a encontrar el Santo Cáliz en la catedral de Burgos, porque ahí no está el
> Santo Cáliz.*

**Hay inventario, y es legítimo.** Si la trama necesita una espada, **entra la espada**. Lo
que no entra es una espada que la trama no pide. Un objeto **sí puede ser una meta intermedia**
(«necesito la espada»); **lo que no puede ser es el final**, porque el final es la relectura.

### 5.2 La regla de entrada de un nodo

> **Un nodo entra si puedes decir en una frase qué papel juega en la trama.** Si no puedes, no
> es un puzle: es relleno.

### 5.3 La regla del desenlace

> **No se puede cerrar el desenlace sin decir qué pieza visible se relee.**

Es comprobable, y es lo que garantiza el «lo teníamos enfrente y no lo vimos». La pieza no hay
que inventarla: **está en la mesa**, porque el material tiene el anclaje visible como clase de
opción.

---

## 6. La forma de la trama

- **La trama es lineal**: una sola secuencia obligatoria de hechos, con personajes, en un
  orden. Nadie elige un final distinto.
- **Los puzles son paralelos**: varios abiertos a la vez, y el jugador elige en cuál trabaja.
- **El cuello de botella del diamante no es un puzle: es un hecho de la trama.** Los puzles son
  la expansión; el hecho narrativo es la contracción. Así hay no linealidad **para que el
  jugador no se atasque**, y el hilo conductor **no se rompe nunca**.

| | Qué es | Cómo se comporta |
| --- | --- | --- |
| **Hecho de trama** | Un momento de la historia, con personajes | Obligatorio y en orden, un solo camino |
| **Puzle** | Una investigación sobre la catedral | Varios a la vez, el jugador elige el orden |

### La mecánica del juego (para la Fase 2)

Es **ambas**, como un videojuego de escape room:

1. **Deducir** — objetos reales y objetos inventados, **dentro del contexto de la catedral y de
   la trama**.
2. **Recoger objetos (inventario)** — útiles para resolver puzles.

La app del jugador es **Godot 4.7**, para móvil, con **look and feel de videojuego**. No es
esta herramienta. Se comparte cuando se llegue a la Fase 2.

---

## 7. El desenlace: LAS CINCO PIEZAS

| Pieza | Qué es en la práctica | Estado |
| --- | --- | --- |
| **1. Lo que descubre** | La verdad que se revela al releer | **Ya existe**: es `descubrimiento` en `domain/misterio.js` |
| **2. Lo que se relee** | **Una pieza que el turista ya vio al entrar.** Sale del material, columna 1 | **FALTA**: es el campo que hay que añadir |
| **3. Cambio de mirada** | Qué pasa a significar. Es el «!!! ahhhh» y el «¿será verdad?» | **Ya existe**: es `duda` en `domain/misterio.js` |
| **4. Cierre** | La sensación final: épica y misteriosa | Prosa, sin campo todavía |
| **5. Transformación** | El turista acaba investigando | Prosa, sin campo todavía |

**Dos de las cinco ya existen y están en el módulo correcto.** La Fase 1 no hay que inventarla:
hay que **enchufarla**.

### Criterio de terminado de la Fase 1

La Fase 1 ha terminado cuando la herramienta ha producido estas cinco cosas:

1. **El desenlace**, con sus cinco piezas.
2. **La secuencia de la trama**: los hechos en orden, con sus personajes.
3. **La lista de qué es relectura y qué es nuevo**: separar lo que ya estaba a la vista de lo
   que se añade. De esa separación depende el «lo teníamos enfrente».
4. **El material documentado que lo sostiene**, atado al material real de esa catedral.
5. **Nada sin justificar**: todo pasa las dos puertas.

Si falta cualquiera de las cinco, no se pasa a la Fase 2.

---

## 8. Dónde está la herramienta hoy (verificado en código)

### Lo que YA funciona

- **El material** y su panel por las cuatro columnas.
- **La regla de la fuente cableada**: `documentar()` exige fuente (`material.js:173-188`) y el
  saneado degrada `documentado` → `por_verificar` si no la hay (`:103-127`).
- **El misterio** como candidato sostenido por material real, con `descubrimiento`, `duda`,
  `encaje` y `sostienen[]`. Un misterio sin material que lo aguante **se cae**
  (`misterio.js:29-55`).
- **El grafo que abre por el final**: `findAncla` → `ordenDeDiseno` invertido →
  `inicializarGrafo` abre con un solo nodo, el final, y cada clic revela lo que hace falta
  antes (`graphEngine.js:141-168`, `:57-131`).
- **El layout** deja el final en la columna más a la derecha.
- **Las tres condiciones de integridad del GN-IEC**: ruta dual, anti-fantasía y epigrafía real
  (`gniec.js:171-256`).

### Lo que NO existe

- **Ningún campo de trama, personajes, conflicto o arco.** Ni una entidad personaje. La trama
  **no vive en el modelo**, solo en conversación. `personaje` es solo una categoría de material
  (`elemento.js:72-75`).
- **El campo «lo que se relee»** (pieza 2 del desenlace).
- **La secuencia de la trama** con sus hechos.
- **El puente entre el misterio y el lienzo.**

### Averías y callejones sin salida (encontrados ejecutando)

1. **El contador «EL GRAFO» miente.** Muestra 6 nodos con el lienzo vacío: cuenta el **grafo de
   ejemplo** de la especificación, no el del diseñador. El bloque está fuera del condicional de
   catedral (`PromptPanel.jsx:220-248`).
2. **Sin material no se puede abrir ningún grafo.** El botón vive dentro de la tarjeta de una
   opción y solo aparece para opciones de clase anclaje. Y conseguir material **exige la clave
   de Google**: sin ella, «Investigar esta catedral» lanza.
3. **La fase del misterio está muerta.** `elegirMisterio` (`useAcademy.js:616-639`) **no lo
   llama ningún componente montado**. Es un callejón sin salida en la interfaz.
4. **El prompt de diseño inverso es inalcanzable.** `enviarPrompt`/`clasificar` no se pasan a
   ningún componente, así que `ruta` queda `null`.
5. **El final de hoy es un final de puzle.** El ancla es `PHIL-01`, un Núcleo filosófico, con
   campos de herejía (`apocryphal_thesis`, `formulable_como`) y **sin personajes, sin emoción
   y sin transformación**. Es lo contrario de lo que se ha decidido.
6. **Las capturas de la documentación no sirven.** Cinco de las siete (`02` a `06`) son **byte
   a byte el mismo archivo**. Y `npm run capturas` **falla en silencio**: espera `[data-opcion]`,
   da timeout a los 20 s y captura igual, saliendo con **código 0**.

### El desajuste de vocabulario

`lesson.js:20` y `README.md:83` documentan `subject` como
`final | revelacion | emocion | mecanica | lugar | pista`, pero **esas claves ya no existen** en
`SUBJECTS` (`lesson.js:58-74`): `normalizeLesson` las colapsa a `umbra` (`:114`). Los tipos
reales son las **Cuatro Columnas** del GDD (`arte`, `religion`, `ciencia`, `filosofia`) y las
**clases de nodo del GN-IEC** (`anchor`, `red_herring`, `epigraphy`, `calambur`, `divergence`,
`philosophical`). Hay que decidir cuál manda o si conviven los dos ejes.

---

## 9. Qué hay que construir, en orden

> **Ver [`PDC.md`](PDC.md) §9.** El análisis del grafo añade **dos puntos baratos** —validar que
> el ancla es un nodo `info`, y añadir el eje funcional al modelo— y propone **enchufar la
> herramienta de validación que ya existe**. Con ellos el lienzo pasa de «algo que hay que mirar»
> a «algo que se puede comprobar».

1. **El campo «lo que se relee»** en el misterio, elegido del material (columna 1), con la
   puerta que **impide cerrar el desenlace sin él**.
2. **La secuencia de la trama**: los hechos de la historia en orden, con sus personajes. Hoy no
   existe ni la entidad.
3. **El puente misterio → lienzo**, para que el desenlace deje de ser un callejón sin salida.
4. **Separar relectura de novedad** en el material, que es lo que sostiene el «lo teníamos
   enfrente».
5. **Arreglar el contador** y las capturas, para no confundir el grafo de ejemplo con el del
   diseñador.

El orden importa: **1 y 2 son la Fase 1.** Lo demás son averías que estorban.

---

## 10. Lo que NO se hace

- **No se le pregunta al diseñador qué quiere que descubra el jugador.** Eso es el trabajo del
  grafo. Si lo supiera, no necesitaría la herramienta.
- **No se inventa un misterio sin material que lo sostenga.**
- **No se mezcla el hecho documentado con la invención.** Son dos capas separadas, y de esa
  separación depende poder decir «¿será verdad?» sin mentir.
- **No se tira nada.** Una idea descartada se marca, no se borra.
- **No se toca `academia-nodos`.** Son repos separados.

---

## 11. Cómo se comprueba

```bash
npm test          # lógica: catálogo, diseño inverso, despliegue hacia atrás, layout, anti-alucinación
npm run test:e2e  # flujo completo en Chrome headless
npm run build     # compila
npm run capturas  # capturas a capturas/ — OJO: necesita el servidor de dev levantado
```

**Aviso sobre `capturas`**: hay que levantar antes `npm run dev` en
**http://localhost:5199/**. Si no está, el script sobrescribe las siete capturas con páginas de
error **y sale con código 0**.

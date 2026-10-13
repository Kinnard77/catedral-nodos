# ESTADO — qué tenemos, para leer y corregir

> **Antes de leer esto, lee [`NARRATIVA.md`](NARRATIVA.md).** Es el método completo en un solo
> documento: las dos fases, las cuatro columnas, las reglas, las cinco piezas del desenlace y
> qué falta por construir. Este `ESTADO.md` es el mapa técnico; aquél es el método.

## 0. LO SIGUIENTE QUE HAY QUE HACER (relevo)

### HECHO: el puente ya está cableado (commit `9c67f24`)

Pulsar **«Ver el grafo»** en un anclaje **construye el grafo con el material de la
mesa y lo despliega abriendo por el FINAL**. El botón se activa según lo que HAYA
en la mesa, no según un mapa fijo.

Dos detalles que costaron encontrar y quedan escritos en el código:
- `inicializarGrafo` encadena por **`lessonId`**, no por `id`.
- Abre por el **PRIMER elemento** de la lista, así que las lecciones van en
  **orden de diseño** (el final primero). En orden de recorrido, abriría por la
  piedra y el diseño iría al revés del método.

### LO SIGUIENTE: crear nodos desde el material, opción a opción

Hoy el grafo se monta **de golpe** con todo el material de la catedral. Lo que
falta es lo que pidió el diseñador: que **pulsar una opción del material cree SU
nodo** en el grafo de su anclaje, para poder ir montando la narrativa pieza a
pieza — y para que se vea el injerto del apócrifo sobre la base googleable.

Piezas: `src/domain/puente.js` (ya tiene `tipoDeOpcion`, `grafoDesdeMaterial`,
`ordenDeDiseno`), `useAcademy.verGrafoDe` (ya despliega), y el panel de material.

---

## 0. AGENDA DE MAÑANA (dejada antes de dormir)

### Aclaración: de dónde sale el «otro agente»
**NO lo lancé yo.** Es **el otro chat del diseñador**, el de ayer — el mismo en el
que pidió el botón «+» por pilar. Lo descubrí leyendo el historial de git, que es lo
único que puedo leer. **No sé quién lo lanzó ni cuál es su rol: eso lo decide él.**

### NO TOCAR: el «misterio»
El otro chat metió el **misterio** dentro del grafo (la función que arma el grafo
depende de un misterio elegido). **Yo lo había retirado** de la interfaz porque el
diseñador lo descartó en su día («primero A, luego B»).

**Decisión del diseñador: NO descartarlo aún, hay que hablarlo.** Así que: **nadie
toca el misterio hasta esa conversación.** Ni se quita ni se amplía.

### Bug reportado, SIN investigar
> «La App (grafo de nodos) a veces se queda frickeada, no se mueve, y la tengo que
> volver a cargar.»

Reproducción: **no hay**. Sin pasos ni frecuencia. **Primera tarea de mañana:
reproducirlo antes de tocar nada** — y si no se reproduce, preguntarle qué estaba
haciendo cuando pasó.

### IDEA, para pensar: DOS VERSIONES
El diseñador propone sacar **dos versiones**: la normal (conspirativa, mercado
universal) y una **sesgada (católica)** para quien no quiere conspiraciones.
Análisis completo en **DOS-VERSIONES.md**. En corto:

- **El método ya lo permite casi gratis**: de los cinco nodos de la cadena, **solo
  el final (Φ) lleva ideología**. La piedra, la inscripción y su lectura son hechos.
- Y le da otra vuelta al 80/20: **el 80% es lo que COMPARTEN las dos versiones; el
  20% es lo que las DIFERENCIA.** Razón de peso para que el 80% sea real.
- **Lo que hay que hacer en el código, y mejora el diseño actual aunque nunca se
  haga la segunda versión: SEPARAR EL MATERIAL DE LA LECTURA.** El material,
  neutro; la versión, en el final y en la lectura.
- **Y lo que hay que decidir**: ¿es un interruptor (mismo juego, otro final) o un
  **derivado** (misma investigación, otro juego)? Mi opinión: derivado, porque lo
  caro es el MAPEO y sirve para las dos.

**NO construido. Es una idea.**

---

### Pendientes, en orden
1. **Corregir FICHA-VITRAL.md** con el diseñador. Es una propuesta; él la corrige y
   después se convierte en campos de verdad.
2. **Reescribir el prompt de investigación** con todo lo hablado: accesibilidad,
   filología, la ubicación **como mecanismo para mover al jugador**, el 80/20 de la
   composición, y las dos reglas (sobrenatural como dato del mundo sí, como
   explicación del enigma no).
3. **Las variantes que faltan**, una por una: vitrales, arquitectura, artefactos,
   reliquias, iconografía, documento, objeto, heráldica, marca de cantero. **Son
   variantes, NO tipos nuevos del GNI.**
4. El nombre de la clave ya está cambiado: **GNI** (antes GN-IEC).

---

## 0.bis Lo que YA funciona (verificado)

- **El motor conecta**: Google AI Studio por la API **nativa** (Interactions API),
  clave `AQ…`, `gemini-3.8-flash`, 27 modelos disponibles.
- **La investigación previa funciona**: trae candidatos (probado: 8) y **nunca
  certifica**. Solo la mano del diseñador pasa algo a «documentado».
- **El puente funciona de punta a punta**: material → grafo, abriendo por el final.
- **Los errores de Google se enseñan crudos**, sin recortar ni traducir.
- **Sin material de ejemplo**: el panel arranca vacío; lo que hay es del motor.
- `npm test` 25 secciones y `npm run test:e2e` 11 secciones, en verde.

## 0.ter Retirado (no borrado)

Material de ejemplo del §4, grafo de ejemplo del §4, el mapa de grafos (vacío a
propósito), las hojas de Material y Misterio, y el GDD de UMBRA.

---

Este documento no es un registro de decisiones (eso es [`DECISIONES.md`](DECISIONES.md)).
Es el **mapa**: qué es esta herramienta hoy, qué puedes hacer con ella, de dónde salió cada
idea y **qué partes conviene que revises porque son discutibles**.

Está escrito para que lo corrijas. Si algo aquí no es lo que tienes en la cabeza, dilo y se
cambia.

---

## 1. Qué es esta herramienta

Un **lienzo de nodos** donde se diseña el gameflow de un juego de misterio que se juega con el
móvil dentro de una catedral real. Se diseña **hacia atrás desde el final**: primero se decide
qué descubre el jugador, y desde ahí se pregunta qué se necesita diseñar antes para conseguir ese final.

**Lo primero es la trama.** La historia, la trama, el misterio y los personajes mandan; el grafo
los sirve. **No es una cadena de puzles y acertijos con una historia pegada encima**: los puzles
existen para contar el final. Un objeto no es nunca la meta — «no es buscar un escudo porque sí,
¿qué sentido tiene en la historia?». Ver [`DECISIONES.md`](DECISIONES.md) §7, que corrige el
malentendido de que un PDC no lleva trama (el PDC clásico **omite** los puntos de trama del
dibujo para que se lean las dependencias; eso es legibilidad, no ausencia de historia).

El juego **empieza dentro de la catedral** y se vive como una **audioguía con enigmas**: haces
turismo, piensas y descubres. Lo que da atractivo comercial es el **misterio y el material de
cada catedral**, no la forma. Los 90 minutos de jugador son reales pero **no son restricción dura
todavía**: se ajustan después de tener la trama.

**No es** la app del jugador. El juego se construye aparte, en Godot, y lo juega el turista en
un `.apk`. Esta herramienta es el taller donde se decide el juego.

---

## 2. Qué puedes hacer hoy con ella, paso a paso

1. **Abre preguntando en qué catedral vamos a trabajar.** Están las ocho que diste y puedes añadir
   más. Sin elegir catedral no se puede seguir.
2. **Al elegirla, el panel izquierdo enseña el MATERIAL que ya existe en esa catedral**: las
   opciones agrupadas por **los cuatro pilares** del §1 —anclaje en lo visible, apócrifo
   convincente, dualidad de gremios, secreto sin magia—. Cada opción declara su **clase**
   (anclaje, epigrafía, juego lingüístico, dato curioso, símbolo, restricción) y su **estado**:
   *documentado*, *por verificar* o *inventado*.
3. **Puedes encargar la investigación previa** —el 80%— con el botón *Investigar esta catedral*,
   y dejarle notas sobre qué sabes ya.
4. **Al abrir un anclaje, el lienzo despliega su grafo.** Abre **por el final**: por el núcleo
   filosófico, la herejía. No por la piedra.
5. **Cada clic en *ver continuación* revela lo que hace falta antes**, hasta llegar al anclaje
   visible. El grafo nunca quita nodos: solo crece.
6. **Las flechas llevan etiqueta**: dicen qué te llevas (`latin_tokens`, `cipher_solution`,
   `dead_end_resolution`…). Sin la etiqueta, el dibujo serían rayas.
7. **Puedes añadir un nodo nuevo** con *＋ Añadir lo que hace falta antes*.
8. **Todo se guarda en el navegador** y sobrevive la recarga.

> **Ya NO se te pregunta qué quieres que descubra el jugador.** Eso es justo lo que tiene que
> resolver el grafo: si lo supieras, no necesitarías la herramienta.

---

## 3. De dónde salió cada idea

| Fuente | Qué se tomó | Dónde vive hoy |
| --- | --- | --- |
| Tu **GNI** (especificación del lienzo) | Los 6 tipos de nodo, sus campos, sus salidas, la topología de diamante y las 3 condiciones de integridad | Es lo que el lienzo dibuja ahora |
| Tu **GDD de UMBRA** | Las 4 Columnas, los Sellos como etiquetas, la convergencia en un metapuzzle | Guardado en `gameflow/umbra-gdd.js`, retirado |
| Tus **plantillas antiguas** (Ficha de Enclave, SKILL-GEN-001, Biblio de Argot) | La idea de que un elemento real necesita fuente; el vocabulario de símbolos | Documentación de apoyo, y la regla de la fuente |
| El **motor de Academia Nodos** | El despliegue progresivo, el layout por capas, el lienzo, el lector | Es el motor del lienzo, apenas tocado |

---

## 4. Qué está construido y qué no

| Pieza | Estado |
| --- | --- |
| El lienzo (pan, zoom, encuadre, conexiones, lector) | **Funciona** (heredado) |
| Despliegue hacia atrás desde el final | **Funciona** |
| Etiquetas en las aristas | **Funciona** |
| El grafo del GNI dibujado y validado | **Funciona** |
| Las 3 condiciones de integridad del GNI | **Funcionan y tienen pruebas** |
| La pregunta 0 (la catedral) | **Funciona** |
| El panel de material por los cuatro pilares | **Funciona** |
| La verificación a mano (documentar exige fuente) | **Funciona** |
| Autoría: añadir lo que hace falta antes | **Funciona** |
| Guardado en el navegador | **Funciona** |
| **Conectar una IA**: preset de **Google AI Studio** (Gemini) y botón *Probar la conexión* | **Funciona** (falta tu clave) |
| La investigación previa por IA (el 80%) | **Construida**, sin verificar en vivo: necesita tu clave |
| **Un grafo nuevo por cada anclaje que mapees** | **Decidido y aceptado, NO construido** |
| El análisis del PDC (ramificación, cuellos de botella, grafo de ancestros) | **No existe** |
| Exportar el grafo a Godot | **No existe** |
| Idiomas (5 previstos, solo español escrito) | **Solo la estructura** |

---

## 5. Lo que el agente construyó y conviene que revises

Esto es lo que hay que tumbar o confirmar. Está ordenado de lo más dudoso a lo menos.

1. **Retiradas de la interfaz (el código se queda).** La hoja **«Ficha de campo»** (mi versión
   pobre de tu Ficha de Enclave: 9 categorías con una pregunta) y la hoja **«Misterio»** (la fase
   B, que tú descartaste). Estorbaban: ahora el «material» es el de la investigación previa, y
   tener dos cosas con el mismo nombre confundía. **Se pueden devolver si las quieres.**
2. **El vocabulario del material es mío en parte**: «opción», «clase», «pilar», los estados
   *documentado / por verificar / inventado*. Los pilares son tuyos; los nombres no.
3. **El nodo «Catedral» como primera pregunta.** Lo pediste tú, pero ahora la primera fase es el
   anclaje. **¿Sigue teniendo sentido preguntar la catedral antes que nada?**
4. **El campo `entrega`.** Es mi nombre para tus `salidas`. Si tu vocabulario manda, se renombra.
5. **Los dos ejes (`subject` y `tipo`).** Hoy conviven: tema (Columnas) y clase de nodo
   (GNI). Puede que solo deba quedar uno.
6. **El campo `level` (Puzle / Metapuzzle / Lore).** Lo inventé para el grafo del GDD y con el
   GNI se ha quedado sin uso claro. **Confirmado que no tiene uso en el modelo actual**: el
   diseñador no lo reconoce como suyo. Queda como candidato a retirar (el código se queda hasta
   que se decida).
7. **La orientación izquierda→derecha.** Decidiste mantenerla, pero tu §3 se dibuja de arriba
   abajo.
8. **Mi vocabulario**: «premisa», «piezas», «gameflow», «ancla», «desplegar». Nada de eso es
   tuyo.

---

## 6. Las tres preguntas abiertas, con su contexto

### 6.1 El ejemplo del §4, ¿es real o es hipótesis?

El caso que trae tu especificación: una **laja sepulcral en la girola**, la tumba del
**arcediano Don Fernando (1384)**, heráldica con **cinco lises**, y una inscripción
`HIC · REC · IN · NŌE · DĪ · OMNIP` cuya tilde, al suprimirse, convierte «en el nombre de Dios»
en «en el no-ser de Dios».

- Si es **real**, necesita la fuente que lo sostenga —es tu propia regla del Grial— y entonces
  es el primer contenido verdadero del proyecto.
- Si es **hipótesis** (un caso inventado para explicar el formato), hay que **marcarlo como tal**
  para que nadie lo confunda con un hallazgo.

### 6.2 Los dos ejes

Hoy un nodo lleva dos etiquetas a la vez: el **tema** (Arte/Tiempo, Religión, Ciencia,
Filosofía — las Cuatro Columnas del GDD) y la **clase de nodo** (Anclaje visible, Arenque rojo,
Epigrafía latina, Calambur, Divergencia, Núcleo filosófico).

- Si son **dos ejes que conviven**, un nodo puede ser «Filosofía + Epigrafía latina» y el color
  lo pone la clase de nodo.
- Si la **clase de nodo sustituye al tema**, el tema sobra en el GNI y solo valdría para el
  grafo grande de la catedral.

### 6.3 Los cuatro pilares del §1

Tu diagrama va `ANCLAJE VISIBLE → APÓCRIFO CONVINCENTE → DUALIDAD DE GREMIOS → SECRETO
FILOSÓFICO`: de la piedra al secreto.

- Si es el **orden de diseño**, entonces el diseño va de la piedra al secreto —lo contrario de
  empezar por el final— y hay que reconciliarlo.
- Si es el **orden en que lo vive el jugador**, es la secuencia de la experiencia, y el diseño
  la recorre al revés. Esta es mi lectura, pero no la doy por hecha.

---

## 7. Cómo se comprueba todo

```bash
npm test        # 12 secciones de lógica, sin navegador
npm run test:e2e # 9 secciones del flujo real en Chrome headless
npm run build   # compila
npm run capturas # capturas del flujo a capturas/
```

Lo que comprueban, en corto: que el grafo solo crece, que todo prerrequisito queda a la
izquierda de su dependiente, que el layout no depende del orden de llegada, que sin fuente un
elemento real no se guarda, que el motor no puede inventarse el suelo que pisa, que el ancla es
el núcleo filosófico, y que **el grafo de ejemplo del GNI es válido y verosímil**.

---

## 8. Dónde está cada cosa

```
src/domain/gni.js          Los 6 tipos del GNI + las 3 condiciones de integridad
src/domain/lesson.js         El modelo de nodo y la paleta de tipos (los dos ejes)
src/domain/elemento.js       Los elementos y los 5 idiomas
src/data/catedrales.js       Las 8 catedrales que diste
src/data/gameflow/
  gni-ejemplo.js           El grafo del GNI (el activo)
  umbra-gdd.js               El grafo del GDD (retirado, no borrado)
  catedral-dolores.js        Invención del agente (retirada)
src/graph/graphEngine.js     Despliegue progresivo + layout (heredado)
DECISIONES.md                El registro de lo decidido, ronda por ronda
PDC.md                       El análisis del grafo: ejes, regla del final, arrastre e integridad
```

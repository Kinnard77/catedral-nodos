# ESTADO — qué tenemos, para leer y corregir

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
| Tu **GN-IEC** (especificación del lienzo) | Los 6 tipos de nodo, sus campos, sus salidas, la topología de diamante y las 3 condiciones de integridad | Es lo que el lienzo dibuja ahora |
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
| El grafo del GN-IEC dibujado y validado | **Funciona** |
| Las 3 condiciones de integridad del GN-IEC | **Funcionan y tienen pruebas** |
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
   (GN-IEC). Puede que solo deba quedar uno.
6. **El campo `level` (Puzle / Metapuzzle / Lore).** Lo inventé para el grafo del GDD y con el
   GN-IEC se ha quedado sin uso claro.
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
- Si la **clase de nodo sustituye al tema**, el tema sobra en el GN-IEC y solo valdría para el
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
el núcleo filosófico, y que **el grafo de ejemplo del GN-IEC es válido y verosímil**.

---

## 8. Dónde está cada cosa

```
src/domain/gniec.js          Los 6 tipos del GN-IEC + las 3 condiciones de integridad
src/domain/lesson.js         El modelo de nodo y la paleta de tipos (los dos ejes)
src/domain/elemento.js       Los elementos y los 5 idiomas
src/data/catedrales.js       Las 8 catedrales que diste
src/data/gameflow/
  gniec-ejemplo.js           El grafo del GN-IEC (el activo)
  umbra-gdd.js               El grafo del GDD (retirado, no borrado)
  catedral-dolores.js        Invención del agente (retirada)
src/graph/graphEngine.js     Despliegue progresivo + layout (heredado)
DECISIONES.md                El registro de lo decidido, ronda por ronda
```

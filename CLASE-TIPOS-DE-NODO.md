# CLASE — Los seis tipos de nodo del GN-IEC

Esta es la clase que pediste. **Los seis tipos están en el código**
(`src/domain/gniec.js`), y aquí se explican **para usarlos**.

> **GN-IEC = Grafo de Nodos de Investigación Epigráfica y Conspirativa.**
> Y el propio nombre lleva las dos capas dentro: **Epigráfica** es el 80% —lo que
> está grabado y es real—; **Conspirativa** es el 20% —lo que se urde y es
> nuestro—. Tu corrección es exacta: **lo conspirativo pertenece al Apócrifo
> Convincente, no al Anclaje en lo Visible.**

---

## Quién investiga — y esto estaba MAL en la primera version

**Nosotros. Todavía no hay jugadores.**

Estamos en la **FASE 1**, y la Fase 1 no es diseñar un juego: es **investigar
NUESTRO material** para llegar a saber **de qué trata el juego**. No hay jugador,
no hay recorrido, no hay partida. Lo que hay es:

> **Qué tenemos en esta catedral, y qué podemos hacer con lo que tenemos.**

Esta fase sirve para descubrir **de qué va el juego de Valencia** —si elegimos
Valencia—. **El de Burgos será otro juego, porque Burgos tiene otros elementos.**
Y el final que buscamos aquí es el **clímax y desenlace de la narrativa**: la
herejía, la revelación. Del juego, sí; de la partida, todavía no.

Por eso los nodos se llaman «investigación»: **la que hacemos nosotros.** El
GN-IEC es **nuestro mapa de investigación**, no el recorrido de nadie.

**Y la regla del método sigue igual, pero cambia el sujeto:**

> **Se investiga desde el final hacia atrás.** Se empieza por la conclusión —la
> herejía que el material permite sostener— y se camina hacia atrás hasta la
> piedra. Cada nodo que se coloca es **uno que hace falta ANTES** del que ya está.

La Fase 1 termina cuando se sabe **qué historia cuenta esta catedral**. La Fase 2
—convertir eso en recorrido para un jugador— **no ha empezado.**

---

## Por qué es un grafo de INVESTIGACIÓN (y no de juego)

**50 catedrales. Cada una con SU juego**, porque cada una tiene sus propios
elementos, símbolos y reliquias.

**Pero todas se parecen en la base. Y la base es lo que estamos trabajando ahora.**

> Primero hay que saber **qué tenemos**. Después, **qué hacemos con lo que
> tenemos**.

De ahí que el GN-IEC sea de **investigación**: no describe una partida, describe
**nuestro trabajo** de averiguar qué historia permite contar esta catedral.

**Consecuencia de diseño, y es grande:** lo que separemos en dos piezas —**la base
que comparten las 50** y **los elementos que son de cada una**— es lo que
generaliza. Lo local no se puede reutilizar; lo común, sí.

---

## Variantes, NO tipos nuevos

Decisión del diseñador: **los campos de evidencia no son tipos nuevos del GN-IEC,
son VARIANTES.** Y el mecanismo ya existe en el código: cada campo de un tipo tiene
sus opciones.

Ejemplo, el anclaje (`gniec.js`):

```
{ id: 'location_type', label: 'Tipo de lugar',
  opts: ['laja_pavimento', 'filacteria_portada', 'capitel_historiado', 'relicario_forja'] }
```

**Siete tipos de nodo no cambian.** Lo que crece es la lista de variantes dentro de
cada tipo: **vitrales, arquitectura, artefactos, reliquias, iconografía, documento,
objeto, heráldica, marca de cantero** y lo que vaya saliendo.

Pendiente, una por una, con su definición: qué es, qué entra y qué sale.

---

## El 80/20 NO es por nodo. Es la COMPOSICIÓN de la historia

**Esto lo tenía MAL y el diseñador lo corrigió.** Yo puse una tabla diciendo que
unos tipos de nodo eran 80% y otros 20%. **No es así:**

- Un nodo del pilar **«Anclaje en lo Visible»** es **100% investigación real** de la
  catedral. Ahí no hay hueco para calambur, ni divergencia, ni nada inventado.
- Un nodo del pilar **«Apócrifo Convincente»** es **100% apócrifo**.

**El 80/20 está en la MEZCLA, no en las piezas:**

> **La historia final se compone de material de los cuatro pilares: alrededor del
> 80% del material del Anclaje en lo Visible, y alrededor del 20% de los otros tres
> pilares. Y no es una regla dura.**

Y es lo que le da sentido al pilar: **el 80% real es el suelo que sostiene el 20%
inventado.** Un nodo concreto es de un pilar; la historia es la proporción.

**Utilidad práctica en la Fase 1, ahora bien planteada:** al mirar el material
recogido, se ve **cuánto suelo real hay** frente a cuánto se ha inventado. Si el
material es casi todo de los otros tres pilares, **la historia no se sostiene**: no
hay hechos sobre los que apoyar la deducción.

---

## Esta herramienta es de ESTUDIO, no de juego

Palabras del diseñador: es una **«herramienta de estudio, de investigación, de
orden, de captura, de recopilación»**.

Y esto manda sobre todo lo demás en esta fase:

- **El juego está basado en hechos reales**, así que **el material no se puede
  inventar: hay que ir a verlo.** Por eso estamos investigando.
- **Lo que falta no es diseño: es MAPEO.** *«A mí me encantaría tener todo el
  material ya y pasar a diseñar el juego, pero para eso tengo que hacer un mapeo de
  cada vitral, al menos de los importantes, para VER qué hay en esas obras de arte y
  qué podemos usar para nuestra narrativa.»*
- Por eso, en esta fase, de cada evidencia se ponen **GENERALIDADES, no
  particularidades**: la **ficha** de lo que hay que capturar en cada catedral,
  porque el contenido todavía no se conoce.

**Consecuencia para lo que construimos:** cada variante de evidencia (vitral,
arquitectura, relicario…) no es una pieza de juego: es **un formulario de captura**
— qué hay que mirar y apuntar cuando se vaya a la catedral.

---

## Los seis tipos, uno a uno

Cada tipo tiene **entradas** (lo que necesita), **campos** (lo que hay que
rellenar) y **salidas** (lo que entrega al siguiente nodo). Las salidas son las
etiquetas de las flechas: **sin ellas, el dibujo son rayas**.

### 1. `anchor` — Anchor_Visible · ⌖
**Qué es.** El punto de entrada: un elemento tangible y **accesible** al público.

- **Cuándo se usa:** siempre. **Es la raíz del grafo** y define de qué grafo
  hablamos: un anclaje, un grafo.
- **Cuándo NO:** nunca falta. Si no hay anclaje, no hay juego.
- **Sale:** `text_data` (el texto que lleva), `spatial_target` (dónde está).
- **Es el 80%.** Real, visible, fotografiable.

### 2. `epigraphy` — Epigraphy_Latin · ⁘
**Qué es.** La capa textual y tipográfica: **lo que está grabado y cómo está grabado**.

- **Cuándo se usa:** cuando el anclaje **lleva letras**.
- **Sale:** `latin_tokens` (las palabras), `grapheme_breaks` (dónde se puede partir).
- **Es el 80%.** La piedra dice lo que dice.
- **OJO — y es tu observación:** este tipo es **solo para texto grabado**. Y **no
  todas las catedrales tienen epigrafía interesante.** Eso lo dejamos abajo.

### 3. `calambur` — Calambur_Esoteric · ⁂
**Qué es.** La transformación filológica: **de lo que se lee a lo que se quiso decir**.

- **Cuándo se usa:** cuando las letras **admiten una segunda lectura**. Necesita la
  epigrafía delante.
- **Sale:** `cipher_solution` (la lectura descifrada), `conceptual_clue` (la pista
  de qué va todo).
- **Aquí empieza el 20%.** La piedra es real; **la segunda lectura la ponemos
  nosotros.**

### 4. `red_herring` — Red_Herring · ◈
**Qué es.** La explicación piadosa que **satisface al historiador tradicional**.
El camuflaje del puzle.

- **Cuándo se usa:** **siempre que haya una explicación oficial plausible.** Y casi
  siempre la hay: el obispo, el bienhechor, la reliquia.
- **Sale:** `dead_end_resolution` (cómo se cierra el callejón), `distraction_flag`.
- **Es la pieza que hace que el jugador CREA que ha llegado al final** cuando aún
  no ha llegado. Sin ella no hay tensión, hay un paseo.

### 5. `divergence` — Divergence_Clash · ⇄
**Qué es.** **Donde el historiador y el lingüista chocan** y la versión oficial se cae.

- **Cuándo se usa:** es **el nudo** del grafo. Necesita las dos rutas llegando a él:
  la del que lee normal (arenque) y la del que descifra (calambur).
- **Sale:** `dialectic_breakthrough` (la grieta por la que entra la duda).
- **Es la ruta dual.** Si solo hay una entrada, no hay choque: hay una afirmación.

### 6. `philosophical` — Philosophical_Core · Φ
**Qué es.** La revelación racional: **una herejía filosófica**, nunca una reliquia
sobrenatural.

- **Cuándo se usa:** **el primero.** Es el final, y **es el primer nodo que colocas.**
- **Sale:** `quest_climax`, `narrative_reward`.
- **Es el 20% puro.** Y por eso el juego no lo afirma: lo **plantea**.

---

## Cómo se encadenan (el orden de diseño)

```
DISEÑAS ASÍ  →→→   Φ  ←  ⇄  ←  {{⁂ | ◈}  ←  ⁘  ←  ⌖
EL JUGADOR VA ASÍ  ⌖  →  ⁘  →  {{⁂ | ◈}  →  ⇄  →  Φ
```

1. **Φ primero.** Eliges la herejía. Es lo único que decide de qué va todo.
2. **⇄ después.** ¿Dónde chocan las dos lecturas para llegar a esa herejía?
3. **⁂ y/o ◈.** El camino del que descifra y el del que se conforma.
4. **⁘.** El texto grabado que hace posible el descifrado.
5. **⌖ el último.** La piedra que se ve. **Lo último que se diseña es lo que el
   jugador ve primero.**

## Un ejemplo de una línea

`⌖ laja con bordura` → `⁘ HIC·REC·IN·NŌE·DĪ·OMNIP` → `⁂ suprimir la tilde:
IN NON E` → `⇄ el historiador lee «en el nombre de Dios»; el lingüista lee «en el
no-ser de Dios»` → `Φ averroísmo: el alma individual se aniquila`.

El arenque (`◈ el arcediano bienhechor, 1384`) cuelga de la piedra: es la
explicación que **parece cerrar el caso** antes de que lleguemos al nudo.

---

## Lo que está PENDIENTE y es decisión tuya

### a) El GN-IEC es epigráfico, y no siempre hay epigrafía
Tú lo has dicho: *«tenemos que abrir la investigación a más campos»*. Hoy **no hay
ningún tipo de nodo** para:

- **Iconografía** — un programa de imágenes (capiteles, retablos, vidrieras).
- **Arquitectura y medida** — proporciones, trazados, giros, orientaciones.
- **Documento de archivo** — un libro de fábrica, una bula, una minuta.
- **Objeto y procedencia** — un marfil, un tejido, un relicario: de dónde vino.
- **Heráldica y linaje** — escudos, enterramientos, quién pagó.
- **Marca de cantero** — quién labró la piedra y con qué signo.
- **Simbología** — y es la más importante: el diseñador dice que **está en todas
  partes** y que se juega con símbolos **«como si fueran gratis»**.
- **Vitrales** — el programa de vidrieras.
- **Reliquias** — qué se guarda y de dónde vino.

**Decisión tuya:** ¿son **tipos nuevos** del GN-IEC, o **variantes del `anchor`**
(evidencia visible de otra clase)? De eso depende si el grafo crece en tipos o en
clases.

### c) El tipo Símbolo
Pendiente de tu respuesta: **¿el símbolo es una pista que cuelga del anclaje, o un
camino propio hacia el final?** Está sin construir a propósito.

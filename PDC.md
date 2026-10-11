# PDC — el análisis del grafo

`NARRATIVA.md §9` y `ESTADO.md` dicen que **el análisis del PDC no existe**. Y `NARRATIVA.md §8`
registra la avería nº5: **«el final de hoy es un final de puzle»**.

Este documento trae ese análisis, medido sobre un PDC real y sobre la estructura de *El Código
Da Vinci*. Todo lo de aquí sale de mirar dos grafos de verdad, no de teoria.

> **Estado de cada cosa:** `DECIDIDO` · `PROPUESTO` (para que lo confirmes o lo tumbes) ·
> `FALTA` (construir).

---

## 1. Los ejes — corrección tras leer el código

**Los ejes ya existen.** `material.js` trae el **pilar** (la familia de material) y `lesson.js`
trae `tipo` (la clase del GN-IEC) y `subject` (el tipo de pieza del gameflow:
`final · revelacion · emocion · mecanica · lugar · pista`), más `level` (la concreción).

| Eje | Dónde vive | Qué responde | Manda en |
| --- | --- | --- | --- |
| **Pilar** | `material.js` | ¿De qué familia de material sale? | La investigación previa |
| **Clase de nodo** (`tipo`) | `lesson.js` | ¿Qué ES en la historia? | El tono |
| **Tipo de pieza** (`subject`) | `lesson.js` | ¿Dónde encaja en el gameflow? | La estructura |
| **Concreción** (`level`) | `lesson.js` | ¿Intención, mecánica o escena? | El detalle |

**Así que no falta un eje. Falta una distinción DENTRO de `subject`.**

### `PROPUESTO`: `subject` tiene que distinguir ENTENDER de HACER

`subject` hoy dice **dónde encaja la pieza** (`final`, `mecanica`, `pista`…), pero no dice **qué
hace el jugador con ella**. Y esa es la distinción que gobierna el grafo:

> **Una pieza donde el jugador HACE algo** — un puzle, una búsqueda, un objeto.
> **Frente a una pieza donde el jugador ENTIENDE algo** — una relectura.

**De ahí sale la regla del §2** (el `FIN` tiene que ser de las que se entienden), y de ahí sale
que el **arrastre** de una `revelacion` se pueda medir aparte del de una `mecanica`.

**No es un eje nuevo: es afinar el que ya tienes.** Y es barato, porque `subjectOf` ya resuelve
por `tipo` cuando está (`lesson.js:95-98`), así que basta con añadir los valores que distinguen.

**Los cinco tipos funcionales, sacados de un PDC real** (el de *The Dig*, 1995):

| Tipo | Qué es | En The Dig | En nuestro juego |
| --- | --- | --- | --- |
| **`puzle`** | Una acción que hay que ejecutar | *Release og · Move boulder* | Un enigma sobre la catedral |
| **`info`** | **El jugador ENTIENDE algo** | *Location of part* | **La relectura** |
| **`objeto`** | Algo que se recoge y se gasta | *Shovel · Crystals · Plates* | **El Kit del Iniciado** |
| **`conversacion`** | Un intercambio con un personaje | *Miles · Creature* | El mentor, el antagonista |
| **`documento`** | **Un apócrifo convincente** | — | **Tu columna 2 hecha nodo** |

**El tipo `documento` es nuevo aquí y sale de una decisión tuya:** en *The Dig* la información
sale del propio juego; en *El Código Da Vinci* sale de documentos. **Un documento inventado
—gráfico o de audio— es imposible de googlear, porque no existe en el mundo.**

---

## 2. La regla del final — corrige la avería nº5

> **`DECIDIDO`: el nodo `FIN` tiene que ser `info`, nunca `puzle`.**

**El nodo final no es una acción ni un objeto: es el jugador entendiendo.**

**Evidencia medida en los dos grafos de referencia:**

- En *The Dig*, el nodo que desbloquea el clímax es **`Location of part`**, y está **marcado
  como INFO**. Los puzles vienen antes y después, pero **el clímax lo abre un conocimiento**.
- En *El Código Da Vinci*, el último nodo es **la comprensión**: *Sang Real* + el Louvre.
  **Langdon no abre nada. Se arrodilla.**

> **Si el último nodo es un puzle, el juego termina en tarea.
> Si es `info`, termina en revelación.**

**Y el argumento que lo cierra (del diseñador):** si el jugador se lleva un `info` al salir de la
catedral, **ese `info` sigue reflexionándose días después**. Lo que se lleva no es un objeto: es
una idea que **no se acaba**. Un puzle resuelto se cierra; **una relectura se queda abierta.**

---

## 3. La regla de las dos capas — corrección: lo googleable es el ANCLA

> **`DECIDIDO`: el material googleable NO es el enemigo. Es el SUELO.**

Esto **invierte** lo que decía antes este documento, y el cambio es de fondo:

| Antes | Ahora |
| --- | --- |
| «Que no se pueda googlear» era una **estrategia** para que el jugador no resolviera los puzles desde el sofá | **La herramienta ES googleable, y tiene que serlo**: su trabajo es **investigar qué elementos reales hay en esa catedral**. Eso lo hace la API integrada |
| | **Los juegos también son googleables, y eso los hace MÁS creíbles**: si el jugador busca en Wikipedia y **encuentra el material real**, el apócrifo que le colgamos encima **se vuelve verosímil** — porque tiene base real debajo |

**La credibilidad no viene de esconder. Viene de que lo real sea comprobable.**

Son el **pilar 1** *(Anclaje en lo visible)* y el **pilar 2** *(Apócrifo convincente)*
**trabajando juntos**: lo que se puede googlear es el suelo; lo que nos inventamos es el edificio
encima. Y cuanto más sólido el suelo, **más alto se puede construir**.

**Y de ahí sale la regla que sí manda** (ya en `NARRATIVA.md §10`): **no se mezcla el hecho
documentado con la invención.** Dos capas separadas — y de esa separación depende poder decir
*«¿será verdad?»* sin mentir.

---

## 4. Las cuatro comprobaciones de forma

El GN-IEC ya tiene **tres condiciones de integridad** (`gniec.js`). Estas cuatro son **de forma**:
se pueden medir **sin abrir el navegador**, solo mirando el grafo. Son lo que diría **un corrector
automático**.

### 1 · Todo nodo llega a `FIN`

**Qué significa.** Si empiezas en cualquier pieza y sigues las flechas hacia abajo, **tienes que
acabar en el final**.

**Ejemplo de fallo.** Diseñas «la marca del cantero» y resulta que **ninguna pieza posterior la
necesita**. Es preciosa y no sirve. Y lo peor: **el diseño inverso —que va del final hacia
atrás— nunca la habría revelado**, porque no cuelga del final.

**Por qué importa.** `README.md` ya lo dice: *«toda pieza es ancestro del ancla»*. Esto lo
convierte en algo que **se comprueba en lugar de confiar**.

### 2 · Todo nodo desbloquea algo

**Qué significa.** Una pieza **sin flecha de salida no abre nada**. El jugador la resuelve y no
pasa nada.

**Ejemplo de fallo.** Un símbolo que se colecciona y no se usa jamás.

**Por qué importa.** Es la **regla de entrada** de `NARRATIVA.md §5.2`: toda pieza tiene que ser
**necesaria para lo siguiente**. Si no, sobra.

### 3 · El arrastre de cada nodo

**Qué significa.** **Cuántas capas pasan entre que consigues una pieza y que la gastas.**

**Ejemplo.** El Kit del Iniciado. Si la lupa se recibe en la capa 3 y se usa en la 4,
**arrastra 1 capa: es un trámite**. Si se recibe en la 2 y se usa en la 9,
**arrastra 7: es una herramienta**.

**Por qué importa.** Ver §5. Es la diferencia entre **tener un inventario** y **tener un
inventario que importa**.

### 4 · ¿Hay ciclos?

**Qué significa.** A necesita B y B necesita A: **el grafo se muerde la cola**.

**Por qué importa.** El layout da por hecho un grafo acíclico y **los rompe por su cuenta**. Y en
el diseño significa algo peor: **ninguna de las dos piezas puede ser la primera.** Es la decisión
pendiente de `ESTADO.md`, y conviene tomarla **antes de que el ciclo aparezca solo**.

---

## 5. La métrica del arrastre — lo que de verdad mide un PDC

> **Arrastre de un nodo = cuántas capas pasan entre que lo consigues y que lo gastas.**

Un objeto o una información que se gasta en la capa siguiente **no es una pieza: es un trámite**.
Y una que arrastra diez capas **es lo que sostiene el juego entero**.

### Medido en los dos grafos de referencia

**El Código Da Vinci** (30 nodos, 5 actos):

| Nodo | Tipo | Arrastre |
| --- | --- | --- |
| `i_sangreal` — *SANGREAL = SANG REAL* | info | **12 capas** |
| `d_carta` — *Carta del prior* | documento | **18 capas** |
| `d_manuscrito` | documento | 9 capas |
| `i_virgen`, `i_apple`, `i_louvre`, `i_familia` | info | **1 capa** ← se cobran enseguida |
| `o_llave`, `o_criptex`, `o_criptex2` | objeto | **1 capa** |

> **De ocho nodos `info`, cinco se cobran enseguida y solo uno arrastra de verdad.**
> **Ese uno es la novela.**

**Y un dato estructural que no se ve en una sinopsis:**

> **El acto más corto (3 nodos) contiene la arista más larga del libro.** `SANG REAL` se aprende
> en el acto 3 y se cobra en el 5. **El acto más breve es el que sostiene todo el peso.**

### Lo que esto significa para nuestro diseño

- Un **`objeto`** con arrastre 0 o 1 es **decoración**. El Kit del Iniciado **tiene que arrastrar**:
  se recibe pronto y se gasta tarde. `NARRATIVA.md §6` ya dice que el inventario es mecánica
  decidida; **la métrica dice si de verdad sirve o solo aparece.**
- Los **`documento`** son el tipo que más arrastra en Da Vinci (18 y 9 capas). **Son la
  herramienta natural para plantar la relectura del final.**
- Y el **`info` del final tiene que arrastrar desde el principio** — porque el final es la
  relectura de una pieza que el turista **ya vio al entrar** (`NARRATIVA.md §5.3`).

---

## 6. Los actos

El PDC se lee mejor **por actos**, y los actos tienen tamaños muy distintos. Del Código Da Vinci:

| Acto | Nodos |
| --- | --- |
| 1 · El anagrama | 5 |
| 2 · El banco | 8 |
| 3 · El mentor | **3** ← *y contiene la arista de 12 capas* |
| 4 · Los dos criptex | **10** ← el más mecánico |
| 5 · El final | 4 |

**Dos lecturas útiles:**

1. **El final es corto y denso.** Cuatro nodos que se aceleran. **No es un embudo donde confluyen
   las ramas: es una recta que se aprieta.**
2. **El acto más largo es el más mecánico** y el más corto el más significativo. **Los puzles
   ocupan sitio; el sentido ocupa poco.**

---

## 7. La herramienta — `PROPUESTO` enchufarla

Existe y funciona: **`grafo.py`** (en `Laya/poc/grafo.py`), construida para esto.

| Qué hace | Cómo |
| --- | --- |
| **Valida** las 4 condiciones del §4 | Reporta los nodos que no llegan a `FIN` y los que no abren nada |
| **Mide el arrastre** de cada nodo | La tabla del §5, automática |
| **Dibuja** el grafo por actos | Con las aristas largas en rojo |
| **Exporta a `.graphml`** | Se abre y se edita en **yEd** |
| **Importa `.graphml`** | **Ida y vuelta**: se edita en yEd y se revalida aquí |

**El formato de entrada es texto**, una línea por nodo — se escribe en minutos:

```
P | id | Titulo | texto de la trama -> id_que_desbloquea, otro_id
```

**Por qué enchufarla y no reimplementarla:** el análisis del PDC que pide `NARRATIVA.md §9`
**ya está escrito y probado**. Lo que falta es **conectar su salida al modelo del lienzo**
(`lesson.js` ya tiene `prereq`, que es exactamente la arista).

**Y una comprobación de un segundo que ahorra horas:**

> **Si el dibujo sale en una sola columna, no hay juego: hay un guion.**
> Un grafo sano tiene **abanicos que se abren y vuelven a cerrarse**.

---

## 8. Lo que este documento NO cambia

- **Las Cuatro Columnas siguen siendo cuatro.** `NARRATIVA.md §3` ya resolvió si son el orden de
  diseño o el del jugador — *4→1 se deriva, 1→4 se juega* — y ese razonamiento es correcto y
  **no lo toco**.
- **«Reordenar lo viejo» NO es una quinta columna.** Las columnas son **familias de material que
  se investiga**; «reordenar lo viejo» no es material, es **la regla del desenlace**. Ya vive en
  `NARRATIVA.md §5.3` (la regla del desenlace) y en `§7` como **pieza 2: «lo que se relee»**.
  **Como pilar perdería fuerza: pasaría de regla a categoría.**
- **La trama sigue mandando.** Nada de aquí convierte el juego en una cadena de puzles.
- **El 80/20 y la regla de la fuente no se tocan.**

---

## 9. Lo que hay que construir, revisado

`NARRATIVA.md §9` pone cinco cosas en orden. El análisis del PDC **añade dos y reordena una**:

| # | Qué | De dónde |
| --- | --- | --- |
| 1 | **El campo «lo que se relee»** | `NARRATIVA.md §9.1` — sigue siendo lo primero |
| 2 | **La secuencia de la trama** | `NARRATIVA.md §9.2` |
| 3 | **Validar que el ancla es `info`** | **§2 de este documento** — es una comprobación, no una función |
| 4 | **Añadir el eje funcional** a `lesson.js` y colorear por él | **§1** |
| 5 | **Enchufar `grafo.py`** para validar y medir el arrastre | **§7** |
| — | El puente misterio → lienzo | `NARRATIVA.md §9.3` |
| — | Separar relectura de novedad | `NARRATIVA.md §9.4` |
| — | Arreglar el contador y las capturas | `NARRATIVA.md §9.5` |

**Los puntos 3, 4 y 5 son baratos y desbloquean el resto**, porque convierten el lienzo en algo
**que se puede comprobar** en vez de algo que hay que mirar.

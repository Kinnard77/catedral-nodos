# Decisiones de diseño

Este documento es el registro de lo que **decidimos juntos**. No es documentación
técnica: es la memoria del proyecto para que ninguna decisión se pierda entre sesiones,
y para saber qué está decidido y qué sigue abierto.

> Regla de trabajo: **el agente propone y espera. No implementa una decisión que sea
> del diseñador.** Si algo no está aquí decidido, está abierto.

---

## 0. Naturaleza del proyecto (definido por el diseñador)

Respuestas del diseñador a la primera batería de preguntas. **La catedral es el escenario
real**: el turista la recorre físicamente con el móvil.

| Pregunta | Respuesta |
| --- | --- |
| ¿Cuántos juegos? | **Unos 50 al final.** No son 8: la lista crece y el objetivo son ~50 catedrales, o sea **50 juegos**. Todos bajo la misma plantilla, y cada catedral con sus propios misterios y secretos. |
| ¿Qué sale de la herramienta? | **Todas las decisiones** para construir los puzles, los acertijos y la narrativa, todo ajustado a la narrativa. Y algo que lo cambia todo: *la herramienta recopila información y **hace preguntas** al diseñador.* |
| ¿El misterio es verdad? | **Mezcla: interpretación artística de la realidad**, como le pasa a Langdon en *El Código Da Vinci*. Descubren una supuesta verdad muy tentadora, y el jugador acaba con **«¿será verdad?»**. Nunca se confirma. |
| El recorrido por la catedral | **Lo diseñamos nosotros.** |
| ¿Historia y personajes? | **Sí.** |
| ¿Hay que estar allí? | **Sí, y el juego lo comprueba.** |
| ¿Quién usa la herramienta? | **Solo nosotros.** Es una guía y una ayuda para diseñar los juegos. |
| ¿Quién juega? | Turistas de todo el mundo, en las catedrales para las que ya tengamos el juego diseñado. |
| Motor del juego | **Godot 4.7**, desarrollado por nosotros. |

### La plantilla es como un Escape Room

En palabras del diseñador: *«Es como un Escape Room, muy semejante. En cada sala se juega un
juego diferente pero al final todos son Escape Room.»*

O sea: **una estructura común y contenido distinto en cada catedral**, y a escala de ~50 juegos.
La plantilla se aborda con **borrador antes y ajuste continuo**: se escribe un borrador y se
corrige con lo que enseñe cada catedral al diseñarse.

### Lo que esto implica para la herramienta (por confirmar)

1. **No es un lienzo pasivo: pregunta.** Su trabajo es interrogarte y convertir tus respuestas
   en diseño. El lienzo de nodos es **una de sus vistas**, no el producto entero. Esto
   reordena las prioridades: primero el interrogatorio, después el dibujo.
2. **Tiene que guardar dos capas separadas**: el hecho real, con su fuente, y la
   interpretación artística que inventamos. Sin esa separación no se puede sostener el
   «¿será verdad?» final sin mentirle al jugador.
3. **Tiene que producir todo lo necesario para construir el juego**, no solo el grafo de
   dependencias.

### Segunda ronda: la herramienta, el contenido y el premio

| Pregunta | Respuesta |
| --- | --- |
| ¿Qué es la plantilla? | Marcó **las tres cosas a la vez** —estructura de fases, mecánicas fijas, arco narrativo con el mismo tipo de final— **y además** que *todavía no lo sabe y quiere descubrirlo con la herramienta*. |
| ¿Hasta dónde llega la herramienta? | **Diseño y textos dentro; el audio fuera.** Guarda lo que se lee, no lo que se oye. |
| ¿Cómo te pregunta? | **Las cuatro formas**: guiando paso a paso, revisando lo que escribes, ofreciéndote opciones documentadas y bloqueando lo que está a medias. |
| ¿Capas separadas? | **Sí** —hecho documentado con fuente, e interpretación aparte— y el «¿será verdad?» es **una** de las sensaciones con las que el jugador debe quedarse. |
| Los personajes | **Sin decidir.** |
| Idiomas | **Inglés, francés, español, italiano y alemán.** Se diseña **solo en español por ahora**, pero el modelo de contenido tiene que anticipar los cinco. |

### Tercera ronda: la escala, la motivación y por dónde se empieza

| Pregunta | Respuesta |
| --- | --- |
| ¿Cuántos juegos? | **Unos 50.** «Olvida que son 8 juegos, serán como 50 catedrales al final.» |
| ¿Cómo aparece la plantilla? | **Borrador antes, ajuste continuo.** Se escribe un borrador y se corrige con lo que enseñe cada catedral al diseñarse. |
| La motivación | **Una curva que se diseña encima del gameflow.** Primero el grafo de puzles; después, por encima, la curva de tensión y recompensa. |
| El primer interrogatorio | **El misterio** — pero no preguntándole cuál es, sino resolviendo con él **cuál conviene**. Ver abajo. |

### La pregunta que define el primer paso (palabras del diseñador)

> *«Yo no sé qué misterio o trama o qué conviene según la catedral, vamos a resolver ahí. La
> herramienta es para resolver eso: **¿qué misterio conviene trabajar en esta catedral si
> tenemos estos y aquellos elementos reales y ficticios o modificados?**»*

Esto es el corazón del producto, y contiene su propio orden. Fíjate en la segunda mitad:
*«si tenemos estos y aquellos elementos»*. **Esa condición todavía no se cumple**: hoy no hay
ningún elemento de ninguna catedral sobre la mesa. Y sin material no se puede decidir qué
misterio conviene — solo se puede inventar, que es justo lo que no queremos.

Así que el primer paso no es elegir el misterio: es **poner los elementos encima de la mesa**,
separando lo real de lo modificable o inventado. El misterio se decide *después*, y con el
material delante.

### Lo que cambia la escala de 50 juegos

No es «el mismo trabajo 50 veces»: cambia la naturaleza de la herramienta.

- Deja de ser un cuaderno donde se diseña **un** juego y pasa a ser una **línea de producción**
  de 50, con un formato común que hay que sostener en todos.
- Los cinco idiomas y el contenido en texto, multiplicados por 50 catedrales, obligan a que
  **todo se guarde de forma estructurada y exportable** desde el primer día, no al final.
- La plantilla deja de ser una idea bonita y pasa a ser **infraestructura**: si cada catedral se
  diseña a su aire, 50 juegos son 50 desarrollos distintos.

### Cuarta ronda: qué clase de juego es, y qué significa «fuente»

| Pregunta | Respuesta |
| --- | --- |
| ¿Qué clase de juego es? | **Didáctico.** Al jugador se le propone el recorrido que diseñamos nosotros; si no lo hace, **no puede seguir el hilo conductor** del juego. |
| ¿Dónde se juega? | En un **`.apk`** — o sea, Android. El juego se construye en **Godot**. |
| El material | «Un material que **recolectamos de la catedral misma**». |
| Lo siguiente | **El motor proponiendo misterios** a partir de ese material. |

#### Qué significa «fuente» aquí (aclaración)

Una **fuente** es, sin jerga: **de dónde sabemos que eso es verdad.** El recibo del dato. Por
ejemplo:

- un libro, con autor y página;
- el archivo o el acta de la propia catedral;
- una placa o una inscripción que se puede leer en el sitio;
- un artículo o una web **con autoría** (no un blog anónimo).

**Para qué sirve.** Para separar lo que **está de verdad en el edificio** de lo que **nos hemos
inventado o modificado**. Con ~50 catedrales y un equipo, eso no se puede recordar de memoria
dentro de dos años.

**Por qué importa el doble aquí.** Es un juego **didáctico**: al jugador se le está enseñando
algo, así que no se le puede presentar un invento como un hecho. Y el «¿será verdad?» del final
es justo la manera de ser didáctico **sin mentir**: se muestran cosas reales, se sugiere una
lectura, y la duda se deja abierta a propósito. Eso solo funciona si sabemos —y tenemos
anotado— qué parte es real y qué parte es nuestra.

**Decidido:** la fuente es **obligatoria**. Si marcas algo como real, la herramienta **no te deja
guardarlo** sin anotar de dónde sale. Si no lo sabes, lo marcas como inventado o modificado y ya
entra — que también es una decisión legítima. Así no se cuela un invento como si fuera un hecho.

**Decidido también:** hay **clave de API** para el motor, y se pone en Ajustes. El motor local se
queda como está: no sabe inventar, y **lo dice** en vez de fingirlo.

---

## 0.bis El pivote a UMBRA (ronda de correcciones)

El diseñador revisó el estudio y corrigió el rumbo. Esto manda sobre lo anterior.

### Alcance: qué entra y qué no

**Entra:** `cathedral`, `tt-creator-tool`, `tt-creator-tool-pwa`, `experiencias-offline`
(las voces para estos juegos) y **esta herramienta**.

**No entra:** `scene-harness-godot` y `ai-project-hub`. No tienen nada que ver.

**Y una crítica justa:** se pidió revisar **cuatro** repositorios y el agente auditó el disco
entero. De ahí salieron las dudas. No vuelve a pasar.

### El nombre (contradicción resuelta)

**UMBRA es el nombre definitivo.** «Argonautas» sustituye a «Time Travelers», que pasa a ser
parte del lore. **La Legión está formada por los Argonautas.**

### Las plantillas son ayuda documental, NO la primera fase

El diseñador tenía intentos de plantillas (Ficha de Enclave, SKILL-GEN-001) para la primera
parte del trabajo, **pero descubrió que la primera parte no es esa**: es lo que venía diciendo
desde el principio — **hay que empezar por el final**.

Por tanto las plantillas son **documentación para el agente**, aquí y ahora, para construir
esta herramienta usando esas ideas **mejor desarrolladas con IA**. La idea es **escalar** esas
ideas, no copiarlas.

**NO SE TIRA NADA.** Todo es información documental aprovechable.

### Decisiones de esta ronda

| Punto | Decisión |
| --- | --- |
| ¿Se gira Catedral-Nodos a la capa de grafo del Creator Tool? | **Sí.** Es la herramienta que falta. |
| ¿Se fusionan las dos Creator Tool? | **No.** Se detuvo la fusión: las dos tienen valor y no se quiere perder. |
| El misterio propuesto por el motor | **Se tira.** Es la fase B, y todavía no tenemos la fase A. Primero A, luego B. |
| Lo que el agente inventó con menos calidad | **Se fusiona**, mejorado. |
| Valencia / Sevilla / Barcelona | **Bocetos.** No hay nada definitivo de ninguna catedral. |
| Identificador del puzle | **Uno unificado** (por decidir cuál). |
| Número y duración de los puzles | **No se sabe.** Olvidar lo que se vio. |

### La primera fase es el grafo desde el final

Consecuencia directa, y ya implementada: **el lienzo no espera al misterio**. Antes de esta
ronda, la caja de diseño se bloqueaba hasta que hubiera misterio decidido; ahora solo exige la
premisa (la catedral). El misterio es posterior.

### Nota de honestidad sobre los tres «esquemas de elementos»

El agente afirmó que había tres esquemas de elemento incompatibles. El diseñador no supo a qué
se refería. Lo que hay, en realidad, son tres **momentos** distintos del mismo trabajo, no tres
esquemas en guerra: las secciones C.1–C.4 de la Ficha de Enclave (trabajo de campo), el
`datos_fisicos[]` del GDD §6.2 (el nodo ya diseñado) y los campos de POI de `tt-creator-tool`
(la herramienta que los captura). Se depurarán sin perder nada.

---

## 0.ter El GN-IEC y las decisiones que el diseñador delegó

El diseñador entregó una especificación propia —**GN-IEC, Grafo de Nodos de Investigación
Epigráfica y Conspirativa**— y pidió aplicarla al lienzo. Quedó construida: los **seis tipos de
nodo** con sus campos y sus enumeraciones, la **topología de diamante** del §3, y las **tres
condiciones de integridad** convertidas en validadores con pruebas.

### Lo que el GN-IEC enseña sobre el método

**El ancla es la herejía, no la piedra.** El lienzo abre por el **Núcleo filosófico** y camina
hacia atrás hasta el **Anclaje visible**: lo último que se diseña es la laja que el turista mira.
Eso es «empezar por el final», y ahora está en el código.

**El secreto no es una reliquia, es una herejía.** El §1 lo dice: la recompensa es una herejía
filosófica o una ruptura escolástica, «desprovista de magia». Eso corrige toda lectura de tesoro.

**Las salidas del §2 son las etiquetas de arista.** `latin_tokens`, `cipher_solution`,
`dead_end_resolution`, `dialectic_breakthrough`: lo que cada nodo entrega es lo que viaja por la
flecha. El campo `entrega` implementa eso.

### Decisiones tomadas por el agente (delegadas)

El diseñador respondió «no sé, decídelo tú» a dos preguntas estructurales. Se deciden así, con
razón, y quedan **fijadas en `npm test`** para poder revisarlas y revertirlas a propósito.

**1. La arista que faltaba: se añade.** El §2.6 declara para el núcleo filosófico dos entradas
(`dialectic_breakthrough` y `conceptual_clue`), pero el dibujo del §3 solo traía la flecha de la
divergencia. Se añade la arista del calambur al núcleo: **un PDC dibuja todas las dependencias
que su ficha declara**. Si el núcleo consume el `conceptual_clue`, esa flecha tiene que existir o
el gráfico miente sobre el diseño. Reversible: es una cadena.

**2. Un grafo = un anclaje.** El validador del §3 recorre «todo nodo `Anchor_Visible`», así que
está escrito para admitir varios en un mismo grafo. Pero el trabajo de campo también es por
anclaje (§4: una ficha, un solo `node_anchor_visible`), y **manteniendo un anclaje por grafo el
diseño siempre tiene un final claro por el que empezar**, que es el método. Una catedral tendrá
tantos grafos como elementos visibles tenga.

### Orientación del lienzo (decidido por el diseñador)

**Se queda izquierda→derecha.** Tu §3 se dibuja de arriba abajo, pero se mantiene la lectura
horizontal, que es la que funciona en pantalla ancha.

### Sigue abierto

- **El ejemplo del §4**: la laja, el arcediano Don Fernando, 1384, las cinco lises. ¿Es real
  —y entonces necesita fuente— o es hipótesis y hay que marcarlo?
- **Los dos ejes**: tema (Cuatro Columnas) y clase de nodo (GN-IEC) conviven hoy como ejes
  distintos. Puede que la clase de nodo sustituya al tema.
- **Los cuatro pilares del §1**: el diagrama va de la piedra al secreto, pero diseñar es al
  revés. ¿Son el orden de diseño o el orden en que lo vive el jugador?

---

## 0.quater La corrección del panel (y del reparto de trabajo)

El diseñador corrigió el rumbo otra vez, y con razón:

> *«No quiero que me pregunte qué quiero que el jugador descubra, ¡yo qué sé! Eso es lo que tiene
> que resolver el grafo como primera etapa. […] Al elegir Catedral de Valencia, me salen las
> opciones que tenemos en esa catedral, opciones que se han hecho previamente por parte del mapeo
> y opciones lingüísticas y todo lo que hablamos aquí respecto a los pilares.»*

**El error:** la herramienta pedía al diseñador que hiciera el trabajo del grafo. Si supiera qué
debe descubrir el jugador, no necesitaría la herramienta.

### El reparto de trabajo, explícito

> *«Hay que hacer que la IA haga una investigación previa profunda respecto a lo que hay,
> incluyendo los Apócrifos Convincentes, o sea ese 80%. Ese 80% es fundamental para que saquemos
> con este panel de nodos el 20% que falta.»*

- **La IA trae el 80%**: el material. Lo que hay en la catedral, documentado o por documentar,
  con los apócrifos convincentes, las opciones lingüísticas y los cuatro pilares.
- **El panel de nodos saca el 20%**: la deducción, la herejía, la conclusión.

### Lo que se construyó

1. **El panel izquierdo ya no pregunta nada.** Al elegir catedral enseña **su material**,
   agrupado por los cuatro pilares del §1, con la clase y el estado de cada opción.
2. **La investigación previa** (el 80%) con su botón, que trae candidatos.
3. **Un anclaje se abre en el lienzo**: su grafo se despliega desde el final.
4. **Retiradas de la interfaz** (el código se queda, no se borra): la hoja «Ficha de campo» y la
   hoja «Misterio». Estorbaban y duplicaban el nombre «material».

### LÍMITE HONESTO QUE HAY QUE RESOLVER

**El motor conectado no navega.** Es un `chat completions` sin acceso a la web, así que todo lo
que devuelva lo recuerda de su entrenamiento — y **una fuente inventada es indistinguible de una
verdadera**. Por eso:

- El prompt le **prohíbe inventar fuentes**: si no puede citarla, debe dejar `fuente` vacío y
  marcar `por_verificar`.
- El saneado **degrada a `por_verificar`** toda opción que se declare documentada sin fuente, y
  lo cuenta en voz alta.
- Consecuencia: la investigación produce **candidatos**. Para que algo pase a `documentado` hace
  falta una fuente de verdad: un libro, el archivo, una ficha de campo, o **un motor con acceso a
  la web**.

Por eso el material de ejemplo del §4 entra **entero como `por_verificar`**: todavía no se ha
dicho si ese caso es real o es una hipótesis de formato.

---

## 1. El método: PDC (Puzzle Dependency Chart)

El diseño del gameflow es un **grafo de dependencias de puzles**: un DAG donde los nodos
son puzles y las flechas van del puzle A al B cuando lo que consigues en A te hace falta
para B. Lo usaron Ron Gilbert y Noah Falstein en LucasArts ([primer de JikGuard](https://www.jikguard.com/news/puzzle-dependency-graph-primer/),
[charla de Falstein en la GDC 2013](https://bh.gdcvault.com/play/1017978/The-Arcane-Art-of-Puzzle)).

**El PDC obliga a empezar por el final**, y no por gusto: un DAG que converge en un
objetivo no se puede dibujar sin fijar antes el objetivo, porque toda cadena de
dependencias tiene que terminar en algún sitio.

### Lo que el PDC nos obliga a replantear (abierto, sin decidir)

1. **Las aristas llevan etiqueta.** En un PDC la flecha dice *qué* te llevas (la llave, la
   lata de aceite, el acceso a una sala). Hoy nuestras aristas son anónimas: solo dicen
   "esto hace falta antes". Con mecánicas de inventario, esa etiqueta es el objeto.
2. **El nodo es un puzle.** Nuestros tipos actuales (`final`, `revelación`, `emoción`,
   `mecánica`, `lugar`, `pista`) son tipos de *intención de diseño*, no de puzle. Los
   objetos, los lugares y los NPC son otra clase de cosa: son etiquetas y contexto.
3. **La orientación del lienzo.** El PDC clásico se lee arriba→abajo con el objetivo
   abajo. Nuestro lienzo se lee izquierda→derecha con el final a la derecha. Es
   cosmético, pero está sin decidir.

### Lo que un PDC aporta como análisis (todavía sin construir)

- **Ramificación no lineal**: cuántos puzles están abiertos a la vez en cada capa. Es lo
  que evita que el jugador se atasque en un solo puzle.
- **Grado de entrada y salida** por nodo: si un puzle abre opciones o las cierra.
- **El grafo de ancestros**: en un puzle dado, qué hechos narrativos son *seguros* de
  mencionar porque con seguridad ya ocurrieron. Para una narrativa con giros y
  revelaciones, esto evita diálogos que se contradicen.

---

## 2. El orden del diseño (decidido)

| Paso | Pregunta | Quién contesta | Estado |
| --- | --- | --- | --- |
| 0 | ¿En qué catedral vamos a trabajar? | el diseñador, de su lista | **construido** |
| 1 | ¿Cuál de los misterios de esta catedral? | el diseñador | pendiente |
| 2 | ¿Qué tiene que estar resuelto antes? | los dos, puzle a puzle | pendiente |

La pregunta *"¿qué quieres que descubra el jugador?"* es de **respuesta abierta** y por eso
no se puede contestar en el vacío. Con la catedral ya elegida se vuelve contestable: deja
de ser "inventa un descubrimiento" y pasa a ser "¿cuál de los misterios que ofrece esta
catedral?". El problema nunca fue la pregunta: era **el orden**.

---

## 3. La regla del vínculo misterio ↔ catedral (decidido)

> **No podemos descubrir el Santo Grial en la catedral de Sevilla porque está en Valencia.**

El vínculo entre un misterio y una catedral **se documenta, no se supone**. Cada misterio
que entre en el diseño tiene que traer la fuente que justifique por qué pertenece a *esa*
catedral. Por eso:

- La lista de catedrales la da el diseñador; la herramienta no propone candidatas.
- Los misterios de cada catedral **nacen vacíos**. No los inventa la herramienta ni el
  agente: salen del estudio que se recopila con esta misma herramienta.
- `npm test` comprueba que ninguna catedral trae misterios inventados.

Hay **misterios universales** (el INRI está en cualquier iglesia) y **misterios locales**
que dependen de la catedral. Cuáles aplican depende de la catedral elegida.

### El ejemplo del INRI (del diseñador, sin decidir)

El jugador descubrirá algo cercano a **un misterio tipo secreto masónico que desconoce**.
Ejemplo que dio el diseñador: *el significado de la placa que le pusieron a Jesucristo en
la cruz*.

Nota estructural: un final así **no esconde un objeto, cambia los ojos del jugador**. La
placa ya está a la vista desde el principio; los puzles no sirven para encontrarla, sino
para ganar el derecho a releerla. Eso hace que el PDC se diseñe hacia atrás casi solo.

> Aviso: la lectura esotérica de *INRI* como sigla ("Igne Natura Renovatur Integra" y
> compañía) es **tradición esotérica, no historia documentada**. Si entra en el juego, hay
> que citarla con fuente o tratarla como invención nuestra.

---

## 4. El género

**Point-and-click en la vida real**, con estructura de **Escape Room**: una plantilla común y
contenido distinto por catedral. Hay **trama y personajes**, y el jugador está físicamente
allí — el juego lo comprueba. Se juega en el móvil mientras se recorre el edificio, muy cerca
de una audioguía, pero jugándola.

Mecánicas centrales del género:

- **Inventario**: se recogen objetos del escenario real (realidad aumentada) o de cajas
  ficticias —una llave, un papel, una linterna— y se guardan.
- **Usar X en Y**: arrastrar un objeto del inventario sobre un elemento del escenario.
- **Combinar X con Y**: unir dos objetos que por separado no sirven.
- **Árboles de diálogo**: hablar con NPC para sacar información, pistas o disparar eventos.

Estas mecánicas son las candidatas naturales a **etiquetar las aristas** del PDC (lo que
te llevas) y a definir la **ficha de cada puzle**. Sin decidir.

---

## 5. Vocabulario: la premisa

La catedral no es un puzle. Un puzle **se resuelve**; una premisa **se elige**. Por eso la
catedral es un tipo de nodo distinto, la **premisa**, y es la raíz del PDC.

Es una pieza que el PDC clásico **no tiene**: allí la raíz es siempre un puzle sin
dependencias. Es aportación nuestra, no del método.

---

## 6. Estado y deuda reconocida

**Construido:** el motor de despliegue progresivo, el layout por capas determinista, el
lienzo (pan/zoom/encuadre/lector/conexiones), el nodo Catedral con la pregunta 0, y la
autoría de piezas hacia atrás ("añadir lo que hace falta antes").

**Deuda reconocida:** el agente construyó antes de tiempo las 12 piezas de Dolores
Hidalgo y un final inventado (*«el jugador descubre que él es el siguiente cantero»*).
Ese contenido **no es una decisión del diseñador** y Dolores Hidalgo **no está en su
lista de catedrales**. Queda congelado y se sustituye en el paso 1, cuando se elija el
misterio de verdad.

**Consecuencia temporal:** sin misterios estudiados el despliegue y la autoría de puzles
no son alcanzables desde la interfaz, así que su prueba end-to-end está aparcada. Su
lógica sigue cubierta sin navegador en `npm test`.

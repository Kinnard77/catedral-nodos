# Decisiones de diseño

> **Para el método, lee [`NARRATIVA.md`](NARRATIVA.md).** Este documento es el registro
> histórico, ronda por ronda: sirve para saber *por qué* se decidió algo. Si hay contradicción
> entre los dos, **manda `NARRATIVA.md`**.

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

## 0.quinquies Lo acordado el 13 de octubre (turno largo con el motor)

**Regla de trabajo que pidió el diseñador:** *«dejar siempre en ficheros dentro del
proyecto las decisiones que se van tomando cada minuto, así no trabajamos a
ciegas»*. Lo que no está en un fichero, **para un agente no existe**.

### Varios agentes en el mismo repositorio

En este ordenador trabajan **varios chats/agentes** sobre `catedral-nodos` y **todos
commitean al mismo repo**. Comprobado: los commits `55d098a`…`1c58b94` los hizo otro
agente. La norma dura está en **`AGENTS.md`**.

**Un chat NO es un subagente.** El subagente lo lanzo yo, trabaja en mi tarea y me
devuelve el resultado: es un empleado. Otro chat tiene su objetivo y su contexto, y
no le puedo dar órdenes: es **otro turno**. Y su contexto es **capacidad
independiente**, mientras que un subagente sale de la misma cuenta. Por eso, para
el problema del diseñador —capacidad total—, **otro chat es mejor**.

### Los cuatro pilares: la explicación ES el filtro

Las definiciones del diseñador sustituyen a mis listas de ejemplos. **El mismo texto
que se lee en el «?» del panel es el criterio que se le da al motor**
(`PILARES.explicacion` + `filtrosDePilares()`): una sola fuente de verdad.

### El apócrifo convincente son DOS mitades

El diseñador lo corrigió: **no exige una fuente que se pueda ir a ver, exige que sea
googleable**. El motor está obligado a declarar **BASE REAL** e **INJERTO** por
separado. Sin base real nombrable no es un apócrifo: es una invención.

### El material se puede sacar en texto

Botón **«copiar»** en el panel: vuelca el material a markdown para pegarlo o
guardarlo. Existe porque el material vive en el localStorage del navegador y
**ningún agente llega ahí**.

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

---

## 7. La trama manda: corrección de un malentendido sobre el PDC

El diseñador corrige aquí una idea que se coló en los documentos y que **es falsa**.
Se deja escrito de dónde salió, para que no vuelva.

### De dónde salió el error

El PDC clásico describe el gráfico como un artefacto **de puzles**: los nodos son puzles y
las flechas son dependencias, y **los puntos de la trama se omiten salvo cuando son
críticos para resolver un puzle**. Ron Gilbert lo dice así en el artículo que cita el §1:
el gráfico no suele incluir *story beats*. El documento de referencia del diseñador lo
repite: *«salvo cuando sea necesario para el rompecabezas, los nodos no incluyen puntos de
la trama ni desarrollo de los personajes»*.

**Eso es una regla de legibilidad del dibujo, no una regla del juego.** Significa que el
gráfico se mantiene limpio para poder leer las dependencias — no que el juego no tenga
historia. El malentendido fue leer esa omisión de dibujo como ausencia de trama en el
método, y de ahí pasó a los documentos como si el PDC fuera una cadena de puzles.

### Lo decidido

**El PDC tiene dos partes.** Primero se crea el final; después se crea la serie de puzles
que lleva a él. Nuestra versión **no puede omitir la trama**, porque los puzles no son el
producto: son la forma de contar el final.

| | Antes (malentendido) | Ahora (decidido) |
| --- | --- | --- |
| Qué es el juego | Una cadena de puzles y acertijos | **Una historia** que se cuenta con puzles |
| Qué manda | El grafo de dependencias | **La trama**; el grafo la sirve |
| Qué es un nodo | Un puzle | Un puzle **con su razón en la trama** |
| Los personajes | Sin decidir | **Lo más importante**: sin ellos no hay emoción |
| Por qué existe el puzle | Para resolver algo | Para que la historia avance y se sienta |

**Trama, historia y personajes son lo primero.** El juego es del género *point-and-click en
la vida real* con estructura de escape room, pero **no se está haciendo una cadena de
acertijos**: se está contando una historia en la que el jugador piensa, resuelve y
descubre. La referencia de tono es *El Código Da Vinci*: una interpretación artística de lo
real, con personajes y con un «¿será verdad?» final.

### La regla que se deriva, y que sustituye a la pregunta que no se entendió

En el §6 se propuso que *un nodo sin mecánica nombrada no entra en el grafo*. Se retira esa
formulación: era técnica y no es lo que importa. La regla correcta es **narrativa**:

> **Un nodo entra si puedes decir en una frase qué papel juega en la trama.** Si no puedes,
> no es un puzle: es relleno.

Y el caso que el diseñador señaló como intocable:

> *«No es buscar un escudo porque sí. ¿Para qué debe buscar un escudo? ¿Qué sentido tiene en
> la historia y en la trama?»*

Un objeto, un lugar o un NPC **nunca son la meta**: son el medio. La meta siempre es un
hecho de la historia. Esto **corrige de raíz** la formulación del §4, que presentaba el
inventario y el «usar X en Y» como mecánicas candidatas a definir la ficha de cada puzle:
las mecánicas son **cómo** se resuelve; la trama es **por qué** existe.

### El reparto 80/20, corregido

El §0.quater dice que la IA trae *el material* y el panel saca *la deducción*. Es cierto,
pero estaba mal explicado para qué sirve cada mitad:

- **El 80% (el material real, con fuente) está para que la historia construida parezca
  verdadera.** Es lo que sostiene el «¿será verdad?» sin mentir.
- **El resto está para darle el toque épico y misterioso.**

O sea: el material no es el contenido del juego, es **el suelo que hace creíble la
historia que inventamos encima**. Sin esa mitad, la ficción no se sostiene; con solo esa
mitad, no hay juego.

### El criterio comercial

**Los temas tienen que ser atractivos comercialmente.** No se sacan temas aburridos. Esto
entra como requisito, no como gusto: el producto final tiene que tener éxito. Y todo tiene
que ser **coherente y ajustado a una trama**.

> Tensión reconocida, sin resolver: la plantilla dice que la estructura, las mecánicas y el
> **tipo de final** son comunes a las ~50 catedrales. Si el final es el mismo tipo en todas,
> el atractivo comercial tiene que venir del **misterio concreto y del material de cada
> catedral**, no de la forma. Conviene medirlo cuando haya dos o tres diseñadas.

### El juego empieza dentro de la catedral

**El juego empieza en la catedral, cuando ya estás dentro.** Y la experiencia es la de una
**audioguía con enigmas**: haces turismo, piensas y descubres.

De ahí una consecuencia de forma que conviene tener presente en el lienzo:

> Si el jugador recorre los anclajes y el final es **releer con otros ojos** una pieza que ya
> estaba a la vista desde el principio (el caso del INRI del §3: *«un final así no esconde un
> objeto, cambia los ojos del jugador»*), entonces **el final del diseño y el principio del
> recorrido son la misma pieza**. El grafo no es una escalera que va de un sitio a otro:
> **empieza y termina en el mismo nodo**, y lo que cambia no es el lugar sino la lectura.

### Lo que un puzle sin trama produce

Si un puzle no tiene papel narrativo, el jugador resuelve y **no siente nada** — que es
exactamente lo que el diseñador rechaza. Ese es el síntoma que hay que perseguir en la
herramienta.

### El recorrido no es negociable

El §4 dice que si el jugador no hace el recorrido propuesto **no puede seguir el hilo
conductor**. El diseñador lo confirma y lo precisa: es como una audioguía — **si el turista
no va a donde la guía le propone, se está perdiendo la historia, está fuera.** Por tanto:

- La no linealidad del PDC (varios puzles abiertos a la vez) sirve para que el jugador **no
  se atasque**, no para que elija el argumento.
- **Se elige el orden, no el destino.** El diamante da control sobre *en qué trabaja ahora*;
  el cuello de botella devuelve a todos al mismo hilo.

### Sobre los dos estilos de PDC (pregunta del diseñador)

Existen dos formas conocidas de dibujarlo, y la respuesta es **la primera**, sin que sea
cuestión de gusto:

| | Estilo 1 (Ron Gilbert) | Estilo 2 (Josh Weinberg) |
| --- | --- | --- |
| Nodos | Cerraduras **y** llaves, con color por clase | Solo cerraduras |
| Aristas | Dicen **qué te llevas** | Son las llaves, con texto en todas |
| Ejes que caben | Varios (tipo, tema, personaje, objeto) | Uno (la llave), o ninguno |
| Para qué sirve | **Diseñar** | **Analizar** un juego ya terminado |

**Usamos el estilo 1.** Tres razones concretas:

1. **Es el que puede cargar la trama.** Con nodos de color se distingue de un vistazo si un
   nodo es un puzle, un personaje o un objeto; con el estilo 2 todo se aplana a «llave» y la
   historia desaparece del dibujo.
2. **Es el que se puede editar.** El §6 pide partir y fusionar nodos para ajustar duración y
   complejidad. Partir un nodo es trivial si el nodo es la unidad; en el estilo 2 el peso cae
   en las aristas y no hay dónde cortar.
3. **Es el que se puede construir.** Cada nodo se convertirá en una **escena de Godot**, con
   su id, su clase, sus textos y sus cinco idiomas. Un nodo es una entidad que existe; una
   arista es una relación. Solo lo primero se puede versionar y traducir.

**El estilo 2 se construye como vista de auditoría**, no como forma de diseñar: es lo que
permite leer de un golpe si un diamante cierra bien.

### Sin cambios

- **Los 90 minutos siguen siendo reales pero NO son restricción dura ahora.** Se ajustan
  **después de tener la trama**. El lienzo no tiene que ser una calculadora.
- **La prioridad de este momento es la narrativa**: la trama, la historia y el misterio,
  coherentes y nada aburridos.

### Tres correcciones de alcance (ronda actual)

| Se dijo | Se corrige a |
| --- | --- |
| Los cinco idiomas son una carga estructural | **No es preocupante.** El jugador **elige el idioma al principio**, como en cualquier videojuego. El modelo guarda los textos por idioma y eso ya está bien; deja de ser un riesgo de diseño. |
| El material tiene que estar todo documentado | **No somos historiadores y no pretendemos tenerlo todo documentado.** Solo se documenta **el 80% que sostiene los cuatro pilares**. El resto puede ser invención declarada. |
| La herramienta está por hacer | **La herramienta ya está muy avanzada** (en GitHub). El trabajo de esta ronda es **afinarla**, no rehacerla. |

---

## 8. La forma de la trama (decidido)

> *«Imagínate la película de El Código Da Vinci sin trama.»*

Eso es lo que se está creando: **una aventura de investigación con trama**, para dar otro
sentido a la visita a una catedral siendo turista real. No es una audioguía más: es lo que
hace que el turista **vea y entienda cosas que sin el juego no vería**.

### Las dos fases, en orden

| Fase | Qué produce | Estado |
| --- | --- | --- |
| **1** | **El final de la trama.** Se afina la herramienta para esto. | Ahora |
| **2** | **Los puzles y los dilemas** que resuelven los turistas ya convertidos en investigadores. | Después |

### La forma decidida

| Pregunta | Decidido |
| --- | --- |
| ¿La trama ramifica? | **No.** La historia es **una sola secuencia obligatoria** de hechos, con personajes, en un orden. Nadie elige un final distinto. |
| ¿Y los puzles? | **Paralelos.** Varios abiertos a la vez, y el jugador elige en cuál trabaja. |
| ¿Quién es el jugador? | **Un turista real al que la trama convierte en investigador de última hora.** |
| ¿Qué elige el jugador? | **El orden, nunca el destino.** |

**Consecuencia para el diamante del PDC** (esto corrige cómo lo veníamos leyendo): el
**cuello de botella no es un puzle, es un hecho de la trama**. Los puzles son la expansión en
paralelo; el hecho narrativo es la contracción. Cada hecho de la trama se dispara cuando hay
suficientes puzles resueltos, y devuelve a todos al mismo hilo.

Así las dos exigencias dejan de chocar: hay no linealidad **para que el jugador no se
atasque**, y el hilo conductor **no se rompe nunca**.

| | Qué es | Cómo se comporta |
| --- | --- | --- |
| **Hecho de trama** | Un momento de la historia, con personajes | Obligatorio y en orden, un solo camino |
| **Puzle** | Una investigación sobre la catedral | Varios a la vez, el jugador elige el orden |

### Lo que el sistema de nodos necesita para esto (propuesto, sin decidir)

El sistema de colores elegido puede cargar esto, pero **hoy no distingue un hecho de la
trama de una investigación**: `final`, `revelacion`, `emocion` son intenciones de diseño, y
`premisa`, `anchor`, `epigraphy` son clases del GN-IEC. **Ninguna dice «esto es un hecho de
la historia»**, y sin esa distinción el lienzo dibuja juego y trama como si fueran lo mismo.

Mínimo que hay que añadir:

1. **Una clase de nodo para el hecho de trama**, separada de la clase de puzle. Es lo que
   permite ver el hilo de la historia de un vistazo sobre el grafo.
2. **El hecho de trama lleva a quién afecta o quién aparece** (personajes). Sin personajes no
   hay emoción, y el diseñador ha dicho que son lo más importante.
3. **El puzle lleva su dilema**: qué tiene que decidir el investigador dentro de ese puzle.
   Es el vocabulario que el diseñador ya usó para la Fase 2.

### El final: es una RELECTURA, no un objeto (decidido)

> *«El clímax y el desenlace es una relectura. No es un objeto. Quiero que el jugador diga
> ¡!! ahhhh, ya entendí, lo teníamos enfrente y no lo vimos!»*

Eso es el final, y es el **criterio de éxito** de toda la Fase 1: si el jugador no tiene ese
momento, el final no está bien diseñado.

**El mecanismo es la relectura.** La pieza ya estaba **a la vista desde el principio** — de
ahí el «lo teníamos enfrente» — y el juego no sirve para encontrarla sino **para ganar el
derecho a releerla**. Lo que cambia al final no es lo que hay en la catedral: es **lo que
significa**.

### LAS CINCO PIEZAS DEL FINAL — aprobadas con corrección, ahora sí concretadas

El diseñador no las aprobó porque no las entendió. Aquí van explicadas con lo que ya existe:

| Pieza | Qué es en la práctica | De dónde sale |
| --- | --- | --- |
| **1. Lo que descubre** | La verdad que se revela al releer. | Es el `descubrimiento` que ya existe en `domain/misterio.js` |
| **2. Lo que se relee** | **Una pieza que el turista ya vio al entrar**, que ya está en el material como **anclaje visible**. | Es el campo que **falta** en el misterio |
| **3. Cambio de mirada** | Qué pasa a significar esa pieza. Es el «!!! ahhhh, ya entendí» y el «¿será verdad?». | Es la `duda` que ya existe en `misterio.js` |
| **4. Cierre** | La sensación final: épica y misteriosa. | Prosa, sin campo todavía |
| **5. Transformación** | El turista acaba investigando. | Prosa, sin campo todavía |

**Por qué la pieza 2 es la que manda:** es la única que **obliga al final a derivarse del
principio** en vez de inventarse. Y no hay que inventarla — **ya está en la mesa**, porque el
material tiene el anclaje visible como clase de opción. El final se sostiene en algo que el
jugador tuvo delante desde el primer minuto.

**La regla que se implementa con esto:** la herramienta **no deja cerrar el desenlace sin
decir qué pieza visible se relee** («lo que se relee» no puede quedar vacío). Es comprobable
y es lo que garantiza el «lo teníamos enfrente».

### La mecánica del juego: las dos (decidido)

Es **ambas a la vez**, como un videojuego de escape room:

1. **Deducir** — objetos reales y objetos inventados **dentro del contexto de la catedral y
   de la trama inventada**.
2. **Recoger objetos (inventario)** — útiles para resolver puzles.

### El inventario: la corrección que manda sobre las mecánicas

Hubo un malentendido y queda resuelto:

> *«Sí, hay inventario. Si es necesario en la trama tener que buscar una espada, claro que sí
> entra la espada. Me refería a que **si no está en la trama, no hay espada posible**.»*

O sea: el inventario y el «usar X en Y» **son legítimos**. Lo que no es legítimo es un objeto
que **no está justificado por la trama**.

**Y hay una segunda condición, sobre la catedral:**

> *«No podemos jugar a que encontramos el Santo Cáliz en la catedral de Burgos porque ahí no
> está el Santo Cáliz.»*

Son **dos puertas, y las dos tienen que pasar**:

| Puerta | Pregunta | Si falla |
| --- | --- | --- |
| La trama | ¿Hace falta este objeto **en la historia**? | Es relleno: no entra |
| La catedral | ¿Puede estar **ahí**, con fuente? | Es una invención mal puesta: no entra |

Esto **corrige** la lectura anterior del §7, que decía que un objeto no podía ser la meta. Un
objeto **sí puede ser una meta intermedia** (`necesito la espada`). Lo que no puede es ser
**el final**: el final es la relectura.

### La herramienta NO pregunta el final: lo DISEÑA (aclarado)

Es lo que más se había entendido mal, y queda fijado:

> *«La herramienta NO tiene que preguntar el final, la herramienta es para diseñar el final.
> Es para el diseñador (fase 2) que no sabe todavía qué misterio conviene.»*

**La Fase 1 no le pide al diseñador que diga el desenlace.** La Fase 1 **investiga todo lo
necesario para definirlo**. Cuando el desenlace ya está definido, se pasa a cómo conseguirlo.

Y esto ya está construido a medias, que es la buena noticia: es exactamente la idea de
`domain/misterio.js`, donde **el motor propone candidatos a partir del material y el diseñador
elige** — en lugar de pedirle que invente un descubrimiento en el vacío.

### Lo que la Fase 1 tiene que ENTREGAR (criterio de terminado)

La Fase 1 está terminada cuando la herramienta ha producido estas cinco cosas:

1. **El desenlace**, con sus cinco piezas: lo que descubre, **lo que se relee**, el cambio de
   mirada, el cierre y la transformación.
2. **La secuencia de la trama**: los hechos en orden, con sus personajes. Lineal, un solo
   camino.
3. **La lista de lo que es relectura y lo que es nuevo**: separar lo que ya estaba a la vista
   de lo que se añade, porque de esa separación depende el «lo teníamos enfrente».
4. **El material documentado que lo sostiene**, atado al material real de esa catedral.
5. **Nada sin justificar**: cada objeto y cada afirmación pasan las dos puertas (trama y
   catedral).

Si falta cualquiera de las cinco, la Fase 1 no ha terminado y no se pasa a la Fase 2.

### Lo que es Fase 2 (no ahora)

La app del jugador en **Godot 4.7**, para móvil, con look and feel de videojuego y mecánicas
tipo escape room. El diseñador la comparte cuando se llegue a esa fase.

# REVISIÓN — ¿tiene la herramienta lo necesario para crear el desenlace?

Revisión hecha leyendo el código, no la documentación: los tres prompts del motor
(`investigacion.js`, `misterios.js`, `llmProvider.js`), el modelo de dominio (`material.js`,
`misterio.js`, `lesson.js`, `gniec.js`) y el puente al lienzo. Con `npm test` en verde.

---

## El veredicto en una línea

> **Tiene todo para crear un MISTERIO y nada para crear un DESENLACE.**
> Y el método dice «empieza por el final»: **el final es el único sitio del modelo que está
> vacío.**

---

## 1 · ¿Tiene todo lo necesario para crear el final?

**No.**

**Lo que sí tiene**, y está bien hecho: el material con fuentes, y candidatos a misterio con
cuatro campos — `descubrimiento`, `encaje`, `sostienen` y **`duda`**.

**Lo que falta para el desenlace, exactamente:**

| Falta | Dónde debería estar | Estado |
| --- | --- | --- |
| **La relectura** | `NARRATIVA.md §5.3` la pone como regla y `§7` pieza 2 la pide | **No hay campo, no hay comprobación y no está en ningún prompt** |
| **Que el `FIN` sea una pieza que se ENTIENDE** | Regla de `PDC.md §2` | En `SYSTEM_PROMPT` el paso 1 es «la pieza que lleva **ancla**». Pero `anchor` es una **clase del GN-IEC** —el objeto visible—, **no «el jugador comprende»**. La regla está decidida y **no aplicada** |
| **Personajes y arco** | — | No existen en el modelo |
| **Validación del grafo** | Condiciones de `PDC.md §4` | Nada comprueba que todo llegue al final, que nada sea peso muerto, el arrastre ni los ciclos |

---

## 2 · ¿Esta herramienta comprende su objetivo?

**El MÉTODO sí. El PRODUCTO no.**

**El método está codificado con precisión**, y eso es difícil de hacer bien:

- El diseño inverso manda sobre todo lo demás, y el paso 1 es siempre el final.
- *«Un dependiente aparece siempre antes que sus prerrequisitos, nunca después.»*
- *«El Santo Grial está en Valencia: si el material no lo sostiene, no lo propongas.»*
- *«NO INVENTES FUENTES… una fuente inventada es peor que no tener fuente: envenena el juego
  entero.»*
- Las cuatro reglas paleográficas (titulus polivalente, inversión palindrómica, acróstico de
  sillar, puntuación ficticia).

**Pero el producto no aparece por ningún lado.** Medido:

> En los **seis ficheros de `src/classifier`** — todo el cerebro de la herramienta —
> las palabras **«trama», «personaje», «relectura», «arco» y «protagonista» aparecen CERO
> veces.**
> La única coincidencia es el enum `"final | revelacion | emocion | mecanica | lugar | pista"`:
> **«emoción» existe como valor permitido de un campo, nunca como instrucción.**

Y hay una contradicción declarada: `SYSTEM_MISTERIOS` dice **«juego didáctico de misterio»**,
que **no es el producto decidido** en `NARRATIVA.md §1` — *«una aventura de investigación con
trama»*, con la referencia de tono de *El Código Da Vinci*.

> **Sabe cómo construir el grafo. No sabe qué está construyendo.**

---

## 3 · ¿Tiene IA integrada para que comprenda su objetivo?

**Sí, y está bien puesta.** Gemini por la API nativa, con dos variantes:

- **sin búsqueda**: responde de memoria, y por eso se le exige que **no certifique nada**.
- **con búsqueda** (Google Search): *«Usala: no respondas de memoria»*, y **las citas se
  comprueban contra las fuentes realmente consultadas** — una que no aparezca **se rechaza sola**
  y la opción baja a `por_verificar`.

Y el motor local **no finge**: dice que no sabe inventar en vez de inventar.

---

## 4 · ¿Es inteligente?

**Es honesta, que en este oficio vale más que ser inteligente.** Tiene tres defensas que la
mayoría de herramientas de IA no tienen:

1. **El prompt prohíbe inventar fuentes**, y avisa de que no citar es una respuesta correcta
   *«y es la que se espera de ti la mayor parte del tiempo»*.
2. **El saneado degrada** a `por_verificar` toda opción que se declare `documentado` sin fuente.
3. **`normalizarMisterio` descarta los ids que el motor se inventó y los cuenta** — literalmente
   *«para poder decir en voz alta que el motor se pasó de la raya»*.

**Esto es lo mejor del repositorio.** No es inteligencia: es **disciplina**, y es la que hace que
el juego pueda decir *«¿será verdad?»* sin mentir.

---

## 5 · ¿Qué opino de la herramienta?

**Es una máquina excelente para un trabajo definido a medias.**

La arquitectura es la correcta: material → misterio → grafo, con el diseñador decidiendo en cada
paso y el motor proponiendo. Y la disciplina anti-alucinación está mejor resuelta que en
proyectos mucho más grandes.

**Pero el método tiene una asimetría que hay que arreglar:** empieza por el final y **el final es
lo único que no tiene campos**. Hoy la herramienta **sabe bajar del final hacia atrás**, pero
**el final que le das es un misterio, no un desenlace** — y son cosas distintas:

> **El misterio es QUÉ se descubre.** Eso la herramienta lo tiene.
> **El desenlace es CÓMO SE SIENTE al descubrirlo.** Eso no lo tiene.

---

## 6 · ¿Qué funciona mal?

**a) El desenlace no está en el modelo.** Es la respuesta a la pregunta 1 y el problema nº1.

**b) «didáctico» contradice el producto.** Está en `SYSTEM_MISTERIOS` y tira el diseño hacia
lección en vez de hacia thriller.

**c) Dos vocabularios para lo mismo.** `material.js` define `PILARES` con ids
(`anclaje_visible`, `apocrifo`, `dualidad_gremios`, `secreto_filosofico`), pero **en los datos
reales el campo `subject` dice `filosofia`** (visto en `gniec-ejemplo.js`). Y **los nodos del
grafo no llevan el pilar**, así que **no se ve el injerto del apócrifo sobre la base googleable**
— que es exactamente la tarea pendiente de `ESTADO.md §0` y el motivo de exportar a `.graphml`.

**d) No hay validación del grafo.** Nada comprueba las cuatro condiciones de `PDC.md §4`.

**e) Lenguaje heredado de `academia-nodos`.** `SYSTEM_PROMPT` pide bloques `markdown`,
`formula`, `codigo`, `lista`, `nota`, `aviso`, `datos`, `quiz`, y un campo `role` con valores
`fundamento | nucleo | practica | extension`. **Eso es el vocabulario de un curso, no de un
thriller.** Quedó del clon y no se ha limpiado.

---

## 7 · ¿Qué funciona bien?

1. **Los cuatro pilares como esqueleto de investigación**, cada uno con su pregunta de mapeo
   literal en `material.js`.
2. **Los tres estados** (`documentado` / `por_verificar` / `inventado`) y la regla de la fuente.
3. **La disciplina anti-alucinación** con la comprobación de citas contra la búsqueda real.
4. **El campo `duda`** — *«la pregunta que le queda al jugador al final. El juego no la
   responde.»* **Eso es la pregunta que no se puede cerrar de *El Código Da Vinci*, y ya está en
   el modelo.** No hay que inventarlo: hay que aprovecharlo.
5. **La regla de que el misterio se sostiene en elementos reales**, con los inventados
   descartados y contados.
6. **El diseño inverso** con el ancla como paso 1 y el dependiente siempre antes que sus
   prerequisitos.
7. **25 secciones de test y 11 e2e, en verde.**

---

## Lo que yo haría, por orden

**No falta más IA. Faltan cuatro campos y una comprobación.**

1. **El campo «lo que se relee»** en el misterio, elegido **del material de la columna 1**, con
   una puerta que impida cerrar el desenlace sin él. *Es `NARRATIVA.md §9.1` y sigue siendo lo
   primero.*
2. **Pedirlo en el prompt de misterios**: que cada candidato diga **qué pieza que el turista ya
   vio al entrar cambia de significado al final**. Sin eso, el motor no puede proponer
   relecturas porque nadie se lo ha pedido.
3. **Quitar «didáctico»** y poner el producto: aventura de investigación con trama.
4. **Que el paso 1 del diseño inverso sea una pieza de comprensión**, no un objeto visible.
5. **Enchufar la validación** de las cuatro condiciones, y **que el nodo herede el pilar** al
   nacer de una opción de material — con eso el `.graphml` se colorea y **se ve el injerto**.

**Los puntos 1, 3 y 5 son baratos.** El 2 es cambiar tres frases de un prompt y es el que
desbloquea todo lo demás.

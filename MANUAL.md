# MANUAL — cómo se opera el panel, paso a paso

Escrito para responderte a una sola pregunta: **¿qué tengo que ir haciendo para comprender el
avance?**

Cada paso dice tres cosas: **qué haces**, **qué ves** y **cómo sabes que has avanzado**.

---

## Antes de empezar: qué es este programa

No es el juego. Es **la mesa donde se diseña el juego**.

Está construido sobre una idea que manda sobre todas las demás:

> **El diseño va DEL FINAL HACIA ATRÁS.**
> Primero se fija qué descubre el jugador al final. Y desde ahí se pregunta, una y otra vez:
> **¿qué tiene que estar resuelto ANTES?**

Eso es un **PDC** (*Puzzle Dependency Chart*). El lienzo abre **por el final**, no por el
principio, porque el método va en esa dirección.

**Y la otra idea que manda:** *la herramienta pregunta, el diseñador contesta.* El motor propone
y tú decides. **Nunca al revés.**

---

## Paso 0 · Arrancarlo

```bash
npm install
npm run dev
```

**Qué ves:** el lienzo en **http://localhost:5199**.
**Cómo sabes que va:** carga el panel con tres zonas — la **intención de diseño** a la izquierda,
el **lienzo** en el centro y la **secuencia** a la derecha.

---

## Paso 1 · La pregunta 0: **¿en qué catedral vamos a trabajar?**

Es la primera pregunta y **bloquea todo lo demás**. Y no es un formulario: es el **fundamento del
método**.

> **La catedral decide qué misterios existen.**
> No se puede descubrir el Santo Grial en Sevilla, porque está en Valencia.

**Qué haces:** eliges la catedral.
**Qué ves:** el panel se desbloquea.
**Cómo sabes que has avanzado:** ya tienes **el escenario real** donde se juega, y con él **el
límite de lo que se puede contar**.

---

## Paso 2 · La llave del motor, en Ajustes

**Qué haces:** Ajustes → pegas la clave de Google AI Studio (`AQ…`) → eliges modelo.
**Qué ves:** la lista de modelos disponibles.

**Por qué hace falta:** el **motor local no sabe inventar**, y **lo dice en vez de fingirlo**.
Inventar material sobre una catedral es lo único que no se puede hacer sin motor.

---

## Paso 3 · Poner el material sobre la mesa

**Esto es la investigación**, y es el corazón de la Fase 1.

**Qué haces:** pides la investigación. El motor devuelve **opciones** de esa catedral.
**Qué ves:** las opciones **organizadas por los cuatro pilares**:

| Pilar | La pregunta que contesta |
| --- | --- |
| **Anclaje en lo visible** | ¿Qué hay a la vista y al alcance del público? |
| **Apócrifo convincente** | ¿Qué se puede sostener con fuentes, y qué deducción oculta se le puede colgar? |
| **Dualidad de gremios** | ¿Dónde choca la autoridad que impone el dogma con los artífices que labran la materia? |
| **Secreto sin magia** | ¿Qué herejía filosófica se puede plantear, sin nada sobrenatural? |

**Y cada opción trae su estado** — y esta distinción es la que sostiene todo el juego:

- **`documentado`** → tiene fuente. **El juego puede afirmarlo.**
- **`por_verificar`** → propuesto, sin fuente comprobada. **El juego NO puede afirmarlo todavía.**
- **`inventado`** → nuestro, **y declarado como nuestro.**

**La regla de oro:** *la IA propone, el diseñador confirma.* **Solo tu mano pasa algo a
`documentado`.**

**Cómo sabes que has avanzado:** tienes sobre la mesa **el suelo real** sobre el que se puede
construir. Y sabes **qué parte del suelo está firme y qué parte no**.

> **Y aquí está la clave de la credibilidad:** lo googleable **no es el enemigo, es el ancla**.
> Si el jugador busca en Wikipedia y **encuentra el material real**, el apócrifo que le colgamos
> encima **se vuelve verosímil**. La credibilidad no viene de esconder: viene de que **lo real sea
> comprobable**.

---

## Paso 4 · El motor propone misterios, tú eliges

**Qué haces:** pulsas para que el motor proponga misterios **a partir del material**.
**Qué ves:** entre **3 y 5 candidatos**, cada uno con:

| Campo | Qué es |
| --- | --- |
| **titulo** | Corto y con gancho |
| **descubrimiento** | Qué descubre el jugador, exactamente |
| **encaje** | Por qué **este** misterio le corresponde a **esta** catedral |
| **Lo que se relee** | ⭐ **La pieza que el turista YA VIO al entrar y que cambia de significado al final** |
| **sostienen** | Los ids **exactos** del material que lo aguantan |
| **duda** | La pregunta que le queda al jugador. **El juego no la responde** |

**Y las reglas que el motor tiene que cumplir:**

1. **Un misterio solo vale si está SOSTENIDO por material.** Sin material no existe.
2. **El descubrimiento final tiene que ser una IDEA, no un objeto ni un sitio.**
   *«El Grial es el símbolo de lo femenino y representa una descendencia»* **es una idea**.
   *«El Grial está en Valencia»* **es un dato, y un dato no asombra a nadie**.
3. **Tiene que producir ASOMBRO:** el jugador piensa *«¡eso no lo había pensado así!»*.
4. **La relectura sale del material de la columna 1**, que es **lo que ya está a la vista**.

**Cómo sabes que has avanzado:** tienes **candidatos a desenlace**, no ocurrencias. Y cada uno
dice **en qué se apoya**.

### Y si un candidato llega incompleto, **la herramienta lo ARREGLA**

**Esto es importante y es nuevo.** La herramienta **no rechaza: resuelve.**

Si un candidato llega mal, **no se tira**. Se le devuelve al motor diciéndole **exactamente qué le
falta**, y con **el material delante** para que pueda arreglarlo:

| Si el motivo es… | La herramienta pide… |
| --- | --- |
| *no se apoya en ningún elemento del material* | **que lo ancle** en los ids reales |
| *le falta título o descubrimiento* | **que los escriba** |
| *no tiene relectura* | **que la escriba** |

> **Si falta el material se busca, si falta el título se propone, y si falta la relectura se
> escribe. Para eso está la investigación.**
> Es la diferencia entre **un corrector que tacha y uno que corrige.**

Y si la reparación falla, **no se pierde lo que ya estaba bien**.

**Referencias de tono: *El Código Da Vinci* y *El nombre de la rosa*.**

---

## Paso 5 · Del material al grafo: **ver el grafo**

**Qué haces:** sobre un anclaje, pulsas **«Ver el grafo»**.
**Qué ves:** el grafo se construye **con el material de la mesa** y se despliega **abriendo por el
FINAL**.

**Cómo sabes que has avanzado:** **el final ya está en el lienzo.** Es el nodo del que cuelga todo
lo demás — y hasta ahora no existía.

> **Este es el punto de control más importante de todo el manual.** Si el lienzo abre por el
> final, el método se está aplicando. Si abre por el principio, el diseño va al revés.

---

## Paso 6 · Bajar: **ver continuación**

**Qué haces:** pulsas **«ver continuación»** en un nodo.
**Qué ves:** aparecen **las piezas que tienen que estar resueltas antes**.

**Cómo sabes que has avanzado:** cada pulsación **aleja del final y acerca al principio del
juego**, que es exactamente la dirección del método.

**Y cuando falte algo que el catálogo no tiene:** pulsas **«＋ Añadir lo que hace falta antes»**
sobre cualquier nodo, describes la pieza, eliges su tipo y su concreción, y **queda enlazada como
prerrequisito suyo**. La pieza nueva pasa a ser la activa, así que volver a pulsar **sigue bajando
un nivel**.

---

## Paso 7 · Que no se pierda nada

**Qué haces:** nada. Todo se guarda **en el navegador**.
**Cómo sabes que va:** **recargas la página y sigue ahí.**

---

## Paso 8 · Sacarlo a la luz: el `.graphml`

**Qué haces:**

```bash
npm run graphml
```

**Qué ves:** los grafos exportados a **`dist/graphml/*.graphml`**.

**Y entonces los abres en yEd** (gratis, de yWorks):
**File → Open → el `.graphml` → Layout → Hierarchical.**

**Cómo sabes que has avanzado:** dejas de mirar el grafo por la ventana del navegador y **ves su
FORMA entera de un golpe.** Los nodos van coloreados, y las aristas por tipo.

> **La comprobación de un segundo:** si el dibujo sale **en una sola columna**, no tienes un
> juego: tienes un guion. **Un grafo sano tiene abanicos que se abren y vuelven a cerrarse.**

---

## Paso 9 · Comprobar que nada se ha roto

```bash
npm test          # lógica: catálogo, diseño inverso, despliegue hacia atrás, layout, anti-alucinación
npm run test:e2e  # flujo completo en Chrome headless
npm run build     # compila
```

**Cómo sabes que va:** los dos dicen **EN VERDE**.

---

## Los cuatro controles que dicen si el diseño va bien

Se pueden hacer **sin abrir el navegador**, mirando el grafo. Son las cuatro comprobaciones de
forma (ver [`PDC.md`](PDC.md) §4):

| # | Control | Qué detecta |
| --- | --- | --- |
| 1 | **Todo nodo llega a `FIN`** | Piezas que cuelgan sueltas y **el diseño inverso nunca revelaría** |
| 2 | **Todo nodo desbloquea algo** | Piezas que no abren nada: relleno |
| 3 | **El arrastre de cada nodo** | Cuántas capas pasan entre que consigues algo y lo gastas |
| 4 | **¿Hay ciclos?** | A necesita B y B necesita A: **ninguna puede ser la primera** |

**Y la regla del final, que es la que más importa:**

> **El `FIN` tiene que ser una pieza que se ENTIENDE, no un puzle.**
> Si el último nodo es un puzle, el juego termina en tarea. **Si es una comprensión, termina en
> revelación.**
> Y el jugador **se la lleva**: un `info` **sigue reflexionándose días después**. Un puzle
> resuelto se cierra; **una relectura se queda abierta.**

---

## En una frase

> **Catedral → material por los cuatro pilares → misterios con relectura → grafo desde el final
> hacia atrás → y sacarlo a yEd para ver la forma.**

**Y lo que estás buscando en cada paso es una sola cosa:**
> **que el turista, al final, piense «¡eso no lo había pensado así!»**

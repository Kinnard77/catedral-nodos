# AGENTS — LEE ESTO ANTES DE TOCAR NADA

## EN ESTE REPOSITORIO TRABAJAN VARIOS AGENTES A LA VEZ

**No eres el único.** En este ordenador hay **varios chats/agentes** trabajando el
mismo proyecto (`catedral-nodos`) **al mismo tiempo**, y **todos hacen commits a
este mismo repositorio**.

No es una suposición. Está comprobado: los commits `55d098a` … `1c58b94`
(04:54–05:27) los hizo **otro agente**, distinto del que estaba en esa sesión. Y
sus arreglos eran buenos: la investigación que sumaba en vez de borrar, la
condición «A LA VISTA» del pilar 1, el botón «+» por pilar.

## REGLAS DURAS

1. **LEE ANTES DE ESCRIBIR.** Antes de editar un fichero: `git log --oneline -8` y
   `git status`. Si hay cambios que no has hecho tú, **son de otro agente**:
   respétalos y constrúyelos, no los pises.

2. **NUNCA sustituyas un bloque entero «para limpiarlo».** Otro agente puede
   haberlo mejorado por dentro. Ya casi pasó: se estuvo a punto de borrar la
   mejora del pilar 1 («A LA VISTA, no al alcance de la mano») al reemplazar el
   prompt de investigación completo. **Lee el bloque antes de reemplazarlo.**

3. **Nunca uses PowerShell `Set-Content` ni `Out-File` para ficheros de código.**
   Corrompen acentos y caracteres raros, y el daño no siempre se ve. Ha pasado
   **dos veces**. Usa las herramientas de edición, o un script de Node.

4. **Comprueba antes de inferir.** No digas «leí mal» ni «me quedé sin contexto»
   sin un dato delante. El marcador de contexto y `git log` son datos; tu
   impresión, no. Si no lo has comprobado, dilo así: «no lo he comprobado».

5. **Commits pequeños, y con un mensaje que se entienda.** El mensaje es **lo
   único** que otro agente verá de tu trabajo. Los mensajes de este repo lo hacen
   bien: dicen qué cambia y por qué.

6. **Actualiza `ESTADO.md` al terminar y léelo al empezar.** Es el punto de
   encuentro entre agentes. Un relevo desactualizado engaña más que no tenerlo.

7. **No escribas fuera de este proyecto.** `Academia Nodos` es otro repositorio y
   **no se toca**.

## CÓMO REPARTIRSE EL TRABAJO

- **Por área**, si se puede: uno en el motor, otro en el panel, otro en el grafo.
  Así no coinciden en los mismos ficheros.
- **Si coinciden: uno cada vez.** El peligro real no es el conflicto de git —eso
  git lo avisa—, es que uno **sobrescriba en silencio** lo que el otro acaba de
  mejorar. Eso git **no** lo avisa.
- **Ante la duda, pregunta al humano.** Él sabe quién más está trabajando.

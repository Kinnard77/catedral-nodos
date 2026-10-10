/**
 * EL GRAFO DEL GDD — UMBRA (boceto v1.0)
 *
 * Esto es la estructura que describe el GDD, dibujable por fin. No es contenido
 * definitivo de ninguna catedral: el diseñador avisó de que Valencia, Sevilla y
 * Barcelona son bocetos y que no hay nada cerrado. Lo que importa aquí es LA
 * FORMA: cuatro rutas en paralelo que convergen en un metapuzzle.
 *
 * Se lee al revés, que es como se diseña: se empieza por el final —la
 * Revelación del Ancla Temporal— y se pregunta qué hace falta antes. La
 * respuesta son los cuatro Sellos, y cada Sello exige su ruta.
 *
 * LAS ARISTAS LLEVAN ETIQUETA. En un PDC la flecha dice QUÉ te llevas, y es lo
 * que convierte el dibujo en un diseño: sin la etiqueta solo hay rayas. Aquí la
 * etiqueta es `entrega`: lo que ese nodo pone en tus manos.
 *
 * `subject` = la Columna del GDD (Arte/Tiempo, Religión, Ciencia, Filosofía) y
 * `umbra` para la convergencia, de modo que cada ruta se vea de un color.
 * `level` = 1 puzle de ruta, 2 metapuzzle.
 */

const gdd = 'GDD Time Travelers v1.0 §5.4'

export const umbraGdd = [
    // ── RUTA 1 · "Las Tres Puertas" — Columna del Arte / Tiempo ────────────
    {
        id: 'umbra-p01',
        title: 'Identifica los tres estilos',
        subject: 'arte',
        level: 1,
        durationMin: 20,
        summary: 'Románico, gótico y barroco en el mismo edificio: el jugador aprende a leer el tiempo en la piedra.',
        objectives: ['Distinguir los tres estilos a simple vista'],
        prereq: [],
        unlocks: [],
        entrega: 'Lectura de estilos',
        tags: ['arte', 'estilos', 'observacion'],
        skills: ['observacion'],
        content: [
            {
                type: 'markdown',
                text: `Primer puzle de la ruta del Arte. Fuente: ${gdd}.`,
            },
        ],
    },
    {
        id: 'umbra-p02',
        title: 'Cuéntales a qué fechas corresponden',
        subject: 'arte',
        level: 1,
        durationMin: 20,
        summary: 'Cada estilo tiene su siglo. El jugador ordena el edificio en el tiempo.',
        objectives: ['Asignar cada estilo a su época'],
        prereq: ['umbra-p01'],
        unlocks: [],
        entrega: 'Sello del Tiempo',
        tags: ['arte', 'tiempo', 'cronologia'],
        skills: ['deduccion'],
        content: [
            { type: 'markdown', text: `Cierra la ruta del Arte y entrega el Sello del Tiempo. Fuente: ${gdd}.` },
        ],
    },

    // ── RUTA 2 · "El Tribunal de las Aguas" — Columna de la Religión ───────
    {
        id: 'umbra-p03',
        title: 'Descifra el símbolo de veredicto en las acequias',
        subject: 'religion',
        level: 1,
        durationMin: 20,
        summary: 'El agua que juzga: el jugador descifra el signo del tribunal.',
        objectives: ['Reconocer el símbolo del veredicto'],
        prereq: [],
        unlocks: [],
        entrega: 'El símbolo del veredicto',
        tags: ['religion', 'agua', 'simbolo', 'justicia'],
        skills: ['descifrado'],
        content: [{ type: 'markdown', text: `Primer puzle de la ruta de la Religión. Fuente: ${gdd}.` }],
    },
    {
        id: 'umbra-p04',
        title: 'Conecta agua, justicia y arquitectura',
        subject: 'religion',
        level: 1,
        durationMin: 20,
        summary: 'Los tres hilos se anudan: el agua que riega es la misma que juzga.',
        objectives: ['Unir los tres conceptos en una sola lectura'],
        prereq: ['umbra-p03'],
        unlocks: [],
        entrega: 'Sello del Agua',
        tags: ['religion', 'agua', 'justicia'],
        skills: ['sintesis'],
        content: [{ type: 'markdown', text: `Cierra la ruta de la Religión: Sello del Agua. Fuente: ${gdd}.` }],
    },

    // ── RUTA 3 · "El Cimborrio y la Luz" — Columna de la Ciencia ───────────
    {
        id: 'umbra-p05',
        title: 'Mide la luz cenital en horarios concretos',
        subject: 'ciencia',
        level: 1,
        durationMin: 20,
        summary: 'La luz entra por el cimborrio a una hora exacta. Hay que estar allí a esa hora.',
        objectives: ['Medir la luz que entra por el cimborrio'],
        prereq: [],
        unlocks: [],
        entrega: 'La medida de la luz',
        tags: ['ciencia', 'luz', 'medicion', 'hora'],
        skills: ['medicion'],
        content: [{ type: 'markdown', text: `Primer puzle de la ruta de la Ciencia. Fuente: ${gdd}.` }],
    },
    {
        id: 'umbra-p06',
        title: 'Calcula la proporción de secciones azules',
        subject: 'ciencia',
        level: 1,
        durationMin: 20,
        summary: 'Las secciones azules del rosetón no son decorativas: son una hora.',
        objectives: ['Convertir un conteo en una hora del día'],
        prereq: ['umbra-p05'],
        unlocks: [],
        entrega: 'Sello de la Luz',
        tags: ['ciencia', 'roseton', 'conteo', 'hora'],
        skills: ['calculo'],
        content: [{ type: 'markdown', text: `Cierra la ruta de la Ciencia: Sello de la Luz. Fuente: ${gdd}.` }],
    },

    // ── RUTA 4 · "Museo y Reliquia" — Columna de la Filosofía ──────────────
    {
        id: 'umbra-p07',
        title: 'Descifra las inscripciones del Santo Cáliz',
        subject: 'filosofia',
        level: 1,
        durationMin: 20,
        summary: 'Una inscripción en árabe que nadie explica, en la base de la reliquia.',
        objectives: ['Leer la inscripción y transcribirla'],
        prereq: [],
        unlocks: [],
        entrega: 'La inscripción leída',
        tags: ['filosofia', 'inscripcion', 'reliquia', 'arabe'],
        skills: ['epigrafia'],
        content: [{ type: 'markdown', text: `Primer puzle de la ruta de la Filosofía. Fuente: ${gdd}.` }],
    },
    {
        id: 'umbra-p08',
        title: 'Lee la genealogía del Cáliz',
        subject: 'filosofia',
        level: 1,
        durationMin: 20,
        summary: 'De Medina Azahara al 1262 y hasta hoy: la reliquia tiene un recorrido, no un origen.',
        objectives: ['Reconstruir el recorrido de la reliquia'],
        prereq: ['umbra-p07'],
        unlocks: [],
        entrega: 'Sello de la Reliquia',
        tags: ['filosofia', 'genealogia', 'reliquia'],
        skills: ['investigacion'],
        content: [{ type: 'markdown', text: `Cierra la ruta de la Filosofía: Sello de la Reliquia. Fuente: ${gdd}.` }],
    },

    // ── CONVERGENCIA · el final del juego ─────────────────────────────────
    {
        id: 'umbra-meta',
        ancla: true,
        title: 'La Revelación del Ancla Temporal',
        subject: 'umbra',
        level: 2,
        durationMin: 25,
        summary:
            'El metapuzzle: los cuatro Sellos convergen en la Capilla del Cáliz y el jugador lee la inscripción con la lupa. El Cáliz no es un tesoro, es un ancla que preserva lo que el tiempo borra.',
        objectives: [
            'Que el jugador entienda la reliquia como ancla, no como tesoro',
            'Dejarle la decisión: ¿proteger o revelar el Ancla?',
        ],
        prereq: ['umbra-p02', 'umbra-p04', 'umbra-p06', 'umbra-p08'],
        unlocks: [],
        entrega: '¿Proteger o revelar el Ancla?',
        tags: ['umbra', 'metapuzzle', 'ancla', 'revelacion', 'decision'],
        skills: ['sintesis'],
        content: [
            {
                type: 'markdown',
                text: `Convergencia de las cuatro rutas: **Requiere los 4 Sellos + Lupa AR + los datos de todas las rutas.** Fuente: ${gdd}.`,
            },
            {
                type: 'lista',
                items: [
                    'Apuntar la lupa al Santo Cáliz y leer la inscripción árabe.',
                    '"al-Zāhira" = Medina Azahara = la ciudad perdida.',
                    'El Cáliz NO es un tesoro: es un ANCLA que preserva lo que el tiempo borra.',
                    'Cámara Oscura: Medina Azahara proyectada sobre la capilla.',
                    'Decisión del jugador: ¿proteger o revelar el Ancla?',
                ],
            },
            {
                type: 'aviso',
                text: 'Boceto del GDD v1.0, no contenido definitivo. La decisión final abre consecuencias en niveles posteriores.',
            },
        ],
    },
]

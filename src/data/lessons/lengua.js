import { normalizeLesson } from '../../domain/lesson.js'

const raw = [
    {
        id: 'lengua-lectura-critica',
        title: 'Lectura critica: tesis, evidencia y falacias',
        subject: 'lengua',
        level: 2,
        durationMin: 22,
        summary:
            'Identificar tesis y argumentos, distinguir hecho de opinion, y reconocer las falacias mas frecuentes en textos y discursos.',
        objectives: [
            'Reconstruir el argumento central de un texto',
            'Nombrar y refutar una falacia comun',
        ],
        prereq: [],
        unlocks: ['lengua-argumentacion', 'lengua-escritura-academica'],
        tags: ['lectura', 'argumentacion', 'falacias', 'evidencia', 'pensamiento critico'],
        skills: ['analizar', 'argumentar'],
        content: [
            {
                type: 'markdown',
                text: 'Leer criticamente no es desconfiar de todo, es **reconstruir el argumento**: que se afirma (tesis), con que se sostiene (evidencia) y que puente une lo uno con lo otro (garantia).',
            },
            {
                type: 'lista',
                items: [
                    'Tesis: la afirmacion que el texto quiere que aceptes',
                    'Evidencia: datos, ejemplos o citas que la sostienen',
                    'Garantia: la regla implicita que autoriza el salto de la evidencia a la tesis',
                ],
            },
            {
                type: 'datos',
                rows: [
                    { Falacia: 'Ad hominem', Patron: 'Ataca a la persona', 'Por que falla': 'La calidad del argumento no depende de quien lo dice' },
                    { Falacia: 'Hombre de paja', Patron: 'Distorsiona la postura ajena', 'Por que falla': 'Refuta algo que nadie afirmo' },
                    { Falacia: 'Falsa dicotomia', Patron: 'Solo dos opciones', 'Por que falla': 'Oculta alternativas intermedias' },
                    { Falacia: 'Pendiente resbaladiza', Patron: 'Un paso lleva al desastre', 'Por que falla': 'Asume la cadena sin demostrarla' },
                    { Falacia: 'Autoridad', Patron: 'Es cierto porque lo dijo alguien famoso', 'Por que falla': 'La fama no es evidencia en el tema' },
                ],
            },
            {
                type: 'markdown',
                text: 'Distinguir **hecho** de **opinion** es el filtro mas rapido: un hecho se puede verificar con evidencia publica; una opinion expresa una valoracion.',
            },
            {
                type: 'nota',
                text: 'Una falacia invalida el argumento presentado, no necesariamente la conclusion. La conclusion puede ser cierta y estar mal defendida.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: '"No puedes opinar de economia porque estudiaste biologia" es:',
                    options: ['Ad hominem', 'Falsa dicotomia', 'Generalizacion apresurada'],
                    answer: 0,
                    why: 'Se descarta el argumento por quien lo enuncia, no por su contenido.',
                },
            },
        ],
    },
    {
        id: 'lengua-argumentacion',
        title: 'Argumentacion: construir y refutar',
        subject: 'lengua',
        level: 2,
        durationMin: 24,
        summary:
            'Estructura del ensayo argumentativo, tipos de evidencia, contraargumento y refutacion, y criterios de solidez.',
        objectives: [
            'Formular una tesis discutible y sostenible',
            'Anticipar y refutar un contraargumento',
        ],
        prereq: ['lengua-lectura-critica'],
        unlocks: ['lengua-escritura-academica'],
        tags: ['argumentacion', 'tesis', 'contraargumento', 'refutacion', 'ensayo'],
        skills: ['argumentar', 'escribir'],
        content: [
            {
                type: 'markdown',
                text: 'Una **tesis** argumentativa debe ser discutible: si nadie sensato podria oponerse, no hay nada que argumentar. "La educacion es importante" no es tesis, es un lugar comun.',
            },
            {
                type: 'markdown',
                text: 'La estructura clasica encadena cuatro movimientos y el tercero es el que casi todos olvidan:',
            },
            {
                type: 'lista',
                items: [
                    'Afirmacion: la tesis, ubicada y delimitada',
                    'Evidencia: datos, casos, autoridad pertinente o razonamiento',
                    'Contraargumento: la mejor objecion disponible',
                    'Refutacion: por que la objecion no derriba la tesis',
                ],
            },
            {
                type: 'codigo',
                lang: 'text',
                caption: 'Esqueleto de un parrafo argumentativo',
                text: `TESIS     El voto obligatorio aumenta la participacion, pero no garantiza
          que sea informada.

EVIDENCIA En paises con voto obligatorio la participacion supera el 80%,
          frente a menos del 60% en los voluntarios.

OBJECION  Aun asi, votar por obligacion puede producir votos sin criterio.

REFUTACION Ese efecto existe, pero es menor que la distorsion actual: quien
          hoy no vota esta sistematicamente sobrerrepresentado en contra.`,
            },
            {
                type: 'aviso',
                text: 'Una tesis con "todos" o "nunca" es casi imposible de defender. Delimita el alcance: "en las zonas urbanas de Mexico entre 2010 y 2020".',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Para que sirve incluir el contraargumento en un texto?',
                    options: [
                        'Para mostrar neutralidad',
                        'Para anticipar la objecion y reforzar la tesis al refutarla',
                        'Para alargar el texto',
                    ],
                    answer: 1,
                    why: 'Refutar la mejor objecion demuestra que la posicion resiste, en lugar de ignorar lo que la debilita.',
                },
            },
        ],
    },
    {
        id: 'lengua-escritura-academica',
        title: 'Escritura academica y claridad',
        subject: 'lengua',
        level: 3,
        durationMin: 26,
        summary:
            'Parrafo con idea central, conectores logicos, citacion, voz activa y edicion para eliminar ambiguedad y relleno.',
        objectives: [
            'Escribir un parrafo con una sola idea central',
            'Editar un texto propio aplicando criterios de claridad',
        ],
        prereq: ['lengua-argumentacion'],
        unlocks: [],
        tags: ['escritura', 'parrafo', 'conectores', 'citacion', 'estilo', 'edicion'],
        skills: ['escribir', 'editar'],
        content: [
            {
                type: 'markdown',
                text: 'Un parrafo desarrolla **una sola idea**. Si puedes ponerle dos titulos, son dos parrafos. La primera oracion suele anunciar la idea y las siguientes la sostienen.',
            },
            {
                type: 'datos',
                rows: [
                    { Relacion: 'Contraste', Conectores: 'sin embargo, en cambio, no obstante' },
                    { Relacion: 'Causa', Conectores: 'porque, dado que, puesto que' },
                    { Relacion: 'Consecuencia', Conectores: 'por lo tanto, en consecuencia, asi' },
                    { Relacion: 'Adicion', Conectores: 'ademas, asimismo, por otra parte' },
                    { Relacion: 'Ejemplificar', Conectores: 'por ejemplo, en el caso de' },
                ],
            },
            {
                type: 'markdown',
                text: 'La **voz activa** aclara quien hace que. "Se cometieron errores" oculta al responsable; "el equipo omitio la validacion" lo nombra.',
            },
            {
                type: 'codigo',
                lang: 'text',
                caption: 'Edicion: de relleno a afirmacion',
                text: `ANTES  En el presente trabajo se realiza un analisis acerca de la
       problematica que tiene que ver con la desercion escolar.

DESPUES Este trabajo analiza tres causas de la desercion escolar en
        secundarias rurales: distancia, costo de transporte y turnos.`,
            },
            {
                type: 'nota',
                text: 'Citar no debilita, protege: separa tu aportacion de la de otros y permite que el lector verifique.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Cual oracion es mas clara?',
                    options: [
                        'Se llevo a cabo la realizacion de una evaluacion del programa.',
                        'El equipo evaluo el programa.',
                        'Fue realizada una evaluacion por parte del equipo del programa.',
                    ],
                    answer: 1,
                    why: 'Sujeto claro, verbo fuerte y sin nominalizaciones: la voz activa elimina el relleno.',
                },
            },
        ],
    },
]

export const languageLessons = raw.map(normalizeLesson)

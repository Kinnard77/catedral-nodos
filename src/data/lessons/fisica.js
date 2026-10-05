import { normalizeLesson } from '../../domain/lesson.js'

const raw = [
    {
        id: 'fisica-medicion-unidades',
        title: 'Medicion, unidades y cifras significativas',
        subject: 'fisica',
        level: 1,
        durationMin: 16,
        summary:
            'Sistema internacional, conversion de unidades por factores, notacion cientifica aplicada y propagacion de incertidumbre.',
        objectives: [
            'Convertir unidades encadenando factores',
            'Reportar un resultado con cifras significativas coherentes',
        ],
        prereq: [],
        unlocks: ['fisica-cinematica'],
        tags: ['unidades', 'SI', 'conversion', 'incertidumbre', 'cifras significativas'],
        skills: ['medir', 'calcular'],
        content: [
            {
                type: 'markdown',
                text: 'Una medida sin unidad no significa nada. El **Sistema Internacional** fija siete unidades base; las demas se derivan de ellas.',
            },
            {
                type: 'datos',
                rows: [
                    { Magnitud: 'Longitud', Unidad: 'metro (m)', Base: 'm' },
                    { Magnitud: 'Masa', Unidad: 'kilogramo (kg)', Base: 'kg' },
                    { Magnitud: 'Tiempo', Unidad: 'segundo (s)', Base: 's' },
                    { Magnitud: 'Fuerza', Unidad: 'newton (N)', Base: 'kg·m/s²' },
                    { Magnitud: 'Energia', Unidad: 'joule (J)', Base: 'kg·m²/s²' },
                ],
            },
            {
                type: 'markdown',
                text: 'Convertir es multiplicar por **factores que valen 1**. Como $1\\,\\text{km} = 1000\\,\\text{m}$, la fraccion $\\frac{1000\\,\\text{m}}{1\\,\\text{km}}$ vale 1 y solo cambia la etiqueta.',
            },
            {
                type: 'codigo',
                lang: 'text',
                caption: 'Convertir 72 km/h a m/s',
                text: `72 km/h x (1000 m / 1 km) x (1 h / 3600 s)
= 72 x 1000 / 3600 m/s
= 20 m/s`,
            },
            {
                type: 'markdown',
                text: 'Las **cifras significativas** comunican la precision real del instrumento. Al multiplicar o dividir, el resultado conserva la menor cantidad de cifras significativas de los datos.',
            },
            {
                type: 'aviso',
                text: 'Al sumar, lo que importa es la posicion decimal, no la cantidad de cifras: $12.1 + 0.037 = 12.1$.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Una regla graduada en milimetros reporta $4.52\\,$cm. Cuantas cifras significativas tiene?',
                    options: ['2', '3', '5'],
                    answer: 1,
                    why: 'Los dos digitos exactos mas el digito estimado: 4, 5 y 2.',
                },
            },
        ],
    },
    {
        id: 'fisica-cinematica',
        title: 'Cinematica: movimiento en una dimension',
        subject: 'fisica',
        level: 2,
        durationMin: 26,
        summary:
            'Posicion, velocidad media e instantanea, aceleracion, y las ecuaciones del movimiento uniformemente acelerado con caida libre.',
        objectives: [
            'Distinguir velocidad media de instantanea',
            'Resolver un problema de caida libre con las ecuaciones del MRUA',
        ],
        prereq: ['fisica-medicion-unidades', 'mate-semejanza-trigonometria'],
        unlocks: ['fisica-fuerzas-newton'],
        tags: ['cinematica', 'velocidad', 'aceleracion', 'caida libre', 'MRU', 'MRUA'],
        skills: ['modelar', 'calcular'],
        content: [
            {
                type: 'markdown',
                text: 'La **posicion** $x(t)$ dice donde esta el objeto. La **velocidad** es la razon de cambio de la posicion y la **aceleracion** la razon de cambio de la velocidad. Cada una es la derivada de la anterior.',
            },
            {
                type: 'formula',
                tex: 'v = \\frac{dx}{dt} \\qquad a = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}',
                caption: 'La jerarquia del movimiento.',
            },
            {
                type: 'formula',
                tex: 'v = v_0 + at \\qquad x = x_0 + v_0 t + \\tfrac{1}{2}at^2 \\qquad v^2 = v_0^2 + 2a\\Delta x',
                caption: 'Ecuaciones del movimiento uniformemente acelerado.',
            },
            {
                type: 'markdown',
                text: 'La tercera ecuacion se obtiene eliminando el tiempo entre las dos primeras, y es la mas util cuando no conocemos $t$.',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Cuanto tarda en caer y con que velocidad llega',
                text: `const g = 9.81; // m/s^2
const h = 45;    // m

const t = Math.sqrt((2 * h) / g);  // 3.03 s
const v = Math.sqrt(2 * g * h);    // 29.7 m/s

// En caida libre la masa no aparece: g es la misma para todos.`,
            },
            {
                type: 'aviso',
                text: 'Elegir el signo del eje es una decision, no un detalle: si tomas hacia arriba como positivo, entonces $a = -g$ durante toda la caida.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'En el punto mas alto de un tiro vertical, la velocidad y la aceleracion valen:',
                    options: [
                        'Ambas cero',
                        'Velocidad cero, aceleracion g hacia abajo',
                        'Velocidad g, aceleracion cero',
                    ],
                    answer: 1,
                    why: 'La velocidad se anula un instante, pero la gravedad nunca deja de actuar.',
                },
            },
        ],
    },
    {
        id: 'fisica-fuerzas-newton',
        title: 'Fuerzas y leyes de Newton',
        subject: 'fisica',
        level: 2,
        durationMin: 30,
        summary:
            'Diagrama de cuerpo libre, las tres leyes de Newton, fuerza de friccion, plano inclinado y tension.',
        objectives: [
            'Dibujar un diagrama de cuerpo libre correcto',
            'Aplicar la segunda ley en un plano inclinado',
        ],
        prereq: ['fisica-cinematica'],
        unlocks: ['fisica-energia-trabajo'],
        tags: ['newton', 'fuerzas', 'friccion', 'plano inclinado', 'tension', 'cuerpo libre'],
        skills: ['modelar', 'analizar'],
        content: [
            {
                type: 'markdown',
                text: 'Una **fuerza** es una interaccion que puede cambiar la velocidad de un objeto. El primer paso de casi todo problema de mecanica es el **diagrama de cuerpo libre**: aislar el objeto y dibujar solo las fuerzas que actuan sobre el.',
            },
            {
                type: 'lista',
                items: [
                    'Primera ley: sin fuerza neta, la velocidad no cambia (inercia)',
                    'Segunda ley: la fuerza neta produce aceleracion proporcional e inversa a la masa',
                    'Tercera ley: a toda accion corresponde una reaccion de igual magnitud y sentido opuesto, sobre otro cuerpo',
                ],
            },
            { type: 'formula', tex: '\\sum \\vec{F} = m\\vec{a}', caption: 'Segunda ley de Newton.' },
            {
                type: 'markdown',
                text: 'En un plano inclinado conviene girar los ejes: uno a lo largo de la rampa y otro perpendicular. Asi solo hay que descomponer el peso.',
            },
            { type: 'formula', tex: '\\text{eje paralelo: } mg\\sin\\theta - f = ma \\qquad \\text{eje normal: } N = mg\\cos\\theta' },
            { type: 'formula', tex: 'f_{max} = \\mu N', caption: 'Friccion estatica maxima; la cinetica se opone al movimiento.' },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Aceleracion en una rampa con friccion',
                text: `const g = 9.81, m = 5, theta = 25 * Math.PI / 180, mu = 0.3;

const normal = m * g * Math.cos(theta);
const friccion = mu * normal;
const a = (m * g * Math.sin(theta) - friccion) / m;
// a ~= 1.48 m/s^2 rampa abajo`,
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Un libro en reposo sobre una mesa. Cual es el par de accion y reaccion de la fuerza normal?',
                    options: [
                        'El peso del libro',
                        'La fuerza del libro sobre la mesa',
                        'La friccion de la mesa',
                    ],
                    answer: 1,
                    why: 'El par actua sobre cuerpos distintos: la mesa empuja al libro y el libro empuja a la mesa. El peso es otra fuerza, sobre el mismo libro.',
                },
            },
        ],
    },
    {
        id: 'fisica-energia-trabajo',
        title: 'Trabajo, energia y conservacion',
        subject: 'fisica',
        level: 2,
        durationMin: 26,
        summary:
            'Trabajo mecanico, teorema trabajo-energia, energia cinetica y potencial, conservacion y potencia.',
        objectives: [
            'Calcular el trabajo de una fuerza con angulo',
            'Aplicar conservacion de energia para evitar resolver la dinamica',
        ],
        prereq: ['fisica-fuerzas-newton'],
        unlocks: ['fisica-ondas'],
        tags: ['trabajo', 'energia', 'cinetica', 'potencial', 'conservacion', 'potencia'],
        skills: ['modelar', 'calcular'],
        content: [
            {
                type: 'markdown',
                text: 'El **trabajo** mide cuanta energia transfiere una fuerza. Solo la componente en la direccion del desplazamiento realiza trabajo.',
            },
            { type: 'formula', tex: 'W = F d \\cos\\theta \\qquad [W] = \\text{J} = \\text{N}\\cdot\\text{m}' },
            {
                type: 'markdown',
                text: 'El **teorema trabajo-energia** dice que el trabajo neto es igual al cambio de energia cinetica. Es la via rapida para problemas donde solo importan el inicio y el final, no la trayectoria.',
            },
            { type: 'formula', tex: 'W_{neto} = \\Delta E_c = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_i^2' },
            {
                type: 'formula',
                tex: 'E_c = \\tfrac{1}{2}mv^2 \\qquad E_p = mgh \\qquad E = E_c + E_p = \\text{cte}',
                caption: 'Sin friccion, la energia mecanica se conserva.',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Velocidad al pie de una rampa sin friccion',
                text: `const g = 9.81, h = 3.2;
// m*g*h = (1/2) m v^2  -> la masa se cancela
const v = Math.sqrt(2 * g * h); // 7.92 m/s`,
            },
            {
                type: 'markdown',
                text: 'La **potencia** es la rapidez con que se transfiere energia. Mismo trabajo en menos tiempo exige mas potencia.',
            },
            { type: 'formula', tex: 'P = \\frac{W}{t} \\qquad [P] = \\text{W} = \\text{J/s}' },
            {
                type: 'quiz',
                quiz: {
                    q: 'Caminas cargando una caja horizontalmente a velocidad constante. Cuanto trabajo hace la fuerza con la que la sostienes?',
                    options: ['$mgh$', 'Cero', '$mgd$'],
                    answer: 1,
                    why: 'La fuerza es vertical y el desplazamiento horizontal: $\\cos 90° = 0$.',
                },
            },
        ],
    },
    {
        id: 'fisica-ondas',
        title: 'Ondas: sonido, luz y superposicion',
        subject: 'fisica',
        level: 3,
        durationMin: 30,
        summary:
            'Ondas transversales y longitudinales, longitud de onda, frecuencia, interferencia, resonancia y efecto Doppler.',
        objectives: [
            'Relacionar periodo, frecuencia y longitud de onda',
            'Explicar interferencia constructiva y destructiva',
        ],
        prereq: ['fisica-energia-trabajo', 'mate-semejanza-trigonometria'],
        unlocks: [],
        tags: ['ondas', 'frecuencia', 'sonido', 'interferencia', 'doppler', 'resonancia'],
        skills: ['modelar', 'interpretar'],
        content: [
            {
                type: 'markdown',
                text: 'Una **onda** transporta energia sin transportar materia. En una onda transversal la perturbacion es perpendicular a la propagacion (luz, cuerda); en una longitudinal es paralela (sonido).',
            },
            { type: 'formula', tex: 'v = \\lambda f = \\frac{\\lambda}{T}', caption: 'Relacion fundamental de las ondas.' },
            {
                type: 'markdown',
                text: 'La rapidez depende del **medio**, no de la fuente. Al cambiar de medio cambia $v$ y por tanto $\\lambda$ o $f$; la frecuencia la fija la fuente y se conserva.',
            },
            {
                type: 'markdown',
                text: 'Cuando dos ondas se encuentran, sus desplazamientos se **suman**. Si llegan en fase, se refuerzan (constructiva); si llegan en oposicion, se cancelan (destructiva).',
            },
            { type: 'formula', tex: '\\Delta r = n\\lambda \\;\\Rightarrow\\; \\text{constructiva} \\qquad \\Delta r = \\left(n + \\tfrac{1}{2}\\right)\\lambda \\;\\Rightarrow\\; \\text{destructiva}' },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Longitud de onda del LA 440 Hz en el aire',
                text: `const vAire = 343;   // m/s a 20 C
const f = 440;       // Hz
const lambda = vAire / f; // 0.78 m

// Un tubo abierto de 0.39 m resuena a esa frecuencia: media longitud de onda.`,
            },
            {
                type: 'nota',
                text: 'Un sistema **resuena** cuando recibe energia a una de sus frecuencias naturales; la amplitud crece porque la energia se acumula.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Una onda pasa del aire al agua. Que magnitud NO cambia?',
                    options: ['La rapidez', 'La frecuencia', 'La longitud de onda'],
                    answer: 1,
                    why: 'La frecuencia la impone la fuente. Al cambiar $v$, se ajusta $\\lambda$.',
                },
            },
        ],
    },
]

export const physicsLessons = raw.map(normalizeLesson)

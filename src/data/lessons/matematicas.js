import { normalizeLesson } from '../../domain/lesson.js'

/** Lecciones escritas a mano. Sirven de catalogo semilla y de datos para el modo demo. */
const raw = [
    {
        id: 'mate-recta-numerica',
        title: 'La recta numerica y los intervalos',
        subject: 'mate',
        level: 1,
        durationMin: 12,
        summary:
            'Ubicar numeros reales en la recta, comparar con desigualdades y describir conjuntos con notacion de intervalo.',
        objectives: [
            'Ordenar numeros reales usando desigualdades',
            'Escribir un conjunto de la recta como intervalo',
        ],
        prereq: [],
        unlocks: ['mate-fracciones', 'mate-ecuaciones-lineales'],
        tags: ['numeros reales', 'desigualdades', 'intervalos', 'orden'],
        skills: ['representar', 'comparar'],
        content: [
            {
                type: 'markdown',
                text: 'La recta numerica es el primer mapa de las matematicas: cada numero real ocupa **un solo punto** y el orden del mapa es el orden de los numeros. Si $a$ esta a la izquierda de $b$, entonces $a < b$.',
            },
            {
                type: 'formula',
                tex: 'a < b \\iff b - a > 0',
                caption: 'Comparar es restar: el signo del resultado decide el orden.',
            },
            {
                type: 'markdown',
                text: 'Un **intervalo** es un trozo continuo de la recta. El corchete cierra el extremo, el parentesis lo deja fuera.',
            },
            {
                type: 'datos',
                rows: [
                    { Notacion: '[2, 5]', Significado: 'Todos los numeros entre 2 y 5, incluidos ambos' },
                    { Notacion: '(2, 5)', Significado: 'Entre 2 y 5, sin incluir los extremos' },
                    { Notacion: '[2, ∞)', Significado: 'Desde 2 hacia la derecha, 2 incluido' },
                ],
            },
            {
                type: 'nota',
                text: 'El infinito nunca lleva corchete: no es un numero al que se pueda llegar.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'El conjunto de los numeros $x$ que cumplen $x \\le 3$ se escribe:',
                    options: ['$(-\\infty, 3)$', '$(-\\infty, 3]$', '$[3, \\infty)$'],
                    answer: 1,
                    why: 'Los valores van hacia la izquierda de 3 y el 3 si entra, asi que se cierra por la derecha con corchete.',
                },
            },
        ],
    },
    {
        id: 'mate-fracciones',
        title: 'Fracciones, razones y proporciones',
        subject: 'mate',
        level: 1,
        durationMin: 18,
        summary:
            'Operar fracciones con sentido, simplificar, y resolver reglas de tres simples y compuestas.',
        objectives: [
            'Sumar y multiplicar fracciones justificando el comun denominador',
            'Resolver una proporcion con regla de tres',
        ],
        prereq: ['mate-recta-numerica'],
        unlocks: ['mate-potencias-raices', 'mate-semejanza-trigonometria'],
        tags: ['fracciones', 'razones', 'proporciones', 'regla de tres', 'porcentaje'],
        skills: ['calcular', 'modelar'],
        content: [
            {
                type: 'markdown',
                text: 'Una fraccion $\\frac{a}{b}$ responde a la pregunta *cuantas partes de tamano $\\frac{1}{b}$ caben*. Sumar fracciones exige que las partes sean **del mismo tamano**:',
            },
            {
                type: 'formula',
                tex: '\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}',
                caption: 'El denominador comun bd iguala el tamano de las partes.',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Sumar fracciones sin decimales, con maximo comun divisor',
                text: `const mcd = (a, b) => (b === 0 ? a : mcd(b, a % b));

function sumar(a, b, c, d) {
    const num = a * d + c * b;
    const den = b * d;
    const g = mcd(num, den);
    return [num / g, den / g];
}

sumar(3, 4, 1, 6); // [11, 12]`,
            },
            {
                type: 'markdown',
                text: 'Una **proporcion** afirma que dos razones son iguales: $\\frac{a}{b} = \\frac{c}{d}$. Con tres datos conocidos, el cuarto sale multiplicando en cruz.',
            },
            {
                type: 'aviso',
                text: 'En una regla de tres inversa (mas trabajadores, menos dias) NO se multiplica en cruz: se invierte una de las razones antes de igualar.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Si 4 cuadernos cuestan $\\$120$, cuanto cuestan 7 cuadernos al mismo precio unitario?',
                    options: ['$\\$180$', '$\\$210$', '$\\$240$'],
                    answer: 1,
                    why: '$120 \\div 4 = 30$ por cuaderno, y $7 \\times 30 = 210$.',
                },
            },
        ],
    },
    {
        id: 'mate-potencias-raices',
        title: 'Potencias, raices y notacion cientifica',
        subject: 'mate',
        level: 2,
        durationMin: 18,
        summary:
            'Leyes de exponentes, raiz como exponente fraccionario, radicales y escritura en notacion cientifica.',
        objectives: [
            'Aplicar las leyes de los exponentes',
            'Convertir radicales a exponentes fraccionarios',
        ],
        prereq: ['mate-fracciones'],
        unlocks: ['mate-pitagoras'],
        tags: ['potencias', 'exponentes', 'raices', 'radicales', 'notacion cientifica'],
        skills: ['calcular', 'simplificar'],
        content: [
            {
                type: 'markdown',
                text: 'Una potencia es una multiplicacion repetida, y sus leyes salen de contar factores. Si $a^n$ significa $n$ copias de $a$, entonces multiplicar potencias de la misma base suma copias.',
            },
            {
                type: 'formula',
                tex: 'a^m \\cdot a^n = a^{m+n} \\qquad \\frac{a^m}{a^n} = a^{m-n} \\qquad (a^m)^n = a^{mn}',
                caption: 'Las tres leyes basicas de los exponentes.',
            },
            {
                type: 'markdown',
                text: 'Una raiz es una potencia con exponente fraccionario, y por eso obedece las mismas leyes:',
            },
            { type: 'formula', tex: '\\sqrt[n]{a} = a^{1/n} \\qquad \\sqrt[n]{a^m} = a^{m/n}' },
            {
                type: 'aviso',
                text: '$a^0 = 1$ para todo $a \\neq 0$ porque $\\frac{a^n}{a^n} = a^{n-n} = a^0$. Cero elevado a cero queda indefinido.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: '$\\sqrt{50}$ simplificado es:',
                    options: ['$5\\sqrt{2}$', '$2\\sqrt{5}$', '$25\\sqrt{2}$'],
                    answer: 0,
                    why: '$50 = 25 \\cdot 2$, y $\\sqrt{25} = 5$, de modo que $\\sqrt{50} = 5\\sqrt{2}$.',
                },
            },
        ],
    },
    {
        id: 'mate-pitagoras',
        title: 'El teorema de Pitagoras',
        subject: 'mate',
        level: 1,
        durationMin: 22,
        summary:
            'En todo triangulo rectangulo la suma de los cuadrados de los catetos es igual al cuadrado de la hipotenusa; incluye demostracion por areas, recíproco y ternas pitagoricas.',
        objectives: [
            'Enunciar y justificar el teorema de Pitagoras',
            'Calcular un lado desconocido de un triangulo rectangulo',
            'Usar el reciproco para decidir si un triangulo es rectangulo',
        ],
        prereq: ['mate-potencias-raices'],
        unlocks: ['mate-semejanza-trigonometria'],
        tags: ['geometria', 'triangulo rectangulo', 'pitagoras', 'hipotenusa', 'ternas'],
        skills: ['demostrar', 'calcular', 'modelar'],
        content: [
            {
                type: 'markdown',
                text: 'Un **triangulo rectangulo** tiene un angulo de $90°$. Los dos lados que lo forman se llaman **catetos** y el lado opuesto al angulo recto es la **hipotenusa**, siempre el lado mas largo.',
            },
            { type: 'formula', tex: 'a^2 + b^2 = c^2', caption: 'Catetos $a$ y $b$, hipotenusa $c$.' },
            {
                type: 'markdown',
                text: '**Demostracion por areas.** Coloca cuatro copias del mismo triangulo dentro de un cuadrado de lado $a+b$. El hueco central es un cuadrado de lado $c$ con area $c^2$. Si en cambio acomodas los cuatro triangulos en dos rectangulos, el area libre son dos cuadrados de areas $a^2$ y $b^2$. El area total es la misma en ambos acomodos, entonces $a^2 + b^2 = c^2$.',
            },
            {
                type: 'markdown',
                text: '**Reciproco.** Si en un triangulo de lados $a, b, c$ se cumple $a^2 + b^2 = c^2$, entonces el angulo entre $a$ y $b$ es recto. Esto convierte el teorema en una prueba de perpendicularidad, muy usada en construccion.',
            },
            {
                type: 'datos',
                rows: [
                    { Terna: '3 - 4 - 5', Verificacion: '$9 + 16 = 25$' },
                    { Terna: '5 - 12 - 13', Verificacion: '$25 + 144 = 169$' },
                    { Terna: '8 - 15 - 17', Verificacion: '$64 + 225 = 289$' },
                ],
                caption: 'Ternas pitagoricas: enteros que cumplen el teorema.',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Hipotenusa, cateto faltante y prueba del reciproco',
                text: `const hipotenusa = (a, b) => Math.hypot(a, b);

const cateto = (c, a) => Math.sqrt(c ** 2 - a ** 2);

const esRectangulo = (a, b, c) => {
    const [x, y, z] = [a, b, c].sort((p, q) => p - q);
    return Math.abs(x ** 2 + y ** 2 - z ** 2) < 1e-9;
};

hipotenusa(3, 4);            // 5
cateto(13, 5);               // 12
esRectangulo(8, 15, 17);     // true`,
            },
            {
                type: 'markdown',
                text: '**Distancia entre dos puntos.** El teorema es el origen de la formula de distancia en el plano: los catetos son las diferencias en $x$ y en $y$.',
            },
            { type: 'formula', tex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}' },
            {
                type: 'aviso',
                text: 'Solo aplica a triangulos rectangulos. Si el triangulo no tiene angulo recto, la herramienta correcta es la ley de cosenos: $c^2 = a^2 + b^2 - 2ab\\cos\\theta$.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Una escalera de 5 m se apoya en una pared y su base queda a 3 m del muro. A que altura llega?',
                    options: ['2 m', '4 m', '5.8 m'],
                    answer: 1,
                    why: 'La escalera es la hipotenusa: $h = \\sqrt{5^2 - 3^2} = \\sqrt{16} = 4$ m.',
                },
            },
        ],
    },
    {
        id: 'mate-semejanza-trigonometria',
        title: 'Semejanza y razones trigonometricas',
        subject: 'mate',
        level: 2,
        durationMin: 25,
        summary:
            'Triangulos semejantes, criterios de semejanza, teorema de Tales, y las razones seno, coseno y tangente con sus inversas.',
        objectives: [
            'Aplicar los criterios de semejanza',
            'Elegir la razon trigonometrica correcta para resolver un triangulo',
        ],
        prereq: ['mate-pitagoras', 'mate-fracciones'],
        unlocks: ['fisica-cinematica', 'fisica-ondas'],
        tags: ['semejanza', 'tales', 'trigonometria', 'seno', 'coseno', 'tangente'],
        skills: ['modelar', 'calcular'],
        content: [
            {
                type: 'markdown',
                text: 'Dos triangulos son **semejantes** si tienen los mismos angulos. Entonces sus lados correspondientes guardan la misma razon: la forma se conserva y solo cambia la escala.',
            },
            { type: 'formula', tex: '\\frac{a}{a\'} = \\frac{b}{b\'} = \\frac{c}{c\'} = k' },
            {
                type: 'markdown',
                text: 'Como en un triangulo rectangulo la forma queda fijada por un angulo agudo, las razones entre lados dependen **solo de ese angulo**. Esas son las razones trigonometricas.',
            },
            {
                type: 'formula',
                tex: '\\sin\\theta = \\frac{\\text{opuesto}}{\\text{hipotenusa}} \\quad \\cos\\theta = \\frac{\\text{adyacente}}{\\text{hipotenusa}} \\quad \\tan\\theta = \\frac{\\text{opuesto}}{\\text{adyacente}}',
                caption: 'SOH-CAH-TOA.',
            },
            {
                type: 'markdown',
                text: 'La identidad fundamental sale directo de Pitagoras, dividiendo $a^2 + b^2 = c^2$ entre $c^2$:',
            },
            { type: 'formula', tex: '\\sin^2\\theta + \\cos^2\\theta = 1' },
            { type: 'nota', text: 'El teorema de Tales es semejanza aplicada: rectas paralelas cortan segmentos proporcionales.' },
            {
                type: 'quiz',
                quiz: {
                    q: 'Conoces el cateto opuesto a $\\theta$ y la hipotenusa. Que razon usas?',
                    options: ['Coseno', 'Seno', 'Tangente'],
                    answer: 1,
                    why: 'El seno relaciona precisamente opuesto con hipotenusa.',
                },
            },
        ],
    },
    {
        id: 'mate-ecuaciones-lineales',
        title: 'Ecuaciones y sistemas lineales',
        subject: 'mate',
        level: 2,
        durationMin: 24,
        summary:
            'Despeje justificado, ecuaciones con una incognita, sistemas 2x2 por sustitucion y eliminacion, e interpretacion grafica.',
        objectives: [
            'Despejar una incognita conservando la equivalencia',
            'Resolver un sistema 2x2 por eliminacion',
            'Interpretar graficamente la solucion de un sistema',
        ],
        prereq: ['mate-recta-numerica'],
        unlocks: ['mate-funciones'],
        tags: ['algebra', 'ecuaciones', 'sistemas', 'despeje', 'gauss'],
        skills: ['resolver', 'modelar'],
        content: [
            {
                type: 'markdown',
                text: 'Una ecuacion es una balanza. Toda operacion aplicada a un lado debe aplicarse al otro para conservar la igualdad; eso es la **equivalencia**.',
            },
            {
                type: 'codigo',
                lang: 'text',
                caption: 'Despeje paso a paso',
                text: `3(x - 2) = 2x + 5
3x - 6   = 2x + 5     distribuir
  x - 6  = 5          restar 2x
  x      = 11         sumar 6`,
            },
            {
                type: 'markdown',
                text: 'Un **sistema 2x2** son dos condiciones simultaneas. Graficamente, cada ecuacion es una recta y la solucion es su interseccion. Por eso un sistema puede tener una solucion, ninguna (paralelas) o infinitas (la misma recta).',
            },
            {
                type: 'formula',
                tex: '\\begin{cases} 2x + y = 7 \\\\ x - y = 2 \\end{cases} \\;\\Rightarrow\\; 3x = 9 \\;\\Rightarrow\\; x = 3,\\; y = 1',
                caption: 'Eliminacion: sumar las ecuaciones cancela y.',
            },
            {
                type: 'aviso',
                text: 'Multiplicar una ecuacion por cero no es una operacion valida: destruye la informacion y produce falsas soluciones.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Dos rectas del mismo sistema tienen la misma pendiente y distinta ordenada al origen. Cuantas soluciones hay?',
                    options: ['Una', 'Ninguna', 'Infinitas'],
                    answer: 1,
                    why: 'Son paralelas y no se cruzan, asi que no existe par $(x, y)$ que cumpla ambas.',
                },
            },
        ],
    },
    {
        id: 'mate-funciones',
        title: 'Funciones, graficas y modelos',
        subject: 'mate',
        level: 2,
        durationMin: 28,
        summary:
            'Concepto de funcion, dominio y rango, funcion lineal y cuadratica, pendiente, vertice, y lectura de graficas como modelos.',
        objectives: [
            'Decidir si una relacion es funcion',
            'Interpretar pendiente e intercepto en contexto',
            'Ubicar el vertice de una parabola',
        ],
        prereq: ['mate-ecuaciones-lineales'],
        unlocks: ['datos-estadistica-descriptiva', 'datos-regresion-lineal', 'cod-funciones'],
        tags: ['funciones', 'dominio', 'rango', 'pendiente', 'parabola', 'modelos'],
        skills: ['modelar', 'interpretar'],
        content: [
            {
                type: 'markdown',
                text: 'Una **funcion** asigna a cada entrada **exactamente una** salida. Si una entrada tiene dos salidas posibles, no es funcion: falla la prueba de la recta vertical.',
            },
            { type: 'formula', tex: 'f: X \\to Y, \\quad x \\mapsto f(x)' },
            {
                type: 'markdown',
                text: 'La **lineal** crece a ritmo constante: $m$ es la pendiente (cuanto cambia la salida por cada unidad de entrada) y $b$ el valor inicial.',
            },
            { type: 'formula', tex: 'f(x) = mx + b \\qquad m = \\frac{\\Delta y}{\\Delta x}' },
            {
                type: 'markdown',
                text: 'La **cuadratica** describe aceleracion, areas y trayectorias. Su grafica es una parabola cuyo vertice marca el maximo o minimo.',
            },
            { type: 'formula', tex: 'f(x) = ax^2 + bx + c \\qquad x_v = -\\frac{b}{2a}' },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Explorar una cuadratica en una tabla',
                text: `const f = (x) => 2 * x ** 2 - 8 * x + 3;
const vertice = -(-8) / (2 * 2); // 2

[...Array(5)].map((_, i) => [i, f(i)]);
// [[0,3],[1,-3],[2,-5],[3,-3],[4,3]] -> minimo en x = 2`,
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'En $C(t) = 45 + 12t$, con $C$ en pesos y $t$ en horas, que significa 12?',
                    options: [
                        'El costo inicial',
                        'El aumento de costo por cada hora',
                        'El costo maximo',
                    ],
                    answer: 1,
                    why: 'Es la pendiente: cada hora adicional suma 12 pesos al costo.',
                },
            },
        ],
    },
]

export const mathLessons = raw.map(normalizeLesson)

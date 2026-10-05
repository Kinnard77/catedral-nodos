import { normalizeLesson } from '../../domain/lesson.js'

const raw = [
    {
        id: 'datos-tablas',
        title: 'Tablas, tipos de datos y calidad de la informacion',
        subject: 'datos',
        level: 1,
        durationMin: 18,
        summary:
            'Estructura de una tabla, tipos de variable, valores faltantes, duplicados y deteccion de datos atipicos antes de analizar.',
        objectives: [
            'Distinguir variable categorica de numerica',
            'Detectar y decidir que hacer con datos faltantes',
        ],
        prereq: ['cod-arreglos'],
        unlocks: ['datos-estadistica-descriptiva'],
        tags: ['datos', 'tablas', 'tipos', 'valores faltantes', 'outliers', 'limpieza'],
        skills: ['organizar', 'depurar'],
        content: [
            {
                type: 'markdown',
                text: 'Una tabla es una coleccion de **observaciones** (filas) descritas por **variables** (columnas). La primera revision nunca es estadistica, es estructural: que hay aqui y que falta.',
            },
            {
                type: 'datos',
                rows: [
                    { Variable: 'edad', Tipo: 'Numerica continua', Uso: 'Promedios, correlacion' },
                    { Variable: 'materia', Tipo: 'Categorica nominal', Uso: 'Conteos, agrupar' },
                    { Variable: 'nivel', Tipo: 'Categorica ordinal', Uso: 'Ordenar y comparar' },
                    { Variable: 'aprobado', Tipo: 'Binaria', Uso: 'Proporciones, clasificacion' },
                ],
            },
            {
                type: 'markdown',
                text: 'Un dato **faltante** no es lo mismo que un cero. La pregunta correcta es por que falta: si falta al azar, se puede imputar; si falta por una razon sistematica, imputar introduce sesgo.',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Perfil rapido de calidad de una tabla',
                text: `const perfil = (filas, columnas) =>
    columnas.map((col) => {
        const valores = filas.map((f) => f[col]);
        const presentes = valores.filter((v) => v !== null && v !== undefined && v !== "");
        const numericos = presentes.filter((v) => typeof v === "number");
        return {
            columna: col,
            faltantes: valores.length - presentes.length,
            unicos: new Set(presentes).size,
            promedio: numericos.length
                ? numericos.reduce((s, n) => s + n, 0) / numericos.length
                : null,
        };
    });`,
            },
            {
                type: 'aviso',
                text: 'Un valor atipico no siempre es un error. Antes de borrarlo, pregunta si es un error de captura o un caso real e importante.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'En una encuesta, el 40% de las respuestas de ingreso estan vacias y todas provienen del mismo turno. Esto es:',
                    options: [
                        'Faltante aleatorio, se puede promediar',
                        'Faltante sistematico, promediar sesga el resultado',
                        'Irrelevante para el analisis',
                    ],
                    answer: 1,
                    why: 'Cuando la ausencia se concentra en un grupo, cualquier promedio ignora a ese grupo y el sesgo es inevitable.',
                },
            },
        ],
    },
    {
        id: 'datos-estadistica-descriptiva',
        title: 'Estadistica descriptiva y visualizacion',
        subject: 'datos',
        level: 2,
        durationMin: 26,
        summary:
            'Media, mediana, moda, dispersion, cuartiles, histograma y boxplot, y cuando cada medida representa mejor a los datos.',
        objectives: [
            'Elegir entre media y mediana segun la forma de la distribucion',
            'Interpretar un boxplot y detectar asimetria',
        ],
        prereq: ['datos-tablas', 'mate-funciones'],
        unlocks: ['datos-probabilidad', 'datos-regresion-lineal'],
        tags: ['media', 'mediana', 'desviacion', 'cuartiles', 'histograma', 'boxplot'],
        skills: ['resumir', 'interpretar'],
        content: [
            {
                type: 'markdown',
                text: 'Describir datos es responder dos preguntas: **donde esta el centro** y **que tan dispersos estan**. Una sola de las dos siempre engana.',
            },
            { type: 'formula', tex: '\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i \\qquad s = \\sqrt{\\frac{1}{n-1}\\sum_{i=1}^{n}(x_i - \\bar{x})^2}' },
            {
                type: 'markdown',
                text: 'La **media** usa todos los valores y por eso un solo extremo la mueve. La **mediana** solo depende de la posicion central y resiste esos extremos. Si media y mediana difieren mucho, la distribucion es asimetrica.',
            },
            {
                type: 'datos',
                rows: [
                    { Medida: 'Media', 'Resiste extremos': 'No', 'Cuando usarla': 'Distribuciones simetricas' },
                    { Medida: 'Mediana', 'Resiste extremos': 'Si', 'Cuando usarla': 'Ingresos, precios, tiempos' },
                    { Medida: 'Desviacion estandar', 'Resiste extremos': 'No', 'Cuando usarla': 'Comparar variabilidad' },
                    { Medida: 'Rango intercuartil', 'Resiste extremos': 'Si', 'Cuando usarla': 'Caja del boxplot' },
                ],
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Resumen de cinco numeros con cuartiles',
                text: `function cuantil(ordenados, p) {
    const pos = (ordenados.length - 1) * p;
    const base = Math.floor(pos);
    const resto = pos - base;
    const siguiente = ordenados[base + 1] ?? ordenados[base];
    return ordenados[base] + resto * (siguiente - ordenados[base]);
}

const resumen = (datos) => {
    const o = [...datos].sort((a, b) => a - b);
    return {
        min: o[0], q1: cuantil(o, 0.25), mediana: cuantil(o, 0.5),
        q3: cuantil(o, 0.75), max: o.at(-1),
    };
};`,
            },
            {
                type: 'nota',
                text: 'El **rango intercuartil** $IQR = Q_3 - Q_1$ contiene al 50% central de los datos. La regla habitual marca como atipico lo que cae fuera de $Q_1 - 1.5\\,IQR$ o $Q_3 + 1.5\\,IQR$.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Los salarios de una empresa tienen media $\\$18{,}000$ y mediana $\\$9{,}500$. Que reportas como tipico?',
                    options: [
                        'La media, es el valor central',
                        'La mediana, porque hay salarios muy altos que jalan la media',
                        'El maximo',
                    ],
                    answer: 1,
                    why: 'La asimetria hacia arriba indica extremos altos; la mediana describe mejor al empleado tipico.',
                },
            },
        ],
    },
    {
        id: 'datos-probabilidad',
        title: 'Probabilidad, independencia y Bayes',
        subject: 'datos',
        level: 2,
        durationMin: 28,
        summary:
            'Espacio muestral, reglas de la probabilidad, probabilidad condicional, independencia y teorema de Bayes con ejemplos.',
        objectives: [
            'Calcular probabilidad condicional',
            'Actualizar una creencia con el teorema de Bayes',
        ],
        prereq: ['datos-estadistica-descriptiva', 'mate-fracciones'],
        unlocks: ['datos-regresion-lineal', 'datos-intro-ml'],
        tags: ['probabilidad', 'condicional', 'independencia', 'bayes', 'falso positivo'],
        skills: ['modelar', 'razonar'],
        content: [
            {
                type: 'markdown',
                text: 'La probabilidad mide incertidumbre en una escala de 0 a 1. Un **espacio muestral** es la lista de todo lo que puede pasar; un evento es un subconjunto suyo.',
            },
            { type: 'formula', tex: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B) \\qquad P(A^c) = 1 - P(A)' },
            {
                type: 'markdown',
                text: 'La **probabilidad condicional** $P(A \\mid B)$ responde: sabiendo que ocurrio $B$, que tan probable es $A$? No es lo mismo que $P(B \\mid A)$, y confundirlas es el error mas comun del razonamiento estadistico.',
            },
            { type: 'formula', tex: 'P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)} \\qquad P(A \\mid B) = \\frac{P(B \\mid A)\\,P(A)}{P(B)}' },
            {
                type: 'markdown',
                text: '**Ejemplo decisivo.** Una enfermedad afecta al 1% de la poblacion. La prueba detecta al 99% de los enfermos y da falso positivo en el 5% de los sanos. Si tu prueba sale positiva, que probabilidad tienes de estar enfermo?',
            },
            { type: 'formula', tex: 'P(E \\mid +) = \\frac{0.99 \\times 0.01}{0.99 \\times 0.01 + 0.05 \\times 0.99} \\approx 0.167', caption: 'Alrededor del 17%, no del 99%.' },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Bayes con conteos: mil personas',
                text: `// De 1000 personas: 10 enfermas, 990 sanas
// Positivos: 10 * 0.99 = 9.9 enfermos + 990 * 0.05 = 49.5 sanos
const enfermosYPositivos = 9.9;
const totalPositivos = 9.9 + 49.5;
enfermosYPositivos / totalPositivos; // 0.167`,
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Dos eventos son independientes si:',
                    options: [
                        'No pueden ocurrir juntos',
                        '$P(A \\mid B) = P(A)$',
                        '$P(A) + P(B) = 1$',
                    ],
                    answer: 1,
                    why: 'Saber que ocurrio B no cambia la probabilidad de A. Si no pudieran ocurrir juntos serian mutuamente excluyentes, que es otra cosa.',
                },
            },
        ],
    },
    {
        id: 'datos-regresion-lineal',
        title: 'Correlacion y regresion lineal',
        subject: 'datos',
        level: 3,
        durationMin: 30,
        summary:
            'Diagrama de dispersion, coeficiente de correlacion, minimos cuadrados, interpretacion de residuos y la diferencia entre correlacion y causalidad.',
        objectives: [
            'Interpretar el coeficiente de correlacion con cautela',
            'Ajustar una recta por minimos cuadrados e interpretar sus coeficientes',
        ],
        prereq: ['datos-estadistica-descriptiva', 'mate-funciones', 'cod-funciones'],
        unlocks: ['datos-intro-ml'],
        tags: ['correlacion', 'regresion', 'minimos cuadrados', 'residuos', 'causalidad'],
        skills: ['modelar', 'evaluar'],
        content: [
            {
                type: 'markdown',
                text: 'La **correlacion** mide si dos variables se mueven juntas y con que fuerza, en una escala de $-1$ a $1$. No dice nada sobre cual causa a cual, ni descarta que una tercera variable explique ambas.',
            },
            { type: 'formula', tex: 'r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\; \\sum (y_i - \\bar{y})^2}}' },
            {
                type: 'markdown',
                text: 'La **regresion lineal** ajusta la recta que minimiza la suma de los cuadrados de los residuos. La pendiente indica cuanto cambia $y$ por unidad de $x$.',
            },
            { type: 'formula', tex: '\\hat{y} = b_1 x + b_0 \\qquad b_1 = r\\frac{s_y}{s_x} \\qquad b_0 = \\bar{y} - b_1\\bar{x}' },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Minimos cuadrados y residuos',
                text: `function ajustar(xs, ys) {
    const n = xs.length;
    const mx = xs.reduce((s, v) => s + v, 0) / n;
    const my = ys.reduce((s, v) => s + v, 0) / n;
    const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
    const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    const b1 = num / den;
    return { b1, b0: my - b1 * mx, predecir: (x) => b1 * x + (my - b1 * mx) };
}

const horas = [1, 2, 3, 4, 5, 6, 7, 8];
const notas = [4.2, 5.1, 5.4, 6.0, 6.9, 7.2, 8.1, 8.4];
const m = ajustar(horas, notas); // b1 ~= 0.61 puntos por hora`,
            },
            {
                type: 'aviso',
                text: '**Correlacion no implica causalidad.** El consumo de helado y los ahogamientos correlacionan porque ambos suben en verano. Antes de afirmar causa, busca un mecanismo o un experimento controlado.',
            },
            {
                type: 'markdown',
                text: 'Los **residuos** ($y - \\hat{y}$) son la prueba de honestidad del modelo: si muestran un patron curvo o en embudo, una recta no es el modelo adecuado aunque $r$ sea alto.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Un modelo tiene $r = 0.9$ entre horas de estudio y calificacion. Cual conclusion es valida?',
                    options: [
                        'Estudiar mas causa mejores notas en todos los casos',
                        'Existe una asociacion lineal fuerte; la causalidad requiere mas evidencia',
                        'El modelo predice con 90% de exactitud',
                    ],
                    answer: 1,
                    why: '$r$ mide asociacion lineal, no causalidad ni porcentaje de aciertos.',
                },
            },
        ],
    },
    {
        id: 'datos-intro-ml',
        title: 'Introduccion al aprendizaje automatico',
        subject: 'datos',
        level: 3,
        durationMin: 32,
        summary:
            'Aprendizaje supervisado y no supervisado, conjunto de entrenamiento y prueba, sobreajuste, matriz de confusion y metricas.',
        objectives: [
            'Separar datos de entrenamiento y prueba correctamente',
            'Diagnosticar sobreajuste a partir de las curvas de error',
        ],
        prereq: ['datos-regresion-lineal', 'datos-probabilidad'],
        unlocks: [],
        tags: ['machine learning', 'supervisado', 'sobreajuste', 'validacion', 'metricas', 'confusion'],
        skills: ['evaluar', 'disenar'],
        content: [
            {
                type: 'markdown',
                text: 'Aprender de datos es **ajustar un modelo para generalizar**, no para memorizar. Un modelo que acierta en todo el conjunto de entrenamiento y falla con datos nuevos no aprendio: se **sobreajusto**.',
            },
            {
                type: 'datos',
                rows: [
                    { Familia: 'Supervisado', 'Que recibe': 'Pares (entrada, respuesta)', Ejemplos: 'Regresion, clasificacion' },
                    { Familia: 'No supervisado', 'Que recibe': 'Solo entradas', Ejemplos: 'Agrupamiento, reduccion' },
                    { Familia: 'Por refuerzo', 'Que recibe': 'Recompensas por accion', Ejemplos: 'Juegos, control' },
                ],
            },
            {
                type: 'markdown',
                text: 'Regla de oro: aparta el **conjunto de prueba antes** de tocar el modelo, y no lo uses para elegir hiperparametros. Si lo miras muchas veces, dejas de ser un examen y se vuelve parte del entrenamiento.',
            },
            {
                type: 'datos',
                rows: [
                    { Predicho: 'Positivo', Real: 'Positivo', Celda: 'Verdadero positivo' },
                    { Predicho: 'Positivo', Real: 'Negativo', Celda: 'Falso positivo' },
                    { Predicho: 'Negativo', Real: 'Positivo', Celda: 'Falso negativo' },
                    { Predicho: 'Negativo', Real: 'Negativo', Celda: 'Verdadero negativo' },
                ],
                caption: 'Matriz de confusion: la base de todas las metricas de clasificacion.',
            },
            { type: 'formula', tex: '\\text{precision} = \\frac{VP}{VP + FP} \\qquad \\text{exhaustividad} = \\frac{VP}{VP + FN} \\qquad F_1 = \\frac{2PR}{P + R}' },
            {
                type: 'markdown',
                text: 'La **exactitud** (aciertos totales) engana con clases desbalanceadas: si el 99% de los casos son negativos, un modelo que siempre dice negativo tiene 99% de exactitud y cero utilidad.',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Validacion cruzada en k particiones',
                text: `function validacionCruzada(datos, k, entrenar, evaluar) {
    const tamano = Math.ceil(datos.length / k);
    const puntajes = [];
    for (let i = 0; i < k; i++) {
        const prueba = datos.slice(i * tamano, (i + 1) * tamano);
        const entrenamiento = datos.filter((d) => !prueba.includes(d));
        puntajes.push(evaluar(entrenar(entrenamiento), prueba));
    }
    return puntajes.reduce((s, p) => s + p, 0) / puntajes.length;
}`,
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Tu modelo tiene 99% de error en entrenamiento y 42% en prueba. El diagnostico mas probable es:',
                    options: ['Subajuste', 'Sobreajuste', 'Datos insuficientes para decidir'],
                    answer: 1,
                    why: 'La gran brecha entre entrenamiento y prueba es la firma del sobreajuste. El subajuste fallaria mal en ambos.',
                },
            },
        ],
    },
]

export const dataLessons = raw.map(normalizeLesson)

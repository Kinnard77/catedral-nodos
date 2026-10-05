import { normalizeLesson } from '../../domain/lesson.js'

const raw = [
    {
        id: 'cod-pensamiento-computacional',
        title: 'Pensamiento computacional: descomponer problemas',
        subject: 'codigo',
        level: 1,
        durationMin: 15,
        summary:
            'Descomposicion, reconocimiento de patrones, abstraccion y diseno de algoritmos antes de escribir codigo.',
        objectives: [
            'Descomponer un problema en subproblemas manejables',
            'Escribir un algoritmo en pseudocodigo',
        ],
        prereq: [],
        unlocks: ['cod-variables-tipos', 'cod-algoritmos-ordenamiento'],
        tags: ['algoritmos', 'abstraccion', 'pseudocodigo', 'descomposicion'],
        skills: ['modelar', 'disenar'],
        content: [
            {
                type: 'markdown',
                text: 'Programar es escribir **instrucciones precisas**. Antes de la sintaxis viene el algoritmo: la secuencia de pasos que resuelve el problema para **cualquier** entrada valida, no solo para el ejemplo de la libreta.',
            },
            {
                type: 'lista',
                items: [
                    'Descomponer: partir el problema en piezas que se puedan resolver por separado',
                    'Reconocer patrones: detectar lo que se repite para no resolverlo dos veces',
                    'Abstraer: quedarse con lo esencial y nombrar el resto',
                    'Disenar el algoritmo: ordenar los pasos y sus condiciones',
                ],
            },
            {
                type: 'codigo',
                lang: 'text',
                caption: 'Pseudocodigo: promedio de una lista no vacia',
                text: `funcion promedio(lista):
    si lista esta vacia:
        error "lista vacia"
    suma <- 0
    para cada numero en lista:
        suma <- suma + numero
    regresar suma / cantidad(lista)`,
            },
            {
                type: 'aviso',
                text: 'Un algoritmo que falla con una lista vacia esta incompleto. Los casos limite se disenan, no se descubren en produccion.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Cual es el primer paso al resolver un problema nuevo de programacion?',
                    options: [
                        'Elegir el framework',
                        'Descomponerlo y describir el algoritmo',
                        'Escribir tests de rendimiento',
                    ],
                    answer: 1,
                    why: 'Sin entender la estructura del problema, cualquier tecnologia elegida sera una apuesta.',
                },
            },
        ],
    },
    {
        id: 'cod-variables-tipos',
        title: 'Variables, tipos y expresiones',
        subject: 'codigo',
        level: 1,
        durationMin: 18,
        summary:
            'Variables como cajas con nombre, tipos primitivos, coercion, operadores y errores clasicos de comparacion.',
        objectives: [
            'Declarar y reasignar variables distinguiendo const de let',
            'Predecir el resultado de una expresion con coercion',
        ],
        prereq: ['cod-pensamiento-computacional'],
        unlocks: ['cod-condicionales', 'cod-funciones'],
        tags: ['variables', 'tipos', 'operadores', 'coercion', 'javascript'],
        skills: ['calcular', 'depurar'],
        content: [
            {
                type: 'markdown',
                text: 'Una variable es un **nombre para un valor**. El tipo describe que operaciones tienen sentido sobre ese valor.',
            },
            {
                type: 'datos',
                rows: [
                    { Tipo: 'number', Ejemplo: '3.14, -7, NaN', Nota: 'Un solo tipo numerico (IEEE 754)' },
                    { Tipo: 'string', Ejemplo: '"hola", `hola`', Nota: 'Inmutable: los metodos devuelven copias' },
                    { Tipo: 'boolean', Ejemplo: 'true, false', Nota: 'Resultado de comparaciones' },
                    { Tipo: 'object', Ejemplo: '{ a: 1 }, [1, 2]', Nota: 'Se compara por referencia, no por valor' },
                ],
            },
            { type: 'formula', tex: '\\texttt{"2" + 2} \\;\\Rightarrow\\; \\texttt{"22"}', caption: 'El + con un string concatena.' },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Trampas frecuentes',
                text: `"2" + 2      // "22"   concatenacion
"2" - 2      // 0      coercion numerica
0.1 + 0.2    // 0.30000000000000004
0.1 + 0.2 === 0.3        // false
Math.abs(0.1 + 0.2 - 0.3) < 1e-9  // true  -> comparar con tolerancia
NaN === NaN  // false  -> usar Number.isNaN(x)`,
            },
            {
                type: 'aviso',
                text: 'Usa `===` en lugar de `==`: el operador debil convierte tipos y produce igualdades inesperadas como `"0" == false`.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Que imprime `typeof []` en JavaScript?',
                    options: ['"array"', '"object"', '"list"'],
                    answer: 1,
                    why: 'Los arreglos son objetos; para detectarlos se usa `Array.isArray(x)`.',
                },
            },
        ],
    },
    {
        id: 'cod-condicionales',
        title: 'Condicionales y flujo de control',
        subject: 'codigo',
        level: 1,
        durationMin: 16,
        summary:
            'if, else, operadores logicos, cortocircuito, valores falsy y la diferencia entre ramificar y validar.',
        objectives: [
            'Escribir condiciones que cubran todos los casos',
            'Usar cortocircuito para evitar accesos invalidos',
        ],
        prereq: ['cod-variables-tipos'],
        unlocks: ['cod-bucles'],
        tags: ['if', 'booleano', 'logica', 'cortocircuito', 'falsy'],
        skills: ['resolver', 'depurar'],
        content: [
            {
                type: 'markdown',
                text: 'Un condicional elige un camino segun el valor de una condicion booleana. La trampa no es la sintaxis, es **no cubrir un caso**.',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Clasificar una calificacion cubriendo el rango completo',
                text: `function clasificar(nota) {
    if (typeof nota !== "number" || Number.isNaN(nota)) return "invalida";
    if (nota < 0 || nota > 10) return "fuera de rango";
    if (nota < 6) return "reprobada";
    if (nota < 8) return "aprobada";
    if (nota < 9.5) return "notable";
    return "sobresaliente";
}`,
            },
            {
                type: 'markdown',
                text: 'En JavaScript existen valores **falsy**: `false`, `0`, `""`, `null`, `undefined` y `NaN`. Todo lo demas es verdadero, incluido `"0"` y `[]`.',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Cortocircuito: el orden importa',
                text: `// && se detiene en el primer falsy
usuario && usuario.nombre;      // seguro
usuario.nombre && usuario;      // puede lanzar error si usuario es null

// ?? respeta 0 y "" como valores validos
edad ?? "sin dato";   // 0 se conserva
edad || "sin dato";   // 0 se reemplaza (probablemente no querias eso)`,
            },
            {
                type: 'quiz',
                quiz: {
                    q: '`0 || "sin dato"` devuelve:',
                    options: ['0', '"sin dato"', 'NaN'],
                    answer: 1,
                    why: '0 es falsy, y `||` devuelve el segundo operando. Con `??` el resultado seria 0.',
                },
            },
        ],
    },
    {
        id: 'cod-bucles',
        title: 'Bucles e iteracion',
        subject: 'codigo',
        level: 2,
        durationMin: 20,
        summary:
            'for, while, recorrido de colecciones, acumuladores, error de uno en uno y costo de un bucle anidado.',
        objectives: [
            'Elegir el tipo de bucle adecuado',
            'Detectar off-by-one y bucles infinitos',
        ],
        prereq: ['cod-condicionales'],
        unlocks: ['cod-arreglos', 'cod-algoritmos-ordenamiento', 'cod-complejidad'],
        tags: ['for', 'while', 'iteracion', 'acumulador', 'off-by-one'],
        skills: ['resolver', 'analizar'],
        content: [
            {
                type: 'markdown',
                text: 'Un bucle repite mientras se cumpla una condicion. La pregunta clave: **cuantas veces** y **como avanza** el estado en cada vuelta.',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Tres formas de sumar los pares del 1 al 100',
                text: `let suma = 0;
for (let i = 2; i <= 100; i += 2) suma += i;

let j = 2, suma2 = 0;
while (j <= 100) { suma2 += j; j += 2; }

const suma3 = Array.from({ length: 50 }, (_, k) => (k + 1) * 2)
    .reduce((acc, n) => acc + n, 0);
// 2550`,
            },
            {
                type: 'markdown',
                text: 'Un bucle **anidado** no cuesta la suma de sus vueltas sino el producto. Recorrer 1000 elementos dentro de otro recorrido de 1000 son un millon de pasos.',
            },
            { type: 'formula', tex: 'O(n) \\times O(m) = O(n \\cdot m)' },
            {
                type: 'aviso',
                text: 'Si el estado del bucle no cambia hacia la condicion de salida, el bucle nunca termina. Todo `while` necesita un avance demostrable.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: '`for (let i = 0; i <= arr.length; i++)` sobre un arreglo de 5 elementos:',
                    options: [
                        'Recorre los 5 elementos',
                        'Accede una vez a arr[5], que es undefined',
                        'Nunca ejecuta el cuerpo',
                    ],
                    answer: 1,
                    why: 'El error clasico off-by-one: el ultimo indice valido es length - 1.',
                },
            },
        ],
    },
    {
        id: 'cod-funciones',
        title: 'Funciones, parametros y alcance',
        subject: 'codigo',
        level: 2,
        durationMin: 22,
        summary:
            'Funciones puras, parametros y retorno, alcance, closures y funciones de orden superior.',
        objectives: [
            'Escribir funciones puras y explicar por que importan',
            'Explicar una closure con un ejemplo util',
        ],
        prereq: ['cod-variables-tipos'],
        unlocks: ['cod-arreglos', 'datos-regresion-lineal'],
        tags: ['funciones', 'puras', 'alcance', 'closure', 'orden superior'],
        skills: ['disenar', 'abstraer'],
        content: [
            {
                type: 'markdown',
                text: 'Una funcion empaqueta un calculo y le pone nombre. Una funcion **pura** cumple dos reglas: mismas entradas producen la misma salida, y no modifica nada externo.',
            },
            { type: 'formula', tex: 'y = f(x) \\quad\\text{sin efectos secundarios}' },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Impura contra pura',
                text: `let total = 0;
const sumarImpura = (n) => { total += n; return total; };  // depende del exterior

const sumarPura = (a, b) => a + b;                        // solo depende de sus entradas

// Orden superior: recibe o devuelve funciones
const multiplicador = (k) => (n) => n * k;
const triple = multiplicador(3);
triple(7); // 21`,
            },
            {
                type: 'markdown',
                text: 'Una **closure** es una funcion que recuerda las variables del lugar donde fue creada, aunque ese lugar ya haya terminado de ejecutarse. `triple` conserva `k = 3` dentro de si misma.',
            },
            {
                type: 'nota',
                text: 'Las funciones puras son faciles de probar: no hay que preparar estado ni limpiar despues.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Cual de estas funciones es pura?',
                    options: [
                        '`() => Date.now()`',
                        '`(a, b) => a * b`',
                        '`(arr) => arr.push(1)`',
                    ],
                    answer: 1,
                    why: 'Depende solo de sus parametros y no modifica nada. `Date.now()` cambia con el tiempo y `push` muta el arreglo.',
                },
            },
        ],
    },
    {
        id: 'cod-arreglos',
        title: 'Arreglos, objetos y transformacion de datos',
        subject: 'codigo',
        level: 2,
        durationMin: 24,
        summary:
            'Recorrido de colecciones con map, filter y reduce, inmutabilidad, ordenamiento con comparador y busqueda.',
        objectives: [
            'Combinar map, filter y reduce para responder una pregunta sobre datos',
            'Ordenar sin mutar el arreglo original',
        ],
        prereq: ['cod-funciones', 'cod-bucles'],
        unlocks: ['datos-tablas', 'cod-complejidad'],
        tags: ['arreglos', 'map', 'filter', 'reduce', 'inmutabilidad', 'sort'],
        skills: ['transformar', 'disenar'],
        content: [
            {
                type: 'markdown',
                text: 'Casi todo procesamiento de datos se reduce a tres operaciones: **transformar** cada elemento (`map`), **filtrar** los que cumplen algo (`filter`) y **resumir** a un solo valor (`reduce`).',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Pipeline tipico: alumnos aprobados y su promedio',
                text: `const alumnos = [
    { nombre: "Ana",  notas: [9, 8, 10] },
    { nombre: "Luis", notas: [5, 6, 4] },
    { nombre: "Sara", notas: [7, 9, 8] },
];

const conPromedio = alumnos.map((a) => ({
    ...a,
    promedio: a.notas.reduce((s, n) => s + n, 0) / a.notas.length,
}));

const aprobados = conPromedio
    .filter((a) => a.promedio >= 6)
    .sort((x, y) => y.promedio - x.promedio);

// [{ Sara, 8 }, { Ana, 9 }] ordenado por promedio descendente`,
            },
            {
                type: 'aviso',
                text: '`sort` **muta** el arreglo y sin comparador ordena como texto: `[10, 9, 100].sort()` da `[10, 100, 9]`. Usa `[...arr].sort((a, b) => a - b)`.',
            },
            {
                type: 'markdown',
                text: 'Trabajar sin mutar hace el codigo predecible: cada paso devuelve un valor nuevo en lugar de modificar el que ya existia.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Que operacion devuelve un arreglo del mismo tamano transformando cada elemento?',
                    options: ['filter', 'map', 'reduce'],
                    answer: 1,
                    why: '`map` conserva la cantidad de elementos; `filter` la reduce y `reduce` la colapsa a un valor.',
                },
            },
        ],
    },
    {
        id: 'cod-complejidad',
        title: 'Complejidad y algoritmos de ordenamiento',
        subject: 'codigo',
        level: 3,
        durationMin: 28,
        summary:
            'Notacion O grande, conteo de operaciones, busqueda binaria, burbuja contra merge sort y compromisos de memoria.',
        objectives: [
            'Estimar la complejidad temporal de un algoritmo',
            'Explicar por que la busqueda binaria exige datos ordenados',
        ],
        prereq: ['cod-bucles', 'cod-arreglos', 'cod-algoritmos-ordenamiento'],
        unlocks: [],
        tags: ['complejidad', 'big-o', 'ordenamiento', 'busqueda binaria', 'merge sort'],
        skills: ['analizar', 'optimizar'],
        content: [
            {
                type: 'markdown',
                text: 'La notacion **O grande** describe como crece el trabajo cuando crece la entrada. Ignora constantes y se queda con el termino dominante, porque a escala grande solo ese importa.',
            },
            {
                type: 'datos',
                rows: [
                    { Complejidad: 'O(1)', Nombre: 'Constante', Ejemplo: 'Acceder a arr[i]' },
                    { Complejidad: 'O(log n)', Nombre: 'Logaritmica', Ejemplo: 'Busqueda binaria' },
                    { Complejidad: 'O(n)', Nombre: 'Lineal', Ejemplo: 'Recorrer una lista' },
                    { Complejidad: 'O(n log n)', Nombre: 'Casi lineal', Ejemplo: 'Merge sort' },
                    { Complejidad: 'O(n^2)', Nombre: 'Cuadratica', Ejemplo: 'Burbuja, doble bucle' },
                ],
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Busqueda binaria: O(log n) en datos ordenados',
                text: `function busquedaBinaria(arr, objetivo) {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        const medio = Math.floor((lo + hi) / 2);
        if (arr[medio] === objetivo) return medio;
        if (arr[medio] < objetivo) lo = medio + 1;
        else hi = medio - 1;
    }
    return -1;
}
// 1 000 000 de elementos -> maximo ~20 comparaciones`,
            },
            {
                type: 'markdown',
                text: '**Merge sort** divide a la mitad, ordena cada mitad y mezcla. El trabajo por nivel es $O(n)$ y hay $\\log_2 n$ niveles, de ahi $O(n \\log n)$.',
            },
            { type: 'formula', tex: 'T(n) = 2T\\!\\left(\\frac{n}{2}\\right) + O(n) = O(n \\log n)' },
            {
                type: 'nota',
                text: 'Complejidad no es velocidad. Un O(n^2) con n pequeno puede ganarle a un O(n log n) con mucho costo por operacion.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Buscar en un arreglo desordenado con busqueda binaria:',
                    options: [
                        'Funciona igual',
                        'Da resultados incorrectos',
                        'Es mas rapido que recorrerlo',
                    ],
                    answer: 1,
                    why: 'El algoritmo decide descartar mitades suponiendo orden; sin ese supuesto descarta la mitad correcta.',
                },
            },
        ],
    },
    {
        id: 'cod-algoritmos-ordenamiento',
        title: 'Algoritmos de ordenamiento paso a paso',
        subject: 'codigo',
        level: 3,
        durationMin: 30,
        summary:
            'Burbuja, insercion, seleccion y merge sort implementados y comparados: estabilidad, memoria extra y cuando conviene cada uno.',
        objectives: [
            'Implementar merge sort y explicar su invariante',
            'Elegir un algoritmo de ordenamiento segun estabilidad y memoria disponible',
        ],
        prereq: ['cod-bucles', 'cod-arreglos'],
        unlocks: [],
        tags: ['ordenamiento', 'merge sort', 'quicksort', 'burbuja', 'estabilidad'],
        skills: ['implementar', 'analizar'],
        content: [
            {
                type: 'markdown',
                text: 'Ordenar es el problema mas estudiado de la computacion porque **habilita** todo lo demas: buscar con búsqueda binaria, agrupar, detectar duplicados y unir tablas. Todos los algoritmos resuelven lo mismo; se diferencian en el costo.',
            },
            {
                type: 'datos',
                rows: [
                    { Algoritmo: 'Burbuja', Mejor: 'O(n)', Promedio: 'O(n^2)', Memoria: 'O(1)', 'Estable': 'Si' },
                    { Algoritmo: 'Insercion', Mejor: 'O(n)', Promedio: 'O(n^2)', Memoria: 'O(1)', 'Estable': 'Si' },
                    { Algoritmo: 'Seleccion', Mejor: 'O(n^2)', Promedio: 'O(n^2)', Memoria: 'O(1)', 'Estable': 'No' },
                    { Algoritmo: 'Merge sort', Mejor: 'O(n log n)', Promedio: 'O(n log n)', Memoria: 'O(n)', 'Estable': 'Si' },
                    { Algoritmo: 'Quicksort', Mejor: 'O(n log n)', Promedio: 'O(n log n)', Memoria: 'O(log n)', 'Estable': 'No' },
                ],
                caption: 'Estable significa que los elementos con la misma clave conservan su orden relativo.',
            },
            {
                type: 'markdown',
                text: '**Insercion** es el mejor primer algoritmo: toma cada elemento y lo coloca en su lugar dentro de la parte ya ordenada. Con datos casi ordenados trabaja en $O(n)$, y por eso las implementaciones reales lo usan para bloques pequenos.',
            },
            {
                type: 'codigo',
                lang: 'javascript',
                caption: 'Insercion y merge sort, con conteo de comparaciones',
                text: `function insercion(arr, cmp) {
    const a = [...arr];
    let comparaciones = 0;
    for (let i = 1; i < a.length; i++) {
        const actual = a[i];
        let j = i - 1;
        while (j >= 0 && (comparaciones++, cmp(a[j], actual) > 0)) {
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = actual;
    }
    return { ordenado: a, comparaciones };
}

function mergeSort(arr, cmp) {
    if (arr.length < 2) return arr;
    const medio = Math.floor(arr.length / 2);
    const izq = mergeSort(arr.slice(0, medio), cmp);
    const der = mergeSort(arr.slice(medio), cmp);
    const salida = [];
    let i = 0, j = 0;
    while (i < izq.length && j < der.length) {
        // <= conserva el orden relativo: por eso merge sort es estable
        salida.push(cmp(izq[i], der[j]) <= 0 ? izq[i++] : der[j++]);
    }
    return [...salida, ...izq.slice(i), ...der.slice(j)];
}`,
            },
            {
                type: 'markdown',
                text: 'La **invariante** de merge sort es la clave para entenderlo: al entrar al bucle de mezcla, `izq` y `der` ya estan ordenados. Cada vuelta saca el menor de los dos frentes, y por eso el resultado queda ordenado.',
            },
            {
                type: 'aviso',
                text: 'Con datos ya ordenados, quicksort con pivote en el primer elemento degenera a $O(n^2)$ y ademas puede desbordar la pila de recursion. Merge sort no tiene ese caso patologico, pero paga $O(n)$ de memoria.',
            },
            {
                type: 'nota',
                text: 'En la practica no implementas el ordenamiento: el del lenguaje es Timsort, un hibrido estable de $O(n \\log n)$ que explota tramos ya ordenados.',
            },
            {
                type: 'quiz',
                quiz: {
                    q: 'Necesitas ordenar personas por edad conservando el orden alfabetico entre quienes tienen la misma edad. Que exiges al algoritmo?',
                    options: ['Que sea in-place', 'Que sea estable', 'Que sea recursivo'],
                    answer: 1,
                    why: 'Solo la estabilidad garantiza que las claves iguales conserven su orden de entrada.',
                },
            },
        ],
    },
]

export const codeLessons = raw.map(normalizeLesson)

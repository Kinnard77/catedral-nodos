/**
 * Semilla del gameflow: Catedral de Dolores Hidalgo (Chronos 1881).
 *
 * Esto NO es contenido de juego: es el DISENO del gameflow. Cada pieza responde
 * a una pregunta del metodo, y el grafo se lee como una cadena de dependencias
 * que termina en `gf-ancla`.
 *
 * El diseno se hace al reves: se declara primero el FINAL (gf-ancla) y cada
 * pieza dice con `prereq` que tiene que estar resuelto antes. El lienzo abre
 * por el ancla y revela hacia atras.
 *
 * Escalera de concrecion (`level`):
 *   1 = Intención  -> que queremos que el jugador sienta o descubra
 *   2 = Mecánica   -> como se provoca (QR, GPS, camara)
 *   3 = Escena     -> donde ocurre y en que orden
 *
 * AVISO: los detalles historicos de la catedral estan enunciados como hipotesis
 * de diseno, no como hechos verificados. Hay que contrastarlos con la
 * documentacion real del proyecto Chronos 1881 antes de convertirlos en contenido.
 */

export const catedralDoloresGameflow = [
    // ---------------------------------------------------------------- EL FINAL
    {
        id: 'gf-ancla',
        ancla: true,
        title: 'El jugador descubre que él es el siguiente cantero',
        subject: 'final',
        level: 1,
        durationMin: 4,
        summary:
            'El final no es un trofeo ni un dato: es la certeza de que la catedral sigue en construccion y que la visita dejo una marca. Lo que buscamos que sienta es pertenencia, no admiracion.',
        objectives: [
            'Que el jugador sienta pertenencia, no asombro turistico',
            'Que entienda la catedral como obra inacabada, no como monumento cerrado',
            'Que su propio paso quede registrado dentro del juego',
        ],
        prereq: ['gf-revelacion-firmas', 'gf-emocion-pertenencia', 'gf-revelacion-capas'],
        unlocks: [],
        tags: ['final', 'pertenencia', 'ancla', 'obra inacabada', 'cantero'],
        skills: ['cierre narrativo', 'identidad', 'legado'],
        content: [
            {
                type: 'markdown',
                text: 'El jugador llega al ultimo punto creyendo que va a recibir una explicacion. En vez de eso, el juego le pide **una accion minima**: dejar su marca. La revelacion no se le cuenta, la ejecuta.',
            },
            {
                type: 'lista',
                items: [
                    'El giro: las marcas que fue encontrando no eran adornos, eran firmas.',
                    'El remate: la ultima marca que aparece en el muro es la suya.',
                    'El silencio: ni medallas ni puntaje. Solo el muro y el jugador.',
                ],
            },
            {
                type: 'aviso',
                text: 'Riesgo de diseno: si aqui se entrega un trofeo o una pantalla de "felicidades", se destruye la sensacion de pertenencia. El final tiene que ser sobrio.',
            },
        ],
    },

    // ------------------------------------------------- LO QUE HACE FALTA ANTES
    {
        id: 'gf-revelacion-firmas',
        title: 'Las marcas no son adornos: son firmas',
        subject: 'revelacion',
        level: 1,
        durationMin: 3,
        summary:
            'Sin esta revelacion el final no significa nada. El jugador tiene que pasar de "que bonito grabado" a "esto lo firmo una persona concreta".',
        objectives: [
            'Convertir un detalle decorativo en una prueba de autoría',
            'Que el jugador empiece a buscar marcas sin que nadie se lo pida',
        ],
        prereq: ['gf-mecanica-cronovision', 'gf-pista-plano'],
        unlocks: [],
        tags: ['revelacion', 'marcas de cantero', 'firma', 'autoria'],
        skills: ['observacion', 'lectura de detalle'],
        content: [
            {
                type: 'markdown',
                text: 'La revelacion funciona si el jugador ya vio varias marcas **antes** de saber que significan. El orden importa: primero el patron, despues el sentido.',
            },
            {
                type: 'datos',
                rows: [
                    { antes: 'Un grabado curioso', despues: 'La firma de alguien que vivio aqui' },
                    { antes: 'Textura de la piedra', despues: 'Una decision tomada hace siglos' },
                ],
            },
        ],
    },
    {
        id: 'gf-emocion-pertenencia',
        title: 'El jugador se reconoce en alguien de hace 300 años',
        subject: 'emocion',
        level: 1,
        durationMin: 3,
        summary:
            'La emocion que sostiene todo el final. No se provoca explicando historia: se provoca poniendo al jugador en el mismo sitio y en la misma postura que aquella persona.',
        objectives: [
            'Que el jugador sienta continuidad, no distancia historica',
            'Que el pasado deje de ser un tema y pase a ser un lugar',
        ],
        prereq: ['gf-mecanica-gps', 'gf-lugar-cripta'],
        unlocks: [],
        tags: ['emocion', 'pertenencia', 'continuidad', 'identidad'],
        skills: ['empatia', 'presencia'],
        content: [
            {
                type: 'markdown',
                text: 'La palanca es la **coincidencia fisica**: el jugador esta donde estuvo el otro, mirando lo que el otro miro. Eso no se logra con texto, se logra con el cuerpo en el sitio.',
            },
            {
                type: 'nota',
                text: 'Por eso el anclaje GPS no es una mecanica de control, es la mecanica emocional. Si se puede jugar desde el sofa, esta pieza se cae.',
            },
        ],
    },
    {
        id: 'gf-revelacion-capas',
        title: 'La catedral está construida por capas, sobre algo anterior',
        subject: 'revelacion',
        level: 1,
        durationMin: 3,
        summary:
            'Da la escala temporal: lo que el jugador ve no es el edificio original, es la ultima capa de una serie de decisiones. Prepara la idea de obra inacabada.',
        objectives: [
            'Romper la ilusion de edificio unico y terminado',
            'Que el jugador entienda que construir es ir agregando y tapando',
        ],
        prereq: ['gf-mecanica-qr', 'gf-emocion-asombro'],
        unlocks: [],
        tags: ['revelacion', 'capas', 'estratigrafia', 'transformacion'],
        skills: ['lectura de proceso', 'pensamiento historico'],
        content: [
            {
                type: 'markdown',
                text: 'El jugador ya vio el edificio entero desde fuera. Aqui descubre que esa imagen es un **corte en el tiempo**, no la forma definitiva.',
            },
            {
                type: 'lista',
                items: [
                    'Lo que hoy es muro, antes fue puerta.',
                    'Lo que hoy es capilla, antes fue otra cosa.',
                    'Nada se demolio del todo: se cubrio.',
                ],
            },
        ],
    },

    // ----------------------------------------------------------------- MECANICA
    {
        id: 'gf-mecanica-cronovision',
        title: 'Cronovisión: reconocer la marca con la cámara',
        subject: 'mecanica',
        level: 2,
        durationMin: 2,
        summary:
            'El jugador apunta con la camara a una marca de cantero y el juego la identifica y le devuelve su ficha. Es la mecanica que convierte piedra en informacion.',
        objectives: [
            'Que reconocer la marca se sienta como descifrar, no como escanear un producto',
            'Que la ficha devuelva a una persona, no a un catalogo',
        ],
        prereq: ['gf-lugar-portada'],
        unlocks: [],
        tags: ['mecanica', 'camara', 'reconocimiento', 'marcas de cantero', 'OCR'],
        skills: ['vision por computadora', 'realidad aumentada'],
        content: [
            {
                type: 'markdown',
                text: 'Corresponde al modulo **Crono-Vision** del proyecto (OpenCV / ML Kit). Tecnicamente exige tolerancia a luz mala, piedra sucia y angulos torcidos: si falla, el jugador culpa al juego, no a la piedra.',
            },
            {
                type: 'aviso',
                text: 'Si el reconocimiento falla seguido, hay que ofrecer una salida manual sin castigo. La frustracion aqui rompe la emocion de la pieza siguiente.',
            },
        ],
    },
    {
        id: 'gf-mecanica-gps',
        title: 'Anclaje GPS: hay que estar ahí',
        subject: 'mecanica',
        level: 2,
        durationMin: 2,
        summary:
            'El progreso se abre por presencia fisica. No es una mecanica de dificultad, es la que garantiza que la emocion de pertenencia sea real.',
        objectives: [
            'Impedir que la experiencia se pueda completar a distancia',
            'Que llegar al sitio sea parte del juego, no un tramite previo',
        ],
        prereq: [],
        unlocks: [],
        tags: ['mecanica', 'GPS', 'presencia', 'ubicacion'],
        skills: ['geolocalizacion', 'compensacion en interiores'],
        content: [
            {
                type: 'markdown',
                text: 'El pendiente tecnico del proyecto es el anclaje en menos de 2 segundos **y con compensacion para interiores**: dentro de una cripta el GPS no basta y hace falta otra referencia.',
            },
            {
                type: 'nota',
                text: 'Umbral a definir: cuantos metros de tolerancia antes de considerar que el jugador "esta" en el punto.',
            },
        ],
    },
    {
        id: 'gf-mecanica-qr',
        title: 'El QR abre el tramo, no da la respuesta',
        subject: 'mecanica',
        level: 2,
        durationMin: 2,
        summary:
            'El QR sirve para saber en que punto esta el jugador y liberar el siguiente tramo. Nunca para entregar contenido: eso convertiria la visita en una caza de codigos.',
        objectives: [
            'Dar un punto de sincronizacion fiable entre el juego y el recorrido',
            'Evitar que el jugador se salte el orden del recorrido',
        ],
        prereq: ['gf-lugar-portada'],
        unlocks: [],
        tags: ['mecanica', 'QR', 'desbloqueo', 'orden'],
        skills: ['lectura de codigos', 'control de flujo'],
        content: [
            {
                type: 'markdown',
                text: 'Regla de diseno: **el QR abre, la camara revela, el GPS obliga**. Si las tres hacen lo mismo, sobran dos.',
            },
            {
                type: 'datos',
                rows: [
                    { mecanica: 'QR', funcion: 'Sincronizar el punto del recorrido' },
                    { mecanica: 'GPS', funcion: 'Exigir presencia real' },
                    { mecanica: 'Cronovisión', funcion: 'Convertir la piedra en informacion' },
                ],
            },
        ],
    },

    // -------------------------------------------------------------------- PISTA
    {
        id: 'gf-pista-plano',
        title: 'El plano incompleto que se va completando',
        subject: 'pista',
        level: 3,
        durationMin: 2,
        summary:
            'El jugador recibe un plano al que le faltan partes. Cada marca reconocida enciende un trozo. Es el hilo que lo mantiene mirando la piedra en vez del telefono.',
        objectives: [
            'Dar una razon para observar sin decirle donde mirar',
            'Hacer visible el progreso sin usar barras de porcentaje',
        ],
        prereq: [],
        unlocks: [],
        tags: ['pista', 'plano', 'progreso', 'orientacion'],
        skills: ['orientacion espacial', 'deduccion'],
        content: [
            {
                type: 'markdown',
                text: 'El plano es el **medidor de progreso del juego**, pero disfrazado de herramienta del personaje. Evita la pantalla de misiones y mantiene al jugador dentro de la ficcion.',
            },
            {
                type: 'formula',
                tex: 'm = \\frac{A}{n}',
                caption:
                    'El módulo del plano: el ancho total A repartido entre n tramos. Al completar el plano el jugador reconstruye m, que es la unidad con la que esta trazado el edificio.',
            },
            {
                type: 'lista',
                items: [
                    'Empieza casi vacio: solo el contorno.',
                    'Cada marca reconocida enciende una zona.',
                    'Se completa justo antes del final, nunca antes.',
                ],
            },
        ],
    },

    // ------------------------------------------------------------------- LUGAR
    {
        id: 'gf-lugar-portada',
        title: 'La portada, de día',
        subject: 'lugar',
        level: 3,
        durationMin: 2,
        summary:
            'Primer contacto. Es donde el jugador entiende sin que nadie le explique que este juego se juega mirando hacia arriba y con paciencia.',
        objectives: [
            'Ensenar el ritmo del juego sin tutorial',
            'Dar la primera marca que reconocer',
        ],
        prereq: [],
        unlocks: [],
        tags: ['lugar', 'portada', 'fachada', 'apertura'],
        skills: ['arquitectura', 'lectura de fachada'],
        content: [
            {
                type: 'markdown',
                text: 'La portada es el **tutorial implicito**: si el jugador no baja el ritmo aqui, no lo hara en la cripta, donde la luz no ayuda.',
            },
        ],
    },
    {
        id: 'gf-lugar-cripta',
        title: 'La cripta: poca luz y silencio',
        subject: 'lugar',
        level: 3,
        durationMin: 3,
        summary:
            'El lugar donde la emocion de pertenencia se vuelve fisica. Sin luz no hay distraccion, y sin distraccion el jugador se queda a solas con lo que esta descubriendo.',
        objectives: [
            'Bajar el ritmo al minimo',
            'Que la oscuridad sea incomodidad, no castigo',
        ],
        prereq: ['gf-pista-plano'],
        unlocks: [],
        tags: ['lugar', 'cripta', 'oscuridad', 'silencio'],
        skills: ['diseno de atmosfera', 'iluminacion'],
        content: [
            {
                type: 'markdown',
                text: 'Aqui el plano deja de servir y hay que **resolver con el tacto y la linterna del telefono**. El juego pierde precision a proposito.',
            },
            {
                type: 'aviso',
                text: 'Ojo con la accesibilidad: si la cripta es impracticable para alguien, el final entero queda fuera de su alcance. Hace falta una via alternativa.',
            },
        ],
    },
    {
        id: 'gf-lugar-campanario',
        title: 'El campanario: el único sitio desde donde se ve el pueblo',
        subject: 'lugar',
        level: 3,
        durationMin: 3,
        summary:
            'La escena que da la escala. El jugador deja de mirar la catedral como objeto y la ve como parte de una comunidad que la uso para convocarse.',
        objectives: [
            'Pasar de la escala del detalle a la escala del pueblo',
            'Justificar por que este edificio importa mas alla de su arquitectura',
        ],
        prereq: [],
        unlocks: [],
        tags: ['lugar', 'campanario', 'campana', 'comunidad', 'panorama'],
        skills: ['lectura de paisaje', 'contexto social'],
        content: [
            {
                type: 'markdown',
                text: 'La campana se presenta como **tecnologia de convocatoria**: su funcion era reunir gente, no decorar la torre. Ese salto hace que el edificio deje de ser un monumento y pase a ser una herramienta civica.',
            },
            {
                type: 'nota',
                text: 'Hipotesis de diseno a validar con la documentacion de Chronos 1881: el papel concreto que este campanario tuvo en la convocatoria de 1810 se enuncia aqui como intencion narrativa, no como hecho cerrado.',
            },
        ],
    },
    {
        id: 'gf-emocion-asombro',
        title: 'Asombro al mirar hacia arriba',
        subject: 'emocion',
        level: 1,
        durationMin: 2,
        summary:
            'Emocion de apertura, no de cierre. Es la que compra la atencion del jugador para el resto del recorrido y la que despues se matiza con las capas.',
        objectives: [
            'Conseguir que el jugador levante la vista',
            'Sembrar la sospecha de que hay mas de lo que se ve',
        ],
        prereq: ['gf-lugar-campanario'],
        unlocks: [],
        tags: ['emocion', 'asombro', 'escala', 'verticalidad'],
        skills: ['percepcion de escala'],
        content: [
            {
                type: 'markdown',
                text: 'El asombro es la emision mas facil y la mas barata. Sirve para **entrar**, pero si el juego se queda ahi el final no funciona: el asombro aleja, la pertenencia acerca.',
            },
            {
                type: 'datos',
                rows: [
                    { emocion: 'Asombro', efecto: 'Aleja: yo miro algo que no soy yo' },
                    { emocion: 'Pertenencia', efecto: 'Acerca: yo soy parte de eso' },
                ],
            },
        ],
    },
]

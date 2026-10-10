/**
 * MATERIAL DE EJEMPLO — el caso del §4 de la especificación del GN-IEC.
 *
 * OJO, Y ES IMPORTANTE: **todo entra como `por_verificar`.** El caso de la laja
 * de la girola, el arcediano Don Fernando, el 1384 y las cinco lises es el
 * EJEMPLO DE FORMATO que trae la especificación, no un hallazgo comprobado. El
 * diseñador aún no ha dicho si es real.
 *
 * Mientras no tenga fuente, el juego NO puede afirmarlo. Por eso ninguna opción
 * entra como `documentado`: la regla se aplica aunque el material lo escriba yo.
 */

import { normalizarOpcion } from '../../domain/material.js'

const CATEDRAL = 'valencia'

const BRUTO = [
    {
        id: 'ANC-01',
        clase: 'anclaje',
        pilar: 'anclaje_visible',
        titulo: 'Laja sepulcral con altorrelieve en la girola',
        detalle:
            'Losa de pavimento con bordura inscrita y altorrelieve. El detalle que la delata es de nada: el punto medial está descentrado entre las palabras 3 y 4 de la bordura.',
        ubicacion: 'Tercer tramo norte de la girola, frente a una capilla radial',
        estado: 'por_verificar',
        fuente: '',
    },
    {
        id: 'EPI-01',
        clase: 'epigrafia',
        pilar: 'apocrifo',
        titulo: 'HIC · REC · IN · NŌE · DĪ · OMNIP',
        detalle:
            'Transcripción literal con abreviaturas por suspensión: REC = Requiescit; NŌE = Nomine, con tilde supralineal; DĪ = Dei; OMNIP = Omnipotentis. La lectura litúrgica convencional es «Hic requiescit in nomine Dei omnipotentis».',
        estado: 'por_verificar',
        fuente: '',
    },
    {
        id: 'LIN-01',
        clase: 'linguistica',
        pilar: 'apocrifo',
        titulo: 'La tilde supralineal que se puede leer como negación',
        detalle:
            'Regla 1 del §5: el trazo horizontal que indica omisión de m o n admite lectura canónica como contracción, o lectura alternativa como negación disimulada. Suprimiendo la tilde y resegmentando, «IN NŌE» pasa a «IN NON E».',
        juego: 'titulus_deletion + resegmentación silábica',
        estado: 'por_verificar',
        fuente: '',
    },
    {
        id: 'DC-01',
        clase: 'dato_curioso',
        pilar: 'dualidad_gremios',
        titulo: 'El arcediano Don Fernando y sus cinco lises',
        detalle:
            'La explicación piadosa dice que la laja es la tumba de un bienhechor de las obras (1384) y que la heráldica con cinco lises apunta a un legado nobiliario. Es el arenque rojo canónico y también la trampa: lleva al jugador a buscar un testamento en el archivo.',
        estado: 'por_verificar',
        fuente: '',
    },
    {
        id: 'FIL-01',
        clase: 'dato_curioso',
        pilar: 'secreto_filosofico',
        titulo: 'Averroísmo latino: la aniquilación del alma individual',
        detalle:
            'Candidata a conclusión: si la inscripción dice «en el no-ser de Dios», la revelación es la aniquilación del alma individual tras la muerte, que niega la inmortalidad personal y las penas del Purgatorio. Se formula como proposición ontológica, sin nada sobrenatural.',
        estado: 'por_verificar',
        fuente: '',
    },
]

export const materialValencia = BRUTO.map((o) =>
    normalizarOpcion({ ...o, ejemplo: true }, CATEDRAL),
)

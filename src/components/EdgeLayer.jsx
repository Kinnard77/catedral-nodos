import { memo } from 'react'
import { puntoMedio, trazarConexion } from '../graph/graphEngine.js'

const COLOR = {
    prereq: { trazo: 'rgba(251,191,36,0.55)', activo: '#fbbf24' },
    sugerido: { trazo: 'rgba(167,139,250,0.5)', activo: '#a78bfa' },
    ruta: { trazo: 'rgba(56,189,248,0.6)', activo: '#38bdf8' },
}

function EdgeLayerBase({
    edges,
    posiciones,
    resaltadas = [],
    ultimoDespliegue = [],
    etiquetas,
    onSeleccionar,
}) {
    const nuevas = new Set(ultimoDespliegue)

    return (
        <svg
            className="pointer-events-none absolute left-0 top-0"
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
        >
            <defs>
                <marker
                    id="punta-prereq"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#fbbf24" opacity="0.85" />
                </marker>
                <marker
                    id="punta-sugerido"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#a78bfa" opacity="0.85" />
                </marker>
                <marker
                    id="punta-ruta"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" opacity="0.9" />
                </marker>
            </defs>

            {edges.map((edge) => {
                const origen = posiciones.get(edge.from)
                const destino = posiciones.get(edge.to)
                if (!origen || !destino) return null

                const { d } = trazarConexion(origen, destino)
                const color = COLOR[edge.kind] || COLOR.sugerido
                const esNueva = nuevas.has(edge.id) || nuevas.has(edge.from) || nuevas.has(edge.to)
                const resaltada = resaltadas.includes(edge.from) || resaltadas.includes(edge.to)

                // Las aristas que se salen del area visible se recortan al viewBox real
                const identificador = `punta-${edge.kind}`

                return (
                    <g key={edge.id}>
                        <path
                            className={`conexion ${esNueva ? 'conexion-nueva' : ''}`}
                            d={d}
                            stroke={resaltada ? color.activo : color.trazo}
                            strokeWidth={resaltada ? 2.4 : 1.7}
                            markerEnd={`url(#${identificador})`}
                        />
                        {esNueva && (
                            <path
                                className="conexion cometa"
                                d={d}
                                stroke={color.activo}
                                strokeWidth={2}
                                opacity={0.9}
                            />
                        )}

                        {/* LA ETIQUETA: qué te llevas de este nodo. En un PDC la
                            flecha dice QUÉ transfiere; sin esto solo hay rayas. */}
                        {etiquetas?.get(edge.id) && (
                            <Etiqueta
                                texto={etiquetas.get(edge.id)}
                                origen={origen}
                                destino={destino}
                                activa={resaltada}
                            />
                        )}
                    </g>
                )
            })}
        </svg>
    )
}

/** Etiqueta de arista con halo, para que se lea sobre las conexiones. */
function Etiqueta({ texto, origen, destino, activa }) {
    const medio = puntoMedio(origen, destino)
    return (
        <text
            x={medio.x}
            y={medio.y - 7}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={activa ? '#f8fafc' : '#cbd5e1'}
            stroke="#05070d"
            strokeWidth="3.5"
            paintOrder="stroke"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
            {texto}
        </text>
    )
}

export const EdgeLayer = memo(EdgeLayerBase)

/** Capa interactiva invisible sobre cada arista, para poder seleccionarla. */
export function EdgeHitAreas({ edges, posiciones, onSeleccionar }) {
    return (
        <svg className="absolute left-0 top-0" width="100%" height="100%" style={{ overflow: 'visible' }}>
            {edges.map((edge) => {
                const origen = posiciones.get(edge.from)
                const destino = posiciones.get(edge.to)
                if (!origen || !destino) return null
                const { d } = trazarConexion(origen, destino)
                return (
                    <path
                        key={`hit-${edge.id}`}
                        d={d}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={14}
                        className="pointer-events-auto cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            onSeleccionar?.(edge)
                        }}
                    />
                )
            })}
        </svg>
    )
}

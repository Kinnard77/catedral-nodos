import { memo } from 'react'
import { NODE_H, NODE_W } from '../graph/graphEngine.js'
import { levelOf, subjectOf } from '../domain/lesson.js'

function NodeCardBase({
    lesson,
    posicion,
    activo,
    cursada,
    nueva,
    pendientes,
    enRuta,
    onSeleccionar,
    onContinuar,
}) {
    const materia = subjectOf(lesson)
    const nivel = levelOf(lesson)

    return (
        <div
            className={`group absolute ${nueva ? 'animate-node-in' : ''}`}
            data-node-id={lesson.id}
            data-node-state={activo ? 'activo' : cursada ? 'cursada' : 'pendiente'}
            data-node-nueva={nueva ? 'si' : 'no'}
            style={{
                left: 0,
                top: 0,
                width: NODE_W,
                height: NODE_H,
                transform: `translate3d(${posicion.x}px, ${posicion.y}px, 0)`,
                willChange: 'transform',
            }}
        >
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onSeleccionar(lesson.id)}
                className={`relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 ${
                    activo
                        ? 'border-aura-cyan bg-ink-800 shadow-[0_0_0_1px_rgba(56,189,248,0.55),0_16px_38px_-14px_rgba(56,189,248,0.6)]'
                        : cursada
                          ? 'border-aura-mint/60 bg-ink-850 hover:border-aura-mint'
                          : 'border-ink-700 bg-ink-900 hover:border-ink-500'
                }`}
                style={{ borderLeftColor: materia.color, borderLeftWidth: 3 }}
            >
                {activo && (
                    <span className="pointer-events-none absolute -right-1 -top-1 h-3 w-3 rounded-full bg-aura-cyan">
                        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-aura-cyan" />
                    </span>
                )}

                <div className="flex items-start gap-2">
                    <span
                        className="mt-[2px] flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono text-[11px]"
                        style={{ backgroundColor: `${materia.color}1f`, color: materia.color }}
                    >
                        {materia.glyph}
                    </span>
                    <span className="line-clamp-2 font-display text-[13px] font-semibold leading-snug text-slate-100">
                        {lesson.title}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="rounded-md bg-ink-700/70 px-1.5 py-0.5 font-medium text-slate-300">
                        N{nivel.short}
                    </span>
                    <span className="rounded-md bg-ink-700/70 px-1.5 py-0.5 text-slate-400">
                        {lesson.durationMin}′
                    </span>
                    {cursada && (
                        <span className="rounded-md bg-aura-mint/15 px-1.5 py-0.5 font-semibold text-aura-mint">
                            cursada
                        </span>
                    )}
                    {!cursada && enRuta && (
                        <span className="rounded-md bg-aura-cyan/15 px-1.5 py-0.5 font-semibold text-aura-cyan">
                            en ruta
                        </span>
                    )}
                    {lesson.origin === 'generado' && (
                        <span className="rounded-md bg-aura-violet/15 px-1.5 py-0.5 font-semibold text-aura-violet">
                            nueva
                        </span>
                    )}
                </div>
            </button>

            {pendientes > 0 && (
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation()
                        onContinuar(lesson.id)
                    }}
                    title={`Desplegar ${pendientes} nodo(s) relacionados`}
                    className="absolute -right-2.5 top-1/2 flex h-6 -translate-y-1/2 items-center gap-1 rounded-full border border-aura-cyan/60 bg-ink-850 px-2 text-[10px] font-semibold text-aura-cyan opacity-0 shadow-lg transition-all duration-200 hover:bg-aura-cyan hover:text-ink-950 group-hover:opacity-100"
                >
                    <span className="text-[13px] leading-none">+</span>
                    {pendientes}
                </button>
            )}
        </div>
    )
}

export const NodeCard = memo(NodeCardBase)

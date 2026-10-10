import { useEffect, useState } from 'react'
import { LEVELS, TIPOS } from '../domain/lesson.js'

/**
 * Formulario de la accion central del metodo: añadir una pieza que hace falta
 * ANTES de otra.
 *
 * El texto esta escrito para que el propio formulario enseñe el diseno inverso:
 * no se pregunta "que va despues de esto", se pregunta "que tiene que estar
 * resuelto antes". La previsualizacion dice en voz alta donde va a caer la pieza.
 */
export default function NuevaPieza({ padre, onCerrar, onCrear }) {
    const [titulo, setTitulo] = useState('')
    const [tipo, setTipo] = useState('revelacion')
    const [nivel, setNivel] = useState(1)
    const [notas, setNotas] = useState('')

    // Cada vez que se abre con otro padre, el formulario arranca limpio.
    useEffect(() => {
        if (padre) {
            setTitulo('')
            setTipo('revelacion')
            setNivel(1)
            setNotas('')
        }
    }, [padre])

    if (!padre) return null

    const valido = titulo.trim().length > 0
    const nivelInfo = LEVELS[nivel]

    const crear = () => {
        if (!valido) return
        onCrear({
            title: titulo.trim(),
            subject: tipo,
            level: nivel,
            durationMin: 3,
            summary: notas.trim(),
            content: notas.trim()
                ? [
                      { type: 'markdown', text: notas.trim() },
                      {
                          type: 'aviso',
                          text: `Pieza añadida a mano. Su sitio en el diseño: antes de «${padre.title}».`,
                      },
                  ]
                : [],
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/80 p-6 backdrop-blur-sm">
            <div className="panel w-full max-w-lg animate-node-in rounded-2xl p-5 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="font-display text-base font-semibold text-white">
                            Añadir lo que hace falta antes
                        </h2>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-slate-400">
                            Estás diseñando hacia atrás: describes una pieza que tiene que estar resuelta
                            <span className="text-slate-200"> antes </span>
                            de lo que ya está en el lienzo.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="rounded-lg border border-ink-700 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:border-ink-500 hover:text-white"
                    >
                        Cerrar
                    </button>
                </div>

                {/* Donde cae la pieza */}
                <div className="mb-4 rounded-xl border border-aura-cyan/40 bg-aura-cyan/5 px-3 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-aura-cyan/80">
                        Se colocará antes de
                    </div>
                    <div className="mt-0.5 font-display text-[13px] font-semibold text-slate-100">
                        {padre.title}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                        Al pulsar «ver continuación» sobre ella, esta pieza será lo que aparezca.
                    </div>
                </div>

                {/* Que tiene que estar resuelto */}
                <label
                    htmlFor="pieza-titulo"
                    className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                >
                    ¿Qué tiene que estar resuelto antes?
                </label>
                <textarea
                    id="pieza-titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault()
                            crear()
                        }
                    }}
                    rows={2}
                    autoFocus
                    placeholder="Ej. El jugador ya ha visto varias marcas sin saber qué son"
                    className="sin-scrollbar w-full resize-none rounded-xl border border-ink-700 bg-ink-950/70 px-3 py-2.5 text-[13px] leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-aura-cyan/70 focus:outline-none"
                />

                {/* Tipo de pieza */}
                <div className="mt-4">
                    <div className="mb-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Tipo de pieza
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {/* "El final" no se ofrece: esta pieza va ANTES de otra, así
                            que por definición no puede ser el desenlace. */}
                        {Object.entries(TIPOS)
                            .filter(([clave]) => clave !== 'final')
                            .map(([clave, info]) => (
                            <button
                                key={clave}
                                type="button"
                                data-tipo={clave}
                                onClick={() => setTipo(clave)}
                                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] transition-colors ${
                                    tipo === clave
                                        ? 'border-aura-cyan/70 bg-aura-cyan/10 text-slate-100'
                                        : 'border-ink-700/70 bg-ink-850/50 text-slate-400 hover:border-ink-500 hover:text-slate-200'
                                }`}
                            >
                                <span style={{ color: info.color }}>{info.glyph}</span>
                                {info.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Escalera de concrecion */}
                <div className="mt-4">
                    <div className="mb-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Concreción
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        {[1, 2, 3].map((n) => (
                            <button
                                key={n}
                                type="button"
                                data-nivel={n}
                                onClick={() => setNivel(n)}
                                className={`rounded-lg border px-2 py-1.5 text-[11.5px] transition-colors ${
                                    nivel === n
                                        ? 'border-aura-cyan/70 bg-aura-cyan/10 text-slate-100'
                                        : 'border-ink-700/70 bg-ink-850/50 text-slate-400 hover:border-ink-500 hover:text-slate-200'
                                }`}
                            >
                                {LEVELS[n].label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">
                        {nivel === 1 && 'Intención: qué queremos que el jugador sienta o descubra.'}
                        {nivel === 2 && 'Mecánica: cómo se provoca esa sensación o ese hallazgo.'}
                        {nivel === 3 && 'Escena: dónde ocurre y con qué.'}
                    </div>
                </div>

                {/* Notas */}
                <div className="mt-4">
                    <label
                        htmlFor="pieza-notas"
                        className="mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                    >
                        Notas de diseño <span className="normal-case text-slate-500">(opcional)</span>
                    </label>
                    <textarea
                        id="pieza-notas"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        rows={2}
                        placeholder="Por qué esta pieza es necesaria y qué se rompe si falta"
                        className="sin-scrollbar w-full resize-none rounded-xl border border-ink-700 bg-ink-950/70 px-3 py-2.5 text-[12.5px] leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-aura-cyan/70 focus:outline-none"
                    />
                </div>

                <div className="mt-5 flex items-center gap-2">
                    <button
                        type="button"
                        data-accion="crear-antes"
                        onClick={crear}
                        disabled={!valido}
                        className="flex-1 rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-3 py-2.5 font-display text-[13px] font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Añadir antes de «{padre.title.length > 24 ? `${padre.title.slice(0, 24)}…` : padre.title}»
                    </button>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="rounded-xl border border-ink-600 px-3 py-2.5 text-[12px] text-slate-300 transition-colors hover:border-ink-400 hover:text-white"
                    >
                        Cancelar
                    </button>
                </div>

                <div className="mt-2 text-center text-[10.5px] text-slate-500">
                    {nivelInfo.label} · se revelará al pulsar «ver continuación» sobre la pieza anterior
                </div>
            </div>
        </div>
    )
}

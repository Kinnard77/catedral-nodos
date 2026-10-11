import { texto } from '../domain/elemento.js'
import { soloConReal, textoMisterio } from '../domain/misterio.js'

/**
 * EL MOTOR PROPONE, EL DISEÑADOR ELIGE.
 *
 * Es la respuesta a la pregunta que el diseñador puso en el centro: *«¿qué
 * misterio conviene trabajar en esta catedral si tenemos estos y aquellos
 * elementos?»*. El motor lee el material y propone; el diseñador decide.
 *
 * La pantalla enseña **en qué se apoya cada misterio**, porque un misterio sin
 * elementos que lo aguanten no se sostiene: es la regla del Grial.
 */
export default function Misterios({
    abierto,
    catedral,
    elementos,
    propuestas,
    proponiendo,
    error,
    onProponer,
    onElegir,
    onCerrar,
    tieneClave,
}) {
    if (!abierto || !catedral) return null

    const porId = new Map(elementos.map((e) => [e.id, e]))
    const elegido = catedral.misterios?.[0] || null
    const candidatos = propuestas?.candidatos || []
    const rechazados = propuestas?.rechazados || []

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/85 p-6 backdrop-blur-sm">
            <div className="panel w-full max-w-3xl animate-node-in rounded-2xl p-5 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <div className="mb-1 font-display text-[10.5px] font-semibold uppercase tracking-wider text-aura-cyan">
                            Paso 2 · El misterio
                        </div>
                        <h2 className="font-display text-lg font-semibold text-white">
                            ¿Qué misterio conviene en {catedral.nombre}?
                        </h2>
                        <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-slate-400">
                            El motor lee el material y propone. Cada misterio dice{' '}
                            <span className="text-slate-200">en qué elementos se apoya</span>: si no se
                            apoya en nada, no se sostiene y no llega a la lista. Tú eliges.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="shrink-0 rounded-lg border border-ink-700 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:border-ink-500 hover:text-white"
                    >
                        Cerrar
                    </button>
                </div>

                {/* El material con el que trabaja */}
                <div className="mb-3 rounded-xl border border-ink-700/60 bg-ink-900/50 px-3 py-2">
                    <span className="text-[11px] text-slate-400">
                        Material sobre la mesa:{' '}
                        <span className="font-semibold text-slate-200">{elementos.length}</span>{' '}
                        elemento(s)
                        {elementos.length === 0 && ' — sin material el motor solo podría inventar'}
                    </span>
                </div>

                <button
                    type="button"
                    data-accion="proponer-misterios"
                    onClick={onProponer}
                    disabled={proponiendo || elementos.length === 0}
                    className="w-full rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-3 py-2.5 font-display text-[13px] font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {proponiendo
                        ? 'El motor está leyendo el material…'
                        : candidatos.length
                          ? 'Volver a proponer'
                          : 'Que el motor proponga misterios'}
                </button>

                {!tieneClave && (
                    <div className="mt-2 rounded-xl border border-aura-amber/40 bg-aura-amber/5 px-3 py-2 text-[11.5px] leading-relaxed text-aura-amber">
                        Sin clave del motor en Ajustes no hay propuesta posible: el motor local no sabe
                        inventar, solo ordenar lo que ya existe. Ponla en Ajustes y vuelve aquí.
                    </div>
                )}

                {error && (
                    <div className="mt-2 rounded-xl border border-aura-rose/50 bg-aura-rose/10 px-3 py-2 text-[11.5px] leading-relaxed text-aura-rose">
                        {error}
                    </div>
                )}

                {/* Los candidatos */}
                {candidatos.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {candidatos.map((c) => {
                            const esElegido = elegido?.id === c.id
                            const soloReal = soloConReal(c, elementos)
                            return (
                                <div
                                    key={c.id}
                                    data-candidato={c.id}
                                    className={`rounded-2xl border p-3.5 ${
                                        esElegido
                                            ? 'border-aura-cyan/70 bg-aura-cyan/5'
                                            : 'border-ink-700/60 bg-ink-850/40'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-display text-[13.5px] font-semibold text-slate-100">
                                            {textoMisterio(c, 'titulo')}
                                        </h3>
                                        {esElegido && (
                                            <span className="shrink-0 rounded-md bg-aura-cyan/15 px-2 py-0.5 text-[10px] font-semibold text-aura-cyan">
                                                ELEGIDO
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1.5 text-[12px] leading-relaxed text-slate-300">
                                        {textoMisterio(c, 'descubrimiento')}
                                    </p>

                                    {/* LA RELECTURA: el campo que convierte esto en
                                        un desenlace. Va destacado porque es el que
                                        decide si el misterio asombra o solo informa. */}
                                    {textoMisterio(c, 'relectura') && (
                                        <p className="mt-2 rounded-md border-l-2 border-aura-cyan/70 bg-aura-cyan/5 py-1.5 pl-2.5 text-[11.5px] leading-relaxed text-slate-200">
                                            <span className="font-semibold text-aura-cyan">
                                                Lo que se relee:{' '}
                                            </span>
                                            {textoMisterio(c, 'relectura')}
                                        </p>
                                    )}

                                    {textoMisterio(c, 'encaje') && (
                                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-400">
                                            <span className="text-slate-500">Por qué aquí: </span>
                                            {textoMisterio(c, 'encaje')}
                                        </p>
                                    )}

                                    {textoMisterio(c, 'duda') && (
                                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-aura-violet">
                                            <span className="text-slate-500">La duda que deja: </span>
                                            {textoMisterio(c, 'duda')}
                                        </p>
                                    )}

                                    {/* En qué se apoya: la regla del Grial, a la vista */}
                                    <div className="mt-2.5 border-t border-ink-700/50 pt-2">
                                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                            Se apoya en {c.sostienen.length} elemento(s)
                                            {soloReal ? ' · todo real' : ' · mezcla real e inventado'}
                                        </div>
                                        <ul className="flex flex-wrap gap-1.5">
                                            {c.sostienen.map((id) => {
                                                const el = porId.get(id)
                                                if (!el) return null
                                                return (
                                                    <li
                                                        key={id}
                                                        className={`rounded-lg border px-2 py-0.5 text-[10.5px] ${
                                                            el.tipo === 'real'
                                                                ? 'border-aura-mint/50 text-aura-mint'
                                                                : 'border-aura-violet/50 text-aura-violet'
                                                        }`}
                                                    >
                                                        {texto(el, 'nombre')}
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                        {c.inventados.length > 0 && (
                                            <div className="mt-1 text-[10.5px] text-aura-amber">
                                                El motor citó {c.inventados.length} elemento(s) que no
                                                existen: descartados.
                                            </div>
                                        )}
                                    </div>

                                    {!esElegido && (
                                        <button
                                            type="button"
                                            data-elegir={c.id}
                                            onClick={() => onElegir(c)}
                                            className="mt-3 w-full rounded-xl border border-aura-cyan/50 bg-aura-cyan/10 px-3 py-2 font-display text-[12.5px] font-semibold text-aura-cyan transition-colors hover:bg-aura-cyan/20"
                                        >
                                            Elegir este misterio
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Lo que se cayó, dicho en voz alta */}
                {rechazados.length > 0 && (
                    <div className="mt-4 rounded-xl border border-aura-amber/40 bg-aura-amber/5 px-3 py-2.5">
                        <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-aura-amber">
                            Se cayeron {rechazados.length}
                        </div>
                        <ul className="space-y-0.5">
                            {rechazados.map((r, i) => (
                                <li key={i} className="text-[11px] text-slate-400">
                                    «{r.titulo}» — {r.motivo}
                                </li>
                            ))}
                        </ul>
                </div>
                )}

                {elegido && (
                    <div className="mt-4 rounded-xl border border-aura-cyan/50 bg-aura-cyan/5 px-3 py-2.5 text-[11.5px] leading-relaxed text-slate-300">
                        El misterio de esta catedral ya está decidido:{' '}
                        <span className="font-semibold text-slate-100">
                            {textoMisterio(elegido, 'titulo')}
                        </span>
                        . A partir de aquí ya se puede diseñar el gameflow.
                    </div>
                )}
            </div>
        </div>
    )
}

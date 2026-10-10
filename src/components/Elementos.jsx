import { useEffect, useState } from 'react'
import { CATEGORIAS, categoriaOf, texto, TIPOS_ELEMENTO } from '../domain/elemento.js'

/**
 * EL MATERIAL DE LA CATEDRAL: qué tenemos.
 *
 * Es el primer paso real del diseño, y el orden lo puso el diseñador: *«primero
 * qué tenemos, luego qué podemos inducir con lo que tenemos»*. Sin material no
 * se puede decidir qué misterio conviene — solo inventarlo, y no podemos
 * descubrir el Santo Grial en Sevilla porque está en Valencia.
 *
 * Las categorías no son solo una clasificación: cada una trae **la pregunta**
 * que ayuda a acordarse de lo que hay en el edificio. La herramienta pregunta,
 * el diseñador contesta.
 */
export default function Elementos({ abierto, catedral, elementos, onAgregar, onBorrar, onCerrar }) {
    const [categoria, setCategoria] = useState('arquitectura')
    const [tipo, setTipo] = useState('real')
    const [nombre, setNombre] = useState('')
    const [detalle, setDetalle] = useState('')
    const [fuente, setFuente] = useState('')
    const [aviso, setAviso] = useState(null)

    useEffect(() => {
        if (abierto) {
            setCategoria('arquitectura')
            setTipo('real')
            setNombre('')
            setDetalle('')
            setFuente('')
            setAviso(null)
        }
    }, [abierto, catedral?.id])

    if (!abierto || !catedral) return null

    const cat = categoriaOf(categoria)
    const reales = elementos.filter((e) => e.tipo === 'real')
    const modificables = elementos.filter((e) => e.tipo === 'modificable')
    const pideFuente = tipo === 'real'
    const puedeGuardar = nombre.trim().length > 0 && (!pideFuente || fuente.trim().length > 0)

    const guardar = () => {
        const r = onAgregar({ nombre, tipo, categoria, detalle, fuente })
        if (!r?.ok) {
            setAviso(r?.motivo || 'No se pudo guardar.')
            return
        }
        setNombre('')
        setDetalle('')
        setFuente('')
        setAviso(null)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/85 p-6 backdrop-blur-sm">
            <div className="panel w-full max-w-3xl animate-node-in rounded-2xl p-5 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <div className="mb-1 font-display text-[10.5px] font-semibold uppercase tracking-wider text-aura-cyan">
                            Paso 1 · El material
                        </div>
                        <h2 className="font-display text-lg font-semibold text-white">
                            ¿Qué tenemos en {catedral.nombre}?
                        </h2>
                        <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-slate-400">
                            Primero el material, luego qué podemos inducir con él. Un elemento{' '}
                            <span className="text-slate-200">real</span> se documenta; lo que nos
                            inventamos o modificamos se declara como tal. Sin esta separación no se puede
                            sostener después el «¿será verdad?».
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

                {/* El interrogatorio: categorías con su pregunta */}
                <div className="mb-4">
                    <div className="mb-1.5 font-display text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">
                        ¿De qué clase es lo que vas a añadir?
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {CATEGORIAS.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                data-categoria={c.id}
                                onClick={() => setCategoria(c.id)}
                                className={`rounded-lg border px-2.5 py-1.5 text-[11.5px] transition-colors ${
                                    categoria === c.id
                                        ? 'border-aura-cyan/70 bg-aura-cyan/10 text-slate-100'
                                        : 'border-ink-700/70 bg-ink-850/50 text-slate-400 hover:border-ink-500 hover:text-slate-200'
                                }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-2 rounded-xl border border-aura-cyan/30 bg-aura-cyan/5 px-3 py-2 text-[11.5px] leading-relaxed text-slate-300">
                        {cat.pregunta}
                    </div>
                </div>

                {/* Real o inventado */}
                <div className="mb-4 grid gap-1.5 sm:grid-cols-2">
                    {Object.entries(TIPOS_ELEMENTO).map(([clave, info]) => (
                        <button
                            key={clave}
                            type="button"
                            data-tipo-elem={clave}
                            onClick={() => setTipo(clave)}
                            className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                                tipo === clave
                                    ? 'border-aura-cyan/70 bg-aura-cyan/10'
                                    : 'border-ink-700/70 bg-ink-850/50 hover:border-ink-500'
                            }`}
                        >
                            <span className="flex items-center gap-1.5 font-display text-[12px] font-semibold text-slate-100">
                                <span style={{ color: info.color }}>{info.glyph}</span>
                                {info.label}
                            </span>
                            <span className="mt-0.5 block text-[10.5px] leading-snug text-slate-400">
                                {info.detalle}
                            </span>
                        </button>
                    ))}
                </div>

                {/* La ficha */}
                <div className="space-y-2.5">
                    <div>
                        <label
                            htmlFor="elemento-nombre"
                            className="mb-1 block font-display text-[10.5px] font-semibold uppercase tracking-wider text-slate-400"
                        >
                            Qué es
                        </label>
                        <input
                            id="elemento-nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. La inscripción del coro"
                            className="w-full rounded-xl border border-ink-700 bg-ink-950/70 px-3 py-2 text-[12.5px] text-slate-100 placeholder:text-slate-500 focus:border-aura-cyan/70 focus:outline-none"
                        />
                    </div>

                    {pideFuente && (
                        <div>
                            <label
                                htmlFor="elemento-fuente"
                                className="mb-1 block font-display text-[10.5px] font-semibold uppercase tracking-wider text-aura-mint"
                            >
                                Fuente · obligatoria para lo real
                            </label>
                            <input
                                id="elemento-fuente"
                                type="text"
                                value={fuente}
                                onChange={(e) => setFuente(e.target.value)}
                                placeholder="De dónde sale: libro, archivo, placa, web con autoría…"
                                className="w-full rounded-xl border border-aura-mint/40 bg-ink-950/70 px-3 py-2 text-[12.5px] text-slate-100 placeholder:text-slate-500 focus:border-aura-mint/70 focus:outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="elemento-detalle"
                            className="mb-1 block font-display text-[10.5px] font-semibold uppercase tracking-wider text-slate-400"
                        >
                            Detalle <span className="normal-case text-slate-500">(opcional)</span>
                        </label>
                        <textarea
                            id="elemento-detalle"
                            value={detalle}
                            onChange={(e) => setDetalle(e.target.value)}
                            rows={2}
                            placeholder="Qué es, dónde está y por qué puede servir para un misterio"
                            className="sin-scrollbar w-full resize-none rounded-xl border border-ink-700 bg-ink-950/70 px-3 py-2 text-[12.5px] leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-aura-cyan/70 focus:outline-none"
                        />
                    </div>

                    {aviso && (
                        <div className="rounded-xl border border-aura-rose/50 bg-aura-rose/10 px-3 py-2 text-[11.5px] text-aura-rose">
                            {aviso}
                        </div>
                    )}

                    <button
                        type="button"
                        data-accion="agregar-elemento"
                        onClick={guardar}
                        disabled={!puedeGuardar}
                        className="w-full rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-3 py-2.5 font-display text-[13px] font-semibold text-ink-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Añadir al material
                    </button>
                </div>

                {/* Lo que ya está sobre la mesa */}
                <div className="mt-5 border-t border-ink-700/60 pt-4">
                    <div className="mb-2 flex items-baseline justify-between">
                        <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Material sobre la mesa
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{elementos.length}</span>
                    </div>

                    {elementos.length === 0 ? (
                        <p className="text-[11.5px] leading-relaxed text-slate-500">
                            Todavía no hay nada. Hasta que haya material no se puede decidir qué misterio
                            conviene en esta catedral: solo inventarlo.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            <Grupo etiqueta="Reales · documentados" lista={reales} onBorrar={onBorrar} />
                            <Grupo
                                etiqueta="Inventados o modificados"
                                lista={modificables}
                                onBorrar={onBorrar}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Grupo({ etiqueta, lista, onBorrar }) {
    if (!lista.length) return null
    return (
        <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {etiqueta} · {lista.length}
            </div>
            <ul className="space-y-1">
                {lista.map((e) => (
                    <li
                        key={e.id}
                        data-elemento={e.id}
                        className="flex items-start justify-between gap-2 rounded-xl border border-ink-700/60 bg-ink-850/40 px-3 py-2"
                    >
                        <span className="min-w-0">
                            <span className="block truncate font-display text-[12.5px] font-semibold text-slate-100">
                                {texto(e, 'nombre')}
                            </span>
                            <span className="block text-[10.5px] text-slate-500">
                                {categoriaOf(e.categoria).label}
                                {texto(e, 'fuente') ? ` · fuente: ${texto(e, 'fuente')}` : ''}
                            </span>
                        </span>
                        <button
                            type="button"
                            onClick={() => onBorrar(e.id)}
                            title="Quitar del material"
                            className="shrink-0 rounded-lg border border-ink-700 px-2 py-1 text-[10.5px] text-slate-400 transition-colors hover:border-aura-rose/60 hover:text-aura-rose"
                        >
                            Quitar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

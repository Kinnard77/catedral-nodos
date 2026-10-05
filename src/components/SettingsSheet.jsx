import { useEffect, useState } from 'react'
import { PRESETS } from '../classifier/index.js'

const MODOS = [
    {
        id: 'auto',
        titulo: 'Automático',
        detalle: 'Usa el LLM si hay API key, JAV si hay endpoint, y si no, el clasificador local.',
    },
    { id: 'llm', titulo: 'LLM', detalle: 'Fuerza un modelo compatible con la API de chat completions.' },
    { id: 'jav', titulo: 'JAV', detalle: 'Clasificador institucional por HTTP. Contrato propio, aún fuera de servicio.' },
    { id: 'local', titulo: 'Local', detalle: 'Sin red: recuperación léxica y cierre de prerrequisitos.' },
]

/** Ajustes de conexión del clasificador y del progreso guardado. */
export default function SettingsSheet({
    abierto,
    onCerrar,
    settings,
    onGuardar,
    catalogo,
    generadas,
    completadas = [],
    onReiniciarProgreso,
}) {
    const [borrador, setBorrador] = useState(settings)
    const [confirmando, setConfirmando] = useState(false)

    useEffect(() => {
        if (abierto) {
            setBorrador(settings)
            setConfirmando(false)
        }
    }, [abierto, settings])

    if (!abierto) return null

    const aplicarPreset = (preset) => {
        setBorrador((prev) => ({
            ...prev,
            llm: { ...prev.llm, baseUrl: preset.baseUrl, model: preset.model },
        }))
    }

    const guardar = () => {
        onGuardar(borrador)
        onCerrar()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/80 p-6 backdrop-blur-sm">
            <div className="panel w-full max-w-xl animate-node-in rounded-2xl p-5 shadow-2xl">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h2 className="font-display text-base font-semibold text-white">
                            Ajustes del clasificador
                        </h2>
                        <p className="mt-0.5 text-[11.5px] text-slate-400">
                            El clasificador convierte tu petición en una ruta de lecciones.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-ink-700 hover:text-white"
                    >
                        ×
                    </button>
                </div>

                {/* Modo */}
                <div className="mb-5">
                    <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Modo
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {MODOS.map((modo) => (
                            <button
                                key={modo.id}
                                type="button"
                                onClick={() => setBorrador((prev) => ({ ...prev, mode: modo.id }))}
                                className={`rounded-xl border p-2.5 text-left transition-colors ${
                                    borrador.mode === modo.id
                                        ? 'border-aura-cyan bg-aura-cyan/10'
                                        : 'border-ink-700/70 bg-ink-850/40 hover:border-ink-500'
                                }`}
                            >
                                <div
                                    className={`font-display text-[12px] font-semibold ${
                                        borrador.mode === modo.id ? 'text-aura-cyan' : 'text-slate-200'
                                    }`}
                                >
                                    {modo.titulo}
                                </div>
                                <div className="mt-0.5 text-[10.5px] leading-snug text-slate-400">
                                    {modo.detalle}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* LLM */}
                <div className="mb-5 rounded-xl border border-ink-700/60 bg-ink-850/30 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Modelo (OpenAI-compatible)
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => aplicarPreset(preset)}
                                    className={`rounded-md border px-1.5 py-0.5 text-[10px] transition-colors ${
                                        borrador.llm.model === preset.model
                                            ? 'border-aura-cyan/60 text-aura-cyan'
                                            : 'border-ink-700/70 text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Campo
                        etiqueta="Base URL"
                        valor={borrador.llm.baseUrl}
                        onChange={(v) => setBorrador((p) => ({ ...p, llm: { ...p.llm, baseUrl: v } }))}
                        placeholder="https://api.deepseek.com/v1"
                    />
                    <Campo
                        etiqueta="Modelo"
                        valor={borrador.llm.model}
                        onChange={(v) => setBorrador((p) => ({ ...p, llm: { ...p.llm, model: v } }))}
                        placeholder="deepseek-chat"
                    />
                    <Campo
                        etiqueta="API key"
                        valor={borrador.llm.apiKey}
                        onChange={(v) => setBorrador((p) => ({ ...p, llm: { ...p.llm, apiKey: v } }))}
                        placeholder="sk-…"
                        tipo="password"
                    />
                    <p className="mt-1.5 text-[10.5px] leading-relaxed text-aura-amber">
                        La clave se guarda solo en este navegador (localStorage) y viaja directo al
                        proveedor. Para producción, apunta la Base URL a un proxy propio que guarde la clave
                        en el servidor.
                    </p>
                </div>

                {/* JAV */}
                <div className="mb-5 rounded-xl border border-ink-700/60 bg-ink-850/30 p-3">
                    <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        JAV (clasificador institucional)
                    </div>
                    <Campo
                        etiqueta="Endpoint"
                        valor={borrador.jav.endpoint}
                        onChange={(v) => setBorrador((p) => ({ ...p, jav: { ...p.jav, endpoint: v } }))}
                        placeholder="https://…/classify"
                    />
                    <Campo
                        etiqueta="Token"
                        valor={borrador.jav.apiKey}
                        onChange={(v) => setBorrador((p) => ({ ...p, jav: { ...p.jav, apiKey: v } }))}
                        placeholder="opcional"
                        tipo="password"
                    />
                    <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">
                        Contrato esperado: POST con {'{ prompt, catalogo, contexto }'} y respuesta con la misma
                        forma de ruta que devuelve el LLM (title, steps, newLessons).
                    </p>
                </div>

                {/* Estado */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                    <Dato etiqueta="Lecciones" valor={catalogo.length} />
                    <Dato etiqueta="Generadas" valor={generadas.length} acento />
                    <Dato etiqueta="Cursadas" valor={completadas.length} />
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-ink-700/60 pt-4">
                    {confirmando ? (
                        <div className="flex items-center gap-2">
                            <span className="text-[11.5px] text-aura-rose">
                                ¿Borrar progreso, lecciones generadas y ajustes?
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    onReiniciarProgreso()
                                    onCerrar()
                                }}
                                className="rounded-lg bg-aura-rose/20 px-3 py-1.5 text-[11.5px] font-semibold text-aura-rose transition-colors hover:bg-aura-rose/30"
                            >
                                Sí, borrar
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmando(false)}
                                className="text-[11.5px] text-slate-400 hover:text-slate-200"
                            >
                                Cancelar
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmando(true)}
                            className="text-[11.5px] text-slate-500 transition-colors hover:text-aura-rose"
                        >
                            Reiniciar progreso
                        </button>
                    )}

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="rounded-xl border border-ink-600 px-3 py-2 text-[12px] text-slate-300 transition-colors hover:border-ink-400 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={guardar}
                            className="rounded-xl bg-gradient-to-r from-aura-cyan to-aura-mint px-4 py-2 font-display text-[12.5px] font-semibold text-ink-950 transition-opacity hover:opacity-90"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Campo({ etiqueta, valor, onChange, placeholder, tipo = 'text' }) {
    return (
        <label className="mb-2 block">
            <span className="mb-1 block text-[10.5px] uppercase tracking-wider text-slate-500">{etiqueta}</span>
            <input
                type={tipo}
                value={valor || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                spellCheck={false}
                autoComplete="off"
                className="w-full rounded-lg border border-ink-700 bg-ink-950/70 px-2.5 py-1.5 font-mono text-[11.5px] text-slate-100 placeholder:text-slate-600 focus:border-aura-cyan/70 focus:outline-none"
            />
        </label>
    )
}

function Dato({ etiqueta, valor, acento }) {
    return (
        <div className="rounded-xl border border-ink-700/60 bg-ink-850/40 px-2.5 py-2">
            <div className={`font-display text-sm font-semibold ${acento ? 'text-aura-violet' : 'text-slate-200'}`}>
                {valor}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{etiqueta}</div>
        </div>
    )
}

import { useMemo } from 'react'
import katex from 'katex'

/** Renderiza LaTeX con KaTeX. Si falla, muestra el codigo fuente en mono. */
export default function Tex({ tex, display = false, className = '' }) {
    const html = useMemo(() => {
        try {
            return katex.renderToString(String(tex || ''), {
                displayMode: display,
                throwOnError: false,
                strict: false,
                trust: false,
                output: 'html',
            })
        } catch {
            return null
        }
    }, [tex, display])

    if (!html) {
        return (
            <code className={`font-mono text-aura-amber/90 ${className}`}>{String(tex || '')}</code>
        )
    }

    return (
        <span
            className={className}
            // KaTeX genera el HTML; el LaTeX viene de contenido propio o del clasificador.
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}

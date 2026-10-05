import { Fragment, useMemo } from 'react'
import Tex from './Tex.jsx'

/**
 * Renderizador de markdown ligero + LaTeX.
 * Soporta: bloques de formula $$...$$, encabezados, listas, negritas,
 * cursivas, `codigo` y enlaces. No usa dangerouslySetInnerHTML.
 */
export default function Markdown({ text, className = '' }) {
    const nodos = useMemo(() => parseBloques(String(text || '')), [text])
    return <div className={`prosa ${className}`}>{nodos}</div>
}

function parseBloques(texto) {
    const lineas = texto.replace(/\r\n/g, '\n').split('\n')
    const salida = []
    let i = 0
    let clave = 0

    while (i < lineas.length) {
        const linea = lineas[i]

        // Formula en bloque
        if (linea.trim().startsWith('$$')) {
            const mismoRenglon = linea.trim().endsWith('$$') && linea.trim().length > 4
            if (mismoRenglon) {
                const tex = linea.trim().slice(2, -2)
                salida.push(<Tex key={clave++} tex={tex} display />)
                i += 1
                continue
            }
            const acumulado = []
            i += 1
            while (i < lineas.length && !lineas[i].trim().endsWith('$$')) {
                acumulado.push(lineas[i])
                i += 1
            }
            if (i < lineas.length) {
                acumulado.push(lineas[i].trim().replace(/\$\$$/, ''))
                i += 1
            }
            salida.push(<Tex key={clave++} tex={acumulado.join('\n')} display />)
            continue
        }

        // Encabezados
        const encabezado = /^(#{1,4})\s+(.*)$/.exec(linea.trim())
        if (encabezado) {
            const nivel = Math.min(encabezado[1].length + 1, 4)
            const Tag = `h${nivel}`
            salida.push(<Tag key={clave++}>{parseInline(encabezado[2])}</Tag>)
            i += 1
            continue
        }

        // Listas
        if (/^\s*([-*+]|\d+\.)\s+/.test(linea)) {
            const items = []
            const ordenada = /^\s*\d+\.\s+/.test(linea)
            while (i < lineas.length && /^\s*([-*+]|\d+\.)\s+/.test(lineas[i])) {
                items.push(lineas[i].replace(/^\s*([-*+]|\d+\.)\s+/, ''))
                i += 1
            }
            const Tag = ordenada ? 'ol' : 'ul'
            salida.push(
                <Tag key={clave++}>
                    {items.map((item, idx) => (
                        <li key={idx}>{parseInline(item)}</li>
                    ))}
                </Tag>,
            )
            continue
        }

        // Linea vacia
        if (!linea.trim()) {
            i += 1
            continue
        }

        // Parrafo: agrupa hasta una linea vacia o un bloque nuevo
        const parrafo = []
        while (
            i < lineas.length &&
            lineas[i].trim() &&
            !/^\s*([-*+]|\d+\.)\s+/.test(lineas[i]) &&
            !lineas[i].trim().startsWith('$$') &&
            !/^#{1,4}\s+/.test(lineas[i].trim())
        ) {
            parrafo.push(lineas[i])
            i += 1
        }
        salida.push(<p key={clave++}>{parseInline(parrafo.join(' '))}</p>)
    }

    return salida
}

/** Convierte marcado en linea a nodos de React, respetando $...$ y `...`. */
function parseInline(texto) {
    const nodos = []
    const patron = /(\$\$[^$]+\$\$|\$[^$\n]+\$|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|\[[^\]]+\]\([^)]+\))/g
    let ultimo = 0
    let clave = 0
    let match

    while ((match = patron.exec(texto)) !== null) {
        if (match.index > ultimo) {
            nodos.push(<Fragment key={clave++}>{texto.slice(ultimo, match.index)}</Fragment>)
        }
        const token = match[0]
        nodos.push(<Fragment key={clave++}>{renderToken(token)}</Fragment>)
        ultimo = match.index + token.length
    }

    if (ultimo < texto.length) {
        nodos.push(<Fragment key={clave++}>{texto.slice(ultimo)}</Fragment>)
    }
    return nodos
}

function renderToken(token) {
    if (token.startsWith('$$') && token.endsWith('$$') && token.length > 4) {
        return <Tex tex={token.slice(2, -2)} display />
    }
    if (token.startsWith('$') && token.endsWith('$') && token.length > 2) {
        return <Tex tex={token.slice(1, -1)} />
    }
    if (token.startsWith('`') && token.endsWith('`')) {
        return <code>{token.slice(1, -1)}</code>
    }
    if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
        return <strong>{parseInline(token.slice(2, -2))}</strong>
    }
    if (
        (token.startsWith('*') && token.endsWith('*')) ||
        (token.startsWith('_') && token.endsWith('_'))
    ) {
        return <em>{parseInline(token.slice(1, -1))}</em>
    }
    const enlace = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
    if (enlace) {
        return (
            <a href={enlace[2]} target="_blank" rel="noreferrer noopener">
                {enlace[1]}
            </a>
        )
    }
    return token
}

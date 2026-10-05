/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                ink: {
                    950: '#05070d',
                    900: '#0a0e18',
                    850: '#0f1522',
                    800: '#141b2b',
                    700: '#1d2739',
                    600: '#28344a',
                    500: '#3b4a66',
                },
                aura: {
                    mint: '#4ade9e',
                    cyan: '#38bdf8',
                    violet: '#a78bfa',
                    amber: '#fbbf24',
                    rose: '#fb7185',
                },
            },
            fontFamily: {
                display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
            keyframes: {
                'node-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px) scale(0.85)' },
                    '60%': { opacity: '1', transform: 'translateY(0) scale(1.04)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                'draw-line': {
                    '0%': { strokeDashoffset: '1' },
                    '100%': { strokeDashoffset: '0' },
                },
                'flow': {
                    '0%': { strokeDashoffset: '26' },
                    '100%': { strokeDashoffset: '0' },
                },
                'pulse-ring': {
                    '0%': { opacity: '0.75', transform: 'scale(0.9)' },
                    '100%': { opacity: '0', transform: 'scale(1.9)' },
                },
                shimmer: {
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            animation: {
                'node-in': 'node-in 520ms cubic-bezier(0.22, 1.2, 0.36, 1) both',
                'flow': 'flow 1.1s linear infinite',
                'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
                shimmer: 'shimmer 1.6s infinite',
            },
        },
    },
    plugins: [],
}

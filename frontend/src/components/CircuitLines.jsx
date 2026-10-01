import { useId } from 'react'

const traces = {
    a: [
        { path: 'M 0 58 H 1550', primary: true, accent: true },
        { path: 'M 1550 58 V 330' },
        { path: 'M 1550 210 H 1370 V 360' },
    ],
    b: [
        { path: 'M 50 95 H 1520', primary: true },
        { path: 'M 1520 95 V 360' },
        { path: 'M 1520 235 H 1370 V 380' },
    ],
    c: [
        { path: 'M 0 300 H 1520', primary: true },
        { path: 'M 1520 300 V 390' },
        { path: 'M 1520 160 H 1370 V 300', accent: true },
    ],
}

const nodes = {
    a: { square: [1366, 356], dot: [1550, 58] },
    b: { square: [1516, 376], dot: [1520, 95] },
    c: { square: [1366, 156], dot: [1520, 300] },
}

export default function CircuitLines({ variant = 'a', placement = 'hero', pulse = false }) {
    const gradientId = `circuit-gradient-${useId().replace(/:/g, '')}`

    return (
        <svg
            className={`circuit-lines circuit-lines--${variant} circuit-placement--${placement}`}
            viewBox="0 0 1600 400"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff7838" stopOpacity="0" />
                    <stop offset="45%" stopColor="#ff7838" stopOpacity="0.34" />
                    <stop offset="72%" stopColor="#e5391b" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#e5391b" stopOpacity="0" />
                </linearGradient>
            </defs>
            {traces[variant].map(({ path, primary, accent }, index) => (
                <path
                    key={`${variant}-${index}`}
                    className={`circuit-line${primary ? ' circuit-primary' : ''}${accent ? ' circuit-line--accent' : ' circuit-line--white'}`}
                    d={path}
                    stroke={accent ? `url(#${gradientId})` : undefined}
                />
            ))}
            <rect
                className="circuit-node circuit-node--square"
                x={nodes[variant].square[0]}
                y={nodes[variant].square[1]}
                width="4"
                height="4"
            />
            <circle
                className="circuit-node circuit-node--dot"
                cx={nodes[variant].dot[0]}
                cy={nodes[variant].dot[1]}
                r="2"
            />
            {pulse && <circle className="circuit-pulse" cx="18" cy="58" r="2" />}
        </svg>
    )
}
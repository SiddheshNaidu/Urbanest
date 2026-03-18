"use client";

interface FloatingPathsProps {
    position: number;
    color?: string;
}

function FloatingPaths({ position, color = "rgba(234,179,8" }: FloatingPathsProps) {
    const paths = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 10 * position} -${189 + i * 12}C-${
            380 - i * 10 * position
        } -${189 + i * 12} -${312 - i * 10 * position} ${216 - i * 12} ${
            152 - i * 10 * position
        } ${343 - i * 12}C${616 - i * 10 * position} ${470 - i * 12} ${
            684 - i * 10 * position
        } ${875 - i * 12} ${684 - i * 10 * position} ${875 - i * 12}`,
        opacity: 0.04 + i * 0.05,
        width: 0.5 + i * 0.1,
        // Staggered CSS animation duration per path
        animDuration: `${6 + (i % 4) * 2}s`,
        animDelay: `${i * 0.4}s`,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none" style={{ willChange: 'opacity' }}>
            <svg
                className="w-full h-full"
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <path
                        key={path.id}
                        d={path.d}
                        stroke={`${color},${path.opacity})`}
                        strokeWidth={path.width}
                        // CSS animation via inline style — GPU composited, zero JS cost
                        style={{
                            '--path-opacity': String(path.opacity),
                            animation: `path-breathe ${path.animDuration} ease-in-out ${path.animDelay} infinite`,
                        } as React.CSSProperties}
                    />
                ))}
            </svg>
        </div>
    );
}

interface BackgroundPathsProps {
    children?: React.ReactNode;
    className?: string;
    id?: string;
}

export function BackgroundPaths({ children, className = "", id }: BackgroundPathsProps) {
    return (
        <div className={`relative w-full overflow-hidden ${className}`} id={id}>
            {/* Dark base */}
            <div className="absolute inset-0 bg-[#0B0B0B]" />

            {/* Soft gold ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-amber/5 pointer-events-none" />

            {/* Path layers — now with CSS keyframe animations */}
            <FloatingPaths position={1} color="rgba(234,179,8" />
            <FloatingPaths position={-1} color="rgba(245,158,11" />

            {/* Subtle vignette at edges */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-transparent to-[#0B0B0B] pointer-events-none opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/50 via-transparent to-[#0B0B0B]/50 pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

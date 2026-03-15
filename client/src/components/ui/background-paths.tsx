"use client";

import { motion } from "framer-motion";

interface FloatingPathsProps {
    position: number;
    color?: string;
}

function FloatingPaths({ position, color = "rgba(234,179,8" }: FloatingPathsProps) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        opacity: 0.03 + i * 0.018,
        width: 0.5 + i * 0.04,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full"
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke={`${color},${path.opacity})`}
                        strokeWidth={path.width}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: 1,
                            opacity: [path.opacity * 0.5, path.opacity, path.opacity * 0.5],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 5 + (path.id % 5) * 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                            delay: path.id * 0.1,
                        }}
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

            {/* Path layers */}
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

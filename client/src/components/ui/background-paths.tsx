"use client";

import { motion } from "framer-motion";

interface FloatingPathsProps {
    position: number;
    color?: string;
}

function FloatingPaths({ position, color = "rgba(234,179,8" }: FloatingPathsProps) {
    // Reduced from 36 to 18 paths, with adjusted spacing to maintain density
    const paths = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 10 * position} -${189 + i * 12}C-${
            380 - i * 10 * position
        } -${189 + i * 12} -${312 - i * 10 * position} ${216 - i * 12} ${
            152 - i * 10 * position
        } ${343 - i * 12}C${616 - i * 10 * position} ${470 - i * 12} ${
            684 - i * 10 * position
        } ${875 - i * 12} ${684 - i * 10 * position} ${875 - i * 12}`,
        opacity: 0.03 + i * 0.036,
        width: 0.5 + i * 0.08,
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
                        initial={{ pathLength: 0.8, opacity: path.opacity * 0.5 }}
                        animate={{
                            opacity: [path.opacity * 0.5, path.opacity, path.opacity * 0.5],
                        }}
                        transition={{
                            duration: 6 + (path.id % 4) * 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
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

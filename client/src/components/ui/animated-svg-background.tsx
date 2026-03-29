import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export const BackgroundLines = ({
  children,
  className,
  svgOptions,
}: {
  children: React.ReactNode;
  className?: string;
  svgOptions?: {
    duration?: number;
  };
}) => {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-transparent",
        className
      )}
    >
      <LaserProjections svgOptions={svgOptions} />
      {children}
    </div>
  );
};

// ─── Vanishing-point laser data ─────────────────────────────────────────────
// Centre of the 1440×900 viewBox is (720, 450).
// Every line goes FROM the centre TO an edge point.
// The SVG path order (M then L) means pathLength=0 is the centre tip and
// pathLength=1 is the outer edge — so the beam "shoots outward" toward the
// viewer as it draws.

const CX = 720;
const CY = 450;

// Edge targets spread across all four edges for a full 360° tunnel feel
const edgePoints: [number, number][] = [
  // Top edge (y=0)
  [0, 0], [180, 0], [360, 0], [540, 0], [720, 0],
  [900, 0], [1080, 0], [1260, 0], [1440, 0],
  // Bottom edge (y=900)
  [0, 900], [180, 900], [360, 900], [540, 900], [720, 900],
  [900, 900], [1080, 900], [1260, 900], [1440, 900],
  // Left edge (x=0)
  [0, 90], [0, 225], [0, 360], [0, 450], [0, 585], [0, 720], [0, 855],
  // Right edge (x=1440)
  [1440, 90], [1440, 225], [1440, 360], [1440, 450],
  [1440, 585], [1440, 720], [1440, 855],
];

// Gold / amber / crimson colour palette matching Urbanest brand
const palette = [
  "#EAB308", "#F59E0B", "#FBBF24", "#D97706", "#FDE68A",
  "#FEF3C7", "#DC2626", "#B91C1C", "#EAB308", "#F59E0B",
];

const laserLines = edgePoints.map(([ex, ey], i) => ({
  // Path goes FROM centre TO edge point
  d: `M${CX} ${CY} L${ex} ${ey}`,
  color: palette[i % palette.length],
  // Stagger: 0 → beam 0 fires immediately, each subsequent beam waits ~0.45 s more
  delay: (i * 0.45) % 14,
  // Second-pass delay for the duplicated ring
  delay2: (i * 0.7 + 5) % 18,
}));

// ─── Laser beam motion variants ─────────────────────────────────────────────
// pathLength 0→1 draws the line FROM centre outward (tunnel rush effect).
// strokeWidth grows in lock-step so the beam looks thicker as it "passes" you.

const LaserProjections = ({
  svgOptions,
}: {
  svgOptions?: { duration?: number };
}) => {
  const dur = svgOptions?.duration ?? 2.8;

  return (
    <motion.svg
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        {/* One shared radial glow filter per colour, keyed by colour index */}
        {palette.map((color, ci) => (
          <filter
            key={`glow-${ci}`}
            id={`glow-${ci}`}
            x="-80%"
            y="-80%"
            width="260%"
            height="260%"
          >
            {/* Wide soft halo */}
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feFlood floodColor={color} floodOpacity="0.55" result="c1" />
            <feComposite in="c1" in2="blur1" operator="in" result="halo" />
            {/* Tight core glow */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur2" />
            <feFlood floodColor={color} floodOpacity="0.95" result="c2" />
            <feComposite in="c2" in2="blur2" operator="in" result="core" />
            <feMerge>
              <feMergeNode in="halo" />
              <feMergeNode in="core" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {/* ── First ring: primary beams ─────────────────────────────────── */}
      {laserLines.map((line, idx) => (
        <motion.path
          key={`beam-a-${idx}`}
          d={line.d}
          stroke={line.color}
          strokeLinecap="round"
          // Start invisible at centre, grow outward, then fade
          initial={{ pathLength: 0, strokeWidth: 0.2, opacity: 0 }}
          animate={{
            pathLength:  [0, 1,   1,   0],
            strokeWidth: [0.2, 3.5, 2.5, 0],
            opacity:     [0, 1,   0.6, 0],
          }}
          filter={`url(#glow-${idx % palette.length})`}
          transition={{
            duration: dur,
            ease: [0.22, 1, 0.36, 1],   // fast pop, smooth tail
            repeat: Infinity,
            repeatType: "loop",
            delay: line.delay,
            repeatDelay: (idx % 6) + 3,
            times: [0, 0.4, 0.75, 1],
          }}
        />
      ))}

      {/* ── Second ring: thinner echo beams, offset timing for depth ─── */}
      {laserLines.map((line, idx) => (
        <motion.path
          key={`beam-b-${idx}`}
          d={line.d}
          stroke={line.color}
          strokeLinecap="round"
          initial={{ pathLength: 0, strokeWidth: 0.1, opacity: 0 }}
          animate={{
            pathLength:  [0, 1,   1,   0],
            strokeWidth: [0.1, 1.5, 1.0, 0],
            opacity:     [0, 0.7, 0.35, 0],
          }}
          filter={`url(#glow-${idx % palette.length})`}
          transition={{
            duration: dur * 1.4,
            ease: [0.22, 1, 0.36, 1],
            repeat: Infinity,
            repeatType: "loop",
            delay: line.delay2,
            repeatDelay: (idx % 8) + 4,
            times: [0, 0.4, 0.75, 1],
          }}
        />
      ))}
    </motion.svg>
  );
};

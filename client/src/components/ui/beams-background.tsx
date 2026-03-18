import { useEffect, useRef } from "react";

interface AnimatedGradientBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    intensity?: "subtle" | "medium" | "strong";
    tier?: 'high' | 'mid' | 'low';
}

interface Beam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    hue: number;
    pulse: number;
    pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle: angle,
        speed: 0.6 + Math.random() * 1.2,
        opacity: 0.18 + Math.random() * 0.20,
        hue: 35 + Math.random() * 15,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
    };
}

// CSS-only beam fallback for low-tier devices
function CSSBeams() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {[
                { left: '15%', delay: '0s', duration: '8s', opacity: 0.12 },
                { left: '35%', delay: '2s', duration: '10s', opacity: 0.09 },
                { left: '60%', delay: '1s', duration: '7s', opacity: 0.11 },
                { left: '80%', delay: '3s', duration: '9s', opacity: 0.08 },
            ].map((beam, i) => (
                <div
                    key={i}
                    className="absolute top-0 bottom-0"
                    style={{
                        left: beam.left,
                        width: '120px',
                        transform: 'skewX(-25deg)',
                        background: `linear-gradient(180deg, transparent 0%, rgba(234,179,8,${beam.opacity}) 30%, rgba(245,158,11,${beam.opacity}) 70%, transparent 100%)`,
                        animation: `css-beam-move ${beam.duration} ease-in-out ${beam.delay} infinite`,
                        filter: 'blur(20px)',
                    }}
                />
            ))}
            {/* Dark base */}
            <div className="absolute inset-0 bg-base/60" />
        </div>
    );
}

export function BeamsBackground({
    className,
    intensity = "strong",
    children,
    tier = 'high',
}: AnimatedGradientBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<Beam[]>([]);
    const animationFrameRef = useRef<number>(0);

    // Tier-aware parameters
    const BEAM_COUNT = tier === 'high' ? 12 : tier === 'mid' ? 7 : 0;
    const MAX_DPR = tier === 'high' ? 1.5 : 1.0;
    const BLUR_PX = tier === 'high' ? 50 : 35;
    const SKIP_FRAME = tier === 'mid';

    // Low tier: CSS-only beams
    if (tier === 'low') {
        return (
            <div className={`relative w-full overflow-hidden bg-base ${className || ''}`}>
                <CSSBeams />
                <div className="relative z-10 w-full h-full">{children}</div>
            </div>
        );
    }

    useEffect(() => {
        const opacityMap = {
            subtle: 0.7,
            medium: 0.85,
            strong: 1,
        };

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // IntersectionObserver to pause when off-screen
        let isVisible = true;
        const observer = new IntersectionObserver(
            (entries) => {
                isVisible = entries[0]?.isIntersecting ?? true;
            },
            { threshold: 0 }
        );
        observer.observe(canvas);

        const updateCanvasSize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);

            beamsRef.current = Array.from({ length: BEAM_COUNT }, () =>
                createBeam(canvas.width, canvas.height)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam: Beam, index: number, totalBeams: number) {
            if (!canvas) return beam;
            
            const column = index % 3;
            const spacing = canvas.width / 3;

            beam.y = canvas.height + 100;
            beam.x =
                column * spacing +
                spacing / 2 +
                (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 100 + Math.random() * 100;
            beam.speed = 0.5 + Math.random() * 0.4;
            beam.hue = 35 + (index * 15) / totalBeams;
            beam.opacity = 0.2 + Math.random() * 0.1;
            return beam;
        }

        function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            const pulsingOpacity =
                beam.opacity *
                (0.8 + Math.sin(beam.pulse) * 0.2) *
                opacityMap[intensity];

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
            gradient.addColorStop(
                0.1,
                `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`
            );
            gradient.addColorStop(
                0.4,
                `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.6,
                `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.9,
                `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`
            );
            gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        let frameCount = 0;

        function animate() {
            if (!canvas || !ctx) return;

            animationFrameRef.current = requestAnimationFrame(animate);

            // Skip rendering when off-screen
            if (!isVisible) return;

            // Skip every other frame on mid-tier to halve CPU usage
            frameCount++;
            if (SKIP_FRAME && frameCount % 2 !== 0) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index, totalBeams);
                }

                drawBeam(ctx, beam);
            });
        }

        animate();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            observer.disconnect();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity, tier]);

    return (
        <div
            className={`relative w-full overflow-hidden bg-base ${className || ""}`}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 blur-[20px] md:blur-[50px]"
            />

            <div
                className="absolute inset-0 bg-base/5 md:bg-base/10 animate-beams-overlay backdrop-blur-none md:backdrop-blur-[50px]"
            />

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}

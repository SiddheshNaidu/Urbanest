import { Canvas } from "@react-three/fiber"
import { ShaderPlane, CSSHeroGlow } from "./background-paper-shaders"
import { useDeviceCapability } from "../../hooks/useDeviceCapability"

export default function HeroShaders() {
  const { tier } = useDeviceCapability();

  // Tier LOW: pure CSS — zero WebGL
  if (tier === 'low') {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <CSSHeroGlow />
        <CSSGlowOrbs />
      </div>
    );
  }

  // Tier MID: WebGL canvas but simplified shader + reduced DPR
  // Tier HIGH: full shader
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-60 mix-blend-screen">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={tier === 'high' ? [1, 1.5] : [1, 1]}
        gl={{ antialias: false, powerPreference: tier === 'high' ? 'high-performance' : 'default' }}
      >
        <ambientLight intensity={0.5} />
        <ShaderPlane
          position={[0, 0, -2]}
          color1="#EAB308"
          color2="#0B0B0B"
          simplified={tier === 'mid'}
        />
      </Canvas>

      {/* Glow orbs — CSS not WebGL, free on any device */}
      <CSSGlowOrbs />
    </div>
  );
}

// Extracted glow orbs to a separate component — used in both paths
function CSSGlowOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gold/15 rounded-full blur-[100px] will-change-transform animate-glow-pulse-1" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber/15 rounded-full blur-[120px] will-change-transform animate-glow-pulse-2" />
    </div>
  );
}

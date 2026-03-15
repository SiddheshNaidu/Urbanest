import { Canvas } from "@react-three/fiber"
import { ShaderPlane } from "./background-paper-shaders"

export default function HeroShaders() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-60 mix-blend-screen">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.5} />
        
        {/* Core dynamic plane in the background */}
        <ShaderPlane position={[0, 0, -2]} color1="#EAB308" color2="#0B0B0B" />
      </Canvas>

      {/* Lighting overlay effects - CSS animations instead of framer-motion for GPU compositing */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-64 h-64 bg-gold/15 rounded-full blur-[100px] will-change-transform animate-glow-pulse-1"
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber/15 rounded-full blur-[120px] will-change-transform animate-glow-pulse-2"
        />
      </div>
    </div>
  )
}

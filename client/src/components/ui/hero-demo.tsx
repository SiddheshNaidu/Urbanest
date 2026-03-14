import { Canvas } from "@react-three/fiber"
import { ShaderPlane } from "./background-paper-shaders"
import { motion } from "framer-motion"

export default function HeroShaders() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-60 mix-blend-screen">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        
        {/* Core dynamic plane in the background */}
        <ShaderPlane position={[0, 0, -2]} color1="#EAB308" color2="#0B0B0B" />
      </Canvas>

      {/* Lighting overlay effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-64 h-64 bg-gold/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-amber/10 rounded-full blur-[120px]"
        />
      </div>
    </div>
  )
}

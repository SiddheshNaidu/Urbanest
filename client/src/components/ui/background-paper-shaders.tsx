import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Custom shader material for advanced effects
const vertexShader = `
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    pos.y += sin(pos.x * 10.0 + time) * 0.1 * intensity;
    pos.x += cos(pos.y * 8.0 + time * 1.5) * 0.05 * intensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vec2 uv = vUv;
    
    // Smooth flowing noise pattern for a premium gradient
    float noise = sin(uv.x * 4.0 + time * 0.4) * cos(uv.y * 4.0 + time * 0.3);
    noise += sin(uv.x * 6.0 - time * 0.6) * cos(uv.y * 5.0 + time * 0.5) * 0.5;
    
    float n = noise * 0.5 + 0.5;
    
    // Mix dark background (color2) and gold accent (color1)
    vec3 color = mix(color2, color1, smoothstep(0.3, 0.9, n));
    
    // Radial fade-out from center
    float dist = length(uv - 0.5);
    float alpha = smoothstep(0.7, 0.0, dist) * 0.8;
    
    gl_FragColor = vec4(color, alpha);
  }
`

// Simplified fragment shader — single noise pass, 80% cheaper
const fragmentShaderSimple = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  
  void main() {
    float n = sin(vUv.x * 3.0 + time * 0.3) * cos(vUv.y * 3.0 + time * 0.25);
    n = n * 0.5 + 0.5;
    vec3 color = mix(color2, color1, smoothstep(0.3, 0.8, n));
    float dist = length(vUv - 0.5);
    float alpha = smoothstep(0.7, 0.0, dist) * 0.7;
    gl_FragColor = vec4(color, alpha);
  }
`

interface ShaderPlaneProps {
  position: [number, number, number]
  color1?: string
  color2?: string
  simplified?: boolean
}

export function ShaderPlane({
  position,
  color1 = "#EAB308",
  color2 = "#0B0B0B",
  simplified = false,
}: ShaderPlaneProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const lastTime = useRef(0)

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      intensity: { value: 1.0 },
      color1: { value: new THREE.Color(color1) },
      color2: { value: new THREE.Color(color2) },
    }),
    [color1, color2],
  )

  useFrame((state) => {
    if (!materialRef.current) return

    // Throttle: skip frame if less than 33ms since last update (~30fps cap)
    const elapsed = state.clock.elapsedTime
    if (elapsed - lastTime.current < 0.033) return
    lastTime.current = elapsed

    materialRef.current.uniforms.time.value = elapsed
    materialRef.current.uniforms.intensity.value = 1.0 + Math.sin(elapsed * 2) * 0.3
  })

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={simplified ? fragmentShaderSimple : fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function EnergyRing({
  radius = 1,
  position = [0, 0, 0],
}: {
  radius?: number
  position?: [number, number, number]
}) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <ringGeometry args={[radius * 0.8, radius, 64]} />
      <meshBasicMaterial color="#EAB308" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

// Pure CSS hero glow — renders when tier === 'low' or WebGL unavailable
export function CSSHeroGlow() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0B0B0B]">
      {/* Primary gold bloom — center */}
      <div
        className="absolute rounded-full"
        style={{
          width: '120%',
          height: '120%',
          top: '-10%',
          left: '-10%',
          background: 'radial-gradient(ellipse at 50% 45%, rgba(234,179,8,0.18) 0%, rgba(245,158,11,0.08) 35%, transparent 70%)',
          animation: 'css-hero-pulse 4s ease-in-out infinite',
        }}
      />
      {/* Secondary amber bloom — offset bottom-right */}
      <div
        className="absolute rounded-full"
        style={{
          width: '80%',
          height: '80%',
          bottom: '-20%',
          right: '-15%',
          background: 'radial-gradient(ellipse at 60% 60%, rgba(245,158,11,0.12) 0%, transparent 60%)',
          animation: 'css-hero-pulse 6s ease-in-out 1s infinite',
        }}
      />
      {/* Fine grid texture overlay — adds depth without GPU */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(234,179,8,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(234,179,8,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/60 via-transparent to-[#0B0B0B]/80" />
    </div>
  )
}

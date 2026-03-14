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

export function ShaderPlane({
  position,
  color1 = "#EAB308", // Gold
  color2 = "#0B0B0B", // Dark Base
}: {
  position: [number, number, number]
  color1?: string
  color2?: string
}) {
  const mesh = useRef<THREE.Mesh>(null)

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
    if (mesh.current) {
      uniforms.time.value = state.clock.elapsedTime
      uniforms.intensity.value = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[10, 10, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
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
      // Modulating opacity for breathing effect
      // Default to picking up our Gold/Amber scheme using Material props directly below
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <ringGeometry args={[radius * 0.8, radius, 64]} />
      <meshBasicMaterial color="#EAB308" transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: THREE.Camera
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    uniforms: {
      time: { value: number }
      resolution: { value: THREE.Vector2 }
    }
    animationId: number
  } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Vertex shader
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `

    // Fragment shader - Optimized: reduced loop from 2x4 to 1x3
    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision mediump float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.1;
        float lineWidth = 0.003;

        vec3 gold = vec3(0.918, 0.702, 0.031);
        vec3 amber = vec3(0.961, 0.620, 0.043);

        vec3 color = vec3(0.0);
        // Reduced from 2x4 to 1x3 loops — 62% fewer GPU iterations
        for(int i = 0; i < 3; i++){
          float fi = float(i);
          float intensity = lineWidth * fi * fi / abs(
            fract(t + fi * 0.015) * 5.0 - length(uv) + mod(uv.x + uv.y, 0.2)
          );
          color += mix(gold, amber, fi / 3.0) * intensity;
        }
        
        float vignette = 1.0 - length(uv * 0.5);
        gl_FragColor = vec4(color * vignette, 1.0);
      }
    `

    // Initialize Three.js scene
    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    }

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ 
        antialias: false,
        alpha: true 
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

    container.appendChild(renderer.domElement)

    // IntersectionObserver to pause when off-screen
    let isVisible = true
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true
      },
      { threshold: 0 }
    )
    observer.observe(container)

    // Handle window resize
    const onWindowResize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      uniforms.resolution.value.x = renderer.domElement.width
      uniforms.resolution.value.y = renderer.domElement.height
    }

    // Initial resize
    onWindowResize()
    window.addEventListener("resize", onWindowResize, false)

    // Animation loop — throttled to 30fps
    let lastFrameTime = 0

    const animate = () => {
      const animationId = requestAnimationFrame(animate)

      // Throttle to 30fps — skip frames to halve GPU cost
      const now = performance.now()
      if (now - lastFrameTime < 33) {
        if (sceneRef.current) sceneRef.current.animationId = animationId
        return
      }
      lastFrameTime = now

      if (isVisible) {
        uniforms.time.value += 0.05
        renderer.render(scene, camera)
      }

      if (sceneRef.current) {
        sceneRef.current.animationId = animationId
      }
    }

    // Store scene references for cleanup
    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: 0,
    }

    // Start animation
    animate()

    // Cleanup function
    return () => {
      window.removeEventListener("resize", onWindowResize)
      observer.disconnect()

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)

        if (container && sceneRef.current.renderer.domElement) {
          container.removeChild(sceneRef.current.renderer.domElement)
        }

        sceneRef.current.renderer.dispose()
        geometry.dispose()
        material.dispose()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{
        background: "transparent",
        overflow: "hidden",
      }}
    />
  )
}

// Pure CSS version of the gold ripple shader — for mid/low tier
export function CSSShaderFallback() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-[#0B0B0B]" />
      {/* Animated gold rings — mimic the shader's concentric wave pattern */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-gold/10"
            style={{
              width: `${20 + i * 20}%`,
              height: `${20 + i * 20}%`,
              animation: `css-ring-pulse ${3 + i * 0.8}s ease-in-out ${i * 0.4}s infinite`,
              borderColor: `rgba(234,179,8,${0.12 - i * 0.025})`,
            }}
          />
        ))}
      </div>
      {/* Gold radial glow center */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(234,179,8,0.12) 0%, rgba(245,158,11,0.05) 40%, transparent 70%)',
          animation: 'css-hero-pulse 5s ease-in-out infinite',
        }}
      />
      {/* Fine dot grid — adds texture depth without GPU */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(234,179,8,0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  )
}

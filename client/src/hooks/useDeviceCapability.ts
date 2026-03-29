import { useState, useEffect } from 'react';

export type CapabilityTier = 'high' | 'mid' | 'low';

interface DeviceCapability {
  tier: CapabilityTier;
  prefersReducedMotion: boolean;
  hasWebGL: boolean;
}

// Detect WebGL support by trying to create a context
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

// Score the device 0-100 based on available signals
function scoreDevice(): number {
  let score = 50; // Start at mid

  // CPU cores — most reliable signal
  const cores = navigator.hardwareConcurrency || 2;
  if (cores >= 8) score += 25;
  else if (cores >= 4) score += 10;
  else if (cores <= 2) score -= 20;

  // RAM — available in Chrome/Edge (not Safari/Firefox, defaults to undefined)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ram = (navigator as any).deviceMemory;
  if (ram !== undefined) {
    if (ram >= 8) score += 20;
    else if (ram >= 4) score += 10;
    else if (ram <= 2) score -= 20;
  }

  // Connection type — a slow connection often signals a low-end device
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conn = (navigator as any).connection;
  if (conn) {
    if (conn.effectiveType === '4g' && !conn.saveData) score += 5;
    if (conn.saveData) score -= 15;
    if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') score -= 20;
  }

  // Screen DPR — high DPR with low cores = mobile mid-range
  if (window.devicePixelRatio > 2 && cores <= 4) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function useDeviceCapability(): DeviceCapability {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasWebGL = detectWebGL();

  const [tier, setTier] = useState<CapabilityTier>(() => {
    // Synchronous first-pass — no async needed
    if (prefersReducedMotion || !hasWebGL) return 'low';
    const score = scoreDevice();
    if (score >= 65) return 'high';
    if (score >= 35) return 'mid';
    return 'low';
  });

  useEffect(() => {
    // Re-check after 100ms when all navigator APIs have settled
    const timer = setTimeout(() => {
      if (prefersReducedMotion || !hasWebGL) { setTier('low'); return; }
      const score = scoreDevice();
      if (score >= 65) setTier('high');
      else if (score >= 35) setTier('mid');
      else setTier('low');
    }, 100);
    return () => clearTimeout(timer);
  }, [hasWebGL, prefersReducedMotion]);

  return { tier, prefersReducedMotion, hasWebGL };
}

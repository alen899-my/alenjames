import { useState, useEffect, useCallback } from 'react'

export type PerformanceTier = 'low' | 'medium' | 'high'

interface PerformanceInfo {
  tier: PerformanceTier
  pixelRatio: number
  shadows: boolean
  shadowMapSize: number
  particlesScale: number
  textureScale: number
  isMobile: boolean
}

export function usePerformance() {
  const [perf, setPerf] = useState<PerformanceInfo>({
    tier: 'high',
    pixelRatio: 2,
    shadows: true,
    shadowMapSize: 1024,
    particlesScale: 1,
    textureScale: 1,
    isMobile: false,
  })

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768

    // For now, let's use a simple heuristic. 
    // We could implement a more robust FPS-based detection if needed.
    const getInitialTier = (): PerformanceTier => {
      if (isMobile) {
        // Most mobile devices should start at medium
        return 'medium'
      }
      return 'high'
    }

    const tier = getInitialTier()

    const settings: Record<PerformanceTier, PerformanceInfo> = {
      low: {
        tier: 'low',
        pixelRatio: 1,
        shadows: false,
        shadowMapSize: 256,
        particlesScale: 0.3,
        textureScale: 0.25, // 1024 -> 256
        isMobile,
      },
      medium: {
        tier: 'medium',
        pixelRatio: 1.5,
        shadows: true,
        shadowMapSize: 512,
        particlesScale: 0.6,
        textureScale: 0.5, // 1024 -> 512
        isMobile,
      },
      high: {
        tier: 'high',
        pixelRatio: 2,
        shadows: true,
        shadowMapSize: 1024,
        particlesScale: 1,
        textureScale: 1,
        isMobile,
      },
    }

    setPerf(settings[tier])

    // Optional: Real-time FPS monitoring to downgrade tier
    let frameCount = 0
    let startTime = performance.now()
    let rafId: number

    const checkFPS = () => {
      frameCount++
      const now = performance.now()
      if (now - startTime >= 3000) { // Every 3 seconds
        const fps = (frameCount * 1000) / (now - startTime)
        
        if (fps < 20) {
          setPerf((prev) => (prev.tier === 'high' ? settings.medium : settings.low))
        } else if (fps < 40 && tier === 'high') {
          setPerf(settings.medium)
        }

        frameCount = 0
        startTime = now
      }
      rafId = requestAnimationFrame(checkFPS)
    }

    // Only start monitoring if we want adaptive performance
    // rafId = requestAnimationFrame(checkFPS)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return perf
}

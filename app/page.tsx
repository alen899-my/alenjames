'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePerformance } from '@/lib/usePerformance'

const HauntedHouse = dynamic(() => import('@/components/HauntedHouse'), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading Exterior..." />,
})

const InsideHouse = dynamic(() => import('@/components/InsideHouse'), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading Interior..." />,
})

const GenericRoom = dynamic(() => import('@/components/GenericRoom'), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading Room..." />,
})

const EducationRoom = dynamic(() => import('@/components/EducationRoom'), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading Archive..." />,
})

const WorksRoom = dynamic(() => import('@/components/WorksRoom'), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading Works..." />,
})

const SkillsRoom = dynamic(() => import('@/components/SkillsRoom'), {
  ssr: false,
  loading: () => <LoadingScreen text="Loading Masteries..." />,
})

function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <p className="text-red-900 text-xs tracking-[0.4em] uppercase font-mono animate-pulse">
        {text}
      </p>
    </div>
  )
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentRoom, setCurrentRoom] = useState<'house' | 'education' | 'experience' | 'skills' | 'works'>('house')
  const perf = usePerformance()

  useEffect(() => {
    let virtualScroll = window.scrollY
    const handleScroll = () => {
      if (currentRoom !== 'house') return
      const maxScroll = document.body.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return
      virtualScroll = window.scrollY
      setScrollProgress(Math.min(Math.max(virtualScroll / maxScroll, 0), 1))
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentRoom !== 'house') return
      const step = 45 // Pixels to move per key press
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        window.scrollBy({ top: step, behavior: 'auto' })
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        window.scrollBy({ top: -step, behavior: 'auto' })
      }
    }

    const handleEnterRoom = (e: any) => setCurrentRoom(e.detail.room)
    const handleExitRoom = () => {
      setCurrentRoom('house')
      // Reset scroll slightly to be inside the house but not at the very end
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight * 0.95), 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('enter-room', handleEnterRoom)
    window.addEventListener('exit-room', handleExitRoom)

    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('enter-room', handleEnterRoom)
      window.removeEventListener('exit-room', handleExitRoom)
    }
  }, [currentRoom])

  const exteriorOpacity = Math.max(1 - (scrollProgress * 2.5), 0)
  const exteriorScale = 1 + (scrollProgress * 4)
  const interiorOpacity = scrollProgress < 0.2 ? 0 : Math.min((scrollProgress - 0.2) * 2.5, 1)

  return (
    <>
      <div className={`w-full ${currentRoom === 'house' ? 'h-[300vh]' : 'h-screen'} bg-black`} />

      <main className="fixed inset-0 w-screen h-screen overflow-hidden bg-black text-white pointer-events-none">
        {currentRoom === 'house' ? (
          <>
            {/* On-screen Controls (Haunted House Exterior only) */}
            {scrollProgress < 0.2 && (
              <div className="absolute bottom-24 right-8 z-[100] grid grid-cols-3 gap-1 pointer-events-auto opacity-40 hover:opacity-100 transition-opacity">
                <div />
                <button
                  onMouseDown={() => window.scrollBy({ top: 120, behavior: 'smooth' })}
                  onTouchStart={() => window.scrollBy({ top: 120, behavior: 'smooth' })}
                  className="w-12 h-12 bg-red-900/30 border border-red-500/50 flex items-center justify-center hover:bg-red-500/50"
                >
                  <span className="text-xl">▲</span>
                </button>
                <div />
                <div />
                <button
                  onMouseDown={() => window.scrollBy({ top: -120, behavior: 'smooth' })}
                  onTouchStart={() => window.scrollBy({ top: -120, behavior: 'smooth' })}
                  className="w-12 h-12 bg-red-900/30 border border-red-500/50 flex items-center justify-center hover:bg-red-500/50"
                >
                  <span className="text-xl">▼</span>
                </button>
                <div />
              </div>
            )}

            <section
              className="absolute inset-0 w-full h-full transform-gpu transition-opacity duration-300"
              style={{
                opacity: exteriorOpacity,
                transform: `scale(${exteriorScale})`,
                transformOrigin: '50% 60%',
                filter: `blur(${scrollProgress * (perf.tier === 'high' ? 20 : perf.tier === 'medium' ? 10 : 4)}px)`,
                zIndex: scrollProgress < 0.5 ? 20 : 10,
                pointerEvents: scrollProgress < 0.4 ? 'auto' : 'none'
              }}
            >
              <HauntedHouse isActive={exteriorOpacity > 0.01} />
            </section>

            <section
              className="absolute inset-0 w-full h-full transition-opacity duration-300"
              style={{
                opacity: interiorOpacity,
                zIndex: scrollProgress >= 0.5 ? 20 : 10,
                pointerEvents: scrollProgress >= 0.4 ? 'auto' : 'none'
              }}
            >
              <InsideHouse isActive={interiorOpacity > 0.01} />
            </section>
          </>
        ) : (
          <section className="absolute inset-0 w-full h-full pointer-events-auto">
            {currentRoom === 'education' && <EducationRoom isActive={true} />}
            {currentRoom === 'experience' && <GenericRoom title="Experience" color="#ee9944" />}
            {currentRoom === 'skills' && <SkillsRoom isActive={true} />}
            {currentRoom === 'works' && <WorksRoom isActive={true} />}
          </section>
        )}
      </main>
    </>
  )
}
'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function GenericRoom({ title, color, isActive = true }: { title: string, color: string, isActive?: boolean }) {
    const mountRef = useRef<HTMLDivElement>(null)
    const isActiveRef = useRef(isActive)
    useEffect(() => { isActiveRef.current = isActive }, [isActive])

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return

        const W = mount.clientWidth || window.innerWidth
        const H = mount.clientHeight || window.innerHeight

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(W, H)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        mount.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x020105)
        scene.fog = new THREE.FogExp2(0x020105, 0.05)

        const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 100)
        camera.position.set(0, 1.7, 5)

        // Basic Room Geometry
        const roomSize = 10
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 })
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.8 })

        // Floor
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), floorMat)
        floor.rotation.x = -Math.PI / 2
        floor.receiveShadow = true
        scene.add(floor)

        // Walls
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), wallMat)
        backWall.position.z = -roomSize / 2
        backWall.position.y = roomSize / 2
        scene.add(backWall)

        // Center Piece - Floating Crystal/Object
        const geometry = new THREE.IcosahedronGeometry(1, 0)
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            emissive: new THREE.Color(color),
            emissiveIntensity: 0.5,
            wireframe: true
        })
        const centerObj = new THREE.Mesh(geometry, material)
        centerObj.position.y = 1.7
        scene.add(centerObj)

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.1)
        scene.add(ambient)

        const pointLight = new THREE.PointLight(new THREE.Color(color), 15, 10)
        pointLight.position.set(0, 3, 0)
        scene.add(pointLight)

        const clock = new THREE.Clock()
        let raf: number

        const animate = () => {
            raf = requestAnimationFrame(animate)
            if (!isActiveRef.current) return

            const t = clock.getElapsedTime()
            centerObj.rotation.y = t * 0.5
            centerObj.rotation.x = t * 0.3
            centerObj.position.y = 1.7 + Math.sin(t) * 0.2

            renderer.render(scene, camera)
        }
        animate()

        const onResize = () => {
            const w = mount.clientWidth, h = mount.clientHeight
            camera.aspect = w / h
            camera.updateProjectionMatrix()
            renderer.setSize(w, h)
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', onResize)
            renderer.renderLists.dispose()
            renderer.dispose()
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
        }
    }, [])

    return (
        <div className="relative w-full h-full bg-black overflow-hidden">
            <div ref={mountRef} className="absolute inset-0" />
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <h1 className="text-4xl md:text-6xl font-serif tracking-[0.3em] uppercase mb-4"
                    style={{ color, textShadow: `0 0 20px ${color}` }}>
                    {title}
                </h1>
                <div className="w-24 h-px bg-white/20" />
            </div>
            {/* Back button */}
            <button
                onClick={() => window.dispatchEvent(new CustomEvent('exit-room'))}
                className="absolute top-8 left-8 z-50 px-6 py-2 border border-white/20 text-white/40 hover:text-white/80 hover:border-white/60 transition-all font-mono tracking-widest uppercase text-xs"
            >
                [ Go Back ]
            </button>
        </div>
    )
}

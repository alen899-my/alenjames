'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { usePerformance } from '@/lib/usePerformance'

type PanelType = 'profile' | 'education' | 'skills' | 'experience' | 'works' | null

interface DoorState {
    pivot: THREE.Group
    isOpen: boolean
    targetAngle: number
    currentAngle: number
    openAngle: number
    closeAngle: number
    centerX: number
    centerZ: number
}

type ClickTarget = {
    mesh: THREE.Mesh
    action: 'door' | 'panel' | 'floor'
    doorIndex?: number
    panel?: PanelType
    teleportKey?: string
}

export default function InsideHouse({ isActive = true }: { isActive?: boolean }) {
    const isActiveRef = useRef(isActive)
    useEffect(() => { isActiveRef.current = isActive }, [isActive])

    const mountRef = useRef<HTMLDivElement>(null)
    const [activePanel, setActivePanel] = useState<PanelType>(null)
    const [panelVisible, setPanelVisible] = useState(false)
    const perf = usePerformance()

    const openPanel = useCallback((type: PanelType) => {
        setActivePanel(type)
        setTimeout(() => setPanelVisible(true), 50)
    }, [])
    const closePanel = useCallback(() => {
        setPanelVisible(false)
        setTimeout(() => setActivePanel(null), 500)
    }, [])

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return

        let W = mount.clientWidth || window.innerWidth
        let H = mount.clientHeight || window.innerHeight
        const isMobile = W < 768

        // ── RENDERER ─────────────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({
            antialias: perf.tier === 'high',
            powerPreference: 'high-performance'
        })
        renderer.setSize(W, H)
        renderer.setPixelRatio(perf.pixelRatio)
        renderer.shadowMap.enabled = perf.shadows
        renderer.shadowMap.type = perf.tier === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.25
        mount.appendChild(renderer.domElement)

        // ── SCENE ────────────────────────────────────────────────────────────────
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x000000)
        scene.fog = new THREE.FogExp2(0x000000, 0.033)

        // ── DIMENSIONS ───────────────────────────────────────────────────────────
        const RW = 10, RH = 5.0
        const ZNEAR = 8, ZFAR = -20
        const roomLen = ZNEAR - ZFAR
        const floorMid = (ZNEAR + ZFAR) / 2
        const LX = -RW / 2   // left wall X
        const RX = RW / 2    // right wall X

        // ── CAMERA ───────────────────────────────────────────────────────────────
        const camera = new THREE.PerspectiveCamera(isMobile ? 75 : 65, W / H, 0.05, 120)
        const camPos = { x: 0, y: 1.75, z: ZNEAR - 0.8 }
        camera.position.set(camPos.x, camPos.y, camPos.z)

        // ── MOVEMENT ─────────────────────────────────────────────────────────────
        const keys: Record<string, boolean> = {}
        const SPEED = 0.1
        const camLook = new THREE.Vector2(0, 0)
        let scrollVel = 0

        const onKeyDown = (e: KeyboardEvent) => { keys[e.code] = true }
        const onKeyUp = (e: KeyboardEvent) => { keys[e.code] = false }
        const onWheel = (e: WheelEvent) => { scrollVel += e.deltaY * 0.013 }
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        mount.addEventListener('wheel', onWheel, { passive: false })

        const teleports: Record<string, { x: number; z: number }> = {
            education: { x: LX + 1.6, z: -2.8 },
            experience: { x: RX - 1.6, z: -2.8 },
            skills: { x: 0, z: ZFAR + 2.5 },
            works: { x: 0, z: -5.5 },
            portrait: { x: LX + 1.6, z: 3.5 },
        }

        // ── TEXTURE FACTORIES ─────────────────────────────────────────────────────

        function makeWallTex() {
            const texSize = 1024 * perf.textureScale
            const c = document.createElement('canvas'); c.width = texSize; c.height = texSize
            const ctx = c.getContext('2d')!
            ctx.fillStyle = '#070410'; ctx.fillRect(0, 0, 1024, 1024)
            for (let i = 0; i < 14000; i++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`
                ctx.fillRect(Math.random() * 1024, Math.random() * 1024, Math.random() * 3 + 1, Math.random() * 3 + 1)
            }
            for (let x = 0; x < 1024; x += 64) {
                ctx.fillStyle = 'rgba(22,8,36,0.3)'; ctx.fillRect(x, 0, 28, 1024)
            }
            for (let y = 0; y < 1024; y += 100) {
                ctx.strokeStyle = 'rgba(30,10,50,0.3)'; ctx.lineWidth = 2
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke()
            }
            for (let i = 0; i < 10; i++) {
                const bx = Math.random() * 1024, by = Math.random() * 380
                const a = 0.18 + Math.random() * 0.24
                ctx.fillStyle = `rgba(88,0,0,${a})`
                ctx.beginPath(); ctx.ellipse(bx, by, 4, 3, 0, 0, Math.PI * 2); ctx.fill()
                ctx.strokeStyle = `rgba(70,0,0,${a * 0.9})`; ctx.lineWidth = 2.5 + Math.random() * 2
                ctx.beginPath(); ctx.moveTo(bx, by)
                for (let d = 0; d < 90 + Math.random() * 160; d += 10)
                    ctx.lineTo(bx + (Math.random() - 0.5) * 8, by + d)
                ctx.stroke()
            }
            ctx.strokeStyle = 'rgba(0,0,0,0.75)'; ctx.lineWidth = 1.5
            for (let i = 0; i < 9; i++) {
                let cx = Math.random() * 1024, cy = Math.random() * 1024
                ctx.beginPath(); ctx.moveTo(cx, cy)
                for (let j = 0; j < 7; j++) { cx += (Math.random() - 0.5) * 140; cy += Math.random() * 110; ctx.lineTo(cx, cy) }
                ctx.stroke()
            }
            const b = document.createElement('canvas'); b.width = 512; b.height = 512
            const btx = b.getContext('2d')!
            btx.fillStyle = '#666'; btx.fillRect(0, 0, 512, 512)
            for (let i = 0; i < 5000; i++) {
                const v = Math.random() * 80; btx.fillStyle = `rgb(${v},${v},${v})`
                btx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2)
            }
            const map = new THREE.CanvasTexture(c); const bump = new THREE.CanvasTexture(b)
            map.wrapS = map.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping
            return { map, bump }
        }

        function makeFloorTex() {
            const texSize = 1024 * perf.textureScale
            const c = document.createElement('canvas'); c.width = texSize; c.height = texSize
            const ctx = c.getContext('2d')!
            ctx.fillStyle = '#060301'; ctx.fillRect(0, 0, 1024, 1024)
            const pw = 120
            for (let x = 0; x < 1024; x += pw) {
                const v = 0.5 + Math.random() * 0.55
                ctx.fillStyle = `rgb(${~~(18 * v)},${~~(9 * v)},${~~(4 * v)})`
                ctx.fillRect(x + 2, 0, pw - 4, 1024)
                for (let y = 0; y < 1024; y += 4) {
                    ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.08})`
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + pw, y + (Math.random() - 0.5) * 5); ctx.stroke()
                }
                ctx.fillStyle = '#000'; ctx.fillRect(x, 0, 3, 1024)
            }
            for (let i = 0; i < 6; i++) {
                const sx = Math.random() * 1024, sy = Math.random() * 1024
                const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, 120 + Math.random() * 150)
                gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)')
                ctx.fillStyle = gr; ctx.fillRect(sx - 270, sy - 270, 540, 540)
            }
            const b = document.createElement('canvas'); b.width = 512; b.height = 512
            const btx = b.getContext('2d')!; btx.fillStyle = '#444'; btx.fillRect(0, 0, 512, 512)
            const map = new THREE.CanvasTexture(c); const bump = new THREE.CanvasTexture(b)
            map.wrapS = map.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping
            return { map, bump }
        }

        function makeTrimTex() {
            const c = document.createElement('canvas'); c.width = 256; c.height = 64
            const ctx = c.getContext('2d')!
            const g = ctx.createLinearGradient(0, 0, 0, 64)
            g.addColorStop(0, '#1e1208'); g.addColorStop(0.5, '#2e1c0e'); g.addColorStop(1, '#120c04')
            ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 64)
            for (let x = 0; x < 256; x += 2) {
                ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.09})`
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 64); ctx.stroke()
            }
            const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
        }

        function makeDoorTex(hue: string) {
            const texW = 512 * perf.textureScale
            const texH = 1024 * perf.textureScale
            const c = document.createElement('canvas'); c.width = texW; c.height = texH
            const ctx = c.getContext('2d')!
            const g = ctx.createLinearGradient(0, 0, 512, 0)
            g.addColorStop(0, '#09060301'); g.addColorStop(0.45, hue); g.addColorStop(1, '#09060301')
            ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 1024)
            for (let y = 0; y < 1024; y += 6) {
                ctx.strokeStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.06})`; ctx.lineWidth = 1
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y + (Math.random() - 0.5) * 12); ctx.stroke()
            }
            // Two raised panels
            const panels = [[38, 38, 436, 424], [38, 496, 436, 464]]
            panels.forEach(([px, py, pw, ph]) => {
                ctx.strokeStyle = 'rgba(0,0,0,0.72)'; ctx.lineWidth = 10; ctx.strokeRect(px, py, pw, ph)
                ctx.strokeStyle = 'rgba(255,255,255,0.055)'; ctx.lineWidth = 3; ctx.strokeRect(px + 5, py + 5, pw - 10, ph - 10)
                const ig = ctx.createLinearGradient(px, py, px, py + ph)
                ig.addColorStop(0, 'rgba(255,255,255,0.04)'); ig.addColorStop(1, 'rgba(0,0,0,0.12)')
                ctx.fillStyle = ig; ctx.fillRect(px + 5, py + 5, pw - 10, ph - 10)
            })
            // Door knob
            ctx.beginPath(); ctx.arc(430, 512, 20, 0, Math.PI * 2)
            const kg = ctx.createRadialGradient(425, 507, 2, 430, 512, 20)
            kg.addColorStop(0, '#d4a840'); kg.addColorStop(1, '#7a5010')
            ctx.fillStyle = kg; ctx.fill()
            ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2; ctx.stroke()
            for (let i = 0; i < 8; i++) {
                ctx.strokeStyle = `rgba(0,0,0,${0.2 + Math.random() * 0.2})`; ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(Math.random() * 512, Math.random() * 1024)
                ctx.lineTo(Math.random() * 512, Math.random() * 1024); ctx.stroke()
            }
            return new THREE.CanvasTexture(c)
        }

        function makeStepTex() {
            const c = document.createElement('canvas'); c.width = 512; c.height = 128
            const ctx = c.getContext('2d')!
            ctx.fillStyle = '#0c0602'; ctx.fillRect(0, 0, 512, 128)
            for (let x = 0; x < 512; x += 4) {
                ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.07})`; ctx.lineWidth = 1
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 128); ctx.stroke()
            }
            ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.fillRect(0, 104, 512, 24)
            return new THREE.CanvasTexture(c)
        }

        function makeShelfTex() {
            const c = document.createElement('canvas'); c.width = 512; c.height = 64
            const ctx = c.getContext('2d')!
            const g = ctx.createLinearGradient(0, 0, 0, 64)
            g.addColorStop(0, '#201205'); g.addColorStop(1, '#0c0802')
            ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 64); return new THREE.CanvasTexture(c)
        }

        function makePortraitFallback() {
            const c = document.createElement('canvas'); c.width = 512; c.height = 640
            const ctx = c.getContext('2d')!
            ctx.fillStyle = '#0a0706'; ctx.fillRect(0, 0, 512, 640)
            const vig = ctx.createRadialGradient(256, 280, 40, 256, 280, 300)
            vig.addColorStop(0, 'rgba(40,25,15,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.98)')
            ctx.fillStyle = vig; ctx.fillRect(0, 0, 512, 640)
            ctx.fillStyle = '#1a1006'
            ctx.beginPath(); ctx.ellipse(256, 155, 68, 82, 0, 0, Math.PI * 2); ctx.fill()
            ctx.fillRect(228, 222, 56, 44)
            return new THREE.CanvasTexture(c)
        }

        // Sign texture ABOVE door — large, clearly visible, facing into room
        function makeDoorSignTex(label: string, color: string) {
            const c = document.createElement('canvas'); c.width = 1024; c.height = 320
            const ctx = c.getContext('2d')!
            // Board background
            const g = ctx.createLinearGradient(0, 0, 0, 320)
            g.addColorStop(0, '#0e0608'); g.addColorStop(1, '#060305')
            ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 320)
            // Wood grain
            for (let x = 0; x < 1024; x += 3) {
                ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.07})`; ctx.lineWidth = 1
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (Math.random() - 0.5) * 8, 320); ctx.stroke()
            }
            // Outer border with glow
            ctx.strokeStyle = color; ctx.lineWidth = 5
            ctx.shadowColor = color; ctx.shadowBlur = 30
            ctx.strokeRect(6, 6, 1012, 308)
            // Inner border
            ctx.strokeStyle = color + '44'; ctx.lineWidth = 2; ctx.shadowBlur = 0
            ctx.strokeRect(16, 16, 992, 288)
            // Main text
            ctx.font = 'bold 140px Georgia, serif'
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.fillStyle = color
            ctx.shadowColor = color; ctx.shadowBlur = 50
            ctx.fillText(label, 512, 155)
            ctx.shadowBlur = 0
            // Corner dots
            for (const [cx2, cy2] of [[28, 28], [996, 28], [28, 292], [996, 292]] as [number, number][]) {
                ctx.fillStyle = color + 'cc'
                ctx.save(); ctx.translate(cx2, cy2); ctx.rotate(Math.PI / 4)
                ctx.fillRect(-6, -6, 12, 12); ctx.restore()
            }
            return new THREE.CanvasTexture(c)
        }

        function makeHangingSignTex() {
            const c = document.createElement('canvas'); c.width = 1024; c.height = 320
            const ctx = c.getContext('2d')!
            const g = ctx.createLinearGradient(0, 0, 0, 320)
            g.addColorStop(0, '#140508'); g.addColorStop(1, '#080203')
            ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 320)
            for (let x = 0; x < 1024; x += 3) {
                ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.07})`; ctx.lineWidth = 1
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 320); ctx.stroke()
            }
            ctx.strokeStyle = 'rgba(200,40,40,0.9)'; ctx.lineWidth = 5
            ctx.shadowColor = '#ff1100'; ctx.shadowBlur = 30; ctx.strokeRect(6, 6, 1012, 308)
            ctx.shadowBlur = 0
            ctx.strokeStyle = 'rgba(180,30,30,0.4)'; ctx.lineWidth = 2
            ctx.strokeRect(16, 16, 992, 288)
            ctx.font = 'bold 140px Georgia, serif'
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.fillStyle = '#cc2222'
            ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 45
            ctx.fillText('WORKS', 512, 135)
            ctx.shadowBlur = 0
            ctx.font = '32px monospace'
            ctx.fillStyle = 'rgba(180,80,80,0.6)'
            ctx.fillText('— double-click to enter —', 512, 245)
            return new THREE.CanvasTexture(c)
        }

        // ── MATERIALS ────────────────────────────────────────────────────────────
        const wallT = makeWallTex()
        wallT.map.repeat.set(3, 2); wallT.bump.repeat.set(3, 2)
        const wallMat = new THREE.MeshStandardMaterial({ map: wallT.map, bumpMap: wallT.bump, bumpScale: 0.12, roughness: 0.95, color: 0x998899 })

        const floorT = makeFloorTex()
        floorT.map.repeat.set(2.5, 7); floorT.bump.repeat.set(2.5, 7)
        const floorMat = new THREE.MeshStandardMaterial({ map: floorT.map, bumpMap: floorT.bump, bumpScale: 0.3, roughness: 0.9, metalness: 0.03 })

        const ceilMat = new THREE.MeshStandardMaterial({ color: 0x030108, roughness: 0.99 })
        const trimTex = makeTrimTex(); trimTex.repeat.set(10, 1)
        const trimMat = new THREE.MeshStandardMaterial({ map: trimTex, roughness: 0.78, color: 0x6a4020 })
        const stepMat = new THREE.MeshStandardMaterial({ map: makeStepTex(), roughness: 0.92, color: 0x704828 })
        const railMat = new THREE.MeshStandardMaterial({ color: 0x1a0e04, roughness: 0.75 })
        const shelfMat = new THREE.MeshStandardMaterial({ map: makeShelfTex(), roughness: 0.85, color: 0x6a4018 })
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x0c0c18, metalness: 0.9, roughness: 0.3 })
        const portraitMat = new THREE.MeshStandardMaterial({ roughness: 0.65, color: 0xffffff })
        portraitMat.map = makePortraitFallback()
        const texLoader = new THREE.TextureLoader()
        texLoader.load('/alen.jpg', tex => { tex.colorSpace = THREE.SRGBColorSpace; portraitMat.map = tex; portraitMat.needsUpdate = true })

        // ── ROOM ─────────────────────────────────────────────────────────────────
        const mkBox = (w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material, ry = 0) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
            m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m
        }

        const doorStates: DoorState[] = []
        const clickTargets: ClickTarget[] = []

        // Floor / Ceiling / Walls
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(RW, roomLen), floorMat)
        fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, floorMid); fl.receiveShadow = true; scene.add(fl)
        clickTargets.push({ mesh: fl, action: 'floor' })
        const ce = new THREE.Mesh(new THREE.PlaneGeometry(RW, roomLen), ceilMat)
        ce.rotation.x = Math.PI / 2; ce.position.set(0, RH, floorMid); scene.add(ce)
        const bw = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), wallMat)
        bw.position.set(0, RH / 2, ZFAR); bw.receiveShadow = true; scene.add(bw)
        const lw = new THREE.Mesh(new THREE.PlaneGeometry(roomLen, RH), wallMat)
        lw.rotation.y = Math.PI / 2; lw.position.set(LX, RH / 2, floorMid); lw.receiveShadow = true; scene.add(lw)
        const rw2 = new THREE.Mesh(new THREE.PlaneGeometry(roomLen, RH), wallMat)
        rw2.rotation.y = -Math.PI / 2; rw2.position.set(RX, RH / 2, floorMid); rw2.receiveShadow = true; scene.add(rw2)

        // Trim
        mkBox(roomLen, 0.22, 0.12, LX + 0.06, 0.11, floorMid, trimMat, Math.PI / 2)
        mkBox(roomLen, 0.22, 0.12, RX - 0.06, 0.11, floorMid, trimMat, -Math.PI / 2)
        mkBox(RW, 0.22, 0.12, 0, 0.11, ZFAR + 0.06, trimMat)
        mkBox(roomLen, 0.2, 0.14, LX + 0.07, RH - 0.1, floorMid, trimMat, Math.PI / 2)
        mkBox(roomLen, 0.2, 0.14, RX - 0.07, RH - 0.1, floorMid, trimMat, -Math.PI / 2)
        mkBox(RW, 0.2, 0.14, 0, RH - 0.1, ZFAR + 0.07, trimMat)
        mkBox(roomLen, 0.1, 0.09, LX + 0.045, 1.1, floorMid, trimMat, Math.PI / 2)
        mkBox(roomLen, 0.1, 0.09, RX - 0.045, 1.1, floorMid, trimMat, -Math.PI / 2)

        // ── DOOR SYSTEM ───────────────────────────────────────────────────────────
        // Door width / height
        const DW = 2.0, DH = 3.5
        const FT = 0.2   // frame thickness (depth into room)
        const FW = 0.25  // frame piece width
        const VD = 0.5   // void depth behind wall

        // (moved up)

        /**
         * Build a door in a wall.
         * @param wall 'left' | 'right' | 'back'
         * @param doorCx  center X of door opening (for left/right walls = wall X, for back = actual X)
         * @param doorCz  center Z of door opening
         * @param label   sign text above door
         * @param color   hex color for sign
         * @param panelType  panel to open on double click
         * @param doorHue  css color for door wood tint
         * @param tpKey  teleport key
         */
        function buildDoor(
            wall: 'left' | 'right' | 'back',
            doorCz: number,
            label: string, color: string,
            panelType: PanelType, doorHue: string, tpKey: string
        ) {
            const voidMat = new THREE.MeshBasicMaterial({ color: 0x000000 })

            // We build the door based on which wall
            if (wall === 'left') {
                const wx = LX  // wall face X position

                // Fill void (cut-out appearance) — box behind wall face
                const v = new THREE.Mesh(new THREE.BoxGeometry(VD, DH, DW), voidMat)
                v.position.set(wx - VD / 2 + 0.02, DH / 2, doorCz); scene.add(v)

                // Frame — jambs along Z, header along Z
                const fMat = trimMat
                // Left jamb (smaller Z side)
                mkBox(FT, DH + FW * 2, FW, wx + FT / 2, DH / 2, doorCz - DW / 2 - FW / 2, fMat)
                // Right jamb
                mkBox(FT, DH + FW * 2, FW, wx + FT / 2, DH / 2, doorCz + DW / 2 + FW / 2, fMat)
                // Header (top)
                mkBox(FT, FW, DW + FW * 2, wx + FT / 2, DH + FW / 2, doorCz, fMat)
                // Threshold
                mkBox(FT, 0.07, DW, wx + FT / 2, 0.035, doorCz, fMat)

                // Pivot group — pivot at hinge side (smaller-Z edge of door)
                const pivotG = new THREE.Group()
                pivotG.position.set(wx + 0.04, DH / 2, doorCz - DW / 2)
                scene.add(pivotG)

                // Door panel: BoxGeometry(thickness, height, width)
                // Panel center in group space: z = +DW/2 (extends toward larger Z)
                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.07, DH - 0.06, DW - 0.08),
                    new THREE.MeshStandardMaterial({ map: makeDoorTex(doorHue), roughness: 0.82, side: THREE.DoubleSide })
                )
                panel.position.set(0, 0, DW / 2); panel.castShadow = true; pivotG.add(panel)

                // Click target on door (plane facing +X = into room)
                const ct = new THREE.Mesh(
                    new THREE.PlaneGeometry(DW, DH),
                    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
                )
                ct.position.set(0.08, 0, DW / 2); ct.rotation.y = Math.PI / 2; pivotG.add(ct)

                const ds: DoorState = {
                    pivot: pivotG,
                    isOpen: false,
                    targetAngle: 0,
                    currentAngle: 0,
                    openAngle: -Math.PI * 0.52,
                    closeAngle: 0,
                    centerX: wx,
                    centerZ: doorCz
                }
                const idx = doorStates.push(ds) - 1
                clickTargets.push({ mesh: ct, action: 'door', doorIndex: idx, panel: panelType, teleportKey: tpKey })

                // ── SIGN above door ──
                // Sign faces +X (into room), positioned above door opening
                const signH = DH * 0.28
                const signW = DW + FW * 1.5
                const signTex = makeDoorSignTex(label, color)
                const sign = new THREE.Mesh(
                    new THREE.PlaneGeometry(signW, signH),
                    new THREE.MeshBasicMaterial({ map: signTex, transparent: true, depthWrite: false })
                )
                sign.rotation.y = Math.PI / 2  // face into room (+X)
                sign.position.set(wx + 0.12, DH + signH / 2 + 0.08, doorCz)
                scene.add(sign)
                // Also make the sign a click target
                clickTargets.push({ mesh: sign, action: 'door', doorIndex: idx, panel: panelType, teleportKey: tpKey })

                // Glow light at door
                const gl = new THREE.PointLight(new THREE.Color(color), 20, 7, 2)
                gl.position.set(wx + 1.2, DH / 2, doorCz)
                gl.castShadow = perf.tier === 'high' // Only expensive lights on high tier
                scene.add(gl)

            } else if (wall === 'right') {
                const wx = RX

                const v = new THREE.Mesh(new THREE.BoxGeometry(VD, DH, DW), voidMat)
                v.position.set(wx + VD / 2 - 0.02, DH / 2, doorCz); scene.add(v)

                mkBox(FT, DH + FW * 2, FW, wx - FT / 2, DH / 2, doorCz - DW / 2 - FW / 2, trimMat)
                mkBox(FT, DH + FW * 2, FW, wx - FT / 2, DH / 2, doorCz + DW / 2 + FW / 2, trimMat)
                mkBox(FT, FW, DW + FW * 2, wx - FT / 2, DH + FW / 2, doorCz, trimMat)
                mkBox(FT, 0.07, DW, wx - FT / 2, 0.035, doorCz, trimMat)

                const pivotG = new THREE.Group()
                pivotG.position.set(wx - 0.04, DH / 2, doorCz - DW / 2)
                scene.add(pivotG)

                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.07, DH - 0.06, DW - 0.08),
                    new THREE.MeshStandardMaterial({ map: makeDoorTex(doorHue), roughness: 0.82, side: THREE.DoubleSide })
                )
                panel.position.set(0, 0, DW / 2); panel.castShadow = true; pivotG.add(panel)

                const ct = new THREE.Mesh(
                    new THREE.PlaneGeometry(DW, DH),
                    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
                )
                ct.position.set(-0.08, 0, DW / 2); ct.rotation.y = -Math.PI / 2; pivotG.add(ct)

                const ds: DoorState = {
                    pivot: pivotG,
                    isOpen: false,
                    targetAngle: 0,
                    currentAngle: 0,
                    openAngle: Math.PI * 0.52,
                    closeAngle: 0,
                    centerX: wx,
                    centerZ: doorCz
                }
                const idx = doorStates.push(ds) - 1
                clickTargets.push({ mesh: ct, action: 'door', doorIndex: idx, panel: panelType, teleportKey: tpKey })

                const signH = DH * 0.28
                const signW = DW + FW * 1.5
                const signTex = makeDoorSignTex(label, color)
                const sign = new THREE.Mesh(
                    new THREE.PlaneGeometry(signW, signH),
                    new THREE.MeshBasicMaterial({ map: signTex, transparent: true, depthWrite: false })
                )
                sign.rotation.y = -Math.PI / 2
                sign.position.set(wx - 0.12, DH + signH / 2 + 0.08, doorCz)
                scene.add(sign)
                // Also make the sign a click target
                clickTargets.push({ mesh: sign, action: 'door', doorIndex: idx, panel: panelType, teleportKey: tpKey })

                const gl = new THREE.PointLight(new THREE.Color(color), 20, 7, 2)
                gl.position.set(wx - 1.2, DH / 2, doorCz); scene.add(gl)

            } else {
                // back wall at ZFAR, normal +Z
                const wz = ZFAR
                const cx = 0  // door centered on X

                const v = new THREE.Mesh(new THREE.BoxGeometry(DW, DH, VD), voidMat)
                v.position.set(cx, DH / 2, wz - VD / 2 + 0.02); scene.add(v)

                mkBox(FW, DH + FW * 2, FT, cx - DW / 2 - FW / 2, DH / 2, wz + FT / 2, trimMat)
                mkBox(FW, DH + FW * 2, FT, cx + DW / 2 + FW / 2, DH / 2, wz + FT / 2, trimMat)
                mkBox(DW + FW * 2, FW, FT, cx, DH + FW / 2, wz + FT / 2, trimMat)
                mkBox(DW, 0.07, FT, cx, 0.035, wz + FT / 2, trimMat)

                // Pivot at -X edge
                const pivotG = new THREE.Group()
                pivotG.position.set(cx - DW / 2, DH / 2, wz + 0.04)
                scene.add(pivotG)

                const panel = new THREE.Mesh(
                    new THREE.BoxGeometry(DW - 0.08, DH - 0.06, 0.07),
                    new THREE.MeshStandardMaterial({ map: makeDoorTex(doorHue), roughness: 0.82, side: THREE.DoubleSide })
                )
                panel.position.set(DW / 2, 0, 0); panel.castShadow = true; pivotG.add(panel)

                const ct = new THREE.Mesh(
                    new THREE.PlaneGeometry(DW, DH),
                    new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
                )
                ct.position.set(DW / 2, 0, 0.1); pivotG.add(ct)

                const ds: DoorState = {
                    pivot: pivotG,
                    isOpen: false,
                    targetAngle: 0,
                    currentAngle: 0,
                    openAngle: -Math.PI * 0.5,
                    closeAngle: 0,
                    centerX: cx,
                    centerZ: wz
                }
                const idx = doorStates.push(ds) - 1
                clickTargets.push({ mesh: ct, action: 'door', doorIndex: idx, panel: panelType, teleportKey: tpKey })

                const signH = DH * 0.28
                const signW = DW + FW * 1.5
                const signTex = makeDoorSignTex(label, color)
                const sign = new THREE.Mesh(
                    new THREE.PlaneGeometry(signW, signH),
                    new THREE.MeshBasicMaterial({ map: signTex, transparent: true, depthWrite: false })
                )
                sign.position.set(cx, DH + signH / 2 + 0.08, wz + 0.14)
                scene.add(sign)
                // Also make the sign a click target
                clickTargets.push({ mesh: sign, action: 'door', doorIndex: idx, panel: panelType, teleportKey: tpKey })

                const gl = new THREE.PointLight(new THREE.Color(color), 20, 7, 2)
                gl.position.set(cx, DH / 2, wz + 1.8); scene.add(gl)
            }
        }

        // ── BUILD THE THREE DOORS ─────────────────────────────────────────────────
        buildDoor('left', -2.5, 'EDUCATION', '#44aaee', 'education', '#0d1928', 'education')
        buildDoor('right', 3.5, 'EXPERIENCE', '#ee9944', 'experience', '#221508', 'experience')
        buildDoor('back', ZFAR, 'SKILLS', '#88ee44', 'skills', '#101d08', 'skills')

        // ── SHELF ─────────────────────────────────────────────────────────────────
        const SZ = 3.5, SY = 1.85, SD = 0.48, SW = 2.4, ST = 0.1
        const SMX = LX + SD / 2, STOPY = SY + ST / 2

        mkBox(SD, ST, SW, SMX, SY, SZ, shelfMat)
        mkBox(0.05, SY, SW + 0.12, LX + 0.025, SY / 2, SZ,
            new THREE.MeshStandardMaterial({ color: 0x080614, roughness: 0.92 }))
        mkBox(SD - 0.05, 0.28, 0.07, SMX, SY - 0.17, SZ - SW / 2 + 0.2, shelfMat)
        mkBox(SD - 0.05, 0.28, 0.07, SMX, SY - 0.17, SZ + SW / 2 - 0.2, shelfMat)

        // ── PORTRAIT ──────────────────────────────────────────────────────────────
        const PW = 0.82, PH = 1.02, PFD = 0.08
        const portGroup = new THREE.Group()
        portGroup.rotation.y = Math.PI / 2
        portGroup.position.set(LX + PFD / 2 + 0.025, STOPY + PH / 2 + 0.02, SZ)
        portGroup.add(
            Object.assign(new THREE.Mesh(new THREE.BoxGeometry(PW + 0.16, PH + 0.16, PFD),
                new THREE.MeshStandardMaterial({ color: 0x3a2200, roughness: 0.5, metalness: 0.55 })))
        )
        const innerFrame = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.04, PH + 0.04, PFD + 0.01),
            new THREE.MeshStandardMaterial({ color: 0x100c00, roughness: 0.9 }))
        innerFrame.position.z = -0.006; portGroup.add(innerFrame)
        const portCanvas = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), portraitMat)
        portCanvas.position.z = PFD / 2 + 0.003; portGroup.add(portCanvas)
            ;[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([ox, oy]) => {
                const co = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, PFD + 0.025),
                    new THREE.MeshStandardMaterial({ color: 0x5a3a00, metalness: 0.78, roughness: 0.22 }))
                co.position.set(ox * (PW / 2 + 0.05), oy * (PH / 2 + 0.05), 0)
                portGroup.add(co)
            })
        scene.add(portGroup)
        clickTargets.push({ mesh: portCanvas, action: 'panel', panel: 'profile', teleportKey: 'portrait' })

        // ── SHELF DECOR ───────────────────────────────────────────────────────────
        const candleBodyMat = new THREE.MeshStandardMaterial({ color: 0xc8b080, roughness: 0.92 })
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xff8800 })
        const CANDLE_Z = SZ + SW / 2 - 0.3
        const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.03, 0.38, 8), candleBodyMat)
        candle.position.set(SMX, STOPY + 0.19, CANDLE_Z); candle.castShadow = true; scene.add(candle)
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), flameMat)
        flame.position.set(SMX, STOPY + 0.4, CANDLE_Z); scene.add(flame)
        const VASE_Z = SZ - SW / 2 + 0.32
        const vaseMat = new THREE.MeshStandardMaterial({ color: 0x0e0a08, roughness: 0.88, metalness: 0.1 })
        const vB = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.24, 9), vaseMat)
        vB.position.set(SMX, STOPY + 0.12, VASE_Z); vB.castShadow = true; scene.add(vB)
        const vN = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.07, 0.18, 9), vaseMat)
        vN.position.set(SMX, STOPY + 0.35, VASE_Z); vN.castShadow = true; scene.add(vN)

        // ── HANGING WORKS SIGN ────────────────────────────────────────────────────
        // Move Hanging sign above the staircase
        const HX = 3.5, HZ = 1.4
        const HY = RH - 1.5
        const HW = 1.9, HH = 0.75

        // Ceiling rod
        mkBox(0.025, 1.05, 0.025, HX, RH - 0.52, HZ, ironMat)
        // Chains on sides
        const chainMat = new THREE.MeshStandardMaterial({ color: 0x1a1a28, metalness: 0.9, roughness: 0.32 })
        for (const sx of [-1, 1] as const) {
            const chx = HX + sx * HW * 0.44
            for (let i = 0; i < 6; i++) {
                const cl = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.012, 6, 10), chainMat)
                cl.position.set(chx, RH - 0.1 - i * 0.14, HZ)
                cl.rotation.x = (i % 2) * Math.PI / 2; cl.castShadow = true; scene.add(cl)
            }
        }
        const hangTex = makeHangingSignTex()
        const hangGroup = new THREE.Group()
        hangGroup.position.set(HX, HY, HZ)
        scene.add(hangGroup)

        const hangSign = new THREE.Mesh(new THREE.BoxGeometry(HW, HH, 0.06),
            new THREE.MeshBasicMaterial({ map: hangTex }))
        hangSign.castShadow = true;
        hangGroup.add(hangSign)

        // Wood backing on the back side (-Z)
        const hangBacking = new THREE.Mesh(new THREE.BoxGeometry(HW, HH, 0.055), shelfMat)
        hangBacking.position.z = -0.032; hangBacking.castShadow = true;
        hangGroup.add(hangBacking)

        const hangClick = new THREE.Mesh(new THREE.PlaneGeometry(HW, HH),
            new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }))
        // Click surface in front (+Z)
        hangClick.position.z = 0.04;
        hangGroup.add(hangClick)
        clickTargets.push({ mesh: hangClick, action: 'panel', panel: 'works', teleportKey: 'works' })

        // ── STAIRCASE ────────────────────────────────────────────────────────────
        const NS = 11, SR = 0.3, SRN = 0.66, StW = 3.0, StSZ = 1.8
        for (let i = 0; i < NS; i++) {
            const sz = StSZ - i * SRN, sy = i * SR
            const tread = new THREE.Mesh(new THREE.BoxGeometry(StW, 0.09, SRN + 0.04), stepMat)
            tread.position.set(RX - StW / 2, sy + 0.045, sz - SRN / 2); tread.castShadow = true; tread.receiveShadow = true; scene.add(tread)
            clickTargets.push({ mesh: tread, action: 'floor' })
            const riser = new THREE.Mesh(new THREE.BoxGeometry(StW, SR, 0.055),
                new THREE.MeshStandardMaterial({ color: 0x0e0802, roughness: 0.95 }))
            riser.position.set(RX - StW / 2, sy + SR / 2, sz - SRN + 0.028); scene.add(riser)
            const balX = RX - StW + 0.2
            for (let b = 0; b < 2; b++) {
                const bH = 0.92
                const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, bH, 7), railMat)
                bal.position.set(balX, sy + bH / 2, sz - SRN / 2 - b * 0.3); bal.castShadow = true; scene.add(bal)
            }
        }
        const nwx = RX - StW + 0.2
        mkBox(0.17, 1.0, 0.17, nwx, 0.5, StSZ + 0.1, railMat)
        const nc = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), railMat)
        nc.position.set(nwx, 1.06, StSZ + 0.1); scene.add(nc)
        const rl = NS * SRN + 0.65
        const ra = Math.atan2(NS * SR, rl)
        const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, rl), railMat)
        handrail.position.set(nwx, NS * SR / 2 + 0.96, StSZ - NS * SRN / 2)
        handrail.rotation.x = ra; handrail.castShadow = true; scene.add(handrail)

        // ── CHANDELIER ────────────────────────────────────────────────────────────
        const chanMat = new THREE.MeshStandardMaterial({ color: 0x090912, metalness: 0.88, roughness: 0.38 })
        const CX = 0, CZC = 2.8
        mkBox(0.03, 1.1, 0.03, CX, RH - 0.55, CZC, chanMat)
        const chanBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.16, 0.26, 12), chanMat)
        chanBase.position.set(CX, RH - 1.3, CZC); chanBase.castShadow = true; scene.add(chanBase)
        for (let i = 0; i < 5; i++) {
            const ang = (i / 5) * Math.PI * 2
            const ax = CX + Math.cos(ang) * 0.62, az = CZC + Math.sin(ang) * 0.62
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.62, 6), chanMat)
            arm.position.set(CX + Math.cos(ang) * 0.31, RH - 1.42, CZC + Math.sin(ang) * 0.31)
            arm.rotation.z = Math.PI / 2; arm.rotation.y = ang; scene.add(arm)
            const cs = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.2, 7), candleBodyMat)
            cs.position.set(ax, RH - 1.34, az); scene.add(cs)
            const cf = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), flameMat)
            cf.position.set(ax, RH - 1.12, az); scene.add(cf)
        }

        // ── COBWEBS ───────────────────────────────────────────────────────────────
        const webMat = new THREE.LineBasicMaterial({ color: 0x2a182a, transparent: true, opacity: 0.48 })
        const addWeb = (wx: number, wy: number, wz: number) => {
            const pts: THREE.Vector3[] = []
            for (let i = 0; i < 12; i++) {
                pts.push(new THREE.Vector3(wx, wy, wz))
                const a = (i / 12) * Math.PI * 2
                pts.push(new THREE.Vector3(wx + Math.cos(a) * 0.55 + (Math.random() - 0.5) * 0.2, wy - 0.4 - Math.random() * 0.25, wz + Math.sin(a) * 0.55))
            }
            scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), webMat))
        }
        addWeb(LX + 0.55, RH - 0.28, ZFAR + 0.55)
        addWeb(RX - 0.55, RH - 0.28, ZFAR + 0.55)
        addWeb(LX + 0.5, RH - 0.28, ZNEAR - 1.2)
        addWeb(0, RH - 0.28, ZFAR + 1.8)

        // ── LIGHTING ─────────────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0x08041a, 22))

        const chanLight = new THREE.PointLight(0xffaa44, 78, 34, 1.7)
        chanLight.position.set(CX, RH - 1.28, CZC)
        chanLight.castShadow = perf.shadows;
        chanLight.shadow.mapSize.set(perf.shadowMapSize, perf.shadowMapSize);
        chanLight.shadow.bias = -0.002
        scene.add(chanLight)

        const fillLight = new THREE.DirectionalLight(0x152298, 2.8)
        fillLight.position.set(2, RH, ZNEAR + 4); fillLight.target.position.set(0, RH / 2, 0)
        scene.add(fillLight); scene.add(fillLight.target)

        const shelfLight = new THREE.PointLight(0xffcc88, 32, 7, 1.5)
        shelfLight.position.set(LX + 2.5, SY + 1.6, SZ); scene.add(shelfLight)

        const pSpot = new THREE.SpotLight(0xffee99, 115, 10, Math.PI / 6, 0.4, 1.5)
        pSpot.position.set(LX + 2.2, STOPY + PH / 2 + 2.2, SZ + 0.9)
        pSpot.target.position.set(LX + 0.14, STOPY + PH / 2, SZ)
        pSpot.castShadow = perf.tier !== 'low';
        pSpot.shadow.mapSize.set(perf.shadowMapSize / 2, perf.shadowMapSize / 2)
        scene.add(pSpot); scene.add(pSpot.target)

        const candleLight = new THREE.PointLight(0xff6600, 26, 5, 1.9)
        candleLight.position.set(SMX + 0.3, STOPY + 0.5, CANDLE_Z); scene.add(candleLight)

        const signLight = new THREE.PointLight(0x660000, 24, 10, 1.7)
        signLight.position.set(HX, HY + 1.2, HZ); scene.add(signLight)

        const stairLight = new THREE.PointLight(0xff7733, 18, 12, 2)
        stairLight.position.set(RX - StW + 1.2, 2.6, -1.0); scene.add(stairLight)

        const deepRed = new THREE.PointLight(0x440004, 42, 22, 2)
        deepRed.position.set(0, 1.8, ZFAR + 5); scene.add(deepRed)

        const eerieGreen = new THREE.PointLight(0x003308, 22, 9, 2)
        eerieGreen.position.set(LX + 1.8, 2.0, -2.5); scene.add(eerieGreen)

        // ── PARTICLES ────────────────────────────────────────────────────────────
        const PC = Math.floor((isMobile ? 120 : 280) * perf.particlesScale)
        const pGeo = new THREE.BufferGeometry()
        const pArr = new Float32Array(PC * 3)
        for (let i = 0; i < PC; i++) {
            pArr[i * 3] = (Math.random() - 0.5) * RW * 0.9
            pArr[i * 3 + 1] = Math.random() * RH
            pArr[i * 3 + 2] = ZFAR + Math.random() * roomLen
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3))
        const pMat = new THREE.PointsMaterial({ color: 0x882222, size: 0.032, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false })
        scene.add(new THREE.Points(pGeo, pMat))

        // ── INPUT ────────────────────────────────────────────────────────────────
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2(-99, -99)
        let isDragging = false
        let dragSX = 0, dragSY = 0, dragSLX = 0, dragSLY = 0
        let lastDragTime = 0
        let lastTapTime = 0
        let lastTapTarget: ClickTarget | null = null

        const getNDC = (clientX: number, clientY: number) => {
            const r = mount.getBoundingClientRect()
            return new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
        }

        const getTarget = (ndc: THREE.Vector2): ClickTarget | null => {
            raycaster.setFromCamera(ndc, camera)
            const hits = raycaster.intersectObjects(clickTargets.map(t => t.mesh), true)
            if (!hits.length) return null
            return clickTargets.find(t => t.mesh === hits[0].object) ?? null
        }

        const handleTarget = (target: ClickTarget, isDouble: boolean, point?: THREE.Vector3) => {
            if (target.action === 'door') {
                const ds = doorStates[target.doorIndex!]
                // Double tap on mobile enters room immediately
                if (isDouble && isMobile && ds.isOpen) {
                    window.dispatchEvent(new CustomEvent('enter-room', { detail: { room: target.panel } }))
                } else {
                    ds.isOpen = !ds.isOpen
                    ds.targetAngle = ds.isOpen ? ds.openAngle : ds.closeAngle
                }
            } else if (target.action === 'floor') {
                if (isDouble && isMobile && point) {
                    // Teleport glide
                    camPos.x = Math.max(LX + 0.6, Math.min(RX - 0.6, point.x))
                    camPos.z = Math.max(ZFAR + 1.3, Math.min(ZNEAR - 0.5, point.z))
                }
            } else {
                // panel target (portrait, hanging sign)
                if (isDouble && target.panel) {
                    window.dispatchEvent(new CustomEvent('enter-room', { detail: { room: target.panel } }))
                } else if (target.panel) {
                    openPanel(target.panel)
                }
            }
        }

        const onPointerDown = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') {
                isDragging = true; dragSX = e.clientX; dragSY = e.clientY
                dragSLX = camLook.x; dragSLY = camLook.y
            }
        }
        const onPointerUp = () => { isDragging = false }

        const onPointerMove = (e: PointerEvent) => {
            mouse.copy(getNDC(e.clientX, e.clientY))
            if (e.pointerType === 'mouse') {
                camLook.x = mouse.x * -5.8
                camLook.y = mouse.y * -1.4
            } else if (isDragging) {
                const dx = e.clientX - dragSX, dy = e.clientY - dragSY
                if (Math.abs(dx) > 8 || Math.abs(dy) > 8) lastDragTime = Date.now()
                const r = mount.getBoundingClientRect()
                camLook.x = Math.max(-6.5, Math.min(6.5, dragSLX - (dx / r.width) * 12))
                camLook.y = Math.max(-2.5, Math.min(2.5, dragSLY + (dy / r.height) * 4.5))
            }
            const hov = getTarget(mouse)
            mount.style.cursor = hov ? 'pointer' : 'default'
        }

        const onClick = (e: MouseEvent) => {
            if (Date.now() - lastDragTime < 130) return
            const ndc = getNDC(e.clientX, e.clientY)
            raycaster.setFromCamera(ndc, camera)
            const hits = raycaster.intersectObjects(clickTargets.map(t => t.mesh), true)
            if (!hits.length) return

            const hit = hits[0]
            const target = clickTargets.find(t => t.mesh === hit.object)
            if (!target) return

            const now = Date.now()
            const isDouble = (now - lastTapTime < 380) && lastTapTarget === target
            lastTapTime = now; lastTapTarget = target
            handleTarget(target, isDouble, hit.point)
        }

        mount.style.touchAction = 'none'
        mount.addEventListener('pointerdown', onPointerDown)
        mount.addEventListener('pointermove', onPointerMove)
        mount.addEventListener('pointerup', onPointerUp)
        mount.addEventListener('pointercancel', onPointerUp)
        mount.addEventListener('click', onClick)

        const onResize = () => {
            W = mount.clientWidth || window.innerWidth; H = mount.clientHeight || window.innerHeight
            camera.aspect = W / H; camera.fov = W < 768 ? 75 : 65
            camera.updateProjectionMatrix(); renderer.setSize(W, H)
        }
        window.addEventListener('resize', onResize)

        // ── ANIMATE ──────────────────────────────────────────────────────────────
        const clock = new THREE.Clock()
        let raf: number

        const animate = () => {
            raf = requestAnimationFrame(animate)
            const t = clock.getElapsedTime()

            // WASD movement
            if (keys['KeyW'] || keys['ArrowUp']) {
                camPos.x -= Math.sin(camLook.x * 0.11) * SPEED
                camPos.z -= Math.cos(camLook.x * 0.11) * SPEED
            }
            if (keys['KeyS'] || keys['ArrowDown']) {
                camPos.x += Math.sin(camLook.x * 0.11) * SPEED
                camPos.z += Math.cos(camLook.x * 0.11) * SPEED
            }
            if (keys['KeyA'] || keys['ArrowLeft']) {
                camPos.x -= Math.cos(camLook.x * 0.11) * SPEED * 0.75
                camPos.z += Math.sin(camLook.x * 0.11) * SPEED * 0.75
            }
            if (keys['KeyD'] || keys['ArrowRight']) {
                camPos.x += Math.cos(camLook.x * 0.11) * SPEED * 0.75
                camPos.z -= Math.sin(camLook.x * 0.11) * SPEED * 0.75
            }
            if (Math.abs(scrollVel) > 0.001) {
                camPos.z -= scrollVel * 0.9; scrollVel *= 0.8
                if (Math.abs(scrollVel) < 0.001) scrollVel = 0
            }

            // Clamp inside room
            camPos.x = Math.max(LX + 0.6, Math.min(RX - 0.6, camPos.x))
            camPos.z = Math.max(ZFAR + 1.3, Math.min(ZNEAR - 0.5, camPos.z))

            // Smooth camera movement
            let climbOffset = 0;
            // Staircase "climbing" logic
            // If user is near the stairs (RX area) and moving forward/backward
            if (camPos.x > RX - 2.8 && camPos.z < 2.0 && camPos.z > -5.8) {
                // Map Z position to height on stairs
                const stairStart = 1.8;
                const stairEnd = -5.4;
                if (camPos.z < stairStart) {
                    const progress = Math.min(1, Math.max(0, (stairStart - camPos.z) / (stairStart - stairEnd)));
                    climbOffset = progress * 3.15; // Set target climb height

                    // If we reach the very top, auto-enter the Works gallery
                    if (progress > 0.96 && !activePanel) {
                        window.dispatchEvent(new CustomEvent('enter-room', { detail: { room: 'works' } }))
                    }
                }
            }

            camera.position.x += (camPos.x + camLook.x * 0.28 - camera.position.x) * 0.08
            camera.position.y += (1.75 + climbOffset + camLook.y * 0.14 - camera.position.y) * 0.08
            camera.position.z += (camPos.z - camera.position.z) * 0.08

            // Proximity Room Entry: If walking into an open door
            for (const ds of doorStates) {
                if (ds.isOpen) {
                    // Find corresponding target for panel type
                    const target = clickTargets.find(t => t.doorIndex !== undefined && doorStates[t.doorIndex] === ds);
                    if (target && target.panel) {
                        const dx = camPos.x - ds.centerX;
                        const dz = camPos.z - ds.centerZ;
                        const dist = Math.sqrt(dx * dx + dz * dz);
                        if (dist < 1.5 && !activePanel) {
                            window.dispatchEvent(new CustomEvent('enter-room', { detail: { room: target.panel } }))
                        }
                    }
                }
            }

            camera.lookAt(camera.position.x + camLook.x * -1.5, 1.65 + climbOffset * 0.8 + camLook.y * 0.26, camera.position.z - 6)

            // Animate door swings
            for (const ds of doorStates) {
                const diff = ds.targetAngle - ds.currentAngle
                if (Math.abs(diff) > 0.001) {
                    ds.currentAngle += diff * 0.1
                    ds.pivot.rotation.y = ds.currentAngle
                }
            }

            // Flickering lights
            chanLight.intensity = 72 + Math.sin(t * 14) * 10 * Math.random() + Math.sin(t * 3.9) * 14
            candleLight.intensity = 23 + Math.random() * 10 + Math.sin(t * 21) * 5
            flame.position.y = STOPY + 0.4 + Math.sin(t * 9.8) * 0.014
            pSpot.intensity = 103 + Math.sin(t * 0.88) * 13
            eerieGreen.intensity = 18 + Math.sin(t * 2.6) * 11
            signLight.intensity = 21 + Math.sin(t * 1.6) * 9

            // Hanging sign sway
            hangGroup.rotation.z = Math.sin(t * 0.68) * 0.055
            hangGroup.rotation.x = Math.sin(t * 0.47) * 0.027

            // Portrait sway
            portGroup.rotation.z = Math.sin(t * 0.5) * 0.01

            // Particles
            const pp = pGeo.attributes.position.array as Float32Array
            for (let i = 0; i < PC; i++) {
                pp[i * 3 + 1] -= 0.0022
                pp[i * 3] += Math.sin(t * 0.32 + i * 0.66) * 0.0018
                if (pp[i * 3 + 1] < 0) pp[i * 3 + 1] = RH
            }
            pGeo.attributes.position.needsUpdate = true
            if (isActiveRef.current) {
                renderer.render(scene, camera)
            }
        }
        animate()

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
            window.removeEventListener('resize', onResize)
            mount.removeEventListener('wheel', onWheel)
            mount.removeEventListener('pointerdown', onPointerDown)
            mount.removeEventListener('pointermove', onPointerMove)
            mount.removeEventListener('pointerup', onPointerUp)
            mount.removeEventListener('pointercancel', onPointerUp)
            mount.removeEventListener('click', onClick)
            renderer.dispose()
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
        }
    }, [openPanel])

    // ── PANEL DATA ───────────────────────────────────────────────────────────
    const PANELS = {
        profile: { title: 'Alen James', sub: 'Resident of the Manor', color: '#c49850', body: 'A software engineer possessed by the craft of immersive web experiences. Dwells at the intersection of 3D environments, creative code, and front-end witchcraft — building things that should not exist, yet somehow do.' },
        education: { title: 'Education', sub: 'The Archive', color: '#44aaee', body: 'Studied at the ancient halls of knowledge, mastering Computer Science and the dark arts of algorithms. Years spent deciphering scrolls of mathematics, engineering theory, and applied sorcery.' },
        skills: { title: 'Skills', sub: 'The Forge', color: '#88ee44', body: 'Three.js · WebGL · React · Next.js · TypeScript · Node.js · Python · Creative Coding · 3D Graphics · Shader Programming · GLSL · Blender · Animation Systems · TailwindCSS' },
        experience: { title: 'Experience', sub: 'The Vault', color: '#ee9944', body: 'Years haunting the industry — crafting immersive interfaces, leading frontend teams, and breathing life into products that push the boundary of what a browser can feel like.' },
        works: { title: 'Works', sub: 'The Gallery', color: '#cc3333', body: 'Immersive 3D web experiences · Interactive portfolios · Creative coding experiments · Real-time WebGL renderers · Procedural dark environments · Atmospheric UI systems · Browser games' },
    } as const

    const panel = activePanel ? PANELS[activePanel as keyof typeof PANELS] : null

    return (
        <div className="relative w-full h-full bg-black overflow-hidden select-none">
            <div ref={mountRef} className="absolute inset-0 w-full h-full" style={{ touchAction: 'none' }} />

            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0 z-10"
                style={{ background: 'radial-gradient(circle at 50% 48%, transparent 28%, rgba(0,0,0,0.97) 100%)' }} />
            <div className="pointer-events-none absolute inset-0 z-10"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, transparent 10%, transparent 83%, rgba(0,0,0,0.97) 100%)' }} />

            {/* Controls hint */}
            <div className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
                style={{ animation: 'fadeHint 9s ease-out 1.2s both' }}>
                <div className="text-center leading-relaxed"
                    style={{ fontSize: '0.6rem', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'monospace', color: 'rgba(180,60,60,0.38)' }}>
                    <span className="md:hidden">Drag to look · Scroll to walk<br /></span>
                    <span className="hidden md:block">WASD · Scroll to walk · Mouse to look<br /></span>
                    Click door = open/close · Double-click = enter
                </div>
                <div className="w-px h-6" style={{ background: 'linear-gradient(to bottom, rgba(200,50,50,0.22), transparent)' }} />
            </div>

            {/* Panel */}
            {activePanel && panel && (
                <div
                    className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(14px)', opacity: panelVisible ? 1 : 0, transition: 'opacity 0.45s ease' }}
                    onClick={closePanel}
                >
                    <div
                        className="relative max-w-2xl w-[92%] max-h-[88vh] overflow-y-auto"
                        style={{ transform: panelVisible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.94)', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative p-8 md:p-12" style={{
                            background: 'linear-gradient(150deg, #060409, #0e0808 50%, #050406)',
                            border: `1px solid ${panel.color}2a`,
                            boxShadow: `0 0 120px ${panel.color}10, 0 0 50px rgba(0,0,0,0.9), inset 0 0 80px rgba(0,0,0,0.65)`
                        }}>
                            {/* Ornament */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${panel.color}50)` }} />
                                <div className="flex gap-2 items-center">
                                    {[6, 9, 6].map((s, i) => (
                                        <div key={i} className="rotate-45" style={{ width: s, height: s, background: panel.color + (i === 1 ? 'cc' : '77') }} />
                                    ))}
                                </div>
                                <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${panel.color}50)` }} />
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {activePanel === 'profile' && (
                                    <div className="shrink-0 mx-auto md:mx-0 relative overflow-hidden"
                                        style={{ width: 132, height: 178, border: `3px solid #221500`, boxShadow: `0 0 50px ${panel.color}22, inset 0 0 40px rgba(0,0,0,0.9)` }}>
                                        <img src="/alen.jpg" alt="Alen James"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.9) contrast(0.85) brightness(0.7)' }}
                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 40% 60%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.82) 100%)' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 6px', background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)', fontSize: 8, letterSpacing: '0.22em', color: `${panel.color}aa`, fontFamily: 'monospace', textTransform: 'uppercase', textAlign: 'center' }}>
                                            Alen James
                                        </div>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] tracking-[0.7em] uppercase font-mono mb-2" style={{ color: `${panel.color}50` }}>{panel.sub}</p>
                                    <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight"
                                        style={{ fontFamily: '"Georgia","Times New Roman",serif', color: panel.color, textShadow: `0 0 60px ${panel.color}44` }}>
                                        {panel.title}
                                    </h2>
                                    <div className="mb-5 h-px w-12" style={{ background: `linear-gradient(to right, ${panel.color}88, transparent)` }} />
                                    <p className="text-sm md:text-base" style={{ color: 'rgba(205,182,148,0.82)', fontFamily: '"Georgia", serif', lineHeight: 2.05 }}>
                                        {panel.body}
                                    </p>
                                    <div className="flex flex-wrap gap-3 mt-8">
                                        {['View More', 'Contact'].map((lbl, i) => (
                                            <a key={lbl} href="#" onClick={e => e.preventDefault()}
                                                className="px-5 py-2 text-xs tracking-[0.3em] uppercase font-mono"
                                                style={{
                                                    border: i === 0 ? `1px solid ${panel.color}50` : '1px solid rgba(100,70,30,0.28)',
                                                    color: i === 0 ? `${panel.color}cc` : 'rgba(145,115,75,0.5)',
                                                    background: i === 0 ? `${panel.color}12` : 'transparent'
                                                }}>
                                                {lbl}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-9">
                                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${panel.color}28, transparent)` }} />
                            </div>

                            <button onClick={closePanel}
                                className="absolute top-4 right-5 text-xs tracking-widest font-mono"
                                style={{ color: 'rgba(130,80,40,0.4)' }}
                                onMouseEnter={e => { (e.currentTarget.style.color = `${panel.color}cc`) }}
                                onMouseLeave={e => { (e.currentTarget.style.color = 'rgba(130,80,40,0.4)') }}
                            >[ CLOSE ]</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeHint {
          0%   { opacity:0; transform:translate(-50%,10px); }
          12%  { opacity:1; transform:translate(-50%,0); }
          78%  { opacity:1; transform:translate(-50%,0); }
          100% { opacity:0; transform:translate(-50%,-5px); }
        }
      `}</style>
        </div>
    )
}
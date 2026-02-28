'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { usePerformance } from '@/lib/usePerformance'

interface Project {
    title: string
    subtitle: string
    tech: string
    year: string
    color: string
    accentColor: string
    description: string
    image?: string
    link?: string
}

const PROJECTS: Project[] = [
    {
        title: 'CID Moosa AI',
        subtitle: 'AI Detective Chat',
        tech: 'Next.js · FastAPI',
        year: '2024',
        color: '#1a1005',
        accentColor: '#e69900',
        description: 'An AI chat application that solves real-world cases using characters from the CID Moosa universe as detectives.',
        image: '/cidmoosa.png',
        link: 'https://cidmoosa.vercel.app'
    },
    {
        title: 'Kerala Win',
        subtitle: 'Lottery Result Parser',
        tech: 'Next.js · FastAPI',
        year: '2024',
        color: '#051a0f',
        accentColor: '#00cc66',
        description: 'Kerala lottery result application that parses official documents directly from the government result pages.',
        image: '/keralawin.png',
        link: 'https://kerala-win.vercel.app'
    },
    {
        title: 'Gadget Store',
        subtitle: 'E-commerce & Admin',
        tech: 'Next.js · FastAPI · PostgreSQL',
        year: '2024',
        color: '#0a0c1a',
        accentColor: '#3366cc',
        description: 'Complete e-commerce website featuring a dedicated admin panel for inventory and sales management.',
        image: '/gadgetstore.png',
        link: 'https://jav-mu.vercel.app/'
    },
    {
        title: 'Quizzer App',
        subtitle: 'Multiplayer Trivia',
        tech: 'Next.js · FastAPI · WebSockets',
        year: '2024',
        color: '#1a0515',
        accentColor: '#cc33aa',
        description: 'Real-time multiplayer quiz application supporting live competitive trivia sessions across devices.',
        image: '/quizer.png',
        link: 'https://quizzer-alpha-five.vercel.app/'
    },
    {
        title: 'Balance Checker',
        subtitle: 'Bank Statement Analysis',
        tech: 'Next.js · FastAPI',
        year: '2024',
        color: '#05101a',
        accentColor: '#3399cc',
        description: 'Financial analysis tool that processes bank statements to check and visualize your financial balance.',
        image: '/balancechecker.png',
        link: 'https://my-balance-five.vercel.app/'
    },
    {
        title: 'Haunted Manor',
        subtitle: 'Immersive 3D Portfolio',
        tech: 'Three.js · WebGL · Next.js',
        year: '2024',
        color: '#1a0808',
        accentColor: '#cc3333',
        description: 'This very website. A procedurally generated gothic mansion rendered entirely in the browser with real-time lighting and atmospheric effects.',
        image: '/api/placeholder/800/600',
        link: 'https://github.com/AlenJames/alenjames'
    }
]

// ── TEXTURE GENERATORS ───────────────────────────────────────────────────────

function makeWallTex(seed = 0, textureScale: number) {
    const texSize = 1024 * textureScale
    const c = document.createElement('canvas'); c.width = texSize; c.height = texSize
    const ctx = c.getContext('2d')!
    // Dark plaster base
    ctx.fillStyle = `hsl(${260 + seed * 20},10%,5%)`; ctx.fillRect(0, 0, 1024, 1024)
    // Subtle plaster noise
    for (let i = 0; i < 16000; i++) {
        const x = Math.random() * 1024, y = Math.random() * 1024
        ctx.fillStyle = `rgba(${20 + seed * 5},${15},${25},${Math.random() * 0.07})`
        ctx.fillRect(x, y, Math.random() * 3 + 1, Math.random() * 3 + 1)
    }
    // Panel groove lines vertical
    for (let x = 0; x < 1024; x += 80) {
        ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke()
        ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x + 2, 0); ctx.lineTo(x + 2, 1024); ctx.stroke()
    }
    // Panel groove lines horizontal
    for (let y = 0; y < 1024; y += 128) {
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke()
        ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(0, y + 2); ctx.lineTo(1024, y + 2); ctx.stroke()
    }
    // Subtle vignette in corners
    for (let i = 0; i < 4; i++) {
        const cx2 = (i % 2) * 1024, cy2 = Math.floor(i / 2) * 1024
        const gr = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 500)
        gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gr; ctx.fillRect(0, 0, 1024, 1024)
    }
    const bump = document.createElement('canvas'); bump.width = 512; bump.height = 512
    const btx = bump.getContext('2d')!
    btx.fillStyle = '#555'; btx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 6000; i++) { const v = Math.random() * 90; btx.fillStyle = `rgb(${v},${v},${v})`; btx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2) }
    const map = new THREE.CanvasTexture(c); const bumpTex = new THREE.CanvasTexture(bump)
    map.wrapS = map.wrapT = bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping
    return { map, bumpTex }
}

function makeFloorTex(textureScale: number) {
    const texSize = 1024 * textureScale
    const c = document.createElement('canvas'); c.width = texSize; c.height = texSize
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#050302'; ctx.fillRect(0, 0, 1024, 1024)
    // Parquet planks
    const pw = 100
    for (let x = 0; x < 1024; x += pw) {
        const v = 0.45 + Math.random() * 0.6
        ctx.fillStyle = `rgb(${~~(20 * v)},${~~(10 * v)},${~~(4 * v)})`
        ctx.fillRect(x + 2, 0, pw - 4, 1024)
        for (let y = 0; y < 1024; y += 5) {
            ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.07})`; ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + pw, y + (Math.random() - 0.5) * 6); ctx.stroke()
        }
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(x, 0, 3, 1024)
        ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(x + 3, 0, 1, 1024)
    }
    // Dark stains
    for (let i = 0; i < 7; i++) {
        const sx = Math.random() * 1024, sy = Math.random() * 1024
        const gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, 100 + Math.random() * 160)
        gr.addColorStop(0, 'rgba(0,0,0,0.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gr; ctx.fillRect(sx - 260, sy - 260, 520, 520)
    }
    // Subtle sheen
    const sg = ctx.createLinearGradient(0, 0, 1024, 1024)
    sg.addColorStop(0, 'rgba(255,220,160,0.04)'); sg.addColorStop(0.5, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(255,220,160,0.04)')
    ctx.fillStyle = sg; ctx.fillRect(0, 0, 1024, 1024)
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
}

function makeCeilingTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#020104'; ctx.fillRect(0, 0, 512, 512)
    // Coffered ceiling beams
    for (let x = 0; x < 512; x += 128) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(x, 0, 12, 512)
        ctx.fillStyle = 'rgba(40,20,10,0.3)'; ctx.fillRect(x + 12, 0, 4, 512)
    }
    for (let y = 0; y < 512; y += 128) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, y, 512, 12)
        ctx.fillStyle = 'rgba(40,20,10,0.3)'; ctx.fillRect(0, y + 12, 512, 4)
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
}

function makeTrimTex() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 64)
    g.addColorStop(0, '#221508'); g.addColorStop(0.3, '#3a2210'); g.addColorStop(0.7, '#2a1808'); g.addColorStop(1, '#160e04')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 64)
    for (let x = 0; x < 256; x += 2) {
        ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.1})`; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (Math.random() - 0.5) * 3, 64); ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(256, 8); ctx.stroke()
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 55); ctx.lineTo(256, 55); ctx.stroke()
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
}

function makeFrameTex(color: string) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 256, 256)
    g.addColorStop(0, color); g.addColorStop(0.4, shiftColor(color, 1.4)); g.addColorStop(1, shiftColor(color, 0.6))
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256)
    // Wood grain
    for (let i = 0; i < 80; i++) {
        ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.08})`; ctx.lineWidth = 1 + Math.random()
        ctx.beginPath(); ctx.moveTo(0, Math.random() * 256); ctx.lineTo(256, Math.random() * 256); ctx.stroke()
    }
    // Bevel highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3; ctx.strokeRect(4, 4, 248, 248)
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 3; ctx.strokeRect(12, 12, 232, 232)
    return new THREE.CanvasTexture(c)
}

function shiftColor(hex: string, factor: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g2 = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${Math.min(255, ~~(r * factor))},${Math.min(255, ~~(g2 * factor))},${Math.min(255, ~~(b * factor))})`
}

function makeProjectCanvas(proj: Project, textureScale: number, w = 1024, h = 768): THREE.CanvasTexture {
    const texW = w * textureScale
    const texH = h * textureScale
    const c = document.createElement('canvas'); c.width = texW; c.height = texH
    const ctx = c.getContext('2d')!
    const t = new THREE.CanvasTexture(c)
    t.minFilter = THREE.LinearFilter

    // Function to draw everything onto the canvas
    const draw = (img?: HTMLImageElement) => {
        ctx.clearRect(0, 0, texW, texH)

        // Rich dark background
        const bg = ctx.createLinearGradient(0, 0, texW, texH)
        bg.addColorStop(0, proj.color)
        bg.addColorStop(0.5, shiftColor(proj.color || '#0a0808', 1.6))
        bg.addColorStop(1, proj.color)
        ctx.fillStyle = bg; ctx.fillRect(0, 0, texW, texH)

        if (img) {
            ctx.globalAlpha = 0.6
            // Scale and center image to cover height while maintaining aspect ratio
            const scale = Math.max(texW / img.width, texH / img.height)
            const iw = img.width * scale, ih = img.height * scale
            // Draw centered
            ctx.drawImage(img, (texW - iw) / 2, (texH - ih) / 2, iw, ih)
            ctx.globalAlpha = 1.0
        }

        // Overlay Grid pattern
        ctx.strokeStyle = `${proj.accentColor}18`; ctx.lineWidth = 1 * textureScale
        for (let x = 0; x < texW; x += 48 * textureScale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, texH); ctx.stroke() }
        for (let y = 0; y < texH; y += 48 * textureScale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(texW, y); ctx.stroke() }

        // Central radial glow
        const rg = ctx.createRadialGradient(texW / 2, texH / 2, 0, texW / 2, texH / 2, texW * 0.65)
        rg.addColorStop(0, `${proj.accentColor}22`); rg.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = rg; ctx.fillRect(0, 0, texW, texH)

        // Vignette (behind text)
        const vig = ctx.createRadialGradient(texW / 2, texH / 2, texH * 0.2, texW / 2, texH / 2, texH * 0.9)
        vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.85)')
        ctx.fillStyle = vig; ctx.fillRect(0, 0, texW, texH)

        // Borders
        ctx.strokeStyle = `${proj.accentColor}88`; ctx.lineWidth = 3 * textureScale
        ctx.beginPath(); ctx.moveTo(80 * textureScale, 55 * textureScale); ctx.lineTo(texW - 80 * textureScale, 55 * textureScale); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(80 * textureScale, texH - 55 * textureScale); ctx.lineTo(texW - 80 * textureScale, texH - 55 * textureScale); ctx.stroke()

        // Year badge
        const ybW = 100 * textureScale, ybH = 28 * textureScale
        ctx.fillStyle = `${proj.accentColor}22`
        ctx.fillRect(texW / 2 - ybW / 2, 20 * textureScale, ybW, ybH)
        ctx.strokeStyle = `${proj.accentColor}55`; ctx.lineWidth = 1; ctx.strokeRect(texW / 2 - ybW / 2, 20 * textureScale, ybW, ybH)
        ctx.font = `500 ${18 * textureScale}px monospace`; ctx.fillStyle = `${proj.accentColor}cc`
        ctx.textAlign = 'center'; ctx.fillText(proj.year, texW / 2, 40 * textureScale)

        // Text Styles & Sizes
        const tsTitle = (w > 700 ? 88 * textureScale : 68 * textureScale)
        const tsSubtitle = 22 * textureScale
        const tsDesc = 18 * textureScale
        const tsTech = 16 * textureScale

        // Decorate Text Area
        ctx.fillStyle = 'rgba(0,0,0,0.65)'
        ctx.fillRect(0, texH / 2 - 100 * textureScale, texW, 180 * textureScale)

        // Subtitle
        ctx.font = `500 ${tsSubtitle}px monospace`; ctx.fillStyle = `${proj.accentColor}aa`
        ctx.fillText(proj.subtitle.toUpperCase(), texW / 2, 120 * textureScale)

        // Title
        ctx.font = `bold ${tsTitle}px Georgia, serif`
        ctx.fillStyle = '#ffffff'
        ctx.shadowColor = proj.accentColor; ctx.shadowBlur = 40 * textureScale
        ctx.fillText(proj.title, texW / 2, texH / 2 - 10 * textureScale)
        ctx.shadowBlur = 0

        // Divider
        ctx.strokeStyle = `${proj.accentColor}66`; ctx.lineWidth = 1 * textureScale
        ctx.beginPath(); ctx.moveTo(texW / 2 - 120 * textureScale, texH / 2 + 40 * textureScale); ctx.lineTo(texW / 2 + 120 * textureScale, texH / 2 + 40 * textureScale); ctx.stroke()

        // Description
        ctx.font = `${tsDesc}px Georgia, serif`; ctx.fillStyle = 'rgba(230,220,200,0.95)'
        const words = proj.description.split(' ')
        let line = '', lines: string[] = [], y2 = texH / 2 + 80 * textureScale
        words.forEach(word => {
            const test = line + word + ' '
            if (ctx.measureText(test).width > texW * 0.7 && line) { lines.push(line.trim()); line = word + ' ' }
            else line = test
        })
        if (line.trim()) lines.push(line.trim())
        lines.forEach((l, i) => ctx.fillText(l, texW / 2, y2 + i * (30 * textureScale)))

        // Tech stack
        ctx.font = `500 ${tsTech}px monospace`; ctx.fillStyle = `${proj.accentColor}`
        ctx.fillText(proj.tech, texW / 2, texH - 85 * textureScale)

        // Mark texture for update in ThreeJS
        t.needsUpdate = true
    }

    if (proj.image) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        let loaded = false
        img.onload = () => {
            loaded = true
            draw(img)
        }
        img.onerror = () => {
            draw() // Fallback to no image if loading fails
        }
        img.src = proj.image

        // Timeout to draw anyway if image takes too long, just in case
        setTimeout(() => { if (!loaded) draw() }, 50)
    } else {
        draw()
    }

    return t
}

function makeNameplate(proj: Project): THREE.CanvasTexture {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 512, 0)
    g.addColorStop(0, '#0e0a06'); g.addColorStop(0.5, '#1a1208'); g.addColorStop(1, '#0e0a06')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 128)
    ctx.strokeStyle = `${proj.accentColor}55`; ctx.lineWidth = 1.5; ctx.strokeRect(6, 6, 500, 116)
    ctx.font = 'bold 36px Georgia, serif'; ctx.fillStyle = proj.accentColor
    ctx.shadowColor = proj.accentColor; ctx.shadowBlur = 20
    ctx.textAlign = 'center'; ctx.fillText(proj.title, 256, 52)
    ctx.shadowBlur = 0; ctx.font = '500 18px monospace'; ctx.fillStyle = 'rgba(200,170,130,0.55)'
    ctx.fillText(proj.subtitle, 256, 88)
    ctx.font = '14px monospace'; ctx.fillStyle = `${proj.accentColor}66`
    ctx.fillText(proj.year, 256, 112)
    return new THREE.CanvasTexture(c)
}

// ─────────────────────────────────────────────────────────────────────────────

export default function WorksRoom({ isActive = true }: { isActive?: boolean }) {
    const mountRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [hovered, setHovered] = useState(false)
    const isActiveRef = useRef(isActive)
    const perf = usePerformance()
    useEffect(() => { isActiveRef.current = isActive }, [isActive])

    const goNext = useCallback(() => setCurrentIndex(i => (i + 1) % PROJECTS.length), [])
    const goPrev = useCallback(() => setCurrentIndex(i => (i - 1 + PROJECTS.length) % PROJECTS.length), [])

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return

        let W = mount.clientWidth, H = mount.clientHeight

        // ── RENDERER ────────────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({
            antialias: perf.tier === 'high',
            powerPreference: 'high-performance'
        })
        renderer.setSize(W, H)
        renderer.setPixelRatio(perf.pixelRatio)
        renderer.shadowMap.enabled = perf.shadows
        renderer.shadowMap.type = perf.tier === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.4
        mount.appendChild(renderer.domElement)

        // ── SCENE ───────────────────────────────────────────────────────────────
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x000000)
        scene.fog = new THREE.FogExp2(0x000000, 0.04)

        const camera = new THREE.PerspectiveCamera(65, W / H, 0.05, 80)
        camera.position.set(0, 1.8, 5.5)
        camera.lookAt(0, 1.8, 0)

        // ── ROOM DIMENSIONS ─────────────────────────────────────────────────────
        const RW = 14, RH = 5.5, RD = 14
        const HW = RW / 2, HD = RD / 2

        // ── MATERIALS ───────────────────────────────────────────────────────────
        const wallT = makeWallTex(0, perf.textureScale); wallT.map.repeat.set(4, 2); wallT.bumpTex.repeat.set(4, 2)
        const wallMat = new THREE.MeshStandardMaterial({ map: wallT.map, bumpMap: wallT.bumpTex, bumpScale: 0.08, roughness: 0.96, color: 0xaaaacc })

        const wallT2 = makeWallTex(1, perf.textureScale); wallT2.map.repeat.set(2, 2); wallT2.bumpTex.repeat.set(2, 2)
        const sideWallMat = new THREE.MeshStandardMaterial({ map: wallT2.map, bumpMap: wallT2.bumpTex, bumpScale: 0.08, roughness: 0.96, color: 0xaaaacc })

        const floorTex = makeFloorTex(perf.textureScale); floorTex.repeat.set(3, 3)
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85, metalness: 0.06, color: 0xffffff })

        const ceilTex = makeCeilingTex(); ceilTex.repeat.set(3, 3)
        const ceilMat = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.98, color: 0x222222 })

        const trimTex = makeTrimTex(); trimTex.repeat.set(12, 1)
        const trimMat = new THREE.MeshStandardMaterial({ map: trimTex, roughness: 0.75, color: 0x8a5530 })

        // ── ROOM GEOMETRY ────────────────────────────────────────────────────────
        const mkBox = (w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material, ry = 0) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
            m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m
        }

        // Floor
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), floorMat)
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor)

        // Ceiling
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), ceilMat)
        ceil.rotation.x = Math.PI / 2; ceil.position.y = RH; scene.add(ceil)

        // Back wall
        const backW = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), wallMat)
        backW.position.set(0, RH / 2, -HD); backW.receiveShadow = true; scene.add(backW)

        // Front wall (behind camera — just for enclosure)
        const frontW = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), wallMat)
        frontW.rotation.y = Math.PI; frontW.position.set(0, RH / 2, HD); scene.add(frontW)

        // Left wall
        const leftW = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), sideWallMat)
        leftW.rotation.y = Math.PI / 2; leftW.position.set(-HW, RH / 2, 0); leftW.receiveShadow = true; scene.add(leftW)

        // Right wall
        const rightW = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), sideWallMat)
        rightW.rotation.y = -Math.PI / 2; rightW.position.set(HW, RH / 2, 0); rightW.receiveShadow = true; scene.add(rightW)

        // ── TRIM ─────────────────────────────────────────────────────────────────
        // Skirting boards
        mkBox(RW, 0.25, 0.12, 0, 0.125, -HD + 0.06, trimMat)
        mkBox(RW, 0.25, 0.12, 0, 0.125, HD - 0.06, trimMat)
        mkBox(RD, 0.25, 0.12, -HW + 0.06, 0.125, 0, trimMat, Math.PI / 2)
        mkBox(RD, 0.25, 0.12, HW - 0.06, 0.125, 0, trimMat, -Math.PI / 2)
        // Cornice
        mkBox(RW, 0.22, 0.15, 0, RH - 0.11, -HD + 0.075, trimMat)
        mkBox(RW, 0.22, 0.15, 0, RH - 0.11, HD - 0.075, trimMat)
        mkBox(RD, 0.22, 0.15, -HW + 0.075, RH - 0.11, 0, trimMat, Math.PI / 2)
        mkBox(RD, 0.22, 0.15, HW - 0.075, RH - 0.11, 0, trimMat, -Math.PI / 2)
        // Dado rail
        mkBox(RW, 0.1, 0.1, 0, 1.2, -HD + 0.05, trimMat)
        mkBox(RW, 0.1, 0.1, 0, 1.2, HD - 0.05, trimMat)
        mkBox(RD, 0.1, 0.1, -HW + 0.05, 1.2, 0, trimMat, Math.PI / 2)
        mkBox(RD, 0.1, 0.1, HW - 0.05, 1.2, 0, trimMat, -Math.PI / 2)

        // ── CEILING BEAMS ─────────────────────────────────────────────────────────
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x1a0e04, roughness: 0.88 })
        for (let z = -HD + 2; z < HD; z += 4) {
            mkBox(RW, 0.2, 0.35, 0, RH - 0.1, z, beamMat)
        }
        for (let x = -HW + 2; x < HW; x += 4) {
            mkBox(0.35, 0.2, RD, x, RH - 0.1, 0, beamMat)
        }

        // ── WOODEN FLOOR DETAILS ──────────────────────────────────────────────────
        // Persian rug area
        const rugGeo = new THREE.PlaneGeometry(5.5, 4.5)
        const rugCanvas = document.createElement('canvas'); rugCanvas.width = 512; rugCanvas.height = 512
        const rc = rugCanvas.getContext('2d')!
        rc.fillStyle = '#1a0808'; rc.fillRect(0, 0, 512, 512)
        // Rug border
        rc.strokeStyle = '#8a2222'; rc.lineWidth = 20; rc.strokeRect(10, 10, 492, 492)
        rc.strokeStyle = '#cc4422'; rc.lineWidth = 8; rc.strokeRect(22, 22, 468, 468)
        rc.strokeStyle = '#8a2222'; rc.lineWidth = 4; rc.strokeRect(35, 35, 442, 442)
        // Rug pattern (simple diamond grid)
        rc.strokeStyle = 'rgba(180,80,40,0.3)'; rc.lineWidth = 1.5
        for (let x = 0; x < 512; x += 40) for (let y = 0; y < 512; y += 40) {
            rc.save(); rc.translate(x + 20, y + 20); rc.rotate(Math.PI / 4)
            rc.strokeRect(-12, -12, 24, 24); rc.restore()
        }
        // Center medallion
        const cg = rc.createRadialGradient(256, 256, 0, 256, 256, 80)
        cg.addColorStop(0, 'rgba(200,80,40,0.4)'); cg.addColorStop(1, 'rgba(0,0,0,0)')
        rc.fillStyle = cg; rc.fillRect(0, 0, 512, 512)
        rc.strokeStyle = '#cc4422'; rc.lineWidth = 3
        rc.beginPath(); rc.arc(256, 256, 70, 0, Math.PI * 2); rc.stroke()
        rc.beginPath(); rc.arc(256, 256, 48, 0, Math.PI * 2); rc.stroke()
        const rugTex = new THREE.CanvasTexture(rugCanvas)
        const rug = new THREE.Mesh(rugGeo, new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.95 }))
        rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.005, 0.5); scene.add(rug)

        // ── IRON CHANDELIER ───────────────────────────────────────────────────────
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x0c0c10, metalness: 0.88, roughness: 0.35 })
        const candleMat2 = new THREE.MeshStandardMaterial({ color: 0xd0b880, roughness: 0.92 })
        const flameMat2 = new THREE.MeshBasicMaterial({ color: 0xff8800 })
        const CHAN_Y = RH - 0.6

        // Drop rod
        const dropRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8), ironMat)
        dropRod.position.set(0, CHAN_Y - 0.5, 0); scene.add(dropRod)
        // Main ring
        const chanRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.035, 8, 24), ironMat)
        chanRing.position.set(0, CHAN_Y - 1.0, 0); scene.add(chanRing)
        // Spokes
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2
            const ax = Math.cos(ang) * 0.8, az = Math.sin(ang) * 0.8
            const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 6), ironMat)
            spoke.position.set(ax * 0.5, CHAN_Y - 1.0, az * 0.5); spoke.rotation.z = Math.PI / 2; spoke.rotation.y = ang; scene.add(spoke)
            // Candle
            const cs = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.2, 8), candleMat2)
            cs.position.set(ax, CHAN_Y - 0.94, az); scene.add(cs)
            const cf = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), flameMat2)
            cf.position.set(ax, CHAN_Y - 0.73, az); scene.add(cf)
            // Drip drop
            const cd = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), ironMat)
            cd.position.set(ax, CHAN_Y - 1.22, az); scene.add(cd)
        }
        // Center pendant
        const pendant = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), ironMat)
        pendant.position.set(0, CHAN_Y - 1.15, 0); scene.add(pendant)

        // ── GALLERY FRAMES ────────────────────────────────────────────────────────
        // Place paintings on three walls (back wall, left wall, right wall)
        // Layout: back wall = 2 large, side walls = 2 each (total 6 projects)
        const FW = 4.2, FH = 3.0  // frame outer dims
        const IW = 3.8, IH = 2.6  // inner image dims
        const FT = 0.12            // frame thickness
        const FD = 0.18            // frame depth
        const WALL_Y = RH / 2 + 0.2 // center height of paintings

        const flames: THREE.Mesh[] = []

        // Wall sconce helper
        const addSconce = (x: number, y: number, z: number, ry: number) => {
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.12), ironMat)
            base.position.set(x, y, z); base.rotation.y = ry; base.castShadow = true; scene.add(base)
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), ironMat)
            arm.rotation.z = Math.PI / 2
            arm.position.set(x + Math.sin(ry) * 0.15, y + 0.08, z + Math.cos(ry) * 0.15)
            arm.rotation.y = ry; scene.add(arm)
            const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.03, 0.15, 8), candleMat2)
            sc.position.set(x + Math.sin(ry) * 0.3, y + 0.12, z + Math.cos(ry) * 0.3); scene.add(sc)
            const sf = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), flameMat2)
            sf.position.set(x + Math.sin(ry) * 0.3, y + 0.22, z + Math.cos(ry) * 0.3); scene.add(sf)
            flames.push(sf)
            const sl = new THREE.PointLight(0xffaa44, 18, 5, 2)
            sl.position.copy(sf.position); scene.add(sl)
            return sl
        }

        type PaintingInfo = { index: number; x: number; z: number; ry: number }
        const paintingLayout: PaintingInfo[] = [
            // Back wall: 2 paintings
            { index: 0, x: -2.8, z: -HD + 0.12, ry: 0 },
            { index: 1, x: 2.8, z: -HD + 0.12, ry: 0 },
            // Left wall: 2 paintings
            { index: 2, x: -HW + 0.12, z: -2.0, ry: Math.PI / 2 },
            { index: 3, x: -HW + 0.12, z: 2.5, ry: Math.PI / 2 },
            // Right wall: 2 paintings
            { index: 4, x: HW - 0.12, z: -2.0, ry: -Math.PI / 2 },
            { index: 5, x: HW - 0.12, z: 2.5, ry: -Math.PI / 2 },
        ]

        const paintingMeshes: THREE.Mesh[] = []
        const spotLights: THREE.SpotLight[] = []

        paintingLayout.forEach(({ index, x, z, ry }) => {
            const proj = PROJECTS[index]
            const group = new THREE.Group()
            group.position.set(x, WALL_Y, z)
            group.rotation.y = ry

            // ── Outer frame (ornate molding) ──
            const frameTex = makeFrameTex('#3a2010')
            const frameMat = new THREE.MeshStandardMaterial({ map: frameTex, roughness: 0.6, metalness: 0.15 })

            // Frame pieces (top, bottom, left, right)
            const fPieces: [number, number, number, number, number, number][] = [
                [FW + FD * 2, FD, FT, 0, FH / 2 + FT / 2, 0],  // top
                [FW + FD * 2, FD, FT, 0, -FH / 2 - FT / 2, 0], // bottom
                [FT, FH + FD * 2, FD, -FW / 2 - FT / 2, 0, 0], // left
                [FT, FH + FD * 2, FD, FW / 2 + FT / 2, 0, 0],  // right
            ]
            fPieces.forEach(([fw2, fh2, fd2, fx, fy, fz]) => {
                const fp = new THREE.Mesh(new THREE.BoxGeometry(fw2, fh2, fd2), frameMat)
                fp.position.set(fx, fy, fz); fp.castShadow = true; group.add(fp)
            })

            // Corner ornaments
            for (const [cx2, cy2] of [[-FW / 2, FH / 2], [FW / 2, FH / 2], [-FW / 2, -FH / 2], [FW / 2, -FH / 2]] as [number, number][]) {
                const co = new THREE.Mesh(new THREE.BoxGeometry(FD, FD, FD + FT),
                    new THREE.MeshStandardMaterial({ color: 0x5a3a00, metalness: 0.72, roughness: 0.28 }))
                co.position.set(cx2, cy2, 0); group.add(co)
            }

            // Inner mat board (off-white linen between frame and painting)
            const matBoard = new THREE.Mesh(new THREE.BoxGeometry(IW + 0.24, IH + 0.24, FT * 0.5),
                new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 0.98 }))
            matBoard.position.z = FD / 2 - 0.01; group.add(matBoard)

            // Painting surface
            const paintTex = makeProjectCanvas(proj, perf.textureScale)
            const paintMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(IW, IH),
                new THREE.MeshStandardMaterial({ map: paintTex, roughness: 0.7, metalness: 0.0 })
            )
            paintMesh.position.z = FD / 2 + 0.02; group.add(paintMesh)
            paintingMeshes.push(paintMesh)

            // Painting cord from ceiling
            const cordLen = RH - WALL_Y - FH / 2 - 0.3
            if (cordLen > 0) {
                const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, cordLen, 4),
                    new THREE.MeshStandardMaterial({ color: 0x3a2800, roughness: 0.9 }))
                cord.position.set(0, FH / 2 + cordLen / 2, 0); group.add(cord)
            }

            // Nameplate below painting
            const nptTex = makeNameplate(proj)
            const npt = new THREE.Mesh(new THREE.BoxGeometry(IW * 0.65, 0.24, 0.04),
                new THREE.MeshStandardMaterial({ map: nptTex, roughness: 0.5, metalness: 0.3 }))
            npt.position.set(0, -FH / 2 - 0.26, FD / 2); group.add(npt)

            scene.add(group)

            // Gallery spot light shining onto painting
            const spot = new THREE.SpotLight(0xfff2cc, 90, 12, Math.PI / 10, 0.3, 1.5)
            // Position light in front of painting (on room-interior side), up and slightly forward
            const normalDir = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry))
            const lightPos = new THREE.Vector3(x, WALL_Y + 2.5, z).addScaledVector(normalDir, 3.5)
            spot.position.copy(lightPos)
            spot.target.position.set(x, WALL_Y, z)
            spot.castShadow = perf.tier === 'high';
            spot.shadow.mapSize.set(perf.shadowMapSize / 2, perf.shadowMapSize / 2);
            spot.shadow.bias = -0.002
            scene.add(spot); scene.add(spot.target)
            spotLights.push(spot)

            // Wall sconces beside each painting
            if (ry === 0) {
                // Back wall sconces
                addSconce(x - FW / 2 - 0.5, WALL_Y + FH / 2 - 0.3, -HD + 0.15, 0)
                addSconce(x + FW / 2 + 0.5, WALL_Y + FH / 2 - 0.3, -HD + 0.15, 0)
            }
        })

        // ── FIREPLACE (back wall, center) ─────────────────────────────────────────
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x2a2418, roughness: 0.95, metalness: 0.04 })
        const FPW = 2.6, FPH = 2.8, FPD = 0.5
        mkBox(FPW + 0.5, FPH, FPD, 0, FPH / 2, -HD + FPD / 2, stoneMat)          // surround
        mkBox(FPW - 0.4, 1.8, FPD + 0.1, 0, 1.0, -HD + FPD / 2, new THREE.MeshStandardMaterial({ color: 0x050302 })) // opening
        // Mantel shelf
        mkBox(FPW + 0.8, 0.12, 0.38, 0, FPH + 0.06, -HD + 0.22, new THREE.MeshStandardMaterial({ map: makeTrimTex(), roughness: 0.7, color: 0x8a5530 }))
        // Fire glow
        const fireGeo = new THREE.PlaneGeometry(1.2, 1.4)
        const fireCanvas = document.createElement('canvas'); fireCanvas.width = 256; fireCanvas.height = 256
        const fc = fireCanvas.getContext('2d')!
        const fg = fc.createRadialGradient(128, 200, 0, 128, 128, 128)
        fg.addColorStop(0, 'rgba(255,200,80,0.95)'); fg.addColorStop(0.3, 'rgba(255,80,20,0.7)'); fg.addColorStop(0.7, 'rgba(180,20,0,0.3)'); fg.addColorStop(1, 'rgba(0,0,0,0)')
        fc.fillStyle = fg; fc.fillRect(0, 0, 256, 256)
        const fireTex = new THREE.CanvasTexture(fireCanvas)
        const fireMesh = new THREE.Mesh(fireGeo, new THREE.MeshBasicMaterial({ map: fireTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
        fireMesh.position.set(0, 0.9, -HD + 0.4); scene.add(fireMesh)

        const fireLight = new THREE.PointLight(0xff6600, 60, 10, 1.6)
        fireLight.position.set(0, 1.5, -HD + 1.5);
        fireLight.castShadow = perf.tier !== 'low';
        fireLight.shadow.mapSize.set(perf.shadowMapSize / 2, perf.shadowMapSize / 2);
        scene.add(fireLight)

        // Fireplace andirons
        const andironMat = new THREE.MeshStandardMaterial({ color: 0x1e1e28, metalness: 0.88, roughness: 0.35 })
        for (const ax of [-0.35, 0.35]) {
            mkBox(0.08, 0.5, 0.08, ax, 0.25, -HD + 0.28, andironMat)
            mkBox(0.08, 0.08, 0.3, ax, 0.44, -HD + 0.33, andironMat)
        }

        // ── MANTEL DECOR ──────────────────────────────────────────────────────────
        // Clock (center of mantel)
        const clockMat = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.6, metalness: 0.4 })
        mkBox(0.3, 0.4, 0.15, 0, FPH + 0.32, -HD + 0.22, clockMat)
        // Candelabras
        const candleStickMat = new THREE.MeshStandardMaterial({ color: 0xb08820, metalness: 0.82, roughness: 0.25 })
        for (const cx2 of [-0.9, 0.9]) {
            const cs = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.055, 0.3, 8), candleStickMat)
            cs.position.set(cx2, FPH + 0.27, -HD + 0.22); scene.add(cs)
            const cb = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.25, 8),
                new THREE.MeshStandardMaterial({ color: 0xd0c080, roughness: 0.92 }))
            cb.position.set(cx2, FPH + 0.545, -HD + 0.22); scene.add(cb)
            const cf = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), flameMat2)
            cf.position.set(cx2, FPH + 0.68, -HD + 0.22); scene.add(cf)
            flames.push(cf)
            const cl = new THREE.PointLight(0xff9944, 12, 4, 2)
            cl.position.copy(cf.position); scene.add(cl)
        }

        // ── READING CHAIR + TABLE ─────────────────────────────────────────────────
        const fabricMat = new THREE.MeshStandardMaterial({ color: 0x1a0a06, roughness: 0.95 })
        const leatherMat = new THREE.MeshStandardMaterial({ color: 0x280c04, roughness: 0.7, metalness: 0.05 })
        const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x1e1008, roughness: 0.8 })

        // Armchair
        const CHAIR_X = -HW + 2.2, CHAIR_Z = HD - 2.0
        mkBox(1.0, 0.45, 1.0, CHAIR_X, 0.225, CHAIR_Z, leatherMat)           // seat
        mkBox(1.0, 0.9, 0.15, CHAIR_X, 0.72, CHAIR_Z - 0.42, fabricMat)     // back
        mkBox(0.18, 0.35, 0.9, CHAIR_X - 0.41, 0.6, CHAIR_Z, darkWoodMat)   // left arm
        mkBox(0.18, 0.35, 0.9, CHAIR_X + 0.41, 0.6, CHAIR_Z, darkWoodMat)   // right arm
        for (const [lx, lz] of [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]] as [number, number][]) {
            mkBox(0.07, 0.45, 0.07, CHAIR_X + lx, 0.09, CHAIR_Z + lz, darkWoodMat)
        }
        // Cushion
        mkBox(0.85, 0.1, 0.85, CHAIR_X, 0.5, CHAIR_Z - 0.08, fabricMat)

        // Side table
        const TABLE_X = CHAIR_X + 0.85, TABLE_Z = CHAIR_Z - 0.6
        mkBox(0.65, 0.04, 0.65, TABLE_X, 0.72, TABLE_Z, darkWoodMat)     // top
        for (const [tx, tz] of [[-0.26, -0.26], [0.26, -0.26], [-0.26, 0.26], [0.26, 0.26]] as [number, number][]) {
            mkBox(0.05, 0.72, 0.05, TABLE_X + tx, 0.36, TABLE_Z + tz, darkWoodMat)
        }
        // Book on table
        mkBox(0.3, 0.04, 0.22, TABLE_X - 0.08, 0.76, TABLE_Z, new THREE.MeshStandardMaterial({ color: 0x3a0808, roughness: 0.9 }))
        // Oil lamp on table
        const lampMat = new THREE.MeshStandardMaterial({ color: 0xc09020, metalness: 0.75, roughness: 0.3 })
        const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.22, 10), lampMat)
        lamp.position.set(TABLE_X + 0.12, 0.85, TABLE_Z - 0.1); scene.add(lamp)
        const lampGlow = new THREE.PointLight(0xffaa44, 20, 5, 1.8)
        lampGlow.position.set(TABLE_X + 0.12, 1.0, TABLE_Z - 0.1); scene.add(lampGlow)

        // ── BOOKCASE (right side) ──────────────────────────────────────────────────
        const BOOK_X = HW - 0.22, BOOK_Z = HD - 2.0
        const bcMat = new THREE.MeshStandardMaterial({ color: 0x1a0e04, roughness: 0.85 })
        mkBox(0.35, 2.8, 1.2, BOOK_X, 1.4, BOOK_Z, bcMat)  // carcass
        // Shelves
        for (let sh = 0; sh < 4; sh++) {
            mkBox(0.3, 0.04, 1.1, BOOK_X, 0.35 + sh * 0.7, BOOK_Z, darkWoodMat)
            // Books on shelf
            const bookColors = ['#3a0808', '#081a08', '#08083a', '#1a1008', '#3a1a00']
            let bx = BOOK_X - 0.08
            for (let b = 0; b < 5 + Math.floor(Math.random() * 4); b++) {
                const bw = 0.04 + Math.random() * 0.055
                const bh = 0.25 + Math.random() * 0.22
                const bm = new THREE.MeshStandardMaterial({ color: new THREE.Color(bookColors[b % bookColors.length]), roughness: 0.88 })
                const book = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.9), bm)
                book.position.set(bx + bw / 2, 0.37 + sh * 0.7 + bh / 2, BOOK_Z)
                book.rotation.y = (Math.random() - 0.5) * 0.1
                bx += bw + 0.01; scene.add(book)
            }
        }

        // ── LIGHTING ─────────────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0x080412, 15))

        // Main chandelier light
        const chanLight = new THREE.PointLight(0xffaa44, 65, 28, 1.7)
        chanLight.position.set(0, RH - 1.0, 0)
        chanLight.castShadow = perf.shadows;
        chanLight.shadow.mapSize.set(perf.shadowMapSize, perf.shadowMapSize);
        chanLight.shadow.bias = -0.002
        scene.add(chanLight)

        // Cool moonlight from entrance side
        const fillLight = new THREE.DirectionalLight(0x1a2266, 2.2)
        fillLight.position.set(3, RH, HD + 4); fillLight.target.position.set(0, RH / 2, 0)
        scene.add(fillLight); scene.add(fillLight.target)

        // Deep atmospheric color
        const deepAtmos = new THREE.PointLight(0x220010, 30, 20, 1.8)
        deepAtmos.position.set(0, 1.5, 0); scene.add(deepAtmos)

        // ── PARTICLES (dust motes) ─────────────────────────────────────────────────
        const PC = Math.floor(200 * perf.particlesScale)
        const pGeo = new THREE.BufferGeometry()
        const pArr = new Float32Array(PC * 3)
        for (let i = 0; i < PC; i++) {
            pArr[i * 3] = (Math.random() - 0.5) * RW * 0.9
            pArr[i * 3 + 1] = Math.random() * RH
            pArr[i * 3 + 2] = (Math.random() - 0.5) * RD * 0.9
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3))
        const pMat = new THREE.PointsMaterial({ color: 0xccaa88, size: 0.028, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })
        scene.add(new THREE.Points(pGeo, pMat))

        // ── CAMERA TOUR ──────────────────────────────────────────────────────────
        // Each painting has a "view position" in front of it
        const viewPositions: THREE.Vector3[] = [
            new THREE.Vector3(-2.8, 1.8, -HD + 4.5),  // back-left
            new THREE.Vector3(2.8, 1.8, -HD + 4.5),  // back-right
            new THREE.Vector3(-HW + 4.5, 1.8, -2.0),  // left-front
            new THREE.Vector3(-HW + 4.5, 1.8, 2.5),   // left-back
            new THREE.Vector3(HW - 4.5, 1.8, -2.0),  // right-front
            new THREE.Vector3(HW - 4.5, 1.8, 2.5),   // right-back
        ]

        const camPos = new THREE.Vector3(0, 1.8, 5.0)
        let targetCamPos = new THREE.Vector3().copy(viewPositions[currentIndex])

        // ── RAYCASTER for hover ───────────────────────────────────────────────────
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2(-99, -99)
        const onMouseMove = (e: MouseEvent) => {
            const r = mount.getBoundingClientRect()
            mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1
            mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1
        }
        mount.addEventListener('mousemove', onMouseMove)

        // ── ANIMATE ───────────────────────────────────────────────────────────────
        const clock = new THREE.Clock()
        let raf: number
        let idxRef = currentIndex

        const animate = () => {
            raf = requestAnimationFrame(animate)
            if (!isActiveRef.current) return
            const t = clock.getElapsedTime()

            // Smooth camera to current painting view
            camPos.lerp(targetCamPos, 0.045)
            camera.position.copy(camPos)
            // Look at the painting
            const pl = paintingLayout[idxRef]
            const lookTarget = new THREE.Vector3(pl.x, WALL_Y, pl.z)
            camera.lookAt(lookTarget)
            // Add subtle head bob
            camera.position.y = camPos.y + Math.sin(t * 0.6) * 0.018

            // Chandelier flicker
            chanLight.intensity = 62 + Math.sin(t * 13) * 9 * Math.random() + Math.sin(t * 3.5) * 14
            // Fire flicker
            fireLight.intensity = 55 + Math.random() * 20 + Math.sin(t * 18) * 10
            fireMesh.position.y = 0.9 + Math.sin(t * 8) * 0.04
            fireMesh.scale.x = 1 + Math.sin(t * 12) * 0.06
            // Lamp flicker
            lampGlow.intensity = 18 + Math.random() * 8 + Math.sin(t * 14) * 4

            // Flame flicker for all sconce/mantel candles
            flames.forEach((f, i) => {
                f.position.y += Math.sin(t * (8 + i * 1.3)) * 0.005
            })

            // Spot pulse
            spotLights.forEach((s, i) => {
                s.intensity = 86 + Math.sin(t * 0.5 + i * 0.8) * 8
            })

            // Dust mote drift
            const pp = pGeo.attributes.position.array as Float32Array
            for (let i = 0; i < PC; i++) {
                pp[i * 3] += Math.sin(t * 0.25 + i * 0.7) * 0.0015
                pp[i * 3 + 1] += Math.sin(t * 0.18 + i * 0.9) * 0.001
                pp[i * 3 + 2] += Math.cos(t * 0.22 + i * 0.6) * 0.0015
                if (pp[i * 3 + 1] > RH) pp[i * 3 + 1] = 0
                if (pp[i * 3 + 1] < 0) pp[i * 3 + 1] = RH
            }
            pGeo.attributes.position.needsUpdate = true

            // Hover detection
            raycaster.setFromCamera(mouse, camera)
            const hits = raycaster.intersectObjects(paintingMeshes)
            mount.style.cursor = hits.length > 0 ? 'pointer' : 'default'

            renderer.render(scene, camera)
        }
        animate()

        // ── EXPOSE index update ────────────────────────────────────────────────────
        const updateIndex = (idx: number) => {
            idxRef = idx
            targetCamPos = new THREE.Vector3().copy(viewPositions[idx])
        }
            ; (mount as HTMLDivElement & { _updateIdx?: (i: number) => void })._updateIdx = updateIndex

        const onResize = () => {
            W = mount.clientWidth; H = mount.clientHeight
            camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H)
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', onResize)
            mount.removeEventListener('mousemove', onMouseMove)
            renderer.dispose()
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
        }
    }, []) // Only run once — index changes driven via ref

    // Notify Three.js scene of index change
    useEffect(() => {
        const mount = mountRef.current as (HTMLDivElement & { _updateIdx?: (i: number) => void }) | null
        mount?._updateIdx?.(currentIndex)
    }, [currentIndex])

    const proj = PROJECTS[currentIndex]

    return (
        <div className="relative w-full h-full bg-black overflow-hidden select-none">
            <div ref={mountRef} className="absolute inset-0" />

            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0 z-10"
                style={{ background: 'radial-gradient(circle at 50% 45%, transparent 28%, rgba(0,0,0,0.92) 100%)' }} />
            <div className="pointer-events-none absolute inset-0 z-10"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 12%, transparent 82%, rgba(0,0,0,0.95) 100%)' }} />

            {/* Header */}
            <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                    <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(200,80,40,0.6))' }} />
                    <h2 className="text-4xl md:text-5xl tracking-[0.25em] uppercase"
                        style={{ fontFamily: '"Georgia","Times New Roman",serif', color: '#aa3322', textShadow: '0 0 40px rgba(200,60,40,0.4)', letterSpacing: '0.3em' }}>
                        The Gallery
                    </h2>
                    <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(200,80,40,0.6))' }} />
                </div>
                <p className="text-[9px] tracking-[0.5em] uppercase font-mono" style={{ color: 'rgba(180,130,90,0.45)' }}>
                    Works of Alen James
                </p>
            </div>

            {/* Project Info Panel — bottom left */}
            <div className="absolute bottom-28 left-8 z-20 max-w-xs" key={currentIndex}
                style={{ animation: 'panelIn 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div className="p-5 md:p-6" style={{
                    background: 'linear-gradient(140deg, rgba(6,3,10,0.95), rgba(10,6,8,0.92))',
                    border: `1px solid ${proj.accentColor}28`,
                    boxShadow: `0 0 60px ${proj.accentColor}10, inset 0 0 40px rgba(0,0,0,0.5)`
                }}>
                    <div className="h-px mb-4" style={{ background: `linear-gradient(to right, ${proj.accentColor}66, transparent)` }} />
                    <p className="text-[8px] tracking-[0.6em] uppercase font-mono mb-1.5" style={{ color: `${proj.accentColor}66` }}>
                        {proj.year} · {currentIndex + 1} of {PROJECTS.length}
                    </p>
                    <h3 className="text-xl font-bold mb-1" style={{ fontFamily: '"Georgia",serif', color: proj.accentColor, textShadow: `0 0 30px ${proj.accentColor}44` }}>
                        {proj.title}
                    </h3>
                    <p className="text-xs mb-3" style={{ color: 'rgba(180,150,110,0.6)', fontFamily: 'monospace' }}>
                        {proj.subtitle}
                    </p>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(200,178,148,0.72)', fontFamily: '"Georgia",serif', lineHeight: 1.9 }}>
                        {proj.description}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: `${proj.accentColor}55` }}>{proj.tech}</p>

                    {proj.link && (
                        <div className="mt-5 pointer-events-auto">
                            <a href={proj.link} target="_blank" rel="noopener noreferrer"
                                className="inline-block px-4 py-2 font-mono text-[9px] uppercase tracking-widest transition-all duration-300 hover:bg-white/5"
                                style={{ border: `1px solid ${proj.accentColor}44`, color: proj.accentColor }}>
                                [ VIEW LIVE APP ]
                            </a>
                        </div>
                    )}

                    <div className="h-px mt-4" style={{ background: `linear-gradient(to right, ${proj.accentColor}44, transparent)` }} />
                </div>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 md:gap-10">
                <button onClick={goPrev}
                    className="flex items-center gap-2 px-5 py-2.5 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300"
                    style={{ border: '1px solid rgba(180,80,40,0.3)', color: 'rgba(180,100,60,0.55)', background: 'rgba(10,5,2,0.8)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#cc5533'; e.currentTarget.style.borderColor = 'rgba(200,80,40,0.7)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(180,100,60,0.55)'; e.currentTarget.style.borderColor = 'rgba(180,80,40,0.3)' }}>
                    ← Prev
                </button>

                <div className="flex gap-2.5 items-center">
                    {PROJECTS.map((p, i) => (
                        <button key={i} onClick={() => setCurrentIndex(i)}
                            className="transition-all duration-300 rounded-full"
                            style={{
                                width: i === currentIndex ? 10 : 6,
                                height: i === currentIndex ? 10 : 6,
                                background: i === currentIndex ? p.accentColor : 'rgba(200,180,140,0.18)',
                                boxShadow: i === currentIndex ? `0 0 12px ${p.accentColor}88` : 'none',
                            }} />
                    ))}
                </div>

                <button onClick={goNext}
                    className="flex items-center gap-2 px-5 py-2.5 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300"
                    style={{ border: '1px solid rgba(180,80,40,0.3)', color: 'rgba(180,100,60,0.55)', background: 'rgba(10,5,2,0.8)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#cc5533'; e.currentTarget.style.borderColor = 'rgba(200,80,40,0.7)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(180,100,60,0.55)'; e.currentTarget.style.borderColor = 'rgba(180,80,40,0.3)' }}>
                    Next →
                </button>
            </div>

            {/* Go Back */}
            <button
                onClick={() => window.dispatchEvent(new CustomEvent('exit-room'))}
                className="absolute top-8 left-8 z-20 px-5 py-2 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300"
                style={{ border: '1px solid rgba(180,140,80,0.22)', color: 'rgba(180,140,80,0.38)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(220,180,100,0.8)'; e.currentTarget.style.borderColor = 'rgba(220,180,100,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(180,140,80,0.38)'; e.currentTarget.style.borderColor = 'rgba(180,140,80,0.22)' }}>
                ← Exit
            </button>

            <style>{`
        @keyframes panelIn {
          0%  { opacity:0; transform:translateX(-12px); }
          100%{ opacity:1; transform:translateX(0); }
        }
      `}</style>
        </div>
    )
}
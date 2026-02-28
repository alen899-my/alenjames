'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'

interface Experience {
    title: string
    company: string
    duration: string
    period: string
    type: string
    location: string
    description: string
    responsibilities: string[]
    stack: string[]
    accentColor: string
    bgColor: string
    icon: string
}

const EXPERIENCE_DATA: Experience[] = [
    {
        title: 'Trainer',
        company: 'GTEC Education Center',
        duration: '10 Months',
        period: 'Jan 2023 – Oct 2023',
        type: 'Full-time · On-site',
        location: 'Kerala, India',
        description:
            'Delivered hands-on training programs in web technologies and programming fundamentals to students ranging from beginners to intermediate learners. Designed curriculum, evaluated projects, and mentored over 120+ students through their learning journey.',
        responsibilities: [
            'Designed & delivered web dev curriculum',
            'Mentored 120+ students individually',
            'Conducted live coding workshops',
            'Evaluated capstone projects & graded assessments',
            'Developed course material & practice exercises',
            'Organised hackathons & coding competitions',
        ],
        stack: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Git'],
        accentColor: '#ff6b35',
        bgColor: '#110800',
        icon: '◈',
    },
    {
        title: 'Software Developer',
        company: 'Independent / Freelance',
        duration: '4 Months → Present',
        period: 'Nov 2023 – Present',
        type: 'Full-time · Remote',
        location: 'Kerala, India',
        description:
            'Building production-grade web applications using Next.js 14 with App Router, TypeScript, and modern full-stack tooling. Currently specializing in performance-optimized server components, API design, and pixel-perfect UI implementations for clients across multiple domains.',
        responsibilities: [
            'Architecting Next.js 14 App Router applications',
            'Building RESTful & tRPC APIs',
            'Implementing server & client components',
            'Database design with Prisma + PostgreSQL',
            'Deploying on Vercel with CI/CD pipelines',
            'Responsive UI with Tailwind CSS & Framer Motion',
        ],
        stack: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'Vercel'],
        accentColor: '#00d9ff',
        bgColor: '#000d11',
        icon: '⬡',
    },
]

// ── TEXTURE GENERATORS ─────────────────────────────────────────────────────

function makeMetalPanel(hue = 220) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512
    const ctx = c.getContext('2d')!
    ctx.fillStyle = `hsl(${hue},6%,5%)`; ctx.fillRect(0, 0, 512, 512)
    // Brushed metal lines
    for (let i = 0; i < 512; i++) {
        const alpha = Math.random() * 0.04
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fillRect(0, i, 512, 1)
    }
    // Panel rivets
    for (let x = 32; x < 512; x += 64) {
        for (let y = 32; y < 512; y += 64) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(x - 1, y - 1, 2, 0, Math.PI * 2); ctx.fill()
        }
    }
    // Panel seams
    for (let x = 0; x < 512; x += 128) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x, 0, 2, 512)
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(x + 2, 0, 1, 512)
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
}

function makeGrateFloor() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#030508'; ctx.fillRect(0, 0, 256, 256)
    const gs = 32
    for (let x = 0; x < 256; x += gs) {
        for (let y = 0; y < 256; y += gs) {
            ctx.fillStyle = 'rgba(10,14,22,0.9)'; ctx.fillRect(x + 3, y + 3, gs - 6, gs - 6)
            // Highlight edges
            ctx.strokeStyle = 'rgba(0,180,255,0.07)'; ctx.lineWidth = 1
            ctx.strokeRect(x + 3, y + 3, gs - 6, gs - 6)
        }
    }
    // Grate lines
    for (let x = 0; x < 256; x += gs) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(x, 0, 3, 256)
        ctx.fillStyle = 'rgba(0,150,255,0.06)'; ctx.fillRect(x + 3, 0, 1, 256)
    }
    for (let y = 0; y < 256; y += gs) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, y, 256, 3)
        ctx.fillStyle = 'rgba(0,150,255,0.06)'; ctx.fillRect(0, y + 3, 256, 1)
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
}

function makeCeilingGrid() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#020305'; ctx.fillRect(0, 0, 256, 256)
    ctx.strokeStyle = 'rgba(0,180,255,0.08)'; ctx.lineWidth = 1
    for (let x = 0; x < 256; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke() }
    for (let y = 0; y < 256; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke() }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
}

function makeServerRackTex() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 512
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#050508'; ctx.fillRect(0, 0, 256, 512)
    // Rack units
    for (let y = 8; y < 512; y += 28) {
        ctx.fillStyle = '#0a0a10'; ctx.fillRect(8, y, 240, 22)
        // LED indicators
        const led = Math.random() > 0.3
        ctx.fillStyle = led ? '#00ff88' : '#220000'
        ctx.beginPath(); ctx.arc(22, y + 11, 3, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = Math.random() > 0.5 ? '#0088ff' : '#002244'
        ctx.beginPath(); ctx.arc(32, y + 11, 3, 0, Math.PI * 2); ctx.fill()
        // Vent slits
        for (let vx = 50; vx < 220; vx += 10) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(vx, y + 6, 6, 2)
            ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(vx, y + 14, 6, 2)
        }
        // Ejector handles
        ctx.fillStyle = '#1a1a22'; ctx.fillRect(230, y + 4, 12, 14)
    }
    return new THREE.CanvasTexture(c)
}

function makeHologramDisplay(exp: Experience, w = 1280, h = 720): THREE.CanvasTexture {
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const ctx = c.getContext('2d')!
    const ac = exp.accentColor

    // Deep background
    ctx.fillStyle = '#010305'; ctx.fillRect(0, 0, w, h)

    // Hex grid background pattern
    ctx.strokeStyle = `${ac}08`; ctx.lineWidth = 1
    const hs = 55
    for (let col = 0; col * hs < w + hs; col++) {
        for (let row = 0; row * hs < h + hs; row++) {
            const ox = col * hs * 1.5
            const oy = row * hs * 0.866 + (col % 2) * hs * 0.433
            ctx.beginPath()
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i
                const px = ox + hs * 0.48 * Math.cos(angle)
                const py = oy + hs * 0.48 * Math.sin(angle)
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
            }
            ctx.closePath(); ctx.stroke()
        }
    }

    // Scanlines
    for (let y = 0; y < h; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, y, w, 2) }

    // Top bar
    const barH = 52
    ctx.fillStyle = `${ac}15`; ctx.fillRect(0, 0, w, barH)
    ctx.strokeStyle = `${ac}40`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, barH); ctx.lineTo(w, barH); ctx.stroke()

    // Top bar content
    ctx.font = '600 13px "Courier New",monospace'; ctx.fillStyle = `${ac}99`
    ctx.textAlign = 'left'; ctx.fillText('▶  WORK EXPERIENCE  //  ACTIVE RECORD', 28, 33)
    ctx.textAlign = 'right'
    ctx.fillStyle = `${ac}55`; ctx.fillText(exp.period, w - 28, 33)

    // Corner accents
    const ca = (x: number, y: number, fx: number, fy: number) => {
        ctx.strokeStyle = `${ac}66`; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x + fx * 22, y); ctx.lineTo(x, y); ctx.lineTo(x, y + fy * 22); ctx.stroke()
    }
    ca(20, 70, 1, 1); ca(w - 20, 70, -1, 1); ca(20, h - 20, 1, -1); ca(w - 20, h - 20, -1, -1)

    // LEFT PANEL ─────────────────────────────────────────────────────────────
    const lx = 65, ty = 105

    // Role label
    ctx.font = '500 12px "Courier New",monospace'; ctx.fillStyle = `${ac}66`
    ctx.textAlign = 'left'; ctx.fillText(exp.type.toUpperCase(), lx, ty)

    // Big title
    ctx.font = `bold 54px "Georgia",serif`; ctx.fillStyle = '#f0f8ff'
    ctx.shadowColor = ac; ctx.shadowBlur = 35
    ctx.fillText(exp.title, lx, ty + 52)
    ctx.shadowBlur = 0

    // Company
    ctx.font = '500 20px "Courier New",monospace'; ctx.fillStyle = ac
    ctx.shadowColor = ac; ctx.shadowBlur = 12
    ctx.fillText(exp.company, lx, ty + 88)
    ctx.shadowBlur = 0

    // Duration badge
    const dw = ctx.measureText(exp.duration).width + 28
    ctx.fillStyle = `${ac}1a`; ctx.fillRect(lx, ty + 104, dw, 28)
    ctx.strokeStyle = `${ac}44`; ctx.lineWidth = 1; ctx.strokeRect(lx, ty + 104, dw, 28)
    ctx.font = '700 12px "Courier New",monospace'; ctx.fillStyle = ac
    ctx.fillText(exp.duration, lx + 14, ty + 123)

    // Divider
    ctx.strokeStyle = `${ac}44`; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(lx, ty + 148); ctx.lineTo(lx + 380, ty + 148); ctx.stroke()

    // Description
    ctx.font = '17px "Georgia",serif'; ctx.fillStyle = 'rgba(190,215,240,0.65)'
    const words = exp.description.split(' ')
    let line = '', lines: string[] = []
    ctx.font = '17px "Georgia",serif'
    words.forEach(word => {
        const test = line + word + ' '
        if (ctx.measureText(test).width > 530 && line) { lines.push(line.trim()); line = word + ' ' }
        else line = test
    })
    if (line.trim()) lines.push(line.trim())
    lines.forEach((l, i) => ctx.fillText(l, lx, ty + 180 + i * 28))

    // Location
    const locY = ty + 180 + lines.length * 28 + 20
    ctx.font = '12px "Courier New",monospace'; ctx.fillStyle = `${ac}55`
    ctx.fillText(`⌖  ${exp.location}`, lx, locY)

    // RIGHT PANEL ─────────────────────────────────────────────────────────────
    const rx = w - 340, ry = 80
    ctx.fillStyle = `${ac}09`; ctx.fillRect(rx - 12, ry, 300, h - ry - 20)
    ctx.strokeStyle = `${ac}1e`; ctx.lineWidth = 1; ctx.strokeRect(rx - 12, ry, 300, h - ry - 20)

    // Responsibilities
    ctx.font = '600 11px "Courier New",monospace'; ctx.fillStyle = `${ac}77`
    ctx.fillText('RESPONSIBILITIES', rx, ry + 32)
    exp.responsibilities.forEach((r, i) => {
        const ry2 = ry + 60 + i * 38
        ctx.fillStyle = `${ac}20`; ctx.fillRect(rx - 8, ry2 - 14, 290, 28)
        ctx.fillStyle = `${ac}88`; ctx.font = '11px "Courier New",monospace'
        ctx.fillText('▸', rx + 2, ry2 + 5)
        ctx.fillStyle = 'rgba(190,215,240,0.72)'; ctx.font = '13px "Courier New",monospace'
        ctx.fillText(r, rx + 16, ry2 + 5)
    })

    // Stack pills
    const stackY = ry + 60 + exp.responsibilities.length * 38 + 18
    ctx.font = '600 11px "Courier New",monospace'; ctx.fillStyle = `${ac}66`
    ctx.fillText('TECH STACK', rx, stackY)
    let sx = rx, sy2 = stackY + 22
    exp.stack.forEach(tech => {
        const tw = ctx.measureText(tech).width + 20
        if (sx + tw > rx + 280) { sx = rx; sy2 += 30 }
        ctx.fillStyle = `${ac}18`; ctx.fillRect(sx, sy2, tw, 22)
        ctx.strokeStyle = `${ac}44`; ctx.lineWidth = 1; ctx.strokeRect(sx, sy2, tw, 22)
        ctx.fillStyle = ac; ctx.font = '600 11px "Courier New",monospace'
        ctx.fillText(tech, sx + 10, sy2 + 15)
        sx += tw + 8
    })

    // Bottom strip
    ctx.fillStyle = `${ac}10`; ctx.fillRect(0, h - 34, w, 34)
    ctx.strokeStyle = `${ac}28`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, h - 34); ctx.lineTo(w, h - 34); ctx.stroke()
    ctx.font = '11px "Courier New",monospace'; ctx.fillStyle = `${ac}33`
    ctx.textAlign = 'center'
    ctx.fillText('ALEN JAMES  ·  PROFESSIONAL EXPERIENCE  ·  ' + exp.period, w / 2, h - 12)

    // Vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.8)
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h)

    return new THREE.CanvasTexture(c)
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ExperienceRoom({ isActive = true }: { isActive?: boolean }) {
    const mountRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const isActiveRef = useRef(isActive)
    useEffect(() => { isActiveRef.current = isActive }, [isActive])

    const goNext = useCallback(() => setCurrentIndex(i => (i + 1) % EXPERIENCE_DATA.length), [])
    const goPrev = useCallback(() => setCurrentIndex(i => (i - 1 + EXPERIENCE_DATA.length) % EXPERIENCE_DATA.length), [])

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return
        let W = mount.clientWidth, H = mount.clientHeight

        // ── RENDERER ──────────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(W, H)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 0.9
        mount.appendChild(renderer.domElement)

        // ── SCENE ─────────────────────────────────────────────────────────────
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x010205)
        scene.fog = new THREE.FogExp2(0x010205, 0.042)

        const camera = new THREE.PerspectiveCamera(65, W / H, 0.05, 80)
        camera.position.set(0, 2.0, 7.5)
        camera.lookAt(0, 2.2, -4)

        const RW = 20, RH = 5.5, RD = 16
        const HW = RW / 2, HD = RD / 2

        const mkBox = (w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material, ry = 0) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
            m.position.set(x, y, z); m.rotation.y = ry
            m.castShadow = true; m.receiveShadow = true; scene.add(m); return m
        }

        // ── MATERIALS ─────────────────────────────────────────────────────────
        const panelTex = makeMetalPanel(220); panelTex.repeat.set(4, 2)
        const wallMat = new THREE.MeshStandardMaterial({ map: panelTex, roughness: 0.65, metalness: 0.5, color: 0xaabbcc })

        const sideTex = makeMetalPanel(200); sideTex.repeat.set(4, 2)
        const sideMat = new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.6, metalness: 0.55, color: 0x99aabb })

        const floorTex = makeGrateFloor(); floorTex.repeat.set(7, 6)
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.45, metalness: 0.3, color: 0xffffff })

        const ceilTex = makeCeilingGrid(); ceilTex.repeat.set(6, 4)
        const ceilMat = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.9, color: 0x445566 })

        const metalMat = new THREE.MeshStandardMaterial({ color: 0x1a1e2a, metalness: 0.9, roughness: 0.2 })
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x080810, metalness: 0.8, roughness: 0.35 })
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0x303848, metalness: 0.95, roughness: 0.1 })

        // ── ROOM SHELL ────────────────────────────────────────────────────────
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), floorMat)
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor)

        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), ceilMat)
        ceil.rotation.x = Math.PI / 2; ceil.position.y = RH; scene.add(ceil)

        // Back wall
        const backW = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), wallMat)
        backW.position.set(0, RH / 2, -HD); backW.receiveShadow = true; scene.add(backW)
        // Front wall
        const frontW = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), wallMat)
        frontW.rotation.y = Math.PI; frontW.position.set(0, RH / 2, HD); scene.add(frontW)
        // Side walls
        const leftW = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), sideMat)
        leftW.rotation.y = Math.PI / 2; leftW.position.set(-HW, RH / 2, 0); leftW.receiveShadow = true; scene.add(leftW)
        const rightW = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), sideMat)
        rightW.rotation.y = -Math.PI / 2; rightW.position.set(HW, RH / 2, 0); rightW.receiveShadow = true; scene.add(rightW)

        // Raised floor platform (server room style)
        mkBox(RW + 0.1, 0.18, RD + 0.1, 0, -0.09, 0,
            new THREE.MeshStandardMaterial({ color: 0x080a10, metalness: 0.6, roughness: 0.4 }))

        // ── MAIN DISPLAY SCREEN ───────────────────────────────────────────────
        const SW = 10.5, SH = 5.9
        const SY = 3.0, SZ = -HD + 0.08

        // Screen housing
        mkBox(SW + 0.5, 0.22, 0.22, 0, SY + SH / 2 + 0.22, SZ,
            new THREE.MeshStandardMaterial({ color: 0x0a0e18, metalness: 0.7, roughness: 0.3 }))
        mkBox(SW + 0.5, 0.22, 0.22, 0, SY - SH / 2 - 0.22, SZ,
            new THREE.MeshStandardMaterial({ color: 0x0a0e18, metalness: 0.7, roughness: 0.3 }))

        // Screen border
        mkBox(SW + 0.14, SH + 0.14, 0.05, 0, SY, SZ + 0.01,
            new THREE.MeshStandardMaterial({ color: 0x080c16, metalness: 0.8, roughness: 0.25 }))

        // Screen surface
        const screenTex = makeHologramDisplay(EXPERIENCE_DATA[0])
        const screenMat = new THREE.MeshStandardMaterial({
            map: screenTex, roughness: 0.2,
            emissive: new THREE.Color(0x001122), emissiveIntensity: 0.12,
        })
        const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenMat)
        screenMesh.position.set(0, SY, SZ + 0.045); scene.add(screenMesh)

        // Screen LED edge glow strips
        const edgeMat = (c: number) => new THREE.MeshStandardMaterial({
            color: c, emissive: c, emissiveIntensity: 1.2,
        })
        const glowColor = 0x0088ff
        mkBox(SW + 0.02, 0.04, 0.04, 0, SY + SH / 2 + 0.02, SZ + 0.05, edgeMat(glowColor))
        mkBox(SW + 0.02, 0.04, 0.04, 0, SY - SH / 2 - 0.02, SZ + 0.05, edgeMat(glowColor))
        mkBox(0.04, SH + 0.04, 0.04, -SW / 2 - 0.02, SY, SZ + 0.05, edgeMat(glowColor))
        mkBox(0.04, SH + 0.04, 0.04, SW / 2 + 0.02, SY, SZ + 0.05, edgeMat(glowColor))

        // Screen glow light
        const screenGlow = new THREE.PointLight(0x0088ff, 20, 9, 1.5)
        screenGlow.position.set(0, SY, SZ + 2); scene.add(screenGlow)

        // ── SERVER RACKS (left wall) ───────────────────────────────────────────
        const rackTex = makeServerRackTex()
        const rackMat = new THREE.MeshStandardMaterial({ map: rackTex, roughness: 0.6, metalness: 0.4 })
        for (let i = 0; i < 3; i++) {
            const rz = -4 + i * 3.5
            // Rack frame
            mkBox(1.4, 4.2, 0.7, -HW + 0.95, 2.1, rz, darkMat)
            // Rack front face
            const rf = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 4.0), rackMat)
            rf.rotation.y = Math.PI / 2; rf.position.set(-HW + 0.62, 2.1, rz); scene.add(rf)
            // Rack top handle
            mkBox(1.3, 0.08, 0.08, -HW + 0.95, 4.25, rz, chromeMat)
            // Cable management arms
            mkBox(0.08, 0.08, 0.55, -HW + 0.62, 0.8, rz, metalMat)
            mkBox(0.08, 0.08, 0.55, -HW + 0.62, 2.0, rz, metalMat)
            // Rack indicator lights (LED bar)
            const ledBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.8, 0.04),
                new THREE.MeshStandardMaterial({ color: 0x003300, emissive: 0x00ff44, emissiveIntensity: 0.4 }))
            ledBar.position.set(-HW + 0.25, 2.1, rz); scene.add(ledBar)
        }

        // ── WORKSTATION DESK ──────────────────────────────────────────────────
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x0c0e16, metalness: 0.5, roughness: 0.7 })
        const DESK_Z = 2.2
        // Desk surface
        mkBox(3.8, 0.06, 1.0, 0, 0.82, DESK_Z, deskMat)
        // Desk legs
        for (const [lx, lz] of [[-1.7, DESK_Z - 0.42], [1.7, DESK_Z - 0.42], [-1.7, DESK_Z + 0.42], [1.7, DESK_Z + 0.42]]) {
            mkBox(0.06, 0.82, 0.06, lx, 0.41, lz, chromeMat)
        }
        // Desk cable tray below
        mkBox(3.4, 0.04, 0.16, 0, 0.44, DESK_Z - 0.35, metalMat)

        // Monitor (ultrawide)
        const monW = 1.7, monH = 0.72
        mkBox(monW + 0.06, monH + 0.06, 0.06, 0, 1.28, DESK_Z - 0.35, darkMat)
        const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(monW, monH),
            new THREE.MeshStandardMaterial({ color: 0x020810, emissive: 0x0a1e3a, emissiveIntensity: 0.6 }))
        monScreen.position.set(0, 1.28, DESK_Z - 0.32); scene.add(monScreen)
        // Monitor stand
        mkBox(0.08, 0.38, 0.08, 0, 0.99, DESK_Z - 0.35, chromeMat)
        mkBox(0.38, 0.04, 0.26, 0, 0.82, DESK_Z - 0.35, chromeMat)

        // Keyboard
        mkBox(0.72, 0.02, 0.26, -0.1, 0.86, DESK_Z + 0.2,
            new THREE.MeshStandardMaterial({ color: 0x0e1020, metalness: 0.4, roughness: 0.8 }))

        // Small secondary monitor (side)
        mkBox(0.82 + 0.04, 0.52 + 0.04, 0.04, 1.2, 1.22, DESK_Z - 0.38, darkMat)
        const mon2 = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.52),
            new THREE.MeshStandardMaterial({ color: 0x020810, emissive: 0x0e2208, emissiveIntensity: 0.5 }))
        mon2.position.set(1.2, 1.22, DESK_Z - 0.36); scene.add(mon2)
        mkBox(0.06, 0.3, 0.06, 1.2, 0.94, DESK_Z - 0.38, chromeMat)
        mkBox(0.24, 0.04, 0.18, 1.2, 0.82, DESK_Z - 0.38, chromeMat)

        // Coffee cup
        const cupMat = new THREE.MeshStandardMaterial({ color: 0x1a0a08, roughness: 0.7 })
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.042, 0.11, 10), cupMat)
        cup.position.set(-1.5, 0.90, DESK_Z + 0.1); scene.add(cup)
        const cupLid = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.02, 10),
            new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.6 }))
        cupLid.position.set(-1.5, 0.97, DESK_Z + 0.1); scene.add(cupLid)

        // ── CABLE DUCTS ON CEILING ─────────────────────────────────────────────
        for (const [cx, cz] of [[-3, 0], [3, 0], [0, -3], [0, 3]]) {
            mkBox(0.22, 0.14, RD - 1, cx, RH - 0.08, 0, metalMat, cz !== 0 ? Math.PI / 2 : 0)
        }

        // ── CEILING BEAM LIGHTS ────────────────────────────────────────────────
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x0a0e1a, metalness: 0.7, roughness: 0.3 })
        for (let bx = -6; bx <= 6; bx += 6) {
            // Beam housing
            mkBox(0.38, 0.18, RD - 1, bx, RH - 0.1, 0, beamMat)
            // LED strip inside beam
            const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, RD - 2),
                new THREE.MeshStandardMaterial({ color: 0x001133, emissive: 0x0055cc, emissiveIntensity: 0.8 }))
            strip.position.set(bx, RH - 0.18, 0); scene.add(strip)
            // Point lights from beam
            for (let pz = -5; pz <= 5; pz += 3.5) {
                const pl = new THREE.PointLight(0x3366cc, 10, 7, 1.8)
                pl.position.set(bx, RH - 0.2, pz); scene.add(pl)
            }
        }

        // ── FLOOR LED STRIPS (under raised floor edge) ────────────────────────
        for (const fx of [-HW + 0.1, HW - 0.1]) {
            const fstrip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, RD - 2),
                new THREE.MeshStandardMaterial({ color: 0x001133, emissive: 0x0044cc, emissiveIntensity: 1.0 }))
            fstrip.position.set(fx, 0.0, 0); scene.add(fstrip)
            const fl = new THREE.PointLight(0x0044ff, 6, 4, 2); fl.position.set(fx, 0.2, 0); scene.add(fl)
        }

        // ── UPS / POWER UNITS (right wall) ────────────────────────────────────
        for (let i = 0; i < 2; i++) {
            const uz = -3 + i * 4.5
            mkBox(0.9, 1.6, 0.55, HW - 0.65, 0.8, uz, darkMat)
            // Front panel details
            const upsFront = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.4),
                new THREE.MeshStandardMaterial({ color: 0x080c14, roughness: 0.7 }))
            upsFront.rotation.y = -Math.PI / 2; upsFront.position.set(HW - 0.38, 0.8, uz); scene.add(upsFront)
            // Status bars
            for (let b = 0; b < 5; b++) {
                const barGlow = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.04),
                    new THREE.MeshStandardMaterial({ emissive: b < 4 ? 0x00cc44 : 0x440000, emissiveIntensity: 1.0, color: 0x000000 }))
                barGlow.position.set(HW - 0.38, 1.25 - b * 0.18, uz); scene.add(barGlow)
            }
        }

        // ── AMBIENT + KEY LIGHTS ──────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0x050812, 15))
        const keyLight = new THREE.DirectionalLight(0x1122aa, 1.5)
        keyLight.position.set(-5, RH, 5); keyLight.castShadow = true; scene.add(keyLight)

        // Screen area fill
        const screenFill = new THREE.PointLight(0x0066ff, 18, 10, 1.5)
        screenFill.position.set(0, SY, SZ + 3); scene.add(screenFill)

        // ── FLOATING PARTICLES ────────────────────────────────────────────────
        const PC = 200
        const pGeo = new THREE.BufferGeometry()
        const pArr = new Float32Array(PC * 3)
        for (let i = 0; i < PC; i++) {
            pArr[i * 3] = (Math.random() - 0.5) * RW * 0.85
            pArr[i * 3 + 1] = Math.random() * RH
            pArr[i * 3 + 2] = (Math.random() - 0.5) * RD * 0.85
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3))
        const pMat = new THREE.PointsMaterial({
            color: 0x4488ff, size: 0.018, transparent: true, opacity: 0.25,
            blending: THREE.AdditiveBlending, depthWrite: false,
        })
        scene.add(new THREE.Points(pGeo, pMat))

        // ── STATE + UPDATES ───────────────────────────────────────────────────
        const updateScreen = (idx: number) => {
            const exp = EXPERIENCE_DATA[idx]
            screenMat.map?.dispose()
            screenMat.map = makeHologramDisplay(exp)
            screenMat.map.needsUpdate = true
            screenMat.needsUpdate = true
            const ac = new THREE.Color(exp.accentColor)
            screenGlow.color.copy(ac)
            screenFill.color.copy(ac)
        }
        const updateIndex = (idx: number) => updateScreen(idx)
            ; (mount as HTMLDivElement & { _updateIdx?: (i: number) => void })._updateIdx = updateIndex

        // ── ANIMATE ───────────────────────────────────────────────────────────
        const clock = new THREE.Clock()
        let raf: number

        const animate = () => {
            raf = requestAnimationFrame(animate)
            if (!isActiveRef.current) return
            const t = clock.getElapsedTime()

            // Camera gentle drift
            camera.position.x = Math.sin(t * 0.1) * 0.3
            camera.position.y = 2.0 + Math.sin(t * 0.18) * 0.05
            camera.lookAt(Math.sin(t * 0.07) * 0.4, 2.3, -6)

            // Screen glow pulse
            screenGlow.intensity = 18 + Math.sin(t * 1.1) * 5
            screenFill.intensity = 16 + Math.sin(t * 0.8) * 4

            // Monitor pulse
            ;(monScreen.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.55 + Math.sin(t * 1.5) * 0.1
            ;(mon2.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.45 + Math.sin(t * 1.8 + 1) * 0.1

            // Particle drift
            const pp = pGeo.attributes.position.array as Float32Array
            for (let i = 0; i < PC; i++) {
                pp[i * 3] += Math.sin(t * 0.25 + i * 0.7) * 0.0008
                pp[i * 3 + 1] += 0.0006 + Math.sin(t * 0.3 + i * 0.5) * 0.0004
                pp[i * 3 + 2] += Math.cos(t * 0.2 + i * 0.6) * 0.0007
                if (pp[i * 3 + 1] > RH) pp[i * 3 + 1] = 0
            }
            pGeo.attributes.position.needsUpdate = true

            renderer.render(scene, camera)
        }
        animate()

        const onResize = () => {
            W = mount.clientWidth; H = mount.clientHeight
            camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H)
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
        }
    }, [])

    useEffect(() => {
        const mount = mountRef.current as (HTMLDivElement & { _updateIdx?: (i: number) => void }) | null
        mount?._updateIdx?.(currentIndex)
    }, [currentIndex])

    const exp = EXPERIENCE_DATA[currentIndex]

    return (
        <div className="relative w-full h-full bg-black overflow-hidden select-none">
            <div ref={mountRef} className="absolute inset-0" />

            {/* Vignette overlays */}
            <div className="pointer-events-none absolute inset-0 z-10"
                style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />
            <div className="pointer-events-none absolute inset-0 z-10"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 12%, transparent 72%, rgba(0,0,0,0.98) 100%)' }} />

            {/* Scanline overlay */}
            <div className="pointer-events-none absolute inset-0 z-10" style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
            }} />

            {/* Header */}
            <div className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-5">
                    <div className="h-px w-16" style={{ background: `linear-gradient(to right, transparent, ${exp.accentColor}44)` }} />
                    <h2 className="text-4xl md:text-5xl tracking-[0.22em] uppercase"
                        style={{
                            fontFamily: '"Courier New",monospace',
                            color: exp.accentColor,
                            textShadow: `0 0 30px ${exp.accentColor}55, 0 0 60px ${exp.accentColor}22`,
                            transition: 'color 0.8s, text-shadow 0.8s',
                            letterSpacing: '0.18em',
                        }}>
                        Experience
                    </h2>
                    <div className="h-px w-16" style={{ background: `linear-gradient(to left, transparent, ${exp.accentColor}44)` }} />
                </div>
                <p className="text-[9px] tracking-[0.55em] uppercase font-mono" style={{ color: 'rgba(120,160,200,0.35)' }}>
                    Professional Record  ·  Alen James
                </p>
            </div>

            {/* Bottom info panel */}
            <div
                className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-6"
                key={currentIndex}
                style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
            >
                <div className="p-6" style={{
                    background: 'linear-gradient(160deg, rgba(2,5,14,0.97), rgba(1,3,10,0.96))',
                    border: `1px solid ${exp.accentColor}22`,
                    boxShadow: `0 0 60px ${exp.accentColor}0c, inset 0 0 30px rgba(0,0,0,0.6)`,
                    clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                }}>
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-[9px] tracking-[0.6em] uppercase font-mono mb-1.5"
                                style={{ color: `${exp.accentColor}55` }}>
                                {exp.period}  ·  {currentIndex + 1} / {EXPERIENCE_DATA.length}
                            </p>
                            <h3 className="text-2xl font-bold mb-0.5"
                                style={{ fontFamily: '"Courier New",monospace', color: exp.accentColor, textShadow: `0 0 20px ${exp.accentColor}44` }}>
                                {exp.icon}  {exp.title}
                            </h3>
                            <p className="text-sm font-mono" style={{ color: 'rgba(140,170,200,0.55)' }}>
                                {exp.company}  ·  {exp.location}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-6">
                            <p className="text-[9px] tracking-[0.5em] uppercase font-mono" style={{ color: `${exp.accentColor}44` }}>TENURE</p>
                            <p className="text-xl font-bold font-mono" style={{ color: exp.accentColor }}>{exp.duration}</p>
                            <p className="text-[10px] tracking-widest uppercase font-mono mt-1" style={{ color: `${exp.accentColor}55` }}>
                                {exp.type.split('·')[0].trim()}
                            </p>
                        </div>
                    </div>

                    <div className="h-px mb-4" style={{ background: `linear-gradient(to right, ${exp.accentColor}44, transparent)` }} />

                    <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(180,200,225,0.65)', fontFamily: '"Georgia",serif', lineHeight: 1.9 }}>
                        {exp.description}
                    </p>

                    {/* Stack */}
                    <div className="flex flex-wrap gap-2">
                        {exp.stack.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase"
                                style={{ border: `1px solid ${exp.accentColor}22`, color: `${exp.accentColor}77`, background: `${exp.accentColor}0a` }}>
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 flex items-center gap-8">
                <button onClick={goPrev}
                    className="flex items-center gap-2 px-5 py-2.5 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300"
                    style={{
                        border: `1px solid ${exp.accentColor}28`,
                        color: `${exp.accentColor}44`,
                        background: 'rgba(1,3,12,0.9)',
                        clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)',
                    }}
                    onMouseEnter={e => {
                        const b = e.currentTarget as HTMLButtonElement
                        b.style.color = exp.accentColor; b.style.borderColor = `${exp.accentColor}88`
                        b.style.boxShadow = `0 0 16px ${exp.accentColor}22`
                    }}
                    onMouseLeave={e => {
                        const b = e.currentTarget as HTMLButtonElement
                        b.style.color = `${exp.accentColor}44`; b.style.borderColor = `${exp.accentColor}28`; b.style.boxShadow = 'none'
                    }}>
                    ← Prev
                </button>

                <div className="flex gap-4 items-center">
                    {EXPERIENCE_DATA.map((e, i) => (
                        <button key={i} onClick={() => setCurrentIndex(i)}
                            className="transition-all duration-300"
                            style={{
                                width: i === currentIndex ? 32 : 6,
                                height: 6,
                                background: i === currentIndex ? e.accentColor : 'rgba(140,170,210,0.15)',
                                boxShadow: i === currentIndex ? `0 0 10px ${e.accentColor}88` : 'none',
                            }} />
                    ))}
                </div>

                <button onClick={goNext}
                    className="flex items-center gap-2 px-5 py-2.5 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300"
                    style={{
                        border: `1px solid ${exp.accentColor}28`,
                        color: `${exp.accentColor}44`,
                        background: 'rgba(1,3,12,0.9)',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                    }}
                    onMouseEnter={e => {
                        const b = e.currentTarget as HTMLButtonElement
                        b.style.color = exp.accentColor; b.style.borderColor = `${exp.accentColor}88`
                        b.style.boxShadow = `0 0 16px ${exp.accentColor}22`
                    }}
                    onMouseLeave={e => {
                        const b = e.currentTarget as HTMLButtonElement
                        b.style.color = `${exp.accentColor}44`; b.style.borderColor = `${exp.accentColor}28`; b.style.boxShadow = 'none'
                    }}>
                    Next →
                </button>
            </div>

            {/* Exit */}
            <button
                onClick={() => window.dispatchEvent(new CustomEvent('exit-room'))}
                className="absolute top-8 left-8 z-20 px-5 py-2 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300"
                style={{ border: '1px solid rgba(120,160,200,0.15)', color: 'rgba(120,160,200,0.3)' }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'rgba(180,220,255,0.8)'; b.style.borderColor = 'rgba(180,220,255,0.4)' }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = 'rgba(120,160,200,0.3)'; b.style.borderColor = 'rgba(120,160,200,0.15)' }}>
                ← Exit
            </button>

            {/* Status indicator */}
            <div className="pointer-events-none absolute top-8 right-8 z-20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full"
                    style={{ background: exp.accentColor, boxShadow: `0 0 8px ${exp.accentColor}`, animation: 'blink 1.5s ease-in-out infinite' }} />
                <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: 'rgba(120,160,200,0.28)' }}>
                    SYS ONLINE
                </span>
            </div>

            {/* Corner decoration */}
            <div className="pointer-events-none absolute bottom-8 left-8 z-20 font-mono text-[9px] tracking-widest"
                style={{ color: `${exp.accentColor}22` }}>
                NODE_01 // KERALA, IN
            </div>
            <div className="pointer-events-none absolute bottom-8 right-8 z-20 font-mono text-[9px] tracking-widest text-right"
                style={{ color: `${exp.accentColor}22` }}>
                REV 2.4.1 // STABLE
            </div>

            <style>{`
        @keyframes slideUp {
          0%  { opacity:0; transform:translate(-50%, 16px); }
          100%{ opacity:1; transform:translate(-50%, 0); }
        }
        @keyframes blink {
          0%,100%{ opacity:1; } 50%{ opacity:0.15; }
        }
      `}</style>
        </div>
    )
}
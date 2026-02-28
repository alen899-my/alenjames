'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'

interface Education {
    degree: string
    institution: string
    year: string
    field: string
    gpa?: string
    honors?: string
    description: string
    courses: string[]
    accentColor: string
    bgColor: string
}

const EDUCATION_DATA: Education[] = [
    {
        degree: 'Master of Science',
        institution: 'University of Technology',
        year: '2022 – 2024',
        field: 'Computer Science & AI',
        gpa: '3.92 / 4.0',
        honors: 'Summa Cum Laude',
        description: 'Specializing in deep learning architectures, computer vision, and large-scale distributed systems. Thesis on self-supervised representation learning achieved state-of-the-art results on three benchmarks.',
        courses: ['Deep Learning', 'Computer Vision', 'Distributed Systems', 'Research Methods'],
        accentColor: '#4a9eff',
        bgColor: '#010a1a',
    },
    {
        degree: 'Bachelor of Engineering',
        institution: 'Institute of Technology',
        year: '2018 – 2022',
        field: 'Software Engineering',
        gpa: '3.78 / 4.0',
        honors: 'Magna Cum Laude',
        description: 'Core foundation in data structures, algorithms, operating systems, and software architecture. Capstone project: a real-time collaborative code editor serving 2,000+ concurrent users.',
        courses: ['Data Structures', 'OS Design', 'Networks', 'Software Architecture'],
        accentColor: '#44ddaa',
        bgColor: '#010f0a',
    },
    {
        degree: 'Higher Secondary Certificate',
        institution: 'Central Academy',
        year: '2016 – 2018',
        field: 'Mathematics & Physics',
        gpa: '98.4%',
        honors: 'District Topper',
        description: 'Excelled in advanced mathematics and physics, laying the analytical groundwork for engineering studies. Represented school in national mathematics olympiad, placing in the top 0.5%.',
        courses: ['Advanced Calculus', 'Physics', 'Chemistry', 'Computer Science'],
        accentColor: '#ffaa33',
        bgColor: '#110a00',
    },
]

// ── TEXTURE GENERATORS ────────────────────────────────────────────────────────

function makeConcreteWall(tint = 0) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 1024
    const ctx = c.getContext('2d')!
    // Base concrete
    const base = `hsl(${220 + tint},8%,${8 + tint}%)`
    ctx.fillStyle = base; ctx.fillRect(0, 0, 1024, 1024)
    // Noise grain
    for (let i = 0; i < 20000; i++) {
        const v = Math.random() * 15
        ctx.fillStyle = `rgba(${v},${v},${v + 5},${Math.random() * 0.05})`
        ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1 + Math.random() * 2, 1 + Math.random() * 2)
    }
    // Horizontal concrete pour lines
    for (let y = 0; y < 1024; y += 96) {
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke()
        ctx.strokeStyle = 'rgba(255,255,255,0.02)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(0, y + 3); ctx.lineTo(1024, y + 3); ctx.stroke()
    }
    // Vertical seams
    for (let x = 0; x < 1024; x += 256) {
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1024); ctx.stroke()
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
}

function makeTiledFloor() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 1024
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#090808'; ctx.fillRect(0, 0, 1024, 1024)
    const ts = 128 // tile size
    for (let tx = 0; tx < 1024; tx += ts) {
        for (let ty = 0; ty < 1024; ty += ts) {
            const alt = ((tx / ts + ty / ts) % 2 === 0)
            const v = alt ? 10 : 7
            ctx.fillStyle = `rgb(${v},${v},${v + 2})`
            ctx.fillRect(tx + 2, ty + 2, ts - 4, ts - 4)
            // Subtle tile sheen
            const sg = ctx.createLinearGradient(tx, ty, tx + ts, ty + ts)
            sg.addColorStop(0, `rgba(255,255,255,${0.02 + Math.random() * 0.015})`)
            sg.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = sg; ctx.fillRect(tx + 2, ty + 2, ts - 4, ts - 4)
        }
    }
    // Grout lines
    for (let tx = 0; tx < 1024; tx += ts) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(tx, 0, 2, 1024)
    }
    for (let ty = 0; ty < 1024; ty += ts) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, ty, 1024, 2)
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
}

function makeCeilingTile() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#060608'; ctx.fillRect(0, 0, 512, 512)
    // Acoustic ceiling tiles
    const ts = 128
    for (let tx = 0; tx < 512; tx += ts) {
        for (let ty = 0; ty < 512; ty += ts) {
            ctx.fillStyle = 'rgba(20,20,25,0.6)'; ctx.fillRect(tx + 3, ty + 3, ts - 6, ts - 6)
            // Dot pattern
            for (let i = 0; i < 20; i++) {
                ctx.fillStyle = `rgba(0,0,0,${0.3 + Math.random() * 0.3})`
                ctx.beginPath()
                ctx.arc(tx + 10 + Math.random() * (ts - 20), ty + 10 + Math.random() * (ts - 20), 1.5, 0, Math.PI * 2)
                ctx.fill()
            }
        }
    }
    // Grid lines
    for (let x = 0; x < 512; x += ts) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x, 0, 4, 512) }
    for (let y = 0; y < 512; y += ts) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, y, 512, 4) }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
}

function makeWhiteboardTex() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 64)
    g.addColorStop(0, '#181818'); g.addColorStop(0.5, '#222222'); g.addColorStop(1, '#161616')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 64)
    ctx.strokeStyle = 'rgba(60,60,80,0.4)'; ctx.lineWidth = 1.5
    ctx.strokeRect(4, 4, 504, 56)
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
}

function makeProjectorScreen(edu: Education, w = 1280, h = 720): THREE.CanvasTexture {
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const ctx = c.getContext('2d')!

    // Dark background with subtle noise
    const bg = ctx.createLinearGradient(0, 0, w, h)
    bg.addColorStop(0, '#020508')
    bg.addColorStop(0.5, shiftHex(edu.bgColor, 1.4))
    bg.addColorStop(1, '#020408')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)

    // Subtle grid
    ctx.strokeStyle = `${edu.accentColor}12`; ctx.lineWidth = 1
    for (let x = 0; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
    for (let y = 0; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }

    // Top status bar
    ctx.fillStyle = `${edu.accentColor}18`; ctx.fillRect(0, 0, w, 48)
    ctx.strokeStyle = `${edu.accentColor}44`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, 48); ctx.lineTo(w, 48); ctx.stroke()

    // Status bar content
    ctx.font = '500 16px monospace'; ctx.fillStyle = `${edu.accentColor}88`
    ctx.textAlign = 'left'; ctx.fillText('ACADEMIC RECORD  //  VERIFIED', 28, 30)
    ctx.textAlign = 'right'; ctx.fillText(edu.year, w - 28, 30)

    // Left column - Degree info
    const lx = 80, startY = 110

    // Field label
    ctx.font = '500 14px monospace'; ctx.fillStyle = `${edu.accentColor}77`
    ctx.textAlign = 'left'; ctx.fillText(edu.field.toUpperCase(), lx, startY)

    // Degree title
    ctx.font = `bold 58px "Georgia", serif`
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = edu.accentColor; ctx.shadowBlur = 30
    ctx.textAlign = 'left'
    // Word wrap degree
    const dWords = edu.degree.split(' ')
    let dLine = '', dLines: string[] = []
    dWords.forEach(w2 => {
        const test = dLine + w2 + ' '
        if (ctx.measureText(test).width > 600 && dLine) { dLines.push(dLine.trim()); dLine = w2 + ' ' }
        else dLine = test
    })
    if (dLine.trim()) dLines.push(dLine.trim())
    dLines.forEach((l, i) => ctx.fillText(l, lx, startY + 44 + i * 68))
    ctx.shadowBlur = 0

    const afterDegree = startY + 44 + dLines.length * 68 + 20

    // Divider
    ctx.strokeStyle = `${edu.accentColor}55`; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(lx, afterDegree); ctx.lineTo(lx + 340, afterDegree); ctx.stroke()

    // Institution
    ctx.font = '500 22px monospace'; ctx.fillStyle = `${edu.accentColor}cc`
    ctx.fillText(edu.institution, lx, afterDegree + 36)

    // Description
    ctx.font = '18px "Georgia", serif'; ctx.fillStyle = 'rgba(200,210,230,0.62)'
    const words = edu.description.split(' ')
    let line = '', lines: string[] = [], dy = afterDegree + 80
    words.forEach(word => {
        const test = line + word + ' '
        if (ctx.measureText(test).width > 580 && line) { lines.push(line.trim()); line = word + ' ' }
        else line = test
    })
    if (line.trim()) lines.push(line.trim())
    lines.forEach((l, i) => ctx.fillText(l, lx, dy + i * 30))

    // Courses
    const coursesY = dy + lines.length * 30 + 28
    ctx.font = '13px monospace'; ctx.fillStyle = `${edu.accentColor}66`
    ctx.fillText('KEY COURSES:', lx, coursesY)
    edu.courses.forEach((course, i) => {
        ctx.fillStyle = `${edu.accentColor}44`
        ctx.fillText(`• ${course}`, lx + (i % 2) * 240, coursesY + 24 + Math.floor(i / 2) * 24)
    })

    // Right column - Stats panel
    const rx = w - 320, sy = 90
    ctx.fillStyle = `${edu.accentColor}0a`; ctx.fillRect(rx - 20, sy - 10, 300, 340)
    ctx.strokeStyle = `${edu.accentColor}22`; ctx.lineWidth = 1; ctx.strokeRect(rx - 20, sy - 10, 300, 340)

    // Stats
    const stats = [
        { label: 'PERIOD', value: edu.year },
        { label: 'GPA / SCORE', value: edu.gpa || '—' },
        { label: 'DISTINCTION', value: edu.honors || '—' },
    ]
    stats.forEach(({ label, value }, i) => {
        const statY = sy + 40 + i * 90
        ctx.font = '12px monospace'; ctx.fillStyle = `${edu.accentColor}55`
        ctx.textAlign = 'left'; ctx.fillText(label, rx, statY)
        ctx.font = 'bold 24px monospace'; ctx.fillStyle = edu.accentColor
        ctx.shadowColor = edu.accentColor; ctx.shadowBlur = 15
        ctx.fillText(value, rx, statY + 30)
        ctx.shadowBlur = 0
        if (i < stats.length - 1) {
            ctx.strokeStyle = `${edu.accentColor}1a`; ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(rx - 10, statY + 52); ctx.lineTo(rx + 270, statY + 52); ctx.stroke()
        }
    })

    // Bottom progress bar decoration
    const barY = h - 36
    ctx.fillStyle = `${edu.accentColor}18`; ctx.fillRect(0, barY - 4, w, 40)
    ctx.strokeStyle = `${edu.accentColor}33`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, barY - 4); ctx.lineTo(w, barY - 4); ctx.stroke()
    ctx.font = '12px monospace'; ctx.fillStyle = `${edu.accentColor}44`
    ctx.textAlign = 'center'; ctx.fillText('ALEN JAMES  ·  ACADEMIC PORTFOLIO  ·  ' + edu.year, w / 2, barY + 16)

    // Scan lines
    for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(0, y, w, 1)
    }

    // Vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.85)
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.5)')
    ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h)

    return new THREE.CanvasTexture(c)
}

function shiftHex(hex: string, factor: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgb(${Math.min(255, ~~(r * factor))},${Math.min(255, ~~(g * factor))},${Math.min(255, ~~(b * factor))})`
}

function makeScreenFrame(): THREE.CanvasTexture {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 64, 64)
    g.addColorStop(0, '#1a1a1a'); g.addColorStop(1, '#0a0a0a')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.strokeRect(2, 2, 60, 60)
    return new THREE.CanvasTexture(c)
}

// ─────────────────────────────────────────────────────────────────────────────

export default function EducationRoom({ isActive = true }: { isActive?: boolean }) {
    const mountRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const isActiveRef = useRef(isActive)
    useEffect(() => { isActiveRef.current = isActive }, [isActive])

    const goNext = useCallback(() => setCurrentIndex(i => (i + 1) % EDUCATION_DATA.length), [])
    const goPrev = useCallback(() => setCurrentIndex(i => (i - 1 + EDUCATION_DATA.length) % EDUCATION_DATA.length), [])

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return
        let W = mount.clientWidth, H = mount.clientHeight

        // ── RENDERER ────────────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(W, H)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.1
        mount.appendChild(renderer.domElement)

        // ── SCENE ───────────────────────────────────────────────────────────────
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x010205)
        scene.fog = new THREE.FogExp2(0x010205, 0.038)

        const camera = new THREE.PerspectiveCamera(62, W / H, 0.05, 80)
        camera.position.set(0, 2.2, 8.5)
        camera.lookAt(0, 2.5, -5)

        // ── ROOM ────────────────────────────────────────────────────────────────
        const RW = 18, RH = 6, RD = 18
        const HW = RW / 2, HD = RD / 2

        const mkBox = (w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material, ry = 0) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
            m.position.set(x, y, z); m.rotation.y = ry
            m.castShadow = true; m.receiveShadow = true; scene.add(m); return m
        }

        // Materials
        const wallTex = makeConcreteWall(0); wallTex.repeat.set(5, 2)
        const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.92, color: 0xccccdd })

        const sideWallTex = makeConcreteWall(2); sideWallTex.repeat.set(5, 2)
        const sideWallMat = new THREE.MeshStandardMaterial({ map: sideWallTex, roughness: 0.92, color: 0xbbbbcc })

        const floorTex = makeTiledFloor(); floorTex.repeat.set(5, 5)
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55, metalness: 0.15, color: 0xffffff })

        const ceilTex = makeCeilingTile(); ceilTex.repeat.set(4, 4)
        const ceilMat = new THREE.MeshStandardMaterial({ map: ceilTex, roughness: 0.98, color: 0x888888 })

        const metalMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.85, roughness: 0.3 })
        const darkMetal = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 })
        const alcoveMat = new THREE.MeshStandardMaterial({ color: 0x080810, roughness: 0.97 })

        // Floor
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), floorMat)
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor)

        // Ceiling
        const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), ceilMat)
        ceil.rotation.x = Math.PI / 2; ceil.position.y = RH; scene.add(ceil)

        // Back wall (front of lecture hall, where screen is)
        const backW = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), wallMat)
        backW.position.set(0, RH / 2, -HD); backW.receiveShadow = true; scene.add(backW)
        // Front wall (rear, behind audience)
        const frontW = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), wallMat)
        frontW.rotation.y = Math.PI; frontW.position.set(0, RH / 2, HD); scene.add(frontW)
        // Side walls
        const leftW = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), sideWallMat)
        leftW.rotation.y = Math.PI / 2; leftW.position.set(-HW, RH / 2, 0); leftW.receiveShadow = true; scene.add(leftW)
        const rightW = new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), sideWallMat)
        rightW.rotation.y = -Math.PI / 2; rightW.position.set(HW, RH / 2, 0); rightW.receiveShadow = true; scene.add(rightW)

        // ── LECTURE THEATRE TIERED SEATING ──────────────────────────────────────
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x1a0808, roughness: 0.88 })
        const chairLegMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.4 })
        const ROWS = 5, COLS = 8
        for (let row = 0; row < ROWS; row++) {
            const zPos = 1.5 + row * 1.5
            const riseY = row * 0.22 // tiered rise
            // Step riser
            if (row > 0) {
                mkBox(RW - 2, 0.22, 0.12, 0, riseY, zPos - 0.75, alcoveMat)
            }
            for (let col = 0; col < COLS; col++) {
                const xPos = -((COLS - 1) / 2) * 1.8 + col * 1.8
                // Seat
                mkBox(0.7, 0.08, 0.6, xPos, riseY + 0.48, zPos, chairMat)
                // Back
                mkBox(0.7, 0.52, 0.08, xPos, riseY + 0.78, zPos - 0.28, chairMat)
                // Legs
                mkBox(0.06, 0.48, 0.06, xPos - 0.28, riseY + 0.24, zPos, chairLegMat)
                mkBox(0.06, 0.48, 0.06, xPos + 0.28, riseY + 0.24, zPos, chairLegMat)
                // Fold-up arm desk
                mkBox(0.55, 0.03, 0.32, xPos + 0.42, riseY + 0.72, zPos - 0.08,
                    new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.75 }))
            }
        }

        // ── RAISED LECTERN / STAGE ───────────────────────────────────────────────
        const stageMat = new THREE.MeshStandardMaterial({ color: 0x0d0d11, roughness: 0.9 })
        mkBox(RW, 0.22, 3.8, 0, 0.11, -HD + 1.9, stageMat) // stage platform
        // Stage edge trim
        mkBox(RW, 0.08, 0.06, 0, 0.22 + 0.04, -HD + 3.7,
            new THREE.MeshStandardMaterial({ color: 0x1a1a2a, metalness: 0.5, roughness: 0.6 }))

        // Lectern
        const LECT_Z = -HD + 2.5
        mkBox(0.9, 0.06, 0.55, 0, 1.32, LECT_Z, new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.7, metalness: 0.3 })) // top
        mkBox(0.82, 1.0, 0.05, 0, 0.83, LECT_Z - 0.24,
            new THREE.MeshStandardMaterial({ color: 0x0e0e16, roughness: 0.75 })) // front panel
        // Lectern legs
        mkBox(0.06, 1.0, 0.5, -0.38, 0.72, LECT_Z, metalMat)
        mkBox(0.06, 1.0, 0.5, 0.38, 0.72, LECT_Z, metalMat)
        mkBox(0.82, 0.04, 0.5, 0, 0.24, LECT_Z, metalMat) // base bar

        // Laptop on lectern
        mkBox(0.55, 0.02, 0.38, 0, 1.36, LECT_Z - 0.05,
            new THREE.MeshStandardMaterial({ color: 0x1c1c1c, metalness: 0.8, roughness: 0.2 }))
        // Screen open
        const lapScreen = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.01),
            new THREE.MeshStandardMaterial({ color: 0x050510, emissive: 0x1133aa, emissiveIntensity: 0.4 }))
        lapScreen.position.set(0, 1.54, LECT_Z - 0.24); lapScreen.rotation.x = -0.35; scene.add(lapScreen)

        // Microphone on stand
        const micStand = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 6), metalMat)
        micStand.position.set(-0.25, 1.52, LECT_Z - 0.1); scene.add(micStand)
        const mic = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), darkMetal)
        mic.position.set(-0.25, 1.73, LECT_Z - 0.1); scene.add(mic)

        // ── PROJECTOR SCREEN (back wall center) ─────────────────────────────────
        const SCREEN_W = 10.5, SCREEN_H = 5.9
        const SCREEN_Y = 3.3, SCREEN_Z = -HD + 0.08

        // Screen housing / roll-up box at top
        mkBox(SCREEN_W + 0.4, 0.18, 0.18, 0, SCREEN_Y + SCREEN_H / 2 + 0.2, SCREEN_Z,
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.5, roughness: 0.5 }))

        // Screen border frame
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, metalness: 0.6, roughness: 0.4 })
        mkBox(SCREEN_W + 0.12, SCREEN_H + 0.12, 0.04, 0, SCREEN_Y, SCREEN_Z + 0.01, frameMat)

        // Screen surface — will be updated dynamically
        const screenTex = makeProjectorScreen(EDUCATION_DATA[0])
        const screenMat = new THREE.MeshStandardMaterial({
            map: screenTex,
            roughness: 0.25,
            emissive: new THREE.Color(0x111122),
            emissiveIntensity: 0.08,
        })
        const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), screenMat)
        screenMesh.position.set(0, SCREEN_Y, SCREEN_Z + 0.04); scene.add(screenMesh)

        // Screen side tracks
        mkBox(0.04, SCREEN_H + 0.3, 0.06, -SCREEN_W / 2 - 0.1, SCREEN_Y, SCREEN_Z + 0.02, metalMat)
        mkBox(0.04, SCREEN_H + 0.3, 0.06, SCREEN_W / 2 + 0.1, SCREEN_Y, SCREEN_Z + 0.02, metalMat)

        // ── PROJECTOR (ceiling mounted) ──────────────────────────────────────────
        const projMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.7, roughness: 0.35 })
        // Projector body
        const projBody = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.38), projMat)
        projBody.position.set(0, RH - 0.55, 1.5); scene.add(projBody)
        // Lens
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.14, 12), darkMetal)
        lens.rotation.x = Math.PI / 2; lens.position.set(0, RH - 0.55, 1.32); scene.add(lens)
        // Lens glass
        const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.048, 12),
            new THREE.MeshStandardMaterial({ color: 0x1133cc, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.7 }))
        lensGlass.rotation.x = -Math.PI / 2 + Math.PI; lensGlass.position.set(0, RH - 0.55, 1.26); scene.add(lensGlass)
        // Mount arm
        const mountArm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), metalMat)
        mountArm.position.set(0, RH - 0.14, 1.5); scene.add(mountArm)
        // Ceiling mount plate
        mkBox(0.22, 0.04, 0.22, 0, RH - 0.04, 1.5, metalMat)

        // Projector beam (volumetric light cone approximation)
        const beamGeo = new THREE.ConeGeometry(0.05, 0.2, 8)
        const beamMesh = new THREE.Mesh(beamGeo,
            new THREE.MeshBasicMaterial({ color: 0x3355ff, transparent: true, opacity: 0.07, blending: THREE.AdditiveBlending, depthWrite: false }))
        beamMesh.rotation.x = Math.PI; beamMesh.position.set(0, RH - 0.65, 1.35); scene.add(beamMesh)

        // ── WHITEBOARD / CHALKBOARD (to side of screen) ─────────────────────────
        const wbW = 3.2, wbH = 1.8
        // Left whiteboard
        const wbMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a12, roughness: 0.85,
            emissive: 0x040408, emissiveIntensity: 0.3
        })
        const wbLeft = new THREE.Mesh(new THREE.PlaneGeometry(wbW, wbH), wbMat)
        wbLeft.position.set(-HW + 0.08, 2.4, -2); wbLeft.rotation.y = Math.PI / 2; scene.add(wbLeft)
        // Whiteboard frame
        mkBox(0.06, wbH + 0.12, wbW + 0.12, -HW + 0.1, 2.4, -2, metalMat, Math.PI / 2)

        // Marker tray
        mkBox(0.04, 0.06, wbW - 0.2, -HW + 0.12, 2.4 - wbH / 2 - 0.06, -2,
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }), Math.PI / 2)

        // ── CEILING LIGHTING GRID ────────────────────────────────────────────────
        const lightPanelMat = new THREE.MeshStandardMaterial({
            color: 0x222230, emissive: 0x8888cc, emissiveIntensity: 0.0, roughness: 0.9
        })
        const lightPanels: THREE.Mesh[] = []
        const panelPositions: { x: number; z: number }[] = []
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                const px = -6 + col * 4, pz = -6 + row * 5
                const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.35), lightPanelMat.clone())
                panel.rotation.x = Math.PI / 2; panel.position.set(px, RH - 0.02, pz); scene.add(panel)
                lightPanels.push(panel)
                panelPositions.push({ x: px, z: pz })
            }
        }

        // Recessed ceiling lights
        const ceilingLights: THREE.RectAreaLight[] = []
        panelPositions.forEach(({ x, z }) => {
            const rl = new THREE.PointLight(0xaab0cc, 18, 10, 1.8)
            rl.position.set(x, RH - 0.1, z); scene.add(rl)
        })

        // ── BACK-WALL ACCENT STRIP LIGHTING ─────────────────────────────────────
        // LED cove strip at bottom of back wall
        const coveStrip = new THREE.Mesh(new THREE.BoxGeometry(SCREEN_W + 2, 0.06, 0.06),
            new THREE.MeshStandardMaterial({ color: 0x1133aa, emissive: 0x2244cc, emissiveIntensity: 1.0 }))
        coveStrip.position.set(0, 0.28, -HD + 0.15); scene.add(coveStrip)
        const coveLight = new THREE.RectAreaLight(0x3355ff, 8, SCREEN_W + 2, 0.2)
        coveLight.position.set(0, 0.3, -HD + 0.18); coveLight.lookAt(0, 1, -HD + 0.18); scene.add(coveLight)

        // Side wall accent strips
        for (const sx of [-HW + 0.12, HW - 0.12]) {
            const strip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, RD - 2),
                new THREE.MeshStandardMaterial({ color: 0x001144, emissive: 0x1133aa, emissiveIntensity: 0.9 }))
            strip.position.set(sx, 0.22, 0); scene.add(strip)
        }

        // ── PROJECTOR LIGHT ONTO SCREEN ──────────────────────────────────────────
        const projLight = new THREE.SpotLight(0xffffff, 0, 20, Math.PI / 9, 0.08, 1.2)
        projLight.position.set(0, RH - 0.55, 1.5)
        projLight.target.position.set(0, SCREEN_Y, SCREEN_Z)
        projLight.castShadow = false; scene.add(projLight); scene.add(projLight.target)

        // Screen ambient glow (colored by current edu)
        const screenGlow = new THREE.PointLight(0x4a9eff, 22, 8, 1.5)
        screenGlow.position.set(0, SCREEN_Y, SCREEN_Z + 1.5); scene.add(screenGlow)

        // ── AMBIENT + FILL ───────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0x060810, 12))
        const fillLight = new THREE.DirectionalLight(0x1a1a44, 1.8)
        fillLight.position.set(4, RH, 6); fillLight.target.position.set(0, 2, 0); scene.add(fillLight); scene.add(fillLight.target)

        // ── DUST PARTICLES ───────────────────────────────────────────────────────
        const PC = 180
        const pGeo = new THREE.BufferGeometry()
        const pArr = new Float32Array(PC * 3)
        for (let i = 0; i < PC; i++) {
            pArr[i * 3] = (Math.random() - 0.5) * RW * 0.8
            pArr[i * 3 + 1] = Math.random() * RH
            pArr[i * 3 + 2] = (Math.random() - 0.5) * RD * 0.8
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3))
        const pMat = new THREE.PointsMaterial({ color: 0x8899cc, size: 0.022, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })
        scene.add(new THREE.Points(pGeo, pMat))

        // ── STATE ────────────────────────────────────────────────────────────────
        let idxRef = 0
        let currentAccent = new THREE.Color(EDUCATION_DATA[0].accentColor)

        const updateScreen = (idx: number) => {
            const edu = EDUCATION_DATA[idx]
            screenMat.map?.dispose()
            screenMat.map = makeProjectorScreen(edu)
            screenMat.map.needsUpdate = true
            screenMat.needsUpdate = true
            currentAccent = new THREE.Color(edu.accentColor)
            screenGlow.color.copy(currentAccent)
        }

        const updateIndex = (idx: number) => {
            idxRef = idx
            updateScreen(idx)
        }
            ; (mount as HTMLDivElement & { _updateIdx?: (i: number) => void })._updateIdx = updateIndex

        // ── ANIMATE ──────────────────────────────────────────────────────────────
        const clock = new THREE.Clock()
        let raf: number

        const animate = () => {
            raf = requestAnimationFrame(animate)
            if (!isActiveRef.current) return
            const t = clock.getElapsedTime()

            // Camera gentle bob + drift
            camera.position.x = Math.sin(t * 0.12) * 0.25
            camera.position.y = 2.2 + Math.sin(t * 0.22) * 0.06
            camera.lookAt(Math.sin(t * 0.08) * 0.3, 2.8, -8)

            // Projector glow pulse
            projLight.intensity = 0.5 + Math.sin(t * 0.4) * 0.15
            screenGlow.intensity = 20 + Math.sin(t * 0.9) * 4

            // Laptop screen subtle pulse
            lapScreen.material = lapScreen.material as THREE.MeshStandardMaterial
            ;(lapScreen.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.35 + Math.sin(t * 1.2) * 0.08

            // LED cove strip pulse
            ;(coveStrip.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.9 + Math.sin(t * 2) * 0.2

            // Dust drift
            const pp = pGeo.attributes.position.array as Float32Array
            for (let i = 0; i < PC; i++) {
                pp[i * 3] += Math.sin(t * 0.3 + i * 0.6) * 0.001
                pp[i * 3 + 1] += Math.sin(t * 0.2 + i * 0.8) * 0.0008
                pp[i * 3 + 2] += Math.cos(t * 0.25 + i * 0.5) * 0.001
                if (pp[i * 3 + 1] > RH) pp[i * 3 + 1] = 0
                if (pp[i * 3 + 1] < 0) pp[i * 3 + 1] = RH
            }
            pGeo.attributes.position.needsUpdate = true

            // Beam subtle pulsing scale
            beamMesh.scale.set(1 + Math.sin(t * 3) * 0.04, 1, 1 + Math.sin(t * 3) * 0.04)

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

    const edu = EDUCATION_DATA[currentIndex]

    return (
        <div className="relative w-full h-full bg-black overflow-hidden select-none">
            <div ref={mountRef} className="absolute inset-0" />

            {/* Screen overlay vignette */}
            <div className="pointer-events-none absolute inset-0 z-10"
                style={{ background: 'radial-gradient(ellipse at 50% 30%, transparent 35%, rgba(0,0,0,0.88) 100%)' }} />
            <div className="pointer-events-none absolute inset-0 z-10"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 10%, transparent 78%, rgba(0,0,0,0.97) 100%)' }} />

            {/* Header */}
            <div className="pointer-events-none absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-5">
                    <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${edu.accentColor}55)` }} />
                    <h2 className="text-4xl md:text-5xl tracking-[0.22em] uppercase"
                        style={{ fontFamily: '"Georgia","Times New Roman",serif', color: edu.accentColor, textShadow: `0 0 40px ${edu.accentColor}44`, transition: 'color 0.8s, text-shadow 0.8s' }}>
                        Education
                    </h2>
                    <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${edu.accentColor}55)` }} />
                </div>
                <p className="text-[9px] tracking-[0.55em] uppercase font-mono" style={{ color: 'rgba(160,180,200,0.38)' }}>
                    Academic Record  ·  Alen James
                </p>
            </div>

            {/* Bottom info panel */}
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-6" key={currentIndex}
                style={{ animation: 'slideUp 0.55s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div className="p-6" style={{
                    background: 'linear-gradient(160deg, rgba(4,6,14,0.97), rgba(2,4,10,0.95))',
                    border: `1px solid ${edu.accentColor}22`,
                    boxShadow: `0 0 80px ${edu.accentColor}0e, inset 0 0 40px rgba(0,0,0,0.6)`,
                }}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-[9px] tracking-[0.6em] uppercase font-mono mb-1.5" style={{ color: `${edu.accentColor}55` }}>
                                {edu.year}  ·  {currentIndex + 1} / {EDUCATION_DATA.length}
                            </p>
                            <h3 className="text-2xl font-bold mb-0.5" style={{ fontFamily: '"Georgia",serif', color: edu.accentColor, textShadow: `0 0 24px ${edu.accentColor}44` }}>
                                {edu.degree}
                            </h3>
                            <p className="text-sm font-mono" style={{ color: 'rgba(160,180,200,0.55)' }}>
                                {edu.institution}  ·  {edu.field}
                            </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-6">
                            {edu.gpa && (
                                <div className="mb-1.5">
                                    <p className="text-[9px] tracking-[0.5em] uppercase font-mono" style={{ color: `${edu.accentColor}44` }}>GPA</p>
                                    <p className="text-xl font-bold font-mono" style={{ color: edu.accentColor }}>{edu.gpa}</p>
                                </div>
                            )}
                            {edu.honors && (
                                <p className="text-[10px] tracking-widest uppercase font-mono" style={{ color: `${edu.accentColor}66` }}>{edu.honors}</p>
                            )}
                        </div>
                    </div>

                    <div className="h-px mb-4" style={{ background: `linear-gradient(to right, ${edu.accentColor}44, transparent)` }} />

                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(190,200,220,0.65)', fontFamily: '"Georgia",serif', lineHeight: 1.9 }}>
                        {edu.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {edu.courses.map((c, i) => (
                            <span key={i} className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase"
                                style={{ border: `1px solid ${edu.accentColor}22`, color: `${edu.accentColor}66`, background: `${edu.accentColor}08` }}>
                                {c}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 flex items-center gap-8">
                <button onClick={goPrev}
                    className="flex items-center gap-2 px-5 py-2.5 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300"
                    style={{ border: `1px solid ${edu.accentColor}28`, color: `${edu.accentColor}44`, background: 'rgba(2,4,12,0.85)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = edu.accentColor; (e.currentTarget as HTMLButtonElement).style.borderColor = `${edu.accentColor}88` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = `${edu.accentColor}44`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${edu.accentColor}28` }}>
                    ← Prev
                </button>
                <div className="flex gap-3 items-center">
                    {EDUCATION_DATA.map((e, i) => (
                        <button key={i} onClick={() => setCurrentIndex(i)}
                            className="transition-all duration-400 rounded-full"
                            style={{
                                width: i === currentIndex ? 10 : 6,
                                height: i === currentIndex ? 10 : 6,
                                background: i === currentIndex ? e.accentColor : 'rgba(160,180,220,0.15)',
                                boxShadow: i === currentIndex ? `0 0 10px ${e.accentColor}88` : 'none',
                            }} />
                    ))}
                </div>
                <button onClick={goNext}
                    className="flex items-center gap-2 px-5 py-2.5 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300"
                    style={{ border: `1px solid ${edu.accentColor}28`, color: `${edu.accentColor}44`, background: 'rgba(2,4,12,0.85)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = edu.accentColor; (e.currentTarget as HTMLButtonElement).style.borderColor = `${edu.accentColor}88` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = `${edu.accentColor}44`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${edu.accentColor}28` }}>
                    Next →
                </button>
            </div>

            {/* Exit */}
            <button
                onClick={() => window.dispatchEvent(new CustomEvent('exit-room'))}
                className="absolute top-8 left-8 z-20 px-5 py-2 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300"
                style={{ border: '1px solid rgba(160,180,220,0.15)', color: 'rgba(160,180,220,0.3)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(200,220,255,0.8)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,220,255,0.45)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(160,180,220,0.3)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(160,180,220,0.15)' }}>
                ← Exit
            </button>

            {/* Projector indicator dot */}
            <div className="pointer-events-none absolute top-8 right-8 z-20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: edu.accentColor, boxShadow: `0 0 8px ${edu.accentColor}`, animation: 'blink 2s ease-in-out infinite' }} />
                <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: 'rgba(160,180,200,0.28)' }}>PROJECTING</span>
            </div>

            <style>{`
        @keyframes slideUp {
          0%  { opacity:0; transform:translate(-50%, 14px); }
          100%{ opacity:1; transform:translate(-50%, 0); }
        }
        @keyframes blink {
          0%,100%{ opacity:1; } 50%{ opacity:0.2; }
        }
      `}</style>
        </div>
    )
}
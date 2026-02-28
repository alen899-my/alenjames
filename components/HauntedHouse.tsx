'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { usePerformance } from '@/lib/usePerformance'

export default function HauntedHouse({ isActive = true }: { isActive?: boolean }) {
  const isActiveRef = useRef(isActive)
  useEffect(() => { isActiveRef.current = isActive }, [isActive])

  const mountRef = useRef<HTMLDivElement>(null)
  const isDoorOpenRef = useRef(false)
  const animatingRef = useRef(false)
  const doorPivotRef = useRef<THREE.Group | null>(null)
  const perf = usePerformance()

  const [doorOpen, setDoorOpen] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let W = mount.clientWidth
    let H = mount.clientHeight
    let aspect = W / H
    let isMobile = W < 768

    // ── RENDERER ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: perf.tier === 'high', // Only antialias on high-tier
      alpha: false,
      powerPreference: 'high-performance'
    })
    renderer.setSize(W, H)
    renderer.setPixelRatio(perf.pixelRatio)
    renderer.shadowMap.enabled = perf.shadows
    renderer.shadowMap.type = perf.tier === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.85
    mount.appendChild(renderer.domElement)

    // ── SCENE & FOG ───────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x030108)
    scene.fog = new THREE.FogExp2(0x030108, 0.05)

    // ── PERSPECTIVE CAMERA ───────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(isMobile ? 65 : 45, aspect, 0.1, 100)
    // Base camera positions
    const camBaseX = 0
    const camBaseY = isMobile ? 3 : 2.5
    const camBaseZ = isMobile ? 11 : 12
    camera.position.set(camBaseX, camBaseY, camBaseZ)
    camera.lookAt(0, 2, 0)

    // ── TEXTURE GENERATORS (ALBEDO + BUMP) ──────────────────────────────
    function makeBrickTextures() {
      const texSize = 1024 * perf.textureScale
      const c = document.createElement('canvas'); c.width = c.height = texSize
      const b = document.createElement('canvas'); b.width = b.height = texSize
      const ctx = c.getContext('2d')!; const btx = b.getContext('2d')!

      ctx.fillStyle = '#110822'; ctx.fillRect(0, 0, 1024, 1024)
      btx.fillStyle = '#111111'; btx.fillRect(0, 0, 1024, 1024)

      const bw = 100, bh = 45
      for (let row = 0; row < 1024 / bh + 1; row++) {
        const off = row % 2 === 0 ? 0 : bw / 2
        for (let col = -1; col < 1024 / bw + 1; col++) {
          const x = col * bw + off, y = row * bh
          const s = 0.6 + Math.random() * 0.4

          // Color
          ctx.fillStyle = `rgb(${~~(45 * s)},${~~(20 * s)},${~~(65 * s)})`
          ctx.fillRect(x + 2, y + 2, bw - 4, bh - 4)
          ctx.fillStyle = `rgba(5,2,10,${Math.random() * 0.6})`
          ctx.fillRect(x + 2, y + 2, bw - 4, bh - 4)

          // Bump (white = high)
          const bs = 100 + Math.random() * 100
          btx.fillStyle = `rgb(${bs},${bs},${bs})`
          btx.fillRect(x + 2, y + 2, bw - 4, bh - 4)
          // Bevels
          btx.strokeStyle = '#222'; btx.lineWidth = 4
          btx.strokeRect(x + 4, y + 4, bw - 8, bh - 8)
        }
      }

      // Add cracks globally
      ctx.strokeStyle = 'rgba(5,2,10,0.9)'; ctx.lineWidth = 3
      btx.strokeStyle = '#000000'; btx.lineWidth = 3
      for (let i = 0; i < 8; i++) {
        let cx = Math.random() * 1024, cy = Math.random() * 1024
        ctx.beginPath(); btx.beginPath()
        ctx.moveTo(cx, cy); btx.moveTo(cx, cy)
        for (let j = 0; j < 5; j++) {
          cx += (Math.random() - 0.5) * 150; cy += (Math.random() - 0.2) * 150
          ctx.lineTo(cx, cy); btx.lineTo(cx, cy)
        }
        ctx.stroke(); btx.stroke()
      }

      const map = new THREE.CanvasTexture(c)
      const bump = new THREE.CanvasTexture(b)
      map.wrapS = map.wrapT = bump.wrapS = bump.wrapT = THREE.RepeatWrapping
      return { map, bump }
    }

    function makeWoodTextures() {
      const texW = 512 * perf.textureScale
      const texH = 1024 * perf.textureScale
      const c = document.createElement('canvas'); c.width = texW; c.height = texH
      const b = document.createElement('canvas'); b.width = texW; b.height = texH
      const ctx = c.getContext('2d')!; const btx = b.getContext('2d')!

      const grad = ctx.createLinearGradient(0, 0, 512, 0)
      grad.addColorStop(0, '#331544'); grad.addColorStop(0.5, '#4a2260'); grad.addColorStop(1, '#331544')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 1024)
      btx.fillStyle = '#888'; btx.fillRect(0, 0, 512, 1024)

      // Wood grain
      for (let y = 0; y < 1024; y += 3) {
        let op = 0.1 + Math.random() * 0.1
        ctx.strokeStyle = `rgba(10,5,20,${op})`
        ctx.beginPath(); ctx.moveTo(0, y + Math.sin(y * 0.05) * 10); ctx.lineTo(512, y + Math.sin(y * 0.05 + 2) * 10); ctx.stroke()

        let bop = 100 + Math.random() * 50
        btx.strokeStyle = `rgb(${bop},${bop},${bop})`
        btx.beginPath(); btx.moveTo(0, y + Math.sin(y * 0.05) * 10); btx.lineTo(512, y + Math.sin(y * 0.05 + 2) * 10); btx.stroke()
      }

      // Panels
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; btx.fillStyle = '#222'
      // Top glass cutout
      ctx.fillRect(64, 64, 384, 350); btx.fillRect(64, 64, 384, 350)
      // Bottom panel
      ctx.fillRect(64, 480, 384, 480); btx.fillRect(64, 480, 384, 480)

      ctx.fillStyle = 'rgba(255,255,255,0.05)'; btx.fillStyle = '#aaa'
      ctx.fillRect(84, 500, 344, 440); btx.fillRect(84, 500, 344, 440)

      // High-visibility paint text on the bottom panel
      ctx.textAlign = 'center'
      btx.textAlign = 'center'

      const drawText = (txt: string, size: number, y: number) => {
        ctx.font = `900 ${size}px Arial, sans-serif` // Arial for maximum clarity
        btx.font = `900 ${size}px Arial, sans-serif`

        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)' // strong dark shadow for contrast
        ctx.shadowBlur = 8
        ctx.fillStyle = '#ffffff' // crisp white
        ctx.fillText(txt, 256, y)
        ctx.shadowBlur = 0 // reset

        // draw as thick paint in bump map (brighter)
        btx.fillStyle = '#fff'
        btx.fillText(txt, 256, y)
      }

      drawText('ALEN JAMES', 44, 630)
      drawText('IS INSIDE THE HOUSE.', 22, 690)
      drawText('CHECK HIM OUT!', 22, 730)

      return { map: new THREE.CanvasTexture(c), bump: new THREE.CanvasTexture(b) }
    }

    function makeGhostTex() {
      const c = document.createElement('canvas'); c.width = c.height = 512
      const ctx = c.getContext('2d')!
      ctx.fillStyle = '#06020f'; ctx.fillRect(0, 0, 512, 512)

      const glow = ctx.createRadialGradient(256, 256, 20, 256, 256, 256)
      glow.addColorStop(0, 'rgba(100,60,200,1)')
      glow.addColorStop(0.5, 'rgba(40,20,100,0.6)')
      glow.addColorStop(1, 'rgba(5,2,10,0)')
      ctx.fillStyle = glow; ctx.fillRect(0, 0, 512, 512)

      // Ghost figure
      ctx.fillStyle = 'rgba(230,220,255,0.8)'
      ctx.beginPath(); ctx.ellipse(256, 180, 50, 65, 0, 0, Math.PI * 2); ctx.fill()

      const bodyG = ctx.createLinearGradient(0, 240, 0, 500)
      bodyG.addColorStop(0, 'rgba(230,220,255,0.7)')
      bodyG.addColorStop(1, 'rgba(200,180,255,0)')
      ctx.fillStyle = bodyG
      ctx.beginPath(); ctx.moveTo(206, 240); ctx.quadraticCurveTo(180, 350, 210, 500);
      ctx.lineTo(302, 500); ctx.quadraticCurveTo(332, 350, 306, 240); ctx.fill()

      // Eyes
      ctx.fillStyle = '#020005'
      ctx.beginPath(); ctx.ellipse(235, 175, 10, 16, -0.1, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(277, 175, 10, 16, 0.1, 0, Math.PI * 2); ctx.fill()

      return new THREE.CanvasTexture(c)
    }

    // ── MATERIALS ────────────────────────────────────────────────────────
    const brickT = makeBrickTextures()
    brickT.map.repeat.set(6, 4); brickT.bump.repeat.set(6, 4)

    const wallMat = new THREE.MeshStandardMaterial({
      map: brickT.map, bumpMap: brickT.bump, bumpScale: 0.15,
      roughness: 0.9, metalness: 0.1
    })
    const woodT = makeWoodTextures()
    const doorMat = new THREE.MeshStandardMaterial({
      map: woodT.map, bumpMap: woodT.bump, bumpScale: 0.05,
      roughness: 0.7, metalness: 0.1
    })
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x5a2a6a, roughness: 0.6 })
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x050211, metalness: 0.9, roughness: 0.1,
      transparent: true, opacity: 0.6, envMapIntensity: 1.0
    })

    // ── LAYOUT CONFIG ────────────────────────────────────────────────────
    // Mobile: Stack vertically. Desktop: Side by side.
    const winX = isMobile ? 0 : -3.5
    const winY = isMobile ? 5.5 : 3.0
    const doorX = isMobile ? 0 : 2.0
    const doorY = 0

    // ── GEOMETRY ─────────────────────────────────────────────────────────
    // 1. Wall
    const wallGeo = new THREE.PlaneGeometry(30, 20)
    const wall = new THREE.Mesh(wallGeo, wallMat)
    wall.position.set(0, 5, -0.5)
    wall.receiveShadow = true
    scene.add(wall)

    const floorGeo = new THREE.PlaneGeometry(30, 10)
    const floor = new THREE.Mesh(floorGeo, wallMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.set(0, 0, 4)
    floor.receiveShadow = true
    scene.add(floor)

    // 2. Door Setup
    const doorW = 3.2, doorH = 6.0, doorD = 0.2

    // Door Frame
    const frameD = 0.6, frameT = 0.3
    const jambL = new THREE.Mesh(new THREE.BoxGeometry(frameT, doorH + frameT, frameD), frameMat)
    jambL.position.set(doorX - doorW / 2 - frameT / 2, doorH / 2, 0); jambL.castShadow = true; scene.add(jambL)
    const jambR = new THREE.Mesh(new THREE.BoxGeometry(frameT, doorH + frameT, frameD), frameMat)
    jambR.position.set(doorX + doorW / 2 + frameT / 2, doorH / 2, 0); jambR.castShadow = true; scene.add(jambR)
    const hdr = new THREE.Mesh(new THREE.BoxGeometry(doorW + frameT * 2, frameT, frameD), frameMat)
    hdr.position.set(doorX, doorH + frameT / 2, 0); hdr.castShadow = true; scene.add(hdr)

    const step = new THREE.Mesh(new THREE.BoxGeometry(doorW + 1.5, 0.4, 1.5), frameMat)
    step.position.set(doorX, 0.2, 0.5); step.castShadow = true; step.receiveShadow = true; scene.add(step)

    // Door Pivot & Panel
    const doorPivot = new THREE.Group()
    doorPivot.position.set(doorX - doorW / 2, 0.4, 0) // hinge left

    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH - 0.1, doorD), doorMat)
    doorPanel.position.set(doorW / 2, doorH / 2 - 0.05, 0) // shift relative to pivot
    doorPanel.castShadow = true
    doorPanel.receiveShadow = true
    doorPivot.add(doorPanel)

    // Handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), new THREE.MeshStandardMaterial({ color: 0xddddff, metalness: 0.9, roughness: 0.2 }))
    handle.rotation.z = Math.PI / 2
    handle.position.set(doorW - 0.4, doorH / 2, doorD / 2 + 0.1)
    handle.castShadow = true
    doorPivot.add(handle)

    // Inside Darkness Room (behind door)
    const insideRoom = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 2), new THREE.MeshBasicMaterial({ color: 0x000000 }))
    insideRoom.position.set(doorX, doorH / 2 + 0.4, -1.2)
    scene.add(insideRoom)

    // Glowing ghostly map visible when door opens
    const glowPl = new THREE.Mesh(new THREE.PlaneGeometry(doorW, doorH), new THREE.MeshBasicMaterial({ color: 0x4400aa, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }))
    glowPl.position.set(doorX, doorH / 2 + 0.4, -0.4)
    scene.add(glowPl)

    doorPivotRef.current = doorPivot
    scene.add(doorPivot)

    // ── LAMP ABOVE DOOR ──────────────────────────────────────────────────
    const lampGroup = new THREE.Group()
    lampGroup.position.set(doorX, doorH + 1.2, 0.5)

    // Lamp fixture / bracket
    const bracketMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.7 })
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.4), bracketMat)
    bracket.position.set(0, 0, -0.2)
    lampGroup.add(bracket)

    const lampTop = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.3, 4), bracketMat)
    lampTop.position.set(0, 0.15, 0)
    lampGroup.add(lampTop)

    // Glowing bulb
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 })
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), bulbMat)
    bulb.position.set(0, -0.1, 0)
    lampGroup.add(bulb)

    // Light source
    const lampLight = new THREE.PointLight(0xffcc77, 16, 15) // Much brighter, slightly wider cast
    lampLight.position.set(0, -0.2, 0)
    lampLight.castShadow = perf.tier !== 'low' // Disable some shadows on low tier
    lampLight.shadow.bias = -0.001
    lampLight.shadow.mapSize.width = perf.shadowMapSize
    lampLight.shadow.mapSize.height = perf.shadowMapSize
    lampGroup.add(lampLight)

    scene.add(lampGroup)

    // 3. Window Setup
    const winW = 2.8, winH = 4.0
    // Window cut out (hide brick by placing a black box and glowing plane)
    const winHole = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshBasicMaterial({ color: 0x010005 }))
    winHole.position.set(winX, winY, -0.48)
    scene.add(winHole)

    const ghostPlane = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshBasicMaterial({ map: makeGhostTex() }))
    ghostPlane.position.set(winX, winY, -0.45)
    scene.add(ghostPlane)

    const wFrameT = 0.2, wFrameD = 0.4
    const wfMat = frameMat
    const wfTop = new THREE.Mesh(new THREE.BoxGeometry(winW + wFrameT * 2, wFrameT, wFrameD), wfMat)
    wfTop.position.set(winX, winY + winH / 2 + wFrameT / 2, 0); wfTop.castShadow = true; scene.add(wfTop)
    const wfBot = new THREE.Mesh(new THREE.BoxGeometry(winW + wFrameT * 2, wFrameT, wFrameD + 0.2), wfMat)
    wfBot.position.set(winX, winY - winH / 2 - wFrameT / 2, 0.1); wfBot.castShadow = true; scene.add(wfBot)
    const wfL = new THREE.Mesh(new THREE.BoxGeometry(wFrameT, winH, wFrameD), wfMat)
    wfL.position.set(winX - winW / 2 - wFrameT / 2, winY, 0); wfL.castShadow = true; scene.add(wfL)
    const wfR = new THREE.Mesh(new THREE.BoxGeometry(wFrameT, winH, wFrameD), wfMat)
    wfR.position.set(winX + winW / 2 + wFrameT / 2, winY, 0); wfR.castShadow = true; scene.add(wfR)

    // Window Glass and Mullions
    const pane1 = new THREE.Mesh(new THREE.PlaneGeometry(winW / 2 - 0.1, winH - 0.2), glassMat)
    pane1.position.set(winX - winW / 4, winY, 0.05); scene.add(pane1)
    const pane2 = new THREE.Mesh(new THREE.PlaneGeometry(winW / 2 - 0.1, winH - 0.2), glassMat)
    pane2.position.set(winX + winW / 4, winY, 0.05); scene.add(pane2)

    const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.15, winH, 0.1), wfMat)
    mullionV.position.set(winX, winY, 0.1); mullionV.castShadow = true; scene.add(mullionV)
    const mullionH = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.15, 0.1), wfMat)
    mullionH.position.set(winX, winY + 0.4, 0.1); mullionH.castShadow = true; scene.add(mullionH)

    // ── LIGHTING ─────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x110a22, 1.5))

    // Main Moonlight (Directional + Shadows)
    const moon = new THREE.DirectionalLight(0x5566aa, 1.5)
    moon.position.set(-6, 12, 10)
    moon.castShadow = perf.shadows
    moon.shadow.mapSize.width = perf.shadowMapSize; moon.shadow.mapSize.height = perf.shadowMapSize
    moon.shadow.camera.near = 0.5; moon.shadow.camera.far = 30
    moon.shadow.bias = -0.001
    scene.add(moon)

    // Window supernatural glow (PointLight)
    const winGlowL = new THREE.PointLight(0x8833ff, 4, 10, 2)
    winGlowL.position.set(winX, winY, 1.5)
    scene.add(winGlowL)

    // Spooky volumetric spotlight from window hitting ground
    const spot = new THREE.SpotLight(0x6622ff, 6, 20, Math.PI / 6, 0.8, 1.5)
    spot.position.set(winX, winY, 0.5)
    spot.target.position.set(winX + 2, 0, 4)
    spot.castShadow = true
    scene.add(spot); scene.add(spot.target)

    const doorGlowL = new THREE.PointLight(0xff0000, 0, 15, 2)
    doorGlowL.position.set(doorX, 3, 1)
    scene.add(doorGlowL)

    // ── PARTICLES (DUST/MAGIC) ───────────────────────────────────────────
    const pCount = Math.floor((isMobile ? 150 : 400) * perf.particlesScale)
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 20
      pPos[i * 3 + 1] = Math.random() * 10
      pPos[i * 3 + 2] = Math.random() * 15
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({ color: 0xaa88ff, size: 0.05, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // ── INTERACTIONS ─────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const targetCamOffset = new THREE.Vector2(0, 0)

    const onPointerMove = (e: any) => {
      let cx, cy
      if (e.type && e.type.includes('mouse')) {
        cx = e.clientX; cy = e.clientY
      } else if (e.touches && e.touches.length > 0) {
        cx = e.touches[0].clientX; cy = e.touches[0].clientY
      } else {
        return
      }
      const rect = mount.getBoundingClientRect()
      mouse.x = ((cx - rect.left) / rect.width) * 2 - 1
      mouse.y = -((cy - rect.top) / rect.height) * 2 + 1

      // Parallax Target
      targetCamOffset.x = mouse.x * 1.5
      targetCamOffset.y = mouse.y * 1.5

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObject(doorPanel)
      const isHover = hits.length > 0
      mount.style.cursor = isHover ? 'pointer' : 'default'
    }

    let lastTapTime = 0
    const onClick = () => {
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObject(doorPanel)
      const inDoor = hits.length > 0

      const now = Date.now()
      const isDouble = now - lastTapTime < 350
      lastTapTime = now

      if (inDoor && !animatingRef.current) {
        animatingRef.current = true
        isDoorOpenRef.current = !isDoorOpenRef.current
        setDoorOpen(isDoorOpenRef.current)
      }

      // Mobile Quick Entry: Double tap anywhere (or on door) to enter
      if (isDouble && isMobile) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }
    }

    mount.addEventListener('mousemove', onPointerMove)
    mount.addEventListener('touchmove', onPointerMove, { passive: true })
    mount.addEventListener('click', onClick)

    // ── RESIZING ─────────────────────────────────────────────────────────
    const onResize = () => {
      W = mount.clientWidth; H = mount.clientHeight
      isMobile = W < 768
      camera.aspect = W / H
      camera.fov = isMobile ? 65 : 45
      camera.updateProjectionMatrix()
      renderer.setSize(W, H)

      targetCamOffset.set(0, 0)
    }
    window.addEventListener('resize', onResize)

    // ── ANIMATION LOOP ───────────────────────────────────────────────────
    const clock = new THREE.Clock()
    let raf: number
    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Parallax camera easing
      camera.position.x += (camBaseX + targetCamOffset.x - camera.position.x) * 0.05
      camera.position.y += (camBaseY + targetCamOffset.y - camera.position.y) * 0.05
      camera.lookAt(camBaseX, 3, 0)

      // Door Animation
      if (doorPivotRef.current) {
        const targetRot = isDoorOpenRef.current ? -Math.PI * 0.65 : 0
        doorPivotRef.current.rotation.y += (targetRot - doorPivotRef.current.rotation.y) * 0.08
        if (Math.abs(targetRot - doorPivotRef.current.rotation.y) < 0.01) animatingRef.current = false
      }

      // Lighting Animation
      winGlowL.intensity = 3 + Math.sin(t * 3) * 1 + Math.sin(t * 8) * 0.5
      spot.intensity = 5 + Math.sin(t * 2.5) * 1.5

      // Lamp flickering
      lampLight.intensity = 8 + Math.random() * 1.0 + Math.sin(t * 15) * 0.8

      const targetDoorInt = isDoorOpenRef.current ? 15 : 0
      doorGlowL.color.setHex(isDoorOpenRef.current ? 0xcc1122 : 0x4400aa)
      doorGlowL.intensity += (targetDoorInt - doorGlowL.intensity) * 0.1
      glowPl.material.opacity += ((isDoorOpenRef.current ? 0.9 : 0) - glowPl.material.opacity) * 0.05

      // Particles
      const pp = pGeo.attributes.position.array
      for (let i = 0; i < pCount; i++) {
        pp[i * 3 + 1] -= 0.01
        pp[i * 3] += Math.sin(t * 0.5 + i) * 0.005
        if (pp[i * 3 + 1] < 0) pp[i * 3 + 1] = 10
      }
      pGeo.attributes.position.needsUpdate = true

      if (isActiveRef.current) {
        renderer.render(scene, camera)
      }
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      mount.removeEventListener('mousemove', onPointerMove)
      mount.removeEventListener('touchmove', onPointerMove)
      mount.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)

      // Dispose geometries/materials to prevent memory leaks
      wallGeo.dispose(); wallMat.dispose();
      doorMat.dispose(); frameMat.dispose(); glassMat.dispose();
      brickT.map.dispose(); brickT.bump.dispose();
      woodT.map.dispose(); woodT.bump.dispose();
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Heavy vignette for horror framing */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.95) 100%)' }}
      />

      {/* Scroll to enter indicator */}
      {!doorOpen && (
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
          style={{ animation: 'fadeUp 1s ease-out forwards, pulseSlow 2.5s ease-in-out infinite alternate' }}
        >
          <span className="text-white/60 text-xs md:text-sm tracking-[0.4em] uppercase font-mono mb-3 text-center" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            Scroll to Enter
          </span>
          <div className="w-[1px] h-10 md:h-16 bg-gradient-to-b from-white/60 to-transparent"></div>
        </div>
      )}

      {/* Door-open dramatic message */}
      {doorOpen && (
        <div
          className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center
            text-red-500/90 text-2xl md:text-4xl tracking-[0.4em] uppercase font-mono font-bold whitespace-nowrap"
          style={{ animation: 'fadeDown 1.5s ease-out forwards', textShadow: '0 0 30px rgba(255,0,0,0.8), 0 0 10px rgba(255,0,0,0.5)' }}
        >
          Do not look behind you.
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translate(-50%, 15px); }
          to   { opacity:1; transform:translate(-50%, 0); }
        }
        @keyframes fadeDown {
          from { opacity:0; transform:translateY(-20px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes pulseSlow {
          from { opacity: 0.3; transform: translate(-50%, 5px); }
          to { opacity: 1; transform: translate(-50%, 0px); }
        }
      `}</style>
    </div>
  )
}
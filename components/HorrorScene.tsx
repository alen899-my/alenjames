'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'

export default function HorrorScene() {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const [isLocked, setIsLocked] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [jumpScare, setJumpScare] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const [lightning, setLightning] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── RENDERER ──
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ReinhardToneMapping
    renderer.toneMappingExposure = 0.3
    mount.appendChild(renderer.domElement)

    // ── SCENE ──
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.FogExp2(0x0a0005, 0.06)
    sceneRef.current = scene

    // ── CAMERA ──
    const camera = new THREE.PerspectiveCamera(85, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 1.7, 8)

    // ── CONTROLS ──
    const controls = new PointerLockControls(camera, renderer.domElement)
    controls.onLock = () => setIsLocked(true)
    controls.onUnlock = () => setIsLocked(false)

    // Movement
    const keys = {}
    const onKeyDown = (e) => { keys[e.code] = true }
    const onKeyUp = (e) => { keys[e.code] = false }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    // ── TEXTURES (procedural) ──
    function makeWallTexture(color1, color2) {
      const c = document.createElement('canvas')
      c.width = c.height = 512
      const ctx = c.getContext('2d')
      ctx.fillStyle = color1
      ctx.fillRect(0, 0, 512, 512)
      for (let i = 0; i < 800; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? color2 : 'rgba(0,0,0,0.3)'
        const x = Math.random() * 512, y = Math.random() * 512
        const w = 2 + Math.random() * 6, h = 2 + Math.random() * 6
        ctx.fillRect(x, y, w, h)
      }
      // crack lines
      for (let i = 0; i < 12; i++) {
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        ctx.lineWidth = Math.random() * 1.5
        ctx.beginPath()
        ctx.moveTo(Math.random() * 512, Math.random() * 512)
        ctx.lineTo(Math.random() * 512, Math.random() * 512)
        ctx.stroke()
      }
      return new THREE.CanvasTexture(c)
    }

    function makeFloorTexture() {
      const c = document.createElement('canvas')
      c.width = c.height = 512
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#0d0a08'
      ctx.fillRect(0, 0, 512, 512)
      // planks
      for (let y = 0; y < 512; y += 40) {
        ctx.fillStyle = `rgba(${10 + Math.random()*10},${5 + Math.random()*5},0,0.8)`
        ctx.fillRect(0, y, 512, 38)
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.strokeRect(0, y, 512, 38)
      }
      // stains
      for (let i = 0; i < 20; i++) {
        const g = ctx.createRadialGradient(
          Math.random()*512, Math.random()*512, 0,
          Math.random()*512, Math.random()*512, 30 + Math.random()*40
        )
        g.addColorStop(0, 'rgba(80,0,0,0.4)')
        g.addColorStop(1, 'transparent')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 512, 512)
      }
      return new THREE.CanvasTexture(c)
    }

    const wallTex = makeWallTexture('#1a1410', '#252018')
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping
    wallTex.repeat.set(3, 2)

    const floorTex = makeFloorTexture()
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping
    floorTex.repeat.set(4, 4)

    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95, metalness: 0 })
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 1, metalness: 0 })
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x080608, roughness: 1 })

    // ── ROOM BUILDER ──
    function makeRoom(w, h, d, px, py, pz) {
      const group = new THREE.Group()
      // floor
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat)
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      group.add(floor)
      // ceiling
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ceilMat)
      ceil.rotation.x = Math.PI / 2
      ceil.position.y = h
      group.add(ceil)
      // walls
      const wallGeo = [
        { geo: new THREE.PlaneGeometry(w, h), y: h/2, z: -d/2, ry: 0 },
        { geo: new THREE.PlaneGeometry(w, h), y: h/2, z:  d/2, ry: Math.PI },
        { geo: new THREE.PlaneGeometry(d, h), y: h/2, x: -w/2, ry:  Math.PI/2 },
        { geo: new THREE.PlaneGeometry(d, h), y: h/2, x:  w/2, ry: -Math.PI/2 },
      ]
      wallGeo.forEach(({ geo, y=0, x=0, z=0, ry }) => {
        const m = new THREE.Mesh(geo, wallMat)
        m.position.set(x, y, z)
        m.rotation.y = ry
        m.receiveShadow = true
        group.add(m)
      })
      group.position.set(px, py, pz)
      return group
    }

    // Main hallway
    scene.add(makeRoom(5, 3.5, 20, 0, 0, 0))
    // Side room left
    scene.add(makeRoom(7, 3.5, 7, -6, 0, -5))
    // Side room right
    scene.add(makeRoom(6, 3.5, 6, 5.5, 0, -3))
    // Back room (the scary one)
    scene.add(makeRoom(8, 3.5, 8, 0, 0, -18))

    // ── PROPS ──
    // Broken door frames
    function makeDoorFrame(x, y, z, ry = 0) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x1a0f08, roughness: 0.9 })
      const g = new THREE.Group()
      const left = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3, 0.15), mat)
      left.position.x = -0.6
      const right = left.clone(); right.position.x = 0.6
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.15, 0.15), mat)
      top.position.y = 1.5
      g.add(left, right, top)
      g.position.set(x, y, z)
      g.rotation.y = ry
      scene.add(g)
    }
    makeDoorFrame(0, 0, -5)
    makeDoorFrame(-3.5, 0, -5, Math.PI/2)
    makeDoorFrame(2.5, 0, -3, -Math.PI/2)
    makeDoorFrame(0, 0, -12)

    // Creepy furniture silhouettes
    function makeChair(x, z) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x0d0a07, roughness: 1 })
      const g = new THREE.Group()
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.7), mat)
      seat.position.y = 0.5
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.08), mat)
      back.position.set(0, 0.9, -0.3)
      const legs = [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]
      const legGroup = legs.map(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), mat)
        leg.position.set(lx, 0.25, lz)
        return leg
      })
      g.add(seat, back, ...legGroup)
      g.position.set(x, 0, z)
      g.rotation.y = Math.random() * Math.PI
      scene.add(g)
    }
    makeChair(-5, -4)
    makeChair(4, -2)
    makeChair(-4, -6)
    makeChair(1, -16)
    makeChair(-1, -19)

    // Old table
    function makeTable(x, z) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x100c08, roughness: 1 })
      const g = new THREE.Group()
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.9), mat)
      top.position.y = 0.75
      const legs = [[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]]
      legs.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), mat)
        leg.position.set(lx, 0.375, lz)
        g.add(leg)
      })
      g.add(top)
      g.position.set(x, 0, z)
      g.rotation.y = Math.random() * 0.3
      scene.add(g)
    }
    makeTable(-4.5, -5.5)
    makeTable(4, -3)

    // Creepy paintings (dark rectangles on walls)
    function makePainting(x, y, z, ry) {
      const geo = new THREE.PlaneGeometry(1.2, 0.9)
      const c = document.createElement('canvas')
      c.width = 256; c.height = 192
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#050305'
      ctx.fillRect(0, 0, 256, 192)
      // abstract face shape
      const grd = ctx.createRadialGradient(128, 96, 10, 128, 96, 80)
      grd.addColorStop(0, 'rgba(60,0,0,0.8)')
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, 256, 192)
      // eyes
      ctx.fillStyle = 'rgba(150,0,0,0.9)'
      ctx.beginPath(); ctx.ellipse(96, 80, 18, 8, 0, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(160, 80, 18, 8, 0, 0, Math.PI*2); ctx.fill()
      ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.ellipse(96, 80, 8, 8, 0, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(160, 80, 8, 8, 0, 0, Math.PI*2); ctx.fill()
      // frame
      ctx.strokeStyle = '#1a0f05'
      ctx.lineWidth = 8
      ctx.strokeRect(4, 4, 248, 184)
      const tex = new THREE.CanvasTexture(c)
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(x, y, z)
      mesh.rotation.y = ry
      scene.add(mesh)
    }
    makePainting(-2.4, 2.2, -3, 0)
    makePainting(2.4, 2.2, -6, Math.PI)
    makePainting(-2.4, 2.2, -14, 0)
    makePainting(0, 2.2, -27.9, 0)

    // ── GHOSTS ──
    const ghosts = []
    function makeGhost() {
      const c = document.createElement('canvas')
      c.width = c.height = 128
      const ctx = c.getContext('2d')
      const g = ctx.createRadialGradient(64, 64, 5, 64, 64, 60)
      g.addColorStop(0, 'rgba(200,220,255,0.9)')
      g.addColorStop(0.4, 'rgba(180,200,255,0.4)')
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(64, 52, 32, 40, 0, 0, Math.PI * 2)
      ctx.fill()
      // wavy bottom
      ctx.beginPath()
      ctx.moveTo(32, 80)
      for (let x = 32; x <= 96; x += 8) {
        ctx.lineTo(x, 80 + Math.sin(x * 0.4) * 8)
      }
      ctx.lineTo(96, 110); ctx.lineTo(32, 110); ctx.closePath()
      ctx.fillStyle = 'rgba(180,200,255,0.3)'
      ctx.fill()
      // eyes
      ctx.fillStyle = 'rgba(0,0,20,0.8)'
      ctx.beginPath(); ctx.ellipse(52, 50, 6, 8, 0, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(76, 50, 6, 8, 0, 0, Math.PI*2); ctx.fill()
      const tex = new THREE.CanvasTexture(c)
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
      const sprite = new THREE.Sprite(mat)
      sprite.scale.set(0.8, 1, 1)
      const startX = (Math.random() - 0.5) * 4
      const startZ = -(Math.random() * 20 + 3)
      sprite.position.set(startX, 1.8 + Math.random() * 0.5, startZ)
      sprite.userData = {
        baseY: sprite.position.y,
        baseX: sprite.position.x,
        speed: 0.003 + Math.random() * 0.004,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.005,
        opacity: 0,
        targetOpacity: 0.4 + Math.random() * 0.4,
        fadeIn: true,
      }
      scene.add(sprite)
      ghosts.push(sprite)
    }
    for (let i = 0; i < 6; i++) makeGhost()

    // ── LIGHTING ──
    const ambient = new THREE.AmbientLight(0x050308, 1)
    scene.add(ambient)

    // Flickering candle lights
    const candleColors = [0x8b0000, 0x4b0082, 0x003300]
    const candleLights = []
    const candlePositions = [[0, 1.5, -2], [-4, 1.5, -5], [4, 1, -3], [0, 1.5, -15], [-1, 1.5, -19]]
    candlePositions.forEach(([x, y, z], i) => {
      const light = new THREE.PointLight(candleColors[i % candleColors.length], 1.5, 8)
      light.position.set(x, y, z)
      light.castShadow = true
      light.userData = { baseIntensity: 1.5, flicker: Math.random() * Math.PI * 2 }
      scene.add(light)
      candleLights.push(light)
    })

    // Lightning light (off by default)
    const lightningLight = new THREE.DirectionalLight(0xaaccff, 0)
    lightningLight.position.set(5, 10, 5)
    scene.add(lightningLight)

    // ── FOG PARTICLES ──
    const fogParticleCount = 300
    const fogGeo = new THREE.BufferGeometry()
    const fogPositions = new Float32Array(fogParticleCount * 3)
    const fogSizes = new Float32Array(fogParticleCount)
    for (let i = 0; i < fogParticleCount; i++) {
      fogPositions[i * 3]     = (Math.random() - 0.5) * 10
      fogPositions[i * 3 + 1] = Math.random() * 2
      fogPositions[i * 3 + 2] = -(Math.random() * 25)
      fogSizes[i] = 20 + Math.random() * 60
    }
    fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPositions, 3))
    fogGeo.setAttribute('size', new THREE.BufferAttribute(fogSizes, 1))

    const fogCanvas = document.createElement('canvas')
    fogCanvas.width = fogCanvas.height = 64
    const fCtx = fogCanvas.getContext('2d')
    const fGrd = fCtx.createRadialGradient(32, 32, 0, 32, 32, 32)
    fGrd.addColorStop(0, 'rgba(255,255,255,0.15)')
    fGrd.addColorStop(1, 'transparent')
    fCtx.fillStyle = fGrd
    fCtx.fillRect(0, 0, 64, 64)

    const fogMat = new THREE.PointsMaterial({
      map: new THREE.CanvasTexture(fogCanvas),
      size: 1.5, transparent: true, opacity: 0.25,
      depthWrite: false, blending: THREE.AdditiveBlending,
      vertexColors: false, sizeAttenuation: true,
      color: 0x334455
    })
    const fogParticles = new THREE.Points(fogGeo, fogMat)
    scene.add(fogParticles)

    // ── BLOOD DRIP on ceiling ──
    function makeBloodDrip(x, z) {
      const mat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 1, emissive: 0x3b0000, emissiveIntensity: 0.3 })
      for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) {
        const h = 0.1 + Math.random() * 0.6
        const drip = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.005, h, 6), mat)
        drip.position.set(x + (Math.random()-0.5)*0.3, 3.5 - h/2, z + (Math.random()-0.5)*0.3)
        scene.add(drip)
      }
    }
    makeBloodDrip(-1, -10)
    makeBloodDrip(0.5, -16)
    makeBloodDrip(-0.3, -20)

    // ── JUMP SCARE FACE ──
    const scareCanvas = document.createElement('canvas')
    scareCanvas.width = 512; scareCanvas.height = 512
    const sCtx = scareCanvas.getContext('2d')
    sCtx.fillStyle = '#000'
    sCtx.fillRect(0, 0, 512, 512)
    const faceGrd = sCtx.createRadialGradient(256, 240, 20, 256, 256, 220)
    faceGrd.addColorStop(0, '#c8a882')
    faceGrd.addColorStop(0.7, '#8a6040')
    faceGrd.addColorStop(1, 'transparent')
    sCtx.fillStyle = faceGrd
    sCtx.beginPath(); sCtx.ellipse(256, 240, 180, 200, 0, 0, Math.PI*2); sCtx.fill()
    // distorted eyes
    sCtx.fillStyle = '#000'
    sCtx.beginPath(); sCtx.ellipse(180, 200, 40, 55, -0.2, 0, Math.PI*2); sCtx.fill()
    sCtx.beginPath(); sCtx.ellipse(332, 200, 40, 55, 0.2, 0, Math.PI*2); sCtx.fill()
    sCtx.fillStyle = '#cc0000'
    sCtx.beginPath(); sCtx.ellipse(180, 200, 18, 25, -0.2, 0, Math.PI*2); sCtx.fill()
    sCtx.beginPath(); sCtx.ellipse(332, 200, 18, 25, 0.2, 0, Math.PI*2); sCtx.fill()
    // mouth
    sCtx.strokeStyle = '#000'
    sCtx.lineWidth = 4
    sCtx.beginPath()
    sCtx.moveTo(140, 340)
    for (let x = 140; x <= 372; x += 10) {
      sCtx.lineTo(x, 340 + Math.sin(x * 0.15) * 20)
    }
    sCtx.stroke()
    // teeth
    sCtx.fillStyle = '#e8e0d0'
    for (let t = 0; t < 6; t++) {
      sCtx.beginPath()
      sCtx.moveTo(165 + t * 36, 340)
      sCtx.lineTo(150 + t * 36, 380)
      sCtx.lineTo(186 + t * 36, 380)
      sCtx.closePath(); sCtx.fill()
    }
    // cracks on face
    sCtx.strokeStyle = 'rgba(0,0,0,0.6)'; sCtx.lineWidth = 2
    for (let i = 0; i < 15; i++) {
      sCtx.beginPath()
      sCtx.moveTo(Math.random()*512, Math.random()*512)
      sCtx.lineTo(Math.random()*512, Math.random()*512)
      sCtx.stroke()
    }
    const scareTex = new THREE.CanvasTexture(scareCanvas)
    const scareMat = new THREE.SpriteMaterial({ map: scareTex, transparent: true, depthTest: false })
    const scareFace = new THREE.Sprite(scareMat)
    scareFace.scale.set(3, 3, 1)
    scareFace.visible = false
    camera.add(scareFace)
    scareFace.position.set(0, 0, -1.5)
    scene.add(camera)

    // ── CLICK HANDLER for jump scare ──
    let lastScare = 0
    const onClick = () => {
      if (!isLocked) return
      const now = Date.now()
      if (now - lastScare < 8000) return
      lastScare = now
      scareFace.visible = true
      scareFace.material.opacity = 1
      setJumpScare(true)
      setGlitch(true)
      lightningLight.intensity = 8
      setTimeout(() => { lightningLight.intensity = 0 }, 120)
      setTimeout(() => { scareFace.visible = false; setJumpScare(false); setGlitch(false) }, 900)
    }
    document.addEventListener('click', onClick)

    // ── RANDOM LIGHTNING ──
    let nextLightning = Date.now() + 5000 + Math.random() * 10000
    const triggerLightning = () => {
      if (Date.now() < nextLightning) return
      nextLightning = Date.now() + 6000 + Math.random() * 12000
      setLightning(true)
      lightningLight.intensity = 6
      setTimeout(() => { lightningLight.intensity = 0 }, 80)
      setTimeout(() => { lightningLight.intensity = 4 }, 150)
      setTimeout(() => { lightningLight.intensity = 0; setLightning(false) }, 220)
    }

    // ── RESIZE ──
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // ── ANIMATE ──
    let t = 0
    const clock = new THREE.Clock()

    const animate = () => {
      const raf = requestAnimationFrame(animate)
      sceneRef.__raf = raf
      const delta = clock.getDelta()
      t += delta

      // Movement
      if (controls.isLocked) {
        const speed = 4
        const dir = new THREE.Vector3()
        if (keys['KeyW'] || keys['ArrowUp'])    dir.z -= 1
        if (keys['KeyS'] || keys['ArrowDown'])  dir.z += 1
        if (keys['KeyA'] || keys['ArrowLeft'])  dir.x -= 1
        if (keys['KeyD'] || keys['ArrowRight']) dir.x += 1
        if (dir.length() > 0) {
          dir.normalize()
          controls.moveForward(-dir.z * speed * delta)
          controls.moveRight(dir.x * speed * delta)
        }
        // clamp Y
        camera.position.y = 1.7
      }

      // Flicker candle lights
      candleLights.forEach((l) => {
        l.userData.flicker += delta * (3 + Math.random() * 2)
        const noise = Math.sin(l.userData.flicker) * 0.3 + Math.sin(l.userData.flicker * 2.3) * 0.15
        l.intensity = l.userData.baseIntensity + noise
      })

      // Animate ghosts
      ghosts.forEach((g) => {
        g.position.y = g.userData.baseY + Math.sin(t * g.userData.speed * 200 + g.userData.phase) * 0.15
        g.position.x += g.userData.drift
        if (g.userData.fadeIn) {
          g.material.opacity = Math.min(g.material.opacity + delta * 0.08, g.userData.targetOpacity)
        }
        if (Math.abs(g.position.x) > 3) g.userData.drift *= -1
      })

      // Drift fog particles
      const pos = fogGeo.attributes.position.array
      for (let i = 0; i < fogParticleCount; i++) {
        pos[i * 3] += Math.sin(t * 0.3 + i) * 0.001
        pos[i * 3 + 1] += Math.sin(t * 0.2 + i * 0.5) * 0.0005
      }
      fogGeo.attributes.position.needsUpdate = true

      // Subtle camera sway (breathing effect)
      if (controls.isLocked) {
        camera.position.y = 1.7 + Math.sin(t * 0.8) * 0.018
      }

      triggerLightning()
      renderer.render(scene, camera)
    }
    animate()

    // Expose lock method
    mount.__lockControls = () => controls.lock()

    return () => {
      cancelAnimationFrame(sceneRef.__raf)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }}>

      {/* THREE.JS CANVAS */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* SCANLINES */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
      }} />

      {/* VIGNETTE */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 11,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.85) 100%)',
      }} />

      {/* GLITCH OVERLAY */}
      {glitch && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 30, pointerEvents: 'none',
          animation: 'glitchAnim 0.9s steps(1) forwards',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,0,0,0.15)', mixBlendMode: 'screen' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,255,255,0.08)', transform: 'translateX(-4px)', mixBlendMode: 'screen' }} />
        </div>
      )}

      {/* LIGHTNING FLASH */}
      {lightning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 12, pointerEvents: 'none',
          background: 'rgba(180,220,255,0.08)',
          animation: 'lightningFlash 0.25s ease-out forwards',
        }} />
      )}

      {/* HUD CORNERS */}
      {isLocked && (
        <>
          <div style={{ position:'fixed', top:20, left:20, width:50, height:50, borderTop:'1px solid rgba(139,0,0,0.6)', borderLeft:'1px solid rgba(139,0,0,0.6)', zIndex:20, pointerEvents:'none' }} />
          <div style={{ position:'fixed', top:20, right:20, width:50, height:50, borderTop:'1px solid rgba(139,0,0,0.6)', borderRight:'1px solid rgba(139,0,0,0.6)', zIndex:20, pointerEvents:'none' }} />
          <div style={{ position:'fixed', bottom:20, left:20, width:50, height:50, borderBottom:'1px solid rgba(139,0,0,0.6)', borderLeft:'1px solid rgba(139,0,0,0.6)', zIndex:20, pointerEvents:'none' }} />
          <div style={{ position:'fixed', bottom:20, right:20, width:50, height:50, borderBottom:'1px solid rgba(139,0,0,0.6)', borderRight:'1px solid rgba(139,0,0,0.6)', zIndex:20, pointerEvents:'none' }} />
          {/* Crosshair */}
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:20, pointerEvents:'none' }}>
            <div style={{ width:16, height:1, background:'rgba(139,0,0,0.7)', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
            <div style={{ width:1, height:16, background:'rgba(139,0,0,0.7)', position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
          </div>
          {/* Controls reminder */}
          <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:20, pointerEvents:'none', fontFamily:"'Share Tech Mono', monospace", fontSize:'0.6rem', color:'rgba(100,0,0,0.7)', letterSpacing:'0.25em', textTransform:'uppercase' }}>
            WASD to move &nbsp;·&nbsp; Click for surprises &nbsp;·&nbsp; ESC to exit
          </div>
        </>
      )}

      {/* INSTRUCTIONS OVERLAY */}
      {showInstructions && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Share Tech Mono', monospace",
        }}>
          <h1 style={{
            fontFamily: "'Creepster', cursive",
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            color: '#cc0000',
            textShadow: '0 0 40px #ff000066, 0 0 80px #ff000022',
            letterSpacing: '0.08em',
            animation: 'flicker 3s infinite',
            marginBottom: 8,
          }}>DEAD HOUSE</h1>
          <p style={{ color: '#440000', fontSize: '0.7rem', letterSpacing: '0.4em', marginBottom: 48 }}>
            ─── ENTER IF YOU DARE ───
          </p>
          <div style={{ color: '#555', fontSize: '0.72rem', letterSpacing: '0.2em', lineHeight: 2.2, textAlign: 'center', marginBottom: 48 }}>
            <p><span style={{ color: '#8b0000' }}>WASD</span> — move through the darkness</p>
            <p><span style={{ color: '#8b0000' }}>MOUSE</span> — look around</p>
            <p><span style={{ color: '#8b0000' }}>CLICK</span> — you shouldn't do that</p>
          </div>
          <button
            onClick={() => {
              setShowInstructions(false)
              setTimeout(() => {
                mountRef.current?.__lockControls?.()
              }, 100)
            }}
            style={{
              background: 'transparent', border: '1px solid #8b0000',
              color: '#cc0000', fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.8rem', letterSpacing: '0.4em', padding: '16px 48px',
              cursor: 'pointer', textTransform: 'uppercase',
              transition: 'all 0.3s',
              animation: 'flicker 4s infinite',
            }}
            onMouseEnter={e => { e.target.style.background = '#8b0000'; e.target.style.color = '#000' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#cc0000' }}
          >
            Enter
          </button>
          {/* corner decorations */}
          <div style={{ position:'absolute', top:24, left:24, width:60, height:60, borderTop:'1px solid #3b0000', borderLeft:'1px solid #3b0000' }} />
          <div style={{ position:'absolute', top:24, right:24, width:60, height:60, borderTop:'1px solid #3b0000', borderRight:'1px solid #3b0000' }} />
          <div style={{ position:'absolute', bottom:24, left:24, width:60, height:60, borderBottom:'1px solid #3b0000', borderLeft:'1px solid #3b0000' }} />
          <div style={{ position:'absolute', bottom:24, right:24, width:60, height:60, borderBottom:'1px solid #3b0000', borderRight:'1px solid #3b0000' }} />
        </div>
      )}

      {/* Pointer locked — click to re-enter message */}
      {!isLocked && !showInstructions && (
        <div
          onClick={() => mountRef.current?.__lockControls?.()}
          style={{
            position: 'fixed', inset: 0, zIndex: 90,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            color: 'rgba(139,0,0,0.8)', fontSize: '0.75rem',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            animation: 'pulse 2s infinite',
          }}>
            Click to continue...
          </p>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Share+Tech+Mono&display=swap');

        @keyframes flicker {
          0%,19%,21%,23%,25%,54%,56%,100% { opacity: 1; }
          20%,22%,24%,55% { opacity: 0.4; }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes lightningFlash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes glitchAnim {
          0%   { clip-path: inset(20% 0 60% 0); transform: translateX(-4px); }
          20%  { clip-path: inset(50% 0 30% 0); transform: translateX(4px); }
          40%  { clip-path: inset(10% 0 80% 0); transform: translateX(-2px); }
          60%  { clip-path: inset(70% 0 10% 0); transform: translateX(3px); }
          80%  { clip-path: inset(40% 0 50% 0); transform: translateX(-3px); }
          100% { clip-path: inset(0 0 0 0);     transform: translateX(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html,body { width:100%; height:100%; background:#000; overflow:hidden; }
      `}</style>
    </div>
  )
}
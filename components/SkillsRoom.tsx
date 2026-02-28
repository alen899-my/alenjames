'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { usePerformance } from '@/lib/usePerformance'

// ── SKILL DATA ────────────────────────────────────────────────────────────────
interface Skill {
    name: string
    category: string
    level: number
    years: string
    description: string
    color: string
    bgColor: string
    imageFile: string
    fallbackIcon: string
}

const SKILLS: Skill[] = [
    { name: 'Unreal Engine', category: 'Other Skills', level: 80, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using Unreal Engine.', color: '#ffffff', bgColor: '#262626', imageFile: 'https://cdn.simpleicons.org/unrealengine/ffffff', fallbackIcon: 'Un' },
    { name: 'Arduino', category: 'Other Skills', level: 77, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using Arduino.', color: '#00979D', bgColor: '#001617', imageFile: 'https://cdn.simpleicons.org/arduino/ffffff', fallbackIcon: 'Ar' },
    { name: 'C', category: 'Coding Languages', level: 82, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using C.', color: '#A8B9CC', bgColor: '#191b1e', imageFile: 'https://cdn.simpleicons.org/c/ffffff', fallbackIcon: 'C' },
    { name: 'C#', category: 'Coding Languages', level: 77, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using C#.', color: '#239120', bgColor: '#051504', imageFile: 'https://cdn.simpleicons.org/csharp/ffffff', fallbackIcon: 'C#' },
    { name: 'C++', category: 'Coding Languages', level: 88, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using C++.', color: '#00599C', bgColor: '#000d17', imageFile: 'https://cdn.simpleicons.org/cplusplus/ffffff', fallbackIcon: 'C+' },
    { name: 'CSS3', category: 'Frontend', level: 79, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using CSS3.', color: '#1572B6', bgColor: '#03111b', imageFile: 'https://cdn.simpleicons.org/css3/ffffff', fallbackIcon: 'CS' },
    { name: 'HTML5', category: 'Frontend', level: 77, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using HTML5.', color: '#E34F26', bgColor: '#220b05', imageFile: 'https://cdn.simpleicons.org/html5/ffffff', fallbackIcon: 'HT' },
    { name: 'JavaScript', category: 'Coding Languages', level: 90, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using JavaScript.', color: '#F7DF1E', bgColor: '#252104', imageFile: 'https://cdn.simpleicons.org/javascript/ffffff', fallbackIcon: 'Ja' },
    { name: 'PHP', category: 'Coding Languages', level: 87, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using PHP.', color: '#777BB4', bgColor: '#11121b', imageFile: 'https://cdn.simpleicons.org/php/ffffff', fallbackIcon: 'PH' },
    { name: 'Python', category: 'Coding Languages', level: 77, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using Python.', color: '#3776AB', bgColor: '#081119', imageFile: 'https://cdn.simpleicons.org/python/ffffff', fallbackIcon: 'Py' },
    { name: 'PowerShell', category: 'Coding Languages', level: 84, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using PowerShell.', color: '#5391FE', bgColor: '#0c1526', imageFile: 'https://cdn.simpleicons.org/powershell/ffffff', fallbackIcon: 'Po' },
    { name: 'R', category: 'Coding Languages', level: 77, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using R.', color: '#276DC3', bgColor: '#05101d', imageFile: 'https://cdn.simpleicons.org/r/ffffff', fallbackIcon: 'R' },
    { name: 'TypeScript', category: 'Coding Languages', level: 82, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using TypeScript.', color: '#3178C6', bgColor: '#07121d', imageFile: 'https://cdn.simpleicons.org/typescript/ffffff', fallbackIcon: 'Ty' },
    { name: 'Netlify', category: 'Other Skills', level: 86, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using Netlify.', color: '#00C7B7', bgColor: '#001d1b', imageFile: 'https://cdn.simpleicons.org/netlify/ffffff', fallbackIcon: 'Ne' },
    { name: 'Vercel', category: 'Other Skills', level: 84, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using Vercel.', color: '#ffffff', bgColor: '#262626', imageFile: 'https://cdn.simpleicons.org/vercel/ffffff', fallbackIcon: 'Ve' },
    { name: 'Render', category: 'Other Skills', level: 83, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Render.', color: '#ffffff', bgColor: '#262626', imageFile: 'https://cdn.simpleicons.org/render/ffffff', fallbackIcon: 'Re' },
    { name: 'AWS', category: 'Other Skills', level: 90, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using AWS.', color: '#232F3E', bgColor: '#050709', imageFile: 'https://cdn.simpleicons.org/amazonaws/ffffff', fallbackIcon: 'AW' },
    { name: '.Net', category: 'Other Skills', level: 76, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using .Net.', color: '#512BD4', bgColor: '#0c061f', imageFile: 'https://cdn.simpleicons.org/dotnet/ffffff', fallbackIcon: '.N' },
    { name: 'Chart.js', category: 'Frontend', level: 80, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using Chart.js.', color: '#FF6384', bgColor: '#260e13', imageFile: 'https://cdn.simpleicons.org/chartdotjs/ffffff', fallbackIcon: 'Ch' },
    { name: 'Chakra', category: 'Frontend', level: 81, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using Chakra.', color: '#319795', bgColor: '#071616', imageFile: 'https://cdn.simpleicons.org/chakraui/ffffff', fallbackIcon: 'Ch' },
    { name: 'Bootstrap', category: 'Frontend', level: 93, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using Bootstrap.', color: '#7952B3', bgColor: '#120c1a', imageFile: 'https://cdn.simpleicons.org/bootstrap/ffffff', fallbackIcon: 'Bo' },
    { name: 'DaisyUI', category: 'Frontend', level: 79, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using DaisyUI.', color: '#5A0EF8', bgColor: '#0d0225', imageFile: 'https://cdn.simpleicons.org/daisyui/ffffff', fallbackIcon: 'Da' },
    { name: 'Django', category: 'Backend', level: 90, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using Django.', color: '#092E20', bgColor: '#010604', imageFile: 'https://cdn.simpleicons.org/django/ffffff', fallbackIcon: 'Dj' },
    { name: 'Express.js', category: 'Backend', level: 88, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using Express.js.', color: '#ffffff', bgColor: '#262626', imageFile: 'https://cdn.simpleicons.org/express/ffffff', fallbackIcon: 'Ex' },
    { name: 'FastAPI', category: 'Backend', level: 91, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using FastAPI.', color: '#009688', bgColor: '#001614', imageFile: 'https://cdn.simpleicons.org/fastapi/ffffff', fallbackIcon: 'Fa' },
    { name: 'Fastify', category: 'Backend', level: 81, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using Fastify.', color: '#ffffff', bgColor: '#262626', imageFile: 'https://cdn.simpleicons.org/fastify/ffffff', fallbackIcon: 'Fa' },
    { name: 'Flask', category: 'Backend', level: 92, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using Flask.', color: '#ffffff', bgColor: '#262626', imageFile: 'https://cdn.simpleicons.org/flask/ffffff', fallbackIcon: 'Fl' },
    { name: 'jQuery', category: 'Frontend', level: 75, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using jQuery.', color: '#0769AD', bgColor: '#010f19', imageFile: 'https://cdn.simpleicons.org/jquery/ffffff', fallbackIcon: 'jQ' },
    { name: 'JWT', category: 'Backend', level: 80, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using JWT.', color: '#ffffff', bgColor: '#262626', imageFile: 'https://cdn.simpleicons.org/jsonwebtokens/ffffff', fallbackIcon: 'JW' },
    { name: 'Next JS', category: 'Frontend', level: 79, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Next JS.', color: '#ffffff', bgColor: '#262626', imageFile: 'https://cdn.simpleicons.org/nextdotjs/ffffff', fallbackIcon: 'Ne' },
    { name: 'NodeJS', category: 'Backend', level: 82, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using NodeJS.', color: '#339933', bgColor: '#071607', imageFile: 'https://cdn.simpleicons.org/nodedotjs/ffffff', fallbackIcon: 'No' },
    { name: 'Nodemon', category: 'Backend', level: 75, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Nodemon.', color: '#76D04B', bgColor: '#111f0b', imageFile: 'https://cdn.simpleicons.org/nodemon/ffffff', fallbackIcon: 'No' },
    { name: 'OpenCV', category: 'Other Skills', level: 90, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using OpenCV.', color: '#5C3EE8', bgColor: '#0d0922', imageFile: 'https://cdn.simpleicons.org/opencv/ffffff', fallbackIcon: 'Op' },
    { name: 'React Query', category: 'Frontend', level: 76, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using React Query.', color: '#FF4154', bgColor: '#26090c', imageFile: 'https://cdn.simpleicons.org/reactquery/ffffff', fallbackIcon: 'Re' },
    { name: 'React Native', category: 'Frontend', level: 77, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using React Native.', color: '#61DAFB', bgColor: '#0e2025', imageFile: 'https://cdn.simpleicons.org/react/ffffff', fallbackIcon: 'Re' },
    { name: 'React Router', category: 'Frontend', level: 83, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using React Router.', color: '#CA4245', bgColor: '#1e090a', imageFile: 'https://cdn.simpleicons.org/reactrouter/ffffff', fallbackIcon: 'Re' },
    { name: 'React Hook Form', category: 'Frontend', level: 79, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using React Hook Form.', color: '#EC5990', bgColor: '#230d15', imageFile: 'https://cdn.simpleicons.org/reacthookform/ffffff', fallbackIcon: 'Re' },
    { name: 'Redux', category: 'Frontend', level: 75, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Redux.', color: '#764ABC', bgColor: '#110b1c', imageFile: 'https://cdn.simpleicons.org/redux/ffffff', fallbackIcon: 'Re' },
    { name: 'TailwindCSS', category: 'Frontend', level: 76, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using TailwindCSS.', color: '#06B6D4', bgColor: '#001b1f', imageFile: 'https://cdn.simpleicons.org/tailwindcss/ffffff', fallbackIcon: 'Ta' },
    { name: 'Three js', category: 'Frontend', level: 92, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using Three js.', color: '#ffffff', bgColor: '#262626', imageFile: 'https://cdn.simpleicons.org/threedotjs/ffffff', fallbackIcon: 'Th' },
    { name: 'WordPress', category: 'Other Skills', level: 92, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using WordPress.', color: '#21759B', bgColor: '#041117', imageFile: 'https://cdn.simpleicons.org/wordpress/ffffff', fallbackIcon: 'Wo' },
    { name: 'Vite', category: 'Frontend', level: 83, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Vite.', color: '#646CFF', bgColor: '#0f1026', imageFile: 'https://cdn.simpleicons.org/vite/ffffff', fallbackIcon: 'Vi' },
    { name: 'Apache', category: 'Backend', level: 93, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using Apache.', color: '#D22128', bgColor: '#1f0406', imageFile: 'https://cdn.simpleicons.org/apache/ffffff', fallbackIcon: 'Ap' },
    { name: 'MicrosoftSQLServer', category: 'Backend', level: 76, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using MicrosoftSQLServer.', color: '#CC292B', bgColor: '#1e0606', imageFile: 'https://cdn.simpleicons.org/microsoftsqlserver/ffffff', fallbackIcon: 'Mi' },
    { name: 'MongoDB', category: 'Backend', level: 81, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using MongoDB.', color: '#47A248', bgColor: '#0a180a', imageFile: 'https://cdn.simpleicons.org/mongodb/ffffff', fallbackIcon: 'Mo' },
    { name: 'MySQL', category: 'Backend', level: 93, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using MySQL.', color: '#4479A1', bgColor: '#0a1218', imageFile: 'https://cdn.simpleicons.org/mysql/ffffff', fallbackIcon: 'My' },
    { name: 'Postgres', category: 'Backend', level: 90, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using Postgres.', color: '#4169E1', bgColor: '#090f21', imageFile: 'https://cdn.simpleicons.org/postgresql/ffffff', fallbackIcon: 'Po' },
    { name: 'SQLite', category: 'Backend', level: 77, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using SQLite.', color: '#003B57', bgColor: '#00080d', imageFile: 'https://cdn.simpleicons.org/sqlite/ffffff', fallbackIcon: 'SQ' },
    { name: 'Adobe', category: 'Other Skills', level: 90, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using Adobe.', color: '#FF0000', bgColor: '#260000', imageFile: 'https://cdn.simpleicons.org/adobe/ffffff', fallbackIcon: 'Ad' },
    { name: 'Adobe Illustrator', category: 'Other Skills', level: 91, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Adobe Illustrator.', color: '#FF9A00', bgColor: '#261700', imageFile: 'https://cdn.simpleicons.org/adobeillustrator/ffffff', fallbackIcon: 'Ad' },
    { name: 'Adobe Photoshop', category: 'Other Skills', level: 86, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using Adobe Photoshop.', color: '#31A8FF', bgColor: '#071926', imageFile: 'https://cdn.simpleicons.org/adobephotoshop/ffffff', fallbackIcon: 'Ad' },
    { name: 'Blender', category: 'Other Skills', level: 75, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Blender.', color: '#F5792A', bgColor: '#241206', imageFile: 'https://cdn.simpleicons.org/blender/ffffff', fallbackIcon: 'Bl' },
    { name: 'Canva', category: 'Other Skills', level: 84, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using Canva.', color: '#00C4CC', bgColor: '#001d1e', imageFile: 'https://cdn.simpleicons.org/canva/ffffff', fallbackIcon: 'Ca' },
    { name: 'Figma', category: 'Other Skills', level: 79, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Figma.', color: '#F24E1E', bgColor: '#240b04', imageFile: 'https://cdn.simpleicons.org/figma/ffffff', fallbackIcon: 'Fi' },
    { name: 'Sketch Up', category: 'Other Skills', level: 94, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using Sketch Up.', color: '#F7B500', bgColor: '#251b00', imageFile: 'https://cdn.simpleicons.org/sketch/ffffff', fallbackIcon: 'Sk' },
    { name: 'Matplotlib', category: 'Other Skills', level: 83, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Matplotlib.', color: '#11557c', bgColor: '#020c12', imageFile: 'https://cdn.simpleicons.org/pandas/ffffff', fallbackIcon: 'Ma' },
    { name: 'NumPy', category: 'Other Skills', level: 80, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using NumPy.', color: '#013243', bgColor: '#00070a', imageFile: 'https://cdn.simpleicons.org/numpy/ffffff', fallbackIcon: 'Nu' },
    { name: 'Pandas', category: 'Other Skills', level: 94, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using Pandas.', color: '#150458', bgColor: '#03000d', imageFile: 'https://cdn.simpleicons.org/pandas/ffffff', fallbackIcon: 'Pa' },
    { name: 'Plotly', category: 'Other Skills', level: 79, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Plotly.', color: '#3F4F75', bgColor: '#090b11', imageFile: 'https://cdn.simpleicons.org/plotly/ffffff', fallbackIcon: 'Pl' },
    { name: 'scikit-learn', category: 'Other Skills', level: 77, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using scikit-learn.', color: '#F7931E', bgColor: '#251604', imageFile: 'https://cdn.simpleicons.org/scikitlearn/ffffff', fallbackIcon: 'sc' },
    { name: 'Scipy', category: 'Other Skills', level: 75, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Scipy.', color: '#8CAAEE', bgColor: '#151923', imageFile: 'https://cdn.simpleicons.org/scipy/ffffff', fallbackIcon: 'Sc' },
    { name: 'TensorFlow', category: 'Other Skills', level: 78, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using TensorFlow.', color: '#FF6F00', bgColor: '#261000', imageFile: 'https://cdn.simpleicons.org/tensorflow/ffffff', fallbackIcon: 'Te' },
    { name: 'Git', category: 'Other Skills', level: 87, years: '1 yrs', description: 'Deep proficiency and experience in building robust solutions using Git.', color: '#F05032', bgColor: '#240c07', imageFile: 'https://cdn.simpleicons.org/git/ffffff', fallbackIcon: 'Gi' },
    { name: 'GitHub', category: 'Other Skills', level: 94, years: '4 yrs', description: 'Deep proficiency and experience in building robust solutions using GitHub.', color: '#181717', bgColor: '#030303', imageFile: 'https://cdn.simpleicons.org/github/ffffff', fallbackIcon: 'Gi' },
    { name: 'Jira', category: 'Other Skills', level: 85, years: '3 yrs', description: 'Deep proficiency and experience in building robust solutions using Jira.', color: '#0052CC', bgColor: '#000c1e', imageFile: 'https://cdn.simpleicons.org/jira/ffffff', fallbackIcon: 'Ji' },
    { name: 'Unity', category: 'Other Skills', level: 92, years: '2 yrs', description: 'Deep proficiency and experience in building robust solutions using Unity.', color: '#ffffff', bgColor: '#262626', imageFile: 'https://cdn.simpleicons.org/unity/ffffff', fallbackIcon: 'Un' }
]

// ── HELPERS ───────────────────────────────────────────────────────────────────
const makeCategoryPlaque = (title: string, textureScale: number) => {
    const texW = 1024 * textureScale
    const texH = 256 * textureScale
    const c = document.createElement('canvas'); c.width = texW; c.height = texH
    const ctx = c.getContext('2d')!
    ctx.fillStyle = 'rgba(20, 15, 10, 0.95)'; ctx.fillRect(0, 0, 1024, 256)

    // Premium border
    ctx.strokeStyle = '#c8a028'; ctx.lineWidth = 8; ctx.strokeRect(20, 20, 984, 216)
    ctx.strokeStyle = '#8a6820'; ctx.lineWidth = 2; ctx.strokeRect(30, 30, 964, 196)

    ctx.shadowColor = 'rgba(200, 160, 40, 0.6)'; ctx.shadowBlur = 15
    ctx.fillStyle = '#e8d080'; ctx.font = 'bold 70px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.letterSpacing = "10px"
    ctx.fillText(title.toUpperCase(), 512, 128)

    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 16; return tex
}

function hexToRgb(hex: string) {
    const c = hex.replace('#', '')
    return { r: parseInt(c.slice(0, 2), 16) || 0, g: parseInt(c.slice(2, 4), 16) || 0, b: parseInt(c.slice(4, 6), 16) || 0 }
}

function makeFallbackFace(skill: Skill, textureScale: number): THREE.CanvasTexture {
    const S = 256 * textureScale
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S
    const ctx = cv.getContext('2d')!
    const { r, g, b } = hexToRgb(skill.color)
    const { r: br, g: bg, b: bb } = hexToRgb(skill.bgColor)
    ctx.fillStyle = `rgb(${br},${bg},${bb})`; ctx.fillRect(0, 0, S, S)
    const grd = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
    grd.addColorStop(0, `rgba(${r},${g},${b},0.28)`); grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
    ctx.fillStyle = grd; ctx.fillRect(0, 0, S, S)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.82)`; ctx.lineWidth = 7
    ctx.strokeRect(3, 3, S - 6, S - 6)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.2)`; ctx.lineWidth = 2
    ctx.strokeRect(10, 10, S - 20, S - 20)
    ctx.font = `bold 88px "Apple Color Emoji","Segoe UI Emoji",monospace`
    ctx.fillStyle = `rgba(${r},${g},${b},1)`
    ctx.shadowColor = `rgba(${r},${g},${b},1)`; ctx.shadowBlur = 32
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(skill.fallbackIcon, S / 2, S / 2 - 14)
    ctx.shadowBlur = 0
    ctx.font = `bold 26px monospace`
    ctx.fillStyle = `rgba(255,255,255,0.9)`
    ctx.fillText(skill.name, S / 2, S / 2 + 60)
    return new THREE.CanvasTexture(cv)
}

function loadImageFace(skill: Skill, textureScale: number): Promise<THREE.Texture> {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => {
            const S = 512 * textureScale
            const cv = document.createElement('canvas'); cv.width = S; cv.height = S
            const ctx = cv.getContext('2d')!
            const { r, g, b } = hexToRgb(skill.color)
            const { r: br, g: bg, b: bb } = hexToRgb(skill.bgColor)

            ctx.fillStyle = `rgb(${br},${bg},${bb})`; ctx.fillRect(0, 0, S, S)
            const grd = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.52)
            grd.addColorStop(0, `rgba(${r},${g},${b},0.22)`); grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
            ctx.fillStyle = grd; ctx.fillRect(0, 0, S, S)

            const pad = 96 * textureScale
            ctx.drawImage(img, pad, pad, S - pad * 2, S - pad * 2)

            ctx.strokeStyle = `rgba(${r},${g},${b},0.78)`; ctx.lineWidth = 8
            ctx.strokeRect(4, 4, S - 8, S - 8)
            ctx.strokeStyle = `rgba(${r},${g},${b},0.2)`; ctx.lineWidth = 2
            ctx.strokeRect(13, 13, S - 26, S - 26)

            const tex = new THREE.CanvasTexture(cv)
            tex.anisotropy = 16
            resolve(tex)
        }

        img.onerror = () => {
            console.warn(`Failed to load skill icon for: ${skill.name}`)
            resolve(makeFallbackFace(skill, textureScale))
        }

        if (skill.imageFile.startsWith('http') || skill.imageFile.startsWith('data:')) {
            img.src = skill.imageFile
        } else {
            img.src = `/skills/${skill.imageFile}`
        }
    })
}

function makeWoodGrainTex(hue = 28, seed = 0): THREE.CanvasTexture {
    const S = 512
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S
    const ctx = cv.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, S, S)
    g.addColorStop(0, `hsl(${hue + seed * 3},55%,17%)`)
    g.addColorStop(0.4, `hsl(${hue + seed * 3},52%,21%)`)
    g.addColorStop(0.7, `hsl(${hue + seed * 3},55%,19%)`)
    g.addColorStop(1, `hsl(${hue + seed * 3},53%,15%)`)
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S)
    for (let i = 0; i < 120; i++) {
        const y = Math.random() * S
        ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.1})`
        ctx.lineWidth = 0.5 + Math.random() * 1.5
        ctx.beginPath(); ctx.moveTo(0, y)
        ctx.bezierCurveTo(S / 3, y + (Math.random() - 0.5) * 12, 2 * S / 3, y + (Math.random() - 0.5) * 12, S, y)
        ctx.stroke()
    }
    for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = `rgba(255,190,80,${0.02 + Math.random() * 0.05})`
        ctx.lineWidth = 1 + Math.random() * 2
        const y = Math.random() * S
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S, y + (Math.random() - 0.5) * 24); ctx.stroke()
    }
    const hi = ctx.createLinearGradient(0, 0, 0, 60)
    hi.addColorStop(0, 'rgba(255,210,100,0.18)'); hi.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = hi; ctx.fillRect(0, 0, S, 60)
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
}

function makeNamePlaque(skill: Skill, selected: boolean): THREE.CanvasTexture {
    const W = 320, H = 64
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H
    const ctx = cv.getContext('2d')!
    const { r, g, b } = hexToRgb(skill.color)
    const bg = ctx.createLinearGradient(0, 0, W, 0)
    bg.addColorStop(0, '#110e08'); bg.addColorStop(0.5, '#1e1808'); bg.addColorStop(1, '#110e08')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = selected ? `rgba(${r},${g},${b},0.9)` : `rgba(${r},${g},${b},0.35)`
    ctx.lineWidth = selected ? 2.5 : 1.5; ctx.strokeRect(2, 2, W - 4, H - 4)
    if (selected) {
        ctx.shadowColor = `rgba(${r},${g},${b},0.6)`; ctx.shadowBlur = 12
        ctx.strokeRect(2, 2, W - 4, H - 4); ctx.shadowBlur = 0
    }
    ctx.font = `bold 23px "SF Mono","Fira Code",monospace`
    ctx.fillStyle = selected ? `rgba(${r},${g},${b},1)` : `rgba(255,240,200,0.88)`
    ctx.shadowColor = `rgba(${r},${g},${b},${selected ? 0.9 : 0.3})`; ctx.shadowBlur = selected ? 16 : 5
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(skill.name, W / 2, H / 2 - 6)
    ctx.shadowBlur = 0
    ctx.font = `500 13px monospace`; ctx.fillStyle = `rgba(${r},${g},${b},0.45)`
    ctx.fillText(skill.category, W / 2, H / 2 + 14)
    return new THREE.CanvasTexture(cv)
}

function makeDetailPanel(skill: Skill, textureScale: number): THREE.CanvasTexture {
    const W = 1024 * textureScale, H = 512 * textureScale
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H
    const ctx = cv.getContext('2d')!
    const { r, g, b } = hexToRgb(skill.color)
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#050303')
    bg.addColorStop(0.5, `rgb(${Math.round(r * .10)},${Math.round(g * .10)},${Math.round(b * .10)})`)
    bg.addColorStop(1, '#030405')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.05)`; ctx.lineWidth = 1
    for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
    ctx.fillStyle = `rgba(${r},${g},${b},0.10)`; ctx.fillRect(0, 0, W, 52)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.5)`; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(W, 52); ctx.stroke()
    ctx.font = '600 17px monospace'; ctx.fillStyle = `rgba(${r},${g},${b},0.7)`
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillText('SKILL PROFILE', 40, 26)
    ctx.textAlign = 'right'
    ctx.fillText(skill.category.toUpperCase() + '  ·  ' + skill.years, W - 40, 26)
    ctx.fillStyle = `rgba(${r},${g},${b},0.9)`; ctx.fillRect(40, 70, 4, H - 88)
    ctx.fillStyle = `rgba(${r},${g},${b},0.18)`; ctx.fillRect(46, 70, 2, H - 88)
    const LX = 66
    ctx.font = 'bold 76px "Apple Color Emoji","Segoe UI Emoji",monospace'
    ctx.fillStyle = `rgba(${r},${g},${b},1)`
    ctx.shadowColor = `rgba(${r},${g},${b},1)`; ctx.shadowBlur = 38
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'
    ctx.fillText(skill.fallbackIcon, LX, 68)
    ctx.shadowBlur = 0
    ctx.font = 'bold 68px Georgia,serif'; ctx.fillStyle = '#ffffff'
    ctx.shadowColor = `rgba(${r},${g},${b},0.7)`; ctx.shadowBlur = 28
    ctx.textBaseline = 'alphabetic'; ctx.fillText(skill.name, LX, 192)
    ctx.shadowBlur = 0
    ctx.font = '600 15px monospace'
    const tagLabel = '  ' + skill.category.toUpperCase() + '  '
    const tw = ctx.measureText(tagLabel).width + 16
    ctx.fillStyle = `rgba(${r},${g},${b},0.1)`
    ctx.beginPath(); ctx.roundRect(LX, 208, tw, 30, 4); ctx.fill()
    ctx.strokeStyle = `rgba(${r},${g},${b},0.38)`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(LX, 208, tw, 30, 4); ctx.stroke()
    ctx.fillStyle = `rgba(${r},${g},${b},0.85)`; ctx.fillText(tagLabel, LX + 8, 229)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(LX, 254); ctx.lineTo(LX + 500, 254); ctx.stroke()
    ctx.font = '400 21px Georgia,serif'; ctx.fillStyle = 'rgba(205,215,230,0.8)'
    const words = skill.description.split(' ')
    let line = '', lines: string[] = []
    words.forEach(w => {
        const test = line + w + ' '
        if (ctx.measureText(test).width > 490 && line) { lines.push(line.trim()); line = w + ' ' } else line = test
    })
    if (line.trim()) lines.push(line.trim())
    lines.forEach((l, i) => ctx.fillText(l, LX, 284 + i * 37))
    const afterDesc = 284 + lines.length * 37 + 20
    ctx.font = '600 14px monospace'; ctx.fillStyle = `rgba(${r},${g},${b},0.5)`
    ctx.textAlign = 'left'; ctx.fillText('PROFICIENCY', LX, afterDesc)
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(LX, afterDesc + 9, 490, 13)
    const barG = ctx.createLinearGradient(LX, 0, LX + 490, 0)
    barG.addColorStop(0, `rgba(${r},${g},${b},0.55)`); barG.addColorStop(1, `rgba(${r},${g},${b},1)`)
    ctx.fillStyle = barG; ctx.fillRect(LX, afterDesc + 9, 490 * (skill.level / 100), 13)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.25)`; ctx.lineWidth = 1
    ctx.strokeRect(LX, afterDesc + 9, 490, 13)
    ctx.font = 'bold 17px monospace'; ctx.fillStyle = `rgba(${r},${g},${b},1)`
    ctx.shadowColor = `rgba(${r},${g},${b},0.7)`; ctx.shadowBlur = 8
    ctx.fillText(skill.level + '%', LX + 490 * (skill.level / 100) + 10, afterDesc + 20)
    ctx.shadowBlur = 0
    const RX = W - 290, SY = 70
    ctx.fillStyle = `rgba(${r},${g},${b},0.06)`
    ctx.beginPath(); ctx.roundRect(RX - 18, SY, 270, H - SY - 14, 6); ctx.fill()
    ctx.strokeStyle = `rgba(${r},${g},${b},0.2)`; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.roundRect(RX - 18, SY, 270, H - SY - 14, 6); ctx.stroke()
    ctx.font = '700 14px monospace'; ctx.fillStyle = `rgba(${r},${g},${b},0.58)`
    ctx.textAlign = 'center'; ctx.fillText('STATS', RX + 116, SY + 32)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.18)`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(RX - 8, SY + 44); ctx.lineTo(RX + 242, SY + 44); ctx.stroke()
    const stats = [
        { label: 'CATEGORY', val: skill.category }, { label: 'EXPERIENCE', val: skill.years },
        { label: 'LEVEL', val: skill.level + ' / 100' },
        { label: 'RANK', val: skill.level >= 90 ? 'Expert' : skill.level >= 80 ? 'Advanced' : 'Proficient' },
    ]
    stats.forEach(({ label, val }, i) => {
        const sy2 = SY + 72 + i * 96
        ctx.textAlign = 'left'
        ctx.font = '500 12px monospace'; ctx.fillStyle = `rgba(${r},${g},${b},0.40)`; ctx.fillText(label, RX, sy2)
        ctx.font = 'bold 22px monospace'; ctx.fillStyle = `rgba(${r},${g},${b},1)`
        ctx.shadowColor = `rgba(${r},${g},${b},0.5)`; ctx.shadowBlur = 9; ctx.fillText(val, RX, sy2 + 32); ctx.shadowBlur = 0
        if (i < stats.length - 1) { ctx.strokeStyle = `rgba(${r},${g},${b},0.09)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(RX - 8, sy2 + 54); ctx.lineTo(RX + 242, sy2 + 54); ctx.stroke() }
    })
    ctx.fillStyle = `rgba(${r},${g},${b},0.07)`; ctx.fillRect(0, H - 40, W, 40)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.38)`; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, H - 40); ctx.lineTo(W, H - 40); ctx.stroke()
    ctx.font = '500 13px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = `rgba(${r},${g},${b},0.33)`
    ctx.fillText('CLICK CUBE TO SELECT  ·  SKILLS SHOWCASE', W / 2, H - 20)
    for (let y = 0; y < H; y += 3) { ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.fillRect(0, y, W, 1.5) }
    return new THREE.CanvasTexture(cv)
}

function makeWallTex() {
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1024
    const ctx = cv.getContext('2d')!
    ctx.fillStyle = 'hsl(28,14%,9%)'; ctx.fillRect(0, 0, 1024, 1024)
    for (let i = 0; i < 18000; i++) { const v = Math.random() * 12; ctx.fillStyle = `rgba(${v + 5},${v + 3},${v},${Math.random() * .045})`; ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1 + Math.random() * 2, 1 + Math.random() * 2) }
    for (let x = 0; x < 1024; x += 190) { ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 3; ctx.strokeRect(x + 10, 10, 168, 300); ctx.strokeStyle = 'rgba(255,200,80,0.03)'; ctx.lineWidth = 1; ctx.strokeRect(x + 14, 14, 160, 292) }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
}
function makeFloorTex() {
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1024
    const ctx = cv.getContext('2d')!
    ctx.fillStyle = '#040302'; ctx.fillRect(0, 0, 1024, 1024)
    const pw = 96
    for (let x = 0; x < 1024; x += pw) {
        const v = 0.45 + Math.random() * 0.65
        ctx.fillStyle = `rgb(${~~(17 * v)},${~~(9 * v)},${~~(3 * v)})`; ctx.fillRect(x + 2, 0, pw - 4, 1024)
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x, 0, 2, 1024)
    }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SkillsRoom({ isActive = true }: { isActive?: boolean }) {
    const mountRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [shelfIndex, setShelfIndex] = useState(0)
    const [shelfPages, setShelfPages] = useState<number[]>([0, 0, 0, 0])
    const isActiveRef = useRef(isActive)
    const sceneRef = useRef<{
        selectCube?: (idx: number) => void;
        setShelf?: (idx: number) => void;
        updateActive?: (active: boolean) => void
    }>({})
    const perf = usePerformance()

    useEffect(() => { isActiveRef.current = isActive; sceneRef.current.updateActive?.(isActive) }, [isActive])

    useEffect(() => {
        const mount = mountRef.current
        if (!mount) return
        let W = mount.clientWidth, H = mount.clientHeight
        const catNames = ['Frontend', 'Backend', 'Other Skills', 'Coding Languages']

        // RENDERER
        const renderer = new THREE.WebGLRenderer({
            antialias: perf.tier === 'high',
            powerPreference: 'high-performance'
        })
        renderer.setSize(W, H)
        renderer.setPixelRatio(perf.pixelRatio)
        renderer.shadowMap.enabled = perf.shadows
        renderer.shadowMap.type = perf.tier === 'high' ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.18
        mount.appendChild(renderer.domElement)

        // SCENE
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x020101)
        scene.fog = new THREE.FogExp2(0x020101, 0.026)

        const camera = new THREE.PerspectiveCamera(60, W / H, 0.05, 80)
        camera.position.set(0, 4.5, 11.5)
        camera.lookAt(0, 4.2, 0)

        // ROOM
        const RW = 26, RH = 14, RD = 26 // More square for "Hall"
        const HW = RW / 2, HD = RD / 2

        const wallTex = makeWallTex(); wallTex.repeat.set(7, 2)
        const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.93, color: 0xddc8a0 })
        const floorTex = makeFloorTex(); floorTex.repeat.set(7, 5)
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.84, metalness: 0.05 })
        const ceilMat = new THREE.MeshStandardMaterial({ color: 0x111108, roughness: 0.98 })
        const sideWallTex = makeWallTex(); sideWallTex.repeat.set(5, 2)
        const sideWallMat = new THREE.MeshStandardMaterial({ map: sideWallTex, roughness: 0.93, color: 0xccbaa0 })
        const trimMat = new THREE.MeshStandardMaterial({ color: 0x2e1a06, roughness: 0.8 })
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x0e0e12, metalness: 0.92, roughness: 0.28 })

        const addPlane = (w: number, h: number, x: number, y: number, z: number, ry: number, mat: THREE.Material, rx = 0) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
            m.position.set(x, y, z); m.rotation.y = ry; m.rotation.x = rx; m.receiveShadow = true; scene.add(m); return m
        }
        addPlane(RW, RD, 0, 0, 0, 0, floorMat, -Math.PI / 2)
        addPlane(RW, RD, 0, RH, 0, 0, ceilMat, Math.PI / 2)
        addPlane(RW, RH, 0, RH / 2, -HD, 0, wallMat)
        addPlane(RW, RH, 0, RH / 2, HD, Math.PI, wallMat)
        addPlane(RD, RH, -HW, RH / 2, 0, Math.PI / 2, sideWallMat)
        addPlane(RD, RH, HW, RH / 2, 0, -Math.PI / 2, sideWallMat)

        const mkBox = (w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material, ry = 0) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
            m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m
        }

        // Baseboard + dado
        mkBox(RW, 0.22, 0.09, 0, 0.11, -HD + 0.045, trimMat)
        mkBox(RW, 0.22, 0.09, 0, 0.11, HD - 0.045, trimMat)
        mkBox(RD, 0.22, 0.09, -HW + 0.045, 0.11, 0, trimMat, Math.PI / 2)
        mkBox(RD, 0.22, 0.09, HW - 0.045, 0.11, 0, trimMat, -Math.PI / 2)
        mkBox(RW, 0.07, 0.07, 0, 1.6, -HD + 0.035, trimMat)
        mkBox(RW, 0.07, 0.07, 0, 1.6, HD - 0.035, trimMat)
        mkBox(RD, 0.07, 0.07, -HW + 0.035, 1.6, 0, trimMat, Math.PI / 2)
        mkBox(RD, 0.07, 0.07, HW - 0.035, 1.6, 0, trimMat, -Math.PI / 2)

        // ── BOOKCASES (4 WALLS) ───────────────────────────────────────────────────
        const shelfConfigs = [
            { ry: 0, pos: new THREE.Vector3(0, 0, -HD + 0.05), name: 'Front Wall' },
            { ry: -Math.PI / 2, pos: new THREE.Vector3(HW - 0.05, 0, 0), name: 'Right Wall' },
            { ry: Math.PI, pos: new THREE.Vector3(0, 0, HD - 0.05), name: 'Back Wall' },
            { ry: Math.PI / 2, pos: new THREE.Vector3(-HW + 0.05, 0, 0), name: 'Left Wall' }
        ]

        const COLS = 5, ROWS = 4
        const CUBE_SIZE = 1.42
        const COL_GAP = 0.30
        const ROW_GAP = 0.30
        const SHELF_T = 0.13
        const SHELF_D = 1.25
        const BC_W = COLS * CUBE_SIZE + (COLS + 1) * COL_GAP
        const BC_H = ROWS * (CUBE_SIZE + ROW_GAP + SHELF_T) + SHELF_T + 0.20
        const BC_Y_BASE = 0.0

        const shelfMat = new THREE.MeshStandardMaterial({ map: makeWoodGrainTex(28, 0), roughness: 0.60, metalness: 0.02, color: 0xa06830 })
        const darkShelfMat = new THREE.MeshStandardMaterial({ map: makeWoodGrainTex(24, 2), roughness: 0.72, metalness: 0.02, color: 0x5c3010 })
        const sideShelfMat = new THREE.MeshStandardMaterial({ map: makeWoodGrainTex(26, 1), roughness: 0.66, metalness: 0.02, color: 0x7a4a18 })
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xc09520, metalness: 0.88, roughness: 0.20 })

        const cubeMeshes: THREE.Mesh[] = []
        const cubeFrontMats: THREE.MeshStandardMaterial[] = []
        const cubeGroups: THREE.Group[] = []
        const plaqueMats: THREE.MeshStandardMaterial[] = []
        const accentLights: THREE.PointLight[] = []
        const woodSideTex = makeWoodGrainTex(28, 0); woodSideTex.repeat.set(1, 1)

        shelfConfigs.forEach((cfg, sIdx) => {
            const shelfAnchor = new THREE.Group()
            shelfAnchor.position.copy(cfg.pos)
            shelfAnchor.rotation.y = cfg.ry
            scene.add(shelfAnchor)

            const backP = new THREE.Mesh(new THREE.BoxGeometry(BC_W + 0.16, BC_H + 0.18, 0.07), darkShelfMat)
            backP.position.set(0, BC_Y_BASE + BC_H / 2, -0.01)
            shelfAnchor.add(backP)

            const SIDE_X = BC_W / 2 + 0.07
            const side1 = new THREE.Mesh(new THREE.BoxGeometry(0.11, BC_H + 0.18, SHELF_D + 0.10), sideShelfMat)
            side1.position.set(-SIDE_X, BC_Y_BASE + BC_H / 2, SHELF_D / 2)
            shelfAnchor.add(side1)
            const side2 = side1.clone()
            side2.position.set(SIDE_X, BC_Y_BASE + BC_H / 2, SHELF_D / 2)
            shelfAnchor.add(side2)

            const crown1 = new THREE.Mesh(new THREE.BoxGeometry(BC_W + 0.44, 0.13, SHELF_D + 0.14), darkShelfMat)
            crown1.position.set(0, BC_Y_BASE + BC_H + 0.13, SHELF_D / 2)
            shelfAnchor.add(crown1)
            const crown2 = new THREE.Mesh(new THREE.BoxGeometry(BC_W + 0.72, 0.06, SHELF_D + 0.26), darkShelfMat)
            crown2.position.set(0, BC_Y_BASE + BC_H + 0.28, SHELF_D / 2)
            shelfAnchor.add(crown2)

            // Category Label Plaque
            const catTex = makeCategoryPlaque(catNames[sIdx], perf.textureScale)
            const catMat = new THREE.MeshStandardMaterial({ map: catTex, roughness: 0.2, metalness: 0.1, emissive: new THREE.Color(0x332211), emissiveIntensity: 0.5 })
            const catPlaq = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 1.6), catMat)
            catPlaq.position.set(0, BC_Y_BASE + BC_H + 0.85, SHELF_D / 2 + 0.16)
            shelfAnchor.add(catPlaq)

            const rowShelfYs: number[] = []
            let curY = BC_Y_BASE + 0.15
            for (let row = 0; row <= ROWS; row++) {
                rowShelfYs.push(curY)
                const s = new THREE.Mesh(new THREE.BoxGeometry(BC_W, SHELF_T, SHELF_D), shelfMat)
                s.position.set(0, curY + SHELF_T / 2, SHELF_D / 2)
                shelfAnchor.add(s)
                const edge = new THREE.Mesh(new THREE.BoxGeometry(BC_W, 0.028, 0.032), brassMat)
                edge.position.set(0, curY + SHELF_T + 0.012, SHELF_D + 0.016)
                shelfAnchor.add(edge)
                if (row < ROWS) curY += SHELF_T + CUBE_SIZE + ROW_GAP
            }

            const shelfCategory = catNames[sIdx]
            const shelfSkills = SKILLS.map((sk, idx) => ({ sk, idx })).filter(item => item.sk.category === shelfCategory)

            const ITEMS_PER_ROW = 5
            const ITEMS_PER_PAGE = 20

            shelfSkills.forEach((item, i) => {
                const { sk, idx } = item
                const page = Math.floor(i / ITEMS_PER_PAGE)
                const localIdx = i % ITEMS_PER_PAGE
                const row = Math.floor(localIdx / ITEMS_PER_ROW)
                const col = localIdx % ITEMS_PER_ROW

                const spacingX = (BC_W - 0.8) / (ITEMS_PER_ROW - 1 || 1)
                const startX = -(BC_W - 0.8) / 2

                const x = startX + col * spacingX
                const y = rowShelfYs[row] + SHELF_T + CUBE_SIZE / 2
                const z = SHELF_D / 2

                const grp = new THREE.Group()
                grp.position.set(x + (page > 0 ? 15 : 0), y, z)
                grp.userData.baseY = y
                grp.userData.targetX = x
                grp.userData.page = page
                shelfAnchor.add(grp); cubeGroups[idx] = grp
                const { r, g, b } = hexToRgb(sk.color)
                const CS = CUBE_SIZE
                const cubeBody = new THREE.Mesh(new THREE.BoxGeometry(CS, CS, CS), new THREE.MeshStandardMaterial({ map: woodSideTex, roughness: 0.62, metalness: 0.02, color: 0x8a5420 }))
                grp.add(cubeBody)
                const fallbackTex = makeFallbackFace(sk, perf.textureScale)
                const frontMat = new THREE.MeshStandardMaterial({ map: fallbackTex, roughness: 0.22, metalness: 0.04, emissive: new THREE.Color(0.02, 0.02, 0.04), emissiveIntensity: 0.4 })
                cubeFrontMats[idx] = frontMat
                const frontPlane = new THREE.Mesh(new THREE.PlaneGeometry(CS * 0.90, CS * 0.90), frontMat)
                frontPlane.position.set(0, 0, CS / 2 + 0.003); frontPlane.userData = { cubeIdx: idx, shelfIdx: sIdx }; grp.add(frontPlane); cubeMeshes.push(frontPlane)
                loadImageFace(sk, perf.textureScale).then(tex => { if (cubeFrontMats[idx]) { cubeFrontMats[idx].map?.dispose(); cubeFrontMats[idx].map = tex; cubeFrontMats[idx].needsUpdate = true } })
                const al = new THREE.PointLight(new THREE.Color(r / 255, g / 255, b / 255), 0, 3, 2)
                al.position.set(0, 0, 0); grp.add(al); accentLights[idx] = al
                const pm = new THREE.MeshStandardMaterial({ map: makeNamePlaque(sk, false), roughness: 0.55 })
                plaqueMats[idx] = pm
                const plaq = new THREE.Mesh(new THREE.PlaneGeometry(CS * 0.94, 0.26), pm)
                plaq.rotation.x = -Math.PI / 2; plaq.position.set(0, rowShelfYs[row] + SHELF_T + 0.006, z + CS / 2 + 0.01)
                grp.add(plaq)
            })
            const sl = new THREE.SpotLight(0xfff0e0, 60, 20, Math.PI / 6, 0.3)
            sl.position.set(0, RH - 1, SHELF_D + 2); sl.target.position.set(0, 2, 0); shelfAnchor.add(sl); shelfAnchor.add(sl.target)
        })

        // ── CENTER TABLE ──────────────────────────────────────────────────────────
        const tableGrp = new THREE.Group(); scene.add(tableGrp)
        mkBox(4.5, 0.15, 7.5, 0, 1.8, 0, darkShelfMat)
        mkBox(0.2, 1.8, 0.2, -2.1, 0.9, -3.6, ironMat)
        mkBox(0.2, 1.8, 0.2, 2.1, 0.9, -3.6, ironMat)
        mkBox(0.2, 1.8, 0.2, -2.1, 0.9, 3.6, ironMat)
        mkBox(0.2, 1.8, 0.2, 2.1, 0.9, 3.6, ironMat)

        // ── DETAIL PANEL above bookcase ──────────────────────────────────────────
        const PANEL_W = 11.0, PANEL_H = 4.2
        const PANEL_Y = BC_H + 2.8
        const PANEL_Z = -HD + 0.12

        const panelFrame = new THREE.Mesh(new THREE.BoxGeometry(PANEL_W + 0.32, PANEL_H + 0.32, 0.08),
            new THREE.MeshStandardMaterial({ color: 0x0e0b05, metalness: 0.68, roughness: 0.32 }))
        panelFrame.position.set(0, PANEL_Y, PANEL_Z)
        scene.add(panelFrame)

        const ledMat2 = new THREE.MeshBasicMaterial({ color: 0xff9a18 })
        for (let i = 0; i < 36; i++) {
            const lx = -PANEL_W / 2 + (i / 35) * PANEL_W
                ;[PANEL_Y + PANEL_H / 2 + 0.17, PANEL_Y - PANEL_H / 2 - 0.17].forEach(ly => {
                    const led = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 4), ledMat2)
                    led.position.set(lx, ly, PANEL_Z + 0.045); scene.add(led)
                })
        }

        const detailTex = makeDetailPanel(SKILLS[0], perf.textureScale)
        const panelMat = new THREE.MeshStandardMaterial({
            map: detailTex, roughness: 0.15,
            emissive: new THREE.Color(0.04, 0.04, 0.07), emissiveIntensity: 0.38,
        })
        const panelMesh = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W, PANEL_H), panelMat)
        panelMesh.position.set(0, PANEL_Y, PANEL_Z + 0.07); scene.add(panelMesh)

        const panelGlow = new THREE.PointLight(0xffaa44, 24, 14, 1.4)
        panelGlow.position.set(0, PANEL_Y, PANEL_Z + 2.8); scene.add(panelGlow)

        // ── LIGHTING ─────────────────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0x110908, 24))
        const fill = new THREE.DirectionalLight(0x221a0a, 2.8)
        fill.position.set(2, RH, HD + 2); fill.target.position.set(0, 2, 0)
        scene.add(fill); scene.add(fill.target)

        // Chandelier
        const CHAN_Y = RH - 0.65
        const dropRod = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.023, 1.3, 8), ironMat)
        dropRod.position.set(0, CHAN_Y - 0.65, 0); scene.add(dropRod)
        const chanRing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.044, 8, 28), ironMat)
        chanRing.position.set(0, CHAN_Y - 1.3, 0); scene.add(chanRing)

        const flameMat = new THREE.MeshBasicMaterial({ color: 0xff9022 })
        const flames: THREE.Mesh[] = []
        for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2
            const ax = Math.cos(ang) * 1.05, az = Math.sin(ang) * 1.05
            const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.05, 6), ironMat)
            spoke.rotation.z = Math.PI / 2; spoke.rotation.y = ang
            spoke.position.set(ax * 0.52, CHAN_Y - 1.3, az * 0.52); scene.add(spoke)
            const cs = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.20, 8), new THREE.MeshStandardMaterial({ color: 0xd0b880, roughness: 0.9 }))
            cs.position.set(ax, CHAN_Y - 1.18, az); scene.add(cs)
            const cf = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), flameMat)
            cf.position.set(ax, CHAN_Y - 0.94, az); scene.add(cf); flames.push(cf)
            const cl = new THREE.PointLight(0xffaa44, 14, 8, 2)
            cl.position.copy(cf.position); scene.add(cl)
        }
        const pendant = new THREE.Mesh(new THREE.SphereGeometry(0.10, 10, 10), ironMat)
        pendant.position.set(0, CHAN_Y - 1.48, 0); scene.add(pendant)
        const chanLight = new THREE.PointLight(0xffcc66, 90, 40, 1.4)
        chanLight.position.set(0, RH - 1.3, 0);
        chanLight.castShadow = perf.shadows;
        chanLight.shadow.mapSize.set(perf.shadowMapSize, perf.shadowMapSize);
        scene.add(chanLight)

        const panelSpot = new THREE.SpotLight(0xfff5e0, 58, 20, Math.PI / 7, 0.28, 1.1)
        panelSpot.position.set(0, RH - 0.45, PANEL_Z + 4.5); panelSpot.target = panelMesh; scene.add(panelSpot)

        // Wall sconces
        const sconcePos = [
            { x: -9.5, z: -HD + 0.18, ry: 0 }, { x: 9.5, z: -HD + 0.18, ry: 0 },
            { x: -HW + 0.18, z: -2.5, ry: Math.PI / 2 }, { x: HW - 0.18, z: -2.5, ry: -Math.PI / 2 },
        ]
        sconcePos.forEach(({ x, z, ry }) => {
            mkBox(0.10, 0.36, 0.10, x, 3.3, z, ironMat, ry)
            const sf = new THREE.Mesh(new THREE.SphereGeometry(0.019, 6, 6), flameMat)
            sf.position.set(x + Math.sin(ry) * 0.26, 3.55, z + Math.cos(ry) * 0.26)
            scene.add(sf); flames.push(sf)
            const sl = new THREE.PointLight(0xffaa44, 24, 8, 2)
            sl.position.copy(sf.position); scene.add(sl)
        })

        // Rug
        const rugC = document.createElement('canvas'); rugC.width = 512; rugC.height = 512
        const rc = rugC.getContext('2d')!
        rc.fillStyle = '#160606'; rc.fillRect(0, 0, 512, 512)
        rc.strokeStyle = '#8a1c1c'; rc.lineWidth = 18; rc.strokeRect(10, 10, 492, 492)
        rc.strokeStyle = '#cc3322'; rc.lineWidth = 7; rc.strokeRect(24, 24, 464, 464)
        for (let x = 0; x < 512; x += 44) for (let y = 0; y < 512; y += 44) {
            rc.save(); rc.translate(x + 22, y + 22); rc.rotate(Math.PI / 4)
            rc.strokeStyle = 'rgba(190,70,35,0.18)'; rc.lineWidth = 1.5; rc.strokeRect(-10, -10, 20, 20); rc.restore()
        }
        const cg = rc.createRadialGradient(256, 256, 0, 256, 256, 110)
        cg.addColorStop(0, 'rgba(200,70,30,0.28)'); cg.addColorStop(1, 'rgba(0,0,0,0)')
        rc.fillStyle = cg; rc.fillRect(0, 0, 512, 512)
        const rug = new THREE.Mesh(new THREE.PlaneGeometry(10, 7), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(rugC), roughness: 0.95 }))
        rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.005, 3.5); scene.add(rug)

        // Dust
        const PC = Math.floor((perf.isMobile ? 220 : 400) * perf.particlesScale), pGeo = new THREE.BufferGeometry()
        const pArr = new Float32Array(PC * 3)
        for (let i = 0; i < PC; i++) { pArr[i * 3] = (Math.random() - 0.5) * RW * .85; pArr[i * 3 + 1] = Math.random() * RH; pArr[i * 3 + 2] = (Math.random() - 0.5) * RD * .85 }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3))
        scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xccaa88, size: 0.019, transparent: true, opacity: 0.20, blending: THREE.AdditiveBlending, depthWrite: false })))

        // ── CAROUSEL INTERACTION ─────────────────────────────────────────────────
        let internalSelectedIdx = -1
        let internalShelfIdx = 0
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2(-99, -99)

        const selectCube = (idx: number, fromReact = false) => {
            if (idx === internalSelectedIdx) return
            if (idx < 0 || idx >= SKILLS.length) return

            // Auto switch shelf if skill on different one
            const skill = SKILLS[idx]
            const sIdx = catNames.indexOf(skill.category)
            if (sIdx !== -1) {
                if (sIdx !== internalShelfIdx) {
                    internalShelfIdx = sIdx
                    setShelfIndex(sIdx)
                }
                // Auto switch page if skill is on another page
                const shelfSkills = SKILLS.map((sk, k) => ({ sk, k })).filter(item => item.sk.category === skill.category)
                const kInShelf = shelfSkills.findIndex(item => item.k === idx)
                if (kInShelf !== -1) {
                    const pageIdx = Math.floor(kInShelf / 20)
                    setShelfPages(prev => {
                        const next = [...prev]
                        if (next[sIdx] !== pageIdx) {
                            next[sIdx] = pageIdx
                            return next
                        }
                        return prev
                    })
                }
            }

            if (internalSelectedIdx >= 0) {
                cubeFrontMats[internalSelectedIdx].emissive.set(0.02, 0.02, 0.04)
                cubeFrontMats[internalSelectedIdx].emissiveIntensity = 0.4
                accentLights[internalSelectedIdx].intensity = 0
                plaqueMats[internalSelectedIdx].map?.dispose()
                plaqueMats[internalSelectedIdx].map = makeNamePlaque(SKILLS[internalSelectedIdx], false)
                plaqueMats[internalSelectedIdx].needsUpdate = true
            }
            internalSelectedIdx = idx
            cubeFrontMats[idx].emissive.set(0.10, 0.10, 0.16)
            cubeFrontMats[idx].emissiveIntensity = 1.4
            accentLights[idx].intensity = 12
            plaqueMats[idx].map?.dispose()
            plaqueMats[idx].map = makeNamePlaque(SKILLS[idx], true)
            plaqueMats[idx].needsUpdate = true

            // Panel update removed or logic changed? Wait, I need panel update
            panelMat.map?.dispose()
            panelMat.map = makeDetailPanel(SKILLS[idx], perf.textureScale)
            panelMat.map.needsUpdate = true; panelMat.needsUpdate = true

            const { r, g, b } = hexToRgb(SKILLS[idx].color)
            panelGlow.color.setRGB(r / 255, g / 255, b / 255)
            accentLights[idx].color.setRGB(r / 255, g / 255, b / 255)
            panelSpot.color.setRGB(0.5 + r / 255 * .5, 0.5 + g / 255 * .5, 0.5 + b / 255 * .5)

            const sIdxAuto = Math.floor(idx / 5)
            if (sIdxAuto !== internalShelfIdx) { internalShelfIdx = sIdxAuto; setShelfIndex(sIdxAuto) }
            if (!fromReact) setCurrentIndex(idx)
        }

        sceneRef.current.selectCube = (i) => selectCube(i, true)
        sceneRef.current.setShelf = (i) => { internalShelfIdx = i; setShelfIndex(i) }
        selectCube(0)

        const onMouseMove = (e: MouseEvent) => {
            const rect = mount.getBoundingClientRect()
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        }
        const onClick = (e: MouseEvent) => {
            const rect = mount.getBoundingClientRect()
            const m = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
            raycaster.setFromCamera(m, camera)
            const hits = raycaster.intersectObjects(cubeMeshes)
            if (hits.length > 0) { const i = hits[0].object.userData.cubeIdx; if (i !== undefined) selectCube(i) }
        }
        mount.addEventListener('mousemove', onMouseMove)
        mount.addEventListener('click', onClick)

        // ANIMATE
        const clock = new THREE.Clock()
        const camTargetPos = new THREE.Vector3()
        const camLookAt = new THREE.Vector3()
        let raf: number

        const animate = () => {
            raf = requestAnimationFrame(animate)
            if (!isActiveRef.current) return
            const t = clock.getElapsedTime()

            // ── CAMERA: head-on view with balanced distance ──────────────
            const shelf = shelfConfigs[internalShelfIdx]
            const STAND_DIST = 1.5          // Small offset from center towards opposite wall
            const CAM_H = 5.4           // Elevated view
            const SWAY_XZ = 0.22          // Gentle idle drift
            const SWAY_Y = 0.12

            // Target: opposite direction of the shelf from center
            camTargetPos.set(
                Math.sin(shelf.ry) * STAND_DIST + Math.sin(t * 0.08) * SWAY_XZ,
                CAM_H + Math.sin(t * 0.13) * SWAY_Y,
                Math.cos(shelf.ry) * STAND_DIST + Math.cos(t * 0.08) * SWAY_XZ
            )

            // Look directly at the bookcase center
            const targetLookAt = new THREE.Vector3().copy(shelf.pos).setY(4.6)

            camLookAt.lerp(targetLookAt, 0.05)
            camera.position.lerp(camTargetPos, 0.04)
            camera.lookAt(camLookAt)
            // ───────────────────────────────────────────────────────────────────────

            chanLight.intensity = 86 + Math.sin(t * 11) * 11 * Math.random() + Math.sin(t * 3.2) * 17
            flames.forEach((f, i) => { f.position.y += Math.sin(t * (7.5 + i * 1.05)) * .005 })

            cubeGroups.forEach((grp, i) => {
                if (!grp) return
                const baseY = grp.userData.baseY || 2.38
                const page = grp.userData.page || 0
                const activePage = shelfPages[internalShelfIdx]

                // Inner Carousel Sliding Animation
                const targetX = grp.userData.targetX
                const pageOffset = (page - activePage) * 15 // Slide 15 units per page
                grp.position.x = THREE.MathUtils.lerp(grp.position.x, targetX + pageOffset, 0.1)

                if (i === internalSelectedIdx) {
                    grp.position.y = baseY + 0.07 + Math.sin(t * 1.7) * .032
                    grp.rotation.y = Math.sin(t * .65) * .065
                    cubeFrontMats[i].emissiveIntensity = 1.2 + Math.sin(t * 2.8) * .4
                } else {
                    grp.position.y = baseY + Math.sin(t * .55 + i * .44) * .007
                    grp.rotation.y = 0
                }
            })

            const pp = pGeo.attributes.position.array as Float32Array
            for (let i = 0; i < PC; i++) {
                pp[i * 3] += Math.sin(t * .2 + i * .7) * .0013
                pp[i * 3 + 1] += Math.sin(t * .17 + i * .9) * .001
                pp[i * 3 + 2] += Math.cos(t * .19 + i * .6) * .0013
                if (pp[i * 3 + 1] > RH) pp[i * 3 + 1] = 0
                if (pp[i * 3 + 1] < 0) pp[i * 3 + 1] = RH
            }
            pGeo.attributes.position.needsUpdate = true

            raycaster.setFromCamera(mouse, camera)
            mount.style.cursor = raycaster.intersectObjects(cubeMeshes).length > 0 ? 'pointer' : 'default'
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
            mount.removeEventListener('mousemove', onMouseMove)
            mount.removeEventListener('click', onClick)
            renderer.dispose()
            if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
        }
    }, [])

    useEffect(() => { sceneRef.current.selectCube?.(currentIndex) }, [currentIndex])
    useEffect(() => { sceneRef.current.setShelf?.(shelfIndex) }, [shelfIndex])

    const shelfCategories = ['Frontend', 'Backend', 'Other Skills', 'Coding Languages']
    const skill = SKILLS[currentIndex]

    return (
        <div className="relative w-full h-full bg-black overflow-hidden select-none">
            <div ref={mountRef} className="absolute inset-0" />

            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0 z-10"
                style={{ background: 'radial-gradient(circle at 50% 46%, transparent 24%, rgba(0,0,0,0.88) 100%)' }} />

            {/* Header */}
            <div className="pointer-events-none absolute top-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
                <div className="flex items-center gap-5">

                </div>
                <p className="text-[9px] tracking-[0.55em] uppercase font-mono" style={{ color: 'rgba(200,160,80,0.35)' }}>
                    Scroll to switch sections  ·  {shelfCategories[shelfIndex]}
                </p>
            </div>

            {/* Shelf Carousel Navigation */}
            <div className="absolute bottom-10 right-12 z-30 flex items-center gap-8">
                <button onClick={() => setShelfIndex((shelfIndex + 3) % 4)}
                    className="p-4 border border-white/10 rounded-full hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group">
                    <span className="text-xl text-yellow-500/50 group-hover:text-yellow-500">←</span>
                </button>
                <div className="flex flex-col items-end min-w-[140px]">
                    <p className="text-[10px] font-mono tracking-[0.4em] uppercase opacity-40">Section {shelfIndex + 1}/4</p>
                    <h4 className="text-xl font-serif text-yellow-500/90">{shelfCategories[shelfIndex]}</h4>

                    {/* Inner Page Controls */}
                    {SKILLS.filter(s => s.category === shelfCategories[shelfIndex]).length > 20 && (
                        <div className="mt-2 flex items-center gap-4 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShelfPages(prev => {
                                        const next = [...prev]
                                        next[shelfIndex] = Math.max(0, next[shelfIndex] - 1)
                                        return next
                                    })
                                }}
                                disabled={shelfPages[shelfIndex] === 0}
                                className="text-xs text-yellow-500/40 hover:text-yellow-500 disabled:opacity-20 uppercase font-bold tracking-widest"
                            >
                                Prev
                            </button>
                            <span className="text-[10px] font-mono text-white/50">{shelfPages[shelfIndex] + 1} / {Math.ceil(SKILLS.filter(s => s.category === shelfCategories[shelfIndex]).length / 20)}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShelfPages(prev => {
                                        const next = [...prev]
                                        const maxPage = Math.ceil(SKILLS.filter(s => s.category === shelfCategories[shelfIndex]).length / 20) - 1
                                        next[shelfIndex] = Math.min(maxPage, next[shelfIndex] + 1)
                                        return next
                                    })
                                }}
                                disabled={shelfPages[shelfIndex] >= Math.ceil(SKILLS.filter(s => s.category === shelfCategories[shelfIndex]).length / 20) - 1}
                                className="text-xs text-yellow-500/40 hover:text-yellow-500 disabled:opacity-20 uppercase font-bold tracking-widest"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
                <button onClick={() => setShelfIndex((shelfIndex + 1) % 4)}
                    className="p-4 border border-white/10 rounded-full hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all group">
                    <span className="text-xl text-yellow-500/50 group-hover:text-yellow-500">→</span>
                </button>
            </div>

            {/* Detailed Overlay (JSX) */}
            <div className="absolute bottom-20 left-12 z-30 w-full max-w-sm" key={currentIndex}
                style={{ animation: 'revealSkill 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div className="p-6 relative backdrop-blur-md" style={{
                    background: 'rgba(10,8,4,0.88)',
                    border: `1px solid ${skill.color}33`,
                    boxShadow: `0 0 40px ${skill.color}0a`,
                }}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl" style={{ textShadow: `0 0 20px ${skill.color}88` }}>{skill.fallbackIcon}</span>
                            <div>
                                <h3 className="text-2xl font-bold" style={{ color: skill.color, fontFamily: 'Georgia, serif' }}>{skill.name}</h3>
                                <p className="text-[10px] font-mono tracking-widest uppercase opacity-40">{skill.category}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-mono font-bold" style={{ color: skill.color }}>{skill.level}%</p>
                            <p className="text-[9px] font-mono opacity-30">MASTERY</p>
                        </div>
                    </div>
                    <div className="h-px w-full mb-4" style={{ background: `linear-gradient(to right, ${skill.color}44, transparent)` }} />
                    <p className="text-sm leading-relaxed text-gray-400 italic font-serif mb-4">
                        "{skill.description}"
                    </p>
                    <div className="flex gap-4">
                        <div>
                            <p className="text-[9px] font-mono opacity-30 uppercase">Experience</p>
                            <p className="text-xs font-mono" style={{ color: skill.color }}>{skill.years}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-mono opacity-30 uppercase">Status</p>
                            <p className="text-xs font-mono" style={{ color: skill.color }}>{skill.level >= 90 ? 'Expert' : 'Advanced'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selection Grid (Filtered by Shelf) */}
            <div className="absolute top-28 right-8 z-30 flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {SKILLS.map((s, i) => {
                    if (s.category !== shelfCategories[shelfIndex]) return null
                    return (
                        <button key={i} onClick={() => setCurrentIndex(i)}
                            className={`group relative flex items-center gap-3 px-4 py-2 transition-all duration-300 ${i === currentIndex ? 'scale-105 origin-right' : 'hover:translate-x-[-4px] opacity-40 hover:opacity-100'}`}
                            style={{ borderRight: `3px solid ${i === currentIndex ? s.color : 'transparent'}` }}>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-mono tracking-tighter opacity-70 group-hover:opacity-100">{s.name}</span>
                                <span className="text-[8px] font-mono opacity-30">{s.category}</span>
                            </div>
                            <span className="text-xl grayscale group-hover:grayscale-0 transition-all duration-300"
                                style={{ textShadow: i === currentIndex ? `0 0 10px ${s.color}66` : 'none' }}>
                                {s.fallbackIcon}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Exit */}
            <button
                onClick={() => window.dispatchEvent(new CustomEvent('exit-room'))}
                className="absolute top-7 left-8 z-20 px-5 py-2 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300"
                style={{ border: '1px solid rgba(200,160,40,0.18)', color: 'rgba(200,160,60,0.35)' }}>
                ← Exit
            </button>

            <style>{`
                @keyframes revealSkill {
                    0% { opacity: 0; transform: translateX(-20px); filter: blur(5px); }
                    100% { opacity: 1; transform: translateX(0); filter: blur(0); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(200,160,60,0.2); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(200,160,60,0.4); }
            `}</style>
        </div>
    )
}
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import guify from 'guify'

import terrainVertex from './shaders/terrain/vertex.glsl'
import terrainFragment from './shaders/terrain/fragment.glsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Debug

const debug = new guify({
  title: 'Terrain Controls',
  align: 'right',
  theme: 'dark',
  barMode: 'none',
})

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Terrain
 */

const terrain = {}

// Texture
terrain.texture = {}
terrain.texture.linesCount = 5
terrain.texture.bigLineWidth = 0.04
terrain.texture.smallLineWidth = 0.01
terrain.texture.width = 32
terrain.texture.height = 128
terrain.texture.canvas = document.createElement('canvas')
terrain.texture.canvas.width = terrain.texture.width
terrain.texture.canvas.height = terrain.texture.height
terrain.texture.canvas.style.position = 'fixed'
terrain.texture.canvas.style.top = 0
terrain.texture.canvas.style.left = 0
terrain.texture.canvas.style.zIndex = 1
document.body.append(terrain.texture.canvas)

terrain.texture.context = terrain.texture.canvas.getContext('2d')

terrain.texture.instance = new THREE.CanvasTexture(terrain.texture.canvas)
terrain.texture.instance.wrapS = THREE.RepeatWrapping
terrain.texture.instance.wrapT = THREE.RepeatWrapping
terrain.texture.instance.magFilter = THREE.NearestFilter

terrain.texture.update = () => {
  terrain.texture.context.clearRect(0, 0, terrain.texture.width, terrain.texture.height)

  // Big line
  const actualBigLineWidth = Math.round(terrain.texture.height * terrain.texture.bigLineWidth)
  terrain.texture.context.globalAlpha = 1
  terrain.texture.context.fillStyle = '#ffffff'
  terrain.texture.context.fillRect(0, 0, terrain.texture.width, actualBigLineWidth)

  // Small lines
  const actualSmallLineWidth = Math.round(terrain.texture.height * terrain.texture.smallLineWidth)
  const smallLinesCount = terrain.texture.linesCount - 1

  for (let i = 0; i < smallLinesCount; i++) {
    terrain.texture.context.globalAlpha = 0.5
    terrain.texture.context.fillRect(
      0,
      actualBigLineWidth +
        Math.round((terrain.texture.height - actualBigLineWidth) / terrain.texture.linesCount) * (i + 1),
      terrain.texture.width,
      actualSmallLineWidth,
    )
  }

  // Update texture instance
  terrain.texture.instance.needsUpdate = true
}

terrain.texture.update()

// Debug
debug.Register({
  object: terrain.texture,
  label: 'linesCount',
  property: 'linesCount',
  type: 'range',
  min: 1,
  max: 10,
  step: 1,
  onChange: () => {
    terrain.texture.update()
  },
})

// Geometry
terrain.geometry = new THREE.PlaneGeometry(1, 1, 800, 800)
terrain.geometry.rotateX(-Math.PI * 0.5)

// Material
terrain.material = new THREE.ShaderMaterial({
  vertexShader: terrainVertex,
  fragmentShader: terrainFragment,
  transparent: true,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  uniforms: {
    uTexture: { value: terrain.texture.instance },
    uElevation: { value: 2 },
  },
})

// Debug
debug.Register({
  object: terrain.material.uniforms.uElevation,
  label: 'uElevation',
  property: 'value',
  type: 'range',
  min: 0,
  max: 5,
  step: 0.001,
})

// Mesh
terrain.mesh = new THREE.Mesh(terrain.geometry, terrain.material)
terrain.mesh.scale.set(10, 10, 10)
scene.add(terrain.mesh)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setClearColor(0x111111, 1)
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Debug
const guiDummy = {}
guiDummy.clearColor = '#043136'
debug.Register({
  object: guiDummy,
  label: 'clearColor',
  property: 'clearColor',
  type: 'color',
  format: 'hex',
  onChange: () => {
    renderer.setClearColor(guiDummy.clearColor, 1)
  },
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()

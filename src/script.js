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

// Geometry
terrain.geometry = new THREE.PlaneGeometry(1, 1, 600, 600)
terrain.geometry.rotateX(-Math.PI * 0.5)

// Material
terrain.material = new THREE.ShaderMaterial({
  vertexShader: terrainVertex,
  fragmentShader: terrainFragment,
  transparent: true,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  uniforms: {
    uElevation: { value: 1 },
  },
})

// Debug
debug.Register({
  object: terrain.material.uniforms.uElevation,
  property: 'value',
  label: '',
  type: 'range',
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
guiDummy.clearColor = '#111111'
debug.Register({
  object: guiDummy,
  property: 'clearColor',
  label: 'clearColor',
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

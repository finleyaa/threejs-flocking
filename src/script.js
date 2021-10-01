import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import Boid from './boid'

const gui = new dat.GUI()

const canvas = document.querySelector('canvas.webgl')

window.ondblclick = () => {
  if (document.fullscreenElement == canvas) {
    document.exitFullscreen()
  } else {
    canvas.requestFullscreen()
  }
}

const scene = new THREE.Scene()

// const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshToonMaterial({ color: 'gray' })
// const mesh = new THREE.Mesh(geometry, material)
// scene.add(mesh)

const boidNumber = 800
const boids = []

const properties = {
  velocityLimit: 2,
  cohesionForceLimit: 0.05,
  alignmentForceLimit: 0.06,
  seperationForceLimit: 0.3,
  cohesionThreshold: 25,
  alignmentThreshold: 25,
  seperationThreshold: 1.5,
  reset() {
    boids.forEach((b) => {
      b.mesh.position.x = (Math.random() * 2 - 1) * 20
      b.mesh.position.y = (Math.random() * 2 - 1) * 20
      b.mesh.position.z = (Math.random() * 2 - 1) * 20
      b.vel = [0, 0, 0]
    })
  },
  applyRandomForce() {
    boids.forEach((b) => {
      let randomForce = [
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ]
      randomForce = b._setMag(randomForce, (Math.random() * 2 - 1) * 5)
      b.applyForce(randomForce)
    })
  },
  bounds: {
    x: 50,
    y: 50,
    z: 50
  },
  backgroundColor: 0xffa76e,
  ambientLightColor: 0x0,
  pointLightColor: 0x0
}

gui.add(properties, 'velocityLimit', 0.1, 10, 0.01)
gui.add(properties, 'cohesionForceLimit', 0.01, 1, 0.001)
gui.add(properties, 'alignmentForceLimit', 0.01, 1, 0.001)
gui.add(properties, 'seperationForceLimit', 0.01, 1, 0.001)
gui.add(properties, 'cohesionThreshold', 0.1, 50, 0.01)
gui.add(properties, 'alignmentThreshold', 0.1, 50, 0.01)
gui.add(properties, 'seperationThreshold', 0.1, 50, 0.01)
gui.add(properties, 'reset')
gui.add(properties, 'applyRandomForce')
gui.add(properties.bounds, 'x', 10, 1000, 1)
gui.add(properties.bounds, 'y', 10, 1000, 1)
gui.add(properties.bounds, 'z', 10, 1000, 1)
gui.addColor(properties, 'backgroundColor').onChange((val) => {
  renderer.setClearColor(val)
})
gui.addColor(properties, 'ambientLightColor').onChange((val) => {
  ambientLight.color = new THREE.Color(val)
})
gui.addColor(properties, 'pointLightColor').onChange((val) => {
  pointLight.color = new THREE.Color(val)
})

for (let i = 0; i < boidNumber; i++) {
  let startPos = [
    (Math.random() * 2 - 1) * 20,
    (Math.random() * 2 - 1) * 20,
    (Math.random() * 2 - 1) * 20
  ]
  boids.push(new Boid(startPos, material))
}

boids.forEach((b) => {
  let randomForce = [
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  ]
  randomForce = b._setMag(randomForce, (Math.random() * 2 - 1) * 5)
  b.applyForce(randomForce)
  scene.add(b.mesh)
})

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
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

const ambientLight = new THREE.AmbientLight(properties.ambientLightColor, 1)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(
  properties.pointLightColor,
  1,
  properties.bounds.y * 3
)
pointLight.position.y = properties.bounds.y
pointLight.position.z = properties.bounds.z
scene.add(pointLight)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = properties.bounds.z * 2
camera.position.y = properties.bounds.y
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(properties.backgroundColor)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  boids.forEach((b) => {
    b.cohesion(
      boids,
      properties.cohesionThreshold,
      properties.cohesionForceLimit
    )
    b.alignment(
      boids,
      properties.alignmentThreshold,
      properties.velocityLimit,
      properties.alignmentForceLimit
    )
    b.cohesion(
      boids,
      properties.seperationThreshold,
      properties.velocityLimit,
      properties.seperationForceLimit
    )
    b.update(properties.velocityLimit, properties.bounds)
  })

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()

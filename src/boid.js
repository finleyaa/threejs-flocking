import * as THREE from 'three'

function Boid(startLocation, material) {
  this.mesh = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 8, 1), material)
  this.mesh.position.x = startLocation[0]
  this.mesh.position.y = startLocation[1]
  this.mesh.position.z = startLocation[2]
  this.vel = [0, 0, 0]
  this.acc = [0, 0, 0]

  this._setMag = (v3, mag) => {
    let calculatedMag = Math.sqrt(v3[0] ** 2 + v3[1] ** 2 + v3[2] ** 2)
    if (calculatedMag !== 0) {
      return [
        (v3[0] / calculatedMag) * mag,
        (v3[1] / calculatedMag) * mag,
        (v3[2] / calculatedMag) * mag
      ]
    }
    return v3
  }

  this._limit = (v3, mag) => {
    let calculatedMag = Math.sqrt(v3[0] ** 2 + v3[1] ** 2 + v3[2] ** 2)
    if (calculatedMag !== 0 && calculatedMag > mag) {
      return [
        (v3[0] / calculatedMag) * mag,
        (v3[1] / calculatedMag) * mag,
        (v3[2] / calculatedMag) * mag
      ]
    }
    return v3
  }

  this.applyForce = (v3) => {
    this.acc[0] += v3[0]
    this.acc[1] += v3[1]
    this.acc[2] += v3[2]
  }

  this.alignment = (boids, alignmentThreshold, velocityLimit, forceLimit) => {
    let average = [0, 0, 0]
    let total = 0
    boids.forEach((boid) => {
      const dist = this.mesh.position.distanceTo(boid.mesh.position)
      if (dist < alignmentThreshold && boid != this) {
        average[0] += boid.vel[0]
        average[1] += boid.vel[1]
        average[2] += boid.vel[2]
        total++
      }
    })

    if (total > 0) {
      average[0] /= total
      average[1] /= total
      average[2] /= total
      average = this._setMag(average, velocityLimit)
      average[0] -= this.vel[0]
      average[1] -= this.vel[1]
      average[2] -= this.vel[1]
      average = this._limit(average, forceLimit)
      this.applyForce(average)
    }
  }

  this.cohesion = (boids, cohesionThreshold, forceLimit) => {
    let average = [0, 0, 0]
    let total = 0
    boids.forEach((boid) => {
      const dist = this.mesh.position.distanceTo(boid.mesh.position)
      if (dist < cohesionThreshold && boid != this) {
        average[0] += boid.mesh.position.x
        average[1] += boid.mesh.position.y
        average[2] += boid.mesh.position.z
        total++
      }
    })

    if (total > 0) {
      average[0] /= total
      average[1] /= total
      average[2] /= total
      // this._setMag(average, velocityLimit)
      average[0] -= this.mesh.position.x
      average[1] -= this.mesh.position.y
      average[2] -= this.mesh.position.z
      average = this._limit(average, forceLimit)
      this.applyForce(average)
    }
  }

  this.seperation = (boids, seperationThreshold, velocityLimit, forceLimit) => {
    let average = [0, 0, 0]
    let total = 0
    boids.forEach((boid) => {
      const dist = this.mesh.position.distanceTo(boid.mesh.position)
      if (dist < seperationThreshold && boid != this) {
        let diff = []
        diff.push(this.mesh.position.x - boid.mesh.position.x)
        diff.push(this.mesh.position.y - boid.mesh.position.y)
        diff.push(this.mesh.position.z - boid.mesh.position.z)
        average[0] += diff[0]
        average[1] += diff[1]
        average[2] += diff[2]
        total++
      }
    })

    if (total > 0) {
      average[0] /= total
      average[1] /= total
      average[2] /= total
      average = this._setMag(average, velocityLimit)
      average = this._limit(average, forceLimit)
      this.applyForce(average)
    }
  }

  this.update = (velocityLimit, bounds) => {
    this.mesh.position.x += this.vel[0]
    this.mesh.position.y += this.vel[1]
    this.mesh.position.z += this.vel[2]
    this.vel[0] += this.acc[0]
    this.vel[1] += this.acc[1]
    this.vel[2] += this.acc[2]
    this.vel = this._limit(this.vel, velocityLimit)

    if (this.mesh.position.x > bounds.x) {
      this.mesh.position.x = -bounds.x
    } else if (this.mesh.position.x < -bounds.x) {
      this.mesh.position.x = bounds.x
    }
    if (this.mesh.position.y > bounds.y) {
      this.mesh.position.y = -bounds.y
    } else if (this.mesh.position.y < -bounds.y) {
      this.mesh.position.y = bounds.y
    }
    if (this.mesh.position.z > bounds.z) {
      this.mesh.position.z = -bounds.z
    } else if (this.mesh.position.z < -bounds.z) {
      this.mesh.position.z = bounds.z
    }

    const vel3 = new THREE.Vector3(this.vel[0], this.vel[1], this.vel[2])
    const lookAtPos = new THREE.Vector3()
    lookAtPos.copy(this.mesh.position).add(vel3)

    this.mesh.lookAt(lookAtPos)
    this.mesh.rotation.order = 'YXZ'
    // this.mesh.rotation.z = Math.PI
    this.mesh.rotation.x = Math.PI * 0.5

    this.acc = [0, 0, 0]
  }
}

export default Boid

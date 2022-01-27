import { Vector3, MathUtils } from 'three';

const { randFloat, randFloatSpread } = MathUtils;

class Boid {
  constructor(index, maxBoids) {
    const something = index / maxBoids;
    this.position = new Vector3(
      randFloatSpread(1),
      randFloatSpread(1) + 1.5,
      randFloatSpread(1)
    );
    this.velocity = new Vector3(
      randFloat(-1 * something, 1 * something),
      randFloat(-1 * something, 1 * something),
      randFloat(-1 * something, 1 * something)
    );
    // this.velocity.setLength(randFloat(0.01, 0.02));
    this.acceleration = new Vector3();
    this.maxForce = 0.001;
    this.maxSpeed = 0.005;
    this.maxVelocity = 0.05;
  }

  updateMaxForce(newThing) {
    this.maxForce = newThing;
  }

  flock(otherBoids) {
    const alignment = this.align(otherBoids);
    this.applyForce(alignment);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, this.maxVelocity);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  align(otherBoids) {
    const perceptionRadius = 30;
    const steering = new Vector3(0, 0, 0);
    let total = 0;
    let distance = 0;
    for (const other of otherBoids) {
      distance = this.position.distanceTo(other.position);
      if (other !== this && distance < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.divideScalar(total);
      steering.setLength(this.maxSpeed);
      steering.sub(this.velocity);
      steering.clampLength(0, this.maxForce);
    }
    return steering;
  }
}

export default Boid;

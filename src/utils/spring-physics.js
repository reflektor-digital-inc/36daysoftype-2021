// Built out of this 2D P5.js example: https://p5js.org/examples/simulate-springs.html
// Sean Mombourquette
import * as THREE from 'three';

export default class Spring {
  constructor(vec3, drag = 0.94, mass = 10, k = 0.15) {
    this.v1 = vec3.clone();
    this.v2 = vec3;
    this.force = new THREE.Vector3();
    this.acc = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.d = drag;
    this.m = mass;
    this.k = k;
  }

  updateSpringPosition() {
    this.force.y = -this.k * (this.v2.y - this.v1.y);   // f=-ky
    this.acc.y = this.force.y / this.m;                     // Set the acceleration, f=ma == a=f/m
    this.vel.y = this.d * (this.vel.y + this.acc.y);       // Set the velocity
    this.v2.y = this.v2.y + this.vel.y;

    this.force.x = -this.k * (this.v2.x - this.v1.x);   // f=-kx
    this.acc.x = this.force.x / this.m;                     // Set the acceleration, f=ma == a=f/m
    this.vel.x = this.d * (this.vel.x + this.acc.x);       // Set the velocitx
    this.v2.x = this.v2.x + this.vel.x;

    this.force.z = -this.k * (this.v2.z - this.v1.z);   // f=-kz
    this.acc.z = this.force.z / this.m;                     // Set the acceleration, f=ma == a=f/m
    this.vel.z = this.d * (this.vel.z + this.acc.z);       // Set the velocitz
    this.v2.z = this.v2.z + this.vel.z;

    return this.v2;
  }
}
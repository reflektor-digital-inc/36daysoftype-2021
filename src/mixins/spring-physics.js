import * as THREE from 'three';
import { audiospriteSpriteNames } from '@utils/AudiospriteAudioController.js';
import { mapMutations } from 'vuex';

// Written by Sean Mombourquette
// Based off this 2D P5.js example: https://p5js.org/examples/simulate-springs.html
// How to use:
// 1) Import mixin to component
// 2) Call onMoveSpring(event) in the component's onMove event
// 3) Call setUpSpringChildren(children) in the component's setUpLetterChildren(children) event
// 4) Call updateSpring in the component's onUpdate(time) event
export default {
  created() {
    //
  },
  data() {
    return {
      pointerSpring : new THREE.Vector2(),
      position : new THREE.Vector3(),
      positionPrev : new THREE.Vector3(),
      movingMouse : false,
      springChildren : [],
      springTimer : 1,
      sfxTimer : 0
    };
  },
  mounted() {
    // Create Raycaster
    this.raycaster = new THREE.Raycaster();
  },
  methods : {
    ...mapMutations({
      unlockEasterEgg : 'easterEgg/unlockEasterEgg'
    }),
    setUpLetterSpring(children, d = 0.94, m = 10, k = 0.25) {
      children.forEach((child, i) => {
        child.origPosition = child.position.clone();
        child.origRotation = child.rotation.clone();
        child.origScale = child.scale.clone();
        // child.centerPoint = this.getCenterPoint(child);
        child.force = new THREE.Vector3();
        child.vel = new THREE.Vector3();
        child.acc = new THREE.Vector3();
        child.d = d;
        child.m = m;
        child.k = k;
        child.sfxTimer = 0;
        child.sfxId = i;
      });
    },
    updateSpring(children, letter) {
      if (!children || !this.camera) return;
      // Raycast mouse coords onto objects to determine the mouse's movement vector in 3d space
      this.raycaster.setFromCamera(this.pointerSpring, this.camera);
      const intersections = this.raycaster.intersectObjects(children);
      // this.intersection = (intersections.length) > 0 ? intersections[ 0 ] : null;
      this.sfxTimer--;
      let playSound = true;
      if (intersections.length > 0) {
        if (letter) this.unlockEasterEgg(letter);
        intersections.forEach((intersection, i) => {
          if (i < 6) {
            intersection.object.sfxTimer --;
            // update mouse position
            this.positionPrev.copy(this.getCenterPoint(intersection.object));
            // this.positionPrev.copy(intersection.object.position);
            this.position.copy(intersection.point);
            if (this.movingMouse) {
              const dir = new THREE.Vector3(); // create once an reuse it
              dir.subVectors(this.positionPrev, this.position).normalize();
              intersection.object.vel.add(dir.multiplyScalar(0.01));
              if (playSound && this.sfxTimer <= 0) {
                this.sfxTimer = 20 - Math.random() * 10;
                const id = this.$sfx.play(audiospriteSpriteNames[`triangle_${Math.floor(intersection.object.sfxId % 5) + 1}`]);
                this.$sfx.setVolume(id, 0.6);
                playSound = false;
              }
            }
          }
        });
        this.movingMouse = false;
      }
      // Apply spring physics to children
      children.forEach((child) => {
        // // UPDATE POSITIONS
        child.force.y = -child.k * (child.position.y - child.origPosition.y);   // f=-ky
        child.acc.y = child.force.y / child.m;                     // Set the acceleration, f=ma == a=f/m
        child.vel.y = child.d * (child.vel.y + child.acc.y);       // Set the velocity
        child.position.y = child.position.y + child.vel.y;

        child.force.x = -child.k * (child.position.x - child.origPosition.x);   // f=-kx
        child.acc.x = child.force.x / child.m;                     // Set the acceleration, f=ma == a=f/m
        child.vel.x = child.d * (child.vel.x + child.acc.x);       // Set the velocitx
        child.position.x = child.position.x + child.vel.x;

        child.force.z = -child.k * (child.position.z - child.origPosition.z);   // f=-kz
        child.acc.z = child.force.z / child.m;                     // Set the acceleration, f=ma == a=f/m
        child.vel.z = child.d * (child.vel.z + child.acc.z);       // Set the velocitz
        child.position.z = child.position.z + child.vel.z;

        // UPDATE ROTATION
        child.force.y = -child.k * (child.rotation.y - child.origRotation.y);   // f=-ky
        child.acc.y = child.force.y / child.m;                     // Set the acceleration, f=ma == a=f/m
        child.vel.y = child.d * (child.vel.y + child.acc.y);       // Set the velocity
        child.rotation.y = child.rotation.y + child.vel.y;

        child.force.x = -child.k * (child.rotation.x - child.origRotation.x);   // f=-kx
        child.acc.x = child.force.x / child.m;                     // Set the acceleration, f=ma == a=f/m
        child.vel.x = child.d * (child.vel.x + child.acc.x);       // Set the velocitx
        child.rotation.x = child.rotation.x + child.vel.x;

        child.force.z = -child.k * (child.rotation.z - child.origRotation.z);   // f=-kz
        child.acc.z = child.force.z / child.m;                     // Set the acceleration, f=ma == a=f/m
        child.vel.z = child.d * (child.vel.z + child.acc.z);       // Set the velocitz
        child.rotation.z = child.rotation.z + child.vel.z;

        // spring the scale
        // child.force.z = -child.k * (child.scale.z - child.origScale.z);   // f=-kz
        // child.acc.z = child.force.z / child.m;                     // Set the acceleration, f=ma == a=f/m
        // child.vel.z = 0.95 * (child.vel.z + child.acc.z);       // Set the velocitz
        // child.scale.z = child.scale.z + child.vel.z;
        // child.scale.x = child.scale.z;
        // child.scale.y = child.scale.z;
      });
    },
    
    onMoveSpring(event) {
      if (event.type === 'touchmove') {
        this.pointerSpring.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.pointerSpring.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
      else {
        this.pointerSpring.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointerSpring.y = - (event.clientY / window.innerHeight) * 2 + 1;
      }
      this.movingMouse = true;
    },
    getCenterPoint(mesh) {
      const geometry = mesh.geometry;
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      mesh.localToWorld(center);
      return center;
    }
  }
};

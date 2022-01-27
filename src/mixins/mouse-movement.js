import * as THREE from 'three';
import gsap from 'gsap'; // eslint-disable-line
import { mapMutations } from 'vuex';

export default {
  mounted() {
    this.raycaster = new THREE.Raycaster();
    // this.mouse = new THREE.Vector2();
    this.camera = this.$refs.renderer.three.camera;
    this.cameraOrigPosition = this.$refs.renderer.three.camera.position.clone();
    this.$refs.renderer.three.camera.lookAt(0, 0, 0);
    this.cameraPositionTarget = new THREE.Vector2();
    // if (!this.previousPoint) this.previousPoint = this.$refs.renderer.three.pointer.positionN;
    gsap.ticker.add(this.onCameraPositionUpdate);
  },
  unmounted() {
    gsap.ticker.remove(this.onCameraPositionUpdate);
    this.raycaster = null;
    this.cameraPositionTarget = null;
  },
  methods : {
    ...mapMutations({
      unlockEasterEgg : 'easterEgg/unlockEasterEgg'
    }),
    getIntersects(objects, letter) {
      //   // make or get a raycaster object
      const point = this.$refs.renderer.three.pointer.positionN;
      this.raycaster.setFromCamera(point, this.$refs.renderer.three.camera);
      const intersects = this.raycaster.intersectObjects(objects);
      if (letter && intersects.length !== 0) {
        this.unlockEasterEgg(letter);
      }
      return intersects;
    },
    getIntersectsRecursive(objects) {
      const point = this.$refs.renderer.three.pointer.positionN;
      this.raycaster.setFromCamera(point, this.$refs.renderer.three.camera);
      const intersects = this.raycaster.intersectObjects(objects, true);
      return intersects;
    },
    setCameraPositionTarget(point) {
      this.cameraPositionTarget = point?.clone();
    },
    onCameraPositionUpdate() {
      if (!this.camera || !this.camera.position || !this.cameraPositionTarget) return;
      this.camera.position.x += (this.cameraPositionTarget.x - this.camera.position.x) / 10;
      this.camera.position.y += (this.cameraPositionTarget.y - this.camera.position.y) / 10;
    },
    getMouseDist(mousePointX, mousePointY, child, shrink = 0.3, range = 4) {
      const mx = mousePointX;
      const my = mousePointY;

      let mouseDist = Math.hypot(mx - child.position.x, my - child.position.y);
      mouseDist = Math.max(Math.min(mouseDist / range, shrink), 0);
      // child.scale.setScalar(0.7 + mouseDist);
      return mouseDist;
    }
  }
};


import EventBus from '@utils/event-bus';
import * as THREE from 'three';
import { mapState } from 'vuex';

export default {
  computed : {
    ...mapState({
      hasLoaded : state => state.loader.hasLoaded
    })
  },
  methods : {
    cellUpdate() {
      if (this.skipRender) {
        this.skipRender = false;
        return;
      }
      if (this.transitionOut) {
        this.$refs.quad.material.opacity -= 0.01;
        this.$refs.quad.material.needsUpdate = true;
      }
      else {
        if (this.$refs.quad.material.opacity < 1 && this.hasLoaded) {
          this.$refs.quad.material.opacity += 0.001;
          this.$refs.quad.material.needsUpdate = true;
        }
      }
      if (!this.breakpointMobile) {
        // fast forward the first tiles that are created so that it forms an arrow
        this.$refs.quad.mesh.getWorldPosition(this.worldPos);
        if ((this.worldPos.x - Math.abs(this.$refs.quad.position.y / 10)) <= this.triggerDist) {
          if (this.ff) {
            this.$refs.quad.position.x -= 10000;
          }
          this.acc = this.accSpd;
          this.hspd += this.acc;
          if (this.hspd > this.maxHspd) {
            this.hspd = this.maxHspd;
          }
        }

        if (this.worldPos.x < -0.65 && !this.deleteSelf) {
          this.deleteSelf = true;
          EventBus.emit('deleteLandingGridCell', this.index);
        }
        this.$refs.quad.position.x -= this.hspd;
        // this.$refs.quad.position.x = -this.deletePoint;
      
        // vertical speed
        if (this.hspd > 0) {
          this.$refs.quad.position.y += Math.sign(this.$refs.quad.position.y) * this.hspd / 8;
        }
      
        this.ff = false;
      }
      else {
        this.$refs.quad.mesh.getWorldPosition(this.worldPos);
        if ((this.worldPos.y + Math.abs(this.$refs.quad.position.x / 10)) >= this.triggerDist) {
          if (this.ff) {
            this.$refs.quad.position.y -= 10000;
          }
          this.acc = this.accSpd;
          this.hspd += this.acc;
          if (this.hspd > this.maxHspd) {
            this.hspd = this.maxHspd;
          }
        }

        if (this.worldPos.y > 0.65 && !this.deleteSelf) {
          this.deleteSelf = true;
          EventBus.emit('deleteLandingGridCell', this.index);
        }
        this.$refs.quad.position.y += this.hspd;
      
        //vertical speed
        if (this.hspd > 0) {
          this.$refs.quad.position.x += Math.sign(this.$refs.quad.position.x) * this.hspd / 8;
        }
      
        this.ff = false;
      }
    },
    mouseInteraction() {
      this.letterBump -= 0.01;
      this.letterBump = Math.max(0, this.letterBump);

      this.letterBumpLerped = THREE.MathUtils.lerp(this.letterBumpLerped, this.letterBump, 0.1);

      this.letterGroup.rotation.x += 0.01 * this.speed * (1 + this.letterBumpLerped * 10) * this.dir;
      this.letterGroup.rotation.z += 0.01 * this.speed * (1 + this.letterBumpLerped * 10) * this.dir;

      this.bumpRotateLerped.lerp(this.bumpRotate, 0.1);

      this.$refs.quad.mesh.rotation.x = 0.8 * this.bumpRotateLerped.y * this.letterBumpLerped;
      this.$refs.quad.mesh.rotation.y = 0.8 * -this.bumpRotateLerped.x * this.letterBumpLerped;

      this.rtCamera.position.z = (this.letterBumpLerped + 1.5) / this.rtCamera.aspect;
    }
  }
};

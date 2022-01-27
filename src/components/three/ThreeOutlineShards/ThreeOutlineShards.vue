<template>
  <Group ref="shards">
    <Mesh :position="{ x : 4, y : -2, z : -7 }">
      <BarycentricTetrahedronGeometry :detail="0" :radius="4" />
    </Mesh>
    <Mesh :position="{ x : -1.6, y : -1.8, z : -4 }" :rotation="{ x : 1, y : 2, z : 2}">
      <BarycentricTetrahedronGeometry :detail="0" :radius="1.5" />
    </Mesh>
    <Mesh :position="{ x : 0, y : 1, z : -3 }">
      <BarycentricTetrahedronGeometry :detail="0" :radius="2" />
    </Mesh>
  </Group>
</template>

<script>
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import { mapState } from 'vuex';
  import { watch } from 'vue';
  import gsap from 'gsap';
  import { Group } from 'troisjs';
  import * as THREE from 'three';
  import BarycentricTetrahedronGeometry from '@components/troisExtensions/BarycentricTetrahedronGeometry.js';
  import wireframeFrag from '@shaders/wireframe_shard.frag';
  import wireframeVertex from '@shaders/wireframe.vert';

  export default {
    components : {
      BarycentricTetrahedronGeometry,
      Group
    },
    props : {
      color : { type : String, default : null },
      gradient : { type : String, default : 'linear-gradient(225deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)' },
      widthFactor : { type : Number, default : 0.3 },
      dashEnabled : { type : Boolean, default : false },
      dashLength : { type : Number, default : 5.5 },
      dashRepeats : { type : Number, default : 0.3 },
      squeezeEnabled : { type : Boolean, default : true },
      squeezeMin : { type : Number, default : 0.1 },
      squeezeMax : { type : Number, default : 0.3 }
    },
    computed : {
      ...mapState({
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height
      })
    },
    watch : {
      windowWidth() {
        if (this.material) {
          this.material.uniforms.resolution.value.x = this.windowWidth;
        }
      },
      windowHeight() {
        if (this.material) {
          this.material.uniforms.resolution.value.y = this.windowHeight;
        }
      }
    },
    mounted() {
      Object.keys(this.$props).forEach((p) => {
        watch(() => this[p], () => {
          this.setupMaterial(); // TODO : Research other solutions. Should really just change the uniform
        });
      });

      this.setupMaterial();
      this.$refs.shards.group.children.forEach((child) => {
        child.origPosition = child.position.clone();
      });

      gsap.ticker.add(this.onUpdate);
    },
    beforeUnmount() {
      this.material && this.material.dispose();
      this.material = null;
      this.gradientTexture && this.gradientTexture.dispose();
      this.gradientTexture = null;

      gsap.ticker.remove(this.onUpdate);
    },
    methods : {
      onUpdate(time) {
        this.$refs.shards.group.children.forEach((child, index) => {
          const dir = Math.sign(index % 2 - 0.5);
          child.rotation.x += 0.001 * (index + 1) * dir;
          child.rotation.y += 0.001 * (index + 1) * dir;
          child.rotation.z += 0.001 * (index + 1) * dir;
          child.position.y = child.origPosition.y + Math.sin(time) * dir * 0.4;
        });
      },
      setupMaterial() {
        if (this.material) this.material.dispose();
        if (this.gradientTexture) {
          this.gradientTexture.image = null;
          this.gradientTexture.dispose();
        }

        this.gradientTexture = generateGradientTextureFromString(this.gradient);

        this.material = new THREE.ShaderMaterial({
          extensions : {
            // needed for anti-alias smoothstep, aastep()
            derivatives : true
          },
          uniforms : {
            colorEnabled : { value : !!this.color },
            color : { value : new THREE.Color(this.color) },
            widthFactor : { value : this.widthFactor },
            resolution : { value : new THREE.Vector2(this.windowWidth, this.windowHeight) },
            gradientTexture : { value : this.gradientTexture },
            sdfOffset : { value : new THREE.Vector3(0, 0, 0) },
            dashEnabled : { value : this.dashEnabled },
            dashRepeats : { value : this.dashRepeats },
            dashLength : { value : this.dashLength },
            squeezeEnabled : { value : this.squeezeEnabled },
            squeezeMin : { value : this.squeezeMin },
            squeezeMax : { value : this.squeezeMax }
          },
          transparent : true,
          side : THREE.DoubleSide,
          vertexShader : wireframeVertex,
          fragmentShader : wireframeFrag
        });

        this.$refs.shards.group.children.forEach((child) => {
          child.material = this.material;
        });
      }
    }
  };
</script>

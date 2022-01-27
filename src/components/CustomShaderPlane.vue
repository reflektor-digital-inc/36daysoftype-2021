<template>
  <Plane
    ref="mesh"
    :scale="{x: 3, y: 3, z: 3}"
    :rotation="{ z: Math.PI / 2 }"
  >
    <ShaderMaterial
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
      :uniforms="uniforms"
    />
  </Plane>
</template>

<script>
  import { Uniform } from 'three';
  import gsap from 'gsap';
  import vertexShader from '@shaders/baseVertex.vert';
  import fragmentShader from '@shaders/movingCross.frag';

  // import fragmentShader from '../shaders/uvColor.frag';

  export default {
    inject : ['three'],
    props : {
      isActive : { type : Boolean, default : true }
    },
    data() {
      return {
        vertexShader : vertexShader,
        fragmentShader : fragmentShader,
        uniforms : {
          time : new Uniform(0)
        }
      };
    },
    mounted() {
      this.mesh = this.$refs.mesh.mesh;

      gsap.ticker.add(this.update);
    },
    unmounted() {
      gsap.ticker.remove(this.update);
    },
    methods : {
      update(time) {
        if (this.isActive) {
          this.uniforms.time.value = time;
        }
      }
    }
  };
</script>

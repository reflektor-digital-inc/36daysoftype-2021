<template>
  <Icosahedron
    ref="mesh"
    :scale="{ x : 100, y : 100, z : 100 }"
  >
    <ShaderMaterial
      :uniforms="uniforms"
      :fragment-shader="fragmentShader"
      :vertex-shader="vertexShader"
    />
  </Icosahedron>
</template>

<script>
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import { mapState } from 'vuex';
  import { BackSide, Vector2, Color } from 'three';
  import fragmentShader from '@shaders/background.frag';
  import vertexShader from '@shaders/baseVertex.vert';

  export default {
    props : {
      color : { type : String, default : null },
      gradient : { type : String, default : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)' }
    },
    data() {
      return {
        fragmentShader,
        vertexShader,
        BackSide
      };
    },
    computed : {
      ...mapState({
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height
      }),
      uniforms() {
        const gradientTexture = generateGradientTextureFromString(this.gradient);

        return {
          colorEnabled : { value : !!this.color },
          color : { value : new Color(this.color) },
          resolution : { value : new Vector2(this.windowWidth, this.windowHeight) },
          gradientTexture : { value : gradientTexture }
        };
      }
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
      },
      color(val) {
        if (this.material) {
          this.material.uniforms.colorEnabled.value = !!val;
          if (val) {
            this.material.uniforms.color.value.set(val);
          }
        }
      }
    },
    mounted() {
      this.mesh = this.$refs.mesh.mesh;
      this.material = this.mesh.material;
      this.material.side = BackSide;
    },
    beforeUnmount() {
      this.material = null;
    }
  };
</script>

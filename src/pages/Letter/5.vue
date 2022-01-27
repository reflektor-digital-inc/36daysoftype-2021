<template>
  <div
    class="Letter-5"
    @mousemove="onMove"
    @touchmove="onMove"
  >
    <div class="Letter-5__assets">
      <video
        ref="video"
        :src="textureVideo"
        preload
        autoplay
        loop
      />
    </div>
    <Renderer
      ref="renderer"
      class="Letter-5__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      :shadow="false"
    >
      <OrthographicCamera
        ref="camera"
        v-bind="cameraProps"
      />
      <Scene ref="scene">
        <Plane ref="quad">
          <ShaderMaterial
            :fragment-shader="raymarchedTextFrag"
            :uniforms="uniforms"
          >
            <Texture
              uniform="glyphTexture"
              :src="numberTexture"
              :on-load="sdfTextureLoaded"
            />
          </ShaderMaterial>
        </Plane>
      </Scene>
    </Renderer>
  </div>
</template>

<script>
  import gsap from 'gsap';
  import { mapState, mapMutations } from 'vuex';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import raymarchedTextFrag from '@shaders/raymarchedText.frag';
  import { Vector2, Vector4, Texture } from 'three';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import numberTexture from '@assets/textures/5-msdf.png';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    mixins : [loadingLogic],
    data() {
      return {
        textureVideo,
        numberTexture,
        mouse : {
          x : 0,
          y : 0,
          tx : 0,
          ty : 0
        },
        settings : {
          bloomStrength : 0.2,
          bloomThreshold : 0.95
        },
        frustrumSize : 1,
        raymarchedTextFrag,
        uniforms : {
          mousePos : { value : new Vector2(0, 0) },
          test : { value : 0.5 },
          time : { value : 0.0 },
          fontPxRange : { value : 64 },
          glyphSize : { value : new Vector2(512, 512) },
          resolution : { value : new Vector4() },
          gradient : { value : new Texture() },
          background : { value : new Texture() }
        }
      };
    },
    computed : {
      ...mapState({
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height
      }),
      cameraProps() {
        return {
          left : this.frustrumSize / -2,
          right : this.frustrumSize / 2,
          top : this.frustrumSize / 2,
          bottom : this.frustrumSize / -2,
          near : -this.frustrumSize * 1000,
          far : this.frustrumSize * 1000,
          zoom : 1,
          position : { x : 0, y : 0, z : this.frustrumSize * 2 }
        };
      }
    },
    watch : {
      windowWidth : 'setAspectRatio',
      windowHeight : 'setAspectRatio'
    },
    created() {
      this.sdfResolver = this.createNewLoadingPromise();
    },
    mounted() {
      this.$refs.quad.material.extensions = {
        derivatives : true
      };

      const grad = generateGradientTextureFromString('linear-gradient(180deg, #6b00ff, #ff0066 67%, #360c86 27%, #24c5e0 0%)');
      this.$refs.quad.material.uniforms.gradient.value = grad;
      const bgTex = generateGradientTextureFromString('linear-gradient(45deg, #101010, #550055 50%, #330033)');
      this.$refs.quad.material.uniforms.background.value = bgTex;

      this.setAspectRatio();
      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);
      // this.tweakFolder.dispose();
    },
    methods : {
      ...mapMutations({
        unlockEasterEgg : 'easterEgg/unlockEasterEgg'
      }),
      sdfTextureLoaded() {
        this.sdfResolver();
      },
      onUpdate(time) {
        this.updateMouse();

        if (this.$refs.quad.material) {
          this.$refs.quad.material.uniforms.time.value = time;
          this.$refs.quad.material.uniforms.mousePos.value.x = -this.mouse.x / 2;
          this.$refs.quad.material.uniforms.mousePos.value.y = -this.mouse.y / 2;
        }
      },
      onMove(event) {
        const eventX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
        const eventY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;
        this.mouse.tx = (eventX / window.innerWidth) * 2 - 1;
        this.mouse.ty = - (eventY / window.innerHeight) * 2 + 1;

        if (Math.abs(this.mouse.tx) > 0.9) this.unlockEasterEgg('5');
      },
      updateMouse() {
        this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.04;
        this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.04;
      },
      setAspectRatio() {
        if (this.$refs.quad.material) {
          let a1 = 1;
          let a2 = 1;
          if (this.windowHeight / this.windowWidth > 1) {
            a1 = (this.windowWidth / this.windowHeight) * 1;
          }
          else {
            a2 = (this.windowHeight / this.windowWidth) / 1;
          }

          this.$refs.quad.material.uniforms.resolution.value.x = this.windowWidth;
          this.$refs.quad.material.uniforms.resolution.value.y = this.windowHeight;
          this.$refs.quad.material.uniforms.resolution.value.z = a1;
          this.$refs.quad.material.uniforms.resolution.value.w = a2;
        }
      }
    }
  };
</script>

<style lang="scss">
.Letter-5 {
  &__canvas {
    z-index: 3;
    @include full-size(absolute);
  }
  &__assets {
    position: absolute;
    z-index: 0;
  }
  &__bg {
    z-index: 1;
    @include full-size(absolute);
    transform: scale(1.6);
    transform-origin: 0% 90%;
    pointer-events: none;
  }
  &__underlay {
    @include full-size(absolute);
    z-index: 2;
    pointer-events: none;
    &-elements {
      @include full-size(absolute);
      width: 85%;
      height: 85%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      position: absolute;
      z-index: 2;
    }
  }
  &__overlay {
    @include full-size(absolute);
    z-index: 4;
    pointer-events: none;
    &-letters {
      @include full-size(absolute);
      width: 85%;
      height: 85%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      position: absolute;
      mix-blend-mode: exclusion;
      &-image {
        position: absolute;
        right: 0;
        bottom: 0;
      }
    }
  }
}
</style>

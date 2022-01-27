<template>
  <div
    class="Letter-9"
  >
    <div class="Letter-9__assets">
      <video
        ref="video"
        :src="textureVideo"
        preload
        autoplay
        loop
      />
    </div>
    <div
      class="Letter-9__overlay"
      @mousedown="setMouseDown(true)"
      @mouseup="setMouseDown(false)"
      @mouseleave="setMouseDown(false)"
      @touchstart="setMouseDown(true)"
      @touchend="setMouseDown(true)"
    />
    <Renderer
      ref="renderer"
      class="Letter-9__canvas"
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
              :src="glyphTexture"
              :on-load="sdfTextureLoaded"
            />
          </ShaderMaterial>
        </Plane>
      </Scene>
      <EffectComposer>
        <RenderPass />
        <FXAAPass />
        <SMAAPass />
        <UnrealBloomPass
          :strength="settings.bloomStrength"
          :threshold="settings.bloomThreshold"
        />
      </EffectComposer>
    </Renderer>
  </div>
</template>

<script>
  import gsap from 'gsap';
  import random from 'canvas-sketch-util/random';
  import { mapMutations, mapState } from 'vuex';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import raymarchedTextFrag from '@shaders/raymarchedText_9.frag';
  import { Vector2, Vector4, Texture } from 'three';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import glyphTexture from '@assets/textures/9-msdf.png';
  import { audiospriteSpriteNames } from '@utils/AudiospriteAudioController.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    mixins : [loadingLogic],
    data() {
      return {
        textureVideo,
        glyphTexture,
        settings : {
          bloomStrength : 0.4,
          bloomThreshold : 0.58
        },
        frustrumSize : 1,
        raymarchedTextFrag,
        mouseDown : false,
        tl : null,
        oldMouseDown : false,
        letterHeightDisplacement : 0,
        letterMarchDistance : 0.6,
        letterMarchTarget : 0.6,
        letterHeightMax : 0,
        uniforms : {
          letterHeightDisplacement : { value : this.letterHeightDisplacement },
          letterMarchDistance : { value : this.letterMarchDistance },
          test : { value : 0.5 },
          time : { value : 0.0 },
          fontPxRange : { value : 256 },
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
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-9' }, false);
      // Set an initial random seed
      random.setSeed(random.getRandomSeed());
      // Log it for later reproducibility
      const randMonitor = { seed : random.getSeed() };
      this.tweakFolder.addMonitor(randMonitor, 'seed');

      // supply any child of this page with a reproducible
      // random object and the page's tweak folder
      return {
        tweakFolder : this.tweakFolder,
        random
      };
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

      const grad = generateGradientTextureFromString('linear-gradient(180deg, #000000 0%, #A021E6 17.71%, #FE6492 28.13%, #CE42BC 39.06%, #E290C0 52.08%, #BACDFF 64.06%)');
      this.$refs.quad.material.uniforms.gradient.value = grad;
      const bgTex = generateGradientTextureFromString('linear-gradient(45deg, #101010, #550055 50%, #330033)');
      this.$refs.quad.material.uniforms.background.value = bgTex;

      this.setAspectRatio();
      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
    },
    methods : {
      ...mapMutations({
        unlockEasterEgg : 'easterEgg/unlockEasterEgg'
      }),
      sdfTextureLoaded() {
        this.sdfResolver();
      },
      onUpdate(time) {
        this.letterHeightDisplacement = this.letterHeightMax;
        this.letterMarchDistance += (this.letterMarchTarget - this.letterMarchDistance) * 0.05;
        if (this.$refs.quad.material) {
          this.$refs.quad.material.uniforms.time.value = time;
          this.$refs.quad.material.uniforms.letterHeightDisplacement.value = this.letterHeightDisplacement;
          this.$refs.quad.material.uniforms.letterMarchDistance.value = this.letterMarchDistance;
        }
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
      },
      setMouseDown(val) {
        this.mouseDown = val;
        if (this.mouseDown) {
          if (this.oldMouseDown !== this.mouseDown) {
            this.oldMouseDown = this.mouseDown;
            this.$sfx.play(audiospriteSpriteNames['splash_1']);
          }
          this.tl = gsap.to(this, {
            letterHeightMax : 0.2,
            letterMarchTarget : 0.2,
            ease : 'elastic.out(1, 0.4)',
            duration : 3,
            overwrite : 'auto'
          });
          setTimeout(() => {
            if (this.mouseDown) this.unlockEasterEgg('9');
          }, 1000);
        }
        else {
          if (this.oldMouseDown !== this.mouseDown) {
            this.oldMouseDown = this.mouseDown;
            this.$sfx.play(audiospriteSpriteNames['splash_1']);
          }

          gsap.to(this, {
            letterHeightMax : 0.0,
            letterMarchTarget : 0.7,
            ease : 'elastic.out(1.4, 0.4)',
            duration : 2,
            overwrite : 'auto',
            onComplete : () => {
              this.unlockEasterEgg('9');
            }
          });
        }
      }
    }
  };
</script>

<style lang="scss">
.Letter-9 {
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
  }
  &__underlay {
    @include full-size(absolute);
    z-index: 2;
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
    z-index: 99;
    pointer-events: auto;
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

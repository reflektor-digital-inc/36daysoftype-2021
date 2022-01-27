<template>
  <div class="Letter-8">
    <div class="Letter-8__assets">
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
      class="Letter-8__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      :shadow="false"
      @mousemove="onMove"
      @touchmove="onMove"
    >
      <Camera
        ref="camera"
        :position="{ x : 0, y: 0.3, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :position="{ x :0, y: -0.5, z : 0}"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/8_voronoi.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              :metalness="0.054"
              :reflectivity="0.88"
              :roughness="0.0"
              :clearcoat="0.022"
              :clearcoatRoughness="0.11"
              :envMapIntensity="13"
              :ior="1.5"
              :transmission="0.054"
              :refraction-ratio="0.0"
            />
          </ThreeModelLoader>
        </Group>
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
  import  { mapGetters } from 'vuex';
  // import * as THREE from 'three';
  import random from 'canvas-sketch-util/random';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { ShaderCubeChrome } from '@components/CanvasTexture/ShaderCubeChrome';
  import { Mini } from '@components/CanvasTexture/Mini';
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        mini : false,
        textureVideo,
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.74,
          bloomThreshold : 0.73
        }
      };
    },
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionZ() {
        return this.breakpointMobile ? 10 : 6;
      }
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-8' }, false);
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
    mounted() {
      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      this.mini = new Mini({ name : 'mini', window, domElement : document.body });

      const shader = new ShaderCubeChrome({ renderer : this.$refs.scene.three.renderer });
      this.mini.onLoop(() => {
        shader.compute({ time : window.performance.now() * 0.001 });
      });

      this.$refs.scene.three.scene.environment = shader.out.envMap;
      this.$refs.scene.three.scene.background = shader.out.envMap;

      gsap.ticker.add(this.mini.work);
      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      gsap.ticker.remove(this.mini.work);
      this.mini.clean();
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
    },
    methods : {
      onMove() {
        if (this.children)
          this.intersects = this.getIntersects(this.children, '8');
      },
      onUpdate(time) {
        if (this.$refs.letter.modelRoot) {
          this.$refs.letter.modelRoot.rotation.y = Math.sin(time * 0.5) * 0.2;
        }

        if (this.intersects) {
          if (this.intersects.length) {
            for (let i = 0; i < 5; i ++) {
              const child = this.intersects[i];
              if (child?.object) {
                gsap.fromTo(
                  child.object.material,
                  {
                    reflectivity : 0.93,
                    metalness : 0.196,
                    duration : 0.1
                  },
                  {
                    reflectivity : 0.5,
                    metalness : 0.054,
                    duration : 10
                  }
                );
              }
            }// end for loop
          }// end intersects.length
        }// end intersects
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          child.userData.xr = Math.random();
          child.userData.yr = Math.random();
          child.userData.zr = Math.random();
          child.userData.tr = Math.random() - 0.5;
          child.material = child.material.clone();
        });

        const sin = v => Math.sin(v);
        const cos = v => Math.cos(v);
        let t = 0;

        this.mini.onLoop(() => {
          t += 0.053;

          children.forEach((child) => {
            child.scale.set(
              0.5 + 0.25 + sin(t * child.userData.tr + child.userData.xr) * 0.35,
              0.5 + 0.25 + sin(t * child.userData.tr + child.userData.yr) * 0.35,
              0.5 + 0.25 + sin(t * child.userData.tr + child.userData.zr) * 0.35
            );
            child.rotation.x = child.origRotation.x + sin(t * child.userData.tr + child.userData.xr) * 0.3;
            child.rotation.y = child.origRotation.y + cos(t * child.userData.tr + child.userData.yr) * 0.3;
            child.rotation.z = child.origRotation.z + sin(t * child.userData.tr + child.userData.zr) * 0.3;
          });
        });
        //
        this.children = children;
      }
    }
  };
</script>

<style lang="scss">
.Letter-8 {
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

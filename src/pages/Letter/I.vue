<template>
  <div class="I">
    <div class="I__assets">
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
      class="I__canvas"
      :alpha="false"
      antialias
      resize="window"
      @mousemove="onMove"
      @touchmove="onMove"
      @click="onClick"
    >
      <Camera
        :position="{ x : -0.7, y : 0.2, z : cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLight"
          :position="{ x: -30, y: 2.09, z: 15.00 }"
          color="#fff"
          :intensity="0.70"
        />
        <PointLight
          ref="pointLight2"
          color="#fff"
          :position="{ x : 26, y : 13.14, z : 30 }"
          :intensity="0.50"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            model="/src/assets/gltf/letters/I_v1.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              color="#fff"
              :metalness="1.0"
              :roughness="0.61"
              :ior="1.6"
              :envMapIntensity="1.7"
            />
          </ThreeModelLoader>
          <ThreeModelLoader
            ref="extras"
            title="Extras"
            model="/src/assets/gltf/extras/Flat_Curve.glb"
          >
            <PhysicalMaterial
              color="#ffffff"
              :reflectivity="0.47"
              :metalness="0.68"
              :roughness="0.53"
              :clearcoat="1.0"
              :clearcoatRoughness="0.28"
              :envMapIntensity="3.3"
              :ior="2.5"
              :transmission="0.16"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          :gradient="backgroundGradient"
        />
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
  import  { mapGetters, mapMutations } from 'vuex';
  import * as THREE from 'three';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ReflektorLetters,
      ThreeBackground,
      ThreeModelLoader
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        textureVideo,
        backgroundGradient : 'linear-gradient(-225deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        envGradient : 'linear-gradient(225deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.16,
          bloomThreshold : 0.67
        }
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'H' }, false);
      // Set an initial random seed
      random.setSeed(random.getRandomSeed());
      // Log it for later reproducibility
      const randMonitor = { seed : random.getSeed() };
      this.tweakFolder.addMonitor(randMonitor, 'seed');

      return {
        tweakFolder : this.tweakFolder,
        random
      };
    },
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionZ() {
        return this.breakpointMobile ? 9 : 4;
      }
    },
    mounted() {
      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight2.light, { title : 'Point Light B' });

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
      async loadTextures() {
        const envMap = generateGradientTextureFromString(this.envGradient);
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        const videoTexture = new THREE.VideoTexture(this.$refs.video);

        this.$refs.letter.updateModelMaterial({ envMap });
        this.$refs.extras.updateModelMaterial({ envMap, map : videoTexture });
      },
      onUpdate(time) {
        this.$refs.group.group.rotation.y = Math.sin(time) * 0.05;
        this.setCameraPositionTarget(this.mouse);
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          child.scale.set(1, 1, 1);
        });
        children.clicked = 0;
      },
      onMove(event) {
        this.mouse = new THREE.Vector2();
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        const eventX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
        const eventY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;
        this.mouse.x = (eventX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (eventY / window.innerHeight) * 2 + 1;
      },
      onClick() {
        const objects = this.$refs.letter.children;
        // intersect objects
        const intersects = this.getIntersects(objects);
        if (intersects.length) {
          objects.clicked += 1;
          this.unlockEasterEgg('I');
        }
        if (objects.clicked > 0 && !this.isAnimating) {
          this.isAnimating = true;
          objects.forEach((child) => {
            gsap.to(
              child.position,
              {
                x : child.origPosition.x * 20,
                y : child.origPosition.y * 20,
                duration : 0.5,
                yoyo : true,
                repeat : 1,
                ease : 'power2.in',
                onComplete : () => {
                  this.isAnimating = false;
                }
              }
            );
          });
        }
      }
    }
  };
</script>

<style lang="scss">
.I {
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
    background-image: linear-gradient(to bottom left, #ff9902, #ff5400, #6b00ff, #f06, #1e0c86, #24c5e0);
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

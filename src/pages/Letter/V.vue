<template>
  <div class="Letter-V">
    <Renderer
      ref="renderer"
      class="Letter-V__canvas"
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
        :position="{ x : -1, y: 1, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          color="#bdd9ff"
          :position="{ x : 20, y : 2, z : 30 }"
          :intensity="0.40"
          :penumbra="0.1"
          :cast-shadow="false"
        />
        <PointLight
          ref="pointLightB"
          color="#8900ff"
          :penumbra="0.1"
          :intensity="0.40"
          :position="{ x : -20, y : 2.0, z : 30 }"
          :cast-shadow="false"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/V_v1.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              :metalness="0.57"
              :roughness="0.50"
              :transmission="0.0"
              :ior="1.0"
              :envMapIntensity="1.3"
              :clearcoatRoughness="0.0"
              :clearcoat="0.34"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(45deg, #101010, #550055 50%, #330033)"
          :color="null /* consider also using a solid color */"
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
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import * as Tone from 'tone';
  import songUrl from '@assets/audio/showmelove_cut.mp3';
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
        textureVideo,
        envGradient : 'linear-gradient(225deg, #24c5e0 100%, #360c86 48%, #ff0066)',
        settings : {
          bloomStrength : 0.2,
          bloomThreshold : 0.95
        }
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-V' }, false);
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

      this.player = new Tone.Player({
        url : songUrl,
        loop : true,
        autostart : true
      }).toDestination();

      this.toneMeter = new Tone.FFT({ size : 32, smoothing : 0.9 });
      this.player.connect(this.toneMeter);

      this.soundChannels = null;

      this.tweakFolder.addButton({ title : 'Play Song' }).on('click', () => {
        this.player.restart();
      });
      this.tweakFolder.addButton({ title : 'Stop Song' }).on('click', () => {
        this.player.stop();
      });

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      gsap.ticker.add(this.onUpdate);

      setTimeout(() => {
        this.unlockEasterEgg('V');
      }, 3000);
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
      this.player && this.player.dispose();
      this.toneMeter && this.toneMeter.dispose();
    },
    methods : {
      ...mapMutations({
        unlockEasterEgg : 'easterEgg/unlockEasterEgg'
      }),
      async loadTextures() {
        const envMap = generateGradientTextureFromString(this.envGradient);
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        this.$refs.letter.updateModelMaterial({ envMap });
      },
      onUpdate(time) {
        if (this.$refs.letter.modelRoot) {
          this.$refs.letter.modelRoot.rotation.y = Math.sin(time * 0.5) * 0.4;
        }

        this.soundChannels = this.toneMeter.getValue();

        if (this.$refs.letter.children) {
          if (isFinite(this.soundChannels[0]) && this.soundChannels[0] > -50) {
            this.$refs.letter.children.forEach((child, index) => {
              const val = 0.2 - this.soundChannels[index % this.soundChannels.length] * 0.01;
              child.scale.set(val, val, val);
            });
            this.$refs.pointLightA.light.intensity = 0.3 - this.soundChannels[0] * 0.01;
            this.$refs.pointLightB.light.intensity = 0.2 - this.soundChannels[0] * 0.01;
          }
          else {
            this.$refs.letter.children.forEach((child) => {
              child.scale.setScalar(0.9);
            });
          }
        }
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          // see https://threejs.org/docs/?q=object3d#api/en/core/Object3D

          // each letter model is made of little chunks
          // scaling down each child will reveal the structure
          // if you want ;)
          child.scale.set(0.9, 0.9, 0.9);

          // also available if using ThreeModelLoader
          // child.origScale - original scale (for mutating scale directly with original scale)
          // child.origPosition - original position (for mutating position directly with original position)
          // child.origRotation - original rotation (for mutating rotation directly with original rotation)
          // child.random - a random reproducible value based on a seed
          // child.dir - alternates between 1 or -1 based on child array index
        });
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);
      }
    }
  };
</script>

<style lang="scss">
.Letter-V {
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

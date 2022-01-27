<template>
  <div class="Letter-K">
    <div class="Letter-K__assets">
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
      class="Letter-K__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      shadow
      pointer
      @mousemove="onMove"
      @touchmove="onMove"
    >
      <Camera
        ref="camera"
        :position="{ x : 0, y : 0, z : cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          color="#24c855"
          :position="{ x : -4.7, y : 3.0, z : -16 }"
          :intensity="0.80"
          :penumbra="0.1"
          cast-shadow
        />
        <PointLight
          ref="pointLightB"
          color="#4907ef"
          :penumbra="0.1"
          :intensity="0.30"
          :position="{ x : 6.1, y : 3.6, z : -29 }"
          cast-shadow
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            cast-shadow
            model="/src/assets/gltf/letters/K_v1.glb"
            :rotation="{ y : 0.5 }"
            @load="setUpLetterChildren"
          >
            <SubSurfaceMaterial
              :thickness-power="8.6"
              :thickness-scale="6.0"
              :thickness-distortion="0.71"
              :thickness-attenuation="1.8"
              :thickness-ambient="0.30"
              :u-shininess="76"
              u-specular="#ffffff"
              u-emissive="#000000"
            />
          </ThreeModelLoader>
          <Box
            ref="cube"
            receive-shadow
            :position="{ y : -2.5, z : -.3 }"
            :rotation="{ x : 3.2, z : 3 }"
            :scale="{ x : 3, y : 3, z : 3 }"
          >
            <PhysicalMaterial
              color="#fff"
              :roughness="0.0"
              :metalness="0.21"
              :clearcoat="1.0"
              :clearcoat-roughness="1.0"
              :envMapIntensity="2.75"
            />
          </Box>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(-45deg, #230759, #6b00ff 50%, #380599)"
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
  import { addLightFolder, materialTweaks } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import reflektorFrag from '@shaders/reflektorGradient.frag';
  import baseVertex from '@shaders/baseVertex.vert';
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
        reflektorFrag,
        baseVertex,
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.39,
          bloomThreshold : 0.96
        }
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-K' }, false);
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
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      this.$refs.cube.mesh.material.clearcoat = 1;
      this.$refs.cube.mesh.material.clearcoatRoughness = 1;
      materialTweaks(this.tweakFolder, this.$refs.cube.mesh.material, { title : 'Cube Material' });

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

        this.$refs.cube.mesh.material.envMap = envMap;
        this.$refs.cube.mesh.material.clearcoatRoughnessMap = videoTexture;
      },
      onUpdate() {
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
      },
      playVideo() {
        this.$refs.video.play();
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;

        const mousePosition = this.$refs.renderer.three.pointer.positionV3;
        if (mousePosition) {
          let hovered = 0;
          this.children.forEach((child) => {
            const dist = this.getMouseDist(mousePosition.x, mousePosition.y, child, 1, 2);
            if (dist < 0.5) hovered = hovered + 1;
            child.rotation.x = child.origRotation.x + dist;
          });
          if (hovered > 5) this.unlockEasterEgg('K');
        }
        if (this.pointer) {
          this.setCameraPositionTarget(this.pointer);
        }
      },
      setUpLetterChildren(children) {
        this.children = children;
        children.forEach((child) => {
          child.scale.set(0.8, 0.8, 0.8);
          child.rotation.y = child.origRotation.y + child.random * 0.3;
          child.rotation.z = child.origRotation.z + child.random * 0.3;
        });
      }
    }
  };
</script>

<style lang="scss">
.Letter-K {
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

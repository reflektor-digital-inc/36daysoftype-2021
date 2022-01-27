<template>
  <div class="D">
    <div class="D__assets">
      <video
        ref="video"
        :src="liquidVideo"
        preload
        autoplay
        loop
      />
    </div>
    <div class="D__overlay">
      <div class="D__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
    <Renderer
      ref="renderer"
      class="D__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      @mousemove="onMove"
      @touchmove="onMove"
      @click="onClick"
    >
      <Camera
        :position="{ x : -1, y : -1.5, z : cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLight"
          :position="{ x: -30, y: 0, z: 30 }"
          color="#c7cff5"
          :intensity="0.3"
        />
        <PointLight
          ref="pointLight2"
          :position="{ x: 30, y: 30, z: 30 }"
          color="#39ffee"
          :intensity="0.6"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="model"
            model="/src/assets/gltf/letters/D_v1.glb"
            :position="{ y : 0.1 }"
            @load="onModelLoaded"
          />
          <ThreeModelLoader
            ref="drips"
            model="/src/assets/gltf/extras/DDrip.glb"
            :position="{ y : 0.2 }"
            @load="onExtrasModelLoaded"
          />
        </Group>
        <ThreeBackground
          gradient="linear-gradient(225deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)"
        />
      </Scene>
      <EffectComposer>
        <RenderPass />
        <FXAAPass />
        <SMAAPass />
        <UnrealBloomPass :strength="settings.bloomStrength" />
      </EffectComposer>
    </Renderer>
  </div>
</template>

<script>
  import { gsap, Elastic } from 'gsap';
  import  { mapGetters, mapMutations } from 'vuex';
  import * as THREE from 'three';
  import _get from 'lodash/get';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder, addColor } from '@utils/tweakpane-utils';
  import liquidVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import iriEnv from '@assets/textures/texture_test_reflektor_original_shader.jpg';
  import mouseMovement from '@mixins/mouse-movement.js';
  import { audiospriteSpriteNames } from '@utils/AudiospriteAudioController.js';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
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
        reflektorGradient : 'linear-gradient(225deg, #000 100%, #ff0066 33%, #360c86 0%)',
        liquidMap : new THREE.Texture(),
        liquidVideo,
        settings : {
          bloomStrength : 0.14
        }
      };
    },
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionZ() {
        return this.breakpointMobile ? 9 : 5.3;
      }
    },
    created() {
      // Set an initial random seed
      random.setSeed(random.getRandomSeed());
      // Log it for later reproducibility

      this.loadingPromises.push(this.loadTextures());
    },
    mounted() {
      this.material = new THREE.MeshPhysicalMaterial({
        color : '#b3dadb',
        metalness : 1,
        roughness : 0,
        reflectivity : 0,
        clearcoat : 0,
        clearcoatRoughness : 0,
        envMapIntensity : 2,
        morphNormals : true,
        morphTargets : true
      });

      this.extrasMaterial = new THREE.MeshPhysicalMaterial({
        color : '#ffffff',
        metalness : 0,
        roughness : 0.4,
        reflectivity : 0.4,
        clearcoat : 0.45,
        clearcoatRoughness : 0.4,
        envMapIntensity : 10.15,
        morphNormals : true,
        morphTargets : true
      });

      this.tweakFolder = this.$tweakpane.addFolder({ title : 'C' }, false);

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // material
      addColor(this.tweakFolder, this.material, 'color');
      this.tweakFolder.addInput(this.material, 'metalness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'roughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'reflectivity', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'clearcoat', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'clearcoatRoughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'flatShading', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'envMapIntensity', { min : 0, max : 20, step : 0.05 });

      // material
      this.tweakFolder.addSeparator();
      addColor(this.tweakFolder, this.extrasMaterial, 'color');
      this.tweakFolder.addInput(this.extrasMaterial, 'metalness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'roughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'reflectivity', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'clearcoat', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'clearcoatRoughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'flatShading', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'envMapIntensity', { min : 0, max : 20, step : 0.05 });

      // post-processing
      this.tweakFolder.addSeparator();
      this.tweakFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });

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
        const textureLoader = new THREE.TextureLoader();

        const envMap = await textureLoader.loadAsync(iriEnv);
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        this.material.envMap = envMap;
        this.extrasMaterial.envMap = envMap;
        this.$refs.scene.scene.environment = envMap;

        const videoTexture = new THREE.VideoTexture(this.$refs.video);
        this.extrasMaterial.map = videoTexture;
        this.extrasMaterial.clearcoatRoughnessMap = videoTexture;
        this.extrasMaterial.roughnessMap = videoTexture;
      },
      onUpdate(time) {
        if (this.extras) {
          this.extras.forEach((child) => {
            if (child.morphTargetInfluences) {
              child.morphTargetInfluences[0] = Math.sin(time) / 2 + 0.5;
              child.morphTargetInfluences[1] = Math.cos(time) / 2 + 0.5;
              child.morphTargetInfluences[2] = Math.sin(time) / 2 + 0.5;
            }
          });
        }
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
      },
      onModelLoaded(children, modelRoot) {
        this.modelRoot = modelRoot;
        this.children = _get(modelRoot, 'children');
        this.children.forEach((child, index) => {
          child.origScale = child.scale.clone();
          child.origPosition = child.position.clone();
          child.origRotation = child.rotation.clone();
          child.movementIntensity = Math.random();
          child.movementDirection = Math.sign(index % 2 - 0.5);
          child.material = this.material;
        });
      },
      onExtrasModelLoaded(children, modelRoot) {
        this.extrasRoot = modelRoot;
        this.extras = _get(modelRoot, 'children');
        this.extras.forEach((child, index) => {
          child.origScale = child.scale.clone();
          child.origPosition = child.position.clone();
          child.origRotation = child.rotation.clone();
          child.movementIntensity = Math.random();
          child.movementDirection = Math.sign(index % 2 - 0.5);
          child.material = this.extrasMaterial;
          child.index = index;
        });
      },
      playVideo() {
        this.$refs.video.play();
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);

        const extraIntersects = this.getIntersects([...this.extras]);
        if (extraIntersects && extraIntersects.length) {
          const obj = extraIntersects[0].object;
          gsap.to(
            obj.material,
            {
              metalness : 0.5,
              duration : 1
            }
          );
        }
        else {
          this.extras.forEach((child) => {
            gsap.to(
              child.material,
              {
                metalness : 0,
                duration : 1
              }
            );
          });
        }
      },
      onClick() {
        const extraObjects = this.extras;
        const newObjs = extraObjects.slice(1, 4);
        this.extraIntersects = this.getIntersects(newObjs);
        if (this.extraIntersects && this.extraIntersects.length && this.extraIntersects[0] !== extraObjects[0]) {
          const obj = this.extraIntersects[0].object;
          const tl = gsap.timeline();
          this.$sfx.play(audiospriteSpriteNames[`bell_fall_${obj.index}`]);
          tl.to(
            obj.position,
            {
              y : -5,
              duration : 0.8,
              ease : 'power3.in'
            }
          ).to(
            obj.position,
            {
              y : obj.origPosition.y,
              duration : 3,
              ease : Elastic.easeOut.config(1, 0.5),
              onStart : () => {
                this.$sfx.play(audiospriteSpriteNames[`bell_chime_${obj.index}`]);
              }
            }
          );

          this.unlockEasterEgg('D');
        }
      }
    }
  };
</script>

<style lang="scss">
.D {
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

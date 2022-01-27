<template>
  <div class="C">
    <div class="C__overlay">
      <div class="C__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
    <Renderer
      ref="renderer"
      class="C__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      @mousemove="onMove"
      @touchmove="onMove"
      @touchend="onTouchEnd"
    >
      <Camera
        :position="{ x : 1.8, y : -.5, z : cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLight"
          :position="{ x: -18.3, y: 1.3, z: 10.4 }"
          color="#ffffff"
          :intensity="1"
        />
        <PointLight
          ref="pointLight2"
          :position="{ x: 5.2, y: 7.2, z: 30 }"
          color="#39ffee"
          :intensity="1.1"
        />
        <Group ref="group" :position="{ y : 0.1 }">
          <ThreeModelLoader
            ref="model"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/C_Sharp.glb"
            @load="onModelLoaded"
          />
        </Group>
        <ThreeOutlineShards
          color="#fff"
          gradient="linear-gradient(225deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)"
          :width-factor="settings.lineWidthFactor"
          :squeeze-max="settings.lineWidthFactor"
          :position="{ x : -4.5, y : 0, z : -1 }"
          :scale="{ y : -1 }"
        />
        <ThreeBackground
          color="#360c86"
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
  import gsap from 'gsap';
  import { mapGetters } from 'vuex';
  import * as THREE from 'three';
  import _get from 'lodash/get';
  import letterGlbURL from '@assets/gltf/letters/C_Sharp.glb';
  import shardGLBUrl from '@assets/gltf/extras/smooth_shards.glb';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder, addColor } from '@utils/tweakpane-utils';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import ThreeOutlineShards from '@components/three/ThreeOutlineShards/ThreeOutlineShards.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import liquidImage from '@assets/textures/liquid-texture_1.jpg';
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ReflektorLetters,
      ThreeOutlineShards,
      ThreeBackground,
      ThreeModelLoader
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        glbUrl : letterGlbURL,
        shardGLBUrl,
        reflektorMap : new THREE.Uniform(new THREE.Texture()),
        liquidMap : new THREE.Texture(),
        settings : {
          bloomStrength : 0.13,
          lineWidthFactor : 0.2
        }
      };
    },
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionZ() {
        return this.breakpointMobile ? 9 : 4.5;
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
        color : '#c0e4f8',
        metalness : 0.9,
        roughness : 1.0,
        reflectivity : 0.2,
        clearcoat : 1,
        clearcoatRoughness : 0.18,
        envMapIntensity : 5.2,
        morphNormals : true,
        morphTargets : true
      });

      this.tweakFolder = this.$tweakpane.addFolder({ title : 'C' }, false);

      // material
      addColor(this.tweakFolder, this.material, 'color');
      this.tweakFolder.addInput(this.material, 'metalness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'roughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'reflectivity', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'clearcoat', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'clearcoatRoughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'flatShading', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'envMapIntensity', { min : 0, max : 20, step : 0.05 });

      // post-processing
      this.tweakFolder.addSeparator();
      this.tweakFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });

      // scene settings
      this.tweakFolder.addSeparator();
      this.tweakFolder.addInput(this.settings, 'lineWidthFactor', { min : 0, max : 2, step : 0.05 });

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
      async loadTextures() {
        const textureLoader = new THREE.TextureLoader();
        const liquidMap = await textureLoader.loadAsync(liquidImage);

        liquidMap.mapping = THREE.EquirectangularReflectionMapping;
        liquidMap.encoding = THREE.sRGBEncoding;
        this.material.envMap = liquidMap;

        this.$refs.scene.scene.environment = liquidMap;
      },
      onUpdate(time) {
        if (this.modelRoot) {
          this.modelRoot.rotation.y = Math.sin(time * 0.2) * 0.1;
        }
        if (this.children) {
          this.children.forEach((child) => {
            const { rotation, origRotation, movementIntensity, movementDirection } = child;
            rotation.x = origRotation.x + (Math.sin(time * 1 * movementIntensity) * Math.sin(time * 0.5 * movementIntensity)) * 0.1 * movementDirection;
            rotation.y = origRotation.y + (Math.sin(time * 1.8 * movementIntensity) * Math.sin(time * 0.7 * movementIntensity)) * 0.1 * movementDirection;
            rotation.y = origRotation.y + Math.sin(time * 1.1) * Math.sin(time * 0.7 * movementIntensity) * 0.2 * movementDirection;
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
        });

        this.setUpMaterial();
      },
      setUpMaterial() {
        this.children.forEach((child) => {
          child.material = this.material;
        });
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);
        this.intersects = this.getIntersects(this.children, 'C');
        const mousePosition = this.$refs.renderer.three.pointer.positionV3;
        this.children.forEach((child) => {
          const dist = this.getMouseDist(mousePosition.x, mousePosition.y, child, 0.6, 2);
          child.scale.setScalar(0.4 + dist);
        });
      },
      onTouchEnd() {
        this.intersects = [];
      }
    }
  };
</script>

<style lang="scss">
.C {
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

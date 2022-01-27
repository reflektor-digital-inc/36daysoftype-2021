<template>
  <div class="E">
    <div class="E__overlay">
      <div class="E__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
    <Renderer
      ref="renderer"
      class="E__canvas"
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
        :position="{ x : 0, y : -0.5, z : cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLight"
          :position="{ x: -12.6, y: -0.9, z: 14.8 }"
          color="#ffffff"
          :intensity="0.1"
        />
        <PointLight
          ref="pointLight2"
          :position="{ x: 10.9, y: 0.0, z: 16.1 }"
          color="#ffffff"
          :intensity="0.7"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="model"
            model="/src/assets/gltf/letters/E_plain.glb"
            :position="{ y : 0.1 }"
            @load="onModelLoaded"
          />
          <ThreeModelLoader
            ref="extras"
            model="/src/assets/gltf/extras/Triangles.glb"
            :position="{ y : 0.2 }"
            @load="onExtrasModelLoaded"
          />
        </Group>
        <ThreeBackground
          color="#e301be"
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
  import { gsap, Elastic } from 'gsap';
  import  { mapGetters } from 'vuex';
  import * as THREE from 'three';
  import _get from 'lodash/get';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder, addColor } from '@utils/tweakpane-utils';
  import liquidVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import mouseMovement from '@mixins/mouse-movement.js';
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
        backgroundGradient : 'linear-gradient(225deg, #000 100%, #ff0066 33%, #360c86 0%)',
        envGradient : 'linear-gradient(25deg, #24c5e0 100%, #360c86 48%, #ff0066)',
        envGradient2 : 'linear-gradient(225deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        liquidMap : new THREE.Texture(),
        liquidVideo,
        settings : {
          bloomStrength : 0.14,
          bloomThreshold : 0.81
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
    },
    mounted() {
      this.material = new THREE.MeshPhysicalMaterial({
        color : '#ffffff',
        metalness : 0.8,
        roughness : 0.4,
        reflectivity : 0,
        clearcoat : 0,
        clearcoatRoughness : 0,
        envMapIntensity : 2.75,
        morphNormals : true,
        morphTargets : true
      });

      this.extrasMaterial = new THREE.MeshPhysicalMaterial({
        color : '#ffffff',
        metalness : 1,
        roughness : 1,
        reflectivity : 0,
        clearcoat : 0,
        clearcoatRoughness : 0,
        envMapIntensity : 7.1,
        morphNormals : true,
        morphTargets : true
      });

      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder = this.$tweakpane.addFolder({ title : 'F' }, false);

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
      this.tweakFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight2.light, { title : 'Point Light B' });

      this.previousPoint = this.$refs.renderer.three.pointer.positionN;
      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
    },
    methods : {
      async loadTextures() {
        const envMap = generateGradientTextureFromString(this.envGradient);
        envMap.mapping = THREE.EquirectangularReflectionMapping;
        const envMap2 = generateGradientTextureFromString(this.envGradient2);
        envMap2.mapping = THREE.EquirectangularReflectionMapping;

        this.extrasMaterial.envMap = envMap;
        this.material.envMap = envMap2;
        this.$refs.scene.scene.environment = envMap;
        this.$refs.scene.scene.background = envMap;
      },
      onUpdate(time) {
        if (this.intersects) {
          if (this.intersects.length) {
            const obj = this.intersects[0].object;
            gsap.to(
              obj.scale,
              {
                x : 1,
                y : 1,
                z : 1,
                duration : 1,
                ease : Elastic.easeInOut.config(3, 0.3)
              }
            );
          }
          else {
            this.children.forEach((child) => {
              gsap.to(
                child.scale,
                {
                  x : 0.9,
                  y : 0.9,
                  z : 0.9
                }
              );
            });
          }
        }

        if (this.extras) {
          this.extras.forEach((child) => {
            if (child.morphTargetInfluences) {
              child.morphTargetInfluences[0] = Math.sin(time) / 2 + 0.5;
              child.morphTargetInfluences[1] = Math.cos(time) / 2 + 0.5;
              child.morphTargetInfluences[2] = Math.sin(time) / 2 + 0.5;
            }
            else {
              child.rotateY(0.01 * gsap.ticker.deltaRatio(60));
            }
          });
        }
        this.setCameraPositionTarget(this.point);
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
          child.scale.setScalar(0.9);
        });
      },
      onExtrasModelLoaded(children, modelRoot) {
        this.extrasRoot = modelRoot;
        this.extras = _get(modelRoot, 'children');
        this.extras.forEach((child, index) => {
          child.origScale = child.scale.clone();
          child.origPosition = child.position.clone();
          child.origRotation = child.rotation.clone();
          child.origVecRot = child.rotation.toVector3();
          child.movementIntensity = Math.random();
          child.movementDirection = Math.sign(index % 2 - 0.5);
          child.material = this.extrasMaterial;
        });
        this.extras[1].position.x += -2;
        this.extras[1].position.y += -1;
      },
      onMove() {
        // control camera by mouse move
        this.point = this.$refs.renderer.three.pointer.positionN;

        this.intersects = this.getIntersects(this.children, 'E');
      },
      onTouchEnd() {
        this.intersects = [];
      },
      playVideo() {
        this.$refs.video.play();
      }
    }
  };
</script>

<style lang="scss">
.E {
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

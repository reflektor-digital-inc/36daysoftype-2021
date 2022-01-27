<template>
  <div class="M">
    <Renderer
      ref="renderer"
      class="M__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      @mousemove="onMove"
      @touchmove="onMove"
    >
      <Camera
        :position="{ x : -3, y : -1.5, z : cameraPositionZ}"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLight"
          :position="{ x: 0, y: -12.20, z: 0 }"
          color="#00d5ff"
          :intensity="1.6"
        />
        <PointLight
          ref="pointLight2"
          :position="{ x: 22.57, y: -20.86, z: 30.00 }"
          color="#ff00ed"
          :intensity="0"
        />
        <Group ref="extras">
          <ThreeModelLoader
            model="/src/assets/gltf/letters/M/M_v1_extra.glb"
            :position="{ y : 0.1 }"
            @load="onModelLoaded"
          />
        </Group>
        <Group ref="group">
          <ThreeModelLoader
            ref="model"
            model="/src/assets/gltf/letters/M/M_v1_outer.glb"
            :position="{ y : 0.1 }"
            @load="onModelLoaded"
          />
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            model="/src/assets/gltf/letters/M_v1_inner.glb"
            @load="onExtrasLoaded"
          >
            <ShaderMaterial
              ref="shader"
              :uniforms="magmaUniforms"
              :fragment-shader="magmaFrag"
              :vertex-shader="magmaVert"
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
  import _get from 'lodash/get';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder, materialTweaks, addColor } from '@utils/tweakpane-utils';
  import liquidVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import magmaVert from '@shaders/magma.vert';
  import magmaFrag from '@shaders/magma.frag';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader';
  import texture from '@assets/textures/Lava004_1K_Color.jpg';
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ThreeModelLoader,
      ImagePreLoader,
      ReflektorLetters,
      ThreeBackground
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        magmaVert,
        magmaFrag,
        backgroundGradient : 'linear-gradient(225deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        envGradient : 'linear-gradient(90deg, #e301be)',
        envGradient2 : 'linear-gradient(-90deg, #e301be)',
        liquidMap : new THREE.Texture(),
        liquidVideo,
        settings : {
          bloomStrength : 0.9,
          bloomThreshold : 0.6
        },
        magmaUniforms : {
          time : { // float initialized to 0
            type : 'f',
            value : 0.0
          },
          tExplosion : {
            type : 't',
            value : new THREE.Texture()
          }
        }
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'M' }, false);
      return {
        tweakFolder : this.tweakFolder
      };
    },
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionZ() {
        return this.breakpointMobile ? 13 : 9;
      }
    },
    created() {
      // Set an initial random seed
      random.setSeed(random.getRandomSeed());
    },
    mounted() {
      this.material = new THREE.MeshPhysicalMaterial({
        color : '#ebebeb',
        reflectivity : 0.25,
        metalness : 0.065,
        roughness : 0.61,
        clearcoat : 0.38,
        clearcoatRoughness : 0.12,
        envMapIntensity : 0.1,
        ior : 1.2,
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

      this.loadingPromises.push(this.loadTextures());

      // material
      materialTweaks(this.tweakFolder, this.material, { title : 'Letter Material' });

      this.tweakFolder.addSeparator();
      addColor(this.tweakFolder, this.extrasMaterial, 'color');
      this.tweakFolder.addInput(this.extrasMaterial, 'metalness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'roughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'reflectivity', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'clearcoat', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'clearcoatRoughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'flatShading', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'envMapIntensity', { min : 0, max : 20, step : 0.05 });

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight2.light, { title : 'Point Light B' });

      const { group } = this.$refs;
      this.baseY = group.group.position.y;
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
        const tExplosion = await textureLoader.loadAsync(texture);
        this.magmaUniforms.tExplosion.value = tExplosion;

        const envMap = generateGradientTextureFromString(this.envGradient);
        envMap.mapping = THREE.EquirectangularReflectionMapping;
        const envMap2 = generateGradientTextureFromString(this.envGradient2);
        envMap2.mapping = THREE.EquirectangularReflectionMapping;

        this.material.envMap = envMap2;
        this.$refs.scene.scene.environment = envMap;
        this.$refs.scene.scene.background = envMap;
      },
      getYOffset(time, offset = 0) {
        const wave = {
          amplitude : 0.25,
          frequency : 1,
          heightOffset : -0.25,
          horizontalOffset : offset
        };
        return wave.amplitude * Math.sin(
          (time - wave.horizontalOffset) / wave.frequency
        ) + wave.heightOffset;
      },
      onUpdate(time) {
        this.settings.bloomStrength = 0.6 + Math.sin(time * 2) * 0.2;

        const { group, extras } = this.$refs;
        const spinAmount = 0.005 + ((Math.sin(time) + 1) * 0.002);
        group.group.rotation.y += spinAmount;
        extras.group.rotation.y += spinAmount;
        group.group.position.y = this.baseY + this.getYOffset(time);
        extras.group.position.y = this.baseY + this.getYOffset(time, 0.8);

        this.setCameraPositionTarget(this.point);
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);

        this.magmaUniforms.time.value = time * .01;
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
      onMove() {
        this.point = this.$refs.renderer.three.pointer.positionN;
        this.mousePos3D = this.$refs.renderer.three.pointer.positionV3;
        let dist;
        if (this.mousePos3D) {
          dist = this.getMouseDist(this.mousePos3D.x, this.mousePos3D.y, this.modelRoot, 0.7, 10);
          this.material.envMapIntensity = 7.6 - dist * 10;
          if (dist < 0.2) this.unlockEasterEgg('M');
        }
      }
    }
  };
</script>

<style lang="scss">
.M {
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

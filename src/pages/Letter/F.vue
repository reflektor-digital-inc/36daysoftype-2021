<template>
  <div class="F">
    <div class="F__overlay">
      <div class="F__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
    <Renderer
      ref="renderer"
      class="F__canvas"
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
      <Camera :position="{ y : 1.8 ,z: cameraPositionZ }" />
      <Scene ref="scene">
        <PointLight
          :position="{ x: 100, y: 100, z: -30 }"
          color="#fff"
          :intensity="0.3"
        />
        <DirectionalLight
          :position="{ x: 100, y: 100, z: -60 }"
          color="#fff"
          :intensity="0.3"
        />
        <PointLight
          ref="pointLight"
          :position="{ x: 26.1, y: -2, z: 7.2 }"
          color="#b84f4f"
          :intensity="pointLight1Intensity.value"
        />
        <PointLight
          ref="pointLight2"
          :position="{ x: -11.8, y: 18.9, z: 30.0 }"
          color="#8365f2"
          :intensity="pointLight2Intensity.value"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="model"
            model="/src/assets/gltf/letters/F_small_2-v2.glb"
            @load="onModelLoaded"
          />
        </Group>
        <ThreeBackground
          gradient="linear-gradient(225deg, #360d86 100%, #7d51d2 35%)"
        />
      </Scene>
      <EffectComposer>
        <RenderPass />
        <FXAAPass />
        <SMAAPass />
        <UnrealBloomPass :strength="settings.bloomStrength.value" :threshold="0.9" />
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
  import { addLightFolder, addColor } from '@utils/tweakpane-utils';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeOutlineShards from '@components/three/ThreeOutlineShards/ThreeOutlineShards.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import SubsurfaceScatteringShader from '@src/shaders/threejs/SubsurfaceScatteringShader.js';
  import mouseMovement from '@mixins/mouse-movement.js';
  import { audiospriteSpriteNames } from '@utils/AudiospriteAudioController.js';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import loadingLogic from '@mixins/loading-logic.js';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';

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
        settings : {
          bloomStrength : { value : 0.1 },
          lineWidthFactor : 0.3,
          materialColor : '#ffffff'
        },
        pointLight1Intensity : { value : 0.4 },
        pointLight2Intensity : { value : 0.4 },
        glowIntensities : []
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

      this.vineVertices = [];
      this.vinePoints = [];
    },
    mounted() {
      this.music = this.$sfx.play(audiospriteSpriteNames.forest_bells);
      this.$sfx.setVolume(this.music, 0);

      this.material = new THREE.MeshPhysicalMaterial({
        color : '#A8A8E7',
        metalness : 0,
        roughness : 1,
        reflectivity : 0,
        clearcoat : 1,
        clearcoatRoughness : 1,
        envMapIntensity : 2000,
        morphNormals : true,
        morphTargets : true
      });

      this.tweakFolder = this.$tweakpane.addFolder({ title : 'F' }, false);

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

      // scene settings
      this.tweakFolder.addSeparator();
      this.tweakFolder.addInput(this.settings, 'lineWidthFactor', { min : 0, max : 2, step : 0.05 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight2.light, { title : 'Point Light B' });

      gsap.ticker.add(this.onUpdate);

      this.glowObjects = [];
    },
    unmounted() {
      if (this.music) {
        this.$sfx.stop(this.music);
      }
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
    },
    methods : {
      ...mapMutations({
        unlockEasterEgg : 'easterEgg/unlockEasterEgg'
      }),
      onUpdate() {
        if (this.children) {
          this.$refs.renderer.three.camera.lookAt(0, 0, 0);
        }
      },
      onModelLoaded(children, modelRoot) {
        this.modelRoot = modelRoot;
        this.modelGroup = this.$refs.group.group;
        this.modelGroup.position.y -= 1.5;
        this.modelGroup.rotation.y = -Math.PI / 8;
        this.children = _get(modelRoot, 'children');

        const envMap = generateGradientTextureFromString('linear-gradient(225deg, #360d86 100%, #7d51d2 35%)');
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        this.children.forEach((child, index) => {
          if (child.name.match(/cut/gi)) {
            child.material = this.material;
          }
          else if (child.name.match(/Branches/gi)) {
            child.material.setValues({
              opacity : .6,
              alphaTest : 0.3,
              blending : THREE.SubtractiveBlending
            });
          }
          else if (child.name.match(/Leaves/gi)) {
            child.material.setValues({
              roughness : .75,
              metalness : 0,
              color : '#eec0f8',
              envMap,
              envMapIntensity : 8
            });
            child.side = THREE.DoubleSide;
          }
          else if (child.name.match(/glow/gi)) {
            this.glowObjects.push(child);
            this.glowIntensities.push({
              value : 0.6
            });
          }
          child.origScale = child.scale.clone();
          child.origPosition = child.position.clone();
          child.origRotation = child.rotation.clone();
          child.movementIntensity = Math.random();
          child.movementDirection = Math.sign(index % 2 - 0.5);
        });
      },
      setUpMaterial() {
        this.children.forEach((child) => {
          child.material = this.material;
        });
      },
      createMaterial() {
        const params = SubsurfaceScatteringShader;
        const uniforms = THREE.UniformsUtils.clone(params.uniforms);

        Object.entries({
          color : '#B1CCE7',
          thicknessColor : '#ffffff',
          thicknessDistortion : 1,
          thicknessAmbient : 0.5,
          thicknessAttenuation : 0.7,
          thicknessPower : 100,
          thicknessScale : 40,
          transparent : true,
          opacity : 1,
          vertexColors : false
        }).forEach(([key, value]) => {
          let _key = key, _value = value;
          if (['color', 'thicknessColor'].includes(key)) {
            if (key === 'color') _key = 'diffuse';
            _value = new THREE.Color(value);
          }
          if (!['transparent', 'vertexColors'].includes(key)) {
            uniforms[_key].value = _value;
          }
        });

        this.glowMaterial = new THREE.ShaderMaterial({
          ...params,
          uniforms,
          lights : true,
          transparent : this.transparent,
          vertexColors : this.vertexColors
        });

        this.tweakFolder.addInput(this.glowMaterial.uniforms.thicknessDistortion, 'value', { min : 0, max : 1, step : 0.05 });
        this.tweakFolder.addInput(this.glowMaterial.uniforms.thicknessAmbient, 'value', { min : 1, max : 4, step : 0.01 });
        this.tweakFolder.addInput(this.glowMaterial.uniforms.thicknessAttenuation, 'value', { min : 0, max : 5, step : 0.05 });
        this.tweakFolder.addInput(this.glowMaterial.uniforms.thicknessPower, 'value', { min : 0, max : 16, step : 0.05 });
        this.tweakFolder.addInput(this.glowMaterial.uniforms.thicknessScale, 'value', { min : 0, max : 50, step : 0.05 });
      },
      onMove() {
        if (!this.modelRoot) return;

        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);
        const mousePos3D = this.$refs.renderer.three.pointer.positionV3;
        const dist = this.getMouseDist(mousePos3D.x, mousePos3D.y, this.modelRoot, 0.8, 3);
        if (dist < 0.1) this.unlockEasterEgg('F');
        this.settings.bloomStrength.value = 1 - dist;
        const dist2 = this.getMouseDist(mousePos3D.x, mousePos3D.y, this.modelRoot, 0.8, 4);
        this.$sfx.setVolume(this.music, Math.max(1 - dist2, 0));
      }
    }
  };
</script>

<style lang="scss">
.F {
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

<template>
  <div class="Letter-X">
    <div class="Letter-X__overlay">
      <div class="Letter-X__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
    <div>
      <Renderer
        ref="renderer"
        class="Letter-X__canvas"
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
          :position="{ x : -100, y: -1, z: cameraPositionZ }"
        />
        <Scene ref="scene">
          <PointLight
            ref="pointLightA"
            :penumbra="0.1"
            :cast-shadow="false"
            :position="{ x : -4.2, y : 8.0, z : 30 }"
            color="#db0b81"
            :intensity="0.10"
          />
          <PointLight
            ref="pointLightB"
            :penumbra="0.1"
            :cast-shadow="false"
            :intensity="0.10"
            color="#180ed8"
            :position="{ x : 9.0, y : -0.20, z : 23 }"
          />

          <Group ref="group">
            <ThreeModelLoader
              ref="letter"
              title="Letter"
              :cast-shadow="false"
              model="/src/assets/gltf/letters/X_v3.glb"
              @load="setUpLetterChildren"
            >
              <PhysicalMaterial
                :reflectivity="0.15"
                :metalness="0"
                :envMapIntensity="7.0"
                :roughness="0.54"
                color="#000000"
                :clearcoat="0.022"
                :clearcoatRoughness="0.76"
                :ior="1.3"
                :refraction-ratio="0.0"
                :transparent="true"
                :side="doubleSide"
              />
            </ThreeModelLoader>
            <ThreeModelLoader
              ref="bones"
              title="Bones"
              :cast-shadow="false"
              model="/src/assets/gltf/letters/bones.glb"
            >
              <BasicMaterial
                color="#ffffff"
                transparent
                :opacity="0"
              />
            </ThreeModelLoader>
          </Group>
          <ThreeBackground
            ref="background"
            gradient="linear-gradient(225deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)"
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
  </div>
</template>

<script>
  import gsap from 'gsap';
  import  { mapGetters, mapMutations } from 'vuex';
  import * as THREE from 'three';
  import random from 'canvas-sketch-util/random';
  import NoisyPlane from 'troisjs/src/components/noisy/NoisyPlane.js';
  import MirrorMesh from 'troisjs/src/components/meshes/MirrorMesh.js';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import ReflektorLetters from '@components/ReflektorLetters.vue'; // reflektor logo overlay
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader,
      NoisyPlane,
      MirrorMesh,
      ReflektorLetters
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        textureVideo,
        envGradient : 'linear-gradient(90deg, #6b00ff, #ff0066 67%, #360c86 27%, #24c5e0 0%)',
        settings : {
          bloomStrength : 0.30,
          bloomThreshold : 0.95
        }
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-X' }, false);
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
      doubleSide() {
        return THREE.BackSide;
      },
      cameraPositionZ() {
        return this.breakpointMobile ? -9 : -4;
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
      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      this.flickerTl?.kill();
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

        const cubeRTSize = 1024;
        const cubeCameraNear = 0.1;
        const cubeCameraFar = 2000;

        const cubeRT = new THREE.WebGLCubeRenderTarget(cubeRTSize, {
          mapping : THREE.CubeRefractionMapping, format : THREE.RGBFormat, generateMipmaps : true, minFilter : THREE.LinearMipmapLinearFilter
        });
        this.cubeCamera = new THREE.CubeCamera(cubeCameraNear, cubeCameraFar, cubeRT);

        if (this.$refs.noisyPlane) {
          this.$refs.noisyPlane.material.envMap = cubeRT.texture;
        }
      },
      onUpdate(time) {
        if (this.$refs.letter.children) {
          this.$refs.letter.children.forEach((child) => {
            child.material.transmission = (Math.sin(time) + 1) / 2;
          });
        }
        if (this.intersects) {
          const obj = this.$refs.bones;
          if (this.intersects.length) {
            this.unlockEasterEgg('X');
            gsap.to(obj.material, {
              opacity : 1,
              duration : 1,
              overwrite : 'auto'
            });
          }
          else {
            gsap.to(obj.material, {
              opacity : 0,
              duration : 1,
              overwrite : 'auto'
            });
          }
        }

        this.$refs.camera.camera.position.x = (Math.sin(time / 4) / 2) * 5.5;
        this.$refs.camera.camera.position.y = (Math.sin(-time / 8) / 2) * 3;
        this.$refs.camera.camera.lookAt(0, 0, 0);
        this.updateCubeRT();
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren() {
        this.modelRoot = this.$refs.letter.modelRoot;

        this.$refs.letter.children.forEach((child) => {
          child.origRotation = child.rotation.clone();
        });

        const outlineMaterial = new THREE.MeshBasicMaterial({ color : 0xffffff, side : THREE.BackSide, transparent : true, opacity : 1 });
        this.clone = this.$refs.letter.modelRoot.clone();

        this.clone.children.forEach((child) => {
          child.material = outlineMaterial;
          child.origRotation = child.rotation.clone();
          child.scale.multiplyScalar(1.05);
        });
        this.clone.position.z = 0.04;
        this.clone.position.y = 0.2;
        this.clone.position.z = -0.001;

        this.$refs.scene.scene.add(this.clone);
      },
      updateCubeRT() {
        if (this.$refs.letter.children && this.cubeCamera) {
          this.$refs.background.mesh.visible = false;
          this.$refs.letter.children.forEach((child) => { child.visible = false });
          if (this.$refs.noisyPlane) {
            this.$refs.noisyPlane.visible = false;
          }
          this.cubeCamera.update(this.$refs.renderer.renderer, this.$refs.scene.scene);
          this.$refs.background.mesh.visible = true;
          if (this.$refs.noisyPlane) {
            this.$refs.noisyPlane.visible = true;
          }
          this.$refs.letter.children.forEach((child) => { child.visible = true });
        }
      },
      onMove() {
        if (this.$refs.letter.children) {
          this.intersects = this.getIntersects(this.$refs.letter.children);
        }
      }
    }
  };
</script>

<style lang="scss">
.Letter-X {
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

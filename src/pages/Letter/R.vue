<template>
  <div class="Letter-R">
    <div class="Letter-R__assets">
      <video
        ref="video"
        :src="textureVideo"
        muted
        preload
        autoplay
        loop
      />
      <video
        ref="video2"
        :src="textureVideo2"
        muted
        preload
        autoplay
        loop
      />
    </div>
    <div class="Letter-R__overlay">
      <div class="Letter-R__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
    <Renderer
      ref="renderer"
      class="Letter-R__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      :shadow="false"
      @click="onClick"
      @mousemove="onMove"
      @touchmove="onMove"
    >
      <Camera
        ref="camera"
        :position="{ x : 1, y: -1, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <AmbientLight
          :penumbra="0.1"
          :position="{ x : -4.2, y : 8.0, z : 30 }"
          color="#ffffff"
          :intensity="0.80"
        />
        <PointLight
          ref="pointLightA"
          :penumbra="0.1"
          :cast-shadow="false"
          :position="{ x : -4.2, y : 8.0, z : 30 }"
          color="#ffffff"
          :intensity="0.80"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/R_v1.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              :reflectivity="0.15"
              :metalness="0.23"
              :envMapIntensity="7.0"
              :roughness="0.23"
              color="#ffffff"
              :clearcoat="0.022"
              :clearcoatRoughness="0.76"
              :ior="1.3"
              :refraction-ratio="0.0"
            />
          </ThreeModelLoader>
          <ThreeModelLoader
            ref="extras"
            title="Extras"
            :cast-shadow="false"
            :scale="{x: 5, y: 5, z: 5}"
            :position="{x: 0, y: -10, z: 0}"
            model="/src/assets/gltf/extras/Many_Shards.glb"
          >
            <PhysicalMaterial
              color="#1d09df"
              :reflectivity="0.90"
              :metalness="1.0"
              :roughness="0.39"
              :clearcoatRoughness="0.51"
              :envMapIntensity="16"
              :clearcoat="0.33"
              :refraction-ratio="0.36"
              :ior="1.9"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          ref="background"
          gradient="linear-gradient(225deg, #ff0066 67%, #360c86 0%)"
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
  import NoisyPlane from 'troisjs/src/components/noisy/NoisyPlane.js';
  import MirrorMesh from 'troisjs/src/components/meshes/MirrorMesh.js';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import textureVideo2 from '@assets/videos/Untitled.mp4';
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
        textureVideo2,
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.45,
          bloomThreshold : 0.95
        },
        unlockedTexture : 0
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-R' }, false);
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

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });

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

        this.$refs.scene.scene.background = envMap;

        this.$refs.extras.updateModelMaterial({
          envMap
        });

        const cubeRTSize = 1024;
        const cubeCameraNear = 0.1;
        const cubeCameraFar = 2000;
        const refractionRatio = 0.98;
        const cubeRT = new THREE.WebGLCubeRenderTarget(cubeRTSize, {
          mapping : THREE.CubeRefractionMapping, format : THREE.RGBFormat, generateMipmaps : true, minFilter : THREE.LinearMipmapLinearFilter
        });
        this.cubeCamera = new THREE.CubeCamera(cubeCameraNear, cubeCameraFar, cubeRT);

        this.origTexture = new THREE.VideoTexture(this.$refs.video);
        this.hoverTexture = new THREE.VideoTexture(this.$refs.video2);

        this.$refs.letter.updateModelMaterial({
          map : this.origTexture,
          envMap : cubeRT.texture,
          needsUpdate : true,
          refractionRatio
        });

        if (this.$refs.noisyPlane) {
          this.$refs.noisyPlane.material.envMap = cubeRT.texture;
        }
      },
      onUpdate(time) {
        //camera lookat center
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);

        if (this.$refs.letter.children) {
          this.$refs.letter.children.forEach((child) => {
            child.position.x = child.origPosition.x * (1 + (Math.sin(time) / 2 + .5) * 0.1);
            child.position.y = child.origPosition.y * (1 + (Math.sin(time) / 2 + .5) * 0.1);
            child.rotation.x = Math.sin(time) * child.random * 0.1;
            child.rotation.y = Math.cos(time) * child.random * 0.1;
          });
        }
        if (this.$refs.extras.children) {
          this.$refs.extras.modelRoot.rotation.y = 0.5 + Math.sin(time * 0.3) * 0.2; //0.001;
          this.$refs.extras.children.forEach((child) => {
            child.rotation.y = child.origRotation.y + Math.sin(time) * 0.1 * child.dir * Math.sin(time * child.random);
            child.rotation.x = child.origRotation.x + Math.sin(time) * 0.1 * child.dir * Math.sin(time * child.random);
          });
        }
        this.updateCubeRT();
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          child.material = child.material.clone();
        });
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
      onClick(e) {
        e.preventDefault();
        this.$refs.video2.play();
        const objects = this.$refs.letter.children;
        this.intersects = this.getIntersects(objects);

        if (this.intersects.length) {
          const child = this.intersects[0];
          if (child?.object) {
            if (child.object.material.map === this.hoverTexture) {
              child.object.material.map = this.origTexture;
            }
            else {
              child.object.material.map = this.hoverTexture;
              this.unlockedTexture = this.unlockedTexture + 1;
            }
            if (this.unlockedTexture > 7) this.unlockEasterEgg('R');
          }
        }
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);
        this.lightMove();
      },
      lightMove() {
        this.mouseLight = this.$refs.pointLightA.light;
        const { pointer } = this.$refs.renderer.three;
        this.target = new THREE.Vector3();
        this.target.copy(pointer.positionV3);
        this.mouseLight.position.copy(this.target);

        this.mouseLight.position.z = 10;
      }
    }
  };
</script>

<style lang="scss">
.Letter-R {
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

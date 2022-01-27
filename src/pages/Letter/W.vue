<template>
  <div class="Letter-Template">
    <Renderer
      ref="renderer"
      class="Letter-Template__canvas"
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
      @touchend="onTouchEnd"
      @click="onClick"
    >
      <Camera
        ref="camera"
        :position="{ x : -1, y: 1, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="light1"
          color="#1168E9"
          :intensity="settings.lightIntensity"
          :position="{ x: 0, y: 10, z: settings.lightZ }"
        />
        <PointLight
          ref="light2"
          color="#1CBEE1"
          :intensity="settings.lightIntensity"
          :position="{ x: 0, y: 10, z: settings.lightZ }"
        />
        <PointLight
          ref="light3"
          color="#8A3BEE"
          :intensity="settings.lightIntensity"
          :position="{ x: 0, y: 10, z: settings.lightZ }"
        />
        <PointLight
          ref="light4"
          color="#EA52ED"
          :intensity="settings.lightIntensity"
          :position="{ x: 0, y: 10, z: settings.lightZ }"
        />

        <NoisyPlane
          ref="noisyPlane"
          :width="200"
          :width-segments="100"
          :height="200"
          :height-segments="100"
          :time-coef="timeCoef"
          :noise-coef="7"
          :displacement-scale="10"
          :delta-coef="1 / 200"
          :position="{ x: 0, y: -18, z: 0 }"
          :rotation="{ x: -Math.PI / 2, y: 0, z: 0 }"
        >
          <PhysicalMaterial />
        </NoisyPlane>

        <PointLight
          ref="pointLightA"
          color="#fff"
          :penumbra="0.1"
          :cast-shadow="false"
          :intensity="0.30"
          :position="{ x : 20, y : 9.4, z : 30 }"
        />
        <PointLight
          ref="pointLightB"
          :penumbra="0.1"
          :cast-shadow="false"
          :intensity="0.40"
          :position="{ x : -20, y : 1.8, z : 30 }"
          color="#d00cdb"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/W_v1.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              :reflectivity="0.47"
              :metalness="0.033"
              :roughness="0.34"
              :clearcoat="0.65"
              :envMapIntensity="15"
              color="#df0bd9"
              :clearcoatRoughness="0.52"
              :ior="1.4"
              :refraction-ratio="0.33"
              :transmission="0.28"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(179.9deg, #10AAEC 0.63%, #5620EF 47.83%, #AA66EE 99.91%)"
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
  import NoisyPlane from '@components/NoisyPlane/NoisyPlane.js';
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader,
      NoisyPlane
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        textureVideo,
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.2,
          bloomThreshold : 0.95,
          lightIntensity : 0.39,
          lightZ : 4,
          lightY : 62,
          lightMoveDelta : 50
        },
        timeCoef : 0.0002,
        clicked : false,
        ps : 0.004,
        vs : 0.0,
        as : 0.0,
        f : 0,
        newCoaf : 0.0004
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-Template' }, false);
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
        return this.breakpointMobile ? 13 : 7;
      }
    },
    mounted() {
      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      this.tweakFolder.addInput(this.settings, 'lightIntensity', { min : 0, max : 2, step : 0.01 });
      this.tweakFolder.addInput(this.settings, 'lightZ', { min : 0, max : 100, step : 1 });
      this.tweakFolder.addInput(this.settings, 'lightY', { min : 0, max : 100, step : 1 });
      this.tweakFolder.addInput(this.settings, 'lightMoveDelta', { min : 0, max : 50, step : 1 });

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

        this.$refs.letter.updateModelMaterial({ envMap });
      },
      onUpdate(time) {
        if (this.$refs.letter.modelRoot) {
          this.$refs.letter.modelRoot.rotation.y = Math.sin(time * 0.5) * 0.2;
          this.$refs.letter.modelRoot.rotation.x = Math.sin(time * 0.3) * 0.1;
          this.$refs.letter.modelRoot.position.y = Math.sin(time * 0.7) * 0.4;
          const children = this.$refs.letter.modelRoot.children;
          if (children) {
            children.forEach((child) => {
              const noise = random.noise3D( // TODO : Setup looping noise
                child.position.x,
                time, // y pos, moving noise forward through y space
                child.position.z,
                0.4, // frequency
                0.3 // scale
              );

              const scale = 1 - Math.max(0, noise * 0.15);
              // set scale by distance (mouse, childPos)
              if (this.mousePosition) {
                const mx = this.mousePosition.x;
                const my = this.mousePosition.y;
                let mouseDist = Math.hypot(mx - child.position.x, my - child.position.y);
                mouseDist = Math.max(Math.min(mouseDist / 4, 0.3), 0);
                if (mouseDist < 0.2) this.unlockEasterEgg('W');
                child.scale.setScalar(Math.min((0.7 + mouseDist), scale));
              }
              else child.scale.setScalar(scale);
            });
          }
          this.$refs.renderer.three.camera.lookAt(0, 0, 0);
        }
        const d = this.settings.lightMoveDelta;
        const light1 = this.$refs.light1.light;
        const light2 = this.$refs.light2.light;
        const light3 = this.$refs.light3.light;
        const light4 = this.$refs.light4.light;
        light1.position.x = Math.sin(time * 0.1) * d;
        light1.position.y = this.settings.lightY + Math.cos(time * 0.2) * d;
        light2.position.x = Math.cos(time * 0.3) * d;
        light2.position.y = this.settings.lightY + Math.sin(time * 0.4) * d;
        light3.position.x = Math.sin(time * 0.5) * d;
        light3.position.y = this.settings.lightY + Math.sin(time * 0.6) * d;
        light4.position.x = Math.sin(time * 0.7) * d;
        light4.position.y = this.settings.lightY + Math.cos(time * 0.8) * d;
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        this.children = children;
      },
      onMove() {
        this.point = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.point);
        this.mousePosition = this.$refs.renderer.three.pointer.positionV3;
      },
      onTouchEnd() {
        this.mousePosition = null;
      }
    }
  };
</script>

<style lang="scss">
.Letter-Template {
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

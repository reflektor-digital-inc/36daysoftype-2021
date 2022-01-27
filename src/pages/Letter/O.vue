<template>
  <div class="O">
    <div class="O__assets">
      <video
        ref="video"
        :src="liquidVideo"
        autoplay
        loop
      />
    </div>
    <div class="O__overlay">
      <div class="O__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
    <Renderer
      ref="renderer"
      class="O__canvas"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      @mousemove="onMove"
      @click="onClick"
    >
      <Camera ref="camera" :position="{ x : 0, y: cameraPositionY, z: 0 }" />
      <Scene
        ref="scene"
        background="#03132c"
      >
        <AmbientLight
          ref="ambient"
          color="#e301be"
          :intensity="0.9"
        />

        <PointLight
          ref="pointLight"
          :position="{ x: -0, y: 0, z: 0 }"
          color="#e301be"
          :intensity="2"
        />
        <PointLight
          ref="pointLight"
          :position="{ x: 0, y: -1, z: 0 }"
          color="#f542bc"
          :intensity="3"
        />

        <PointLight
          ref="pointLight3"
          :position="{ x: -1.4, y: 20, z: 10 }"
          color="#e301be"
          :intensity="2"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="model"
            model="/src/assets/gltf/letters/O_v2.glb"
            @load="onModelLoaded"
          />
        </Group>
        <ThreeBackground
          :gradient="backgroundGradient"
        />
      </Scene>
      <EffectComposer ref="composer">
        <RenderPass />
        <UnrealBloomPass :strength="0.6" threshold="0.2" />

        <FXAAPass />
        <SMAAPass />
      </EffectComposer>
    </Renderer>
  </div>
</template>

<script>
  import gsap from 'gsap';
  import  { mapGetters, mapMutations } from 'vuex';
  import { BackSide, Vector3, Uniform, TextureLoader, Texture, PlaneGeometry, RepeatWrapping, SphereGeometry } from 'three';
  import _get from 'lodash/get';
  import random from 'canvas-sketch-util/random';
  import { COLOR_PURPLE, COLOR_MAGENTA } from '@settings/settings.colors';
  import liquidVideo from '@assets/videos/MartinTexture_1.mp4';
  import BarycentricTetrahedronGeometry from '@components/troisExtensions/BarycentricTetrahedronGeometry.js';
  import ReflektorLetters from '@components/ReflektorLetters';
  import { Water } from '@components/Water/Water.js';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import { FeedbackPass } from '@components/postprocessing/FeedbackPass';
  import waterImage from '@assets/textures/waternormals.jpg';
  import liquidBackground from '@assets/textures/liquid_texture.png';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ReflektorLetters,
      BarycentricTetrahedronGeometry,
      ThreeBackground,
      ThreeModelLoader
    },
    mixins : [loadingLogic],
    props : {
      envMap : { type : Object, default : null }
    },
    data() {
      return {
        COLOR_PURPLE,
        COLOR_MAGENTA,
        reflektorMap : new Uniform(new Texture()),
        liquidMap : new Texture(),
        liquidVideo,
        BackSide,
        backgroundGradient : 'linear-gradient(45deg, #101010, #550055 50%, #330033)',
        envGradient : 'linear-gradient(90deg, #6b00ff, #ff0066 67%, #360c86 27%, #24c5e0 0%)',
        envGradient2 : 'linear-gradient(135deg, #ff0066, #661cbb 34%, #ff0066)',
        duringAnimation : false
      };
    },
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionY() {
        return this.breakpointMobile ? -13 : -10;
      }
    },
    created() {
      // Set an initial random seed
      random.setSeed(random.getRandomSeed());

      this.tweakFolder = this.$tweakpane.addFolder({ title : 'O' }, false);
    },
    mounted() {
      this.scene = this.$refs.scene.scene;
      this.renderer = this.$refs.renderer.renderer;
      this.camera = this.$refs.camera.camera;

      const waterGeometry = new SphereGeometry(1.01, 20, 20);

      this.water = new Water(
        waterGeometry,
        {
          textureWidth : 512,
          textureHeight : 512,
          waterNormals : new Texture(),
          sunDirection : new Vector3(),
          sunColor : 0xffffff,
          waterColor : 0x141414,
          distortionScale : 10.7,
          fog : this.scene.fog !== undefined
          // side : DoubleSide
        }
      );

      this.water.position.z -= 0.18;
      this.scene.add(this.water);

      const planeGeometry = new PlaneGeometry(1000, 1000);
      this.plane = new Water(
        planeGeometry,
        {
          textureWidth : 512,
          textureHeight : 512,
          waterNormals : new Texture(),
          sunDirection : new Vector3(),
          sunColor : 0xffffff,
          waterColor : 0x141414,
          distortionScale : 10.7,
          fog : this.scene.fog !== undefined
          // side : DoubleSide
        }
      );
      this.scene.add(this.plane);
      this.plane.rotation.x = Math.PI / 2;
      this.plane.position.y += 1;

      this.feedbackPass = new FeedbackPass();
      this.$refs.composer.composer.addPass(this.feedbackPass);

      this.loadingPromises.push(this.loadTextures());

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
        const textureLoader = new TextureLoader();

        const liquidTexture = await textureLoader.loadAsync(liquidBackground);
        this.scene.background = liquidTexture;

        const waterTexture = await textureLoader.loadAsync(waterImage);
        waterTexture.wrapS = waterTexture.wrapT = RepeatWrapping;

        this.water.material.uniforms.normalSampler.value = waterTexture;
        this.plane.material.uniforms.normalSampler.value = waterTexture;
      },
      onUpdate(time) {
        // for each chunk of a letter
        if (!this.children) {
          return;
        }
        this.modelRoot.rotation.x = - Math.PI / 2;

        this.children.forEach((child) => {
          // in the ThreeModelLoader.vue component I also assign a seed based random and original rotation/position to each mesh in the gltf group
          const { origPosition, movementDirection, movementIntensity } = child;
          child.position.y = origPosition.y + Math.sin(time) * 1 * movementDirection * movementIntensity;
          child.position.z = origPosition.z + Math.sin(time) * 3 * movementDirection * movementIntensity;
        });
        if (this.water) {
          this.water.scale.x = 1 + Math.sin(time) * 0.1;
          this.water.scale.y = 1 + Math.sin(time) * 0.1;
          this.water.scale.z = 1 + Math.sin(time) * 0.1;

          this.water.material.uniforms[ 'time' ].value += 0.0001;
        }
        if (this.plane) {
          this.plane.material.uniforms[ 'time' ].value += 0.0001;
        }
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
      },
      onModelLoaded(children, modelRoot) {
        this.modelRoot = modelRoot;
        this.children = _get(modelRoot, 'children');

        this.children.forEach((child, index) => {
          child.index = index;
          child.origScale = child.scale.clone();
          child.origPosition = child.position.clone();
          child.origRotation = child.rotation.clone();
          child.movementIntensity = Math.random() / 10;
          child.movementDirection = Math.sign(index % 3 - 0.5);
        });
      },

      onClick() {
        if (this.duringAnimation) return;
        this.duringAnimation = true;
        const tl = gsap.timeline();
        // setTimeout(() => {this.$refs.composer.composer.addPass(this.feedbackPass)}, 2400);

        tl
          .fromTo(
            this.$refs.camera.camera.position,
            {
              y : this.cameraPositionY
            },
            {
              y : 0,
              duration : 3,
              ease : 'elastic.in(1, 0.6)',
              onComplete : () => {
                this.unlockEasterEgg('O');
              }
            }
          )
          .to(
            this.feedbackPass,
            {
              delay : 1.5,
              duration : 1,
              intensity : 1
            },
            '<'
          )
          .to(
            this.$refs.camera.camera.rotation,
            {
              y : this.$refs.camera.camera.rotation + Math.PI / 2
            },
            '<'
          )
          .from(
            this.$refs.camera.camera.position,
            {
              y : -40,
              duration : 2,
              ease : 'elastic.out(1, 0.7)',
              onComplete : () => {
                this.duringAnimation = false;
              }
            }
          )
          .to(
            this.feedbackPass,
            {
              ease : 'power2.in',
              duration : 2,
              intensity : 0
            }
          );
      },

      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
      }
    }
  };
</script>

<style lang="scss">
.O {
  &__canvas {
    z-index: 3;
    @include full-size(absolute);
  }
  &__assets {
    z-index: 0;
  }
  &__bg {
    z-index: 1;
    @include full-size(absolute);
    background-image: linear-gradient(to bottom left, #1d1e66, rgb(15, 0, 19));
    transform: scale(1.6);
    transform-origin: 0% 90%;
    pointer-events: none;
  }
  &__underlay {
    @include full-size(absolute);
    z-index: 2;
    pointer-events: none;
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

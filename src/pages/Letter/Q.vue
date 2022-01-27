<template>
  <div class="Letter-Q">
    <div class="Letter-Q__assets">
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
      class="Letter-Q__canvas"
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
        :position="{ x : -1, y: 1, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          color="#fff"
          :penumbra="0.1"
          :cast-shadow="false"
          :intensity="0.50"
          :position="{ x : 24, y : 2.9, z : 30 }"
        />
        <PointLight
          ref="pointLightB"
          color="#ffffff"
          :penumbra="0.1"
          :intensity="0.40"
          :position="{ x : -20, y : 2.0, z : 30 }"
          :cast-shadow="false"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/Q_v1.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              :envMapIntensity="2.4"
              :metalness="0.40"
              :clearcoat="0.0"
              :roughness="0.50"
            />
          </ThreeModelLoader>
          <InstancedMesh
            ref="sprites"
            :count="settings.numInstances"
            :scale="{ x : 3, y : 4, z : 3 }"
            :position="{ z : -2.8 }"
          >
            <BoxGeometry
              :width="0.005"
              :height="0.005"
              :depth="0.3"
            />
            <StandardMaterial
              transparent
              :opacity="0.5"
              :roughness="1.0"
              :metalness="0.54"
              :envMapIntensity="8.3"
            />
          </InstancedMesh>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(225deg, #24c5e0 100%, #360c86 45%, #ff0066 1%)"
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
  import { addLightFolder, materialTweaks } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        textureVideo,
        envGradient : 'linear-gradient(225deg, #24c5e0 100%, #360c86 45%, #ff0066 1%)',
        settings : {
          bloomStrength : 0.3,
          bloomThreshold : 0.95,
          numInstances : 240
        }
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-Q' }, false);
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
        return this.breakpointMobile ? 9 : 5;
      }
    },
    mounted() {
      this.dummyObject = new THREE.Object3D();

      this.loadingPromises.push(this.loadTextures());

      this.setUpSpriteGeometry();

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      // materials
      materialTweaks(this.tweakFolder, this.$refs.sprites.mesh.material, { title : 'Object Material' });

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
        this.$refs.sprites.mesh.material.envMap = envMap;
      },
      onUpdate(time) {
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);

        if (this.$refs.letter.modelRoot) {
          this.$refs.letter.modelRoot.rotation.x = random.noise2D(time, 1, 2, 0.06);
          this.$refs.letter.modelRoot.rotation.y = random.noise2D(1, time, 2, 0.06);
        }

        for (let i = 0; i < this.settings.numInstances; i++) {
          const { position, scale } = this.instances[i];
          position.y += 0.007 * gsap.ticker.deltaRatio(60);
          position.x += 0.007 * gsap.ticker.deltaRatio(60);
          if (position.y > 1) {
            position.y = -1;
            position.x = -position.x;
          }

          this.dummyObject.scale.copy(scale);
          this.dummyObject.position.copy(position);

          const scaleFactor = Math.cos(position.y * 3.14) / 2 + .5; // 0 - 1 - 0
          this.dummyObject.scale.multiplyScalar(scaleFactor);
          this.dummyObject.userData.scaleFactor = scaleFactor;

          this.dummyObject.updateMatrix();
          this.$refs.sprites.mesh.setMatrixAt(i, this.dummyObject.matrix);
        }
        this.$refs.sprites.mesh.instanceMatrix.needsUpdate = true;
      },
      createTimeline() {
        const { children } = this.$refs.letter;
        const childPositions = children.map(child => child.position);
        const childScales = children.map(child => child.scale);

        const duration = 0.5;
        const stagger = 0.05;
        const fromEase = 'power2.out';
        const toEase = 'power2.in';

        this.timeline = gsap.timeline({ repeat : -1 });
        this.timeline
          .from(
            childPositions,
            {
              x : index => children[index].origPosition.x - 0.7,
              y : index => children[index].origPosition.y - 0.7,
              ease : fromEase,
              duration,
              stagger
            }
          )
          .from(
            childScales,
            {
              x : 0,
              y : 0,
              ease : fromEase,
              duration,
              stagger
            },
            '<'
          )
          .to(
            childPositions,
            {
              x : index => children[index].origPosition.x + 0.7,
              y : index => children[index].origPosition.y + 0.7,
              ease : toEase,
              duration,
              stagger
            }
          )
          .to(
            childScales,
            {
              x : 0,
              y : 0,
              ease : toEase,
              duration,
              stagger
            },
            '<'
          );
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          child.scale.set(0.9, 0.9, 0.9);
        });

        this.createTimeline();
      },
      setUpSpriteGeometry() {
        const spread = 1;

        this.instances = [];

        for (let i = 0; i < this.settings.numInstances; i++) {
          this.dummyObject.position.set(
            random.range(-spread * 2, spread * 2),
            random.range(-spread, spread),
            random.range(-spread, spread)
          );
          const scale = random.range(0.5, 3);
          this.dummyObject.scale.set(scale, scale, scale);
          this.dummyObject.rotation.set(Math.PI / 4, -Math.PI / 4, Math.PI / 4);
          this.dummyObject.updateMatrix();
          this.$refs.sprites.mesh.setMatrixAt(i, this.dummyObject.matrix);

          this.instances.push({
            position : this.dummyObject.position.clone(),
            scale : this.dummyObject.scale.clone()
          });
        }
        this.$refs.sprites.mesh.instanceMatrix.needsUpdate = true;
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);

        if (this.pointer.x > 0.3) {
          this.timeline.timeScale(this.pointer.x * 5);
          this.unlockEasterEgg('Q');
        }
        else if (this.pointer.x < -0.3) {
          this.timeline.timeScale((1 - this.pointer.x) * 0.3);
          this.unlockEasterEgg('Q');
        }
        else {
          this.timeline.timeScale(1);
        }
      }
    }
  };
</script>

<style lang="scss">
.Letter-Q {
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

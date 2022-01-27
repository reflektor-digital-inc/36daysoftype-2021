<template>
  <div class="Letter-N">
    <div class="Letter-N__assets">
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
      class="Letter-N__canvas"
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
        :position="{ x : -1, y: -0.3, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          color="#fff"
          :position="{ x : 20, y : 2, z : 30 }"
          :intensity="0.40"
          :penumbra="0.1"
          :cast-shadow="false"
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
            model="/src/assets/gltf/letters/N_v1.glb"
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
            :rotation="{ x : 0.5 }"
            :position="{ z : -0.5, y : -2 }"
            :count="settings.numInstances"
          >
            <PlaneGeometry />
            <StandardMaterial
              :envMapIntensity="12"
              :metalness="0.17"
              :roughness="0.0"
            />
          </InstancedMesh>
        </Group>
        <ThreeBackground
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
  import cloudImage from '@assets/textures/cloud.png';
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
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.2,
          bloomThreshold : 0.95,
          numInstances : 400,
          instanceYScale : 2
        }
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-N' }, false);
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
      this.$refs.sprites.material.transparent = true;
      this.$refs.sprites.material.depthWrite = false;
      this.$refs.sprites.mesh.material.onBeforeCompile = (shader) => {
        // replace regular projection matrix shader fragment with
        // fragment that points vertices towards camera (billboarding)

        shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
          vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );

          float scalingFactor = sqrt(
            instanceMatrix[0][0] * instanceMatrix[0][0] + instanceMatrix[0][1] * instanceMatrix[0][1] + instanceMatrix[0][2] * instanceMatrix[0][2]
          );

          mvPosition.xyz += position * scalingFactor;

          gl_Position = projectionMatrix * mvPosition;
        `);
      };
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

        const textureLoader = new THREE.TextureLoader();
        const cloudTexture = await textureLoader.loadAsync(cloudImage);

        this.$refs.sprites.material.envMap = envMap;
        this.$refs.sprites.material.map = cloudTexture;
        this.$refs.sprites.material.needsUpdate = true;
      },
      onUpdate(time) {
        this.$refs.camera.camera.position.x = Math.sin(time * 0.5);
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);

        for (let i = 0; i < this.settings.numInstances; i++) {
          const { position, scale } = this.instances[i];
          const { instanceYScale } = this.settings;
          position.y += 0.001 * gsap.ticker.deltaRatio(60);
          position.y = this.instances[i].position.y % instanceYScale;

          this.dummyObject.scale.copy(scale);
          this.dummyObject.position.copy(position);

          const scaleFactor = 1 - (0.5 + Math.cos(position.y * 2 * 3.14) / 2); // 0 - 1 - 0
          this.dummyObject.scale.multiplyScalar(scaleFactor);
          this.dummyObject.userData.scaleFactor = scaleFactor;

          this.dummyObject.updateMatrix();
          this.$refs.sprites.mesh.setMatrixAt(i, this.dummyObject.matrix);
        }
        this.$refs.sprites.mesh.instanceMatrix.needsUpdate = true;
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          child.scale.set(1, 1, 1);
        });
      },
      setUpSpriteGeometry() {
        const spread = 1;

        this.instances = [];

        for (let i = 0; i < this.settings.numInstances; i++) {
          this.dummyObject.position.set(
            random.range(-spread * 2, spread * 2),
            random.range(0, this.settings.instanceYScale),
            random.range(-spread, spread)
          );
          const scale = random.range(0.5, 3);
          this.dummyObject.scale.set(scale, scale, scale);
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

        this.raycaster.setFromCamera(this.pointer, this.$refs.renderer.three.camera);
        const intersect = this.raycaster.intersectObject(this.$refs.sprites.mesh);

        if (intersect.length > 0) {
          this.unlockEasterEgg('N');
          const instanceId = intersect[0].instanceId;

          const scale = random.range(0.5, 3);
          const tl = gsap.timeline();
          tl.to(
            this.instances[instanceId].scale,
            {
              x : this.instances[instanceId].scale.x / 2,
              y : this.instances[instanceId].scale.y / 2,
              z : this.instances[instanceId].scale.z / 2,
              duration : 0.5
            }
          ).to(
            this.instances[instanceId].scale,
            {
              x : scale,
              y : scale,
              z : scale,
              duration : 1,
              delay : 0.5
            }
          );
        }
      }
    }
  };
</script>

<style lang="scss">
.Letter-N {
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

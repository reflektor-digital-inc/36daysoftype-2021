<template>
  <div class="Letter-1">
    <Renderer
      ref="renderer"
      class="Letter-1__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      :shadow="false"
      @mousemove="onMove"
      @mousedown="setMouseDown(true)"
      @mouseup="setMouseDown(false)"
      @mouseleave="setMouseDown(false)"
      @touchmove="onMove"
      @touchstart="setMouseDown(true)"
      @touchend="setMouseDown(false)"
    >
      <Camera
        ref="camera"
        :position="{ x : 0, y: 1, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <Group ref="pointLightAGroup">
          <PointLight
            ref="pointLightA"
            color="#fff"
            :intensity="1.0"
            :position="{ x : 16, y : 3.8, z : -7.0 }"
            :penumbra="0.1"
            :cast-shadow="false"
          />
        </Group>
        <PointLight
          ref="pointLightB"
          color="#ffffff"
          :penumbra="0.1"
          :cast-shadow="false"
          :intensity="0.20"
          :position="{ x : 8.0, y : 6.6, z : 28 }"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/1_v1.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              color="#9b2ac2"
              :envMapIntensity="15"
              :clearcoatRoughness="0.48"
              :clearcoat="0.96"
              :roughness="0.58"
              :metalness="0.25"
              :reflectivity="0.65"
              :ior="1.4"
              :transmission="0.033"
            />
          </ThreeModelLoader>
        </Group>

        <PointLight
          ref="light"
          color="#0060ff"
          :intensity="0.5"
        />
        <PointLight
          color="#ff6000"
          :intensity="0.5"
          :position="{ x: 100}"
        />
        <PointLight
          color="#0000ff"
          :intensity="0.5"
          :position="{ x: -100}"
        />

        <InstancedMesh ref="imesh" :count="NUM_INSTANCES">
          <BoxGeometry
            :width="0.019"
            :height="0.019"
            :depth="10"
          />
          <StandardMaterial
            :transparent="false"
            :metalness="1"
            :roughness="0.5"
          />
        </InstancedMesh>

        <ThreeBackground
          gradient="linear-gradient(225deg, #6b00ff, #ff0066, #360c86)"
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
  import { Vector3, Object3D, MathUtils } from 'three';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import loadingLogic from '@mixins/loading-logic.js';

  const { randFloat : rnd, randFloatSpread : rndFS } = MathUtils;

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader
    },
    mixins : [loadingLogic],
    data() {
      return {
        textureVideo,
        mouseDown : false,
        oldMouseDown : false,
        mouse : {
          x : 0,
          y : 0,
          cx : 0,
          cy : 0
        },
        time : 0,
        totalPausedTime : 0,
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.3,
          bloomThreshold : 0.45
        }
      };
    },
    setup() {
      const NUM_INSTANCES = 4000;
      const instances = [];
      const target = new Vector3();
      const dummyO = new Object3D();
      const dummyV = new Vector3();
      for (let i = 0; i < NUM_INSTANCES; i++) {
        const randomOnSphere = random.onSphere(rnd(9, 11));
        instances.push({
          position : new Vector3(randomOnSphere[0], randomOnSphere[1], randomOnSphere[2]),
          scaleMin : rnd(0.5, 1),
          scaleRange : rnd(0.1, 0.5),
          freq : rnd(1, 8),
          velocity : new Vector3(rndFS(0.00001), rndFS(0.00001), rndFS(0.00001)),
          attraction : 0.02 + rnd(-0.01, 0.01),
          vlimit : 1.2 + rnd(-0.1, 0.1)
        });
      }
      return {
        NUM_INSTANCES,
        instances,
        target,
        dummyO,
        dummyV
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
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-1' }, false);
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
    mounted() {
      this.loadTextures();

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      this.renderer = this.$refs.renderer;
      this.imesh = this.$refs.imesh.mesh;
      this.light = this.$refs.light.light;
      this.target = new Vector3(0, 0, 0);
      this.init();

      this.$refs.camera.camera.lookAt(new THREE.Vector3(0, 0.55, 2));
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
      init() {
        // init instanced mesh matrix
        for (let i = 0; i < this.NUM_INSTANCES; i++) {
          const { position } = this.instances[i];
          this.dummyO.position.copy(position);
          this.dummyO.scale.set(1, 1, 1);
          this.dummyO.lookAt(this.target);
          this.dummyO.updateMatrix();
          this.imesh.setMatrixAt(i, this.dummyO.matrix);
        }
        this.imesh.instanceMatrix.needsUpdate = true;
      },
      onMove(event) {
        const eventX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
        const eventY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;
        this.mouse.x = (eventX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (eventY / window.innerHeight) * 2 + 1;
        if (this.mouseDown) this.unlockEasterEgg('1');
      },
      setMouseDown(val) {
        this.mouseDown = val;
      },
      onUpdate(time) {
        // run once when mouse changes from up/down
        if (this.oldMouseDown !== this.mouseDown) {
          this.oldMouseDown = this.mouseDown;

          if (this.mouseDown) {
            this.time = time;
            this.mouse.cx = this.mouse.x;
            this.mouse.cy = this.mouse.y;

            gsap.to(this.settings, {
              bloomStrength : 0.9,
              bloomThreshold : 0.39,
              duration : 1.2,
              ease : 'power4.out',
              overwrite : 'auto'
            });
          }
          else {
            // keep track of the total amount of paused time to offset the ticker with.
            // also we add on (this.mouse.x - this.mouse.cx) * 2; because this is the amount of time controlled by mouse pos;
            this.totalPausedTime += time - (this.time + (this.mouse.x - this.mouse.cx) * 2);
            gsap.to(this.settings, {
              bloomStrength : 0.3,
              bloomThreshold : 0.45,
              duration : 3,
              ease : 'power4.out',
              overwrite : 'auto'
            });
          }
        }

        // offset time with paused time
        let offsetTime = time - this.totalPausedTime;
        if (this.mouseDown) {
          // if mousedown, pause time and fastforward/rewind using the horizontal mouse pos
          offsetTime = this.time - this.totalPausedTime + (this.mouse.x - this.mouse.cx) * 2;
        }

        if (this.$refs.letter.modelRoot) {
          this.$refs.letter.modelRoot.rotation.y = Math.sin(offsetTime * 0.5) * 0.2;
        }
        this.animateParticles(offsetTime);
      },
      animateParticles(time) {
        this.imesh.rotation.y = 0.1 * time;
        this.$refs.pointLightAGroup.group.rotation.z = 1.8 * time;
        for (let i = 0; i < this.NUM_INSTANCES; i++) {
          const { position, scaleMin, scaleRange, freq } = this.instances[i];

          this.dummyO.position.copy(position);
          this.dummyO.scale.set(1, 1, scaleMin + (Math.sin(time * freq) * scaleRange));
          this.dummyO.lookAt(this.target);
          this.dummyO.updateMatrix();
          this.imesh.setMatrixAt(i, this.dummyO.matrix);
        }
        this.imesh.instanceMatrix.needsUpdate = true;
      },

      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren() {
        this.$refs.group.group.scale.set(0.4, 0.4, 0.4);
      }
    }
  };
</script>

<style lang="scss">
.Letter-1 {
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

<template>
  <div class="L">
    <Renderer
      ref="renderer"
      class="L__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      @mousemove="onMouseOver"
      @touchmove="onMouseOver"
      @touchend="onTouchEnd"
    >
      <Camera
        :position="{ x : -0.7, y : -0.2, z : cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLight"
          :position="{ x: -30, y: 2.09, z: 15.00 }"
          color="#fff"
          :intensity="0.50"
        />
        <PointLight
          ref="pointLight2"
          color="#fff"
          :position="{ x : 26, y : 13.14, z : 30 }"
          :intensity="0.20"
        />
        <DirectionalLight
          ref="directLight"
          color="#ffffff"
          :position="{x: 0, y : 0, z:1}"
          :intensity="0.2"
        />
        <PointLight
          ref="flash"
          color="#062d89"
          :intensity="3"
          :position="{ x : 20, y : 20, z : -40 }"
        />
        <PointLight
          ref="flashNear"
          color="#062d89"
          :intensity="0.5"
          :position="{ x : 0, y : 20, z : 45 }"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            model="/src/assets/gltf/letters/L.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              color="#c2b719"
              :reflectivity="0.42"
              :metalness="0.77"
              :roughness="0.033"
              :clearcoat="0.80"
              :ior="1.6"
              :envMapIntensity="7.0"
            />
          </ThreeModelLoader>
        </Group>
        <Group
          v-for="index in 25"
          :ref="cloudGroup"
          :key="index"
        >
          <Mesh>
            <PlaneGeometry
              :width="50"
              :height="50"
            />
            <LambertMaterial
              :transparent="true"
            >
              <Texture :src="smokeTexture" :on-load="onCloudTextureLoad" />
            </LambertMaterial>
          </Mesh>
        </Group>
        <InstancedMesh
          ref="rainIMesh"
          :count="RAIN_COUNT"
          :position="{x:0, y:0, z:0}"
          :rotation="{x:0, y:0, z:-Math.PI*0.1}"
        >
          <BoxGeometry
            :width="0.007"
            :height="0.1"
            :depth="0.007"
          />
          <StandardMaterial
            :transparent="true"
            :opacity="0.8"
            :metalness="0.4"
            :roughness="0.4"
          />
        </InstancedMesh>
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
  import  { mapGetters } from 'vuex';
  import * as THREE from 'three';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
  import hdr from '@assets/textures/satara_night_1k.hdr?url';
  import mouseMovement from '@mixins/mouse-movement.js';
  import smokeTexture from '@assets/textures/smoke.png';
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
        textureVideo,
        smokeTexture,
        backgroundGradient : 'linear-gradient(270deg, #101111 0%, #052c96 46%, #556cbf 65%, #782495 100%)',
        envGradient : 'linear-gradient(225deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.12,
          bloomThreshold : 0.67
        },
        clouds : []
      };
    },
    setup() {
      return {
        RAIN_COUNT : 500
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'H' }, false);
      // Set an initial random seed
      random.setSeed(random.getRandomSeed());
      // Log it for later reproducibility
      const randMonitor = { seed : random.getSeed() };
      this.tweakFolder.addMonitor(randMonitor, 'seed');

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
        return this.breakpointMobile ? 11 : 7;
      }
    },
    created() {
      this.cloudResolver = this.createNewLoadingPromise();
    },
    mounted() {
      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight2.light, { title : 'Point Light B' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.directLight.light, { title : 'Directional Light' });
      this.initClouds();
      this.initRainIMesh();
      // this.initRain();
      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
    },
    methods : {
      initRainIMesh() {
        this.rainImesh = this.$refs.rainIMesh.mesh;
        this.rainObjTrackers = [];
        const ranMin = -5;
        const ranMax = 5;
        for (let i = 0; i < this.RAIN_COUNT; i++) {
          const rainObj = new THREE.Object3D();
          rainObj.position.set(random.range(ranMin, ranMax), random.range(ranMin, ranMax), random.range(ranMin, ranMax));
          const rotY = random.range(0, Math.PI * 2);
          rainObj.rotateY(rotY);
          rainObj.userData.rotY = rotY;
          this.rainObjTrackers.push(rainObj);
        }
      },
      animateRain() {
        this.rainImesh = this.$refs.rainIMesh.mesh;
        const yLimit = 5;
        this.rainObjTrackers.map((rainObj, i) => {
          rainObj.position.y -= 0.07;
          if (rainObj.position.y < -yLimit) {
            rainObj.position.y = yLimit;
          }
          rainObj.userData.rotY += 0.0001;
          rainObj.rotateY(rainObj.userData.rotY);
          rainObj.updateMatrix();
          this.rainImesh.setMatrixAt(i, rainObj.matrix);
        });
        this.rainImesh.instanceMatrix.needsUpdate = true;
      },
      async loadTextures() {
        const pmremGenerator = new THREE.PMREMGenerator(this.$refs.renderer.renderer);
        pmremGenerator.compileEquirectangularShader();
        const rgbeLoader = new RGBELoader();
        rgbeLoader.setDataType(THREE.UnsignedByteType);

        const hdrDataTexture = await rgbeLoader.loadAsync(hdr);
        const hdrMap = pmremGenerator.fromEquirectangular(hdrDataTexture).texture;
        this.$refs.letter.updateModelMaterial({ envMap : hdrMap });
      },
      onCloudTextureLoad() {
        this.cloudResolver();
      },
      cloudGroup(clouds) {
        this.clouds.push(clouds);
      },
      initClouds() {
        this.clouds.map((sGroupRef) => {
          const group = sGroupRef.group;
          const mesh = sGroupRef.group.children[0];
          group.rotateZ(random.range(0, Math.PI * 2));
          mesh.position.set(Math.random() * 40 - 20, Math.random() * 40 - 20, Math.random() * 50 - 70);
          mesh.material.opacity = 0.6;
          mesh.material.depthWrite = false;
        });
      },
      onUpdate(time) {
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);

        this.$refs.group.group.rotation.y = Math.sin(time) * 0.05;
        this.$refs.group.group.position.y = Math.sin(time) * 0.15;
        this.clouds.map((sGroupRef) => {
          const mesh = sGroupRef.group.children[0];
          mesh.rotation.z = time * 0.05;
        });

        if (this.intersects) {
          if (this.intersects.length) {
            this.$refs.group.group.position.y = Math.sin(time * 100) * Math.sin(time * 2) * 0.15;

            this.$refs.letter.children.forEach((child) => {
              child.scale.setScalar(0.95);
              child.rotation.y = child.origRotation.y + Math.sin(time * 100) * 0.05;
            });

            if (Math.random() > 0.5 || this.$refs.flash.light.power > 100) {
              if (this.$refs.flash.light.power < 500) {
                this.$refs.flash.light.position.set(random.range(-30, 30), random.range(-30, 30), -50);
              }
              this.$refs.flash.light.power = Math.random() * 200 + 50;
              this.$refs.flashNear.light.power = Math.random() * 100 + 50;
            }
          }
          else {
            this.$refs.flash.light.power = 0.1;
            this.$refs.flashNear.light.power = 0.1;
            this.$refs.letter.children.forEach((child) => {
              child.scale.setScalar(1);
              child.rotation.y = child.origRotation.y;
            });
          }
        }

        this.animateRain();
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          child.scale.set(1, 1, 1);
        });
      },
      onMouseOver() {
        // set up an @click or mouse move event on the scene div
        // get the normalized screen coordinate you want to screencast from
        // // make or get a raycaster object
        // get array of object3Ds to intersect with
        const point = this.$refs.renderer.three.pointer.positionN;
        const objects = this.$refs.letter.children;
        // intersect objects
        this.intersects = this.getIntersects(objects, 'L');
        this.setCameraPositionTarget(point);
      },
      onTouchEnd() {
        this.intersects = [];
      }
    }
  };
</script>

<style lang="scss">
.L {
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
    background-image: linear-gradient(to bottom left, #ff9a02, #ff5400, #6b00ff, #f06, #1e0c86, #24c5e0);
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

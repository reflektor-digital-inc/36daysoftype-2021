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
      @click="onClick"
    >
      <Camera
        ref="camera"
        :position="{ x : 0, y: 0, z: 8 }"
      />
      <Scene ref="scene">
        <Group ref="pointLightAGroup">
          <PointLight
            ref="pointLightA"
            color="#00cf59"
            :intensity="1.0"
            :position="{ x : -7.2, y: -7, z: 0.5 }"
            :penumbra="0.1"
            :cast-shadow="false"
          />
        </Group>
        <PointLight
          ref="pointLightB"
          color="#fff807"
          :penumbra="0.1"
          :cast-shadow="false"
          :intensity="1"
          :position="{ x : 8.0, y : 6.6, z : 28 }"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="border"
            :position="{ x : -7.2, y: -7, z: 0.5 }"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/reflektor_border.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              color="#9b2ac2"
              :envMapIntensity="15"
              :clearcoatRoughness="0.48"
              :clearcoat="0.96"
              :roughness="0.58"
              :metalness="0.25"
              :reflectivity="1"
              :ior="1.4"
              :transmission="0.033"
            />
          </ThreeModelLoader>

          <ThreeModelLoader
            ref="letter"
            :position="{ x : -7.2, y: -7, z: 0.5 }"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/reflektor_letters.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              color="#9b2ac2"
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

        <PointLight
          ref="light"
          :position="{ x : -5, y: 0, z: 5 }"
          color="#FFFFFF"
          :intensity="2"
        />
        <PointLight
          ref="light"
          :position="{ x : 5, y: 0, z: 5 }"
          color="#FFFFFF"
          :intensity="2"
        />
        <PointLight
          ref="light"
          :position="{ x : 0, y: 0, z: 5 }"
          color="#FFFFFF"
          :intensity="2"
        />
        <PointLight
          ref="light"
          :position="{ x : 0, y: 20, z: 5 }"
          color="#FFFFFF"
          :intensity="2"
        />
        <PointLight
          ref="light"
          color="#EA52ED"
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
          gradient="linear-gradient(200deg, #f00000, #f00000, #ff8000, #ff8000, #ffff00, #ffff00, #007940, #007940, #4040ff)"
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
  import * as THREE from 'three';
  import { Vector3 } from 'three';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import mouseMovement from '@mixins/mouse-movement.js';

  // import ReflektorLetters from '@components/ReflektorLetters.vue'; // reflektor logo overlay
  // import { materialTweaks } from '@utils/tweakpane-utils';

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader
    },
    mixins : [mouseMovement],
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
        envGradient : 'linear-gradient(200deg, #f00000, #f00000, #ff8000, #ff8000, #ffff00, #ffff00, #007940, #007940, #4040ff)',
        settings : {
          bloomStrength : 0.3,
          bloomThreshold : 1.00
        }
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

      // materials
      // materialTweaks(this.tweakFolder, this.$refs.YOUR_TROIS_OBJECT.mesh.material, { title : 'Object Material' });

      this.renderer = this.$refs.renderer;
      this.imesh = this.$refs.imesh.mesh;
      this.light = this.$refs.light.light;
      this.target = new Vector3(0, 0, 0);
      this.init();

      this.$refs.camera.camera.lookAt(new THREE.Vector3(0, 0, 0));
      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
    },
    methods : {
      async loadTextures() {
        const envMap = generateGradientTextureFromString(this.envGradient);
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        this.$refs.letter.updateModelMaterial({ envMap });
      },
      init() {
        this.imesh.instanceMatrix.needsUpdate = true;
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);
      },
      setMouseDown(val) {
        this.mouseDown = val;
      },
      onUpdate(time) {
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
        if (this.$refs.border.modelRoot) {
          this.$refs.group.group.children[0].rotation.y = time * 0.6;
          this.$refs.group.group.children[1].rotation.y = time * -0.6;
          this.$refs.group.group.children[1].rotation.x = time * -0.6;
        }
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

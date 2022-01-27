<template>
  <div class="Letter-2">
    <Renderer
      ref="renderer"
      class="Letter-2__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      :shadow="false"
    >
      <Camera
        ref="camera"
        :position="{ x : 0, y: 0.5, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          :penumbra="0.1"
          :cast-shadow="false"
          color="#027aeb"
          :intensity="1.0"
          :position="{ x : 4.0, y : 1.8, z : 30 }"
        />
        <PointLight
          ref="pointLightB"
          :penumbra="0.1"
          :cast-shadow="false"
          color="#ffffff"
          :intensity="0.30"
          :position="{ x : -30, y : -0.20, z : 30 }"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :position="{x: 0, y: 0, z: 0}"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/2_v1.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              :transparent="true"
              color="#5a20ff"
              :reflectivity="0.50"
              :envMapIntensity="14"
              :ior="1.4"
              :transmission="0.28"
              :refraction-ratio="0.34"
              :clearcoatRoughness="0.51"
              :clearcoat="0.42"
              :metalness="0.34"
              :roughness="0.76"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(135deg, #e301be, #e301be)"
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
        updateMouse : true,
        colorBlue : 0x5a20ff,
        colorRed : 0xff0000,
        colorYellow : 0xfff203,
        letters : [],
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.3,
          bloomThreshold : 0.7
        },
        hovered : 0
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-2' }, false);
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
        return this.breakpointMobile ? 13 : 9;
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
        if (this.updateMouse) {
          this.onMove();
          this.updateMouse = false;
          setTimeout(() => {this.updateMouse = true}, 10);
        }

        if (this.$refs.group.group) {
          this.$refs.group.group.rotation.z = Math.sin(time * 0.1) * 0.1;
          this.$refs.group.group.rotation.y += 0.01;
        }
        this.$refs.camera.camera.position.y = -2 + Math.sin(time * 0.5) / 2;

        if (this.letters) {
          this.letters.map((l, i) => {
            l.position.y = Math.sin(time * 1.5 + i) * 0.1;
            l.rotation.z = 0.2 + Math.sin(time * 1) * 0.2;
            l.children[0].material.opacity = 0.3 + random.noise1D(i * 0.9, 0.05, 0.7) + 0.7 / 2;
          });
        }
        if (this.intersects) {
          if (this.intersects.length) {
            const obj = this.intersects[0].object;
            if (obj.tl) {
              obj.tl.kill();
              obj.tl = undefined;
            }
            obj.tl = gsap.timeline({
              onComplete : () => {
                obj.tl.kill();
                obj.tl = undefined;
              }
            });

            obj.tl.to(
              obj.material.color,
              {
                r : 170 / 255,
                g : 150 / 255,
                b : 240 / 255,
                duration : 0.2,
                onComplete : () => {
                  this.hovered = this.hovered + 1;
                }
              }
            );
            obj.tl.to(
              obj.material.color,
              {
                r : 90 / 255,
                g : 32 / 255,
                b : 255 / 255,
                duration : 0.5,
                delay : 3
              }
            );
          }
        }
        if (this.letterMeshes.length !== 0 && this.hovered > this.letterMeshes.length / 2) {
          this.unlockEasterEgg('2');
          this.hovered = 0;
        }
      },
      onMove() {
        // control camera by mouse move
        if (this.letterMeshes && this.letterMeshes.length > 0) {
          this.intersects = this.getIntersects(this.letterMeshes);
        }
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children, modelRoot) {
        this.letter = modelRoot;
        this.letter.children[0].position.x = 1.3;
        this.letter.children[0].position.y = -2.5;
        this.letterGroup = this.$refs.group.group;

        const num = 70;
        const angleStep = Math.PI * 2 / (num);
        this.letters = [this.letter];
        this.letterMeshes = [this.letter.children[0]];
        for (let i = 1; i < num; i++) {
          const letter = this.letter.clone(true);
          letter.children[0].material = letter.children[0].material.clone();
          letter.rotation.y = i * angleStep;
          this.letters.push(letter);
          this.letterGroup.add(letter);
          this.letterMeshes.push(letter.children[0]);
        }
      }
    }
  };
</script>

<style lang="scss">
.Letter-2 {
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

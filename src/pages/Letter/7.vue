<template>
  <div class="Seven">
    <Renderer
      ref="renderer"
      class="Seven__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      @mousemove="onMove"
      @touchmove="onMove"
    >
      <Camera
        :position="{ x : -0.7, y : 0.6, z : cameraPositionZ }"
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
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            model="/src/assets/gltf/letters/7_1.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              ref="letterMaterial"
              color="#d644ff"
              :clearcoat="0.62"
              :clearcoatRoughness="0.30"
              :metalness="0.22"
              :reflectivity="0.30"
              :ior="1.4"
              :refraction-ratio="1.0"
              :roughness="0.58"
              :envMapIntensity="1.5"
            />
          </ThreeModelLoader>
        </Group>

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
  import  { mapGetters, mapMutations } from 'vuex';
  import * as THREE from 'three';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder, materialTweaks } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
  import hdr from '@assets/textures/shanghai_bund_1k.hdr?url';
  import mouseMovement from '@mixins/mouse-movement.js';
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
        backgroundGradient : 'linear-gradient(45deg, #610373 5%, #832fa1 20%, #3a0855 54%, #00b8ff 93%)',
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
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionZ() {
        return this.breakpointMobile ? 14 : 10;
      }
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
    mounted() {
      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight2.light, { title : 'Point Light B' });
      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);

      if (this.timeline) {
        this.timeline.kill();
        this.timeline = null;
      }
      this.tweakFolder.dispose();
    },
    methods : {
      ...mapMutations({
        unlockEasterEgg : 'easterEgg/unlockEasterEgg'
      }),
      async loadTextures() {
        const pmremGenerator = new THREE.PMREMGenerator(this.$refs.renderer.renderer);
        pmremGenerator.compileEquirectangularShader();
        const rgbeLoader = new RGBELoader();
        rgbeLoader.setDataType(THREE.UnsignedByteType);

        const hdrDataTexture = await rgbeLoader.loadAsync(hdr);
        const hdrMap = pmremGenerator.fromEquirectangular(hdrDataTexture).texture;
        this.letter1.children[0].material.envMap = hdrMap;
        this.letter2.children[0].material.envMap = hdrMap;
      },
      onUpdate() {
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
      },
      createTimeline() {
        const group = this.$refs.group.group;
        const group2 = this.group2;
        const group3 = this.group3;
        const group4 = this.group4;

        this.zoomTl1 = gsap.timeline({ repeat : -1, delay : -2, repeatDelay : 2 });
        this.zoomTl1.fromTo(
          group.scale,
          {
            x : 0,
            y : 0,
            z : 0
          },
          {
            x : 0.2,
            y : 0.2,
            z : 0.2,
            duration : 2,
            ease : 'power2.out'
          }
        ).to(
          group.scale,
          {
            x : 1,
            y : 1,
            z : 1,
            duration : 2,
            ease : 'power2.out'
          }
        ).to(
          group.scale,
          {
            x : 30,
            y : 30,
            z : 30,
            duration : 2,
            ease : 'power2.in'
          }
        ).to(
          group.position,
          {
            z : 30,
            duration : 2,
            ease : 'power2.in',
            onComplete : () => {
              group.scale.set(0, 0, 0);
            }
          },
          '<'
        );
        this.zoomTl2 = gsap.timeline({ repeat : -1, repeatDelay : 2 });
        this.zoomTl2.fromTo(
          group2.scale,
          {
            x : 0,
            y : 0,
            z : 0
          },
          {
            x : 0.2,
            y : 0.2,
            z : 0.2,
            duration : 2,
            ease : 'power2.out'
          }
        ).to(
          group2.scale,
          {
            x : 1,
            y : 1,
            z : 1,
            duration : 2,
            ease : 'power2.out'
          }
        ).to(
          group2.scale,
          {
            x : 30,
            y : 30,
            z : 30,
            duration : 2,
            ease : 'power2.in'
          }
        ).to(
          group2.position,
          {
            z : 30,
            duration : 2,
            ease : 'power2.in',
            onComplete : () => {
              group2.scale.set(0, 0, 0);
            }
          },
          '<'
        );
        this.zoomTl3 = gsap.timeline({ repeat : -1, delay : 2, repeatDelay : 2 });
        this.zoomTl3.fromTo(
          group3.scale,
          {
            x : 0,
            y : 0,
            z : 0
          },
          {
            x : 0.2,
            y : 0.2,
            z : 0.2,
            duration : 2,
            ease : 'power2.out'
          }
        ).to(
          group3.scale,
          {
            x : 1,
            y : 1,
            z : 1,
            duration : 2,
            ease : 'power2.out'
          }
        ).to(
          group3.scale,
          {
            x : 30,
            y : 30,
            z : 30,
            duration : 2,
            ease : 'power2.in'
          }
        ).to(
          group3.position,
          {
            z : 30,
            duration : 2,
            ease : 'power2.in',
            onComplete : () => {
              group3.scale.set(0, 0, 0);
            }
          },
          '<'
        );
        this.zoomTl4 = gsap.timeline({ repeat : -1, delay : 4, repeatDelay : 2 });
        this.zoomTl4.fromTo(
          group4.scale,
          {
            x : 0,
            y : 0,
            z : 0
          },
          {
            x : 0.2,
            y : 0.2,
            z : 0.2,
            duration : 2,
            ease : 'power2.out'
          }
        ).to(
          group4.scale,
          {
            x : 1,
            y : 1,
            z : 1,
            duration : 2,
            ease : 'power2.out'
          }
        ).to(
          group4.scale,
          {
            x : 30,
            y : 30,
            z : 30,
            duration : 2,
            ease : 'power2.in'
          }
        ).to(
          group4.position,
          {
            z : 30,
            duration : 2,
            ease : 'power2.in',
            onComplete : () => {
              group4.scale.set(0, 0, 0);
            }
          },
          '<'
        );
        this.timeline = gsap.timeline({ repeat : -1 });
        this.timeline.to(
          group.rotation,
          {
            y : Math.PI,
            duration : 2,
            ease : 'power2.out'
          },
        ).to(
          group2.rotation,
          {
            y : 0,
            duration : 2,
            ease : 'power2.out'
          },
          '<'
        ).to(
          group3.rotation,
          {
            y : Math.PI,
            duration : 2,
            ease : 'power2.out'
          },
          '<'
        ).to(
          group4.rotation,
          {
            y : 0,
            duration : 2,
            ease : 'power2.out'
          },
          '<'
        ).to(
          group.rotation,
          {
            y : Math.PI * 2,
            duration : 2,
            ease : 'power2.out'
          },
        ).to(
          group2.rotation,
          {
            y : -Math.PI,
            duration : 2,
            ease : 'power2.out'
          },
          '<'
        ).to(
          group3.rotation,
          {
            y : Math.PI * 2,
            duration : 2,
            ease : 'power2.out'
          },
          '<'
        ).to(
          group4.rotation,
          {
            y : -Math.PI,
            duration : 2,
            ease : 'power2.out'
          },
          '<'
        );
      },
      setUpLetterChildren() {
        this.letter1 = this.$refs.letter.modelRoot;
        this.letter2 = this.$refs.letter.modelRoot.clone();

        this.material1 = this.$refs.letter.modelRoot.children[0].material;
        this.material2 = this.$refs.letter.modelRoot.children[0].material.clone();

        // make left 7
        this.letter1.position.y += 0.2;
        this.letter2.position.y += 0.2;
        this.letter2.rotation.y = -Math.PI;
        this.letter2.children[0].material = this.material2;
        this.material2.color = new THREE.Color(0x00c3e3);
        this.material2Folder = materialTweaks(this.tweakFolder, this.material2, { title : `Material 2` });

        this.$refs.group.group.add(this.letter1);
        this.$refs.group.group.add(this.letter2);

        this.group2 = this.$refs.group.group.clone();
        this.group3 = this.$refs.group.group.clone();
        this.group4 = this.$refs.group.group.clone();

        this.$refs.scene.scene.add(this.group2);
        this.$refs.scene.scene.add(this.group3);
        this.$refs.scene.scene.add(this.group4);
        this.group2.rotation.y = Math.PI;
        this.group4.rotation.y = Math.PI;
        this.group2.scale.set(0.2, 0.2, 0.2);
        this.group3.scale.set(0, 0, 0);

        this.loadingPromises.push(this.loadTextures());
        this.createTimeline();
      },
      playVideo() {
        this.$refs.video.play();
      },
      onMove() {
        this.pointer3D = this.$refs.renderer.three.pointer.positionV3;
        this.setCameraPositionTarget(this.pointer3D);

        let mouseY = Math.max(Math.min(this.pointer3D.y, 5), 0);
        mouseY = (mouseY + 5) / 10 * (Math.PI * 2) - Math.PI;
        this.$refs.group.group.rotation.x = mouseY / 2;
        this.group2.rotation.x = mouseY / 2;
        this.group3.rotation.x = mouseY / 2;
        this.group4.rotation.x = mouseY / 2;
        if (mouseY > 2) this.unlockEasterEgg('7');
      }
    }
  };
</script>

<style lang="scss">
.Seven {
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

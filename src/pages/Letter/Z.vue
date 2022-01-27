<template>
  <div class="Letter-Z">
    <Renderer
      ref="renderer"
      class="Letter-Z__canvas"
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
        :position="{ x : -1, y: 1, z: cameraZPos.value }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          color="#fff"
          :position="{ x : 20, y : 2, z : 30 }"
          :penumbra="0.1"
          :cast-shadow="false"
          :intensity="0.70"
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
            model="/src/assets/gltf/letters/z.glb"
            :position="{y : -.4}"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              :envMapIntensity="2.4"
              :metalness="0.40"
              :clearcoat="0.0"
              :roughness="0.50"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(135deg, #ff0066, #661cbb 34%, #ff0066)"
          :color="null /* consider also using a solid color */"
        />
      </Scene>
      <EffectComposer ref="composer">
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
  import { gsap, Elastic } from 'gsap';
  import  { mapGetters, mapMutations } from 'vuex';
  import * as THREE from 'three';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
  import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
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
        envGradient : 'linear-gradient(225deg, #6b00ff, #ff0066 67%, #360c86 27%, #24c5e0 0%)',
        settings : {
          bloomStrength : 0.4,
          bloomThreshold : 0.95,
          glitchEnabled : false
        },
        cameraZPos : { value : this.cameraPositionZ }
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
    watch : {
      'settings.glitchEnabled' : function (enabled) {
        if (enabled) {
          this.addGlitchPass();
        }
        else {
          this.removeGlitchPass();
        }
      }
    },
    provide() {
      this.$tweakpane.hidden = true;
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-Z' }, false);
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
      this.loadingPromises.push(this.loadTextures());

      this.segments = [];

      this.afterImagePass = new AfterimagePass(0.98);
      this.$refs.composer.composer.addPass(this.afterImagePass);

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'glitchEnabled');
      ppFolder.addButton({
        title : 'Animate Camera'
      }).on('click', () => {
        this.animateCamera();
      });
      this.glitchPass = null;

      const afterImageDamp = this.tweakFolder.addFolder({ title : 'After Image Damp' });
      afterImageDamp.addInput(this.afterImagePass.uniforms['damp'], 'value', {
        min : 0.7,
        max : 1,
        step : 0.0001
      });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      // materials

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
        }
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          child.scale.set(0.9, 0.9, 0.9);
          this.segments.push(child);
        });
        this.animateSegments();
        this.animateCamera();
      },
      addGlitchPass() {
        if (!this.glitchPass) {
          this.glitchPass = new GlitchPass();
          this.$refs.composer.composer.addPass(this.glitchPass);
          this.glitchEnabled = true;
        }
      },
      removeGlitchPass() {
        if (this.glitchPass) {
          this.$refs.composer.composer.removePass(this.glitchPass);
          this.glitchPass = null;
          this.glitchEnabled = false;
        }
      },
      animateCamera() {
        gsap.fromTo(
          this.cameraZPos,
          { value : 50 },
          {
            value : this.cameraPositionZ,
            duration : 3,
            ease : 'power2.out'
          }
        );
      },
      animateSegments() {
        this.segments.forEach((segment, index) => {
          gsap.fromTo(
            segment.position,
            { z : segment.origPosition.z - 6 },
            { z : segment.origPosition.z, duration : 1, delay : index * 0.12, ease : 'power2.out' },
          );
          gsap.fromTo(
            segment.rotation,
            { z : -6, y : -4 },
            { z : segment.origRotation.z, y : segment.origRotation.y, duration : 1, delay : index * 0.12, ease : 'power2.out' },
          );
          gsap.fromTo(
            segment.scale,
            { x : 0, y : 0, z : 0 },
            { x : 1, y : 1, z : 1, delay : index * 0.12, duration : 1, ease : 'power2.out' },
          );
        });
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);
      },
      onClick() {
        const objects = this.$refs.letter.children;
        this.intersects = this.getIntersects(objects);
        if (this.intersects.length) {
          this.unlockEasterEgg('Z');
          objects.forEach((child) => {
            gsap.fromTo(
              child.rotation,
              {
                y : Math.PI / 2

              },
              {
                y : child.origRotation.y,
                duration : 2,
                ease : Elastic.easeOut.config(1.2, 0.2)
              }
            );
          });
        }
      }
    }
  };
</script>

<style lang="scss">
.Letter-Z {
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

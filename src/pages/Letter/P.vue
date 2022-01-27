<template>
  <div class="Letter-P">
    <Renderer
      ref="renderer"
      class="Letter-P__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      orbit-ctrl
      :shadow="false"
    >
      <Camera
        ref="camera"
        :position="{ x : -1, y : 2, z : cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          color="#0000ff"
          :position="{ x : -4.7, y : 3.7, z : -20 }"
          :intensity="0.30"
          :penumbra="0.1"
          :cast-shadow="false"
        />
        <PointLight
          ref="pointLightB"
          color="#ff0000"
          :penumbra="0.1"
          :position="{ x : 7.3, y : 1.1, z : -15 }"
          :intensity="0.30"
          :cast-shadow="false"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/P_v1.glb"
            @load="setUpLetterChildren"
          >
            <SubSurfaceMaterial
              vertex-colors
              :thickness-attenuation="0.99"
              :thickness-distortion="0.35"
              :thickness-ambient="0.057"
              :thickness-power="6.3"
              :thickness-scale="5.8"
              :u-shininess="135"
            />
          </ThreeModelLoader>
          <ThreeModelLoader
            ref="extras"
            title="Extras"
            :cast-shadow="false"
            model="/src/assets/gltf/extras/Twisted_Wire.glb"
            :position="{ z : -4 }"
            :scale="{ x : 1.1, y : 1.1, z : 1.1 }"
          >
            <ShaderMaterial
              :uniforms="uniforms"
              :fragment-shader="reflektorFrag"
              :vertex-shader="baseVertex"
              :u-fresnel-start="-6.5"
              :u-fresnel-end="-21"
              :u-fresnel-intensity="5.6"
              :u-fade="1.0"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(45deg, #101010, #550055 50%, #330033)"
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
  import baseVertex from '@shaders/baseVertex.vert';
  import reflektorFrag from '@shaders/reflektorGradient.frag';
  import { REFLEKTOR_COLORS } from '@settings/settings.colors';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader
    },
    mixins : [loadingLogic],
    data() {
      return {
        baseVertex,
        reflektorFrag,
        uniforms : {
          gradient : {
            value : generateGradientTextureFromString(
              'linear-gradient(180deg, #6b00ff, #ff0066, #360c86, #24c5e0)'
            )
          },
          fresnelStart : { value : 0.0 },
          fresnelEnd : { value : 0.75 },
          fresnelIntensity : { value : 1.1 },
          fade : { value : 1 },
          time : { value : 0 },
          baseColor : { value : new THREE.Color(0x000000) }
        },
        textureVideo,
        envGradient : 'linear-gradient(45deg, #6b00ff, #ff0066, #360c86, #24c5e0)',
        settings : {
          bloomStrength : 0.49,
          bloomThreshold : 0.71
        }
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-P' }, false);
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
      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      // materials
      this.$refs.extras.material.flatShading = false;

      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);

      if (this.timeline) {
        this.timeline.kill();
        this.timeline = null;
      }
      if (this.cameraTimeline) {
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
        const envMap = generateGradientTextureFromString(this.envGradient);
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        this.$refs.letter.updateModelMaterial({ envMap });
      },
      onUpdate(time) {
        this.$refs.extras.material.uniforms.time.value = time;
      },
      createTimeline() {
        const { children } = this.$refs.letter;
        const camPositions = [
          { x : 1, y : -1, z : this.cameraPositionZ + 0.2 },
          { x : -3, y : -1, z : this.cameraPositionZ },
          { x : 2, y : 0, z : this.cameraPositionZ + 0.5 },
          { x : -1, y : 2, z : this.cameraPositionZ }
        ];

        let tweenCounter = 0;
        this.timeline = gsap.timeline({ repeat : -1 });

        camPositions.forEach((camPosition) => {
          this.timeline.to(this.$refs.camera.camera.position, {
            x : camPosition.x,
            y : camPosition.y,
            z : camPosition.z,
            duration : 1,
            ease : 'power3.out',
            onComplete : () => {
              if (this.$refs.pointLightA) {
                const color1 = REFLEKTOR_COLORS[tweenCounter % REFLEKTOR_COLORS.length];
                this.$refs.pointLightA.light.color.set(color1);
              }
              if (this.$refs.pointLightB) {
                const color2 = REFLEKTOR_COLORS[tweenCounter + 1 % REFLEKTOR_COLORS.length];
                this.$refs.pointLightB.light.color.set(color2);
              }

              gsap.fromTo(
                children[tweenCounter % children.length].scale,
                { x : 0.9, y : 0.9, z : 0.9 },
                {
                  x : 1.2,
                  y : 1.2,
                  z : 1.2,
                  duration : 1,
                  repeat : 1,
                  yoyo : true,
                  ease : 'elastic.out',
                  yoyoEase : 'none'
                }
              );
              gsap.fromTo(
                children[tweenCounter % children.length].rotation,
                { x : 0, y : 0, z : 0 },
                {
                  x : random.range(-0.1, 0.1),
                  y : random.range(-0.1, 0.1),
                  z : random.range(-0.1, 0.1),
                  duration : 1,
                  repeat : 1,
                  yoyo : true,
                  ease : 'elastic.out',
                  yoyoEase : 'none'
                }
              );
              tweenCounter++;
              if (tweenCounter % children.length > 4) this.unlockEasterEgg('P');
            }
          });
        });
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          child.scale.set(0.9, 0.9, 0.9);
        });

        this.createTimeline();
      }
    }
  };
</script>

<style lang="scss">
.Letter-P {
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

<template>
  <div class="Letter-J">
    <Renderer
      ref="renderer"
      class="Letter-J__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      @mousemove="onMove"
      @touchmove="onMove"
      @click="onClick"
    >
      <Camera
        ref="camera"
        :position="{ x : -0.7, y : 0.2, z : cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          color="#fff"
          :intensity="0.30"
          :position="{ x : 2.4, y : 0.0, z : -14 }"
        />
        <PointLight
          ref="pointLightB"
          color="#9452ff"
          :position="{ x : 19, y : -7.7, z : 30 }"
          :intensity="0.20"
        />
        <PointLight
          ref="mouseLight"
          color="#FFC0C0"
          :intensity="0.01"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            model="/src/assets/gltf/letters/J_v1.glb"
            @load="setUpLetterChildren"
          >
            <SubSurfaceMaterial
              vertex-colors
              thickness-color="#c557ff"
              :thickness-distortion="0.92"
              :thickness-scale="3.8"
              uniform-specular="#ffffff"
              :u-thickness-distortion="1.0"
              :u-thickness-attenuation="3.5"
              :u-thickness-ambient="0.47"
              :u-thickness-power="2.1"
              :u-shininess="137"
            />
          </ThreeModelLoader>
          <ThreeModelLoader
            ref="extras"
            title="Extras"
            model="/src/assets/gltf/extras/smooth_shards.glb"
            :position="{ z : 0.2, y : -0.1 }"
            @load="setUpExtrasChildren"
          >
            <SubSurfaceMaterial
              vertex-colors
              :thickness-distortion="0.36"
              :thickness-attenuation="0.99"
              :thickness-power="6.1"
              :thickness-scale="6.5"
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
  import { gsap, Elastic } from 'gsap';
  import  { mapGetters } from 'vuex';
  import * as THREE from 'three';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import { REFLEKTOR_COLORS } from '@settings/settings.colors';
  import mouseMovement from '@mixins/mouse-movement.js';
  import springMixin from '@mixins/spring-physics.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ReflektorLetters,
      ThreeBackground,
      ThreeModelLoader
    },
    mixins : [mouseMovement, springMixin, loadingLogic],
    data() {
      return {
        textureVideo,
        backgroundGradient : 'linear-gradient(45deg, #101010, #550055 50%, #330033)',
        envGradient : 'linear-gradient(90deg, #6b00ff, #ff0066 67%, #360c86 27%, #24c5e0 0%)',
        envGradient2 : 'linear-gradient(135deg, #ff0066, #661cbb 34%, #ff0066)',
        settings : {
          bloomStrength : 0.39,
          bloomThreshold : 0.96
        },
        intersection : null

      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-J' }, false);
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
      // this.lightMove();
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
      },
      playVideo() {
        this.$refs.video.play();
      },
      onUpdate(time) {
        this.$refs.pointLightA.light.position.x = Math.sin(time) * 2;
        this.$refs.pointLightA.light.position.y = Math.cos(time) * 2;

        if (this.$refs.extras.children) {
          this.$refs.extras.children.forEach((child) => {
            child.rotation.y = child.origRotation.y + Math.sin(time) * 0.1 * child.dir * Math.sin(time * child.random);
            child.rotation.x = child.origRotation.x + Math.sin(time) * 0.1 * child.dir * Math.sin(time * child.random);
          });
        }
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);

        // update spring physics
        this.updateSpring(this.children, 'J');
      },
      setUpLetterChildren(children) {
        this.children = children;
        const colours = [new THREE.Color('#fff'), new THREE.Color('#ccc'), new THREE.Color('#ccc')];

        children.forEach((child, index) => {
          child.scale.set(1.15, 1.15, 1.15);
          child.rotation.x = child.origRotation.x + child.random * 0.3;
          child.rotation.z = child.origRotation.z + child.random * 0.3;

          const colorAttribute = child.geometry.attributes.position.clone();

          const color = colours[index % colours.length];

          // fill attribute with colors
          for (let i = 0; i < colorAttribute.array.length / 3; i++) {
            colorAttribute.setXYZ(i, color.r, color.g, color.b);
          }
          child.geometry.setAttribute('color', colorAttribute);
        });

        this.setUpLetterSpring(this.children);
      },
      setUpExtrasChildren(children) {
        children.forEach((child, index) => {
          const colorAttribute = child.geometry.attributes.position.clone();

          const color = REFLEKTOR_COLORS[index % REFLEKTOR_COLORS.length];

          // fill attribute with colors
          for (let i = 0; i < colorAttribute.array.length / 3; i++) {
            colorAttribute.setXYZ(i, color.r, color.g, color.b);
          }
          child.geometry.setAttribute('color', colorAttribute);
        });
      },
      onClick() {
        // get array of object3Ds to intersect with

        // let click;
        const objects = this.$refs.extras.children;
        // intersect objects
        const intersects = this.getIntersects(objects);

        if (intersects.length) {
          // the first object in intersect array has been clicked on directly
          const obj = intersects[0].object;
          if (obj.isAnimating) return;

          const tl = gsap.timeline({
            onComplete : () => {
              obj.isAnimating = false;
            }
          });
          this.$sfx.play('dull-beep-001');
          obj.isAnimating = true;
          tl.to(
            obj.position,
            {
              y : -10,
              duration : 2,
              delay : 0.5,
              ease : 'power3.inOut',
              yoyo : true,
              repeat : 1
            }
          ).to(
            obj.position,
            {
              y : obj.origPosition.y,
              duration : 3,
              ease : Elastic.easeOut.config(1, 0.8)
            }
          );
        }
      },
      onMove(event) {
        this.onMoveSpring(event);

        const mouse = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(mouse);
      },

      lightMove() {
        this.mouseLight = this.$refs.mouseLight.light;
        const { pointer } = this.$refs.renderer.three;
        this.target = new THREE.Vector3();
        this.target.copy(pointer.positionV3);

        this.mouseLight.position.copy(this.target);
        this.mouseLight.position.z += 2;
        this.mouseLight.intensity = 0.3;
        this.mouseLight.scale.setScalar(0.1);
      }
    }
  };
</script>

<style lang="scss">
.Letter-J {
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

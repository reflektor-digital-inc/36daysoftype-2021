<template>
  <div class="H">
    <Renderer
      ref="renderer"
      class="H__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over

      pointer
      @mousemove="onMove"
      @touchmove="onMove"
      @click="onClick"
    >
      <Camera
        ref="camera"
        :position="{ x : -1.6, y : -0.75, z : cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLight"
          :position="{ x: -30, y: 2.09, z: 15.00 }"
          color="#ffc000"
          :intensity="0.1"
        />
        <PointLight
          ref="pointLight2"
          :position="{ x: 22.57, y: -20.86, z: 30.00 }"
          color="#ffac00"
          :intensity="0.5"
        />
        <Group ref="group">
          <GLTFModel
            ref="model"
            :src="letterGlbUrl"
            :position="{ y : 0.1 }"
            @load="onModelLoaded"
          />
          <ThreeModelLoader
            ref="shards"
            model="/src/assets/gltf/extras/Many_Shards.glb"
            @load="onShardLoaded"
          >
            <PhysicalMaterial
              color="#dbceff"
              :metalness="0.8"
              :roughness="0.4"
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
  import  { mapGetters, mapMutations } from 'vuex';
  import * as THREE from 'three';
  import _get from 'lodash/get';
  import letterGlbUrl from '@assets/gltf/letters/H_v1.glb';
  import extrasGLBUrl from '@assets/gltf/extras/Many_Shards.glb';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder, materialTweaks } from '@utils/tweakpane-utils';
  import liquidVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import mouseMovement from '@mixins/mouse-movement.js';
  import springMixin from '@mixins/spring-physics.js';
  import { audiospriteSpriteNames } from '@utils/AudiospriteAudioController';
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
        letterGlbUrl,
        extrasGLBUrl,
        backgroundGradient : 'linear-gradient(135deg, #24c5e0, #ff0066 67%, #ff4702 100%)',
        envGradient : 'linear-gradient(90deg, #ff0066, #661cbb 34%, #ff0066)',
        envGradient2 : 'linear-gradient(-90deg, #ffff33 10%, #520a28 50%, #160a52 100%)',
        liquidMap : new THREE.Texture(),
        liquidVideo,
        settings : {
          bloomStrength : 0.57,
          bloomThreshold : 0.86
        }
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'H' }, false);
      return {
        tweakFolder : this.tweakFolder
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
    created() {
      // Set an initial random seed
      random.setSeed(random.getRandomSeed());
    },
    mounted() {
      this.material = new THREE.MeshPhysicalMaterial({
        color : '#dba78b',
        reflectivity : .96,
        metalness : 0.09,
        roughness : 0.45,
        clearcoat : 0.7,
        clearcoatRoughness : 0.55,
        envMapIntensity : 15.8,
        ior : 1.66,
        morphNormals : true,
        morphTargets : true
      });

      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // material
      materialTweaks(this.tweakFolder, this.material, { title : 'Letter Material' });

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight2.light, { title : 'Point Light B' });

      this.previousPoint = this.$refs.renderer.three.pointer.positionN;

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
        const envMap2 = generateGradientTextureFromString(this.envGradient2);
        envMap2.mapping = THREE.EquirectangularReflectionMapping;

        this.material.envMap = envMap2;
        this.$refs.scene.scene.environment = envMap;
        this.$refs.scene.scene.background = envMap;
      },
      onUpdate(time) {
        this.$refs.group.group.rotation.y = Math.sin(time) * 0.01;
        this.settings.bloomStrength = 0.6 + Math.sin(time * 2) * 0.2;
        this.setCameraPositionTarget(this.pointer);
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);

        this.updateSpring([...this.children]);
      },
      onModelLoaded(modelRoot) {
        this.modelRoot = modelRoot;
        this.children = _get(modelRoot, 'children');
        this.setUpLetterSpring(this.children);
        this.children.forEach((child, index) => {
          child.origScale = child.scale.clone();
          child.origPosition = child.position.clone();
          child.origRotation = child.rotation.clone();
          child.movementIntensity = Math.random();
          child.movementDirection = Math.sign(index % 2 - 0.5);
          child.material = this.material;
          child.scale.set(0.8, 0.8, 0.8);
        });
      },
      onShardLoaded(children) {
        this.shards = children;
        this.setUpLetterSpring(this.shards, 0.7, 20, 0.7);
        this.shards.forEach((child) => {
          child.clickedTimes = 0;
        });
      },
      onMove(event) {
        this.mouse = new THREE.Vector2();
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.onMoveSpring(event);
      },
      onClick() {
        const objects = this.shards;

        // intersect objects
        this.clickIntersects = this.getIntersects(objects);
        if (this.clickIntersects.length) {
          // the first object in intersect array has been clicked on directly

          const obj = this.clickIntersects[0].object;
          obj.clickedTimes += 1;
          const id = this.$sfx.play(audiospriteSpriteNames[`dull-beep-00${obj.clickedTimes}`]);
          this.$sfx.setVolume(id, 0.5);
          if (obj.clickedTimes <= 2) {
            gsap.fromTo(
              obj.rotation,
              {
                y : obj.origRotation.y
              },
              {
                y : obj.origRotation.y + 0.1,
                duration : 0.1,
                repeat : 2
              }
            );
          }
          if (obj.clickedTimes === 3) {
            const tl = gsap.timeline();
            tl.fromTo(
              obj.rotation,
              {
                y : obj.origRotation.y
              },
              {
                y : obj.origRotation.y + 0.1,
                duration : 0.1,
                repeat : 2
              }
            ).to(
              obj.position,
              {
                y : -10,
                duration : 1,
                // delay : 0.3,
                ease : 'power4.out'
              }
            ).to(
              obj.position,
              {
                y : obj.origPosition.y,
                duration : 2,
                ease : Elastic.easeOut.config(1, 0.7),
                onComplete : () => {
                  obj.clickedTimes = 0;
                  this.unlockEasterEgg('H');
                }
              }
            );
          }
        }
      },
      playVideo() {
        this.$refs.video.play();
      }
    }
  };
</script>

<style lang="scss">
.H {
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
    background-image: linear-gradient(to bottom left, #ff9902, #ff5400, #6b00ff, #f06, #1e0c86, #24c5e0);
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

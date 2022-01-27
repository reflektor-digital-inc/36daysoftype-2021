<template>
  <div class="B">
    <div class="B__overlay">
      <div class="B__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
    <Renderer
      ref="renderer"
      class="B__canvas"
      :alpha="true"
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
      <Camera :position="cameraPosition" />
      <Scene ref="scene">
        <PointLight
          ref="pointLight"
          :position="{ x: 11, y: -2, z: 7.2 }"
          color="#e9ebda"
          :intensity="0.5"
        />
        <PointLight
          ref="pointLight2"
          :position="{ x: -3.9, y: -0.7, z: 0.9 }"
          color="#b2aaff"
          :intensity="1.1"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="model"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/B_Final.glb"
            @load="onModelLoaded"
          />
          <ThreeModelLoader
            ref="shards"
            title="Shards"
            :cast-shadow="false"
            model="/src/assets/gltf/extras/smooth_shards.glb"
            @load="onShardModelLoaded"
          />
        </Group>
        <ThreeBackground
          gradient="linear-gradient(225deg, #ff5400 0%, #6b00ff 30%, #f06 60%, #1e0c86 78%, #24c5e0 100%)"
        />
      </Scene>
    </Renderer>
  </div>
</template>

<script>
  import gsap from 'gsap';
  import { mapGetters, mapMutations } from 'vuex';
  import * as THREE from 'three';
  import letterGlbURL from '@assets/gltf/letters/B_Final.glb';
  import shardGLBUrl from '@assets/gltf/extras/smooth_shards.glb';
  import random from 'canvas-sketch-util/random';
  import { COLOR_PURPLE, COLOR_MAGENTA } from '@settings/settings.colors';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import reflektorOverlayImage from '@assets/images/reflector-overlay-1.png';
  import elementsImage from '@assets/images/iridescent-mat@2x-fixed.png';
  import liquidImage from '@assets/textures/liquid_texture.png';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import mouseMovement from '@mixins/mouse-movement.js';
  import SpringMixin from '@mixins/spring-physics.js';
  import loadingLogic from '@mixins/loading-logic.js';
  import { audiospriteSpriteNames } from '@utils/AudiospriteAudioController.js';

  export default {
    components : {
      ImagePreLoader,
      ReflektorLetters,
      ThreeModelLoader,
      ThreeBackground
    },
    mixins : [mouseMovement, SpringMixin, loadingLogic],
    data() {
      return {
        glbUrl : letterGlbURL,
        shardGLBUrl,
        COLOR_PURPLE,
        COLOR_MAGENTA,
        reflektorMap : new THREE.Uniform(new THREE.Texture()),
        liquidMap : new THREE.Texture(),
        reflektorOverlayImage,
        elementsImage
      };
    },
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPosition() {
        if (this.breakpointMobile) {
          return { z : 9 };
        }
        return { z : 4.5 };
      }
    },
    created() {
      // Set an initial random seed
      random.setSeed(random.getRandomSeed());
      // Log it for later reproducibility
      this.materials = {
        balloon : new THREE.MeshPhysicalMaterial({
          color : 0x000000,
          metalness : 0,
          roughness : 0.2,
          reflectivity : 0.4,
          clearcoat : 1,
          clearcoatRoughness : 1,
          envMapIntensity : 20,
          morphNormals : true,
          morphTargets : true,
          transparent : true
        })
      };
      const material = this.materials.balloon;
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'B' }, false);
      this.tweakFolder.addInput(material, 'color', { input : 'color' }).on('change', (e) => {
        this.materials.balloon.color = new THREE.Color(e.value.r / 255, e.value.g / 255, e.value.b / 255);
      });
      this.tweakFolder.addInput(material, 'metalness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(material, 'roughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(material, 'reflectivity', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(material, 'clearcoat', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(material, 'clearcoatRoughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(material, 'flatShading', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(material, 'envMapIntensity', { min : 0, max : 20, step : 0.05 });
    },
    mounted() {
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight2.light, { title : 'Point Light B' });
      gsap.ticker.add(this.onUpdate);

      this.loadingPromises.push(this.loadTextures());
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
        const textureLoader = new THREE.TextureLoader();
        const liquidMap = await textureLoader.loadAsync(liquidImage);

        liquidMap.mapping = THREE.EquirectangularReflectionMapping;
        liquidMap.encoding = THREE.sRGBEncoding;
        this.materials.balloon.envMap = liquidMap;

        this.$refs.scene.scene.environment = liquidMap;
      },
      onUpdate(time) {
        if (this.$refs.model.modelRoot) {
          this.$refs.model.modelRoot.rotation.y += 0.008;
          this.$refs.model.modelRoot.rotation.x = Math.sin(time * 1.1) * Math.sin(time * 0.7) * 0.5;

          if (this.shardChildren) {
            this.shardChildren.forEach((shard, index) => {
              const dir = Math.sign(index % 2 - 0.5);
              shard.rotation.x = shard.origRotation.x + Math.sin(time * 1.1) * Math.sin(time * 0.7 / (index + 1)) * 0.2 * dir;
              shard.position.y = shard.origPosition.y + Math.sin(time * 0.9 / (index + 1)) * 0.2 * dir;
            });
          }
        }
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
      },
      onModelLoaded(children) {
        this.children = children;
        this.children.forEach((child) => {
          child.geometry.computeBoundingBox();
          const matrix = new THREE.Vector3();
          const offset = child.geometry.boundingBox.getCenter(matrix);
          child.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offset.x, -offset.y, -offset.z));
          child.position.copy(offset);
          child.sfxPlaying = false;
          child.canClickOn = true;
          child.tl = null;
          child.origPosition = child.position.clone();
        });
        this.setUpMaterial();
      },
      onShardModelLoaded(children) {
        this.shardChildren = children;
        this.shardChildren.forEach((shard) => {
          shard.origPosition = shard.position.clone();
          shard.origRotation = shard.rotation.clone();
        });
      },
      setUpMaterial() {
        this.children.forEach((child) => {
          child.material = this.materials.balloon.clone();
          child.morphTargetInfluences[0] = 1;
        });
      },
      onClick() {
        // intersect objects
        this.clickIntersects = this.getIntersects(this.children);
        setTimeout(() => {
          this.clickIntersects = [];
        }, 1000);

        let activated = false;
        for (let i = 0; i < this.clickIntersects.length; i ++) {
          // the first object in intersect array has been clicked on directly
          const obj = this.clickIntersects[i].object;
          if (obj.canClickOn) {
            obj.canClickOn = false;
            activated = true;
          }
          else {
            continue;
          }
          if (obj.tl) {
            obj.tl.kill();
            obj.tl = null;
          }
          obj.tl = gsap.timeline();
          obj.tl.to(
            obj.scale,
            {
              x : 1.3,
              y : 1.3,
              z : 1.3,
              duration : 0.1,
              ease : 'circ.out',
              onStart : () => {
                obj.sfxInflate = this.$sfx.play(audiospriteSpriteNames.inflate, 0.5);
                this.$sfx.setVolume(obj.sfxInflate, 0.4);
                this.unlockEasterEgg('B');
              }
            }
          ).to(
            obj.scale,
            {
              x : 1.35,
              y : 1.35,
              z : 1.35,
              duration : 0.02
            }
          ).to(
            obj.material,
            {
              opacity : 0,
              duration : 0.02,
              onComplete : () => {
                if (!obj.sfxPlaying) {
                  this.$sfx.stop(obj.sfxInflate);
                  const id = this.$sfx.play(audiospriteSpriteNames.balloon_pop, 0.4);
                  this.$sfx.setVolume(id, 0.4);
                  obj.sfxPlaying = true;
                }
              }
            },
            '-=0.02'
          ).set(
            obj.scale,
            {
              x : 0,
              y : 0,
              z : 0
            }
          ).to(
            obj.scale,
            {
              x : 1,
              y : 1,
              z : 1,
              delay : 3,
              duration : 1,
              ease : 'slow(0.7, 0.7, false)',
              onStart : () => {
                obj.sfxPlaying = false;
                obj.canClickOn = true;
              }
            }
          ).to(
            obj.material,
            {
              opacity : 1,
              delay : 2,
              duration : 1,
              ease : 'slow(0.7, 0.7, false)'
            },
            '-=3'
          );

          if (activated) {
            break;
          }
        }
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        const objects = this.children;
        this.intersects = this.getIntersects(objects);
      },
      moveLetter() {
        const tl = gsap.timeline();
        tl.to(
          this.modelRoot.position,
          {
            x : this.intersects[0].point.x > this.modelRoot.position.x ? -2 : 2,
            duration : 2,
            ease : 'power2.out'
          }
        ).to(
          this.modelRoot.position,
          {
            x : 0,
            duration : 2,
            ease : 'power2.in'
          }
        );
      }
    }
  };
</script>

<style lang="scss">
.B {
  &__canvas {
    z-index: 3;
    @include full-size(absolute);
  }
  &__assets {
    position: absolute;
    z-index: 0;
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

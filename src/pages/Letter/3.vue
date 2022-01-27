<template>
  <div class="Three">
    <div class="Three__overlay">
      <div class="Three__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
    <Renderer
      ref="renderer"
      class="Three__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      :shadow="false"
      @mousemove="onMove"
      @touchmove="onMove"
    >
      <Camera
        ref="camera"
        :position="settings.cameraPos"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          :penumbra="0.1"
          :cast-shadow="false"
          color="#ffffff"
          :intensity="0.30"
          :position="{ x : 29, y : 2.0, z : 30 }"
        />
        <PointLight
          ref="pointLightB"
          color="#fff"
          :penumbra="0.1"
          :intensity="0.20"
          :position="{ x : -20, y : 2.0, z : 30 }"
          :cast-shadow="false"
        />
        <PointLight
          ref="pointLightC"
          :penumbra="0.1"
          :intensity="1.3"
          :position="{ x : -20, y : 2.0, z : 30 }"
          :cast-shadow="false"
          color="#1063e2"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/3-inner.glb"
            @load="(children) => setUpLetterChildren(
              children,
              'main',
              { x : 0, y : 0, z : 0 }
            )"
          >
            <PhysicalMaterial
              color="#8e19e2"
              :transmission="0.0"
              :reflectivity="0.40"
              :metalness="0.16"
              :envMapIntensity="5.7"
              :clearcoatRoughness="0.13"
              :clearcoat="0.57"
              :roughness="0.30"
              :refraction-ratio="0.0"
              :ior="1.3"
            />
          </ThreeModelLoader>
          <ThreeModelLoader
            ref="letterRed"
            title="LetterRed"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/3-inner.glb"
            @load="(children) => setUpLetterChildren(
              children,
              'red',
              { x : -0.02, y : 0.02, z : 0 },
              { x : 1, y : 1, z : 0.2}
            )"
          >
            <PhysicalMaterial
              :transparent="true"
              :opacity="sideOpacity"
              color="#f200b0"
              :reflectivity="0.52"
              :metalness="0.77"
              :roughness="0.65"
              :clearcoat="0.41"
              :clearcoatRoughness="0.38"
              :refraction-ratio="0.59"
              :envMapIntensity="5.2"
              :transmission="0.45"
            />
          </ThreeModelLoader>
          <ThreeModelLoader
            ref="letterBlue"
            title="LetterBlue"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/3-inner.glb"
            @load="(children) => setUpLetterChildren(
              children,
              'blue',
              { x : 0.02, y : -0.02, z : 0 },
              { x : 1, y : 1, z : 0.2}
            )"
          >
            <PhysicalMaterial
              :metalness="0.40"
              :clearcoat="0.0"
              :roughness="0.50"
              :transparent="true"
              :opacity="sideOpacity"
              color="#0e0ee5"
              :reflectivity="0.73"
              :envMapIntensity="8.5"
              :ior="1.6"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          :gradient="envGradient"
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
  import { mapMutations } from 'vuex';
  import Nebula, { SpriteRenderer } from 'three-nebula';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import RefractionMesh from 'troisjs/src/components/meshes/RefractionMesh.js';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import Noise from '@utils/Noise';
  import nebulaJson from '@src/data/nebula/nebula-test.json';
  import get from 'lodash.get';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader,
      RefractionMesh,
      ReflektorLetters
    },
    mixins : [loadingLogic],
    data() {
      return {
        mouse : {
          x : 0,
          y : 0,
          tx : 0,
          ty : 0
        },
        textureVideo,
        envGradient : 'linear-gradient(-30deg, #141414)',
        settings : {
          bloomStrength : 0.22,
          bloomThreshold : 0.45,
          cameraPos : {
            x : -0, y : 0, z : 15
          }
        },
        seeds : [0.3, 0.98],
        seedIndex : 0,
        sideOpacity : 0.4,
        timeMod : 0.1,
        zOffset : 0.05,
        stressModifier : 1
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Three' }, false);
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
      currentSeed() {
        return this.seeds[this.seedIndex];
      }
    },
    mounted() {
      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      this.tweakFolder.addInput(this, 'sideOpacity', {
        min : 0,
        max : 1
      });
      this.tweakFolder.addInput(this, 'zOffset', {
        min : -5,
        max : 5
      });
      this.tweakFolder.addMonitor(this, 'stressModifier');

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightC.light, { title : 'Point Light C' });

      gsap.ticker.add(this.onUpdate);
      window.addEventListener('keydown', this.handleKeyDown);
      this.letter = {};

      const cameraIn = { x : 1, y : -0.5, z : 15 };
      const minStress = 0.75;
      const maxStress = 1.8;
      const ease = 'power2.inOut';

      this.timeline = gsap.timeline({ repeat : -1 })
        .fromTo(
          this,
          {
            stressModifier : minStress
          },
          {
            stressModifier : maxStress,
            ease : ease,
            duration : 3
          }
        )
        .fromTo(
          this,
          {
            stressModifier : maxStress
          },
          {
            stressModifier : minStress,
            ease : ease,
            duration : 3
          }
        );

      gsap.set(
        this,
        {
          stressModifier : minStress
        }
      );
      gsap.set(
        this.settings.cameraPos,
        {
          ...cameraIn
        }
      );
      this.loadingPromises.push(this.setupNebula());
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
      window.removeEventListener('keydown', this.handleKeyDown);
      if (this.timeline) this.timeline.kill();
    },
    methods : {
      ...mapMutations({
        unlockEasterEgg : 'easterEgg/unlockEasterEgg'
      }),
      async setupNebula() {
        const loaded = await Nebula.fromJSONAsync(nebulaJson, THREE, {});
        const nebulaRenderer = new SpriteRenderer(this.$refs.scene.scene, THREE);
        this.nebula = loaded.addRenderer(nebulaRenderer);
      },
      handleKeyDown(event) {
        if (event.keyCode === 67 && this.noise) {
          this.cycleSeed();
        }
      },
      cycleSeed() {
        this.seedIndex += 1;
        if (this.seedIndex >= this.seeds.length) this.seedIndex = 0;
        this.noise.seed(this.seeds[this.seedIndex]);
      },
      async loadTextures() {
        const envMap = generateGradientTextureFromString(
          'linear-gradient(0deg, #33e 100%, #666 50%, #e33 0%)'
        );
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        this.$refs.letter.updateModelMaterial({ envMap });
      },
      onMove(event) {
        const eventX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
        const eventY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;
        this.mouse.tx = (eventX / window.innerWidth) * 2 - 1;
        this.mouse.ty = - (eventY / window.innerHeight) * 2 + 1;
        this.unlockEasterEgg('3');
      },
      onUpdate(time) {
        this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.04;
        this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.04;
        const { letterRed, letterBlue } = this.$refs;
        if (this.nebula) {
          if (this.nebula.emitters.length && this.$refs.pointLightC.light) {
            const vector = new THREE.Vector3(this.mouse.x, this.mouse.y, 3);
            const camera = this.$refs.camera.camera;
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = - camera.position.z / dir.z;
            const pos = camera.position.clone().add(dir.multiplyScalar(distance));

            const light = this.$refs.pointLightC.light;
            const e = this.nebula.emitters[0];
            e.position.copy(pos);
            e.position.z = 1 + Math.sin(time) * 3;
            light.position.x = e.position.x;
            light.position.y = e.position.y;
            light.position.z = e.position.z;
          }
          this.nebula.update();
        }

        if (this.letter && this.noise) {
          const reducedTime = time * this.timeMod;

          this.$refs.group.group.rotation.y = Math.sin(time * 0.2);

          const { shards } = this.letter;
          if (!shards) return;
          const posMod = this.getSineY(reducedTime);
          const scaleMod =  this.getSineScaleY(reducedTime / 2) * this.stressModifier;
          const noiseMod =  this.getNoiseSineY(reducedTime / 8);
          this.zOffset = (0.8 - this.stressModifier) + scaleMod;
          const opacity = posMod * noiseMod * 0.1 * this.stressModifier + 0.1;
          letterRed.material.opacity = opacity;
          letterBlue.material.opacity = opacity;

          shards.forEach(({ node, type }) => {
            this.scaleModelPosition(
              node,
              posMod,
              this.stressModifier
            );
            this.offsetModelZPosition(
              node,
              this.getSineY(this.noise.simplex3(
                (node.position.x / 50 + noiseMod) * 2,
                (node.position.y / 50 + noiseMod) * 2,
                (node.position.z / 50 + noiseMod) * 2
              ) + noiseMod)
            );
            this.scaleModelScale(
              node,
              scaleMod,
              this.stressModifier * 0.1
            );
            if (type !== 'main') {
              this.offsetModelZPosition(
                node,
                this.getSineY(this.noise.simplex3(
                  (node.position.x / 50 + noiseMod) * 2,
                  (node.position.y / 50 + noiseMod) * 2,
                  (node.position.z / 50 + noiseMod) * 2
                ) * noiseMod),
                type === 'red' ? -this.zOffset : this.zOffset
              );
            }
          });
        }
      },
      playVideo() {
        this.$refs.video.play();
      },
      modifyTime(time) {
        const decimalPlaces = 0.2;

        const modifier = 10 * decimalPlaces;
        return Math.floor(time * modifier) / modifier;
      },
      getSineY(x) {
        return 0.2 * Math.sin((x + 0.15) / 0.1) + 1.2;
      },
      getSineScaleY(x) {
        return 0.2 * Math.sin((x - 0.15) / 0.1) + 1;
      },
      getNoiseSineY(x) {
        return 1.2 * Math.sin((x - 2.3) / 0.1) + 1.2;
      },
      flattenRange(value, high, low, threshold) {
        if (value > threshold) return high;
        else return low;
      },
      scaleModelPosition(model, scale, flatOffset = 1) {
        model.position.x = model.origPosition.x * scale * flatOffset;
        model.position.y = model.origPosition.y * scale * flatOffset;
        model.position.z = model.origPosition.z * scale * flatOffset;
      },
      offsetModelZPosition(model, scale, flatOffset = 0) {
        model.position.z = model.origPosition.z * scale + flatOffset;
      },
      scaleModelScale(model, scale, flatOffset = 0) {
        model.scale.x = model.origScale.x * scale + flatOffset;
        model.scale.y = model.origScale.y * scale + flatOffset;
        model.scale.z = model.origScale.z * scale + flatOffset;
      },
      setUpLetterChildren(children, type = 'main', offset = { x : 0, y : 0, z : 0 }, scaleChange) {
        this.noise = Noise;
        this.noise.seed(this.seeds[this.seedIndex]);
        const startingScale = 1;
        const shards = get(this.letter, 'shards', []);

        children.forEach((child) => {
          shards.push({
            node : child,
            type
          });
          child.scale.set(startingScale, startingScale, startingScale);

          child.origPosition.x += offset.x;
          child.origPosition.y += offset.y;
          child.origPosition.z += offset.z;

          if (scaleChange) {
            child.scale.set(scaleChange.x, scaleChange.y, scaleChange.z);
            child.origScale.x = scaleChange.x;
            child.origScale.y = scaleChange.y;
            child.origScale.z = scaleChange.z;
          }
        });
        this.letter = {
          shards,
          currentScale : 1,
          ...this.letter
        };
      }
    }
  };
</script>

<style lang="scss">
.Three {
  &__seed {
    position: absolute;
    top: 15px;
    left: 15px;
    color: $white;
    z-index: 10;
  }
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

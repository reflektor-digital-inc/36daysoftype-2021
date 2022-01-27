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
      @touchmove="onMove"
    >
      <Camera
        ref="camera"
        :position="{ x : -1, y: 1, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          :penumbra="0.1"
          :cast-shadow="false"
          color="#ffffff"
          :intensity="1.1"
          :position="{ x : 9.0, y : 7.9, z : 30 }"
        />
        <PointLight
          ref="pointLightB"
          :penumbra="0.1"
          color="#311cb5"
          :position="{ x : -13, y : 3.4, z : 20 }"
          :intensity="0"
          :cast-shadow="false"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/Y_v1.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              ref="letterMaterial"
              color="#ffffff"
              :ior="1.0"
              :roughness="0.28"
              :metalness="0.59"
              :reflectivity="0.12"
              :clearcoat="0.38"
              :envMapIntensity="0.87"
              :clearcoatRoughness="0.34"
              :transmission="0.34"
              :refraction-ratio="0.41"
            />
          </ThreeModelLoader>
          <Group
            ref="yingBallGroup"
          >
            <Mesh
              :position="{x: 1.7, y: 0.3, z: 0}"
              :rotation="{x: 0, y: 0, z: 0.5}"
            >
              <SphereGeometry
                :radius="
                  0.2"
                :width-segments="100"
                :height-segments="100"
              />
              <MeshPhongMaterial
                :reflectivity="0.67"
                color="#ffffff"
              />
            </Mesh>
          </Group>
          <Group
            ref="yangBallGroup"
          >
            <Mesh
              :position="{x: 1.7, y: -0.3, z: 0}"
              :rotation="{x: 0, y: 0, z: -0.5}"
            >
              <SphereGeometry
                :radius="
                  0.2"
                :width-segments="100"
                :height-segments="100"
              />
              <StandardMaterial
                color="#000000"
                :metalness="1"
                :roughness="0.2"
              />
            </Mesh>
          </Group>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(135deg, #6b00ff, #6b00ff)"
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
  import _shuffle from 'lodash/shuffle';
  import _sortBy from 'lodash/sortBy';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import _get from 'lodash/get'; // reflektor logo overlay
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader,
      ReflektorLetters
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        textureVideo,
        envGradient : 'linear-gradient(0deg, #ffffff 100%, #ffffff 0%)',
        settings : {
          bloomStrength : 0.23,
          bloomThreshold : 0.39
        }
      };
    },
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionZ() {
        return this.breakpointMobile ? 12 : 8;
      }
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
      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      this.tweakFolder.addButton({ title : 'Play Animation' }).on('click', this.playAnimation);
      this.tweakFolder.addButton({ title : 'Teleport' }).on('click', this.teleport);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      this.letterMaterialWhite = this.$refs.letterMaterial.material;
      this.letterMaterialBlack = this.$refs.letterMaterial.material.clone();
      this.letterMaterialBlack.color = new THREE.Color(0, 0, 0);

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

        this.$refs.letter.updateModelMaterial({
          envMap
          //map : videoTexture
        });
      },
      onUpdate() {
        let dist;
        let newDist = 1;
        if (this.mousePos3D) {
          dist = this.getMouseDist(this.mousePos3D.x, this.mousePos3D.y, this.$refs.letter.modelRoot, 0.4, 6);
          newDist = dist * 10;
        }
        this.$refs.group.group.rotation.z += 0.005 * newDist;
        this.$refs.group.group.rotation.y += 0.004 * newDist;

        this.$refs.yingBallGroup.group.rotation.y -= 0.025 * newDist;
        this.$refs.yangBallGroup.group.rotation.y += 0.025 * newDist;

        if (this.letterYang) {
          this.letterYang.rotation.y += 0.006 * newDist;
        }
        if (this.letterYing) {
          this.letterYing.rotation.y -= 0.006 * newDist;
        }
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
        if (newDist === 4 || newDist < 0.3) this.unlockEasterEgg('Y');
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        this.letterYing = this.$refs.letter.modelRoot;
        this.letterYang = this.$refs.letter.modelRoot.clone();

        const xOffset = 1.2;
        const yOffset = 0.7;

        // Ying
        this.letterYing.position.set(-xOffset, yOffset, 0);
        this.yingChildren = _sortBy(children, c => c.position.y + 5);

        // Yang
        this.$refs.group.group.add(this.letterYang);
        this.yangChildren = _get(this.letterYang, 'children');
        this.yangChildren = _sortBy(this.yangChildren, c => c.position.y + 5);
        this.letterYang.position.set(xOffset, -yOffset, 0);
        this.letterYang.rotation.set(0, 0, -Math.PI);
        this.setLetterMaterial(this.letterYang, this.letterMaterialBlack);

        this.animateInAndSwap();
      },
      async animateInAndSwap() {
        await Promise.all([this.animateInLetter(this.yingChildren), this.animateInLetter(this.yangChildren)]);
        this.swapColors();
      },
      async swapColors() {
        await Promise.all([this.animateSwapColor(this.yingChildren), this.animateSwapColor(this.yangChildren)]);
        this.swapColors();
      },
      setLetterMaterial(letter, material) {
        letter.children.map((c) => {
          c.material = material;
        });
      },
      animateInLetter(children) {
        const tl = gsap.timeline();
        children.map((c, index) => {
          tl.add([
            gsap.fromTo(c.scale, { x : 0, y : 0, z : 0 }, { x : 1, y : 1, z : 1, duration : 1, ease : 'power3.out' })
          ], index * 0.01);
        });
        return tl;
      },
      animateSwapColor(children) {
        const tl = gsap.timeline();
        children.map((c, index) => {
          const startAt = index * 0.01;
          const duration = 0.5;
          const newMaterial = c.material === this.letterMaterialBlack ? this.letterMaterialWhite : this.letterMaterialBlack;
          tl.add([
            gsap.to(c.scale, {
              x : 0, y : 0, z : 0, duration : duration, ease : 'power2.in', onComplete : () => {
                c.material = newMaterial;
              }
            })
          ], startAt);
          tl.add([
            gsap.to(c.scale, { x : 1, y : 1, z : 1, duration : duration, ease : 'power3.out' })
          ], startAt + duration);
        });
        return tl;
      },
      playAnimation() {
        if (this.introTimeline) {
          this.introTimeline.play(0);
        }
      },
      setupIntroTimeline(children) {
        const tl = this.introTimeline = gsap.timeline({
          paused : true, onComplete : () => {
            tl.kill();
            this.teleport();
          }
        });
        const childrenShuffled = _shuffle(children);
        childrenShuffled.map((c) => {
          const duration = random.range(0.5, 1);
          const tlPosition = random.range(0, 2);
          const fullCircle = Math.PI * 2;
          const rotation = { x : random.range(0, fullCircle), y : random.range(0, fullCircle), z : random.range(0, fullCircle) };
          const position = { x : random.range(-3, -2), y : random.range(-1, 1), z : random.range(-1, 1) };
          const ease = 'power3.out';
          tl.add(
            [
              gsap.fromTo(
                c.scale,
                { x : 0, y : 0, z : 0 },
                { x : 1, y : 1, z : 1, duration : duration, ease }
              ),
              gsap.fromTo(
                c.rotation,
                { x : rotation.x, y : rotation.y, z : rotation.z },
                { x : 0, y : 0, z : 0, duration : duration, ease }
              ),
              gsap.fromTo(
                c.position,
                {
                  x : c.position.x + position.x,
                  y : c.position.y + position.y,
                  z : c.position.z + position.z
                },
                { x : c.position.x, y : c.position.y, z : c.position.z, duration : duration, ease : 'power3.out' }
              )
            ],
            tlPosition
          );
        });
      },
      teleport() {
        const children = this.children;
        const tl = gsap.timeline({
          paused : false, delay : 0.3, onComplete : () => {
            tl.kill();
            this.teleport();
          }
        });
        const childrenShuffled = _shuffle(children);
        childrenShuffled.map((c) => {
          const duration = random.range(0.5, 2);
          const tlPosition = random.range(0, 2);
          const fullCircle = Math.PI * 2;
          const rotation = { x : random.range(0, fullCircle), y : random.range(0, fullCircle), z : random.range(0, fullCircle) };
          const positionStart = { x : random.range(-3, -2), y : random.range(-1, 1), z : random.range(-1, 1) };
          const positionOut = { x : random.range(4, 5), y : random.range(-1, 1), z : random.range(-1, 1) };
          const ease = 'power3.out';
          const easeIn = 'power3.in';
          tl.add(
            [
              gsap.to(
                c.scale,
                { x : 0, y : 0, z : 0, duration : duration, ease : easeIn, immediateRender : false }
              ),
              gsap.to(
                c.rotation,
                { x : rotation.x, y : rotation.y, z : rotation.z, duration : duration, ease : easeIn, immediateRender : false }
              ),
              gsap.to(
                c.position,
                {
                  x : c.position.x + positionOut.x,
                  y : c.position.y + positionOut.y,
                  z : c.position.z + positionOut.z,
                  duration : duration,
                  ease : easeIn,
                  immediateRender : false
                }
              )
            ],
            tlPosition
          );
          tl.add(
            [
              gsap.fromTo(
                c.scale,
                { x : 0, y : 0, z : 0 },
                { x : 1, y : 1, z : 1, duration : duration, ease, immediateRender : false }
              ),
              gsap.fromTo(
                c.rotation,
                { x : rotation.x, y : rotation.y, z : rotation.z },
                { x : 0, y : 0, z : 0, duration : duration, ease, immediateRender : false }
              ),
              gsap.fromTo(
                c.position,
                {
                  x : c.position.x + positionStart.x,
                  y : c.position.y + positionStart.y,
                  z : c.position.z + positionStart.z
                },
                { x : c.position.x, y : c.position.y, z : c.position.z, duration : duration, ease : 'power3.out', immediateRender : false }
              )
            ],
            tlPosition + duration + 1 + random.range(0, 1)
          );
        });
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.pointer.x = this.pointer.x / 2;
        this.pointer.y = this.pointer.y / 2;
        this.setCameraPositionTarget(this.pointer);
        this.mousePos3D = this.$refs.renderer.three.pointer.positionV3;
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

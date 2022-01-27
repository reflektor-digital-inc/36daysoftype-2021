<template>
  <div class="Letter-Template">
    <div class="Letter-Template__overlay">
      <div class="Letter-Template__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
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
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mousemove="onMove"
      @touchmove="onMove"
      @touchstart="onMouseDown"
      @touchend="onMouseUp"
    >
      <Camera
        ref="camera"
        :position="{ x : 0, y: 0, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          :penumbra="0.1"
          color="#cc1fcf"
          :intensity="1.1"
          :position="{ x : 9.0, y : 2.8, z : 30 }"
          :cast-shadow="false"
        />
        <PointLight
          ref="pointLightB"
          :penumbra="0.1"
          color="#311cb5"
          :position="{ x : -13, y : 3.4, z : 20 }"
          :intensity="1.5"
          :cast-shadow="false"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/T_v2.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              color="#0d157c"
              :envMapIntensity="12"
              :reflectivity="0.098"
              :metalness="0.48"
              :clearcoatRoughness="0.51"
              :clearcoat="0.57"
              :roughness="0.34"
              :refraction-ratio="0.36"
              :transmission="0.16"
              :ior="1.3"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(135deg, #ff0066, #661cbb 34%, #ff0066)"
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
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import ReflektorLetters from '@components/ReflektorLetters.vue'; // reflektor logo overlay
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
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.27,
          bloomThreshold : 0.54
        },
        isMouseDown : false,
        mousePos : new THREE.Vector3(),
        oldTime : 0
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
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionZ() {
        return this.breakpointMobile ? 11 : 7;
      }
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

        if (this.isMouseDown) {
          if (time - this.oldTime > 0.1) {
            this.mousePos.set(
              this.mousePosition.x,
              this.mousePosition.y,
              this.mousePosition.z
            );
            this.children?.map((child) => {
              const position = new THREE.Vector3(random.range(-2, 2), random.range(-1, 1), random.range(-3, 3));
              const p = new THREE.Vector3();
              p.addVectors(this.mousePos, position);
              child.dir.subVectors(p, child.position).normalize();
            });
            this.oldTime = time;
          }
        }
        else {
          this.children?.map((child) => {
            child.dir.set(0, 0, 0);
            // friction
            child.velocity.x += (0 - child.velocity.x) * 0.001;
            child.velocity.y += (0 - child.velocity.y) * 0.001;
            child.velocity.z += (0 - child.velocity.z) * 0.001;
          });
        }

        this.children?.map((child) => {
          // acelleration
          child.velocity.x += child.dir.x * 0.003;
          child.velocity.y += child.dir.y * 0.003;
          child.velocity.z += child.dir.z * 0.003;

          // friction
          child.velocity.x += (0 - child.velocity.x) * 0.02;
          child.velocity.y += (0 - child.velocity.y) * 0.02;
          child.velocity.z += (0 - child.velocity.z) * 0.02;

          // limit max speed
          child.velocity.clampLength(-0.1, 0.1);

          // update position
          child.position.addVectors(child.position, child.velocity);
        });
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        this.children = children;
        this.children.map((c) => {
          c.velocity = new THREE.Vector3();
          c.dir = new THREE.Vector3();
        });
        this.setupIntroTimeline(children);
        this.introTimeline.play();
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
        const tl = this.teleportTimeline = gsap.timeline({
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
                  x : c.origPosition.x + positionOut.x,
                  y : c.origPosition.y + positionOut.y,
                  z : c.origPosition.z + positionOut.z,
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
                { x : c.origPosition.x, y : c.origPosition.y, z : c.origPosition.z, duration : duration, ease : 'power3.out', immediateRender : false }
              )
            ],
            tlPosition + duration + 1 + random.range(0, 1)
          );
        });
      },
      onMouseDown() {
        this.mousePosition = this.$refs.renderer.three.pointer.positionV3;
        this.introTimeline.pause();
        if (this.teleportTimeline) {
          this.teleportTimeline.kill();
        }
        if (this.mouseUpTl) {
          this.mouseUpTl.kill();
        }
        this.isMouseDown = true;
        this.toMousePoint();
      },
      onMouseUp() {
        this.isMouseDown = false;
        const children = this.children;

        if (this.mouseDownTl) this.mouseDownTl.kill();
        if (this.mouseMoveTl && this.mouseMoveTl.isActive()) {
          gsap.globalTimeline.clear();
        }

        const tl = this.mouseUpTl = gsap.timeline({
          paused : false, onComplete : () => {
            tl.kill();
            this.teleport();
            this.unlockEasterEgg('T');
          }
        });
        const childrenShuffled = _shuffle(children);
        childrenShuffled.map((c) => {
          const tlPosition = random.range(0, 2);
          const ease = 'power3.out';
          tl.add(
            [
              gsap.to(
                c.scale,
                { x : 1, y : 1, z : 1, duration : 1, ease, immediateRender : false }
              ),
              gsap.to(
                c.rotation,
                { x : c.origRotation.x, y : c.origRotation.y, z : c.origRotation.z, duration : 1, ease, immediateRender : false }
              ),
              gsap.to(
                c.position,
                {
                  x : c.origPosition.x,
                  y : c.origPosition.y,
                  z : c.origPosition.z,
                  duration : 1,
                  ease,
                  immediateRender : false
                }
              )
            ],
            tlPosition
          );
        });
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;

        this.setCameraPositionTarget(this.pointer);
        if (this.mouseDownTl) this.mouseDownTl.pause();

        else if (this.mouseMoveTl) {
          this.mouseMoveTl.kill();
        }
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

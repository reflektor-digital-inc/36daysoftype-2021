<template>
  <transition
    type="transition"
    :css="false"
    @enter="log($ref.sectionView)"
    @leave="log($ref.sectionView)"
  >
    <div class="About">
      <div ref="bg" class="About__bg" />
      <div
        v-if="breakpointMobile"
        ref="bgOverlay"
        class="About__bg-overlay-mobile"
        :class="{'About__bg-overlay-mobile--active' : transitionIn && !transitionOut}"
      />
      <div
        v-else
        ref="bgOverlay"
        class="About__bg-overlay"
      />
      <PageHeading
        ref="pageHeading"
        class="About__page-heading"
        v-bind="pageHeadingProps"
      />
      <ProjectHeading
        class="About__project"
      />
      <Renderer
        ref="renderer"
        class="About__canvas"
        :alpha="true"
        resize="window"
        mouse-move
        mouse-over
        click
        :shadow="false"
        pointer
        @mousemove="onMove"
      >
        <OrthographicCamera
          ref="camera"
          v-bind="cameraProps"
        />
        <Scene ref="scene">
          <Group v-if="letterGeometries" ref="cellGroup">
            <AboutGridCell
              v-for="(cell, index) in cellPositions"
              :ref="setCellRef"
              :key="cell.key"
              :index="cell.key"
              :position="cell.position"
              :depth="cell.depth"
              :size-x="cell.sizeX"
              :size-y="cell.sizeY"
              :env-maps="envMaps"
              :transition-out="transitionOut"
              :letter-index="cell.letterIndex"
              :letter-geometries="letterGeometries"
              :is-last-index="index === cellPositions.length - 1"
            />
          </Group>
        </Scene>
        <EffectComposer ref="composer">
          <RenderPass />
          <TransparentBloomPass
            :strength="0.37"
            :threshold="0.88"
          />
          <SMAAPass />
        </EffectComposer>
      </Renderer>
    </div>
  </transition>
</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import AboutGridCell from '@components/three/AboutGridCell/AboutGridCell.vue';
  import GradientText from '@components/GradientText/GradientText';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import { EquirectangularReflectionMapping } from 'three';
  import { GRADIENTS } from '@settings/settings.colors';
  import random from 'canvas-sketch-util/random';
  import TransparentBloomPass from '@components/troisExtensions/TransparentBloomPass';
  import textGeometryUrl from '@assets/gltf/extras/plain-textgeo.glb';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import PageHeading from '@components/PageHeading/PageHeading';
  import ProjectHeading from '@components/ProjectHeading/ProjectHeading';
  import gsap from 'gsap';
  import { cellData, cellDataMobile } from '@settings/settings.about.js';
  import mouseMovement from '@mixins/mouse-movement';
  import { CUSTOM_ANGLE_GRADIENTS } from '../settings/settings.colors';
  import loadingLogic from '../mixins/loading-logic';

  export default {
    name : 'About',
    components : {
      ThreeBackground,
      AboutGridCell,
      TransparentBloomPass,
      GradientText,
      PageHeading,
      ProjectHeading
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        GRADIENTS,
        letterGeometries : null,
        frustrumSize : 1,
        cellRefs : [],
        cellPositions : [],
        cameraY : 0,
        transitionIn : false,
        transitionOut : false,
        createCellTimeout : null,
        firstGeneration : true,
        cells : [],
        colsR : 1 / 5,
        ratio : this.windowWidth / this.windowHeight,
        prevBreakpointMobile : this.breakpointMobile
      };
    },
    computed : {
      ...mapState({
        hasLoaded : state => state.loader.hasLoaded,
        windowSize : state => state.windowSize,
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height
      }),
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraHeight() {
        return (this.windowHeight / this.windowWidth) * 5;
      },
      cameraProps() {
        return {
          left : this.frustrumSize / -2,
          right : this.frustrumSize / 2,
          top : this.frustrumSize / 2,
          bottom : this.frustrumSize / -2,
          near : -this.frustrumSize * 1000,
          far : this.frustrumSize * 1000,
          zoom : 1,
          position : { x : 0, y : 0, z : this.frustrumSize * 2 }
        };
      },
      pageHeadingProps() {
        return {
          title : 'The Project',
          subtitle : 'ABOUT',
          description : `In 2021, the entire Reflektor Digital team participated in the annual
          <a href="https://www.36daysoftype.com/" target="_blank">36 Days of Type art challenge</a> for their second time.`,
          description2 : `Building off learnings from their last time tackling the challenge,
          the team swiftly created 36 unique and technically impressive WebGL designs, using Three.js, Vue & Blender. This process <a href="https://us02web.zoom.us/rec/play/Lef8r9rR008EgUyJHrBh7h4s8cbdZOUYAwjKmYHzLkn8rHVM5Wok0jeknuMyLDg_z3XNUfgzOcJ9wQkh.QfC6cO7bNa5vpP68?continueMode=true&_x_zm_rtaid=QG2TKw1ZQYOsGkn9RNW-JQ.1643236965589.ee23eb7b0bec6b8bd266eb43a4e32cc7&_x_zm_rhtaid=751" target="_blank">was a great learning experience for the team</a>, allowing us to experiment with many new workflows and techniques.`,
          description3 : `The project you’re viewing right now is the culmination of that original effort. Each letter has been carefully optimized to let you interact with the designs in a completely new way. We’ve also gone a step further, letting anyone claim a letter as an NFT on the Polygon blockchain. `,
          buttonLabel : 'View Project',
          buttonRoute : '/letter/a'
        };
      },
      envMaps() {
        const maps = [];
        const envMaps = [];
        const linearGradients = [];
        const angles = [45, 135, -45, -135, 90];
        for (let i = 0; i < CUSTOM_ANGLE_GRADIENTS.length; i++) {
          for (let j = 0; j < angles.length; j++) {
            const grad = CUSTOM_ANGLE_GRADIENTS[i](angles[j]);
            const map = generateGradientTextureFromString(grad);
            const envMap = map.clone();
            envMap.mapping = EquirectangularReflectionMapping;
            envMap.flipY = false;
            maps.push(map);
            envMaps.push(envMap);
            linearGradients.push(grad);
          }
        }
        return { maps, envMaps, linearGradients };
      },
      cellData() {
        return this.breakpointMobile ? cellDataMobile : cellData;
      }
    },
    watch : {
      hasLoaded : {
        immediate : true,
        handler(cur) {
          if (cur) {
            this.$nextTick(() => {
              this.loadPage();
            });
          }
        }
      },
      windowSize : {
        deep : true,
        handler() {
          // update sizes
          const colsR = 1 / 5;
          const ratio = this.windowWidth / this.windowHeight;
          const rowsR = parseFloat(colsR * ratio);
          this.cellPositions.forEach((cell) => {
            cell.sizeX = colsR * cell.depth / 2;
            cell.sizeY = rowsR * cell.depth / 2;
          });
        }
      },
      breakpointMobile : {
        handler(cur, prev) {
          this.cellRefs = [];
          this.cells = [];
          this.firstGeneration = true;
          this.$nextTick(() => {
            this.createCells(0);
          });
          this.prevBreakpointMobile = prev;
        }
      }
    },
    provide() {
      random.setSeed(290);
      return {
        random
      };
    },
    mounted() {
      window.addEventListener('scroll', this.scrollCamera);
      gsap.ticker.add(this.updateCamera);
      this.scrollCamera();

      this.$refs.renderer.renderer.setPixelRatio(2);
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Landing Page' }, false);

      this.$refs.renderer.renderer.autoClear = true;
      this.lastCell = '';

      this.loadGeometry();

      this.ratio = this.windowWidth / this.windowHeight;
    },
    unmounted() {
      this.tl.kill();
      this.tl = null;
      window.removeEventListener('scroll', this.scrollCamera);
      gsap.ticker.remove(this.updateCamera);
      this.tweakFolder.dispose();
    },
    beforeRouteLeave(to, from, next) {
      this.unloadPage(next);
    },
    methods : {
      loadPage() {
        this.createCells(0);
        this.tl = gsap.timeline();
        this.tl.add(this.$refs.pageHeading.tl.play(), 0.5);
        this.tl.to(this.$refs.bg, { autoAlpha : 1, duration : 1, delay : 1 }, 0);
        this.tl.to(this.$refs.bgOverlay, { autoAlpha : 1, duration : 1, delay : 1 }, 0);
      },
      async unloadPage(next) {
        this.transitionOut = true;
        await this.tl.timeScale(3).reverse();
        next();
      },
      scrollCamera() {
        if (this.$refs.camera) {
          this.cameraY = -window.scrollY / this.windowHeight;
        }
      },
      updateCamera() {
        this.$refs.camera.camera.position.y += (this.cameraY * 0.7 - this.$refs.camera.camera.position.y) * 0.9;
      },
      createCells(i, time = 400) {
        //call function recursively to create cells on timeout
        if (i < this.cellData.length - 1) {
          this.createCellTimeout = setTimeout(() => {
            this.createCells(i + 1, time * 0.5);
          }, time);
        }
        const colsR = 1 / 5;
        const ratio = this.windowWidth / this.windowHeight;
        const rowsR = parseFloat(colsR * ratio);
        const cell = this.cellData[i];
        const position = {
          x : cell.x,
          y : cell.y,
          z : 1
        };
        this.cells.push({
          key : i,
          depth : cell.z * 2,
          sizeX : colsR * cell.z,
          sizeY : rowsR * cell.z,
          letterIndex : i,
          position
        });
        this.cellPositions = [...this.cells];
        return this.cells;
      },
      async loadGeometry() {
        const geometries = [];
        const textModel = await new GLTFLoader().loadAsync(textGeometryUrl);
        textModel.scene.children.forEach((child) => {
          geometries.push(child.geometry);
        });
        this.letterGeometries = geometries;
      },
      setCellRef(el) {
        if (el) {
          this.cellRefs.push(el);
        }
      },
      onMove() {
        if (!this.$refs.cellGroup) return;
        const intersects = this.getIntersectsRecursive(this.$refs.cellGroup.group.children);
        if (intersects[0]?.object) {
          intersects[0].object?.dispatchEvent({ type : 'bump', ...intersects[0] });
        }
      }
    },
    metaInfo() {
      return {
        title : 'About',
        meta : []
      };
    }
  };
</script>

<style lang="scss">

  .About {
    position: relative;
    background: black;
    color: white;
    height: auto;
    overflow: hidden;
    &__canvas {
      z-index: 3;
      @include full-size;
      height: 100vh;
      position: fixed;
    }
    &__bg {
      @include full-size;
      // height: 100vh;
      opacity: 0;
      background: linear-gradient(350.79deg, #151515 25.15%, #4e24ed 54.73%, #bb4bb5 93.28%);
      &-overlay {
        pointer-events: none;
        opacity: 0;
        @include full-size;
        position: fixed;
        z-index: 4;
        background: linear-gradient(350.79deg, rgba(21, 21, 21, 0) 25.15%, rgba(78, 36, 237, 0.56) 54.73%, #bb4bb5 93.28%);
      }
      &-overlay-mobile {
        pointer-events: none;
        @include full-size;
        background: linear-gradient(180deg, rgba(15, 15, 15, 0) 0%, #0f0f0f 100%);
        position: fixed;
        height: 100vh;
        bottom: 0;
        opacity: 0;
        z-index: 4;
        transition: opacity 0.4s;
        &--active {
          opacity: 0.9;
          transition: opacity 0.4s;
        }
      }
      &-grid {
        @include full-size;
        z-index: 2;
        display: grid;
      }
      &-cell {
        //
      }
    }
    &__page-heading {
      position: relative;
      z-index: 4;
      margin-top: 7rem;
      height: 100vh;
      @include breakpoint($mobile) {
        margin-top: 6rem;
      }
    }
    &__project {
      position: relative;
      float: right;
      z-index: 4;
      @include breakpoint($phone) {
        float: none;
      }
    }
    &__overlay {
      &-grid {
        @include full-size;
        z-index: 4;
        display: grid;
      }
      &-cell {
        position: relative;
        // background: $bg-gradient;
      }
      &-title {
        padding: 30px;
        padding-top: 100px;
        @include fk-display-regular-alt(110, 0, 1.2);
        margin-bottom: unset;
        // padding-left: 85px;
        // & h1 {
        //   @include fk-display-regular-alt(110, 0, 1);
        // }
      }
      &-bottom-title {
        position: absolute;
        right: 30px;
        bottom: 70px;
        font-size: 200px;
        line-height: 1em;
      }
    }

    &__about {
      margin-top: 100vh;
    }
  }
</style>

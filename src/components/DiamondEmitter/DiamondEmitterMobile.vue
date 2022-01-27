<template>
  <Renderer
    ref="renderer"
    class="Home__canvas"
    :alpha="true"
    resize="window"
    mouse-move
    mouse-over
    click
    :shadow="false"
  >
    <OrthographicCamera
      ref="camera"
      v-bind="cameraProps"
    />

    <Scene ref="scene">
      <Group v-if="letterGeometries" ref="cellGroup">
        <LandingGridCellMobile
          v-for="(cell, index) in cellPositions"
          :ref="setCellRef"
          :key="cell.key"
          :index="cell.key"
          :position="cell.position"
          :size-x="cell.sizeX"
          :size-y="cell.sizeY"
          :delete-point="cell.deletePoint"
          :fast-forward="cell.fastForward"
          :env-maps="envMaps"
          :letter-geometries="letterGeometries"
          :transition-out="transitionOut"
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
</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import LandingGridCellMobile from '@components/three/LandingGridCell/LandingGridCellMobile.vue';
  import GradientText from '@components/GradientText/GradientText';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import { EquirectangularReflectionMapping, MathUtils } from 'three';
  import { GRADIENTS, CUSTOM_ANGLE_GRADIENTS } from '@settings/settings.colors';
  import random from 'canvas-sketch-util/random';
  import TransparentBloomPass from '@components/troisExtensions/TransparentBloomPass';
  import textGeometryUrl from '@assets/gltf/extras/plain-textgeo.glb';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  import PageHeading from '@components/PageHeading/PageHeading';
  import gsap from 'gsap';
  import EventBus from '@utils/event-bus';

  export default {
    name : 'Home',
    components : {
      ThreeBackground,
      LandingGridCellMobile,
      TransparentBloomPass,
      GradientText,
      PageHeading
    },
    props : {
      renderer : {
        type : Object,
        required : true
      }
    },
    data() {
      return {
        GRADIENTS,
        letterGeometries : null,
        frustrumSize : 1,
        cellRefs : [],
        cellPositions : [],
        cellOffset : 0,
        cellGroupPos : 0,
        cellGroupPosOffset : 0,
        firstLoop : true,
        heightFraction : 0.5,
        repeats : 10000,
        loadingTimeout : null,
        transitionIn : false,
        transitionOut : false,
        exitTimeout : null,
        enterTimeout : null
      };
    },
    computed : {
      ...mapState({
        isLoading : state => state.loader.isLoading,
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height
      }),
      ...mapGetters({
        breakpointPhone : 'windowSize/breakpointPhone'
      }),
      pageHeadingProps() {
        return {
          title : '36 Days <br><span>of Type</span>',
          subtitle : '2021',
          description : `In 2021 the entire Reflektor Digital team participated in the annual
          36 Days of Type art challenge for their second time,
          creating a set of unique and technically impressive interactive WebGL designs.`,
          buttonLabel : 'Enter',
          buttonRoute : '/letter/a'
        };
      },
      dimensions() {
        const height = this.windowHeight * this.heightFraction;
        const rows = Math.floor(MathUtils.clamp(
          MathUtils.mapLinear(height, 0, 1080, 1, 10),
          3,
          6
        ));
        // // const cols = 3;
        // const rows = Math.ceil(this.windowHeight / (width / cols)) + 3;
        // const rows = 4;
        const cols = Math.ceil(this.windowWidth / (height / rows)) + 3;

        const ratio = this.windowHeight / this.windowWidth;
        return { rows, cols, ratio };
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
        // maps = random.shuffle(maps);
        // linearGradients = random.shuffle(linearGradients);
        return { maps, envMaps, linearGradients };
      },
      gridStyles() {
        return {
          gridTemplateColumns : `repeat(${this.dimensions.cols},${100 / this.dimensions.cols}%)`,
          gridTemplateRows : `repeat(${this.dimensions.rows},${100 / this.dimensions.rows}%)`
        };
      }
    },
    watch : {
      dimensions : {
        immediate : true,
        handler() {
          //reset cells
          this.cellRefs = [];
          this.cellPositions = [];
          this.cellOffset = 0;
          this.cellGroupPos = 0;
          this.cellGroupPosOffset = 0;
          this.firstLoop = true;
          this.repeats = 10000;
          if (this.$refs.cellGroup) {
            this.$refs.cellGroup.group.position.y = 0;
          }
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
      this.pageHeadingEnter();
      gsap.ticker.add(this.onUpdate);
      this.addListeners();
      this.$refs.renderer.renderer.setPixelRatio(2);
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Landing Page' }, false);

      this.$refs.renderer.renderer.autoClear = true;
      this.lastCell = '';

      this.loadPage();
      this.loadGeometry();
    },
    unmounted() {
      this.tweakFolder.dispose();
      this.removeListeners();
      gsap.ticker.remove(this.onUpdate);
    },
    methods : {
      pageHeadingEnter() {
        this.$refs.pageHeading?.tl?.play();
      },
      pageHeadingLeave() {
        this.$refs.pageHeading?.tl?.reverse();
      },
      addListeners() {
        EventBus.on('isLoading', this.loadPage);
        EventBus.on('homeAboutTransition', this.unloadPage);
        EventBus.on('deleteLandingGridCell', this.deleteCell);
      },
      removeListeners() {
        EventBus.off('isLoading', this.loadPage);
        EventBus.off('homeAboutTransition', this.unloadPage);
        EventBus.off('deleteLandingGridCell', this.deleteCell);
      },
      loadPage() {
        this.enterTimeout = setTimeout(() => {
          this.transitionIn = true;
        }, 1000);
      },
      unloadPage(next) {
        this.transitionOut = true;
        this.pageHeadingLeave();
        this.exitTimeout = setTimeout(() => {
          next();
        }, 1200);
      },
      deleteCell(key) {
        const i = this.cellPositions.findIndex(el => el.key === key);
        if (i) {
          this.cellPositions.splice(i, 1);
        }
      },
      onUpdate() {
        if (this.$refs.cellGroup) {
          // if (!this.breakpointMobile) {
          const chunkSize = 0.70711;  // column ratio
          for (let i = 0; i < this.repeats; i ++) {
            if (this.cellGroupPos >= this.cellGroupPosOffset) {
              if (this.firstLoop) {
                this.$refs.cellGroup.group.position.y = -1;
                this.createCells();
                this.cellOffset ++;
                this.firstLoop = false;
              }

              this.createCells();
              this.cellOffset ++;
              this.cellGroupPosOffset += chunkSize;
            }
            this.$refs.cellGroup.group.position.y += 0.0002;
            this.cellGroupPos = this.$refs.cellGroup.group.position.y;
          }
          this.repeats = 1;
        }
      },
      createCells() {
        const cells = [];
        const vRatio = this.heightFraction / this.dimensions.rows;  // column ratio
        const hRatio = parseFloat(vRatio * this.dimensions.ratio); // square to column
        const cellWidth = 1.41421356237;

        const jStart = this.cellOffset * this.dimensions.rows;
        const jEnd = this.dimensions.rows + jStart;
        for (let i = 0; i < this.dimensions.cols; i++) {
          for (let j = jStart; j < jEnd; j++) {
            const vSpacing = (i * 0.70711) - (this.dimensions.cols * 0.70711 - 0.70711) / 2;
            const position = {
              x : vSpacing,
              y : -((j * cellWidth) + ((i % 2) * (cellWidth / 2)) + cellWidth),
              z : 0
            };

            cells.push({
              key : `${i}-${j}`,
              sizeX : parseFloat(vRatio),
              sizeY : hRatio,
              position,
              fastForward : this.repeats === 1 ? false : true,
              deletePoint : this.dimensions.rows
            });
          }
        }
        this.cellPositions.push(...cells);
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
      }
    },
    metaInfo() {
      return {
        title : 'Home',
        meta : []
      };
    }
  };
</script>

<style lang="scss">
  .DiamondEmitter {
    //
  }
</style>

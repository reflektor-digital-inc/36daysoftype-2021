<template>
  <div @mousemove="onMove">
    <Renderer
      ref="renderer"
      class="Home__canvas"
      :alpha="true"
      resize="window"
      mouse-move
      mouse-over
      click
      :shadow="false"
      pointer
    >
      <OrthographicCamera
        ref="camera"
        v-bind="cameraProps"
      />

      <Scene ref="scene">
        <Group v-if="letterGeometries" ref="cellGroup">
          <LandingGridCell
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
            :breakpoint-mobile="breakpointMobile"
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
  </div>
</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import LandingGridCell from '@components/three/LandingGridCell/LandingGridCell.vue';
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
  import mouseMovement from '@mixins/mouse-movement';
  import _throttle from 'lodash/throttle';

  export default {
    name : 'Home',
    components : {
      ThreeBackground,
      LandingGridCell,
      TransparentBloomPass,
      GradientText,
      PageHeading
    },
    mixins : [mouseMovement],
    data() {
      return {
        GRADIENTS,
        letterGeometries : null,
        frustrumSize : 1,
        cellRefs : [],
        cellPositions : [],
        cellPositionsLerp : [],
        cellIndex : 0,
        cellOffset : 0,
        cellGroupPos : 0,
        cellGroupPosOffset : 0,
        firstLoop : true,
        widthFraction : 0.5,
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
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      dimensions() {
        if (!this.breakpointMobile) {
          const width = this.windowWidth * this.widthFraction;
          const cols = Math.floor(MathUtils.clamp(
            MathUtils.mapLinear(width, 0, 1920, 1, 10),
            2,
            5
          ));
          // const cols = 3;
          const rows = Math.ceil(this.windowHeight / (width / cols)) + 3;
          const ratio = this.windowWidth / this.windowHeight;

          return { rows, cols, ratio };
        }
        else {
          const height = this.windowHeight * this.widthFraction;
          const rows = Math.floor(MathUtils.clamp(
            MathUtils.mapLinear(height, 0, 1080, 1, 10),
            1,
            3
          ));
          const cols = Math.ceil(this.windowWidth / (height / rows)) + 3;

          const ratio = this.windowHeight / this.windowWidth;
          return { rows, cols, ratio };
        }
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
      }
    },
    watch : {
      dimensions : {
        immediate : true,
        handler() {
          this.refreshCells();
        }
      }
    },
    created() {
      this.refreshCellsThrottle = _throttle(this.refreshCells, 100, {
        trailing : true
      });
    },
    provide() {
      random.setSeed(290);
      return {
        random
      };
    },
    beforeMount() {
      gsap.ticker.add(this.onUpdate);
    },
    mounted() {
      this.$refs.renderer.renderer.setPixelRatio(2);
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Landing Page' }, false);

      this.$refs.renderer.renderer.autoClear = true;
      this.lastCell = '';

      this.loadPage();
      this.loadGeometry();
    },
    unmounted() {
      this.tweakFolder.dispose();
      gsap.ticker.remove(this.onUpdate);
    },
    methods : {
      refreshCells() {
        //reset cells
        this.cellRefs = [];
        this.cellPositions = [];
        this.cellPositionsLerp = [];
        this.cellIndex = 0;
        this.cellOffset = 0;
        this.cellGroupPos = 0;
        this.cellGroupPosOffset = 0;
        this.firstLoop = true;
        this.repeats = 10000;
        if (this.$refs.cellGroup) {
          this.$refs.cellGroup.group.position.x = 0;
          this.$refs.cellGroup.group.position.y = 0;
        }
      },

      loadPage() {
        this.transitionIn = true;
        // this.enterTimeout = setTimeout(() => {

        // }, 1000);
      },
      deleteCell(key) {
        const i = this.cellPositions.findIndex(el => el.key === key);
        if (i) {
          this.cellPositions.splice(i, 1);
        }
      },
      onUpdate() {
        if (!this.breakpointMobile) {
          if (this.$refs.cellGroup) {
            const chunkSize = 0.70711;  // column ratio
            for (let i = 0; i < this.repeats; i ++) {
              if (this.cellGroupPos <= this.cellGroupPosOffset) {
                if (this.firstLoop) {
                  this.createCells();
                  this.cellOffset ++;
                  this.firstLoop = false;
                }

                this.createCells();
                this.cellOffset ++;
                this.cellGroupPosOffset -= chunkSize;
              }
              this.$refs.cellGroup.group.position.x -= 0.0001;
              this.cellGroupPos = this.$refs.cellGroup.group.position.x;
            }
            this.repeats = 1;
          }
        }
        else {
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
        }
      },
      createCells() {
        if (!this.breakpointMobile) {
          const horizontalRatio = this.widthFraction / this.dimensions.cols;  // column ratio
          const verticalRatio = parseFloat(horizontalRatio * this.dimensions.ratio); // square to column
          const cellWidth = 1.41421356237; // pythagorean constant

          const cells = [];
          const jStart = this.cellOffset * this.dimensions.cols;
          const jEnd = this.dimensions.cols + jStart;
          for (let i = 0; i < this.dimensions.rows; i++) {
            for (let j = jStart; j < jEnd; j++) {
              // if (j !== 0 || i !== 0) continue;
              // const j = this.j;
              const vSpacing = (i * 0.70711) - (this.dimensions.rows * 0.70711 - 0.70711) / 2; // vertical spacing using sqrt(0.5)
              const position = {
                x : ((j * cellWidth) + ((i % 2) * (cellWidth / 2)) + cellWidth),
                y : vSpacing,
                z : 0
              };
              cells.push({
                key : `${i}-${j}`,
                sizeX : parseFloat(verticalRatio),
                sizeY : horizontalRatio,
                position,
                fastForward : this.repeats === 1 ? false : true,
                deletePoint : this.dimensions.cols
              });
            // break;
            }
          }
          this.cellPositions.push(...cells);
        }
        else {
          const cells = [];
          const vRatio = this.widthFraction / this.dimensions.rows;  // column ratio
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
        }
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
          intersects[0].object.dispatchEvent({ type : 'bump', ...intersects[0] });
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

<template>
  <div class="Letter-6">
    <Renderer
      ref="renderer"
      class="Letter-6__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      :shadow="false"
      pointer
      @mousemove="onMove"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @touchmove="onMove"
      @touchstart="onMouseDown"
      @touchend="onMouseUp"
    >
      <Camera
        ref="camera"
        :position="{ x : -1, y: 1, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          color="#fff"
          :position="{ x : 20, y : 2, z : 30 }"
          :intensity="1"
          :penumbra="0.1"
          :cast-shadow="false"
        />
        <PointLight
          ref="pointLightB"
          color="#ffffff"
          :penumbra="0.1"
          :intensity="1"
          :position="{ x : -20, y : 2.0, z : 30 }"
          :cast-shadow="false"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/Six_v1.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              :envMapIntensity="2.4"
              :metalness="0.40"
              :clearcoat="0.0"
              :roughness="0.50"
            />
          </ThreeModelLoader>
          <Group ref="pyramids">
            <Mesh :position="{x: 0, y: 0, z: 0}">
              <BarycentricTetrahedronGeometry :detail="settings.tetrahedronDetail" :radius="settings.tetrahedronRadius" />
              <PhongMaterial
                :color="settings.tetrahedronPhongColor"
                :reflectivity="20"
                :shininess="100"
                :specular="0x00ff00"
              />
            </Mesh>
          </Group>
        </Group>
        <ThreeBackground
          :color="settings.backgroundColor"
        />
      </Scene>
      <EffectComposer ref="composer">
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
  import BarycentricTetrahedronGeometry from '@components/troisExtensions/BarycentricTetrahedronGeometry.js';
  import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
  import fragment from '@shaders/sexy.frag';
  import vertex from '@shaders/sexy.vert';
  //import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
  import { PixelShader } from '@shaders/PixelShader';
  import { TvShader } from '@shaders/TvShader';
  import mouseMovement from '@mixins/mouse-movement.js';
  import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader,
      BarycentricTetrahedronGeometry
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        textureVideo,
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          halfToneRadius : 6,
          halfToneScatter : 0,
          bloomStrength : 0.2,
          bloomThreshold : 0.95,
          tetrahedronRadius : 0.25,
          tetrahedronDetail : 0,
          tetrahedronPhongColor : '#00ff00',
          backgroundColor : '#362e2e',
          startTheta : 2 * Math.PI / 1000,
          radius : 1.5
        },
        theta : 0,
        sexyShader : null
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
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-6' }, false);
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

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      ppFolder.addInput(this.settings, 'halfToneRadius', { min : 0, max : 10, step : 0.01 });
      ppFolder.addInput(this.settings, 'halfToneScatter', { min : 0, max : 10, step : 0.01 });

      const orbit = this.tweakFolder.addFolder({ title : 'Orbit' });
      orbit.addInput(this.settings, 'radius');
      orbit.addInput(this.settings, 'startTheta');

      const colors = this.tweakFolder.addFolder({ title : 'Colors' });
      colors.addInput(this.settings, 'tetrahedronPhongColor');
      colors.addInput(this.settings, 'backgroundColor');

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      this.addPixelPass();
      this.addTvPass();

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
      addPixelPass() {
        if (!this.pixelPass) {
          this.pixelPass = new ShaderPass(PixelShader);
          this.pixelPass.uniforms[ 'resolution' ].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
          this.pixelPass.uniforms[ 'resolution' ].value.multiplyScalar(window.devicePixelRatio);
          this.pixelPass.uniforms[ 'pixelSize' ].value = 8;
          this.$refs.composer.composer.addPass(this.pixelPass);
          this.pixelPassEnabled = true;
        }
      },
      addTvPass() {
        if (!this.tvPass) {
          this.tvPass = new ShaderPass(TvShader);
          this.$refs.composer.composer.addPass(this.tvPass);
          this.tvPassEnabled = true;
        }
      },
      async loadTextures() {
        this.sexyShader = new THREE.ShaderMaterial({
          extensions : {
            derivates : '#extension GL_OES_standard_derivatives: enable'
          },
          uniforms : {
            uTime : { value : 0. }
          },
          vertexShader : vertex,
          fragmentShader : fragment,
          transparent : true
        });
      },
      onUpdate(time) {
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
        if (this.$refs.letter.modelRoot) {
          this.$refs.group.group.rotation.y = time * 1.2;
        }

        this.theta += this.settings.startTheta;

        this.$refs.pyramids.group.children[0].position.y = 0.85 + this.settings.radius * Math.cos(time) * 0.9;
        this.$refs.pyramids.group.children[0].position.z = this.settings.radius * Math.sin(time);

        this.$refs.pyramids.group.children.forEach((child) => {
          child.rotation.x += Math.sin(time) / 20;
          child.rotation.y += Math.sin(time) / 20;
        });

        if (this.tvPass) {
          this.tvPass.uniforms.time.value = time;
        }

        this.sexyShader.uniforms.uTime.value = time;
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          child.scale.set(0.9, 0.9, 0.9);

          child.material = this.sexyShader;
        });
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);
      },
      onMouseDown() {
        this.glitchPass = new GlitchPass();
        this.$refs.composer.composer.addPass(this.glitchPass);
        this.unlockEasterEgg('6');
      },
      onMouseUp() {
        this.$refs.composer.composer.removePass(this.glitchPass);
      }

    }
  };
</script>

<style lang="scss">
.Letter-6 {
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

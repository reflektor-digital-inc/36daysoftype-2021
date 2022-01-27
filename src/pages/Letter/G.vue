<template>
  <div class="E">
    <Renderer
      ref="renderer"
      class="E__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      @mousemove="onMove"
      @mousedown="onMouseDown"
      @touchstart="onMouseDown"
      @mouseup="onMouseUp"
      @touchend="onMouseUp"
      @touchmove="onMove"
    >
      <Camera
        :position="{ x : 2, y : -0.5, z : cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLight"
          :position="{ x: -12.6, y: -0.9, z: 14.8 }"
          color="#c511d8"
          :intensity="1"
        />
        <PointLight
          ref="pointLight2"
          :position="{ x: 10.9, y: 0.0, z: 16.1 }"
          color="#ffffff"
          :intensity="1"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="model"
            model="/src/assets/gltf/letters/G_v1.glb"
            :position="{ y : 0.1 }"
            @load="onModelLoaded"
          />
          <RefractionMesh ref="capsule">
            <TorusGeometry
              :radius="2.3"
              :tube="0.04"
              :radial-segments="5"
              :tubular-segments="60"
            />
            <StandardMaterial
              ref="sphereMaterial"
              color="#ffffff"
              :metalness="1"
              :roughness="0"
              :transparent="true"
              :opacity="0.6"
            />
          </RefractionMesh>
          <RefractionMesh ref="capsule2">
            <TorusGeometry
              :radius="2"
              :tube="0.03"
              :radial-segments="5"
              :tubular-segments="60"
            />
            <StandardMaterial
              ref="sphereMaterial"
              color="#ffffff"
              :metalness="1"
              :roughness="0"
              :transparent="true"
              :opacity="0.6"
            />
          </RefractionMesh>
          <Group
            v-for="index in 15"
            :key="index"
            :ref="sateliteRef"
          >
            <Mesh>
              <SphereGeometry
                :radius="getRandomSateliteRadius()"
                :width-segments="25"
                :height-segments="25"
              />
              <StandardMaterial
                color="#ffffff"
                :metalness="1"
                :roughness="0"
                flat-shading
              />
            </Mesh>
          </Group>
        </Group>
        <ThreeBackground
          color="#6b00ff"
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
  import _get from 'lodash/get';
  import RefractionMesh from 'troisjs/src/components/meshes/RefractionMesh.js';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder, addColor } from '@utils/tweakpane-utils';
  import liquidVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ReflektorLetters from '@components/ReflektorLetters.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import iriEnv from '@assets/textures/texture_test_reflektor_original_shader.jpg';
  import mouseMovement from '@mixins/mouse-movement.js';
  import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ImagePreLoader,
      ReflektorLetters,
      ThreeBackground,
      RefractionMesh,
      ThreeModelLoader
    },
    mixins : [mouseMovement, loadingLogic],
    setup() {
      return {
        COUNT : 500
      };
    },
    data() {
      return {
        backgroundGradient : 'linear-gradient(225deg, #000 100%, #ff0066 33%, #360c86 0%)',
        envGradient : 'linear-gradient(25deg, #24c5e0 100%, #360c86 48%, #ff0066)',
        envGradient2 : 'linear-gradient(225deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        liquidMap : new THREE.Texture(),
        liquidVideo,
        settings : {
          bloomStrength : 0.24,
          bloomThreshold : 0.63
        },
        satellites : [],
        isMouseDown : false,
        isMouseUp : false,
        removable : []
      };
    },
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionZ() {
        return this.breakpointMobile ? 9 : 5;
      }
    },
    created() {
      // Set an initial random seed
      random.setSeed(random.getRandomSeed());
    },
    mounted() {
      this.material = new THREE.MeshPhysicalMaterial({
        color : '#00216c',
        metalness : 0.15,
        roughness : 0,
        reflectivity : 0.5,
        clearcoat : 0.5,
        clearcoatRoughness : 0,
        envMapIntensity : 5.65,
        morphNormals : true,
        morphTargets : true
      });

      this.extrasMaterial = new THREE.MeshPhysicalMaterial({
        color : '#ffffff',
        metalness : 1,
        roughness : 0.15,
        reflectivity : 0,
        clearcoat : 0,
        clearcoatRoughness : 0,
        envMapIntensity : 7,
        opacity : 1,
        transparent : false,
        side : THREE.FrontSide,
        emissive : '#ffffff',
        emissiveIntensity : 1
      });

      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder = this.$tweakpane.addFolder({ title : 'F' }, false);

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // material
      addColor(this.tweakFolder, this.material, 'color');
      this.tweakFolder.addInput(this.material, 'metalness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'roughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'reflectivity', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'clearcoat', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'clearcoatRoughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'flatShading', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.material, 'envMapIntensity', { min : 0, max : 20, step : 0.05 });

      // material
      this.tweakFolder.addSeparator();
      addColor(this.tweakFolder, this.extrasMaterial, 'color');
      this.tweakFolder.addInput(this.extrasMaterial, 'metalness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'roughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'reflectivity', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'clearcoat', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'clearcoatRoughness', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'flatShading', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'opacity', { min : 0, max : 1, step : 0.05 });
      this.tweakFolder.addInput(this.extrasMaterial, 'envMapIntensity', { min : 0, max : 20, step : 0.05 });

      // post-processing
      this.tweakFolder.addSeparator();
      this.tweakFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      this.tweakFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight2.light, { title : 'Point Light B' });

      this.initISatellites();

      this.afterImagePass = new AfterimagePass(0);
      const composer = this.$refs.composer.composer;
      composer.addPass(this.afterImagePass);

      this.dampTl = gsap.timeline({ paused : true })
        .fromTo(this.afterImagePass.uniforms.damp, { value : 0.5 }, {
          value : .98,
          duration : 1
        });

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
        const textureLoader = new THREE.TextureLoader();
        const envMap = await textureLoader.loadAsync(iriEnv);

        envMap.mapping = THREE.EquirectangularReflectionMapping;
        const envMap2 = generateGradientTextureFromString(this.envGradient2);
        envMap2.mapping = THREE.EquirectangularReflectionMapping;

        this.extrasMaterial.envMap = envMap2;
        this.material.envMap = envMap2;
        this.$refs.scene.scene.environment = envMap;
        this.$refs.scene.scene.background = envMap;
      },
      getRandomSateliteRadius() {
        return random.range(0.01, 0.04);
      },
      sateliteRef(satellite) {
        this.satellites.push(satellite);
      },
      initISatellites() {
        this.satellites.map((sGroupRef) => {
          const group = sGroupRef.group;
          group.userData.rotationAxis = new THREE.Vector3(
            random.range(0, Math.PI * 2),
            random.range(0, Math.PI * 2),
            random.range(0, Math.PI * 2)
          );
          group.userData.rotationSpeed = random.range(0.0005, 0.001);
          const mesh = sGroupRef.group.children[0];
          mesh.material = this.extrasMaterial;
          group.rotateX(random.range(0, Math.PI * 2));
          group.rotateY(random.range(0, Math.PI * 2));
          group.rotateZ(random.range(0, Math.PI * 2));
          const radius = random.range(2, 3);
          mesh.position.set(radius, 0, 0);
          group.layers.set(1);
        });
      },
      onUpdate(time) {
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
        const deltaRatio = gsap.ticker.deltaRatio(60);
        if (this.modelRoot) {
          this.modelRoot.rotateX(deltaRatio * -0.007);
          this.modelRoot.rotateY(deltaRatio * 0.006);
          this.modelRoot.rotateZ(deltaRatio * 0.004);
        }
        if (this.$refs.capsule) {
          this.$refs.capsule.mesh.rotateX(deltaRatio * -0.005);
          this.$refs.capsule.mesh.rotateY(deltaRatio * -0.01);
          this.$refs.capsule.mesh.rotateZ(deltaRatio * -0.012);
        }
        if (this.$refs.capsule2) {
          this.$refs.capsule2.mesh.rotateX(deltaRatio * -0.008);
          this.$refs.capsule2.mesh.rotateY(deltaRatio * 0.009);
          this.$refs.capsule2.mesh.rotateZ(deltaRatio * -0.02);
        }
        if (this.extras) {
          this.extras.forEach((child) => {
            if (child.morphTargetInfluences) {
              child.morphTargetInfluences[0] = Math.sin(time) / 2 + 0.5;
              child.morphTargetInfluences[1] = Math.cos(time) / 2 + 0.5;
              child.morphTargetInfluences[2] = Math.sin(time) / 2 + 0.5;
            }
            else {
              child.rotateY(0.01 * deltaRatio);
            }
          });
        }
        this.satellites.map((sGroupRef) => {
          const group = sGroupRef.group;
          group.rotateX(group.userData.rotationAxis.x * deltaRatio * group.userData.rotationSpeed);
          group.rotateY(group.userData.rotationAxis.y * deltaRatio * group.userData.rotationSpeed);
          group.rotateZ(group.userData.rotationAxis.z * deltaRatio * group.userData.rotationSpeed);
        });
      },
      onModelLoaded(children, modelRoot) {
        this.modelRoot = modelRoot;
        this.modelRoot.layers.set(0);
        this.children = _get(modelRoot, 'children');
        this.children.forEach((child, index) => {
          child.origScale = child.scale.clone();
          child.origPosition = child.position.clone();
          child.origRotation = child.rotation.clone();
          child.movementIntensity = Math.random();
          child.movementDirection = Math.sign(index % 2 - 0.5);
          child.material = this.material;
        });
      },
      onExtrasModelLoaded(children, modelRoot) {
        this.extrasRoot = modelRoot;
        this.extras = _get(modelRoot, 'children');
        this.extras.forEach((child, index) => {
          child.origScale = child.scale.clone();
          child.origPosition = child.position.clone();
          child.origRotation = child.rotation.clone();
          child.origVecRot = child.rotation.toVector3();
          child.movementIntensity = Math.random();
          child.movementDirection = Math.sign(index % 2 - 0.5);
          child.material = this.extrasMaterial;
        });
        this.extras[1].position.x += -2;
        this.extras[1].position.y += -1;
      },
      playVideo() {
        this.$refs.video.play();
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);
      },
      onMouseDown() {
        this.dampTl.play();
        setTimeout(() => {
          if (this.isMouseDown) this.unlockEasterEgg('G');
        }, 2000);

        this.isMouseDown = true;
        this.isMouseUp = false;
      },
      onMouseUp() {
        this.dampTl.reverse();
        this.isMouseDown = false;
        this.isMouseUp = true;
      }
    }
  };
</script>

<style lang="scss">
.E {
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

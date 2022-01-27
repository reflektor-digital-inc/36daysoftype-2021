<template>
  <div class="A">
    <div class="A__overlay">
      <div class="A__overlay-letters">
        <ReflektorLetters />
      </div>
    </div>
    <Renderer
      ref="renderer"
      class="A__canvas"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      @mousemove="onMove"
      @touchmove="onMove"
    >
      <Camera :position="cameraPosition" />
      <Scene
        ref="scene"
        background="#101010"
      >
        <Dodecahedron :scale="{x : 15, y : 15, z : 15}">
          <PhongMaterial
            color="#000000"
            :map="liquidMap"
            :side="BackSide"
          />
        </Dodecahedron>
        <AmbientLight
          ref="ambient"
          :intensity="0"
        />
        <PointLight
          ref="pointLight"
          :position="{ x: -3.9, y: 3.9, z: 7.8 }"
          color="#1a1a6f"
          :intensity="1"
        />
        <PointLight
          ref="pointLight2"
          :position="{ x: 7.8, y: 2.6, z: 0.9 }"
          color="#9f177a"
          :intensity=".8"
        />
        <Group ref="bgElements">
          <Mesh :position="{ x : 4, y : -2, z : -7 }">
            <BarycentricTetrahedronGeometry :detail="0" :radius="4" />
          </Mesh>
          <Mesh :position="{ x : -1.6, y : -1.8, z : -4 }" :rotation="{ x : 1, y : 2, z : 2}">
            <BarycentricTetrahedronGeometry :detail="0" :radius="1.5" />
          </Mesh>
          <Mesh :position="{ x : 0, y : 1, z : -3 }">
            <BarycentricTetrahedronGeometry :detail="0" :radius="2" />
          </Mesh>
        </Group>
        <Group ref="group">
          <ThreeModelLoader
            ref="model"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/A_Final_v2.glb"
            @load="onModelLoaded"
          />
        </Group>
      </Scene>
      <EffectComposer>
        <RenderPass />
        <FXAAPass />
        <SMAAPass />
        <UnrealBloomPass :strength="0.3" />
      </EffectComposer>
    </Renderer>
  </div>
</template>

<script>
  import gsap from 'gsap';
  import { mapGetters, mapState } from 'vuex';
  import { DoubleSide, BackSide, Vector3, ShaderMaterial, Uniform, TextureLoader, Color, Texture } from 'three';
  import random from 'canvas-sketch-util/random';
  import { COLOR_PURPLE, COLOR_MAGENTA } from '@settings/settings.colors';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import reflektorGradient from '@assets/textures/reflektor_gradient.png';
  import { shuffleArray } from '@utils/basic-functions';
  import reflektorFrag from '@shaders/reflektorGradient_morph.frag';
  import vertexShader from '@shaders/morphTargetsVertex.vert';
  import BarycentricTetrahedronGeometry from '@components/troisExtensions/BarycentricTetrahedronGeometry.js';
  import wireframeFrag from '@shaders/wireframe.frag';
  import wireframVertex from '@shaders/wireframe.vert';
  import ReflektorLetters from '@components/ReflektorLetters';
  import mouseMovement from '@mixins/mouse-movement.js';
  import SpringMixin from '@mixins/spring-physics.js';
  import loadingLogic from '@mixins/loading-logic.js';

  export default {
    components : {
      ReflektorLetters,
      BarycentricTetrahedronGeometry,
      ThreeModelLoader
    },
    mixins : [mouseMovement, SpringMixin, loadingLogic],
    props : {
      envMap : { type : Object, default : null }
    },
    data() {
      return {
        COLOR_PURPLE,
        COLOR_MAGENTA,
        reflektorMap : new Uniform(new Texture()),
        liquidMap : new Texture(),
        BackSide
      };
    },
    computed : {
      ...mapState({
        letterUnlock : state => state.easterEgg.letterUnlock
      }),
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPosition() {
        if (this.breakpointMobile) {
          return { x : -1, y : 1, z : 9 };
        }
        return { x : -1, y : 1, z : 4 };
      }
    },
    created() {
      // Set an initial random seed
      random.setSeed(random.getRandomSeed());
      // Log it for later reproducibility
      this.materials = {
        shader : new ShaderMaterial({
          uniforms : {
            gradient : this.reflektorMap,
            fresnelStart : new Uniform(0.0),
            fresnelEnd : new Uniform(0.75),
            fresnelIntensity : new Uniform(1.1),
            fade : new Uniform(1),
            time : new Uniform(0),
            baseColor : new Uniform(new Color(0x000000))
          },
          morphNormals : true,
          morphTargets : true,
          fragmentShader : reflektorFrag,
          vertexShader
        }),
        wireframe : new ShaderMaterial({
          extensions : {
            // needed for anti-alias smoothstep, astep()
            derivatives : true
          },
          transparent : true,
          side : DoubleSide,
          uniforms : { // some parameters for the shader
            widthFactor : { value : .05 },
            time : { value : 0.0 },
            scale : { value : 0.01 },
            speed : { value : 0.0 },
            strokeColor : { value : new Color(0xffffff) },
            strokeAlpha : { value : 1.0 },
            sdfOffset : { value : new Vector3(0, 0, 0) },
            dashEnabled : { value : false },
            dashRepeats : { value : 5.5 },
            dashLength : { value : 0.3 },
            squeeze : { value : true },
            squeezeMin : { value : 0.1 },
            squeezeMax : { value : 0.4 }
          },
          vertexShader : wireframVertex,
          fragmentShader : wireframeFrag
        })
      };

      this.tweakFolder = this.$tweakpane.addFolder({ title : 'A' }, false);
    },
    mounted() {
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLight2.light, { title : 'Point Light B' });

      this.$refs.bgElements.group.children.forEach((child) => {
        child.material = this.materials.wireframe;
        child.originalY = child.position.y;
      });

      gsap.ticker.add(this.onUpdate);

      this.loadingPromises.push(this.loadTextures());
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
    },
    methods : {
      async loadTextures() {
        const textureLoader = new TextureLoader();
        this.reflektorMap.value = await textureLoader.loadAsync(reflektorGradient);
      },
      onUpdate(time) {
        // this.modelRoot.rotation.y = Math.sin(time * 0.8) * 0.1;
        if (this.children && this.children.length) {
          this.children.forEach((child) => {
            if (child.bubbleUp) {
              const noise = random.noise3D(
                child.boundingBoxCenterPos.x,
                child.boundingBoxCenterPos.y,
                child.boundingBoxCenterPos.z,
                time * 0.001
              );
              child.morphTargetInfluences[0] = 1 + Math.max(0, noise);
            }
          });
        }

        if (this.$refs.bgElements) {
          this.$refs.bgElements.group.children.forEach((child, index) => {
            const dir = Math.sign(index % 2 - 0.5);
            child.rotation.x += 0.001 * (index + 1) * dir;
            child.rotation.y += 0.001 * (index + 1) * dir;
            child.rotation.z += 0.001 * (index + 1) * dir;

            child.position.y = child.originalY + Math.sin(time) * dir * 0.4;
          });
        }
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);

        this.updateSpring(this.children);
      },
      onModelLoaded(children) {
        this.children = children;
        this.setUpMaterial();
        this.setUpLetterSpring(this.children, 0.98, 20, 0.1);
      },
      centerMesh(mesh) {
        const center = new Vector3();
        mesh.geometry.computeBoundingBox();
        mesh.geometry.boundingBox.getCenter(center);
        mesh.geometry.center();
        mesh.position.copy(center);
      },
      setUpMaterial() {
        this.children = shuffleArray(this.children);
        this.children.forEach((child) => {
          child.geometry.computeBoundingBox();
          child.boundingBoxCenterPos = new Vector3();
          child.geometry.boundingBox.getCenter(child.boundingBoxCenterPos);
          child.boundingBoxCenterPos.addScalar(100);
          child.bubbleUp = true;

          child.material = this.materials.shader;

          child.material.envMap = this.envMap;
          child.morphTargetInfluences[0] = 1;
        });
      },
      onMove(e) {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);

        const objects = this.children;
        if (objects) {
          this.intersects = this.getIntersects(objects, 'A');
        }
        this.onMoveSpring(e);
      },
      onTouchEnd() {
        this.intersects = [];
      }
    }
  };
</script>

<style lang="scss">
.A {
  // position: relative;
  &__canvas {
    z-index: 3;
    @include full-size(absolute);
  }
  &__assets {
    z-index: 0;
  }
  &__bg {
    z-index: 1;
    @include full-size(absolute);
    background-image: linear-gradient(to bottom left, #1d1e66, rgb(15, 0, 19));
    transform: scale(1.6);
    transform-origin: 0% 90%;
    pointer-events: none;
  }
  &__underlay {
    @include full-size(absolute);
    z-index: 2;
    pointer-events: none;
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

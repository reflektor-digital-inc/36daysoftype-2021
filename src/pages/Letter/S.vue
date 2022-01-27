<template>
  <div class="Letter-S">
    <Renderer
      ref="renderer"
      class="Letter-S__canvas"
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
      @dblclick="dbClick"
      @touchmove="onMove"
      @touchstart="onMouseDown"
      @touchend="onMouseUp"
    >
      <Camera
        ref="camera"
        :position="{ x : 1, y: -10, z: cameraPositionZ }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          :intensity="0.40"
          :penumbra="0.1"
          :cast-shadow="false"
          color="#e1bcfb"
          :position="{ x : -30, y : 0.20, z : -9.0 }"
        />
        <PointLight
          ref="pointLightB"
          :penumbra="0.1"
          color="#e1bcfb"
          :intensity="1.4"
          :position="{ x : -20, y : 2.0, z : 30 }"
          :cast-shadow="false"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            :position="{ x : 0, y: -1.5, z: 0.5 }"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/s5.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              :envMapIntensity="2.4"
              :metalness="0.40"
              :clearcoat="0.0"
              :roughness="0.50"
            />
          </ThreeModelLoader>
          <InstancedMesh ref="particles" :count="NUM_PARTICLES">
            <PlaneGeometry
              :width="1"
              :height="1"
            />
            <StandardMaterial
              ref="petalMaterial"
              emissive="#2a0933"
              :transparent="true"
              :opacity="1"
              :metalness="0"
              :roughness="0"
              :alpha-clip="0.1"
              :depth-write="false"
            />
          </InstancedMesh>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(90deg, #85d6e6 0%, #609cd4 18%, #7474ff 100%)"
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
  import { addLightFolder, materialTweaks } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import leafTexture from '@assets/textures/leaf.png';
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

  const { randFloat, randFloatSpread } = THREE.MathUtils;

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader
    },
    mixins : [mouseMovement, loadingLogic],
    data() {
      return {
        textureVideo,
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.2,
          bloomThreshold : 0.95
        },
        hotspots : [],
        NUM_PARTICLES : 300,
        curve : null,
        maxSpeed : 0.015,
        maxForce : 0.001,
        chaos : 0.0006,
        mouseDown : false,
        dbClicked : false
      };
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-S' }, false);
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
        return this.breakpointMobile ? 9 : 5;
      }
    },
    mounted() {
      this.renderer = this.$refs.renderer;
      this.particles = this.$refs.particles.mesh;
      this.delta = 0;
      this.reversed = false;

      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // Particles
      const particlesFolder = this.tweakFolder.addFolder({ title : 'Particles' });
      particlesFolder.addInput(this, 'maxSpeed', { min : 0, max : 1, step : 0.001 });
      particlesFolder.addInput(this, 'maxForce', { min : 0, max : 0.5, step : 0.0001 });
      particlesFolder.addInput(this, 'chaos', { min : 0, max : 0.005, step : 0.0001 });

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      // materials
      materialTweaks(this.tweakFolder, this.$refs.petalMaterial.material, { title : 'Petal Material' });

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
      initParticles() {
        this.instances = [];
        this.target = new THREE.Vector3();
        this.dummyO = new THREE.Object3D();
        this.dummyV = new THREE.Vector3();
        this.currentHotspot = 0;

        for (let i = 0; i < this.NUM_PARTICLES; i++) {
          const randAngle = new THREE.Vector3(
            randFloat(-1, 1),
            randFloat(-1, 1),
            randFloat(-1, 1)
          );
          this.instances.push({
            position : new THREE.Vector3(
              randFloatSpread(this.hotspots[this.currentHotspot].x),
              randFloatSpread(this.hotspots[this.currentHotspot].y),
              randFloatSpread(this.hotspots[this.currentHotspot].z)
            ),
            scale : randFloat(0.01, 0.15),
            scaleZ : randFloat(0.01, 0.15),
            velocity : new THREE.Vector3(
              0.0001,
              0.0001,
              0.0001
            ),
            rotation : new THREE.Euler(
              randFloat(-1, 1),
              0,
              randFloat(-1, 1),
              'XYZ'
            ),
            // maxspeed : 10,
            maxspeed : 0.01,
            maxforce : 0.0001,
            randAngle
          });

          const { position, scale, scaleZ, rotation } = this.instances[i];
          this.dummyO.position.copy(position);
          this.dummyO.scale.set(scale, scale, scaleZ);
          this.dummyO.rotation.copy(rotation);
          this.dummyO.updateMatrix();
          this.particles.setMatrixAt(i, this.dummyO.matrix);
        }

        this.desiredVec = new THREE.Vector3();
        this.steeringVec = new THREE.Vector3();
        this.chaosVec = new THREE.Vector3();

        this.particles.instanceMatrix.needsUpdate = true;
      },
      animateBoids() {
        if (this.curve) {
          if (this.delta >= this.curve.getLength() - 2) {
            this.reversed = true;
          }
          else if (this.delta <= 0) {
            this.reversed = false;
          }

          if (!this.reversed) {
            this.delta += 0.04;
          }
          else {
            this.delta -= 0.04;
          }

          for (let i = 0; i < this.NUM_PARTICLES; i++) {
            const { rotation, position, scale, scaleZ, velocity, randAngle } = this.instances[i];

            const temp2 = THREE.MathUtils.mapLinear(this.delta + (i / 100), 0, this.curve.getLength(), 0, 1);

            const point = this.curve.getPointAt(THREE.MathUtils.clamp(temp2, 0, 1));
            this.target.copy(point);

            // desired = target - location
            this.desiredVec.copy(this.target).sub(position).normalize().multiplyScalar(this.maxSpeed);

            this.steeringVec.copy(this.desiredVec).sub(velocity).normalize();
            this.steeringVec.clampLength(0, this.maxForce);

            // Set this.dummyV to this.steeringVec
            this.dummyV.copy(this.steeringVec);

            this.chaosVec.copy(randAngle).multiplyScalar(this.chaos);

            velocity.add(this.dummyV);
            velocity.add(this.chaosVec);
            position.add(velocity);

            this.dummyO.position.copy(position);
            this.dummyO.rotation.copy(rotation);
            this.dummyO.scale.set(scale, scale, scaleZ);
            this.dummyO.rotateZ(velocity.length() * 500);

            this.dummyO.updateMatrix();
            this.particles.setMatrixAt(i, this.dummyO.matrix);
          }
        }

        this.particles.instanceMatrix.needsUpdate = true;
      },
      async loadTextures() {
        const envMap = generateGradientTextureFromString(this.envGradient);
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        this.$refs.letter.updateModelMaterial({ envMap });

        const textureLoader = new THREE.TextureLoader();
        const texture = await textureLoader.loadAsync(leafTexture);

        this.$refs.particles.material.side = THREE.DoubleSide;
        this.$refs.particles.material.map = texture;
        this.$refs.particles.material.needsUpdate = true;
      },
      onUpdate(time) {
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
        if (!this.mouseDown) {
          this.animateBoids(time);
        }
        else this.boidsToMouse();
        if (this.$refs.letter.modelRoot) {
          this.$refs.letter.modelRoot.rotation.y = Math.sin(time * 0.5) * 0.5;
        }
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        const childArray = [];
        children.forEach((child) => {
          // see https://threejs.org/docs/?q=object3d#api/en/core/Object3D
          if (child.name.indexOf('Point') === 0) {
            childArray.push({
              ...child,
              id : child.name.split('t')[1]
            });
          }
        });
        const letterOffset = new THREE.Vector3(0, -1.5, 0.5);
        childArray.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        childArray.forEach((child) => {
          this.hotspots.push(child.position.add(letterOffset));
        });
        this.curve = new THREE.CatmullRomCurve3(this.hotspots);

        this.setupParticleSystem();
      },
      setupParticleSystem() {
        this.initParticles();
        let reversed = false;
        setInterval(() => {
          if (this.currentHotspot === this.hotspots.length - 1) {
            reversed = true;
          }
          else if (this.currentHotspot === 0) {
            reversed = false;
          }
          if (reversed) {
            this.currentHotspot = (this.currentHotspot - 1);
          }
          else {
            this.currentHotspot = (this.currentHotspot + 1);
          }
        }, 500);
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);
      },
      onMouseDown() {
        this.mouseDown = true;
        this.mousePosition = this.$refs.renderer.three.pointer.positionV3;
      },
      onMouseUp() {
        this.mouseDown = false;
      },
      boidsToMouse() {
        for (let i = 0; i < this.NUM_PARTICLES; i++) {
          const { position, scale, scaleZ, velocity } = this.instances[i];
          const angle = Math.random(360);
          const x = this.mousePosition.x + 0.5 * Math.cos(Math.PI * 2 * angle);
          const y = this.mousePosition.y + 0.5 * Math.sin(Math.PI * 2 * angle);
          const point =  new THREE.Vector3(x, y, this.mousePosition.z);
          this.target.copy(point);

          this.desiredVec.copy(this.target).sub(position).normalize().multiplyScalar(this.maxSpeed);

          this.steeringVec.copy(this.desiredVec).sub(velocity).normalize();
          this.steeringVec.clampLength(0, this.maxForce / 2);
          this.dummyV.copy(this.steeringVec);

          velocity.add(this.dummyV);
          position.add(velocity);

          this.dummyO.position.copy(position);
          this.dummyO.scale.set(scale, scale, scaleZ);

          this.dummyO.updateMatrix();
          this.particles.setMatrixAt(i, this.dummyO.matrix);
        }
        this.particles.instanceMatrix.needsUpdate = true;
        setTimeout(() => {
          if (this.mouseDown) this.unlockEasterEgg('S');
        }, 2000);
      },
      dbClick() {
        this.dbClicked = !this.dbClicked;
        this.unlockEasterEgg('S');
        if (this.dbClicked) {
          this.maxSpeed = 0.0001;
        }
        else this.maxSpeed = 0.348;
      }
    }
  };
</script>

<style lang="scss">
.Letter-S {
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

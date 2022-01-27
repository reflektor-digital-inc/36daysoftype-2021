<template>
  <div class="Letter-U">
    <Renderer
      ref="renderer"
      class="Letter-U__canvas"
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
      @click="onClick"
    >
      <Camera
        ref="camera"
        :position="{ x : -1, y: -2, z: 6 }"
      />
      <Scene ref="scene">
        <Group ref="directLight">
          <DirectionalLight
            ref="directLightC"
            color="#ff0000"
            :intensity="2.0"
            :position="{ x : 0.0, y : -0.30, z : 0.0 }"
            :penumbra="0.5"
            :cast-shadow="false"
          />
        </Group>
        <PointLight
          ref="pointLightB"
          color="#ffffff"
          :penumbra="0.1"
          :position="{ x : 30, y : 2.0, z : 23 }"
          :intensity="0.2"
          :cast-shadow="false"
        />
        <PointLight
          ref="pointLightA"
          color="#ffffff"
          :penumbra="0.1"
          :position="{ x : -24, y : 2.9, z : 20 }"
          :intensity="0.30"
        />
        <PointLight
          ref="pointLightD"
          color="#ffffff"
          :penumbra="0.1"
          :position="{ x : 24, y : 8, z : 20 }"
          :intensity="0.20"
        />
        <PointLight
          ref="pointLightA"
          color="#ffffff"
          :penumbra="0.1"
          :position="{ x : -20, y : 3, z : -30 }"
          :intensity="0.15"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
            title="Letter"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/U_v2.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              :envMapIntensity="0.5"
              :metalness="0.74"
              :clearcoat="0.0"
              :roughness="0.38"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(120deg, #1b181f 31.2%, #0d4e85 57%, #1d8e96 65%, #320459 84%)"
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
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import metalImage from '@assets/textures/Greeble_1.jpg';
  import particle from '@assets/textures/star.png';
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

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
        envGradient : 'linear-gradient(225deg, #afafaf 11%, #3d2626 95%)',
        settings : {
          bloomStrength : 0.5,
          bloomThreshold : 0.95,
          numInstances : 240
        }
      };
    },
    computed : {
      ...mapGetters({
        breakpointMobile : 'windowSize/breakpointMobile'
      }),
      cameraPositionZ() {
        return this.breakpointMobile ? 10 : 6;
      }
    },
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-U' }, false);
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
      this.dummyObject = new THREE.Object3D();

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.directLightC.light, { title : 'Directional Light C' });

      // materials
      this.initStar();

      this.loadingPromises.push(this.loadTextures());

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
        const envMap = generateGradientTextureFromString(this.envGradient);
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        const metalMap = await textureLoader.loadAsync(metalImage);
        metalMap.mapping = THREE.EquirectangularReflectionMapping;

        //metalMap.encoding = THREE.sRGBEncoding;
        this.$refs.letter.updateModelMaterial({ bumpMap : metalMap, envMap });
        this.$refs.letter.material.bumpScale = 0.01;

        const star = await textureLoader.loadAsync(particle);
        this.particles.material.alphaMap = star;
        this.particles.material.needsUpdate = true;
      },
      onUpdate(time) {
        this.$refs.group.group.position.y = Math.sin(time) * 0.05;
        this.particles.rotation.y = time * 0.01;
        this.$refs.renderer.three.camera.lookAt(0, 0, 0);
      },
      initStar() {
        const starGeometry = new THREE.BufferGeometry();
        const count = 5000;
        const positions = new Float32Array(count * 3);
        const starMaterial = new THREE.PointsMaterial({
          size : 0.04,
          sizeAttenuation : true,
          color : 0xF1F990,
          transparent : true,
          depthWrite : false
        });
        for (let i = 0; i < count * 3; i++) {
          positions[i] = (Math.random() - 0.5) * 10;
        }
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        this.particles = new THREE.Points(starGeometry, starMaterial);
        this.scene = this.$refs.scene.scene;
        this.scene.add(this.particles);
      },
      createTimeline() {
        const { children } = this.$refs.letter;
        const childPositions = children.map(child => child.position);
        const childScales = children.map(child => child.scale);
        const light = this.$refs.directLightC.light;
        const camera = this.$refs.camera.camera.position;

        const duration = 1;
        const stagger = 0.01;
        const fromEase = 'power4.out';
        const toEase = 'power2.in';

        this.timeline = gsap.timeline();
        this.timeline.fromTo(
          childPositions,
          {
            x : index => children[index].origPosition.x * 10,
            y : index => children[index].origPosition.y * 10,
            z : index => children[index].origPosition.z * -10
          },
          {
            x : index => children[index].origPosition.x * 2,
            y : index => children[index].origPosition.y * 2,
            z : index => children[index].origPosition.z,
            ease : fromEase,
            duration : 0.3,
            stagger : {
              each : 0.2
            }
          }
        );
        this.timeline
          .to(
            camera,
            {
              x : 3,
              y : 4,
              z : this.cameraPositionZ - 3,
              ease : fromEase,
              duration : 0.8
            },
            '<'
          )
          .to(
            camera,
            {
              x : -4,
              y : 0,
              z : this.cameraPositionZ - 1,
              ease : fromEase,
              duration : 0.8
            },
            '-=2'
          )
          .to(
            camera,
            {
              x : 4,
              y : 1,
              z : this.cameraPositionZ + 4,
              ease : fromEase,
              duration : 0.8
            },
            '-=1'
          );
        this.timeline.from(
          light,
          {
            intensity : 0,
            ease : toEase,
            delay : 0.8,
            duration : 0.8
          },
          '<'
        )
          .to(
            childPositions,
            {
              x : index => children[index].origPosition.x,
              y : index => children[index].origPosition.y,
              ease : toEase,
              duration : 0.3,
              stagger,
              delay : 0.3
            }
          ).to(
            camera,
            {
              x : -1.2,
              y : -1.2,
              z : this.cameraPositionZ - 1,
              ease : fromEase,
              duration : 1
            },
            '<'
          )
          .to(
            childScales,
            {
              x : 0.99,
              y : 0.99,
              ease : fromEase,
              duration
            }
          );
        this.lightTimeline =  gsap.timeline({ repeat : -1 });
        this.timeline.add(this.lightTimeline);
        this.lightTimeline.fromTo(
          light,
          {
            intensity : 0

          },
          {
            intensity : 2,
            ease : toEase,
            duration : 1
          }
        )
          .to(
            light,
            {
              intensity : 0,
              ease : toEase,
              delay : 1.5,
              duration : 1
            }
          );
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        children.forEach((child) => {
          child.scale.set(0.8, 0.8, 0.8);
        });

        this.createTimeline();
      },
      onMove() {
        this.pointer = this.$refs.renderer.three.pointer.positionN;
        this.setCameraPositionTarget(this.pointer);
      },
      onClick() {
        const objects = this.$refs.letter;
        this.target = this.$refs.renderer.three.pointer.positionV3;
        this.intersects = this.getIntersects(objects);
        this.unlockEasterEgg('U');
        this.createLaser(this.target.x, this.target.y, this.target.z);
      },
      createLaser(x, y) {
        const laser = this.laserBeam();

        laser.position.x = x;
        laser.position.y = y;
        laser.rotation.y = -Math.PI / 2;
        laser.scale.set(10, 0.7, 0.7);
        this.scene.add(laser);
        gsap.fromTo(
          laser.position,
          {
            x : this.$refs.camera.camera.position.x,
            y : this.$refs.camera.camera.position.y,
            z : 10
          },
          {
            x : x,
            y : y,
            z : -5,
            duration : 0.3,
            onComplete : () => {
              this.scene.remove(laser);
            }
          }
        );
      },
      laserBeam() {
        const object3d	= new THREE.Object3D();
        this.object3d	= object3d;
        // generate the texture
        const canvas	= this.generateLaserBodyCanvas();
        const texture	= new THREE.Texture(canvas);
        texture.needsUpdate	= true;
        // do the material
        const material	= new THREE.MeshBasicMaterial({
          map	: texture,
          blending	: THREE.AdditiveBlending,
          color	: 0x4444aa,
          side	: THREE.DoubleSide,
          depthWrite	: false,
          transparent	: true
        });
        const geometry	= new THREE.PlaneGeometry(1, 0.1);
        const nPlanes	= 20;
        for (let i = 0; i < nPlanes; i++) {
          const mesh	= new THREE.Mesh(geometry, material);
          mesh.position.x	= 1 / 2;
          mesh.rotation.x	= i / nPlanes * Math.PI;
          this.object3d.add(mesh);
        }
        return object3d;
      },
      generateLaserBodyCanvas() {
        // init canvas
        const canvas	= document.createElement('canvas');
        const context	= canvas.getContext('2d');
        canvas.width	= 1;
        canvas.height	= 64;
        // set gradient
        const gradient	= context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(  0,  0,  0,0.1)');
        gradient.addColorStop(0.1, 'rgba(160,160,160,0.3)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(0.9, 'rgba(160,160,160,0.3)');
        gradient.addColorStop(1.0, 'rgba(  0,  0,  0,0.1)');
        // fill the rectangle
        context.fillStyle	= gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        // return the just built canvas
        return canvas;
      }
    }
  };
</script>

<style lang="scss">
.Letter-Q {
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

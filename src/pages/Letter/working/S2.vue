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
      orbit-ctrl
      :shadow="false"
    >
      <Camera
        ref="camera"
        :position="{ x : -1, y: 1, z: 10 }"
      />
      <Scene ref="scene">
        <PointLight
          ref="pointLightA"
          color="#fff"
          :position="{ x : 20, y : 2, z : 30 }"
          :intensity="0.40"
          :penumbra="0.1"
          :cast-shadow="false"
        />
        <PointLight
          ref="pointLightB"
          color="#ffffff"
          :penumbra="0.1"
          :intensity="0.40"
          :position="{ x : -20, y : 2.0, z : 30 }"
          :cast-shadow="false"
        />
        <Group ref="group">
          <ThreeModelLoader
            ref="letter"
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
          <InstancedMesh ref="boidSystem" :count="MAX_BOIDS">
            <!-- <PlaneGeometry
              :width="0.5"
              :height="0.5"
              :double-sided="true"
            /> -->
            <SphereGeometry :radius="0.05" />
            <StandardMaterial
              :transparent="true"
              :opacity="0.9"
              :metalness="0.8"
              :roughness="0.5"
            />
          </InstancedMesh>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(225deg, #6b00ff, #ff0066, #360c86, #24c5e0)"
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
  import * as THREE from 'three';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import Boid from '../classes/Boid';

  // import ReflektorLetters from '@components/ReflektorLetters.vue'; // reflektor logo overlay
  // import { materialTweaks } from '@utils/tweakpane-utils';

  export default {
    components : {
      ImagePreLoader,
      ThreeBackground,
      ThreeModelLoader
    },
    data() {
      return {
        textureVideo,
        envGradient : 'linear-gradient(90deg, #24c5e0 100%, #360c86 35%, #24c5e0 5%)',
        settings : {
          bloomStrength : 0.2,
          bloomThreshold : 0.95
        },
        hotspots : [],
        MAX_BOIDS : 200,
        curve : null,
        maxSpeed : 0.348,
        maxForce : 0.0102
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
    mounted() {
      this.renderer = this.$refs.renderer;
      this.boidSystem = this.$refs.boidSystem.mesh;
      this.initBoids();

      this.loadTextures();

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      // materials
      // materialTweaks(this.tweakFolder, this.$refs.YOUR_TROIS_OBJECT.mesh.material, { title : 'Object Material' });

      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
    },
    methods : {
      initBoids() {
        this.boids = [];
        this.target = new THREE.Vector3();
        this.dummyO = new THREE.Object3D();

        for (let i = 0; i < this.MAX_BOIDS; i++) {
          const boid = new Boid(i, this.MAX_BOIDS);
          this.boids.push(boid);

          const { position } = boid;
          this.updateBoidObject(i, position);
        }

        this.boidSystem.instanceMatrix.needsUpdate = true;
      },
      async loadTextures() {
        const envMap = generateGradientTextureFromString(this.envGradient);
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        this.$refs.letter.updateModelMaterial({ envMap });

        // this.$refs.YOUR_TROIS_OBJECT.mesh.material.YOUR_TEXTURE_PROPERTY = texture;

        // const textureLoader = new THREE.TextureLoader();
        // const texture = await textureLoader.loadAsync(importedTextureUrl);

        // const videoTexture = new THREE.VideoTexture(this.$refs.video);
        // videoTexture.minFilter = THREE.NearestFilter;
      },
      onUpdate() {
        this.boids.length && this.animate();
        if (this.$refs.letter.modelRoot) {
          // this.$refs.letter.modelRoot.rotation.y = Math.sin(time * 0.5) * 0.2;
        }
      },
      animate() {
        for (let i = 0; i < this.MAX_BOIDS; i++) {
          this.boids[i].flock(this.boids);
          this.boids[i].update();

          const { position } = this.boids[i];
          this.updateBoidObject(i, position);
        }
        this.boidSystem.instanceMatrix.needsUpdate = true;
      },
      updateBoidObject(i, position) {
        this.dummyO.position.copy(position);
        this.dummyO.updateMatrix();
        this.boidSystem.setMatrixAt(i, this.dummyO.matrix);
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

          // each letter model is made of little chunks
          // scaling down each child will reveal the structure
          // if you want ;)
          // child.scale.set(0.9, 0.9, 0.9);

          // also available if using ThreeModelLoader
          // child.origScale - original scale (for mutating scale directly with original scale)
          // child.origPosition - original position (for mutating position directly with original position)
          // child.origRotation - original rotation (for mutating rotation directly with original rotation)
          // child.random - a random reproducible value based on a seed
          // child.dir - alternates between 1 or -1 based on child array index
        });
        childArray.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        childArray.forEach((child) => {
          this.hotspots.push(child.position);
        });
        this.curve = new THREE.CatmullRomCurve3(this.hotspots);
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

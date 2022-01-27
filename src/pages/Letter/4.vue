<template>
  <div class="Letter-4">
    <Renderer
      ref="renderer"
      class="Letter-4__canvas"
      :alpha="false"
      antialias
      resize="window"
      mouse-move
      mouse-over
      click
      pointer
      @mousemove="onMove"
      @touchmove="onMove"
    >
      <Camera
        ref="camera"
        :position="{ x : 0, y: 0, z: cameraPositionZ }"
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
            model="/src/assets/gltf/letters/4_v3.glb"
            @load="setUpLetterChildren"
          >
            <PhysicalMaterial
              color="#000000"
              :envMapIntensity="20.0"
              :reflectivity="0.1"
              :metalness="0.00"
              :ior="1.88"
              :transmission="1.0"
              :clearcoat="0.0"
              :roughness="0.97"
              :transparent="true"
              :opacity="0.9"
              :vertex-colors="vc"
              :side="backSide"
            />
          </ThreeModelLoader>

          <ThreeModelLoader
            ref="letterLines"
            title="letterLines"
            :cast-shadow="false"
            model="/src/assets/gltf/letters/4_v4.glb"
            @load="setUpLetterChildren2"
          >
            <PhysicalMaterial
              color="#000000"
              :envMapIntensity="12.4"
              :reflectivity="0.1"
              :metalness="0.00"
              :clearcoat="1.0"
              :roughness="0.0"
              :transparent="true"
              :opacity="0.0"
            />
          </ThreeModelLoader>
        </Group>
        <ThreeBackground
          gradient="linear-gradient(45deg, #eeaeca, #000000)"
          color="#00000f"
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
  import  { mapGetters } from 'vuex';
  import * as THREE from 'three';
  import random from 'canvas-sketch-util/random';
  import { addLightFolder } from '@utils/tweakpane-utils';
  import textureVideo from '@assets/videos/MartinTexture_1.mp4';
  import ImagePreLoader from '@components/ImagePreLoader/ImagePreLoader.vue';
  import ThreeBackground from '@components/three/ThreeBackground/ThreeBackground.vue';
  import ThreeModelLoader from '@components/three/ThreeModelLoader/ThreeModelLoader.vue';
  import { generateGradientTextureFromString } from '@utils/gradient-texture-factory';
  import mouseMovement from '@mixins/mouse-movement.js';
  import loadingLogic from '@mixins/loading-logic.js';

  // import ReflektorLetters from '@components/ReflektorLetters.vue'; // reflektor logo overlay
  // import { materialTweaks } from '@utils/tweakpane-utils';

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
          bloomStrength : 2.0,
          bloomThreshold : 0.15
        }
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
    provide() {
      this.tweakFolder = this.$tweakpane.addFolder({ title : 'Letter-4' }, false);
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
    // 		attribute float size;
    // attribute vec3 customColor;

    // varying vec3 vColor;

    // void main() {

    //   vColor = customColor;

    // 	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    // 	gl_PointSize = size * ( 300.0 / -mvPosition.z );

    // 	gl_Position = projectionMatrix * mvPosition;

    created() {
      this.vertexShader = `
        // Include the Ashima code here!
        attribute float size;
        attribute vec3 customColor;

        varying vec3 vColor;
        varying vec2 vUv;
        varying float noise;
        uniform float time;

          vec3 mod289(vec3 x)
        {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289(vec4 x)
        {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x)
        {
          return mod289(((x*34.0)+1.0)*x);
        }

        vec4 taylorInvSqrt(vec4 r)
        {
          return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec3 fade(vec3 t) {
          return t*t*t*(t*(t*6.0-15.0)+10.0);
        }

        // Classic Perlin noise
        float cnoise(vec3 P)
        {
          vec3 Pi0 = floor(P); // Integer part for indexing
          vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }

        // Classic Perlin noise, periodic variant
        float pnoise(vec3 P, vec3 rep)
        {
          vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
          vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
          Pi0 = mod289(Pi0);
          Pi1 = mod289(Pi1);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 * (1.0 / 7.0);
          vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 * (1.0 / 7.0);
          vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
          return 2.2 * n_xyz;
        }

        float turbulence( vec3 p ) {
            float w = 100.0;
            float t = -.5;
            for (float f = 1.0 ; f <= 10.0 ; f++ ){
                float power = pow( 2.0, f );
                t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
            }
            return t;
        }

        void main() {
          // vColor = customColor;
          vUv = uv;

          // add time to the noise parameters so it's animated
          noise = 1.1 *  -.10 * turbulence( .5 * normal + time );
          float b = 0.1 * pnoise( 0.05 * position + vec3( 2.0 * time ), vec3( 100.0 ) );
          float displacement = - noise + b;

          vec3 newPosition = position + normal * displacement;
          // gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

          vColor = customColor;

          vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );

          gl_PointSize = size * ( 300.0 / -mvPosition.z );

          gl_Position = projectionMatrix * mvPosition;
        }`;

      this.fragmentShader = `
			uniform vec3 color;
			uniform sampler2D pointTexture;

			varying vec3 vColor;

			void main() {

				gl_FragColor = vec4( color * vColor, 1.0 );
				gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );

			}`;
      this.vc = THREE.FaceColors;
      this.backSide = THREE.BackSide;
    },
    mounted() {
      this.loadingPromises.push(this.loadTextures());

      this.tweakFolder.addButton({ title : 'Play Video' }).on('click', this.playVideo);

      // post-processing :)
      const ppFolder = this.tweakFolder.addFolder({ title : 'Post Processing' });
      ppFolder.addInput(this.settings, 'bloomStrength', { min : 0, max : 1, step : 0.01 });
      ppFolder.addInput(this.settings, 'bloomThreshold', { min : 0, max : 1, step : 0.01 });

      // lights
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightA.light, { title : 'Point Light A' });
      this.tweakFolderPoint = addLightFolder(this.tweakFolder, this.$refs.pointLightB.light, { title : 'Point Light B' });

      gsap.ticker.add(this.onUpdate);
    },
    unmounted() {
      gsap.ticker.remove(this.onUpdate);
      this.tweakFolder.dispose();
    },
    methods : {
      async loadTextures() {
        const envMap = generateGradientTextureFromString(this.envGradient);
        envMap.mapping = THREE.EquirectangularReflectionMapping;

        this.$refs.letter.updateModelMaterial({ envMap });
      },
      onUpdate(time) {
        const t = 0.2;
        if (this.$refs.letter.modelRoot) {
          this.$refs.letter.modelRoot.children.forEach((child) => {
            child.rotation.y = time * t;
          });
        }

        this.pointsArray.forEach((child) => {
          child.rotation.y = time * t;
          const geometry = child.geometry;
          const attributes = geometry.attributes;
          child.material.uniforms[ 'time' ].value = time * 0.02;
          for (let i = 0; i < attributes.size.array.length; i ++) {
            attributes.size.array[ i ] = 0.03 + 0.04 * Math.sin(i + time);
          }

          attributes.size.needsUpdate = true;
        });

        this.linesArray.forEach((child) => {
          child.rotation.z = -time * t;
        });
        if (this.intersects) {
          if (this.intersects.length) {
            this.intersects.forEach((child) => {
              const obj = child.object;
              gsap.to(
                obj.material,
                {
                  reflectivity : 0.0,
                  metalness : 1.0,
                  roughness : 0.0,
                  clearcoat : 0.63,
                  clearcoatRoughness : 0.43,
                  envMapIntensity : 17.61,
                  ior : 2.33,
                  transmission : 0.92,
                  refractionRatio : 1.0,
                  opacity : 0.7,
                  duration : 0.7
                }
              );
              gsap.to(
                this.settings,
                {
                  bloomStrength : 0.85,
                  duration : 0.7
                }
              );
            });
          }
          else this.$refs.letter?.modelRoot?.children.forEach((child) => {
            gsap.to(
              child.material,
              {
                reflectivity : 0.7638888889,
                metalness : 0.0,
                roughness : 0.97,
                clearcoat : 0.00,
                clearcoatRoughness : 0.00,
                envMapIntensity : 20.00,
                ior : 1.88,
                transmission : 1.0,
                refractionRatio : 0.98,
                opacity : 0.9,
                duration : 10
              }
            );
            gsap.to(
              this.settings,
              {
                bloomStrength : 0.95,
                duration : 10
              }
            );
          });
        }
      },
      onMove() {
        // control camera by mouse move
        this.point = this.$refs.renderer.three.pointer.positionN;
        if (this.$refs.letter?.modelRoot?.children)
          this.intersects = this.getIntersects(this.$refs.letter?.modelRoot?.children, '4');

        if (this.pointsArray)
          this.intersectsPoints = this.getIntersects(this.pointsArray);
      },
      playVideo() {
        this.$refs.video.play();
      },
      setUpLetterChildren(children) {
        const amount = 200;
        const radius = 0.2;

        const positions = new Float32Array(amount * 3);
        const colors = new Float32Array(amount * 3);
        const sizes = new Float32Array(amount);

        const vertex = new THREE.Vector3();
        const color = new THREE.Color(0xffffff);

        this.pointsArray = [];
        children.forEach((child, i) => {
          const pointMaterial = new THREE.ShaderMaterial({

            uniforms : {
              color : { value : new THREE.Color(0xffffff) },
              pointTexture : { value : new THREE.TextureLoader().load('/src/assets/textures/spark1.png') },
              time : { // float initialized to 0
                type : 'f',
                value : Math.random() * 20
              }
            },
            vertexShader : this.vertexShader,
            fragmentShader : this.fragmentShader,
            blending : THREE.AdditiveBlending,
            depthTest : false,
            transparent : true

          });
          child.position.y -= 0.3;
          child.index = i;

          const mesh = new THREE.Points(child.geometry, pointMaterial);
          mesh.position.x = child.position.x;
          mesh.position.y = child.position.y + 0.2;
          mesh.position.z = child.position.z;
          mesh.scale.set(0.98, 0.98, 0.98);
          mesh.origPosition = child.position;
          mesh.index = i;
          const geometry = child.geometry;

          for (let i = 0; i < amount; i ++) {
            vertex.x = mesh.position.x + (Math.random() * 2 - 1) * radius;
            vertex.y =  mesh.position.y + (Math.random() * 2 - 1) * radius;
            vertex.z = mesh.position.z + (Math.random() * 2 - 1) * radius;
            vertex.toArray(positions, i * 3);

            if (Math.random() < 0.5) {
              color.setHSL(0.5 + 0.01 * (i / amount), 0.7, 0.9);
            }
            else {
              color.setHSL(0.0 + 0.01 * (i / amount), 0.9, 0.9);
            }

            color.toArray(colors, i * 3);

            sizes[ i ] = 10;
          }

          geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
          geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
          this.pointsArray.push(mesh);
          this.$refs.scene.scene.add(mesh);
        });
      },
      setUpLetterChildren2(children) {
        this.linesArray = [];
        children.forEach((child) => {
          const edges = new THREE.EdgesGeometry(child.geometry);
          const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color : 0xeeaeca, linewidth : 40.0, transparent : true, opacity : 1 }));

          child.scale.set(0, 0, 0);
          child.position.y -= 0.3;
          line.position.y = child.position.y + 0.2;
          line.rotation.x = Math.PI / 2;
          line.origPosition = child.position;
          this.linesArray.push(line);
          this.$refs.scene.scene.add(line);
        });
      }
    }
  };
</script>

<style lang="scss">
.Letter-4 {
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

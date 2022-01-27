<template>
  <Group
    ref="group"
    :scale="{ x : sizeY, y : sizeX, z : 1 }"
  >
    <Plane
      ref="quad"
      :rotation="{ x : 0, y : 0, z : Math.PI / 4 }"
      :position="position"
    >
      <BasicMaterial />
    </Plane>
  </Group>
</template>

<script>
  import * as THREE from 'three';
  import { mapState } from 'vuex';
  import { destroyScene } from '@utils/ThreeUtils';

  export default {
    inject : ['random'],
    props : {
      deletePoint : {
        type : Number,
        default : 0.25
      },
      index : {
        type : String,
        default : ''
      },
      sizeX : {
        type : Number,
        default : 0.25
      },
      fastForward : {
        type : Boolean,
        default : false
      },
      transitionOut : {
        type : Boolean,
        default : false
      },
      sizeY : {
        type : Number,
        default : 0.25
      },
      position : {
        type : Object,
        required : true
      },
      envMaps : {
        type : Object,
        required : true
      },
      isLastIndex : {
        type : Boolean,
        required : false
      },
      letterGeometries : {
        type : Array,
        required : true
      }
    },
    data() {
      return {
        cellStyle : {
          background : '#000'
        },
        worldPos : new THREE.Vector3(),
        accSpd : (0.00001 + Math.random() / 1000000) / 2,
        acc : 0,
        hspd : 0,
        maxHspd : (Math.random() * 0.06 + 0.01) / 2,
        triggerDist : -Math.random() / 15,
        repeats : 5000,
        skipRender : this.fastForward,
        ff : this.fastForward,
        deleteSelf : false
      };
    },
    computed : {
      ...mapState({
        windowWidth : state => state.windowSize.width,
        windowHeight : state => state.windowSize.height
      })
    },
    watch : {
      // windowWidth : 'setRenderTargetSize',
      // windowHeight : 'setRenderTargetSize',
      sizeX : 'setRenderTargetSize'
      // sizeY : 'setRenderTargetSize'
    },
    mounted() {
      this.parent = this.$refs.quad.getParent().group.parent;
      this.renderTarget = new THREE.WebGLRenderTarget({
        minFilter : THREE.LinearFilter,
        magFilter : THREE.NearestFilter,
        generateMipmaps : true,
        format : THREE.RGBFormat
        // depthBuffer : false
      });
      this.setRenderTargetSize();
      const rtFov = 45;
      const rtAspect =  this.renderTarget.height / this.renderTarget.width;
      const rtNear = 0.1;
      const rtFar = 10;
      this.rtCamera = new THREE.PerspectiveCamera(rtFov, rtAspect, rtNear, rtFar);
      this.rtCamera.position.z = 1.5 / rtAspect;

      this.rtScene = new THREE.Scene();
      this.letterGroup = new THREE.Group();
      this.rtScene.add(this.letterGroup);
      // const bgMap = this.envMaps[(rand + 1) % this.envMaps.length];
      // this.rtScene.background = bgMap;

      this.setRandomScene();

      this.renderer = this.$refs.quad.rendererComponent;
      // this.renderer.renderer.autoClearDepth = false;
      // console.log(this.renderer.renderer);
      this.$refs.quad.material.map = this.renderTarget.texture;
      this.$refs.quad.material.opacity = 0;
      this.$refs.quad.material.transparent = 0;
      // this.$refs.quad.material.depthWrite = false;
      this.$refs.quad.material.depthTest = true;
      this.$refs.quad.material.needsUpdate = true;
      // this.renderer.renderer.clearDepth();

      // this.interval = setInterval(() => {
      //   this.setRandomScene();
      // }, 3000);

      this.onRender = () => {
        this.letterGroup.rotation.x += 0.01 * this.speed * this.dir;
        this.letterGroup.rotation.z += 0.01 * this.speed * this.dir;

        this.renderer.renderer.setRenderTarget(this.renderTarget);
        this.renderer.renderer.render(this.rtScene, this.rtCamera);
        this.renderer.renderer.setRenderTarget(null);
        // this.isLastIndex && this.renderer.renderer.setRenderTarget(null);
      };
      this.renderer.onBeforeRender(this.onRender);
    },
    beforeUnmount() {
      this.onRender();
      this.renderer.offBeforeRender(this.onRender);
      destroyScene(this.rtScene);
      this.rtScene = null;
      this.renderTarget.dispose();
      this.renderTarget = null;
      this.$refs.quad.mesh.material.dispose();
    },
    methods : {
      setRandomScene() {
        const rand = Math.floor(this.random.value() * this.envMaps.maps.length);
        const index = rand % this.envMaps.maps.length;
        const bg = this.envMaps.maps[index];
        const envMap = this.envMaps.envMaps[index];
        // const envMap = this.envMaps.maps[rand % this.envMaps.maps.length];
        // const linearGrad = this.envMaps.linearGradients[rand % this.envMaps.linearGradients.length];
        this.rtScene.background = bg;

        if (!this.material) {
          this.material = new THREE.MeshStandardMaterial();
        }
        this.material.setValues({
          envMap,
          metalness : this.random.range(0.6, 0.75), //rand
          roughness : this.random.range(0.7, 0.8), //rand
          envMapIntensity : this.random.range(3, 3) //rand
        });
        this.material.needsUpdate = true;

        const geometry = this.random.pick(this.letterGeometries);
        if (!this.pointLight) {
          this.pointLight = new THREE.PointLight('#ffffff', 0.5);
          this.rtScene.add(this.pointLight);
        }
        this.pointLight.position.set(this.random.range(1, 2) * this.random.sign(), this.random.range(2, 3), this.random.range(2, 2));
        if (this.el) {
          this.letterGroup.remove(this.el);
        }
        this.el = new THREE.Mesh(geometry, this.material);
        this.el.scale.setScalar(this.random.range(2, 4));
        this.letterGroup.add(this.el);

        this.dir = this.random.sign();
        this.speed = this.random.range(0.001, 0.5);
      },
      setRenderTargetSize() {
        const rtWidth = this.windowWidth * this.sizeY * window.devicePixelRatio;
        const rtHeight = this.windowHeight * this.sizeX * window.devicePixelRatio;
        // const rtHeight = this.windowHeight * this.sizeY;

        this.renderTarget.setSize(Math.floor(rtWidth), Math.floor(rtHeight));
        if (this.rtCamera) {
          const aspect = rtHeight / rtWidth;
          this.rtCamera.aspect = aspect;
          this.rtCamera.position.z = 1.5 / aspect;
          this.rtCamera.updateProjectionMatrix();
        }
      }
    }
  };
</script>

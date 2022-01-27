<template>
  <Group
    ref="group"
    :scale="{ x : sizeX, y : sizeY, z : 1 }"
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
  import diamondCell from '@mixins/diamond-cell';
  
  export default {
    inject : ['random'],
    mixins : [diamondCell],
    props : {
      sizeX : {
        type : Number,
        default : 1
      },
      sizeY : {
        type : Number,
        default : 1
      },
      depth : {
        type : Number,
        default : 1
      },
      index : {
        type : Number,
        default : 1
      },
      transitionOut : {
        type : Boolean,
        default : false
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
      },
      letterIndex : {
        type : Number,
        required : true
      }
    },
    data() {
      return {
        cellStyle : {
          background : '#000'
        },
        targetY : this.position.y
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
      this.renderTarget = new THREE.WebGLRenderTarget({
        minFilter : THREE.LinearFilter,
        magFilter : THREE.NearestFilter,
        generateMipmaps : true,
        format : THREE.RGBFormat
        // depthBuffer : false
      });
      this.$refs.quad.position.x = this.position.x;
      this.initPosition = { ...this.position };
      this.scale = 0;
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
      this.renderer.renderer.autoClearDepth = true;
      // console.log(this.renderer.renderer);
      this.$refs.quad.material.map = this.renderTarget.texture;
      this.$refs.quad.material.transparent = 0;
      this.$refs.quad.material.needsUpdate = true;
      
      this.letterBump = 0;
      this.letterBumpLerped = 0;
      this.bumpRotate = new THREE.Vector2();
      this.bumpRotateLerped = new THREE.Vector2();
      this.rtCamera.position.z = (this.letterBumpLerped + 1.5) / rtAspect;
      this.$refs.quad.mesh.addEventListener('bump', this.bumpLetter);

      this.onRender = () => {
        this.mouseInteraction();

        if (this.transitionOut) {
          this.$refs.quad.material.opacity -= 0.01;
          this.$refs.quad.material.needsUpdate = true;
        }
        else {
          this.scale += (1 - this.scale) * 0.02;
          this.$refs.quad.mesh.scale.x = this.scale;
          this.$refs.quad.mesh.scale.y = this.scale;
          this.$refs.quad.mesh.scale.z = this.scale;
        }
        this.targetY = this.initPosition.y + (window.scrollY / this.windowHeight * this.depth / 4);
        this.$refs.quad.position.y += (this.targetY - this.$refs.quad.position.y) * 0.8;

        this.renderer.renderer.setRenderTarget(this.renderTarget);
        this.renderer.renderer.render(this.rtScene, this.rtCamera);
        this.renderer.renderer.setRenderTarget(null);
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
        const rand = Math.floor(Math.random() * this.envMaps.maps.length);
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
        const rtWidth = this.windowWidth * this.sizeX * window.devicePixelRatio;
        const rtHeight = this.windowHeight * this.sizeY * window.devicePixelRatio;
        // const rtHeight = this.windowHeight * this.sizeY;
        this.renderTarget.setSize(Math.floor(rtWidth), Math.floor(rtHeight));
        if (this.rtCamera) {
          const aspect = rtHeight / rtWidth;
          this.rtCamera.aspect = aspect;
          this.rtCamera.position.z = 1.5 / aspect;
          this.rtCamera.updateProjectionMatrix();
        }
      },
      bumpLetter(e) {
        this.bumpRotate.copy(e.uv);
        this.bumpRotate.rotateAround(new THREE.Vector2(0.5, 0.5), Math.PI / 4);
        this.bumpRotate.multiplyScalar(2);
        this.bumpRotate.addScalar(-1);

        this.letterBump = 1;
      }
    }
  };
</script>

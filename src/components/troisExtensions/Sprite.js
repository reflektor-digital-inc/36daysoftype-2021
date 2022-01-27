import { defineComponent } from 'vue';
import { Points, BufferGeometry } from 'three';
import { pointerProps } from 'troisjs/src/meshes/Mesh';
import Object3D from 'troisjs/src/core/Object3D';
// import { bindProp } from 'troisjs/src/tools';

export default defineComponent({
  extends : Object3D,
  props : {
    ...pointerProps
  },
  provide() {
    return {
      mesh : this
    };
  },
  beforeMount() {
    if (!this.$slots.default) {
      console.error('Missing Geometry');
    }
  },
  mounted() {
    this.initMesh();
  },
  unmounted() {
    if (this.mesh) {
      this.three.removeIntersectObject(this.mesh);
    }
  },
  methods : {
    initMesh() {
      this.geometry = new BufferGeometry();

      // this.material = new PointsMaterial({ size : 1, sizeAttenuation : true, alphaTest : 0.5, transparent : true });

      this.mesh = new Points(this.geometry, this.material);

      this.mesh.component = this;

      if (this.onPointerEnter ||
        this.onPointerOver ||
        this.onPointerMove ||
        this.onPointerLeave ||
        this.onPointerDown ||
        this.onPointerUp ||
        this.onClick) {
        this.three.addIntersectObject(this.mesh);
      }

      this.initObject3D(this.mesh);
    },
    setMaterial(material) {
      this.material = material;
      this.material.instancingColor = true;
      if (this.mesh) this.mesh.material = material;
    }
  },
  __hmrId : 'Sprite'
});

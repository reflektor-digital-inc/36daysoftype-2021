import { defineComponent } from 'vue';
import { PointsMaterial } from 'three';
import { bindProps, propsValues } from 'troisjs/src/tools';
import Material, { wireframeProps } from 'troisjs/src/materials/Material';

export default defineComponent({
  extends : Material,
  methods : {
    createMaterial() {
      this.material = new PointsMaterial(propsValues(this.$props));
    },
    addWatchers() {
      bindProps(this, Object.keys(wireframeProps), this.material);
    }
  },
  __hmrId : 'PointsMaterial'
});

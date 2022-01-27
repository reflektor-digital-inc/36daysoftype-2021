<template>
  <Group>
    <GLTFModel
      ref="model"
      :src="modelUrl"
      :position="position"
      @load="onModelLoaded"
    />
    <slot />
  </Group>
</template>

<script>
  import _get from 'lodash/get';
  import { materialTweaks } from '@utils/tweakpane-utils';
  import { camelCase, capitalCase } from 'change-case';
  import { has } from 'lodash';

  // https://vitejs.dev/guide/features.html#glob-import
  const EXTRAS_PATHS = import.meta.globEager('/src/assets/gltf/extras/*.glb');
  const LETTER_PATHS = import.meta.globEager('/src/assets/gltf/letters/*.glb');
  const LETTER_SUB_PATHS = import.meta.globEager('/src/assets/gltf/letters/*/*.glb');

  export default {
    inject : ['tweakFolder', 'random', 'loadingPromises'],
    emits : ['load'],
    props : {
      model : {
        type : String,
        default : '/src/assets/gltf/extras/DDrip.glb',
        validator(value) {
          return Object.keys({ ...LETTER_SUB_PATHS, ...EXTRAS_PATHS, ...LETTER_PATHS }).indexOf(value) !== -1;
        }
      },
      position : {
        type : Object,
        default : () => ({ x : 0, y : 0.2, z : 0 })
      },
      title : {
        type : String,
        required : true
      },
      castShadow : {
        type : Boolean,
        default : false
      },
      receiveShadow : {
        type : Boolean,
        default : false
      }
    },
    computed : {
      modelUrl() {
        const paths = { ...LETTER_SUB_PATHS, ...EXTRAS_PATHS, ...LETTER_PATHS };
        return paths[this.model].default;
      }
    },
    created() {
      this.resolve = () => {};
      const promise = new Promise((res) => {
        this.resolve = res;
      });
      if (this.loadingPromises) {
        this.loadingPromises.push(promise);
      }
    },
    provide() {
      return {
        // Hijack troisjs material behavior by providing children with
        // function with name it is already expecting
        mesh : {
          setMaterial : (mat) => {
            this.material = mat;
            const slots = this.$slots.default();
            slots.forEach((slot) => {
              if (!slot.props) return;

              const camelProps = {};
              Object.keys(slot.props).map((key) => {
                if (has(this.material, key) && key !== 'uniforms') {
                  camelProps[camelCase(key)] = slot.props[key];
                }
                else {
                  const match = key.match(/\b(?!uniform|u\b)\w+/g, key);
                  if (!match) return;

                  const name = camelCase(match.join(' '));

                  if (has(this.material, `uniforms.${name}`)) {
                    const uniform = this.material.uniforms[name];

                    if (uniform.value.set) {
                      uniform.value.set(slot.props[key]);
                    }
                    else {
                      uniform.value = slot.props[key];
                    }
                  }
                }
              });
              this.material.setValues(camelProps);
            });
            if (this.values) {
              this.material.setValues(this.values);
            }
            if (this.modelLoaded) {
              this.setModelMaterials();
            }
          }
        }
      };
    },
    beforeUnmount() {
      this.folder && this.folder.dispose();
    },
    methods : {
      onModelLoaded(modelRoot) {
        this.modelRoot = modelRoot;
        this.children = _get(modelRoot, 'children');
        this.children.forEach((child, index) => {
          child.origScale = child.scale.clone();
          child.origPosition = child.position.clone();
          child.origRotation = child.rotation.clone();
          if (this.random) {
            child.random = this.random.value();
          }
          child.dir = Math.sign(index % 2 - 0.5);
          child.castShadow = this.castShadow;
          child.receiveShadow = this.receiveShadow;
        });
        this.setModelMaterials();

        this.$emit('load', this.children, this.modelRoot);

        this.resolve();

        this.modelLoaded = true;
      },
      setModelMaterials() {
        if (!this.material) return;

        this.children.forEach((child) => {
          child.material = this.material;
        });

        this.folder && this.folder.dispose();

        this.folder = materialTweaks(this.tweakFolder, this.material, { title : capitalCase(`${this.title} Material`) });
      },
      updateModelMaterial(newValues) {
        this.values = newValues;

        if (!this.material) return;

        this.material.setValues(newValues);
      }
    }
  };
</script>

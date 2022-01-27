import mitt from 'mitt';
import { PointLightHelper, Color, Vector3, Vector2 } from 'three';
import { paramCase } from 'change-case';

const Updater = class extends mitt {
  constructor() {
    super();
    this.changed = '';
    this.data = {};
    this.update = () => {
      this.changed = Object.values(this.data).join('\n');
      this.emit('changed');
    };
    this.once = (type, handler) => {
      const wrappedHandler = (evt) => {
        handler(evt);
        this.off(type, wrappedHandler);
      };
      this.on(type, wrappedHandler);
    };
  }
};

export const addPositionInputs = (tweak, position, { useZ = true }) => {
  tweak.addInput(position, 'x', { min : -30, max : 30, step : 0.1 });
  tweak.addInput(position, 'y', { min : -30, max : 30, step : 0.1 });
  if (useZ) {
    tweak.addInput(position, 'z', { min : -30, max : 30, step : 0.1 });
  }
  tweak.addInput();
};

export const addColor = (tweak, object, colorParamString, inputOptions = {}, dataToUpdate = null) => {
  if (!object[colorParamString]) return;

  const hexString = object[colorParamString].getHexString();
  const label = inputOptions.label ? inputOptions.label : colorParamString;
  const tempVal = { color : `#${hexString}` };

  tweak.addInput(tempVal, 'color', inputOptions).on('change', (e) => {
    const obj = object.value ? object.value : object[label];
    obj.set(e.value);
    if (dataToUpdate) {
      const paramString = inputOptions.uniform ? `u-${label}` : label;
      dataToUpdate.data[label] = `${paramString}="${e.value}"`;
      dataToUpdate.update();
    }
  });
};

export const addInput = (tweak, object, inputParamString, inputOptions, dataToUpdate = null) => {
  try {
    if (!{}.hasOwnProperty.call(object, inputParamString)) return;

    if (!dataToUpdate) {
      tweak.addInput(object, inputParamString, inputOptions);
    }
    else {
      tweak.addInput(object, inputParamString, inputOptions).on('change', (val) => {
        let valString;
        if (val.value instanceof Vector2 || val.value instanceof Vector3) {
          const arr = Object.keys({ ...val.value }).map(key => `${key} : ${val.value[key].toPrecision(2)}`);
          valString = '{ ' + arr.join(', ') + ' }';
        }
        else {
          valString = val.value.toPrecision(2);
        }
        const label = inputOptions.label || inputParamString;
        const paramString = inputOptions.uniform ? `u-${paramCase(label)}` : label;
        dataToUpdate.data[paramString] = `:${paramString}="${valString}"`;
        dataToUpdate.update();
      });
    }
  }
  catch (error) {
    console.error(error.message);
  }
};

export const addLightFolder = (tweak, light, { title, position = true }) => {
  const folder = tweak.addFolder({ title });
  const updatedVals = new Updater();
  updatedVals.once('changed', () => {
    folder.addMonitor(updatedVals, 'changed', { multiline : true });
  });

  addColor(folder, light, 'color', {}, updatedVals);
  if (position) {
    addInput(folder, light, 'position', {
      x : { min : -30, max : 30 },
      y : { min : -30, max : 30 },
      z : { min : -30, max : 30 }
    }, updatedVals);
  }
  addInput(folder, light, 'intensity', { min : 0, max : 2, step : 0.1 }, updatedVals);
  folder.addButton({ title : 'Toggle Helper' }).on('click', () => {
    if (light.helper) {
      light.remove(light.helper);
      light.helper.dispose();
      light.helper = null;
    }
    else {
      const helper = new PointLightHelper(light, 1);
      light.helper = helper;
      light.add(helper);
    }
  });

  // if (light.decay) {
  //   folder.addInput(light, 'decay', { min : 0, max : 5, step : 0.1 });
  // }
  return folder;
};

export const materialTweaks = (tweak, material, { title }) => {
  const folder = tweak.addFolder({ title });
  const updatedVals = new Updater();
  updatedVals.once('changed', () => {
    folder.addMonitor(updatedVals, 'changed', { multiline : true });
  });

  addColor(folder, material, 'color', {}, updatedVals);
  addColor(folder, material, 'emissive', { label : 'emissive' }, updatedVals);
  addInput(folder, material, 'transparent', updatedVals);
  addInput(folder, material, 'opacity', updatedVals);
  addInput(folder, material, 'flatShading', updatedVals);
  addInput(folder, material, 'reflectivity', { min : 0, max : 1 }, updatedVals);
  addInput(folder, material, 'metalness', { min : 0, max : 1 }, updatedVals);
  addInput(folder, material, 'roughness', { min : 0, max : 1 }, updatedVals);
  addColor(folder, material, 'sheen', {}, updatedVals);
  addInput(folder, material, 'clearcoat', { min : 0, max : 1 }, updatedVals);
  addInput(folder, material, 'clearcoatRoughness', { min : 0, max : 1 }, updatedVals);
  addInput(folder, material, 'envMapIntensity', { min : 0, max : 20 }, updatedVals);
  addInput(folder, material, 'ior', { min : 1.0, max : 2.333 }, updatedVals);
  addInput(folder, material, 'transmission', { min : 0, max : 1 }, updatedVals);
  addInput(folder, material, 'refractionRatio', { min : 0, max : 1 }, updatedVals);

  if (material.uniforms) {
    Object.keys(material.uniforms).forEach((key) => {
      const uniform = material.uniforms[key];

      if (material.uniforms[key].value instanceof Color) {
        addColor(folder, uniform, 'value', { label : key, uniform : true }, updatedVals);
      }
      else if (
        typeof material.uniforms[key].value === 'number' ||
        material.uniforms[key].value instanceof Vector3 ||
        material.uniforms[key].value instanceof Vector2
      ) {
        addInput(folder, uniform, 'value', { label : key, uniform : true }, updatedVals);
      }
    });
  }

  return folder;
};

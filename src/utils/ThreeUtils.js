import { flattenDeep } from 'lodash';
import { Vector3 } from 'three';

export function getSceneChildren(scene) {
  const getChildren = (item) => {
    if (item.type === 'Group' || Array.isArray(item)) {
      if (item.children.length === 1) {
        return item.children[0];
      }
      return item.children.map(next => getChildren(next));
    }
    else if (item.type === 'door') {
      return [item, ...item.children];
    }
    return item;
  };

  return flattenDeep(scene.children.map((item) => {
    if (item.children.length) {
      return getChildren(item);
    }
    return item;
  }));
}

export function allProgress(promises, progressCallback) {
  let count = 0;
  progressCallback(0);
  for (const promise of promises) {
    promise.then(() => {
      count++;
      progressCallback((count * 100) / promises.length);
    });
  }
  return Promise.all(promises);
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () => {
      reject(new Error(`Failed to load image's URL: ${url}`));
    });
    img.src = url;
  });
}

export function jsonToVector3(jsonVector) {
  return new Vector3(
    jsonVector.x || 0,
    jsonVector.y || 0,
    jsonVector.z || 0
  );
}

export function getWorldPosition(object) {
  const lookAtVector = new Vector3();
  if (object.parent) {
    object.parent.updateMatrixWorld();
  }
  object.getWorldPosition(lookAtVector);
  return lookAtVector;
}

export function destroyScene(scene) {
  while (scene.children.length > 0) {
    destroyObject(scene.children[0]);
    scene.remove(scene.children[0]);
  }
}

export function destroyObject(object) {
  const obj = object;
  obj && obj.traverse((child) => {
    if (child.material) {
      if (child.material.uniforms) {
        child.material.uniforms.map && child.material.uniforms.map.value.dispose();
      }
      Object.keys(child.material).forEach((prop) => {
        if (!child.material[prop])
          return;
        if (child.material[prop] !== null && typeof child.material[prop].dispose === 'function')
          child.material[prop].dispose();
      });
      child.material.dispose();
    }
    child.geometry && child.geometry.dispose();
  });
  obj.clear && obj.clear();
}

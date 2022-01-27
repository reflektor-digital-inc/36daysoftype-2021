
import { geometryComponent } from 'troisjs/src/geometries/Geometry';
import { TetrahedronGeometry } from 'three';
import { addBarycentricCoordinates } from '@utils/barycentric-utils';

export const props = {
  radius : { type : Number, default : 1 },
  detail : { type : Number, default : 0 }
};

export function createGeometry(comp) {
  const geometry = new TetrahedronGeometry(comp.radius, comp.detail);
  const unindexed = geometry.toNonIndexed();
  addBarycentricCoordinates(unindexed, true);
  return unindexed;
}

export default geometryComponent('BarycentricTetrahedronGeometry', props, createGeometry);

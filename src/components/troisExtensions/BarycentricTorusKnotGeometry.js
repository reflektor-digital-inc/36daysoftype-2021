
import { geometryComponent } from 'troisjs/src/geometries/Geometry';
import { TorusKnotGeometry } from 'three';
import { addBarycentricCoordinates } from '@utils/barycentric-utils';

export const props = {
  radius : { type : Number, default : 1 },
  tube : { type : Number, default : 0.4 },
  tubularSegments : { type : Number, default : 64 },
  radialSegments : { type : Number, default : 8 },
  p : { type : Number, default : 2 },
  q : { type : Number, default : 3 }
};

export function createGeometry(comp) {
  const geometry = new TorusKnotGeometry(comp.radius, comp.tube, comp.tubularSegments, comp.radialSegments, comp.p, comp.q);
  const unindexed = geometry.toNonIndexed();
  addBarycentricCoordinates(unindexed, true);
  return unindexed;
}

export default geometryComponent('BarycentricTorusKnotGeometry', props, createGeometry);

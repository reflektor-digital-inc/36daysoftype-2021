/* eslint-disable function-paren-newline */
import { BufferAttribute, Vector3 } from 'three';

function addBarycentricCoordinates(bufferGeometry, removeEdge = false) {
  const attrib = bufferGeometry.getIndex() || bufferGeometry.getAttribute('position');
  const count = attrib.count / 3;
  const barycentric = [];

  // for each triangle in the geometry, add the barycentric coordinates
  for (let i = 0; i < count; i++) {
    const even = i % 2 === 0;
    const Q = removeEdge ? 1 : 0;
    if (even) {
      barycentric.push(
        0, 0, 1,
        0, 1, 0,
        1, 0, Q
      );
    }
    else {
      barycentric.push(
        0, 1, 0,
        0, 0, 1,
        1, 0, Q
      );
    }
  }

  // add the attribute to the geometry
  const array = new Float32Array(barycentric);
  const attribute = new BufferAttribute(array, 3);
  bufferGeometry.setAttribute('center', attribute);
}

function setupAttributes(geometry) {
  const vectors = [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1)
  ];

  const position = geometry.attributes.position;
  const centers = new Float32Array(position.count * 3);

  for (let i = 0, l = position.count; i < l; i ++) {
    vectors[ i % 3 ].toArray(centers, i * 3);
  }

  geometry.setAttribute('center', new BufferAttribute(centers, 3));
}

export {
  addBarycentricCoordinates, setupAttributes
};

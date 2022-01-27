
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalMatrix * normalize(normal);

  vec4 pos = modelViewMatrix * vec4(position, 1.0);
  vPosition = pos.xyz;

  gl_Position = projectionMatrix * pos;
}

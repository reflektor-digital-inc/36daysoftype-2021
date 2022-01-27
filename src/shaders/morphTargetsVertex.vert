#include <morphtarget_pars_vertex>

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vMorphInfluence;

void main()	{
	#include <begin_vertex>
	#include <beginnormal_vertex>
	#include <morphtarget_vertex>
	#include <morphnormal_vertex>
  vMorphInfluence = morphTargetInfluences[0];

  vUv = uv;
  vNormal = normalMatrix * normalize(objectNormal);

  vec4 pos = modelViewMatrix * vec4(transformed, 1.0);
  vPosition = pos.xyz;

  gl_Position = projectionMatrix * pos;
}

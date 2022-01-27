/**
 * Tv Skew shader
 */

const TvShader = {

  uniforms : {
  
    tDiffuse : { value : null },
    pixelSize : { value : 1 },
    time : { value : 0 }
  },
  
  vertexShader : /* glsl */`
  
          varying highp vec2 vUv;
  
              void main() {
  
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  
          }`,
  
  fragmentShader : /* glsl */`
      uniform sampler2D tDiffuse;
      uniform float time;
      varying vec2 vUv;
  
      void main() {
        vec2 uv = vUv;
        float dd = distance(uv, vec2(.5,.5))/8.;
        vec2 nv = vec2(uv.x + (uv.x*4.-2.)*dd, uv.y + (uv.y*4.-2.)*dd);
        if (nv.x <= 0. || nv.y <= 0. || nv.x >= 1. || nv.y >= 1.) {
          gl_FragColor = vec4(0);
        } else {
          gl_FragColor = texture(tDiffuse, nv);
        }
  
        if (mod(nv.y*60.+time*4., 2.) <= 0.30) {
          gl_FragColor *= 0.9;
        }
      }`
  
};
  
export { TvShader };
  

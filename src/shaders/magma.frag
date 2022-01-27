varying vec2 vUv;
varying float noise;
varying float displacement;
uniform sampler2D tExplosion;


float random( vec3 scale, float seed ){
  return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
}


void main() {
  // colour is RGBA: u, v, 0, 1
//  vec3 color = vec3( vUv * ( 1. - 2. * noise ), 0.0 );
  float r = .01 * random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );

  vec2 tPos = vec2( noise * 2.0 + displacement, 20.0 * noise * r );
  vec4 color = texture2D( tExplosion, tPos );

  gl_FragColor = vec4( color.bg, color.r * 2.0, 1.0 );
//  gl_FragColor = vec4( color.r * 2.0, color.gb, 1.0 );
}

uniform sampler2D tOld;
uniform sampler2D tNew;
uniform float time;
uniform float intensity;
varying vec2 vUv;

vec4 when_gt( vec4 x, float y ) {
  return max( sign( x - y ), 0.0 );
}

mat2 scale(vec2 _scale){
    return mat2(_scale.x,0.0,
                0.0,_scale.y);
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

vec3 hueShift(vec3 color, float hue) {
    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(hue);
    return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

void main() {
  vec2 oldUv = vUv;
  oldUv -= 0.5;
  oldUv *= scale(vec2(0.99));
  oldUv *= rotate2d(sin(time) * 0.01);
  oldUv += 0.5;

  vec4 texelOld = texture2D( tOld, oldUv );
  texelOld.rgb = hueShift(texelOld.rgb, sin(time) * 0.2);
  vec4 texelNew = texture2D( tNew, vUv );
  texelOld *= 0.98 * when_gt( texelOld, 0.1 );
  gl_FragColor = mix(texelNew, max(texelNew, texelOld), intensity);
}

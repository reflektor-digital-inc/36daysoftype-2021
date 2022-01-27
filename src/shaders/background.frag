uniform bool colorEnabled;
uniform vec3 color;

uniform sampler2D gradientTexture;
uniform vec2 resolution;

void main () {
  vec2 screenspaceUv = gl_FragCoord.xy/resolution;
  vec3 finalColor = texture2D(gradientTexture, screenspaceUv).rgb;
  if (colorEnabled) {
    finalColor = color;
  }

  gl_FragColor = vec4(finalColor, 1.0);
}

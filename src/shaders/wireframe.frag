uniform float widthFactor;
uniform vec3 strokeColor;
uniform float strokeAlpha;
uniform vec3 sdfOffset;

uniform bool dashEnabled;
uniform float dashRepeats;
uniform float dashLength;

uniform bool squeeze;
uniform float squeezeMin;
uniform float squeezeMax;

varying vec3 vCenter;

varying vec2 vUv;

#define SMOOTH(r,R) (1.0-smoothstep(R-1.0,R+1.0, r))

float aastep (float threshold, float dist) {
    float afwidth = fwidth(dist) * 0.8;
    return smoothstep(threshold - afwidth, threshold + afwidth, dist);
}

float computeScreenSpaceWireframe (vec3 barycentric, float lineWidth) {
  vec3 dist = fwidth(barycentric);
  vec3 smoothed = smoothstep(dist * ((lineWidth * 0.5) - 0.5), dist * ((lineWidth * 0.5) + 0.5), barycentric);
  return 1.0 - min(min(smoothed.x, smoothed.y), smoothed.z);
}

vec4 getStyledWireframe (vec3 barycentric) {
    // this will be our signed distance for the wireframe edge
    float d = min(min(barycentric.x + sdfOffset.x, barycentric.y + sdfOffset.y), barycentric.z + sdfOffset.z);

    float computedWidth = widthFactor;

    float positionAlong = max(barycentric.x, barycentric.y);
    if (barycentric.y < barycentric.x && barycentric.y < barycentric.z) {
        positionAlong = 1.0 - positionAlong;
    }

    if (squeeze) {
        computedWidth *= mix(squeezeMin, squeezeMax, (1.0 - sin(positionAlong * 3.1415926535)));
    }

    // if we should create a dash pattern
    if (dashEnabled) {
        // here we offset the stroke position depending on whether it
        // should overlap or not
        float offset = 1.0 / dashRepeats * dashLength / 2.0;

        // create the repeating dash pattern
        float pattern = fract((positionAlong + offset) * dashRepeats);
        computedWidth *= 1.0 - aastep(dashLength, pattern);
    }

    // compute the anti-aliased stroke edge
    float edge = 1.0 - aastep(computedWidth, d);

    // now compute the final color of the mesh
    vec4 outColor = vec4(0.0);

    outColor = vec4(strokeColor, edge);

    return outColor;
}

void main () {
    vec4 color = getStyledWireframe(vCenter);
    if (color.a < 0.01) discard;

    gl_FragColor = color;
}

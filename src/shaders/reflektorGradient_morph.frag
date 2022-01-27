precision highp float;
precision highp int;

uniform sampler2D gradient;

uniform float fresnelStart;
uniform float fresnelEnd;
uniform float fresnelIntensity;
uniform float fade;
uniform float time;
uniform vec3 baseColor;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vMorphInfluence;

vec3 hueShift(vec3 color, float hue) {
    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(hue);
    return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

void main() {
    vec3 normal = vNormal;
    vec3 eye = normalize(-vPosition.xyz);
    float rim = smoothstep(fresnelStart, fresnelEnd, 1.0 - dot(normal, eye));

    vec3 normalColor = hueShift(normal, time + (vMorphInfluence));
    vec3 color = clamp(rim, 0.0, 1.0) * fresnelIntensity * normalColor;
    float grayscale = dot(color, vec3(0.299, 0.587, 0.114));

    vec3 sampledColor = texture2D(gradient, vec2(grayscale, 0.0)).rgb;
    vec3 fadeColor = mix(baseColor, sampledColor, fade);

    vec3 finalColor = hueShift(fadeColor, 8.0 - (vMorphInfluence * 8.0));

    gl_FragColor = vec4( finalColor, 1.0 );
}

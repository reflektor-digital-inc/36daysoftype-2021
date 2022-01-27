

precision highp float;


uniform float time;
uniform bool mouseDown;
uniform float letterHeightDisplacement;
uniform float letterMarchDistance;
uniform vec4 resolution;
uniform float fontPxRange;
uniform vec2 glyphSize;
uniform sampler2D glyphTexture;
uniform sampler2D gradient;
uniform sampler2D background;

varying vec2 vUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

float sdCylinder(vec3 p, vec3 a, vec3 b, float r)
{
    vec3  ba = b - a;
    vec3  pa = p - a;
    float baba = dot(ba,ba);
    float paba = dot(pa,ba);
    float x = length(pa*baba-ba*paba) - r*baba;
    float y = abs(paba-baba*0.5)-baba*0.5;
    float x2 = x*x;
    float y2 = y*y*baba;

    float d = (max(x,y)<0.0)?-min(x2,y2):(((x>0.0)?x2:0.0)+((y>0.0)?y2:0.0));

    return sign(d)*sqrt(abs(d))/baba;
}

float sdBox(vec3 p, vec3 radius)
{
  vec3 dist = abs(p) - radius;
  return min(max(dist.x, max(dist.y, dist.z)), 0.0) + length(max(dist, 0.0));
}

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

float screenPxRange(vec2 uv) {
    vec2 unitRange = vec2(fontPxRange)/glyphSize;
    vec2 screenTexSize = vec2(1.0)/fwidth(uv);
    return max(dot(unitRange, screenTexSize), 1.0);
}

float extrudeDist (float d, float w, float y)
{
    return length(vec2(max(d, 0.), y - clamp(y, -w, w)))
        + min(max(d, abs(y)-w), 0.);
}

// get distance field of MSDF Texture
float sdText(vec3 pos) {
  const int nstep = 3;
  const float w[3] = float[3](1., 2., 1.);

  vec2  dsum = vec2(0.);
  float wsum = 0.;

  for (int i=0; i<nstep; ++i) {
      float ui = float(i)/float(nstep-1);

      for (int j=0; j<nstep; ++j) {

          float uj = float(j)/float(nstep-1);

          vec2 delta = (1.0 + 2.0 * vec2(ui,uj))/128.;
          vec3 grad_dist = 1.0 - texture2D(glyphTexture, pos.xy + vec2(0.5, 0.5) - delta).xyz;

          vec2 pdelta = delta * 1.;

          float dline = grad_dist.z + dot(grad_dist.xy, pdelta);

          float wij = w[i]*w[j];

          dsum += wij * vec2(dline, grad_dist.z);
          wsum += wij;
      }
  }

  vec2 sg = dsum / wsum;
  float dist = mix(sg.y, sg.x, 0.5);
  dist -= 0.5;

  vec4 msd = 1.0 - texture2D(glyphTexture, pos.xy + vec2(0.5, 0.5));
  float sd = median(msd.r, msd.g, msd.b) - 0.5;

  return max(sdBox(pos - vec3(0.0, 0.0, 0.2), vec3(1., 1., .3)), dist);
}

// smooth min
float smin( float a, float b, float k )
{
    float h = max( k-abs(a-b), 0.0 )/k;
    return min( a, b ) - h*h*h*k*(1.0/6.0);
}

float sdPlane( vec3 p )
{
	return p.z;
}

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

float scene( in vec3 pos )
{
  float noise = snoise2(pos.xy * 0.9 + vec2(time * 0.05, time * 0.05)) * 0.12;

  float plane = sdBox(pos - vec3(0.0, 0.0, 0.3 + noise), vec3(5.0, 5.0, 0.2));

  vec3 rotX = rotate(pos, vec3(0.5, 0.0, 1.0), 0.7);
  vec3 rotZ = rotate(rotX, vec3(1.0, 0.0, 0.0), -0.6 + sin(time) * 0.1);
  float geo = sdText(vec3(rotZ.x, rotZ.y, rotZ.z - letterHeightDisplacement));

  return smin(plane, geo, letterMarchDistance);
}

vec3 erot(vec3 p, vec3 ax, float ro) {
    return mix(dot(ax,p)*ax, p, cos(ro)) + sin(ro)*cross(ax,p);
}

vec3 norm(vec3 p) {
    mat3 k = mat3(p,p,p) - mat3(0.01);
    return normalize(scene(p) - vec3(scene(k[0]), scene(k[1]), scene(k[2])));
}

float lighting(vec3 normal) {
  return pow(length(sin(normal*2.)*.5+.5)/sqrt(3.), 2.);
}

void main() {
    vec2 uv = (vUv - vec2(0.5)) * resolution.zw * 2.0;
    vec3 cam = normalize(vec3(1,uv));
    vec3 init = vec3(-.75,0,0);

    // float zrot = -3.14 / 2. + sin(time) * 0.1;
    float zrot = -3.14 / 2.0;
    float yrot = -2.25;
    cam = erot(cam, vec3(0,1,0), yrot);
    init = erot(init, vec3(0,1,0), yrot);
    cam = erot(cam, vec3(0,0,1), zrot);
    init = erot(init, vec3(0,0,1), zrot);

    vec3 p = init;
    bool hit = false;
    for (int i = 0; i < 256 && !hit; i++) {
        float dist = scene(p);
        hit = dist*dist < 0.00001;
        p += cam*dist;
        if (distance(p, init) > 10.) break;
    }

    vec3 n = norm(p);

    vec3 eye = normalize(-p);
    float rim = smoothstep(0.55, 1.4, 1.0 - dot(n, eye));

    float shade = lighting(n);

    vec3 sampledColor = texture2D(gradient, vec2(shade, 0.0)).rgb;
    vec4 grad = vec4(sampledColor, 0.0);

    vec4 final = mix(vec4(vec3(0.1), 1.0), grad, rim);
    // vec4 final = grad;

    vec4 bg = texture2D(background, vUv);

    gl_FragColor = hit ? final : bg;
}



precision highp float;


uniform float time;
uniform vec2 mousePos;
uniform vec4 resolution;
uniform float fontPxRange;
uniform vec2 glyphSize;
uniform sampler2D glyphTexture;
uniform sampler2D gradient;
uniform sampler2D background;

varying vec2 vUv;

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

float screenPxRange() {
    vec2 unitRange = vec2(fontPxRange)/glyphSize;
    vec2 screenTexSize = vec2(1.0)/fwidth(vUv);
    return max(dot(unitRange, screenTexSize), 1.0);
}

float extrudeDist (float d, float w, float y)
{
    return length(vec2(max(d, 0.), y - clamp(y, -w, w)))
        + min(max(d, abs(y)-w), 0.);
}

// get distance field of MSDF Texture
float sdText(vec3 pos) {
  float boundValue = 0.4;
  float f = boundValue + max(abs(pos.x),abs(pos.y)) - .5;
  if ( f < boundValue) {
    vec4 msd = 1.0 - texture2D(glyphTexture, pos.xy + vec2(0.5, 0.5));
    float sd = median(msd.r, msd.g, msd.b) - 0.5;
    f = min(boundValue, sd);
  }

  return max(sdBox(pos, vec3(1., 1., 0.1)), f);
}

// smooth min
float smin( float a, float b, float k )
{
    float h = max( k-abs(a-b), 0.0 )/k;
    return min( a, b ) - h*h*h*k*(1.0/6.0);
}


float scene( in vec3 pos )
{
  // repeat pos infinitely
  vec3 d = vec3(2.2, 2.2, 2.2);
  vec3 q = mod(pos + 0.5 * d, d) - 0.5 * d;
  float geo = sdText(q);
  
  // float sphere = length(q + vec3(sin(time) * 0.3, cos(time) * 0.3, 0.3 + cos(time) * 0.3)) - 0.1;
  float sphere = length(q + vec3(mousePos.x, mousePos.y, 0.3 + cos(time) * 0.3)) - 0.1;
  return smin(sphere, geo, 0.8);
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
    vec2 uv = (vUv - vec2(0.5)) * resolution.zw;
    vec3 cam = normalize(vec3(1,uv));
    vec3 init = vec3(-1.5,0,0);

    float zrot = -3.14 / 2. + sin(time) * 0.1;
    float yrot = sin(time * 0.1) * 0.1 + -1.5;
    cam = erot(cam, vec3(0,1,0), yrot);
    init = erot(init, vec3(0,1,0), yrot);
    cam = erot(cam, vec3(0,0,1), zrot);
    init = erot(init, vec3(0,0,1), zrot);

    vec3 p = init;
    bool hit = false;
    for (int i = 0; i < 150 && !hit; i++) {
        float dist = scene(p);
        hit = dist*dist < 0.001;
        p += cam*dist;
        if (distance(p, init) > 10.) break;
    }

    vec3 n = norm(p);

    float shade = lighting(n);

    vec3 sampledColor = texture2D(gradient, vec2(shade, 0.0)).rgb;
    vec4 grad = vec4(sampledColor, 0.0);
    vec4 bg = texture2D(background, vUv);

    gl_FragColor = hit ? grad : bg;
}

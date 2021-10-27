#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

float noise1D(float p) {
  return fract(sin(p) *
  43758.5453);
}

float noise1D2(float p) {
  return fract(sin(p) *
  126548.98712);
}

float interpNoise1D(float x, bool version1) {
  float intX = floor(x);
  float fractX = fract(x);
  float v1;
  float v2;
  if (version1) {
    v1 = noise1D(intX);
    v2 = noise1D(intX + 1.);
  } else {
    v1 = noise1D2(intX);
    v2 = noise1D2(intX + 1.);
  }
  
  return mix(v1, v2, fractX);
}

float fbm(float x, bool version1) {
  float total = 0.;
  float persistence = 0.5f;
  float octaves = 8.;
  for(float i = 1.; i <= octaves; i++) {
    float freq = pow(2.f, i);
    float amp = pow(persistence, i);
    if (version1) {
      total += interpNoise1D(x * freq, true) * amp;
    } else {
      total += interpNoise1D(x * freq, false) * amp;
    }
  }
  return total;
} 

vec2 random2( vec2 p ) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)),
  dot(p, vec2(269.5,183.3))))
  * 43758.5453);
}

float WorleyNoise(vec2 uv) {
  uv *= 7.0; // Now the space is 10x10 instead of 1x1. Change this to any number you want.
  vec2 uvInt = floor(uv);
  vec2 uvFract = fract(uv);
  float minDist = 1.0; // Minimum distance initialized to max.
  for(int y = -1; y <= 1; ++y) {
    for(int x = -1; x <= 1; ++x) {
      vec2 neighbor = vec2(float(x), float(y)); // Direction in which neighbor cell lies
      vec2 point = random2(uvInt + neighbor); // Get the Voronoi centerpoint for the neighboring cell
      vec2 diff = neighbor + point - uvFract; // Distance between fragment coord and neighbor’s Voronoi point
      float dist = length(diff);
      minDist = min(minDist, dist);
    }
  }
  return minDist;
}

float GetBias(float time, float bias) {
  return (time / ((((1.0/bias) - 2.0)*(1.0 - time))+1.0));
}

void main() {
  float f = 0.;
  vec3 col = vec3(.05, 0, .4);
  f = fbm(fs_Pos.x, true);
  f -= .5;
  if (fs_Pos.y < f) {
    col = vec3(0, 0, .1);
  } else {
    col = mix(vec3(.08, 0, .4), vec3(.0, 0, 0), fs_Pos.y);
    if (fs_Pos.y > .4) {
    col += vec3(1. - step(.009, WorleyNoise(vec2(fs_Pos.x, fs_Pos.y))));
  }
  }
  f = fbm(fs_Pos.x / 1.5, false) / 4.;
  f -= .4;
  if (fs_Pos.y < f) {
    col = mix(vec3(.9, .95, 1), vec3(.0, 0, .05), GetBias(fs_Pos.y + 1., .7));
  }
  out_Col = vec4(col, 1);
}

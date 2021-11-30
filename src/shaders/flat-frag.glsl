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

float noise2D( vec2 p ) {
  return fract(sin(dot(p, vec2(127.1, 311.7)))
  * 43758.5453);
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
  float octaves = 6.;
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

float interpNoise2D(float x, float y) {
  float intX = floor(x);
  float fractX = fract(x);
  float intY = floor(y);
  float fractY = fract(y);
  float v1 = noise2D(vec2(intX, intY));
  float v2 = noise2D(vec2(intX + 1., intY));
  float v3 = noise2D(vec2(intX, intY + 1.));
  float v4 = noise2D(vec2(intX + 1., intY + 1.));
  float i1 = mix(v1, v2, fractX);
  float i2 = mix(v3, v4, fractX);
  return mix(i1, i2, fractY);
}

float fbm(float x, float y) {
  float total = 0.;
  float persistence = 0.5f;
  float octaves = 8.;
  for(float i = 1.; i <= octaves; i++) {
    float freq = pow(2.f, i);
    float amp = pow(persistence, i);
    total += interpNoise2D(x * freq,
    y * freq) * amp;
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

vec3 backgroundColor(vec2 pos) {
  vec3 topSkyColor = vec3(0, 0.46, 0.81);
  vec3 bottomSkyColor = vec3(0.47, 0.7, 0.88);
  vec3 mountainColor = vec3(0.45, 0.38, 0.29);
  vec3 mountainColor2 = vec3(0.12, 0.21, 0.12);
  vec3 topOceanColor = vec3(0.01, 0.15, 0.29);
  vec3 bottomOceanColor = vec3(0.16, 0.35, 0.53);
  vec3 col = vec3(.05, 0, .4);  
  // horizon line
  if (pos.y < 0.) {
    if (pos.y < -.05) {
      col = mix(bottomOceanColor, topOceanColor, (pos.y + 1.)/.95);
    } else {
      col = mix(topOceanColor, bottomSkyColor, GetBias((pos.y + .05)/.05, .8));
    }
  }
  float f = fbm(pos.x - 4.2, true) / 1.7;
  f -= .25;
  float f2 = fbm(pos.x + 4., false) / 5.;
  f2 -= .19;
  // moutains
  if (pos.y < f && pos.y > f2) {
    col = mix(mountainColor, mountainColor2, fbm(pos.x * 35., pos.y * 35.));
  } else if (pos.y >= 0.) {  // sky
    col = mix(bottomSkyColor, topSkyColor, pos.y);
    // if (pos.y > .4) {
    //   col += vec3(1. - step(.009, WorleyNoise(vec2(pos.x, pos.y))));
    // }
  }
  return col;
}

void main() {
  out_Col = vec4(backgroundColor(fs_Pos.xy), 1);
}

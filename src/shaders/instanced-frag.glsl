#version 300 es
precision highp float;

uniform float u_Time;
uniform vec3 u_Color;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

float random1( vec3 p ) {
  return fract(sin((dot(p, vec3(127.1,
  311.7,
  191.999)))) *
  18.5453);
}

float smootherStep(float a, float b, float t) {
    t = t*t*t*(t*(t*6.0 - 15.0) + 10.0);
    return mix(a, b, t);
}

float interpNoise3D(float x, float y, float z) {
  x *= 2.;
  y *= 2.;
  z *= 2.;
  float intX = floor(x);
  float fractX = fract(x);
  float intY = floor(y);
  float fractY = fract(y);
  float intZ = floor(z);
  float fractZ = fract(z);
  float v1 = random1(vec3(intX, intY, intZ));
  float v2 = random1(vec3(intX + 1., intY, intZ));
  float v3 = random1(vec3(intX, intY + 1., intZ));
  float v4 = random1(vec3(intX + 1., intY + 1., intZ));

  float v5 = random1(vec3(intX, intY, intZ + 1.));
  float v6 = random1(vec3(intX + 1., intY, intZ + 1.));
  float v7 = random1(vec3(intX, intY + 1., intZ + 1.));
  float v8 = random1(vec3(intX + 1., intY + 1., intZ + 1.));

  float i1 = smootherStep(v1, v2, fractX);
  float i2 = smootherStep(v3, v4, fractX);
  float result1 = smootherStep(i1, i2, fractY);
  float i3 = smootherStep(v5, v6, fractX);
  float i4 = smootherStep(v7, v8, fractX);
  float result2 = smootherStep(i3, i4, fractY);
  return smootherStep(result1, result2, fractZ);
}

float fbm(float x, float y, float z) {
  float total = 0.;
  float persistence = 0.5f;
  for(float i = 1.; i <= 6.; i++) {
    float freq = pow(2., i) / 2.;
    float amp = pow(persistence, i);
    total += interpNoise3D(x * freq, y * freq, z * freq) * amp;
  }
  return total;
}

float noiseTable(vec3 p) {
  float f = fbm(p.x, p.y, p.z);
  vec4 pos = fs_Nor + -1.;
  pos += f; 
  return abs(f) / 4. + .75;
}
vec3 contrast(vec3 rgb, float c) {
    float f = 259.0 * (c + 255.0) / (255.0 * (259.0 - c));
    return clamp(f * (rgb - vec3(0.5)) + vec3(0.5), 0.0, 1.0);
}

void main()
{
    vec4 lightPos = vec4(0, 30, 30, 1);
    //float diffuseTerm = dot(normalize(vec4(noiseTable(vec3(fs_Pos)))), normalize(lightPos - fs_Pos));
    float diffuseTerm = dot(normalize(fs_Nor), normalize(lightPos - fs_Pos));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    float ambientTerm = 0.2;
    float lightIntensity = diffuseTerm + ambientTerm;
    // If this fragment is a light, flicker it
    vec3 col = fs_Col.rgb;
    if (fs_Col[3] < 1.) {
        float rand = random1(vec3(floor(fs_Pos.x / .3),floor(fs_Pos.y / .3),floor(fs_Pos.z / .3)));
        col = mix(vec3(0), u_Color.rgb * 20., (sin(.5 * u_Time * rand) + 1.)/2.);
    }
    col = pow(col * lightIntensity * noiseTable(vec3(fs_Pos)), vec3(.72));
    col = contrast(col, 30.);
    out_Col = vec4(col, fs_Col[3]);
    // out_Col = vec4((fs_Pos + 3.) / 6.);
    // out_Col = vec4(fs_Nor.rgb, 1)  ;
    // out_Col = vec4(1);
}

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

void main()
{
    vec4 lightPos = vec4(0, 30, 30, 1);
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
    out_Col = vec4(col * lightIntensity, fs_Col[3]);
    // out_Col = vec4(fs_Nor.rgb, 1);
    // out_Col = vec4(1);
}

#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

void main()
{
    vec4 lightPos = vec4(0, 30, 30, 1);
    float diffuseTerm = dot(normalize(fs_Nor), normalize(lightPos - fs_Pos));
    // Avoid negative lighting values
    diffuseTerm = clamp(diffuseTerm, 0.f, 1.f);
    float ambientTerm = 0.2;
    float lightIntensity = diffuseTerm + ambientTerm;
    out_Col = vec4(fs_Col.rgb * lightIntensity, 1.);
    // out_Col = vec4(fs_Nor.rgb, 1);
    // out_Col = vec4(1);
}

import { type Color, ShaderMaterial } from "three";

// The light comes from the upper left, fixed relative to the viewer, as in an illustration.
const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const lightDirection = /* glsl */ `
  const vec3 lightDirection = normalize(vec3(-0.5, 0.8, 0.6));
`;

const goochFragmentShader = /* glsl */ `
  uniform vec3 baseColor;
  varying vec3 vNormal;
  ${lightDirection}
  void main() {
    vec3 normal = normalize(vNormal);
    float lit = (dot(normal, lightDirection) + 1.0) * 0.5;
    vec3 cool = vec3(0.05, 0.1, 0.35) + 0.3 * baseColor;
    vec3 warm = vec3(0.45, 0.35, 0.05) + 0.75 * baseColor;
    vec3 color = mix(cool, warm, lit);
    // Darkens the edges where the surface turns away from the viewer, to suggest a silhouette.
    float edge = pow(1.0 - abs(normal.z), 3.0);
    gl_FragColor = vec4(color * (1.0 - 0.4 * edge), 1.0);
    #include <colorspace_fragment>
  }
`;

const celFragmentShader = /* glsl */ `
  uniform vec3 baseColor;
  varying vec3 vNormal;
  ${lightDirection}
  void main() {
    vec3 normal = normalize(vNormal);
    float lit = dot(normal, lightDirection);
    // Three hard bands of light, plus a small highlight where the light hits head-on.
    float band = lit > 0.55 ? 1.05 : lit > 0.0 ? 0.8 : 0.55;
    float highlight = step(0.95, lit) * 0.15;
    gl_FragColor = vec4(baseColor * band + highlight, 1.0);
    #include <colorspace_fragment>
  }
`;

const hatchingFragmentShader = /* glsl */ `
  uniform vec3 baseColor;
  varying vec3 vNormal;
  ${lightDirection}
  /** Returns 1 on a line of a screen-space stripe pattern along the given direction, 0 between lines. */
  float stripe(vec2 direction, float spacing) {
    float position = dot(gl_FragCoord.xy, direction) / spacing;
    return step(abs(fract(position) - 0.5), 0.14);
  }
  void main() {
    float lit = max(dot(normalize(vNormal), lightDirection), 0.0);
    float ink = 0.0;
    if (lit < 0.8) ink = max(ink, stripe(vec2(0.7071, 0.7071), 7.0));
    if (lit < 0.5) ink = max(ink, stripe(vec2(0.7071, -0.7071), 7.0));
    if (lit < 0.25) ink = max(ink, stripe(vec2(0.0, 1.0), 4.0));
    vec3 paper = mix(baseColor, vec3(1.0), 0.55);
    vec3 inkColor = baseColor * 0.2;
    gl_FragColor = vec4(mix(paper, inkColor, ink), 1.0);
    #include <colorspace_fragment>
  }
`;

export function createGoochMaterial(color: Color) {
  return createIllustrationMaterial(goochFragmentShader, color);
}

export function createCelMaterial(color: Color) {
  return createIllustrationMaterial(celFragmentShader, color);
}

export function createHatchingMaterial(color: Color) {
  return createIllustrationMaterial(hatchingFragmentShader, color);
}

function createIllustrationMaterial(fragmentShader: string, color: Color) {
  return new ShaderMaterial({
    uniforms: { baseColor: { value: color } },
    vertexShader,
    fragmentShader,
  });
}

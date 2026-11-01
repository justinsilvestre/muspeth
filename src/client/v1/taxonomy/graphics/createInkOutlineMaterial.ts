import { BackSide, type Color, ShaderMaterial } from "three";

/** The outline width as a fraction of the view's height, so it looks the same at any distance. */
const outlineWidth = 0.004;

// Pushes each vertex outward along its normal in screen space, so the back faces show as a rim around the branch.
const vertexShader = /* glsl */ `
  void main() {
    vec4 clipPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec2 screenNormal = (normalMatrix * normal).xy;
    float normalLength = length(screenNormal);
    if (normalLength > 0.0001) clipPosition.xy += screenNormal / normalLength * ${outlineWidth} * clipPosition.w;
    gl_Position = clipPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 inkColor;
  void main() {
    gl_FragColor = vec4(inkColor, 1.0);
    #include <colorspace_fragment>
  }
`;

/**
 * Creates a material that draws a mesh's geometry as an ink outline, using the inverted-hull technique:
 * a slightly enlarged copy, drawn with only its back faces, peeks out around the original.
 */
export function createInkOutlineMaterial(color: Color) {
  return new ShaderMaterial({
    uniforms: { inkColor: { value: color.clone().multiplyScalar(0.18) } },
    vertexShader,
    fragmentShader,
    side: BackSide,
  });
}

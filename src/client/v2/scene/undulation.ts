import { useFrame } from "@react-three/fiber";
import { useState } from "react";
import { MeshPhysicalMaterial, type MeshPhysicalMaterialParameters } from "three";

/**
 * A slow displacement field over the plane of the diagram, written in GLSL.
 * Every mesh sharing it drifts together, so nested membranes keep their nesting while the whole body undulates.
 */
const undulationGlsl = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  vec3 undulate(vec3 p) {
    float t = uTime;
    float a = sin(p.x * 0.9 + t * 0.6) * cos(p.y * 1.1 - t * 0.4);
    float b = sin(p.y * 0.8 - t * 0.5 + 1.7) * cos(p.x * 1.3 + t * 0.3);
    float c = sin((p.x + p.y) * 0.5 + t * 0.7);
    return vec3(a + 0.5 * c, b - 0.5 * c, 0.4 * a * b) * uAmplitude;
  }
`;

/** Creates a physical material whose vertices drift with the shared undulation field, advancing it every frame. */
export function useUndulatingMaterial(
  parameters: MeshPhysicalMaterialParameters,
  amplitude = 0.12,
) {
  // The material is created once; later parameter changes are applied by the mesh's props instead.
  const [{ material, uniforms }] = useState(() => createUndulatingMaterial(parameters, amplitude));
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
  });
  return material;
}

function createUndulatingMaterial(parameters: MeshPhysicalMaterialParameters, amplitude: number) {
  const uniforms = { uTime: { value: 0 }, uAmplitude: { value: amplitude } };
  const material = new MeshPhysicalMaterial(parameters);
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${undulationGlsl}`)
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
         transformed += undulate(worldPosition);`,
      );
  };
  return { material, uniforms };
}

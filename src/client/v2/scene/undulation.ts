import { useFrame } from "@react-three/fiber";
import { useEffect, useState } from "react";
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

/** How far the drifting goes, and how fast it plays. */
export type Motion = { amplitude: number; speed: number };

/**
 * How a translucent surface thickens toward its silhouette, like the wall of a cell seen edge-on.
 * Strength is the opacity added at the very edge, and width is how far the thickening reaches in from the edge.
 */
export type EdgeGlow = { strength: number; width: number };

const noEdgeGlow = { strength: 0, width: 1 } satisfies EdgeGlow;

/**
 * Creates a physical material whose vertices drift with the shared undulation field, advancing it every frame,
 * and keeps it in step with the given parameters as they change.
 */
export function useUndulatingMaterial(
  parameters: MeshPhysicalMaterialParameters,
  motion: Motion,
  edgeGlow: EdgeGlow = noEdgeGlow,
) {
  const [{ material, uniforms }] = useState(createUndulatingMaterial);
  useEffect(() => {
    material.setValues(parameters);
    uniforms.uAmplitude.value = motion.amplitude;
    uniforms.uEdgeStrength.value = edgeGlow.strength;
    uniforms.uEdgePower.value = 1 / edgeGlow.width;
  });
  useFrame((_, delta) => {
    uniforms.uTime.value += delta * motion.speed;
  });
  return material;
}

function createUndulatingMaterial() {
  const uniforms = {
    uTime: { value: 0 },
    uAmplitude: { value: 0 },
    uEdgeStrength: { value: 0 },
    uEdgePower: { value: 1 },
  };
  const material = new MeshPhysicalMaterial();
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
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uEdgeStrength;\nuniform float uEdgePower;",
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
         float facing = abs(dot(normalize(vViewPosition), normal));
         diffuseColor.a = min(1.0, diffuseColor.a + uEdgeStrength * pow(1.0 - facing, uEdgePower));`,
      );
  };
  return { material, uniforms };
}

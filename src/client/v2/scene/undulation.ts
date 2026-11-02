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
  uniform float uTimeLead;
  uniform float uRigid;
  uniform float uRigidShare;
  vec3 undulate(vec3 p) {
    float t = uTime + uTimeLead;
    float a = sin(p.x * 0.9 + t * 0.6) * cos(p.y * 1.1 - t * 0.4);
    float b = sin(p.y * 0.8 - t * 0.5 + 1.7) * cos(p.x * 1.3 + t * 0.3);
    float c = sin((p.x + p.y) * 0.5 + t * 0.7);
    return vec3(a + 0.5 * c, b - 0.5 * c, 0.4 * a * b) * uAmplitude;
  }
`;

/**
 * How far the drifting goes, and how fast it plays. With a rigid share, the surface keeps its shape and moves
 * as a whole by that share of the field at its centre, instead of every point of it drifting on its own.
 * A lead, in seconds of field time, has the surface run that far ahead of the field, so that it seems to move first.
 */
export type Motion = { amplitude: number; speed: number; rigidShare?: number; lead?: number };

/**
 * How a translucent surface thickens toward its silhouette, like the wall of a cell seen edge-on.
 * Strength is the opacity added at the very edge, width is how far the thickening reaches in from the edge,
 * and light is how far the color pales toward white at the very edge, from 0 to 1.
 * The inner wall is the opacity of a thin second band a little way in from the edge, which suggests a double wall.
 */
export type EdgeGlow = { strength: number; width: number; light: number; innerWall: number };

const noEdgeGlow = { strength: 0, width: 1, light: 0, innerWall: 0 } satisfies EdgeGlow;

/**
 * Creates a physical material whose vertices drift with the shared undulation field, advancing it every frame,
 * and keeps it in step with the given parameters as they change. Callers should memoize the parameter objects,
 * since the material is updated whenever they are replaced.
 */
export function useUndulatingMaterial(
  parameters: MeshPhysicalMaterialParameters,
  motion: Motion,
  edgeGlow: EdgeGlow = noEdgeGlow,
) {
  const [{ material, uniforms }] = useState(createUndulatingMaterial);
  useEffect(() => {
    material.setValues(parameters);
  }, [material, parameters]);
  useEffect(() => {
    uniforms.uAmplitude.value = motion.amplitude;
    uniforms.uTimeLead.value = motion.lead ?? 0;
    uniforms.uRigid.value = motion.rigidShare === undefined ? 0 : 1;
    uniforms.uRigidShare.value = motion.rigidShare ?? 1;
    uniforms.uEdgeStrength.value = edgeGlow.strength;
    uniforms.uEdgePower.value = 1 / edgeGlow.width;
    uniforms.uEdgeLight.value = edgeGlow.light;
    uniforms.uInnerWall.value = edgeGlow.innerWall;
  }, [uniforms, motion.amplitude, motion.lead, motion.rigidShare, edgeGlow]);
  useFrame((_, delta) => {
    uniforms.uTime.value += delta * motion.speed;
  });
  return material;
}

function createUndulatingMaterial() {
  const uniforms = {
    uTime: { value: 0 },
    uAmplitude: { value: 0 },
    uTimeLead: { value: 0 },
    uRigid: { value: 0 },
    uRigidShare: { value: 1 },
    uEdgeStrength: { value: 0 },
    uEdgePower: { value: 1 },
    uEdgeLight: { value: 0 },
    uInnerWall: { value: 0 },
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
         vec3 samplePoint = mix(worldPosition, modelMatrix[3].xyz, uRigid);
         transformed += undulate(samplePoint) * mix(1.0, uRigidShare, uRigid);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uEdgeStrength;\nuniform float uEdgePower;\nuniform float uEdgeLight;\nuniform float uInnerWall;",
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
         float facing = abs(dot(normalize(vViewPosition), normal));
         float edge = 1.0 - facing;
         float rim = pow(edge, uEdgePower);
         // A narrow band where the surface tilts about halfway toward the viewer, well inside the outer rim.
         float inner = uInnerWall * exp(-pow((edge - 0.45) / 0.075, 2.0));
         diffuseColor.a = min(1.0, diffuseColor.a + uEdgeStrength * rim + inner);
         diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), min(1.0, uEdgeLight * rim + inner));`,
      );
  };
  return { material, uniforms };
}

/** Ready-made looks for the trunk and branches, each a color and the physical surface it is drawn with. */
export const barkMaterials = [
  { id: "bark", label: "Bark", color: "#6b4f3a", roughness: 0.9, metalness: 0 },
  { id: "birch", label: "Birch", color: "#ddd5c6", roughness: 0.8, metalness: 0 },
  { id: "ebony", label: "Ebony", color: "#2e2622", roughness: 0.3, metalness: 0, clearcoat: 0.6 },
  { id: "coral", label: "Coral", color: "#e07a5f", roughness: 0.6, metalness: 0 },
  { id: "copper", label: "Copper", color: "#c27a46", roughness: 0.45, metalness: 1 },
  { id: "gold", label: "Gold", color: "#d9b24c", roughness: 0.4, metalness: 1 },
  { id: "verdigris", label: "Verdigris", color: "#5f9e8f", roughness: 0.65, metalness: 0.3 },
  {
    id: "porcelain",
    label: "Porcelain",
    color: "#f3f0ea",
    roughness: 0.1,
    metalness: 0,
    clearcoat: 1,
  },
  { id: "glass", label: "Glass", color: "#cfe8ef", roughness: 0.15, metalness: 0, opacity: 0.4 },
] as const satisfies {
  id: string;
  label: string;
  color: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  opacity?: number;
}[];

export type BarkMaterial = (typeof barkMaterials)[number];
export type BarkMaterialId = BarkMaterial["id"];

export function findBarkMaterial(id: BarkMaterialId) {
  return barkMaterials.find((material) => material.id === id) ?? barkMaterials[0];
}

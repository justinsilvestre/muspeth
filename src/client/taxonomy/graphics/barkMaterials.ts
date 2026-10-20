type BarkMaterialSpec = {
  id: string;
  label: string;
  group: "Wood" | "Stone" | "Metal" | "Pigment" | "Translucent";
  color: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  opacity?: number;
};

/** Ready-made looks for the trunk and branches, each a color and the physical surface it is drawn with. */
export const barkMaterials = [
  { id: "bark", label: "Bark", group: "Wood", color: "#6b4f3a", roughness: 0.9, metalness: 0 },
  { id: "birch", label: "Birch", group: "Wood", color: "#ddd5c6", roughness: 0.8, metalness: 0 },
  { id: "cedar", label: "Cedar", group: "Wood", color: "#a0522d", roughness: 0.75, metalness: 0 },
  {
    id: "walnut",
    label: "Walnut",
    group: "Wood",
    color: "#4e3424",
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.3,
  },
  {
    id: "cherry",
    label: "Cherry",
    group: "Wood",
    color: "#8b3a2b",
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.4,
  },
  {
    id: "driftwood",
    label: "Driftwood",
    group: "Wood",
    color: "#a89f91",
    roughness: 0.95,
    metalness: 0,
  },
  {
    id: "ebony",
    label: "Ebony",
    group: "Wood",
    color: "#2e2622",
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.6,
  },
  {
    id: "porcelain",
    label: "Porcelain",
    group: "Stone",
    color: "#f3f0ea",
    roughness: 0.1,
    metalness: 0,
    clearcoat: 1,
  },
  {
    id: "marble",
    label: "Marble",
    group: "Stone",
    color: "#e6e1d8",
    roughness: 0.25,
    metalness: 0,
    clearcoat: 0.5,
  },
  {
    id: "terracotta",
    label: "Terracotta",
    group: "Stone",
    color: "#c8643c",
    roughness: 0.85,
    metalness: 0,
  },
  { id: "slate", label: "Slate", group: "Stone", color: "#4a5560", roughness: 0.7, metalness: 0 },
  {
    id: "jade",
    label: "Jade",
    group: "Stone",
    color: "#3f8f6b",
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.6,
  },
  {
    id: "obsidian",
    label: "Obsidian",
    group: "Stone",
    color: "#17151c",
    roughness: 0.1,
    metalness: 0,
    clearcoat: 1,
  },
  {
    id: "copper",
    label: "Copper",
    group: "Metal",
    color: "#c27a46",
    roughness: 0.45,
    metalness: 1,
  },
  {
    id: "bronze",
    label: "Bronze",
    group: "Metal",
    color: "#8c6a3c",
    roughness: 0.45,
    metalness: 1,
  },
  { id: "gold", label: "Gold", group: "Metal", color: "#d9b24c", roughness: 0.4, metalness: 1 },
  {
    id: "roseGold",
    label: "Rose gold",
    group: "Metal",
    color: "#d8a08c",
    roughness: 0.35,
    metalness: 1,
  },
  { id: "silver", label: "Silver", group: "Metal", color: "#c9ccd1", roughness: 0.3, metalness: 1 },
  { id: "iron", label: "Iron", group: "Metal", color: "#5b5e63", roughness: 0.6, metalness: 0.9 },
  {
    id: "verdigris",
    label: "Verdigris",
    group: "Metal",
    color: "#5f9e8f",
    roughness: 0.65,
    metalness: 0.3,
  },
  { id: "coral", label: "Coral", group: "Pigment", color: "#e07a5f", roughness: 0.6, metalness: 0 },
  {
    id: "sakura",
    label: "Sakura",
    group: "Pigment",
    color: "#e8a5b8",
    roughness: 0.7,
    metalness: 0,
  },
  { id: "ochre", label: "Ochre", group: "Pigment", color: "#c8952e", roughness: 0.8, metalness: 0 },
  { id: "moss", label: "Moss", group: "Pigment", color: "#6b7d3a", roughness: 0.9, metalness: 0 },
  { id: "teal", label: "Teal", group: "Pigment", color: "#2f7f86", roughness: 0.6, metalness: 0 },
  {
    id: "indigo",
    label: "Indigo",
    group: "Pigment",
    color: "#3b4a8c",
    roughness: 0.6,
    metalness: 0,
  },
  { id: "plum", label: "Plum", group: "Pigment", color: "#6e3b5c", roughness: 0.6, metalness: 0 },
  { id: "chalk", label: "Chalk", group: "Pigment", color: "#efeae0", roughness: 1, metalness: 0 },
  {
    id: "charcoal",
    label: "Charcoal",
    group: "Pigment",
    color: "#2a2a2a",
    roughness: 0.95,
    metalness: 0,
  },
  {
    id: "glass",
    label: "Glass",
    group: "Translucent",
    color: "#cfe8ef",
    roughness: 0.15,
    metalness: 0,
    opacity: 0.4,
  },
  {
    id: "ice",
    label: "Ice",
    group: "Translucent",
    color: "#bfe3f2",
    roughness: 0.05,
    metalness: 0,
    clearcoat: 1,
    opacity: 0.55,
  },
  {
    id: "amber",
    label: "Amber",
    group: "Translucent",
    color: "#d98a1f",
    roughness: 0.15,
    metalness: 0,
    clearcoat: 1,
    opacity: 0.75,
  },
] as const satisfies BarkMaterialSpec[];

export type BarkMaterial = (typeof barkMaterials)[number];
export type BarkMaterialId = BarkMaterial["id"];

export function findBarkMaterial(id: BarkMaterialId) {
  return barkMaterials.find((material) => material.id === id) ?? barkMaterials[0];
}

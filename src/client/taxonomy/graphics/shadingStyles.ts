/** Ways of turning light on the branches into color, from realistic to illustrated. */
export const shadingStyles = [
  { id: "smooth", label: "Smooth", description: "Physically based light, as in a 3D render" },
  {
    id: "flat",
    label: "Faceted",
    description: "Flat shading, one tone per face, as in low-poly art",
  },
  { id: "toon", label: "Cel", description: "Cel (toon) shading, light in three hard bands" },
  {
    id: "outlined",
    label: "Cel + ink",
    description: "Cel shading with dark outlines, as in comics",
  },
  {
    id: "gooch",
    label: "Warm/cool",
    description: "Gooch shading, from cool shadows to warm light",
  },
  {
    id: "hatching",
    label: "Hatching",
    description: "Pen-and-ink hatching that thickens in shadow",
  },
] as const;

export type ShadingStyleId = (typeof shadingStyles)[number]["id"];

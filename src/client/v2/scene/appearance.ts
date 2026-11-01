/** Every adjustable aspect of how the cell looks and moves. */
export type Appearance = {
  shape: {
    /** The membranes' height as a share of their horizontal padding. */
    depth: number;
    /** The margin every membrane keeps around its members. */
    paddingBase: number;
    /** The extra margin a membrane gets for each member, so that larger membranes enclose smaller ones. */
    paddingPerMember: number;
    /** How closely membranes follow the corners of their members' convex hull, from round to angular. */
    cornerSharpness: number;
  };
  material: {
    /** How opaque a membrane is where it faces the viewer. */
    bodyOpacity: number;
    /** How opaque a membrane becomes at its silhouette. */
    edgeStrength: number;
    /** How far the edge thickening reaches in from the silhouette. */
    edgeWidth: number;
    finish: Finish;
  };
  color: {
    smallSubgroup: string;
    largeSubgroup: string;
    family: string;
    nucleus: string;
  };
  movement: {
    /** How far the membranes drift from their resting shape. */
    amplitude: number;
    /** How fast the drifting plays, as a multiple of the base speed. */
    speed: number;
    autoRotate: boolean;
  };
};

export type Finish = "glassy" | "satin" | "matte";

export const finishes = {
  glassy: { roughness: 0.15, clearcoat: 1 },
  satin: { roughness: 0.4, clearcoat: 0.5 },
  matte: { roughness: 0.9, clearcoat: 0 },
} satisfies Record<Finish, { roughness: number; clearcoat: number }>;

export const defaultAppearance = {
  shape: { depth: 0.85, paddingBase: 0.3, paddingPerMember: 0.07, cornerSharpness: 3 },
  material: { bodyOpacity: 0.08, edgeStrength: 0.8, edgeWidth: 0.5, finish: "satin" },
  color: {
    smallSubgroup: "#d457a3",
    largeSubgroup: "#4fb5bf",
    family: "#5aa38e",
    nucleus: "#f1c96a",
  },
  movement: { amplitude: 0.12, speed: 1, autoRotate: false },
} satisfies Appearance;

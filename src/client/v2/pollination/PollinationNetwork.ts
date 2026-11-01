/** An organism of a network, with its identifier in the first version's graph. */
export type NetworkOrganism = { id: string; name: string };

/** One visitor seen on one plant, with how many visits the survey counted. */
export type Visit = { visitor: string; plant: string; count: number; flags: string[] };

/** A plant–pollinator network observed at one site, as the export script copies it from the database. */
export type PollinationNetwork = {
  datasetId: string;
  datasetUrl: string;
  place: string;
  date: string | null;
  latitude: number | null;
  longitude: number | null;
  licence: string;
  citation: { text: string; url: string };
  visitors: NetworkOrganism[];
  plants: NetworkOrganism[];
  visits: Visit[];
};

/** A network with the name and description the view shows for it. */
export type NetworkChoice = PollinationNetwork & {
  id: string;
  name: string;
  /** One or two sentences on where and when the network was observed. */
  description: string;
};

/** Which organisms the view draws as bodies: the other side then forms the membranes around them. */
export type Side = "plants" | "visitors";

/** The side of a network opposite to the given one. */
export function otherSide(side: Side): Side {
  return side === "plants" ? "visitors" : "plants";
}

/** The visitor and plant of a visit, as body and partner for the given side. */
export function orient({ visitor, plant }: Visit, side: Side) {
  return side === "plants" ? { body: plant, partner: visitor } : { body: visitor, partner: plant };
}

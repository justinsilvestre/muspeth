/**
 * Copies a few small plant–pollinator networks out of the database into JSON files that the second
 * version's pollination view bundles, so that the view needs no server. Each file holds one network:
 * its visitors, its plants, and how often each visitor was seen on each plant.
 * Usage: npm run v2:export-pollination
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { queryDatabase } from "./database.ts";

const outputDirectory = path.resolve(import.meta.dirname, "../src/client/v2/pollination/networks");

/** The networks to copy, by their Mangal dataset identifier, with the file name each is written to. */
const networks = [
  { datasetId: "mangal:934", file: "ile-aux-aigrettes.json" },
  { datasetId: "mangal:935", file: "flores.json" },
  { datasetId: "mangal:929", file: "catimbau.json" },
  { datasetId: "mangal:945", file: "piedmont.json" },
];

type VisitRow = {
  visitor_id: string;
  visitor: string;
  plant_id: string;
  plant: string;
  count: number | null;
  quality_flags: string;
  place: string;
  date: string | null;
  latitude: number | null;
  longitude: number | null;
  licence: string;
  study_citation: string | null;
  study_url: string | null;
};

for (const { datasetId, file } of networks) {
  const rows = queryDatabase<VisitRow>(`
    SELECT s.id AS visitor_id, s.label AS visitor, t.id AS plant_id, t.label AS plant,
      c.weight AS count, c.quality_flags, c.place, c.date, c.latitude, c.longitude, c.licence,
      cs.study_citation, cs.study_url
    FROM connections c
    JOIN connection_sources cs ON cs.connection_id = c.id
    JOIN nodes s ON s.id = c.source_node_id
    JOIN nodes t ON t.id = c.target_node_id
    WHERE c.kind = 'interaction' AND cs.dataset_id = '${datasetId}'
    ORDER BY c.weight DESC, s.label, t.label
  `);
  const first = rows[0];
  if (!first) throw new Error(`No connections found for ${datasetId}`);
  const network = {
    datasetId,
    datasetUrl: `https://mangal.io/#/network/${datasetId.replace("mangal:", "")}`,
    place: first.place,
    date: first.date,
    latitude: first.latitude,
    longitude: first.longitude,
    licence: first.licence,
    citation: { text: first.study_citation ?? "", url: first.study_url ?? "" },
    visitors: uniqueOrganisms(rows.map((row) => ({ id: row.visitor_id, name: row.visitor }))),
    plants: uniqueOrganisms(rows.map((row) => ({ id: row.plant_id, name: row.plant }))),
    visits: rows.map((row) => ({
      visitor: row.visitor,
      plant: row.plant,
      count: row.count ?? 1,
      // The copy flag concerns the network's provenance, not the visit, so it is left out.
      flags: (JSON.parse(row.quality_flags) as string[]).filter(
        (flag) => flag !== "duplicate_network_copy",
      ),
    })),
  };
  writeFileSync(path.join(outputDirectory, file), `${JSON.stringify(network, null, 2)}\n`);
  console.log(
    `${file}: ${network.visitors.length} visitors, ${network.plants.length} plants, ${rows.length} visits`,
  );
}

function uniqueOrganisms(organisms: { id: string; name: string }[]) {
  return [...new Map(organisms.map((organism) => [organism.id, organism])).values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

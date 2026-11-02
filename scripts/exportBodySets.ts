/**
 * Copies a few small sets of organisms out of the database into JSON files that the second
 * version's Biological glottometry view bundles, so that the view needs no server. Each file holds one set of
 * bodies and, for each kind of relation recorded among them, the partners that the bodies share:
 * the visitors of a flower survey, compounds, names, folklore motifs, survey sites, and taxa.
 * Usage: npm run v2:export-body-sets
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import {
  organismSets,
  placeSetId,
  rottingLogStages,
  siteLabels,
  siteNames,
  surveys,
} from "./bodySetChoices.ts";
import { type LinkRow, queryRelationLinks, quoteList } from "./bodySetQueries.ts";
import { queryDatabase } from "./database.ts";

const outputDirectory = path.resolve(import.meta.dirname, "../src/client/v2/bodies/sets");

/** The name of each stage of the rotting-log survey, by the years the logs had lain dead, for the view's steps. */
const stageNamesByYears = Object.fromEntries(
  Object.values(rottingLogStages).map(({ years, stepName }) => [String(years), stepName]),
);

type Body = {
  id: string;
  name: string;
  label?: string;
  commonName?: string;
  image?: { url: string; credit: string | null; licence: string | null; pageUrl: string | null };
};
type Link = { body: string; partner: string; weight?: number; flags: string[] };
type Sharing = {
  relation: string;
  licences: string[];
  links: Link[];
  weightNames?: Record<string, string>;
};

for (const survey of surveys) {
  const visits = queryDatabase<{
    visitor_id: string;
    visitor: string;
    plant_id: string;
    plant: string;
    count: number | null;
    quality_flags: string;
    licence: string;
    study_citation: string;
    study_url: string;
  }>(`
    SELECT s.id AS visitor_id, s.label AS visitor, t.id AS plant_id, t.label AS plant,
      c.weight AS count, c.quality_flags, c.licence, cs.study_citation, cs.study_url
    FROM connections c
    JOIN connection_sources cs ON cs.connection_id = c.id
    JOIN nodes s ON s.id = c.source_node_id
    JOIN nodes t ON t.id = c.target_node_id
    WHERE c.kind = 'interaction' AND cs.dataset_id = '${survey.datasetId}'
    ORDER BY c.weight DESC, s.label, t.label
  `);
  const first = visits[0];
  if (!first) throw new Error(`No visits found for ${survey.datasetId}`);
  const citation = { text: first.study_citation, url: first.study_url };
  const plants = uniqueBodies(visits.map((row) => ({ id: row.plant_id, name: row.plant })));
  const visitors = uniqueBodies(visits.map((row) => ({ id: row.visitor_id, name: row.visitor })));
  const toLink = (body: string, partner: string, row: (typeof visits)[number]) => ({
    body,
    partner,
    weight: row.count ?? 1,
    flags: parseFlags(row.quality_flags),
  });
  writeSet({
    id: `${survey.id}-plants`,
    name: `Plants of ${survey.name}`,
    group: "From flower surveys",
    description: survey.description,
    bodyNoun: { one: "plant", many: "plants" },
    labelStyle: "species",
    citation,
    bodies: plants,
    sharings: [
      {
        relation: "visitors",
        licences: [first.licence],
        links: visits.map((row) => toLink(row.plant, row.visitor, row)),
      },
      ...organismSharings(plants),
    ],
  });
  writeSet({
    id: `${survey.id}-visitors`,
    name: `Visitors of ${survey.name}`,
    group: "From flower surveys",
    description: survey.description,
    bodyNoun: { one: "visitor", many: "visitors" },
    labelStyle: "species",
    citation,
    bodies: visitors,
    sharings: [
      {
        relation: "flowers",
        licences: [first.licence],
        links: visits.map((row) => toLink(row.visitor, row.plant, row)),
      },
      ...organismSharings(visitors),
    ],
  });
}

for (const set of organismSets) {
  const bodies = queryDatabase<Body>(
    `SELECT id, label AS name FROM nodes WHERE kind = 'organism' AND label IN (${quoteList(set.organisms)}) ORDER BY label`,
  );
  const missing = set.organisms.filter((name) => !bodies.some((body) => body.name === name));
  if (missing.length) throw new Error(`Organisms not found for ${set.id}: ${missing.join(", ")}`);
  const ids = bodies.map((body) => body.id);
  const extra = (set.relations ?? []).map((relation) => ({
    ...toSharing(relation, queryRelationLinks(relation, ids, set), bodies),
    ...(relation === "stages" ? { weightNames: stageNamesByYears } : {}),
  }));
  writeSet({
    ...set,
    group: set.group ?? "From across the database",
    labelStyle: "species",
    bodies,
    sharings: [...extra, ...organismSharings(bodies)],
  });
}

{
  const places = queryDatabase<Body>(
    "SELECT id, label AS name FROM nodes WHERE kind = 'place'",
  ).map((place) => ({
    id: place.id,
    name: siteNames[place.id] ?? place.name,
    label: siteLabels[place.id],
  }));
  const rows = queryDatabase<LinkRow>(`
    SELECT c.target_node_id AS body_id, s.label AS partner, NULL AS weight, c.quality_flags AS flags, c.licence
    FROM connections c JOIN nodes s ON s.id = c.source_node_id
    WHERE c.kind = 'shared_place_and_sound' AND c.relation = 'observed at'
  `);
  writeSet({
    id: placeSetId,
    name: "Fourteen survey sites",
    group: "From across the database",
    description:
      "The sites of the flower surveys in the database, from Ellesmere Island to New Zealand, each a body here; a species observed at several of them draws a membrane around those sites.",
    bodyNoun: { one: "site", many: "sites" },
    labelStyle: "plain",
    bodies: places.sort((a, b) => a.name.localeCompare(b.name)),
    sharings: [toSharing("species", rows, places)],
  });
}

/** The relations recorded among a set of organisms; one with nothing recorded is kept, with no links, so that the view can say so. */
function organismSharings(bodies: Body[]) {
  const ids = quoteList(bodies.map((body) => body.id));
  const byTarget = (relation: string, kind: string, relations: string[]) =>
    queryDatabase<LinkRow>(`
      SELECT c.source_node_id AS body_id, t.label AS partner, c.weight, c.quality_flags AS flags, c.licence
      FROM connections c JOIN nodes t ON t.id = c.target_node_id
      WHERE c.source_node_id IN (${ids}) AND t.kind = '${kind}' AND c.relation IN (${quoteList(relations)})
    `).map((row) => ({
      ...row,
      partner: relation === "sites" ? (siteNames[row.partner] ?? row.partner) : row.partner,
    }));
  const sites = queryDatabase<LinkRow>(`
    SELECT c.source_node_id AS body_id, t.id AS partner, NULL AS weight, c.quality_flags AS flags, c.licence
    FROM connections c JOIN nodes t ON t.id = c.target_node_id
    WHERE c.source_node_id IN (${ids}) AND t.kind = 'place' AND c.relation = 'observed at'
  `).map((row) => ({ ...row, partner: siteNames[row.partner] ?? row.partner }));
  const taxa = queryDatabase<LinkRow>(`
    WITH RECURSIVE lineage(body_id, taxon_id, flags) AS (
      SELECT node_id, taxon_id, quality_flags FROM taxon_placements WHERE node_id IN (${ids})
      UNION ALL
      SELECT lineage.body_id, taxa.parent_id, lineage.flags FROM lineage JOIN taxa ON taxa.id = lineage.taxon_id
      WHERE taxa.parent_id IS NOT NULL
    )
    SELECT body_id, taxa.name || ' (' || taxa.rank || ')' AS partner, NULL AS weight, flags, taxa.licence
    FROM lineage JOIN taxa ON taxa.id = lineage.taxon_id WHERE taxa.rank <> 'species'
  `);
  return [
    toSharing("compounds", byTarget("compounds", "compound", ["contains compound"]), bodies),
    toSharing("names", byTarget("names", "word", ["named by", "name contains"]), bodies),
    toSharing("stories", byTarget("stories", "story_motif", ["appears in motif"]), bodies),
    toSharing("sites", sites, bodies),
    toSharing("descent", taxa, bodies),
  ];
}

function toSharing(relation: string, rows: LinkRow[], bodies: Body[]) {
  const nameOf = new Map(bodies.map((body) => [body.id, body.name]));
  const links = rows.flatMap((row) => {
    const body = nameOf.get(row.body_id);
    if (!body) return [];
    const link: Link = { body, partner: row.partner, flags: parseFlags(row.flags) };
    if (row.weight !== null) link.weight = row.weight;
    return [link];
  });
  const unique = [
    ...new Map(links.map((link) => [`${link.body}\0${link.partner}`, link])).values(),
  ];
  return {
    relation,
    licences: [...new Set(rows.map((row) => row.licence))].sort(),
    links: unique.sort(
      (a, b) => a.partner.localeCompare(b.partner) || a.body.localeCompare(b.body),
    ),
  } satisfies Sharing;
}

function writeSet(set: {
  id: string;
  name: string;
  group: string;
  description: string;
  bodyNoun: { one: string; many: string };
  /** Whether body names are scientific names, to be abbreviated in the scene, or plain names shown as they are. */
  labelStyle: "species" | "plain";
  citation?: { text: string; url: string };
  bodies: Body[];
  sharings: Sharing[];
}) {
  const enriched = { ...set, bodies: set.bodies.map(describeBody) };
  writeFileSync(
    path.join(outputDirectory, `${set.id}.json`),
    `${JSON.stringify(enriched, null, 2)}\n`,
  );
  const summary = set.sharings
    .map(
      ({ relation, links }) =>
        `${relation} ${countMembranes(links, set.bodies.length)}/${new Set(links.map((l) => l.partner)).size}`,
    )
    .join(", ");
  console.log(`${set.id}: ${set.bodies.length} bodies; ${summary}`);
}

/** How many distinct sets of bodies, short of the whole set, the partners pick out: the membranes the relation would draw. */
function countMembranes(links: Link[], bodyCount: number) {
  const members = new Map<string, Set<string>>();
  for (const { body, partner } of links)
    members.set(partner, (members.get(partner) ?? new Set()).add(body));
  return new Set(
    [...members.values()]
      .filter((set) => set.size >= 2 && set.size < bodyCount)
      .map((set) => [...set].sort().join()),
  ).size;
}

/** Adds a body's shortest English name and its image, where the database has them. */
function describeBody(body: Body): Body {
  const [node] = queryDatabase<{
    media_url: string | null;
    media_credit: string | null;
    media_licence: string | null;
    media_page_url: string | null;
  }>(
    `SELECT media_url, media_credit, media_licence, media_page_url FROM nodes WHERE id = '${body.id.replace(/'/g, "''")}'`,
  );
  const names = queryDatabase<{ name: string }>(
    `SELECT name FROM node_names WHERE node_id = '${body.id.replace(/'/g, "''")}' AND language = 'en' ORDER BY length(name), name`,
  );
  const described: Body = { ...body };
  if (names[0]) described.commonName = names[0].name;
  if (node?.media_url)
    described.image = {
      url: node.media_url,
      credit: node.media_credit,
      licence: node.media_licence,
      pageUrl: node.media_page_url,
    };
  return described;
}

function uniqueBodies(bodies: Body[]) {
  return [...new Map(bodies.map((body) => [body.id, body])).values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/** The copy flag concerns a network's provenance, not the link, so it is left out. */
function parseFlags(json: string) {
  return (JSON.parse(json) as string[]).filter((flag) => flag !== "duplicate_network_copy");
}

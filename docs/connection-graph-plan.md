# Connection graph plan

## Purpose

This plan combines the sources in [datasets.md](datasets.md) into one graph of connections between organisms and the things around them. The graph should answer questions like:
- "How is *Homo sapiens* connected to matsutake?"
- "What links these two organisms through words and stories, as well as through ecology?"

It is meant as shared material for several creative pieces, not as a single product.

## Scope

The graph starts from a small seed set of organisms and grows outward one or two steps from it. It does not try to hold every source in full. Candidate seeds:
- the matsutake system: matsutake, red pine, pinewood nematode and sawyer beetle;
- one Japanese pollination network. Mangal holds no Kyoto network, so we use Makoto Kato's two surveys there, at Mt. Kushigata and Mt. Yufu. The Kibune (Kyoto) network is available only from Web of Life;
- the honey bee.

## Data model

**Nodes.** Each node is one of:
- an organism, at any rank from species to kingdom;
- a compound;
- a cultural object;
- a word;
- a story motif;
- a recording;
- a place.

Each node has a stable identifier, preferably a Wikidata ID, otherwise the source's own ID. It also has names in as many languages as are available.

**Connections.** Each connection links two nodes and records:
- the **kind** of connection: interaction, likeness, shared substance, shared culture, shared words and stories, or shared place and sound;
- the **specific relation**, for example `parasiteOf`, `pollinates`, `similar diet`, `contains compound` or `depicted in`;
- the **basis**, which is one of:
  - *observed*: reported by a study;
  - *computed*: derived by us, for example from trait similarity;
  - *attributed*: a meaning or use assigned by people;
- the **taxonomic level** the source supports, for example species, genus or a coarse group;
- optional weight, place and date;
- the source, citation and licence;
- **quality flags**, for example an unmatched name, a placeholder species, a suspected error, or a known sampling bias.

## Rules

- **Flag noise; do not delete it.** Keep doubtful records in the graph with quality flags. Each creative piece decides whether to hide them, show them, or make them part of the work.
- **Identify every organism by one identifier.** Map source names and IDs onto a single organism identifier before loading. Keep unmatched names and flag them; do not drop them silently.
- **Keep links at the source's level.** Do not push a genus-level link down to species without marking it as derived.
- **Keep one canonical copy of each network.** Sources copy one another heavily. Group copies by content, prefer the copy closest to the original deposit, and record the others as provenance. The full rule is in [datasets.md](datasets.md#duplicate-networks).
- **Compute likeness only between near neighbours.** Store each organism's few nearest neighbours in trait space, not similarity between all pairs.
- **Store licences, not restricted media.** Keep the licence on every connection, and on every media item separately, since the two often differ. Link to media instead of copying it, unless its own licence allows copying (see [datasets.md](datasets.md#sound-licences)). Leave out sources that need permission (for example ethnobotanical records of Indigenous knowledge) until we have permission.

## Querying

The interface should support:
- the neighbours of a node, filtered by kind, basis, source or quality flag;
- paths between two nodes, with ranking that discounts very common nodes ("hubs") and prefers paths that cross several kinds of connection;
- every connection near a given place or within a given period.

## Steps

1. Map the seed set onto common identifiers.
2. Load interaction links from GloBI and Mangal.
3. Add likeness links from trait databases.
4. Add shared-substance and shared-culture links from Wikidata and museum APIs.
5. Add word and motif links where they can be matched reliably.
6. Build a minimal query interface over the result.

Steps 1–3 produce the first usable version. Each later step adds kinds of connection without changing the model.

## Requirements for choosing a stack

- **Size:** tens of thousands of connections at first, possibly millions later.
- **Path queries:** they must be fast enough for interactive use.
- **Browser:** creative pieces may need to query the graph in a browser, possibly without a server.
- **Wikidata:** some connections may be fetched live from Wikidata, cached, and merged with stored data.
- **Re-running:** each step's import should be reproducible from the original sources.
- **Licences:** licence and source must stay attached to each connection through every step.

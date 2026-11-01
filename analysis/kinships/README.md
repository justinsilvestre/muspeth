# Same organisms, several trees

This sprint grouped one set of organisms in several ways and compared the groupings. One grouping is by descent. The others are by each kind of connection: interaction, likeness, shared substance, shared culture, shared words and stories, and shared place and sound. The **Several trees** view (`/kinships`) shows the result. The measures are in `src/shared/kinships/` and `src/worker/kinshipQueries.ts`.

## Why

The readings converged on a point the project's first framing missed:
- **SEP, "Species"** (§3–4): biologists use more than 20 species concepts, and pluralists hold that different processes really do divide life differently. Several of these concepts rest on relations, such as gene flow, a shared niche or cohesion, rather than on ancestry or resemblance.
- **Bridle**, *Ways of Being*, ch. 3: "different genes give different trees".
- **Tsing**, ch. 17: species boundaries depend "on what you are dividing species for".

The sprint asked whether several trees of the same organisms would read as revelation or as noise. It also asked whether groupings without ancestry fall back on surface resemblance, the worry in the team's starting notes.

## Method

- **The organisms.** The view takes organisms placed in the GBIF taxonomy and connected in at least four of the six kinds. From each taxonomic class it keeps the four connected in the most kinds, and then by the most connections, up to 32 in all. The current database yields 27 organisms, and so 351 pairs.
- **Distance by descent.** The share of two organisms' lineages, from kingdom down, that they do not have in common. Organisms in different kingdoms are as far apart as possible.
- **Distance by a kind of connection.** The share of neighbours through that kind that two organisms do not have in common (the Jaccard distance), such as pollinators, compounds, artworks, words or places. A direct link between the two counts as shared. An organism with no neighbours of that kind is as far as possible from every other.
- **Trees.** Each grouping's distances are joined into a tree by average linkage (UPGMA). Joins between groups that share nothing are drawn dotted, since the method joins them only because it must.
- **Agreement.** The correlation between the distances two groupings give every pair. A grouping with fewer than 10 pairs sharing anything is not compared.

None of the groupings by connection is a measure of resemblance. Each counts relations that two organisms have in common: the same partners, the same molecules, the same names. They answer the worry about falling back on surface similarity, at least in their construction.

## Findings

### Few pairs share anything, except by descent

| Grouping | Pairs sharing something (of 351) |
|---|---|
| descent | 115 |
| shared substance | 50 |
| interaction | 37 |
| shared words and stories | 30 |
| shared place and sound | 22 |
| likeness | 3 |
| shared culture | 2 |

Likeness and culture say almost nothing at this scale. Likeness data reaches only birds, mammals and fungi. Each artwork depicts only a few organisms, so artworks rarely link two of these 27. The instrument limits which kinships can be seen, as the composition study found.

### The groupings mostly disagree

- **Descent agrees only weakly with every other grouping:** 0.38 with shared substance, 0.36 with words, 0.32 with interaction and 0.17 with place and sound.
- **Interaction and words agree most, at 0.50.** Organisms that share partners also tend to share names, perhaps because names such as "bumble bee" or "pine" follow ways of life that people notice.
- **Shared substance agrees with almost nothing but descent** (0.11 with interaction, 0.03 with words, 0.04 with place). Chemistry groups organisms its own way.

So each tree tells a different story, as the pluralists would expect. The story is not random: each grouping can be traced to the relations that build it.

### The matsutake's kin are mushrooms by descent and pines by every other measure

- **By descent,** its closest kin are other mushroom-forming fungi: *Amanita flavoconia* (57% of lineage shared), jelly rot and bitter tooth.
- **By shared substance,** they are conifers: eastern white pine, Scots pine and Norway spruce. It shares α-pinene and 1-octen-3-ol, the compound that gives mushrooms their smell, with eastern white pine.
- **By words,** its closest kin is the longleaf pine, through the Japanese word マツ, "pine". The matsutake's own name means "pine mushroom".
- **By interaction,** they are bread wheat, Scots pine and pine-oak gall rust.

Across three kinds of relation, the matsutake gathers with pines, which descent places in another kingdom. This is close to Tsing's sense of an assemblage: kinship made by living together, not by origin.

### Noise can make kin

Bread wheat is the matsutake's closest kin by interaction because of one GloBI record calling it a "symbiont of" wheat. It is probably noise, like the soybean record noted in the dataset survey, and it carries no quality flag. One doubtful record decides a whole branch of the tree. A grouping built on few relations is only as good as each of them.

## Limits

- **Neighbours are counted one step away.** Two organisms whose names share a word only through a borrowing chain do not count as sharing it.
- **Common neighbours weigh as much as rare ones.** A compound found in most plants brings them as close as a rare one would.
- **The set favours well-connected organisms**, which the composition study showed are mostly insects, flowering plants and the organisms people write about.
- **Descent is measured by taxonomic rank, not by time since divergence.**
- **Ties are broken by order.** Where many pairs share nothing, the shape of the dotted part of a tree is arbitrary.

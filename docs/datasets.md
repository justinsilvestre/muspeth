# Dataset survey

This document surveys data sources for showing connections between organisms, and sets out criteria for judging them. All figures, samples and licence terms were checked against live queries and primary sources on 2026-10-20, except where marked *unconfirmed*.

## 1. Criteria

A useful dataset is **any data that connects organisms across the lines drawn by the phylogenetic tree**. Records of ecological interaction are only one kind of connection. The sources below show at least six:

| Kind of connection | What it says | Example datasets |
|---|---|---|
| Interaction | "these organisms act on each other" | GloBI, Mangal, Web of Life, FungalTraits `Specific_hosts` |
| Likeness | "these organisms live alike, though unrelated" | EltonTraits, AVONET, AnAge, FungalTraits lifestyles |
| Shared substance | "these organisms are made of the same molecules" | Wikidata "found in taxon" (P703) |
| Shared culture | "people made things from, or about, these organisms" | museum APIs, Wikidata P1672 and P180, ethnobotany |
| Shared words and stories | "names and myths passed between peoples along with the organisms" | WOLD loanwords, vernacular names, Thompson Motif-Index |
| Shared place and sound | "these organisms are heard and seen in the same place at the same time" | GBIF occurrences and sound recordings |

A dataset is promising when it scores well on these questions:

1. **Which kinds of connection does it encode?** Several kinds in one source, or one kind that joins easily with others, is best.
2. **How far across the tree do its connections reach?** Links between kingdoms are more valuable than links within one genus.
3. **Does it include humans, or human things?** This serves the aim of showing that the plight of other species is not separate from our own.
4. **Does it hold tension as well as harmony?** Parasitism, predation and loss sit beside mutualism and use. This is Tsing's polyphony, not a harmonious "community".
5. **Can it be sensed?** Look for numeric columns that map onto pitch, tempo or form, and for recordings, images or prose that can be presented directly.
6. **Can it be joined to other data?** Shared identifiers make layering possible: Wikidata Q-ids, GBIF keys, NCBI ids.
7. **Is it practical and ethical to use?** That means size, noise, licence, and consent where Indigenous knowledge is involved.

**The history of the data is itself material.** Who observed what, where, and when leaves strong traces. For example, GBIF holds 5,636 matsutake records from Sweden and only 393 from Japan. That reflects where citizen science is popular, not where matsutake matters most. Such biases could be shown openly instead of hidden.

## 2. What the data looks like

### Interaction databases

**GloBI** (Global Biotic Interactions)
- **Coverage:** about 26.6 million interaction records, merged from 440 source datasets.
- **Access:** a REST API that returns CSV or JSON, or a 2.7 GB gzipped TSV dump with 92 columns.
- **Relation vocabulary:** taken from the OBO Relation Ontology, with about 40 types, for example `eats`, `parasiteOf`, `pathogenOf`, `vectorOf`, `pollinates`, `symbiontOf` and `hasHost`.
- **Licence:** the compiled data products are CC0 (Zenodo record 22691479). GloBI asks users to cite each original dataset (listed in its `citations` file) and the GloBI paper (Poelen, Simons & Mungall 2014). Source datasets may carry their own terms, which must be checked one by one.
- **Overlap:** GloBI contains all of Mangal and all of Web of Life, re-imported without network identity (see section 4).

```
sourceTaxonName      Leontopithecus chrysomelas   (golden-headed lion tamarin)
interactionTypeName  eats
targetTaxonName      Rheedia fruit                targetBodyPartName: fruit
decimalLatitude      -15.1    decimalLongitude: -39.03
localityName         Una Biological Reserve in Southern Bahia, Brazil
referenceCitation    Raboy & Dietz, "Diet, Foraging, and Use of Space in Wild Golden-headed…"
```

- **Usual uses:** the R package rglobi, food-web maps, and parasite–host studies. No art or sonification precedent is known.
- **Strength:** breadth. You can start from any organism and walk outward.
- **Weaknesses:**
  - Most records lack coordinates or dates: only 6.5% have coordinates and 3.5% have dates.
  - The API returns each link from both sides (for example `parasiteOf` and `hasParasite`).
  - Some records are noise. Matsutake is listed as a "symbiont" of a fossil sea snail and of soybean. Some name fields contain DOIs.

**Mangal**
- **Coverage:** 1,487 networks, each a single study at a single site and date, with 146,000 interactions in all.
- **Access:** a REST API that returns JSON.
- **Relation types:** predation, mutualism, herbivory, parasitism, detritivory and scavenging.
- **Weights:** many links carry one, such as visit counts, diet fractions or fleas per host.
- **Licence:** CC0 by default, or the licence of the original deposit where there is one.
- **Overlap:** 193 of its networks (13%) are copies of Web of Life networks.

```
network      {"id":19, "date":"1899-07-01", "geom":{"type":"Point","coordinates":[-89.88,39.28]},
              "description":"Insects observed pollinating flowers, ten miles of Carlinville, Illinois"}
interaction  {"node_from":21356, "node_to":21368, "type":"mutualism", "value":1,
              "attribute":{"name":"mean interaction frequency"}}
node         {"original_name":"mollusks", "taxonomy":{"name":"Mollusca","rank":"phylum"}}
```

- **Strength:** it is the only source with several relation types inside one place and time. That makes it the natural home for scope A.
- **Weaknesses:**
  - Some nodes are coarse, such as "mollusks" or "D2: fishery offal".
  - Pagination is unstable unless you pass `sort=id`.

**Web of Life** (Bascompte lab)
- **Coverage:** 324 networks: mostly pollination, plus host–parasite, seed dispersal and food webs.
- **Format:** each network is a species × species matrix in CSV, plus a JSON edge list.
- **Japanese networks:** nine, including several near Kyoto, Mt. Yufu and Yakushima.
- **Licence:** no formal licence. Use is free, on condition that the work credits Web of Life (www.web-of-life.es) and preferably each network's original authors.

```
M_PL_053.csv   "",           "Aldrichina grahami", "Allobaccha apicalis", …
               "Abelia serrata",  0,                  0,                    …
```

- **Strength:** the matrix maps directly onto a step sequencer or two rings of nodes.
- **Weakness:** only one relation type per network.

### Trait databases

Trait tables describe each organism separately. Comparing organisms across lineages turns those descriptions into kinship.

**EltonTraits 1.0** (CC0)
- **Coverage:** 9,993 birds and 5,400 mammals, in tab-separated files.
- **Columns:** the diet as ten percentages (invertebrates, fish, carrion, fruit, nectar, seed and so on), foraging height, activity time and body mass.

```
Archilochus colubris (ruby-throated hummingbird)  Inv 40 … Nect 60 …  understory 40 midhigh 40 aerial 20  3.09 g
Ornithorhynchus anatinus (platypus)               Inv 80 … Vfish 20 …                                     1484 g
```

Pairing each bird with its nearest mammal by diet and body mass gives, for example:

| Bird | Mammal |
|---|---|
| griffon vulture | Tasmanian devil |
| tawny owl | European mink |
| green woodpecker | a galago |
| ostrich | wild boar |
| ruby-throated hummingbird | nectar bats |

**AVONET** (CC BY)
- **Coverage:** about 11,000 bird species.
- **Columns:**
  - beak length, width and depth;
  - wing length and hand-wing index (how long and pointed the wing is);
  - tarsus (lower leg) and tail length;
  - mass, habitat, trophic niche and range centroid.
- **Relevant precedent:** it has been used to study convergence, where unrelated birds evolve the same shapes for the same jobs (Pigot et al. 2020).

**AnAge** (CC BY 3.0)
- **Coverage:** 4,645 species, almost all animals, plus a few plants, fungi and one bacterium.
- **Columns:** maximum lifespan, metabolic rate, body mass and body temperature.

```
Pinus longaeva (bristlecone pine)   max longevity 5062 yrs
Arctica islandica (ocean quahog)    507 yrs
Homo sapiens                        122.5 yrs   82.78 W   310.15 K
Escherichia coli                    0.01 yrs
```

**FungalTraits** (Põlme et al. 2020)
- **Coverage:** one row per fungal genus, 10,414 genera, in an xlsx file.
- **Columns:** lifestyle, decay substrate, fruitbody type, ectomycorrhizal lineage, and `Specific_hosts`. The last is a relation column, filled for about 600 genera.
- **Licence:** none stated. The paper says the data are "available for public use". A CSV copy is kept at github.com/globalbioticinteractions/fungaltraits.

```
Termitomyces    litter_saprotroph   termite_symbiont   agaricoid
Chalciporus     mycoparasite        Specific_hosts = Amanita
Tzeanania       mycoparasite        Specific_hosts = Ophiocordyceps   (which in turn parasitises insects)
```

**fun^fun** (traitecoevo/fungaltraits, MIT licence)
- **Format:** a 51,000-row long table, one trait value per row: spore size, fruiting body size, melanin content, and gene counts such as chitinase.
- **Shared-chemistry note:** chitinase is an enzyme that breaks down chitin. Chitin is also the material of insect exoskeletons, a kinship of material between fungi and insects.

**Open Traits Network**
- **What it is:** a registry and community, not a database.
- **Listed datasets that cross kingdoms:**
  - GlobTherm: heat and cold tolerance for 2,133 species of algae, plants, fungi and animals.
  - Phenotypes for about 170,000 bacterial and archaeal strains.
  - Dive durations of 286 air-breathing animals.
  - Floral structure (eFLOWER).

**Other sources**
- **AmphiBIO** (CC BY): 6,776 amphibians, with diet flags compatible with EltonTraits.
- **COMBINE** (CC BY, figshare 10.6084/m9.figshare.13028255): about 6,200 mammals, with reported and imputed traits and a taxonomy crosswalk.
- **Bird song:**
  - Mikula et al. 2021 (CC BY, osf.io/fa9ky) gives song frequency for about 5,000 passerine species. The authors ask to be contacted before substantial reuse.
  - Pearse et al. 2018 (CC0, Dryad 10.5061/dryad.9sk4v) gives acoustic measures of xeno-canto recordings for about 578 species.
- **TRY** (CC BY): 22.9 million plant trait records. Access needs free registration and a request for specific traits and species; there is no instant bulk download.
- **BIEN:** plant traits through an R package. The licence is unclear: the project's policy page says CC BY-NC-ND, while its package documentation says CC BY.
- **FReD** (reflectance.co.uk): over 2,000 floral reflectance spectra, which describe colour as a bee sees it. Open access with citation of Arnold et al. 2010, but search forms only; bulk use means asking the maintainer.
- **Encyclopedia of Life TraitBank:** a large merged trait graph. Bulk downloads are on Zenodo: all trait data (592 MB, licence unstated) and graph database dumps (about 15 GB, CC BY). Its query API needs a token issued by EOL staff.
- **Lau & Oakley 2021:** count at least 94 independent origins of bioluminescence. The article is not open access, and no machine-readable table of luminous lineages is publicly deposited.

### Cultural, linguistic and sensory datasets

**Wikidata** (CC0, queried live in SPARQL from the browser)

Artwork links ("depicts", P180) are sparse for single species: one work for matsutake, none for red pine. Two other properties are more useful:
- **"found in taxon" (P703):** 2.9 million links between chemical compounds and organisms. Red pine and *Homo sapiens* share 26 listed compounds, for example α-pinene and limonene.
- **"this taxon is source of" (P1672):** for the honey bee, it lists honey, beeswax, propolis, royal jelly, venom, and "smell of honeycomb".

**Museum open-access APIs**
- **Cleveland Museum of Art** (CC0). The search pine + Japan + painting returns 15 works with curatorial prose:
  > "Aged Pine", Edo period, hanging scroll; ink on paper. "The ancient pine … symbolizes the desirable human qualities of wisdom and solid moral character."
- **The Met.** Subject tags carry Wikidata ids, so they join to the Wikidata section above. Counts: Insects 631, Cranes 356, Bees 64.
- **Smithsonian Open Access** (CC0). Material culture with culture and place recorded, for example Dayak bark-cloth from Borneo.

**WOLD, World Loanword Database** (CC BY)
- **Coverage:** 41 languages and about 1,460 meanings. Each word is marked borrowed or not, with the period and the contact situation.
- **Words for pine:** borrowed in Hawaiian `paina`, Yaqui `piino` and Quechua `pinu`.
- **Words for bee:** borrowed in Takia `hanibi`.

```
Takia  hanibi  "the bee"  Borrowed: clearly borrowed  Age: Modern period
               salience: present only since contact   contact_situation: Contact with the Western world
```

The field `present only since contact` records the word and the organism arriving together. This puts the linguistics note about borrowing and creolization into species terms.

**Vernacular names** (GBIF and iNaturalist)
- **Coverage:** matsutake has 37 names, including Northern Sámi `hádjaguoppar` and Swedish `goliatmusseron` ("goliath mushroom").
- **How names travel:**
  - Some languages borrow the Japanese word: French `Matsutaké`.
  - Some build the name from the pine: Chinese `松茸` and Korean `송이`.
  - Some coin their own.

**Thompson Motif-Index** (as CSV, CC BY)
- **Coverage:** 46,299 folklore motifs, each with references to cultures. 1,400 of them concern transformation, including 206 of a human turning into an animal.

```
A2012.0.1.  Creation of honey-bees: transformed man.   (India)
D215.       Transformation: man to tree.
B631.       Human offspring from marriage to animal.
```

**Sound recordings via GBIF** (no API key needed)
- **Coverage:** 2.2 million geotagged recordings mirrored from xeno-canto, iNaturalist and Observation.org.
- **Metadata:** each recording is labelled with behaviour (song, call, alarm), sex and life stage.
- **Example:** 619 recordings of the uguisu (Japanese bush warbler) from Japan.
- **Licence:** about 90% of recordings forbid commercial use, and many also forbid adaptation (see section 4).

**Harder to use**
- **Moerman's Native American Ethnobotany database:** web search only.
  ```
  Pinus ponderosa | Blackfoot | Food | Inner bark used for food.
  ```
  It holds Indigenous knowledge, so ask before reusing it.
- **D-PLACE:** cultural variables at the level of whole societies, not species.
- **MGnify:** 38,000 human-associated microbiome samples. Per-sample taxonomy tables are not straightforward to retrieve through its API.
- **HGTree:** genes transferred sideways between prokaryotes, about 6.4 million.
- **No open, machine-readable source known:** kigo (haiku seasonal words) and lichen symbiosis data.

## 3. Candidate artifacts

Each candidate names its scope, its data and the kinds of connection it uses. The forms are suggestions only.

### Scope A: a few organisms, tightly bound

- **Matsutake, red pine, pinewood nematode, sawyer beetle** (GloBI, plus FungalTraits for the fungal side).
  - The cycle:
    - Matsutake feeds the pine.
    - The nematode kills the pine.
    - About ten *Monochamus* beetle species carry the nematode.
    - Fungi and bacteria attack the beetle and the nematode in turn.
  - Why it fits: it is Tsing's own example, with clear "livable and killing" tension. Wikidata adds the shared compounds of pine and human. GBIF adds the matsutake names that travelled from Japanese into other languages, and the Swedish records outnumbering the Japanese.
- **Rotting logs in Duke Forest, 1939** (Mangal 1494–1497).
  - The network: herbivores, predators, parasites and scavengers around fungi, on logs at different stages of decay.
  - Why it fits: the stages form a time series of one assemblage as a log decays. Small enough to show completely.
- **A chain of fungi on fungi** (FungalTraits).
  - The chain: *Tzeanania* parasitises *Ophiocordyceps*, which parasitises insects. Termites farm *Termitomyces*.
  - Why it fits: it is a chain of organisms living on and inside one another, which works against the idea of separate individuals.
- **The honey bee as a hub of culture** (Wikidata, WOLD, the Motif-Index, the Met).
  - The material:
    - the products made from it, listed by Wikidata;
    - its name borrowed into other languages;
    - myths in which bees come from transformed humans;
    - 64 museum objects tagged "Bees" at the Met.
  - Why it fits: one organism, followed through human culture in depth.

### Scope B: many organisms, wide connections

- **Kinship by diet** (EltonTraits and AmphiBIO).
  - The idea: about 16,000 birds, mammals and amphibians placed by what they eat and how large they are, not by ancestry.
  - Why it fits: it immediately produces surprising pairs (vulture and Tasmanian devil). Each diet can sound as a chord, so two animals that eat alike sound alike.
- **Organisms on their own clocks** (AnAge, GlobTherm).
  - The idea: each organism pulses at a rate set by its lifespan or metabolism. Organisms with similar clocks fall into step across kingdoms. *E. coli* is a blur and the bristlecone pine almost still.
  - Why it fits: it is a direct reading of polyphony as independent voices that sometimes align.
- **Shared molecules** (Wikidata P703).
  - The idea: start from a human and walk through shared compounds to pines, tomatoes and cannabis.
  - Why it fits: it is the most direct "you are made of them" connection. It can be queried live.
- **Jena grassland food web** (Mangal 5013).
  - The network: 714 organisms and 51,000 links of five relation types. Fungi appear only as a single generic node.
  - Why it fits: it is the widest single-site network in Mangal with several relation types.
- **A soundscape of one place** (GBIF recordings and occurrences, for example a Kyoto pollination network from Web of Life).
  - The idea: the organisms of one network, heard through real field recordings, layered by place and season.

## 4. Practical notes

### Duplicate networks

The interaction sources copy one another heavily:
- **All of Mangal and all of Web of Life are in GloBI.** GloBI's copies drop the identity of each network and keep only its citation. Its copy of Mangal also repeats some links up to four times.
- **Mangal and Web of Life overlap.** 193 Mangal networks (13%, holding 31% of Mangal's links) are copies of Web of Life networks. That is 56% of Web of Life.
- **Mangal duplicates itself** in a few places (for example cruz_2007 and cruz_escalona_2007).
- **Some studies exist many times over.** Robertson's 1929 pollination survey appears five times across the three sources.

**Copies are not always identical.**
- **Splits and merges:** a study may be split into site or year networks in one source and merged in another. Bartomeus 2008 is 12 networks in Mangal and one in Web of Life.
- **Different weights:** some copies are weighted and others binary.
- **Reversed direction:** the same link can point opposite ways in different copies.

**Matching:** citations alone are unreliable. Two different networks can share an author and year, and identical networks can have differently formatted citations.

**Rule for one canonical copy:**
1. **Group copies by content.** Compare normalised species names, node and edge counts, and the number of links each species has. Treat a matching citation as a candidate only.
2. **Prefer the copy closest to the original deposit.** The order is: an author's own deposit, then a curated collection (Web of Life, IWDB, GlobalWeb), then Mangal, then GloBI.
3. **Within that order, prefer:** weighted links over binary; per-link relation types, dates and taxonomy IDs; and finer site or year slices over a merged network.
4. **Never use GloBI's re-imports of Mangal, Web of Life or GlobalWeb.** Take only GloBI's other sources.
5. **Make link direction consistent** with the relation type (for example consumer → resource) before comparing links.
6. **Record every copy of a canonical network** as its provenance.

In practice, this usually means keeping Web of Life's structure and weights and adding Mangal's taxonomy, dates and relation types.

### Sound licences

This is not legal advice. Of the 2.2 million recordings in GBIF, about 10% are licensed CC0, CC BY or CC BY-SA. Those can be hosted, edited and layered with credit. Almost all of them come from iNaturalist, with a large group of CC0 bat recordings from the Royal Belgian Institute of Natural Sciences.

| Source | Typical licence of each recording |
|---|---|
| iNaturalist | CC BY-NC about 80%; CC BY about 15%; CC0 about 5% |
| xeno-canto (birds) | CC BY-NC-SA about 85%; CC BY-NC-ND about 15% |
| Observation.org | CC BY-NC-ND about 94% |
| Watkins Marine Mammal Sound Database | personal or academic use only; no reposting (*unconfirmed*: the terms page was offline) |
| Macaulay Library | not openly licensed; use requires a request |
| Wikimedia Commons | CC0, CC BY or CC BY-SA only |

Points that follow:
- **Check the licence of each recording, not of the record.** GBIF's record-level licence often differs from the licence of the attached sound. Some collections tagged CC0 are in fact copyrighted.
- **"No derivatives" (ND) recordings can only be played unaltered.** Creative Commons treats filtering, pitch-shifting or mixing them into a new work as adaptation. "Share-alike" (SA) recordings require the adapted sound to carry the same licence.
- **"Non-commercial" (NC) depends on the use, not the user.** A free public showing with no sponsors or ticket sales is likely non-commercial. Paid entry, sponsorship or sales make it doubtful, so the rights holder should be asked.
- **Streaming from the source does not avoid the licence terms.** In addition, the source servers appear not to allow cross-site audio processing in the browser (*unconfirmed*).
- **Attribution must appear in the piece itself:** title, recordist, source link and licence for each recording.

**Options for the sound of a piece, best first:**
1. Use CC0, CC BY and CC BY-SA recordings only, keeping a list of each file's licence and credit. Coverage is uneven: for the uguisu, about 180 of 940 recordings qualify.
2. Synthesize sound from data such as song frequency or diet.
3. Ask individual recordists for permission for key species.
4. For a free, non-commercial or academic showing, add CC BY-NC and CC BY-NC-SA recordings. Use ND recordings only unaltered.

### Noise and bias

Doubtful records (unmatched names, placeholder species, suspected errors) and known sampling biases are kept and flagged, not removed. Each piece decides whether to hide them, show them, or make them part of the work.

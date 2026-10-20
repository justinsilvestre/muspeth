/**
 * The quality flags that connections and taxon placements may carry, each with what it means.
 * A flag marks a doubt about a record, which is kept rather than dropped.
 */
export const qualityFlags = {
  hand_entered_sample: "Entered by hand as part of the sample, not imported from a source.",
  unmatched_name: "The source could not match an organism's name to a known taxon.",
  ambiguous_wikidata_id: "Several Wikidata items fit an organism's name equally well.",
  fuzzy_name_match: "GBIF matched an organism's name only approximately.",
  higher_rank_match: "GBIF matched an organism only to a taxon above its own rank.",
  synonym_name: "GBIF lists an organism's name as a synonym of another.",
  globi_lineage_hint: "GBIF's match was chosen using the lineage that GloBI gives for the name.",
  derived_from_coarser_level:
    "The connection was pushed down from the coarser taxonomic level its source reports.",
  placeholder_species:
    "The source names an organism only by a placeholder, such as an unnamed morphospecies.",
  suspected_error:
    "The record is likely wrong, for example because it is biologically implausible.",
  sampling_bias: "The source is known to over- or under-represent some organisms or places.",
  duplicate_network_copy: "The connection comes from a copy of a network also held elsewhere.",
} satisfies Record<string, string>;

export type QualityFlag = keyof typeof qualityFlags;

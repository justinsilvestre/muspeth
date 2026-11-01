import type { QualityFlag } from "../src/shared/qualityFlags.ts";
import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";
import type { GeneTransfer } from "./grassGeneTransfers.ts";
import type { LikenessTemplate, TraitNode } from "./likenessConnections.ts";

type Template = Pick<LikenessTemplate, "licence" | "sources">;

/** The relation from a grass to a gene it received by lateral transfer. */
export const carriesRelation = "carries by lateral transfer";

/** The relation from a lineage of grasses to a gene that passed from it to another grass. */
export const gaveRelation = "gave by lateral transfer";

/**
 * Makes a node of each transferred gene, as a substance the grasses share, and links it to the
 * grasses it was found in and to the lineage it came from. A grass or lineage that was not
 * identified is skipped.
 */
export function toGeneTransferDrafts(
  transfers: GeneTransfer[],
  organismNodesByName: Map<string, TraitNode[]>,
  template: Template,
) {
  const nodes = transfers.map(toGeneNode);
  const connections = transfers.flatMap((transfer) => {
    const geneId = toGeneNode(transfer).id;
    const link = (organism: TraitNode, relation: string, rank: string, flags: QualityFlag[]) =>
      ({
        ...template,
        sourceNodeId: organism.nodeId,
        targetNodeId: geneId,
        kind: "shared_substance",
        relation,
        basis: "observed",
        taxonomicLevel: rank,
        qualityFlags: [...new Set([...organism.qualityFlags, ...flags])],
      }) satisfies ConnectionDraft;
    const carriers = transfer.recipients.flatMap((recipient) =>
      (organismNodesByName.get(recipient.name) ?? []).map((node) =>
        link(node, carriesRelation, recipient.rank, recipient.qualityFlags),
      ),
    );
    const givers = (organismNodesByName.get(transfer.donor?.name ?? "") ?? []).map((node) =>
      link(node, gaveRelation, transfer.donor?.rank ?? "tribe", []),
    );
    return [...carriers, ...givers];
  });
  return { nodes, connections };
}

/** Names a gene by the protein it codes for and its identifier in the first genome it was found in. */
export function toGeneNode({ id, geneId, protein }: GeneTransfer) {
  return {
    id: `grass-gene-transfers:${id}`,
    kind: "compound",
    label: `${protein ?? "Unannotated gene"} (${geneId})`,
    names: [],
  } satisfies NodeDraft;
}

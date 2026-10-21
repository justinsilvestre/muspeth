import type { ConnectionDraft, NodeDraft } from "./graphDrafts.ts";
import { toStoryConnection } from "./storyConnection.ts";
import { choosePermissiveLicence, type OrganismName } from "./vernacularNames.ts";
import { findWordInName, toNameElement, toWordId, type WordForm } from "./wordForms.ts";

type NameLink = { connection: ConnectionDraft; form: WordForm };

/**
 * Links organisms to the words their names are made of,
 * wherever another organism's name shares the word, or the word is one of `knownForms`.
 * A name that is the word itself gives "named by".
 * A name that contains it gives "name contains", flagged as a text match.
 * For example, the genus Pinus is named by "pine", and the Japanese red pine's name contains it.
 * Each word keeps at most `containedLimit` "name contains" links.
 * Each organism also gains its names as node names.
 */
export function toNameWordImport(
  names: OrganismName[],
  knownForms: WordForm[],
  labelsById: Map<string, string>,
  containedLimit: number,
) {
  const forms = [...knownForms, ...findSharedElements(names)];
  const uniqueForms = [...new Map(forms.map((form) => [toWordId(form), form])).values()];
  const links = limitContainedLinks(mergeLinks(linkNames(names, uniqueForms)), containedLimit);
  return {
    nodes: [...toOrganismDrafts(names, labelsById), ...toWordDrafts(links)],
    connections: links.map(({ connection }) => connection),
  };
}

/** Finds the name elements that occur in a name of some other organism in the same language. */
function findSharedElements(names: OrganismName[]) {
  const namesByLanguage = Map.groupBy(names, ({ language }) => language);
  return names.flatMap((name) => {
    const form = { language: name.language, form: toNameElement(name.name, name.rank) };
    const isShared = (namesByLanguage.get(name.language) ?? []).some(
      (other) => other.nodeId !== name.nodeId && findWordInName(form.form, other.name) !== null,
    );
    return isShared ? [form] : [];
  });
}

function linkNames(names: OrganismName[], forms: WordForm[]) {
  const formsByLanguage = Map.groupBy(forms, ({ language }) => language);
  return names.flatMap((name) =>
    (formsByLanguage.get(name.language) ?? []).flatMap((form) => linkName(name, form)),
  );
}

function linkName(name: OrganismName, form: WordForm): NameLink[] {
  const isExact = findWordInName(form.form, toNameElement(name.name, name.rank)) === "exact";
  if (!isExact && findWordInName(form.form, name.name) !== "contained") return [];
  const connection = toStoryConnection({
    sourceNodeId: name.nodeId,
    targetNodeId: toWordId(form),
    relation: isExact ? "named by" : "name contains",
    taxonomicLevel: name.rank,
    licence: name.licence,
    qualityFlags: isExact ? [] : ["text_match"],
    sources: name.sources,
  });
  return [{ connection, form }];
}

/** Keeps one link per organism and word, preferring "named by" and pooling the checklists. */
function mergeLinks(links: NameLink[]) {
  const merged = new Map<string, NameLink>();
  for (const link of links) {
    const { sourceNodeId, targetNodeId, relation } = link.connection;
    const key = `${sourceNodeId}\n${targetNodeId}`;
    const existing = merged.get(key);
    if (!existing || (relation === "named by" && existing.connection.relation !== relation)) {
      merged.set(key, link);
    } else if (existing.connection.relation === relation) {
      merged.set(key, {
        ...existing,
        connection: poolSources(existing.connection, link.connection),
      });
    }
  }
  return [...merged.values()];
}

function poolSources(first: ConnectionDraft, second: ConnectionDraft) {
  const sources = [...first.sources, ...second.sources];
  return {
    ...first,
    licence: choosePermissiveLicence([first.licence, second.licence]),
    sources: [...new Map(sources.map((source) => [source.datasetId, source])).values()],
  };
}

function limitContainedLinks(links: NameLink[], containedLimit: number) {
  const containedCounts = new Map<string, number>();
  const sorted = [...links].sort((a, b) =>
    a.connection.sourceNodeId.localeCompare(b.connection.sourceNodeId),
  );
  return sorted.filter(({ connection: { targetNodeId, relation } }) => {
    if (relation !== "name contains") return true;
    const count = containedCounts.get(targetNodeId) ?? 0;
    containedCounts.set(targetNodeId, count + 1);
    return count < containedLimit;
  });
}

function toWordDrafts(links: NameLink[]) {
  return links.map(
    ({ form }) =>
      ({
        id: toWordId(form),
        kind: "word",
        label: form.form,
        names: [{ language: form.language, name: form.form }],
      }) satisfies NodeDraft,
  );
}

function toOrganismDrafts(names: OrganismName[], labelsById: Map<string, string>) {
  return [...new Set(names.map(({ nodeId }) => nodeId))].map(
    (nodeId) =>
      ({
        id: nodeId,
        kind: "organism",
        label: labelsById.get(nodeId) ?? nodeId,
        names: names
          .filter((name) => name.nodeId === nodeId)
          .map(({ language, name }) => ({ language, name })),
      }) satisfies NodeDraft,
  );
}

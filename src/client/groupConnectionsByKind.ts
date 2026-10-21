import { type Connection, type ConnectionKind, connectionKinds } from "../shared/graph";
import { relationLabel } from "./relationLabel";

/**
 * Groups a node's connections by kind, in the order of the kind vocabulary,
 * and within each kind by relation and direction, ordered by the relation's words
 * and then by the neighbour's name.
 */
export function groupConnectionsByKind(
  connections: Connection[],
  nameOf: (nodeId: string) => string,
) {
  const sortedConnections = sortByRelationAndNeighbor(connections, nameOf);
  return connectionKinds
    .map((kind) => groupKind(kind, sortedConnections))
    .filter((group) => group.count > 0);
}

function groupKind(kind: ConnectionKind, sortedConnections: Connection[]) {
  const connectionsOfKind = sortedConnections.filter((connection) => connection.kind === kind);
  return {
    kind,
    count: connectionsOfKind.length,
    relationGroups: groupRelations(connectionsOfKind),
  };
}

function groupRelations(sortedConnections: Connection[]) {
  const groups = Map.groupBy(
    sortedConnections,
    ({ relation, direction }) => `${relation} ${direction}`,
  );
  return [...groups.values()].map((connections) => ({
    relation: connections[0]?.relation ?? "",
    direction: connections[0]?.direction ?? "outgoing",
    connections,
  }));
}

function sortByRelationAndNeighbor(connections: Connection[], nameOf: (nodeId: string) => string) {
  const keyed = connections.map((connection) => ({
    connection,
    key: sortKeyOf(connection, nameOf),
  }));
  keyed.sort((first, second) => compareKeys(first.key, second.key));
  return keyed.map(({ connection }) => connection);
}

/** Puts outgoing connections before incoming ones of the same relation. */
function sortKeyOf(connection: Connection, nameOf: (nodeId: string) => string) {
  const directionRank = connection.direction === "outgoing" ? "0" : "1";
  return [relationLabel(connection.relation), directionRank, nameOf(connection.neighborId)];
}

function compareKeys(first: string[], second: string[]) {
  for (const [index, part] of first.entries()) {
    const order = part.localeCompare(second[index] ?? "");
    if (order !== 0) return order;
  }
  return 0;
}

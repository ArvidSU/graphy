import { Node, NodeID, Edge, EdgeID } from "@graphTypes/graphTypes";

export function getChildren( nodes: Record<NodeID, Node>, parentId: NodeID ): Node[] {
  const nodesList = Object.values( nodes );
  if ( !nodesList || nodesList.length === 0 ) return [];
  return Object.values( nodesList ).filter( n => n.parentId === parentId );
}

export function getEdgesOfNode( edges: Record<EdgeID, Edge>, nodeId: NodeID ): Edge[] {
  return Object.values( edges ).filter(
    e => e.source === nodeId || e.target === nodeId
  );
}

export function isNode( node: unknown ): node is Node {
  return (
    typeof node === "object" &&
    node !== null &&
    "id" in node &&
    "label" in node &&
    "shape" in node
  );
}
import { Node, Edge, GraphState, GraphView, MetaDataID, NodeID } from "@graphTypes/graphTypes";
import { getChildren, getEdgesOfNode } from "@logic/graphLogic";
import { GraphStore } from "@stores/useGraphStore";

export function selectLocalGraphView( state: GraphState ): GraphView {
  const { nodes, edges, currentRootId } = state;


  // Only include nodes that are direct children of currentRootId
  const visibleNodes = Object.values( nodes ).filter(
    ( node ) => node.parentId === currentRootId
  );

  const visibleNodeIds = new Set( visibleNodes.map( ( n ) => n.id ) );

  // Include edges where both ends are among the visible nodes
  const visibleEdges = Object.values( edges ).filter(
    ( edge ) =>
      visibleNodeIds.has( edge.source ) && visibleNodeIds.has( edge.target )
  );

  const selectedNode = nodes[ state.selectedNodeId ?? "" ];

  const currentRoot = nodes[ currentRootId ?? "" ];

  return {
    nodes: visibleNodes,
    edges: visibleEdges,
    selectedNode,
    currentRoot,
  };
}

export function selectNodeAdjacentData( nodeId: NodeID, state: GraphState ): {
  node: Node;
  parent?: Node;
  edges?: Edge[];
  children?: Node[];
  incomingNodes?: Node[];
  outgoingNodes?: Node[];
} {
  const { nodes, edges: stateEdges } = state;
  const node = nodes[ nodeId ?? "" ];
  const edges = getEdgesOfNode( stateEdges, nodeId ?? "" );
  const parent = nodes[ node.parentId ?? "" ];
  const children = getChildren( nodes, nodeId ?? "" );
  const incomingNodes = edges.filter( e => e.target === nodeId ).map( e => nodes[ e.source ] );
  const outgoingNodes = edges.filter( e => e.source === nodeId ).map( e => nodes[ e.target ] );
  return { node, parent, edges, children, incomingNodes, outgoingNodes };
}

export function selectKVPMetadata( id: MetaDataID ) {
  return ( state: GraphStore ) => {
    const node = Object.values( state.nodes ).find( ( n ) =>
      Object.prototype.hasOwnProperty.call( n.metadata, id )
    );

    if ( !node || node.type !== "key_value" ) return undefined;

    const metadata = node.metadata[ id ];
    return {
      id,
      key: metadata.key,
      value: metadata.value,
      belongsTo: node,
    };
  };
}
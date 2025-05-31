import { Node, NodeID, Edge, MetaDataKeyValue, EdgeID, KeyValueNode } from "../logic/graphTypes";
import { evaluate } from "mathjs";

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

/**
 * Collects metadata from incoming nodes and organizes it for evaluation
 * @param nodes All nodes in the graph
 * @param edges All edges in the graph
 * @param nodeId ID of the node to collect incoming metadata for
 * @returns Object with incoming metadata organized by source node ID
 */
export function collectIncomingMetadata(
  nodes: Record<NodeID, Node>,
  edges: Record<EdgeID, Edge>,
  nodeId: NodeID
): Record<NodeID, MetaDataKeyValue> {
  const incomingEdges = getEdgesOfNode( edges, nodeId ).filter( edge => edge.target === nodeId );
  const result: Record<NodeID, MetaDataKeyValue> = {};

  incomingEdges.forEach( edge => {
    const sourceNode = nodes[ edge.source ];
    if ( sourceNode?.type === "key_value" ) {
      const evaluatedMetadata = evaluateExpression( sourceNode as KeyValueNode );
      if ( evaluatedMetadata ) {
        result[ sourceNode.id ] = evaluatedMetadata;
      }
    }
  } );

  return result;
}

/**
 * Creates a combined scope for expression evaluation including local and incoming metadata
 * @param node Current node
 * @param incomingMetadata Metadata from incoming nodes
 * @returns Scope object for expression evaluation
 */
export function createEvaluationScope(
  node: KeyValueNode,
  incomingMetadata: Record<NodeID, MetaDataKeyValue>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  // Local scope from the node's own metadata
  const localScope = Object.entries( node.metadata ).reduce( ( acc, [ , kvp ] ) => {
    acc[ kvp.key ] = kvp.value;
    return acc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }, {} as Record<string, any> );

  // Add incoming metadata with node prefixes
  Object.entries( incomingMetadata ).forEach( ( [ nodeId, metadata ] ) => {
    const nodeLabel = `n${nodeId.substring( 0, 4 )}`; // Create a shorter reference name
    Object.values( metadata ).forEach( kvp => {
      localScope[ `${nodeLabel}.${kvp.key}` ] = kvp.value;
    } );
  } );

  return localScope;
}

export function evaluateExpressionWithContext(
  node: KeyValueNode,
  incomingMetadata: Record<NodeID, MetaDataKeyValue>
): MetaDataKeyValue {
  const results: MetaDataKeyValue = {};
  const scope = createEvaluationScope( node, incomingMetadata );

  for ( const [ id, kvp ] of Object.entries( node.metadata ) ) {
    const { key, value } = kvp;
    if ( !value.startsWith( "=" ) ) {
      results[ id ] = { key, value };
      continue;
    }

    const expression = value.slice( 1 ).trim();

    try {
      // Replace references like $n1234.property with actual values from scope
      const processedExpression = expression.replace( /\$([a-zA-Z0-9]+)\.([a-zA-Z0-9_]+)/g, ( match, nodeRef, property ) => {
        const refKey = `${nodeRef}.${property}`;
        return scope[ refKey ] !== undefined ? scope[ refKey ] : match;
      } );

      const result = evaluate( processedExpression, scope ) as string;
      results[ id ] = { key, value: result.toString() };
    } catch ( error ) {
      console.error( 'Error evaluating expression:', error );
      results[ id ] = { key, value: `Error: ${error}` };
    }
  }

  return results;
}

export function evaluateExpression( node: KeyValueNode ): MetaDataKeyValue | undefined {

  const results: MetaDataKeyValue = {};

  for ( const [ id, kvp ] of Object.entries( node.metadata ) ) {
    const { key, value } = kvp;
    if ( !value.startsWith( "=" ) ) {
      results[ id ] = { key, value };
      continue;
    }
    const expression = value.slice( 1 ).trim();
    const scope = Object.fromEntries( Object.entries( node.metadata ).map( ( [ k, v ] ) => [ k, v.value ] ) );

    try {
      const result = evaluate( expression, scope ) as string;
      results[ id ] = { key, value: result }
    } catch ( error ) {
      console.error( 'Error evaluating expression:', error );
    }
  }
  return results
}
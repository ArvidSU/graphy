import {
  Node, NodeID, GraphState
} from "@graphTypes/graphTypes";
import { nanoid } from "nanoid";
import { GraphSetState, GraphGetState } from "./storeTypes";

// Create a deep partial type for nested objects
type DeepPartial<T> = {
  [ P in keyof T ]?: T[ P ] extends object ? DeepPartial<T[ P ]> : T[ P ];
};

export type NodeInput = DeepPartial<Node>;

export interface NodeStore {
  addNode: ( partial: NodeInput ) => NodeID;
  updateNode: ( node: Node ) => void;
  deleteNode: ( id: NodeID ) => void;
  setSelectedNodeId: ( id: NodeID | undefined ) => void;
  setCurrentRootId: ( id: NodeID | undefined ) => void;
}

// Helper function to deep merge objects
const deepMerge = <T extends object>( target: T, source: DeepPartial<T> ): T => {
  const result = { ...target };

  for ( const key in source ) {
    const sourceValue = source[ key ];
    const targetValue = result[ key ];

    if ( sourceValue && typeof sourceValue === 'object' && !Array.isArray( sourceValue ) &&
      targetValue && typeof targetValue === 'object' && !Array.isArray( targetValue ) ) {
      result[ key ] = deepMerge( targetValue, sourceValue );
    } else if ( sourceValue !== undefined ) {
      result[ key ] = sourceValue as T[ Extract<keyof T, string> ];
    }
  }

  return result;
};

export const createNodeStore = ( set: GraphSetState, get: GraphGetState ): NodeStore => ( {
  addNode: ( partial: NodeInput ) => {
    const id = nanoid();
    const { defaultNodeTypeId, nodeTypes } = get();
    const template = nodeTypes[ defaultNodeTypeId ].template;

    set( ( state: GraphState ) => {
      // Deep merge the template with the partial input
      const newNode: Node = deepMerge(
        { ...template, id },
        partial
      ) as Node;

      // Ensure required fields are set
      newNode.id = id;
      if ( !newNode.label ) newNode.label = template.label;

      return {
        nodes: { ...state.nodes, [ id ]: newNode },
        selectedNodeId: id,
        toolbarContext: "node",
        modified: Date.now()
      };
    } );
    console.debug( "Added node:", partial.label || template.label, id );
    return id; // Return the ID to allow chaining or referencing
  },

  updateNode: ( node ) => {
    set( ( state: GraphState ) => {
      const { nodes } = state;
      if ( !nodes[ node.id ] ) {
        throw new Error( `Node with id ${node.id} does not exist` );
      }
      return {
        nodes: { ...nodes, [ node.id ]: { ...nodes[ node.id ], ...node } },
        modified: Date.now()
      };
    } );
    console.debug( "Updated node: ", node.label, node.id );
  },

  deleteNode: ( id ) => {
    set( ( state: GraphState ) => {
      const { nodes, edges } = state;

      // Helper function to recursively delete nodes
      const recursivelyDeleteNode = ( nodeId: string, currentNodes: typeof nodes ) => {
        const children = Object.values( currentNodes ).filter( ( node ) => node.parentId === nodeId );

        // Recursively delete each child
        children.forEach( ( child ) => recursivelyDeleteNode( child.id, currentNodes ) );

        // Remove the node from the nodes object
        delete currentNodes[ nodeId ];
      };

      // Create a copy of nodes to work with
      const newNodes = { ...nodes };
      recursivelyDeleteNode( id, newNodes );

      // Remove edges associated with the node
      const newEdges = Object.fromEntries(
        Object.entries( edges ).filter(
          ( [ , edge ] ) => edge.source !== id && edge.target !== id
        )
      );

      console.debug( "Deleted node: ", id );
      return {
        nodes: newNodes,
        edges: newEdges,
        selectedNodeId: id === state.selectedNodeId ? undefined : state.selectedNodeId, // Clear selection if this node was selected
        modified: Date.now()
      };
    } );
  },

  setSelectedNodeId: ( id ) => {
    if ( id ) {
      set( {
        selectedNodeId: id,
        selectedEdgeId: undefined, // Clear edge selection when selecting a node
        toolbarContext: "node" // Auto-switch to node context
      } );
    } else {
      set( {
        selectedNodeId: undefined
      } );
    }
    console.debug( "Selected node: ", id );
  },

  setCurrentRootId: ( id ) => {
    set( { currentRootId: id } );
    console.debug( "Set current root: ", id );
  },
} );

import {
  Node, NodeID, FunctionNode, KeyValueNode, NodeShape,
  MetaDataKeyValue, MetaDataFunction, GraphState
} from "@graphTypes/graphTypes";
import { nanoid } from "nanoid";
import { GraphSetState, GraphGetState } from "./storeTypes";

// Base input type that allows partial overrides of any node properties except id
export type NodeInputBase = {
  parentId?: NodeID;
  label?: string;
  shape?: Partial<NodeShape>;
};

// Specific input types when you want to explicitly specify the type
export type InputFunctionNode = NodeInputBase & { type: "function"; metadata?: MetaDataFunction };
export type InputKeyValueNode = NodeInputBase & { type: "key_value"; metadata?: MetaDataKeyValue };

// Union type that allows either explicit typing or using default template
export type NodeInput =
  | NodeInputBase  // Uses default node type template
  | InputFunctionNode  // Explicit function node
  | InputKeyValueNode; // Explicit key-value node

export interface NodeStore {
  addNode: ( partial: NodeInput ) => NodeID;
  updateNode: ( node: Node ) => void;
  deleteNode: ( id: NodeID ) => void;
  setSelectedNodeId: ( id: NodeID | undefined ) => void;
  setCurrentRootId: ( id: NodeID | undefined ) => void;
}

export const createNodeStore = ( set: GraphSetState, get: GraphGetState ): NodeStore => ( {
  addNode: ( partial: NodeInput ) => {
    const id = nanoid();
    const { defaultNodeTypeId, nodeTypes } = get();
    const template = nodeTypes[ defaultNodeTypeId ].template;

    set( ( state: GraphState ) => {
      // Determine the node type to use
      const nodeType = 'type' in partial ? partial.type : template.type;

      // Merge default shape with any provided shape properties
      const mergedShape: NodeShape = {
        ...template.shape,
        ...( partial.shape || {} ),
      };

      if ( nodeType === "key_value" ) {
        const newNode: KeyValueNode = {
          id,
          type: nodeType,
          label: partial.label || template.label,
          parentId: partial.parentId,
          shape: mergedShape,
          metadata: ( 'metadata' in partial ? partial.metadata : template.metadata ) as MetaDataKeyValue || {},
        };
        return {
          nodes: { ...state.nodes, [ id ]: newNode },
          selectedNodeId: id,
          toolbarContext: "node",
          modified: Date.now()
        };
      } else if ( nodeType === "function" ) {
        const newNode: FunctionNode = {
          id,
          type: nodeType,
          label: partial.label || template.label,
          parentId: partial.parentId,
          shape: mergedShape,
          metadata: ( 'metadata' in partial ? partial.metadata : template.metadata ) as MetaDataFunction || {},
        };
        return {
          nodes: { ...state.nodes, [ id ]: newNode },
          selectedNodeId: id,
          toolbarContext: "node",
          modified: Date.now()
        };
      } else {
        throw new Error( `Unsupported node type: ${nodeType}` );
      }
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

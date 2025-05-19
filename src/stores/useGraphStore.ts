import { createWithEqualityFn } from "zustand/traditional";
import { Node, Edge, GraphState, NodeID, EdgeID, FunctionNode, KeyValueNode, NodeShape, MetaDataKeyValue, MetaDataFunction } from "../logic/graphTypes";
import { nanoid } from "nanoid";

type FunctionNodeInput = Omit<FunctionNode, 'id' | 'shape' | 'metadata'> & { metadata?: MetaDataFunction };
type KeyValueNodeInput = Omit<KeyValueNode, 'id' | 'shape' | 'metadata'> & { metadata?: MetaDataKeyValue };
type NodeInput = ( FunctionNodeInput | KeyValueNodeInput ) & { shape?: Partial<NodeShape> };

export interface GraphStore extends GraphState {
  addNode: ( partial: NodeInput ) => NodeID;
  updateNode: ( node: Node ) => void;
  updateEdge: ( id: EdgeID, partial: Partial<Edge> ) => void;
  addEdge: ( partial: Omit<Edge, 'id'> ) => EdgeID;
  deleteNode: ( id: NodeID ) => void;
  deleteEdge: ( id: EdgeID ) => void;
  setSelectedNodeId: ( id: NodeID | undefined ) => void;
  setSelectedEdgeId: ( id: EdgeID | undefined ) => void;
  setCurrentRootId: ( id: NodeID | undefined ) => void;
  setProjectName: ( name: string ) => void;
  setProjectDescription: ( description: string ) => void;
  loadGraph: ( importedState: GraphState ) => void;
  updateModifiedTimestamp: () => void;
}

const newProjectDefaultNode: Omit<Node, "id"> = {
  type: "key_value",
  label: "Node",
  metadata: {},
  parentId: undefined,
  shape: {
    position: { x: 0, y: 0 },
    radius: 30,
    color: "#526ba5",
    edge: {
      color: "#283450",
      width: 2,
    },
  },
}

const now = Date.now();

export const newProject: GraphState = {
  id: nanoid(),
  name: "New Graph",
  description: "A new graph project",
  created: now,
  modified: now,
  currentRootId: undefined,
  nodes: {},
  selectedNodeId: undefined,
  edges: {},
  selectedEdgeId: undefined,
  defaultNode: newProjectDefaultNode
}

export const useGraphStore = createWithEqualityFn<GraphStore>( ( set, get ) => ( {
  ...newProject,

  updateModifiedTimestamp: () => {
    set( { modified: Date.now() } );
  },

  addNode: ( partial: NodeInput & { shape?: Partial<NodeShape> } ) => {
    const id = nanoid();
    set( ( state ) => {
      // Merge default shape with any provided shape properties
      const mergedShape: NodeShape = {
        ...state.defaultNode.shape,
        ...( partial.shape || {} ),
      };

      if ( partial.type === "key_value" ) {
        const newNode: KeyValueNode = {
          id,
          ...state.defaultNode,
          ...partial,
          shape: mergedShape,
          metadata: partial.metadata || {},
        };
        return {
          nodes: { ...state.nodes, [ id ]: newNode },
          modified: Date.now()
        };
      } else if ( partial.type === "function" ) {
        const newNode: FunctionNode = {
          id,
          ...state.defaultNode,
          ...partial,
          shape: mergedShape,
          metadata: partial.metadata || {},
        };
        return {
          nodes: { ...state.nodes, [ id ]: newNode },
          modified: Date.now()
        };
      } else {
        throw new Error( "Invalid node type" );
      }
    } );
    console.debug( "Added node:", partial.label, id );
    return id; // Return the ID to allow chaining or referencing
  },

  updateNode: ( node ) => {
    set( ( state ) => {
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

  addEdge: ( partial ) => {
    // Check if source and target nodes exist
    const { source, target } = partial;
    const { nodes } = get();
    if ( !nodes[ source ] || !nodes[ target ] ) {
      throw new Error( `Source or target node does not exist: ${source}, ${target}` );
    }

    const id = nanoid();

    set( ( state ) => {
      const newEdge: Edge = { id, ...partial };
      return {
        edges: { ...state.edges, [ id ]: newEdge },
        modified: Date.now()
      };
    } );

    console.debug( "Added edge: ", partial.label, id );
    return id;
  },

  deleteNode: ( id ) => {
    set( ( state ) => {
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
        modified: Date.now()
      };
    } );
  },

  deleteEdge: ( id ) => {
    set( ( state ) => {
      const { edges } = state;

      // Remove the edge from the edges object
      const newEdges = { ...edges };
      delete newEdges[ id ];

      console.debug( "Deleted edge: ", id );
      return {
        edges: newEdges,
        modified: Date.now()
      };
    } );
  },

  setSelectedNodeId: ( id ) => {
    set( { selectedNodeId: id } );
    console.debug( "Selected node: ", id );
  },

  setSelectedEdgeId: ( id ) => {
    set( { selectedEdgeId: id } );
    console.debug( "Selected edge: ", id );
  },

  setCurrentRootId: ( id ) => {
    set( { currentRootId: id } );
    console.debug( "Set current root: ", id );
  },

  setProjectName: ( name ) => {
    set( { name, modified: Date.now() } );
    console.debug( "Set project name: ", name );
  },

  setProjectDescription: ( description ) => {
    set( { description, modified: Date.now() } );
    console.debug( "Set project description: ", description );
  },

  loadGraph: ( importedState ) => {
    // Ensure timestamps exist (for backward compatibility)
    const now = Date.now();
    const stateToLoad = {
      ...importedState,
      created: importedState.created || now,
      modified: importedState.modified || now
    };
    set( stateToLoad );
    console.debug( "Loaded graph state with name:", importedState.name );
  },

} as GraphState & GraphStore ) );


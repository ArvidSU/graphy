import { createWithEqualityFn } from "zustand/traditional";
import {
  Node, Edge, GraphState, NodeID, EdgeID, FunctionNode,
  KeyValueNode, NodeShape,
  NodeType, NodeTypeID, NodeTypeTemplate,
  MetaDataKeyValue,
  MetaDataFunction
} from "../logic/graphTypes";
import { nanoid } from "nanoid";

type InputFunctionNode = Partial<Omit<FunctionNode, "shape">> & { type: "function" };
type InputKeyValueNode = Partial<Omit<KeyValueNode, "shape">> & { type: "key_value" };
type NodeInput = ( InputFunctionNode | InputKeyValueNode ) & { shape?: Partial<NodeShape> };

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
  saveNodeAsType: ( node: NodeTypeTemplate, name: string ) => NodeTypeID;
  deleteNodeType: ( id: NodeTypeID ) => void;
  setDefaultNodeType: ( id: NodeTypeID | undefined ) => void;
  updateNodeType: ( id: NodeTypeID, nodeType: NodeType ) => void;
}


const newProjectDefaultNode: NodeTypeTemplate = {
  type: "key_value",
  label: "Node",
  metadata: {},
  shape: {
    position: { x: 0, y: 0 },
    radius: 30,
    color: "#526ba5",
    border: {
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
  nodeTypes: {
    "default": {
      id: "default",
      name: "Node",
      template: newProjectDefaultNode
    }
  },
  defaultNodeTypeId: "default",
}

export const useGraphStore = createWithEqualityFn<GraphStore>( ( set, get ) => ( {
  ...newProject,

  updateModifiedTimestamp: () => {
    set( { modified: Date.now() } );
  },

  addNode: ( partial: NodeInput ) => {
    const id = nanoid();
    const { defaultNodeTypeId, nodeTypes } = get();
    const template = nodeTypes[ defaultNodeTypeId ].template
    set( ( state ) => {
      // Merge default shape with any provided shape properties
      const mergedShape: NodeShape = {
        ...template.shape,
        ...( partial.shape || {} ),
      };

      if ( partial.type === "key_value" && template.type === "key_value" ) {
        const newNode: KeyValueNode = {
          ...template,
          ...partial,
          shape: mergedShape,
          metadata: partial.metadata || template.metadata as MetaDataKeyValue || {},
          id,
        };
        return {
          nodes: { ...state.nodes, [ id ]: newNode },
          modified: Date.now()
        };
      } else if ( partial.type === "function" && template.type === "function" ) {
        const newNode: FunctionNode = {
          ...template,
          ...partial,
          shape: mergedShape,
          metadata: partial.metadata || template.metadata as MetaDataFunction || {},
          id,
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
      modified: importedState.modified || now,
      nodeTypes: importedState.nodeTypes || {},
      defaultNodeTypeId: importedState.defaultNodeTypeId || undefined
    };
    set( stateToLoad );
    console.debug( "Loaded graph state with name:", importedState.name );
  },

  saveNodeAsType: ( node, name ) => {
    const id = nanoid();
    set( ( state ) => {
      const { ...nodeTemplate } = node;
      const nodeType: NodeType = {
        id,
        name,
        template: nodeTemplate
      };
      return {
        nodeTypes: { ...state.nodeTypes, [ id ]: nodeType },
        modified: Date.now()
      };
    } );
    console.debug( "Saved node as type:", name, id );
    return id;
  },

  deleteNodeType: ( id ) => {
    set( ( state ) => {
      const newNodeTypes = { ...state.nodeTypes };
      if ( !newNodeTypes[ id ] ) {
        throw new Error( `Node type with id ${id} does not exist` );
      } else if ( Object.keys( newNodeTypes ).length === 1 ) {
        console.info( "Cannot delete the last node type" );
        return state; // Do not modify state if this is the last node type
      }

      delete newNodeTypes[ id ];
      console.debug( "Deleted node type:", id );

      const newDefaultNodeTypeId = state.defaultNodeTypeId === id ? Object.keys( newNodeTypes )[ 0 ] : state.defaultNodeTypeId;

      return {
        nodeTypes: newNodeTypes,
        defaultNodeTypeId: newDefaultNodeTypeId,
        modified: Date.now()
      };
    } );
  },

  setDefaultNodeType: ( id ) => {
    set( {
      defaultNodeTypeId: id,
      modified: Date.now()
    } );
    console.debug( "Set default node type:", id );
  },

  updateNodeType: ( id, nodeType ) => {
    set( ( state ) => {
      const { nodeTypes } = state;
      if ( !nodeTypes[ id ] ) {
        throw new Error( `Node type with id ${id} does not exist` );
      }

      return {
        nodeTypes: { ...nodeTypes, [ id ]: nodeType },
        modified: Date.now()
      };
    } );
    console.debug( "Updated node type:", nodeType.name, id );
  },

} as GraphState & GraphStore ) );


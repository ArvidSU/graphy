import { createWithEqualityFn } from "zustand/traditional";
import {
  Node, Edge, GraphState, NodeID, EdgeID, FunctionNode,
  KeyValueNode, NodeShape,
  NodeType, NodeTypeID, NodeTypeTemplate,
  MetaDataKeyValue,
  MetaDataFunction,
  ToolbarState
} from "@graphTypes/graphTypes";
import { nanoid } from "nanoid";

// Base input type that allows partial overrides of any node properties except id
type NodeInputBase = {
  parentId?: NodeID;
  label?: string;
  shape?: Partial<NodeShape>;
};

// Specific input types when you want to explicitly specify the type
type InputFunctionNode = NodeInputBase & { type: "function"; metadata?: MetaDataFunction };
type InputKeyValueNode = NodeInputBase & { type: "key_value"; metadata?: MetaDataKeyValue };

// Union type that allows either explicit typing or using default template
type NodeInput =
  | NodeInputBase  // Uses default node type template
  | InputFunctionNode  // Explicit function node
  | InputKeyValueNode; // Explicit key-value node

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
  setToolbarState: ( toolbarState: ToolbarState ) => void;
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
  toolbarState: {
    context: "project"
  }
}

export const useGraphStore = createWithEqualityFn<GraphStore>( ( set, get ) => ( {
  ...newProject,

  updateModifiedTimestamp: () => {
    set( { modified: Date.now() } );
  },

  addNode: ( partial: NodeInput ) => {
    const id = nanoid();
    const { defaultNodeTypeId, nodeTypes } = get();
    const template = nodeTypes[ defaultNodeTypeId ].template;

    set( ( state ) => {
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
          type: "key_value",
          label: partial.label || template.label,
          parentId: partial.parentId,
          shape: mergedShape,
          metadata: ( 'metadata' in partial ? partial.metadata : template.metadata ) as MetaDataKeyValue || {},
        };
        return {
          nodes: { ...state.nodes, [ id ]: newNode },
          modified: Date.now()
        };
      } else if ( nodeType === "function" ) {
        const newNode: FunctionNode = {
          id,
          type: "function",
          label: partial.label || template.label,
          parentId: partial.parentId,
          shape: mergedShape,
          metadata: ( 'metadata' in partial ? partial.metadata : template.metadata ) as MetaDataFunction || {},
        };
        return {
          nodes: { ...state.nodes, [ id ]: newNode },
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

  updateEdge: ( id, partial ) => {
    set( ( state ) => {
      const { edges } = state;
      if ( !edges[ id ] ) {
        throw new Error( `Edge with id ${id} does not exist` );
      }
      return {
        edges: { ...edges, [ id ]: { ...edges[ id ], ...partial } },
        modified: Date.now()
      };
    } );
    console.debug( "Updated edge: ", partial.label, id );
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
        selectedNodeId: id === state.selectedNodeId ? undefined : state.selectedNodeId, // Clear selection if this node was selected
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
        selectedEdgeId: id === state.selectedEdgeId ? undefined : state.selectedEdgeId, // Clear selection if this edge was selected
        modified: Date.now()
      };
    } );
  },

  setSelectedNodeId: ( id ) => {
    if ( id ) {
      set( {
        selectedNodeId: id,
        selectedEdgeId: undefined, // Clear edge selection when selecting a node
        toolbarState: { context: "node" } // Auto-switch to node context
      } );
    } else {
      set( {
        selectedNodeId: undefined
      } );
    }
    console.debug( "Selected node: ", id );
  },

  setSelectedEdgeId: ( id ) => {
    if ( id ) {
      set( {
        selectedEdgeId: id,
        selectedNodeId: undefined, // Clear node selection when selecting an edge
        toolbarState: { context: "edge" } // Auto-switch to edge context
      } );
    } else {
      set( {
        selectedEdgeId: undefined
      } );
    }

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
    const stateToLoad = {
      ...importedState,
      created: importedState.created,
      modified: importedState.modified,
      nodeTypes: importedState.nodeTypes,
      defaultNodeTypeId: importedState.defaultNodeTypeId,
      toolbarState: importedState.toolbarState || { context: "project" as const }
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

  setToolbarState: ( toolbarState ) => {
    set( () => {
      // When manually switching to a different context, optionally clear incompatible selections
      const updates: Partial<GraphState> = { toolbarState };

      // If switching to nodeType, project, or rules context, clear node/edge selections
      if ( [ "nodeType", "project", "rules" ].includes( toolbarState.context ) ) {
        return {
          ...updates,
          selectedNodeId: undefined,
          selectedEdgeId: undefined
        };
      }

      return updates;
    } );
    console.debug( "Set toolbar state:", toolbarState );
  },

} as GraphState & GraphStore ) );


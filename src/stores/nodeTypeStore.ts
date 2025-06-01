import { NodeType, NodeTypeID, NodeTypeTemplate, GraphState } from "@graphTypes/graphTypes";
import { nanoid } from "nanoid";
import { GraphSetState } from "./storeTypes";

// Default node template that was in the original useGraphStore
export const newProjectDefaultNode: NodeTypeTemplate = {
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
};

export interface NodeTypeStore {
  saveNodeAsType: ( node: NodeTypeTemplate, name: string ) => NodeTypeID;
  deleteNodeType: ( id: NodeTypeID ) => void;
  setDefaultNodeType: ( id: NodeTypeID | undefined ) => void;
  updateNodeType: ( id: NodeTypeID, nodeType: NodeType ) => void;
}

export const createNodeTypeStore = ( set: GraphSetState ): NodeTypeStore => ( {
  saveNodeAsType: ( node, name ) => {
    const id = nanoid();
    set( ( state: GraphState ) => {
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
    set( ( state: GraphState ) => {
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
    set( ( state: GraphState ) => {
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
} );

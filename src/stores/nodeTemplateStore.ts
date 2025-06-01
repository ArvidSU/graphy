import { NodeTemplate, NodeTemplateID, NodeTemplateType, GraphState } from "@graphTypes/graphTypes";
import { nanoid } from "nanoid";
import { GraphSetState } from "./storeTypes";

// Default node template that was in the original useGraphStore
export const newProjectDefaultNode: NodeTemplateType = {
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

export interface NodeTemplateStore {
  saveNodeAsTemplate: ( node: NodeTemplateType, name: string ) => NodeTemplateID;
  deleteNodeTemplate: ( id: NodeTemplateID ) => void;
  setDefaultNodeTemplate: ( id: NodeTemplateID | undefined ) => void;
  updateNodeTemplate: ( id: NodeTemplateID, nodeType: NodeTemplate ) => void;
}

export const createNodeTemplateStore = ( set: GraphSetState ): NodeTemplateStore => ( {
  saveNodeAsTemplate: ( node, name ) => {
    const id = nanoid();
    set( ( state: GraphState ) => {
      const { ...nodeTemplate } = node;
      const nodeType: NodeTemplate = {
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

  deleteNodeTemplate: ( id ) => {
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

  setDefaultNodeTemplate: ( id ) => {
    set( {
      defaultNodeTypeId: id,
      modified: Date.now()
    } );
    console.debug( "Set default node type:", id );
  },

  updateNodeTemplate: ( id, nodeType ) => {
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

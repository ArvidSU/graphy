import { GraphState } from "@graphTypes/graphTypes";
import { Operation } from "@/types/operationTypes";
import { GraphSetState } from "./storeTypes";

export interface ProjectStore {
  setProjectName: ( name: string ) => void;
  setProjectDescription: ( description: string ) => void;
  loadGraph: ( importedState: GraphState ) => void;
  updateModifiedTimestamp: () => void;
  updateProjectOperation: ( operation: Operation ) => void;
  deleteProjectOperation: ( operationId: string ) => void;
}

export const createProjectStore = ( set: GraphSetState ): ProjectStore => ( {
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
      toolbarContext: importedState.toolbarContext || "project",
      operations: importedState.operations || {}
    };
    set( stateToLoad );
    console.debug( "Loaded graph state with name:", importedState.name );
  },

  updateModifiedTimestamp: () => {
    set( { modified: Date.now() } );
  },

  updateProjectOperation: ( operation ) => {
    set( ( state: GraphState ) => ( {
      operations: {
        ...( state.operations || {} ),
        [ operation.id ]: operation
      },
      modified: Date.now()
    } ) );
    console.debug( "Updated project operation:", operation.id );
  },

  deleteProjectOperation: ( operationId ) => {
    set( ( state: GraphState ) => {
      const newOperations = { ...( state.operations || {} ) };
      delete newOperations[ operationId ];
      return {
        operations: newOperations,
        modified: Date.now()
      };
    } );
    console.debug( "Deleted project operation:", operationId );
  },
} );

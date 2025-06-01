import { GraphState } from "@graphTypes/graphTypes";
import { GraphSetState } from "./storeTypes";

export interface ProjectStore {
  setProjectName: ( name: string ) => void;
  setProjectDescription: ( description: string ) => void;
  loadGraph: ( importedState: GraphState ) => void;
  updateModifiedTimestamp: () => void;
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
      toolbarState: importedState.toolbarState || { context: "project" as const }
    };
    set( stateToLoad );
    console.debug( "Loaded graph state with name:", importedState.name );
  },

  updateModifiedTimestamp: () => {
    set( { modified: Date.now() } );
  },
} );

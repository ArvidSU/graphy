import { ToolbarState, GraphState } from "@graphTypes/graphTypes";
import { GraphSetState } from "./storeTypes";

export interface ToolbarStore {
  setToolbarState: ( toolbarState: ToolbarState ) => void;
}

export const createToolbarStore = ( set: GraphSetState ): ToolbarStore => ( {
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
} );

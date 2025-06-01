import { ToolbarContext, GraphState } from "@graphTypes/graphTypes";
import { GraphSetState } from "./storeTypes";

export interface ToolbarStore {
  setToolbarContext: ( toolbarContext: ToolbarContext ) => void;
}

export const createToolbarStore = ( set: GraphSetState ): ToolbarStore => ( {
  setToolbarContext: ( toolbarContext ) => {
    set( () => {
      // When manually switching to a different context, optionally clear incompatible selections
      const updates: Partial<GraphState> = { toolbarContext: toolbarContext };

      // If switching to nodeType, project, or rules context, clear node/edge selections
      if ( [ "nodeType", "project", "rules" ].includes( toolbarContext ) ) {
        return {
          ...updates,
          selectedNodeId: undefined,
          selectedEdgeId: undefined
        };
      }

      return updates;
    } );
    console.debug( "Set toolbar state:", toolbarContext );
  },
} );

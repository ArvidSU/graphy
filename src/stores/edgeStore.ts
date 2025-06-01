import { Edge, EdgeID, GraphState } from "@graphTypes/graphTypes";
import { nanoid } from "nanoid";
import { GraphSetState, GraphGetState } from "./storeTypes";

export interface EdgeStore {
  addEdge: ( partial: Omit<Edge, 'id'> ) => EdgeID;
  updateEdge: ( id: EdgeID, partial: Partial<Edge> ) => void;
  deleteEdge: ( id: EdgeID ) => void;
  setSelectedEdgeId: ( id: EdgeID | undefined ) => void;
}

export const createEdgeStore = ( set: GraphSetState, get: GraphGetState ): EdgeStore => ( {
  addEdge: ( partial ) => {
    // Check if source and target nodes exist
    const { source, target } = partial;
    const { nodes } = get();
    if ( !nodes[ source ] || !nodes[ target ] ) {
      throw new Error( `Source or target node does not exist: ${source}, ${target}` );
    }

    const id = nanoid();

    set( ( state: GraphState ) => {
      const newEdge: Edge = { id, ...partial };
      return {
        edges: { ...state.edges, [ id ]: newEdge },
        modified: Date.now()
      };
    } );

    console.debug( "Added edge: ", partial.label, id );
    return id;
  },

  updateEdge: ( id, partial ) => {
    set( ( state: GraphState ) => {
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

  deleteEdge: ( id ) => {
    set( ( state: GraphState ) => {
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

  setSelectedEdgeId: ( id ) => {
    if ( id ) {
      set( {
        selectedEdgeId: id,
        selectedNodeId: undefined, // Clear node selection when selecting an edge
        toolbarContext: "edge" // Auto-switch to edge context
      } );
    } else {
      set( {
        selectedEdgeId: undefined
      } );
    }

    console.debug( "Selected edge: ", id );
  },
} );

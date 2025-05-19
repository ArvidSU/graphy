import { Button } from "../core/Button";
import { useGraphStore } from "../../stores/useGraphStore";

/**
 * ExportButton component that handles exporting the graph data to a JSON file
 */
export function ExportButton() {
  const graphState = useGraphStore( ( state ) => state );

  const exportGraph = () => {
    // Create a clone of the graph state without functions (which cannot be serialized)
    const exportData = {
      id: graphState.id,
      name: graphState.name,
      description: graphState.description,
      currentRootId: graphState.currentRootId,
      nodes: graphState.nodes,
      edges: graphState.edges,
      selectedNodeId: graphState.selectedNodeId,
      selectedEdgeId: graphState.selectedEdgeId,
      defaultNode: graphState.defaultNode,
    };

    // Convert to JSON string with nice formatting
    const jsonData = JSON.stringify( exportData, null, 2 );

    // Create a blob and a temporary URL for downloading
    const blob = new Blob( [ jsonData ], { type: "application/json" } );
    const url = URL.createObjectURL( blob );

    // Create a temporary anchor element for downloading
    const a = document.createElement( "a" );
    a.href = url;
    a.download = `${graphState.name.replace( /\s+/g, '_' )}_${new Date().toISOString().split( 'T' )[ 0 ]}.json`;
    document.body.appendChild( a );
    a.click();

    // Clean up
    window.URL.revokeObjectURL( url );
    document.body.removeChild( a );

    console.debug( "Graph exported successfully" );
  };

  return (
    <Button onClick={ exportGraph }>Export</Button>
  );
}
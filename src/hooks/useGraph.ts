import { useGraphStore } from "@stores/useGraphStore";
import { shallow } from "zustand/shallow";
import { selectLocalGraphView, selectNodeAdjacentData, selectKVPMetadata } from "@stores/selectors";
import { MetaDataID, NodeID, Node } from "@graphTypes/graphTypes";
import { evaluateMetadata } from "@logic/kvpLogic";

export function useLocalGraph() {
  const localGraph = useGraphStore( selectLocalGraphView, shallow );
  return localGraph;
}

export function useNode( id: NodeID ) {
  const adjacentData = useGraphStore( ( state ) => selectNodeAdjacentData( id, state ), shallow );
  const { updateNode } = useGraphStore();
  const update = ( node: Node ) => {
    if ( node.id !== adjacentData?.node.id ) return;
    updateNode( {
      ...adjacentData.node,
      ...node,
    } );
  };

  return { ...adjacentData, update };
}

export function useKVPMetadata( id: MetaDataID ) {
  const metadata = useGraphStore( selectKVPMetadata( id ) );
  const updateNode = useGraphStore( ( s ) => s.updateNode );
  const nodes = useGraphStore( ( s ) => s.nodes );

  const update = ( key: string, value: string ) => {
    if ( !metadata?.belongsTo ) return;

    updateNode( {
      ...metadata.belongsTo,
      metadata: {
        ...metadata.belongsTo.metadata,
        [ id ]: { key, value },
      },
    } );
  };

  const remove = () => {
    if ( !metadata?.belongsTo ) return;

    const newMetadata = { ...metadata.belongsTo.metadata };
    delete newMetadata[ id ];

    updateNode( {
      ...metadata.belongsTo,
      metadata: newMetadata,
    } );
  };

  // Calculate the evaluated value if metadata exists by passing the necessary data
  const evaluatedValue = metadata ? evaluateMetadata( { key: metadata.key, value: metadata.value }, nodes ) : undefined;

  return metadata
    ? {
      ...metadata,
      evaluatedValue,
      update,
      remove,
    }
    : undefined;
}
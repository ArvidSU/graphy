import { useGraphStore } from "@stores/useGraphStore";
import { shallow } from "zustand/shallow";
import { selectLocalGraphView, selectNodeAdjacentData, selectAttributes } from "@stores/selectors";
import { MetaDataID, NodeID, Node } from "@graphTypes/graphTypes";

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

export function useAttributes( id: MetaDataID ) {
  const attributes = useGraphStore( selectAttributes( id ) );
  const updateNode = useGraphStore( ( s ) => s.updateNode );

  const update = ( key: string, value: string ) => {
    if ( !attributes?.belongsTo ) return;

    updateNode( {
      ...attributes.belongsTo,
      attributes: {
        ...attributes.belongsTo.attributes,
        [ id ]: { key, value },
      },
    } );
  };

  const remove = () => {
    if ( !attributes?.belongsTo ) return;

    const newAttributes = { ...attributes.belongsTo.attributes };
    delete newAttributes[ id ];

    updateNode( {
      ...attributes.belongsTo,
      attributes: newAttributes,
    } );
  };

  return attributes
    ? {
      ...attributes,
      update,
      remove,
    }
    : undefined;
}
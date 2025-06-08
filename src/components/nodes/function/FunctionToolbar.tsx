import { useState } from "react";
import { Node, MetaDataID } from "@graphTypes/graphTypes";
import { OperationEditor } from "./OperationEditor";
import { OperationList } from "./OperationList";

interface FunctionToolbarProps {
  node: Node;
}

export function FunctionToolbar( { node }: FunctionToolbarProps ) {
  const [ metadataId, setMetadataId ] = useState<MetaDataID | undefined>( undefined );

  if ( node.type !== "function" ) {
    return <div>Error: Node is not a function node</div>;
  }

  return (
    <>
      <OperationEditor node={ node } metadataId={ metadataId } setMetadataId={ setMetadataId } />
      <OperationList node={ node } metadataId={ metadataId } setMetadataId={ setMetadataId } />
    </>
  );
}

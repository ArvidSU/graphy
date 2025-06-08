import { KeyValueNode } from "@graphTypes/graphTypes";
import { KVPAvailableReferences, KVPMetadataEditor } from "./KVPEditor";

interface KVPToolbarProps {
  node: KeyValueNode;
}

export function KVPToolbar( { node }: KVPToolbarProps ) {
  return (
    <>
      <KVPMetadataEditor { ...node } />
      <KVPAvailableReferences id={ node.id } />
    </>
  );
}
import { FunctionNode, MetaDataID } from "@graphTypes/graphTypes";
import { Section } from "@core/Section";
import { DeleteButton, ToolButton } from "@core/Button";
import { useGraphStore } from "@stores/useGraphStore";
import { Operation } from "@/types/operationTypes";

interface OperationListProps {
  node: FunctionNode;
  metadataId?: MetaDataID;
  setMetadataId: ( id: MetaDataID ) => void;
}

export function OperationList( { node, metadataId, setMetadataId }: OperationListProps ) {
  const { updateNode } = useGraphStore();

  const operations = Object.entries( node.metadata ).map( ( [ id, operation ] ) => {
    try {
      return { id, operation };
    } catch {
      return null;
    }
  } ).filter( Boolean ) as { id: string; operation: Operation }[];

  const deleteOperation = ( id: string ) => {
    const newMetadata = { ...node.metadata };
    delete newMetadata[ id ];

    updateNode( {
      ...node,
      metadata: newMetadata
    } );
  };

  return (
    <Section title="Saved Operations" bordered className="mt-2">
      { operations.length === 0 ? (
        <p className="text-sm text-gray-500">No operations saved yet</p>
      ) : (
        <div className="space-y-2">
          { operations.map( ( { id, operation } ) => (
            <div key={ id } className="border rounded p-2 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{ operation.description }</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Expression: { operation.expression }
                  </p>
                  <p className="text-xs text-gray-600">
                    Inputs: { operation.inputs?.length }
                    { operation.output && ", Output: Yes" }
                  </p>
                </div>
                <DeleteButton onClick={ () => deleteOperation( id ) } />
                <ToolButton
                  onClick={ () => setMetadataId( operation.id ) }
                  className={ metadataId === operation.id ? "bg-blue-500 text-white" : "" }
                />
              </div>
            </div>
          ) ) }
        </div>
      ) }
    </Section>
  );
}

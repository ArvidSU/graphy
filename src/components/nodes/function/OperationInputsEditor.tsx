import { Node } from "@graphTypes/graphTypes";
import { Reference } from "@/types/operationTypes";
import { Button, CopyButton, DeleteButton } from "@core/Button";
import { AutocompleteInput } from "@core/AutocompleteInput";

interface OperationInputsEditorProps {
  selectedInputs: Reference[];
  availableNodes: Node[];
  onAddInput: () => void;
  onUpdateInput: ( inputIndex: number, field: string, value: string ) => void;
  onRemoveInput: ( index: number ) => void;
  onCopyInputToExpression: ( input: Reference ) => void;
}

export function OperationInputsEditor( {
  selectedInputs,
  availableNodes,
  onAddInput,
  onUpdateInput,
  onRemoveInput,
  onCopyInputToExpression
}: OperationInputsEditorProps ) {
  // Generate suggestions for node properties
  const getNodePropertySuggestions = ( selectedNode: Node | null ) => {
    if ( !selectedNode ) return [];

    const suggestions: string[] = [ 'id', 'label', 'type' ];

    if ( selectedNode.type === 'key_value' ) {
      // Add metadata keys
      Object.values( selectedNode.metadata ).forEach( kvp => {
        suggestions.push( kvp.key );
      } );
    }

    return suggestions;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Inputs
        </label>
        <Button onClick={ onAddInput } className="text-xs px-2 py-1">
          Add Input
        </Button>
      </div>

      { selectedInputs.map( ( input, index ) => (
        <div key={ index } className="flex items-center space-x-2 mb-2">
          <AutocompleteInput
            suggestions={ availableNodes.map( n => n.id ) }
            showComponent={ ( nodeId ) => {
              const node = availableNodes.find( n => n.id === nodeId );
              return <div className="text-sm">{ node?.label } ({ node?.type })</div>;
            } }
            value={ input.index }
            onChange={ ( e ) => onUpdateInput( index, 'index', e.target.value ) }
            placeholder="Select node"
            className="border rounded p-1 flex-1"
            saveOn={ [ 'change' ] }
            onSave={ ( value ) => onUpdateInput( index, 'index', value ) }
          />

          <AutocompleteInput
            suggestions={ getNodePropertySuggestions(
              availableNodes.find( n => n.id === input.index ) || null
            ) }
            placeholder={ String( input.key ) }
            onChange={ ( e ) => onUpdateInput( index, 'key', e.target.value ) }
            className="border rounded p-1 w-24"
            saveOn={ [ 'change' ] }
            onSave={ ( value ) => onUpdateInput( index, 'key', value ) }
          />
          <CopyButton onClick={ () => onCopyInputToExpression( input ) } />
          <DeleteButton onClick={ () => onRemoveInput( index ) } />
        </div>
      ) ) }
    </div>
  );
}

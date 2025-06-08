import { Node } from "@graphTypes/graphTypes";
import { Reference } from "@/types/operationTypes";
import { AutocompleteInput } from "@core/AutocompleteInput";

interface OperationOutputEditorProps {
  selectedOutput?: Reference;
  availableNodes: Node[];
  onUpdateOutput: ( output: Reference | undefined ) => void;
}

export function OperationOutputEditor( {
  selectedOutput,
  availableNodes,
  onUpdateOutput
}: OperationOutputEditorProps ) {
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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Output (optional)
      </label>
      <div className="flex items-center space-x-2">
        <AutocompleteInput
          suggestions={ availableNodes.map( n => n.id ) }
          showComponent={ ( nodeId ) => {
            const node = availableNodes.find( n => n.id === nodeId );
            return <div className="text-sm">{ node?.label } ({ node?.type })</div>;
          } }
          value={ selectedOutput?.index || "" }
          onChange={ ( e ) => onUpdateOutput( {
            ...selectedOutput,
            name: selectedOutput?.name || 'output',
            index: e.target.value,
            key: selectedOutput?.key || 'label'
          } ) }
          placeholder="Select output node"
          className="border rounded p-1 flex-1"
          saveOn={ [ 'change' ] }
          onSave={ ( value ) => onUpdateOutput( {
            ...selectedOutput,
            name: selectedOutput?.name || 'output',
            index: value,
            key: selectedOutput?.key || 'label'
          } ) }
        />

        <AutocompleteInput
          suggestions={ getNodePropertySuggestions(
            availableNodes.find( n => n.id === selectedOutput?.index ) || null
          ) }
          value={ String( selectedOutput?.key || "" ) }
          onChange={ ( e ) => onUpdateOutput( selectedOutput ? {
            ...selectedOutput,
            key: e.target.value
          } : undefined ) }
          placeholder="Property"
          className="border rounded p-1 w-24"
          saveOn={ [ 'change' ] }
          onSave={ ( value ) => onUpdateOutput( selectedOutput ? {
            ...selectedOutput,
            key: value
          } : undefined ) }
        />
      </div>
    </div>
  );
}

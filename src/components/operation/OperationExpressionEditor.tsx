import { AutocompleteInput } from "@/components/core/AutocompleteInput";

interface OperationExpressionEditorProps {
  expression?: string;
  onExpressionChange: ( expression: string ) => void;
  suggestions?: string[];
}

export function OperationExpressionEditor( {
  expression,
  onExpressionChange,
  suggestions = [],
}: OperationExpressionEditorProps ) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Expression
      </label>
      <AutocompleteInput
        value={ expression }
        placeholder="e.g., input_label + ' ' + input_value"
        suggestions={ suggestions }
        className="w-full border rounded p-2 bg-white"
        saveOn={ [ 'change' ] }
        onSave={ ( value ) => {
          onExpressionChange( value );
        } }
        separator="+"
      />
      <p className="text-xs text-gray-500 mt-1">
        Use the name of the reference as the key to access its value in the expression.
      </p>
    </div>
  );
}

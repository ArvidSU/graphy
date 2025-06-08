import { Input } from "@core/Input";

interface OperationExpressionEditorProps {
  expression: string;
  onExpressionChange: ( expression: string ) => void;
}

export function OperationExpressionEditor( {
  expression,
  onExpressionChange
}: OperationExpressionEditorProps ) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Expression
      </label>
      <Input
        value={ expression }
        onChange={ ( e ) => onExpressionChange( e.target.value ) }
        placeholder="e.g., arguments[0] + arguments[1]"
        className="w-full border rounded p-2"
        saveOn={ [ 'change' ] }
        onSave={ onExpressionChange }
      />
      <p className="text-xs text-gray-500 mt-1">
        Use arguments[0], arguments[1], etc. to reference inputs in order
      </p>
    </div>
  );
}

import { Button } from "@core/Button";

interface OperationActionsProps {
  onEvaluate: () => void;
  onSave: () => void;
  onNew: () => void;
  isEditing: boolean;
}

export function OperationActions( { onEvaluate, onSave, onNew, isEditing }: OperationActionsProps ) {
  return (
    <div className="flex space-x-2">
      <Button onClick={ onNew } className="bg-gray-500 text-white">
        New Operation
      </Button>
      <Button onClick={ onEvaluate } className="bg-blue-500 text-white">
        Evaluate
      </Button>
      <Button onClick={ onSave } className="bg-green-500 text-white">
        { isEditing ? "Update Operation" : "Save Operation" }
      </Button>
    </div>
  );
}

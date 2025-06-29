
import { DeleteButton, ToolButton } from "@core/Button";
import { Operation } from "@/types/operationTypes";
import { PopBox } from "@/components/core/PopBox";
import { Expander } from "@/components/core/Expander";
import { WithOperations } from "@/types/operationTypes";

interface OperationListProps {
  withOperation: WithOperations;
  onDelete: ( id: string ) => void;
  selectOperation: ( operation: Operation ) => void;
}

export function OperationList( { withOperation, onDelete, selectOperation }: OperationListProps ) {
  const operations = Object.entries( withOperation.operations ? withOperation.operations : {} ).map( ( [ id, operation ] ) => {
    try {
      return { id, operation };
    } catch {
      return null;
    }
  } ).filter( Boolean ) as { id: string; operation: Operation }[];

  if ( operations.length === 0 ) return

  return (
    <PopBox color="white">
      <h2><b>Saved Operations</b></h2>
      { operations.map( ( { id, operation } ) => (
        <Expander
          className="mt-2"
          direction="left"
          items={ [
            <ToolButton onClick={ () => selectOperation( operation ) } />,
            <DeleteButton onClick={ () => onDelete( id ) } />,
            <div className="text-xs text-gray-500 flex flex-col space-y-1">
              <span><b>Expression: </b>{ operation.expression }</span>
              <span><b>Inputs: </b>{ Object.values( operation.inputs ).length }</span>
              <span><b>Outputs: </b>{ Object.values( operation.outputs ).length }</span>
            </div>
          ] }>

          <PopBox key={ id } color="green">
            <div className="flex justify-between items-start space-x-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{ operation.description }</h4>

              </div>

            </div>
          </PopBox>
        </Expander>
      ) ) }
    </PopBox>
  );
}

import { useState } from "react";
import { Section } from "@core/Section";
import { Input } from "@core/Input";
import { Operation, Reference, WithOperations } from "@/types/operationTypes";
import { areEqualReferences, evaluateOperation, isOperation, resolveValue } from "@/logic/operationLogic";
import { nanoid } from "nanoid";
import { OperationReferenceEditor } from "./OperationReferenceEditor";
import { OperationExpressionEditor } from "./OperationExpressionEditor";
import { OperationResultDisplay } from "./OperationResultDisplay";
import { Expander } from "@/components/core/Expander";
import { Button, CloseButton, CopyButton, DeleteButton, ExecuteButton, SaveButton } from "@/components/core/Button";
import { PopBox } from "@/components/core/PopBox";
import { OperationList } from "./OperationList";



interface OperationEditorProps {
  withOperations: WithOperations,
  inputContext: Record<string, unknown>,
  outputContext: Record<string, unknown>,
  onOutput: ( newContext: Record<string, unknown> ) => void,
  onChange: ( operation: Operation, change: "save" | "delete" ) => void,
  selectedOp?: Operation
}

const newOperation = (): Operation => ( {
  id: nanoid(),
  description: '',
  inputs: {},
  expression: '',
  outputs: {},
} );

export function OperationEditor( { withOperations, inputContext, outputContext, onOutput, onChange, selectedOp }: OperationEditorProps ) {
  const [ selectedOperation, setSelectedOperation ] = useState<Operation>( selectedOp || newOperation() );
  const [ selectedInputRef, setSelectedInputRef ] = useState<Reference | undefined>( undefined );
  const [ selectedOutputRef, setSelectedOutputRef ] = useState<Reference | undefined>( undefined );

  const [ result, setResult ] = useState<unknown>( null );

  const removeRef = ( ref: Reference ) => {
    console.debug( "Removing reference", ref );

    if ( areEqualReferences( ref, selectedInputRef ) ) {
      setSelectedInputRef( undefined );
    } else if ( areEqualReferences( ref, selectedOutputRef ) ) {
      setSelectedOutputRef( undefined );
    }

    const operationWithoutRef = { ...selectedOperation };

    if ( selectedOperation.inputs[ ref.id ] ) {
      delete operationWithoutRef.inputs[ ref.id ];
    } else if ( selectedOperation.outputs[ ref.id ] ) {
      delete operationWithoutRef.outputs[ ref.id ];
    }

    setSelectedOperation( operationWithoutRef );
  };

  const copyInputToExpression = ( input: Reference ) => {
    navigator.clipboard.writeText( input.name );

    setSelectedOperation( prev => ( {
      ...prev,
      expression: `${prev?.expression} ${input.name}`
    } ) );
  };

  const saveOperation = () => {
    if ( !isOperation( selectedOperation ) ) {
      alert( "Please fill in all required fields before saving the operation." );
      return;
    }

    console.debug( "Saving operation", selectedOperation );

    setSelectedOperation( { ...selectedOperation, active: selectedOperation.active || true } )

    onChange( selectedOperation, "save" );
  };

  const saveInput = ( ref: Reference ) => {
    console.debug( "Saving input reference", ref );
    setSelectedOperation( prev => ( {
      ...prev,
      inputs: {
        ...prev.inputs,
        [ ref.id ]: ref
      }
    } ) );
  };

  const saveOutput = ( ref: Reference ) => {
    console.debug( "Saving output reference", ref );
    setSelectedOperation( prev => ( {
      ...prev,
      outputs: {
        ...prev.outputs,
        [ ref.id ]: ref
      }
    } ) );
  };

  const evaluate = () => {
    if ( !selectedOperation?.expression ) {
      alert( "Please enter an expression to evaluate." );
      return;
    }

    const context = { ...inputContext, ...outputContext }
    //.reduce( ( acc, n ) => ( { ...acc, [ n.id ]: n } ), {} );
    const result = evaluateOperation( selectedOperation as Operation, context );

    setResult( result );

    // If there was an output reference, result should be the updated context
    if ( selectedOperation?.outputs && result && typeof result === 'object' && !Array.isArray( result ) ) {
      onOutput( result as Record<string, unknown> );
    }
  };

  const resetOperation = () => {
    setSelectedOperation( newOperation() );
    setSelectedInputRef( undefined );
    setSelectedOutputRef( undefined );
    setResult( null );
  };

  const deleteOperation = ( id: string ) => {
    console.debug( "Deleting operation", id );
    const operationToDelete = withOperations.operations?.[ id ];
    if ( !operationToDelete ) {
      console.warn( `Operation with id ${id} not found.` );
      return;
    }
    onChange( operationToDelete, "delete" );
    resetOperation();
  };

  return (
    <Section title="Operation Editor" bordered className="mt-2" collapsible>
      <OperationList
        withOperation={ withOperations }
        onDelete={ deleteOperation }
        selectOperation={ setSelectedOperation }
      />
      <PopBox color="white">
        <div className="space-y-4">
          {/* Description */ }
          <PopBox color="green">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                value={ selectedOperation?.description }
                placeholder="Describe what this operation does"
                className="w-full border rounded p-2 bg-white"
                saveOn={ [ 'change' ] }
                onSave={ ( value ) => setSelectedOperation( prev => ( {
                  ...prev,
                  description: value
                } ) ) }
              />
            </div>
          </PopBox>

          {/* Inputs */ }
          <PopBox color="blue">
            <OperationReferenceEditor
              title="Inputs"
              context={ inputContext }
              editingRef={ selectedInputRef }
              onSaveRef={ saveInput }
              onDeleteRef={ () => {
                setSelectedInputRef( undefined );
              } }
            />

            {  /* Show inputs as buttons that let the user click to edit them */ }
            <div className="flex space-x-2">
              { Object.values( selectedOperation.inputs ).map( ( input ) =>
                <div key={ input.name } className="flex flex-col">
                  <OperationReference
                    key={ input.id }
                    ref={ input }
                    context={ inputContext }
                    handleSelect={ setSelectedInputRef }
                    handleDelete={ removeRef }
                    handleCopy={ copyInputToExpression }
                  />
                </div>
              ) }
            </div>
          </PopBox>

          {/* Expression */ }
          <PopBox color="yellow">
            <OperationExpressionEditor
              expression={ selectedOperation?.expression }
              onExpressionChange={ ( expression ) => setSelectedOperation( prev => ( {
                ...prev,
                expression
              } ) ) }
              suggestions={ Object.values( selectedOperation.inputs ).map( input => input.name ) || [] }
            />
          </PopBox>

          {/* Output */ }
          <PopBox color="gray">
            <OperationReferenceEditor
              title="Output"
              context={ outputContext }
              editingRef={ selectedOutputRef }
              onSaveRef={ saveOutput }
            />
          </PopBox>

          { Object.values( selectedOperation.outputs ).map( ( output ) => (
            <PopBox color="gray" >
              <OperationReference
                key={ output.id }
                ref={ output }
                context={ outputContext }
                handleSelect={ setSelectedOutputRef }
                handleDelete={ removeRef }
                handleCopy={ copyInputToExpression }
              />
            </PopBox>
          ) ) }

          {/* Actions */ }
          <div className="flex space-x-2">
            <ExecuteButton
              onClick={ evaluate }
              disabled={ !selectedOperation?.expression }
            />
            <SaveButton onClick={ () => {
              saveOperation()
              resetOperation()
            } }
              disabled={ !selectedOperation?.expression || !selectedOperation?.description }
            />
            <CloseButton onClick={ resetOperation } />
          </div>

          {/* Result */ }
          <OperationResultDisplay result={ result } />
        </div>
      </PopBox>
    </Section>
  );
}

export function OperationReference( { ref, context, handleSelect, handleDelete, handleCopy }: { ref: Reference, context: Record<string, unknown>, handleSelect: ( ref: Reference ) => void, handleDelete: ( ref: Reference ) => void, handleCopy: ( ref: Reference ) => void } ) {
  const resolvedValue = resolveValue( context, ref );
  if ( !resolvedValue ) return "Error resolving input";
  const value = resolvedValue.value as string;
  const name = resolvedValue.name;
  return (
    <Expander
      direction="left"
      items={ [
        <CopyButton onClick={ () => handleCopy( ref ) } />,
        <DeleteButton onClick={ () => handleDelete( ref ) } />,
      ] }
    >
      <Button
        className="bg-blue-500 text-white rounded px-2 py-1 text-sm"
        onClick={ () => handleSelect( ref ) }
      >
        <div className="mx-2 flex flex-col">
          <p><b>{ name }</b>: "{ value }"</p>
        </div>
      </Button>
    </Expander>
  )
}
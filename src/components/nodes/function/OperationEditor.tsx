import { useState, useEffect } from "react";
import { FunctionNode, MetaDataID } from "@graphTypes/graphTypes";
import { Section } from "@core/Section";
import { Input } from "@core/Input";
import { useNode } from "@/hooks/useGraph";
import { useGraphStore } from "@stores/useGraphStore";
import { Operation, Reference } from "@/types/operationTypes";
import { evaluateOperation } from "@/logic/operationLogic";
import { nanoid } from "nanoid";
import { OperationInputsEditor } from "./OperationInputsEditor";
import { OperationOutputEditor } from "./OperationOutputEditor";
import { OperationExpressionEditor } from "./OperationExpressionEditor";
import { OperationActions } from "./OperationActions";
import { OperationResultDisplay } from "./OperationResultDisplay";

interface OperationEditorProps {
  node: FunctionNode;
  metadataId?: MetaDataID;
  setMetadataId: ( id: MetaDataID ) => void;
}

export function OperationEditor( { node, metadataId, setMetadataId }: OperationEditorProps ) {
  const [ description, setDescription ] = useState( node.metadata[ metadataId || "" ]?.description || "" );
  const [ expression, setExpression ] = useState( node.metadata[ metadataId || "" ]?.expression || "" );
  const [ selectedInputs, setSelectedInputs ] = useState<Reference[]>( node.metadata[ metadataId || "" ]?.inputs || [] );
  const [ selectedOutput, setSelectedOutput ] = useState<Reference | undefined>( node.metadata[ metadataId || "" ]?.output || undefined );
  const [ result, setResult ] = useState<unknown>( null );

  const nodeData = useNode( node.id );
  const { updateNode, nodes } = useGraphStore();

  // Update state when metadataId changes (when user selects different operation)
  useEffect( () => {
    const operation = node.metadata[ metadataId || "" ];
    if ( operation ) {
      setDescription( operation.description || "" );
      setExpression( operation.expression || "" );
      setSelectedInputs( operation.inputs || [] );
      setSelectedOutput( operation.output || undefined );
      setResult( null ); // Clear previous results when switching operations
    } else {
      // Clear form when no operation is selected
      setDescription( "" );
      setExpression( "" );
      setSelectedInputs( [] );
      setSelectedOutput( undefined );
      setResult( null );
    }
  }, [ metadataId, node.metadata ] );

  if ( !nodeData ) return null;

  const { incomingNodes, outgoingNodes, children, parent } = nodeData;

  // Get all available nodes for inputs/outputs
  const availableNodes = [
    ...( incomingNodes || [] ),
    ...( outgoingNodes || [] ),
    ...( children || [] ),
    ...( parent ? [ parent ] : [] )
  ].filter( Boolean );

  const addInput = () => {
    // For simplicity, add a placeholder input that user can configure
    const newInput: Reference = {
      name: `input${selectedInputs.length + 1}`,
      index: "",
      key: ""
    };
    setSelectedInputs( [ ...selectedInputs, newInput ] );
  };

  const updateInput = ( inputIndex: number, field: string, value: string ) => {
    const updatedInputs = [ ...selectedInputs ];
    updatedInputs[ inputIndex ] = {
      ...updatedInputs[ inputIndex ],
      [ field ]: value
    };
    setSelectedInputs( updatedInputs );
  };

  const removeInput = ( index: number ) => {
    setSelectedInputs( selectedInputs.filter( ( _, i ) => i !== index ) );
  };

  const copyInputToExpression = ( input: Reference ) => {
    navigator.clipboard.writeText( JSON.stringify( input.name, null, 2 ) );
    setExpression( prev => `${prev} ${input.name}` );
  };

  const saveOperation = () => {
    if ( !description || !expression ) {
      alert( "Please enter description and expression" );
      return;
    }

    // Use existing operation ID if editing, otherwise create new one
    const operationId = metadataId || nanoid();

    const operation: Operation = {
      id: operationId,
      description,
      inputs: selectedInputs,
      expression,
      output: selectedOutput
    };

    // Store operation in node metadata
    const newMetadata = {
      ...node.metadata,
      [ operationId ]: operation
    };

    updateNode( {
      ...node,
      metadata: newMetadata
    } );

    setMetadataId( operationId );
  };

  const evaluate = () => {
    if ( !expression ) {
      alert( "Please add an expression" );
      return;
    }

    const operation: Operation = {
      id: metadataId || nanoid(),
      description,
      inputs: selectedInputs,
      expression,
      output: selectedOutput
    };

    const result = evaluateOperation( operation, nodes );
    setResult( result );
  };

  const newOperation = () => {
    setMetadataId( undefined );
  };

  return (
    <Section title="Operation Editor" bordered className="mt-2">
      <div className="space-y-4">
        {/* Description */ }
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Input
            value={ description }
            onChange={ ( e ) => setDescription( e.target.value ) }
            placeholder="Describe what this operation does"
            className="w-full border rounded p-2"
            saveOn={ [ 'change' ] }
            onSave={ setDescription }
          />
        </div>

        {/* Inputs */ }
        <OperationInputsEditor
          selectedInputs={ selectedInputs }
          availableNodes={ availableNodes }
          onAddInput={ addInput }
          onUpdateInput={ updateInput }
          onRemoveInput={ removeInput }
          onCopyInputToExpression={ copyInputToExpression }
        />

        {/* Expression */ }
        <OperationExpressionEditor
          expression={ expression }
          onExpressionChange={ setExpression }
        />

        {/* Output (optional) */ }
        <OperationOutputEditor
          selectedOutput={ selectedOutput }
          availableNodes={ availableNodes }
          onUpdateOutput={ setSelectedOutput }
        />

        {/* Actions */ }
        <OperationActions onEvaluate={ evaluate } onSave={ saveOperation } isEditing={ !!metadataId } onNew={ newOperation } />

        {/* Result */ }
        <OperationResultDisplay result={ result } />
      </div>
    </Section>
  );
}

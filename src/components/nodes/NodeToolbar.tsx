import { Section } from "@core/Section";
import { useGraphStore } from "@stores/useGraphStore";
import { Input } from "@core/Input";
import { Button, DeleteButton } from "@core/Button";
import { Expander } from "@core/Expander";
import { Edges } from "@edges/Edges";
import { NodeEditor } from "@nodes/NodeEditor";
import { useNode, useLocalGraph } from "@hooks/useGraph";
import { OperationEditor } from "../operation/OperationEditor";
import { NodeID, Node } from "@/types/graphTypes";
import { isNode } from "@/logic/graphLogic";
import { Operation } from "@/types/operationTypes";
import { KVPEditor } from "./key_value_pair/KVPEditor";

export function NodeToolbar() {
  const {
    currentRoot,
    selectedNode,
    nodes,
  } = useLocalGraph();

  const {
    setSelectedNodeId,
    setCurrentRootId,
    deleteNode,
    updateNode,
  } = useGraphStore();

  return (
    <div className="space-y-4">
      <Section title={ `Current view: ${currentRoot?.label ?? 'Root'}` }>
        <div className="mt-2 space-x-2">
          { currentRoot?.id ? <Button onClick={ () => {
            setCurrentRootId( currentRoot?.parentId )
          } }
          >
            Up
          </Button> : null }
        </div>
      </Section>

      <Section title="Nodes" bordered className="flex flex-col justify-between">
        <ul>
          { nodes.map( ( node ) => (
            <Expander
              key={ node.id }
              items={ [
                <DeleteButton onClick={ () => deleteNode( node.id ) } />
              ] }
              staggerDelay={ 100 }
              itemSpacing={ 10 }
              direction="left"
            >
              <div
                key={ node.id }
                className={ "flex items-center justify-between" + ( selectedNode?.id === node.id ? " bg-gray-200" : "" ) }
                onClick={ () => setSelectedNodeId( node.id ) }
              >
                <Input
                  id={ `label-${node.id}` }
                  value={ node.label }
                  saveOn={ [ "enter", "blur", "change" ] }
                  onSave={ ( newLabel ) => updateNode( { ...node, label: newLabel } ) }
                />
              </div>
            </Expander>
          ) ) }
        </ul>
      </Section>

      { selectedNode?.id && <SelectedNode id={ selectedNode.id } /> }
    </div>
  );
}

function SelectedNode( props: { id: string } ) {
  const selectedState = useNode( props.id );
  const { saveNodeAsTemplate } = useGraphStore();

  const { edges, node, update, incomingNodes, children, parent } = selectedState;

  // Get all available nodes for inputs
  const availableInputNodes: Record<NodeID, Node> = [
    ...( [ node ] ),
    ...( incomingNodes || [] ),
    ...( children || [] ),
    ...( parent ? [ parent ] : [] )
  ].filter( Boolean ).reduce( ( acc, n ) => {
    acc[ n.id ] = n;
    return acc;
  }, {} as Record<string, Node> );

  // For now only allow output to be the node itself
  const availableOutputNodes: Record<NodeID, Node> = [
    ...( [ node ] ),
    //...( outgoingNodes || [] ),
    //...( children || [] ),
    //...( parent ? [ parent ] : [] )
  ].filter( Boolean ).reduce( ( acc, n ) => {
    acc[ n.id ] = n;
    return acc;
  }, {} as Record<string, Node> );

  const onOperationOutput = ( newContext: Record<string, unknown> ) => {
    // Extract and update each changed node from the context
    Object.values( newContext as Record<string, unknown> ).forEach( nodeCandidate => {
      if ( isNode( nodeCandidate ) && nodeCandidate.id === node.id ) { // Constrain to current node for now
        update( nodeCandidate );
      }
    } );
  }

  const onOperationChange = ( operation: Operation, change: string ) => {
    switch ( change ) {
      case "delete": {
        const newOperations = { ...node.operations };
        delete newOperations[ operation.id ];
        return update( {
          ...node,
          operations: newOperations
        } );
      }
      case "save":
        return update( {
          ...node,
          operations: {
            ...node.operations,
            [ operation.id ]: operation
          }
        } );
      default:
        console.warn( `Unknown operation change: ${change}` );
        return;
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 mt-4">
      <NodeEditor node={ node } onChange={ update } />
      <Edges edges={ edges } />
      <OperationEditor withOperations={ node } inputContext={ availableInputNodes } outputContext={ availableOutputNodes } onOutput={ onOperationOutput } onChange={ onOperationChange } />
      <KVPEditor node={ node } />
      <Section title="Actions" bordered className="mt-4 flex-shrink-0">
        <Button
          onClick={ () => saveNodeAsTemplate( node, node.label ) }
          className="w-full"
          style={ { backgroundColor: node.shape.color, color: "#fff" } }
        >
          Save "{ node.label }" as type
        </Button>
      </Section>
    </div>
  )
}

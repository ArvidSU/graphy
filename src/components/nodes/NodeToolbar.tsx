import { Section } from "@core/Section";
import { useGraphStore } from "@stores/useGraphStore";
import { Node } from "@graphTypes/graphTypes";
import { Input } from "@core/Input";
import { Button, DeleteButton } from "@core/Button";
import { Expander } from "@core/Expander";
import { Edges } from "@edges/Edges";
import { NodeEditor } from "@nodes/NodeEditor";
import { useNode, useLocalGraph } from "@hooks/useGraph";
import { KVPToolbar } from "@nodes/key_value_pair/KVPToolbar";
import { FunctionToolbar } from "@nodes/function/FunctionToolbar";

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
  const { saveNodeAsTemplate: saveNodeAsType } = useGraphStore();
  if ( !selectedState ) return null;

  const { edges, node, update } = selectedState;

  return (
    <div className="flex flex-col flex-1 min-h-0 mt-4">
      <div className="flex-1">
        <Section bordered padding={ 2 } title={ "Selected Node" } boldTitle={ true }>
          <NodeEditor node={ node } onChange={ update } />
          <Edges edges={ edges } />
          <NodeTypeSpecificToolbar node={ node } />
        </Section>
      </div>
      <Section title="Actions" bordered className="mt-4 flex-shrink-0">
        <Button
          onClick={ () => saveNodeAsType( node, node.label ) }
          className="w-full"
          style={ { backgroundColor: node.shape.color, color: "#fff" } }
        >
          Save "{ node.label }" as type
        </Button>
      </Section>
    </div>
  )
}

function NodeTypeSpecificToolbar( props: { node: Node } ) {
  const { node } = props;

  switch ( node.type ) {
    case "function":
      return <FunctionToolbar node={ node } />;
    case "key_value":
      return <KVPToolbar node={ node } />;
    default: {
      // Type narrowing for any future node types
      const _exhaustiveCheck: never = node;
      return (
        <Section title="Node Specific" bordered className="mt-2">
          <p>Not implemented for node type: { String( _exhaustiveCheck ) }</p>
        </Section>
      );
    }
  }
}


import { Section } from "../core/Section";
import { useGraphStore } from "../../stores/useGraphStore";
import { Node } from "../../logic/graphTypes";
import { Input } from "../core/Input";
import { Button, DeleteButton } from "../core/Button";
import { Expander } from "../core/Expander";
import { Edges } from "./Edges";
import { KVPAvailableReferences, KVPMetadataEditor } from "./KVPEditor";
import { NodeEditor } from "./NodeEditor";
import { useNode, useLocalGraph } from "../../hooks/useGraph";

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
  const { saveNodeAsType } = useGraphStore();
  if ( !selectedState ) return null;

  const { edges, node, update } = selectedState;

  return (
    <div className="flex flex-col flex-1 min-h-0 mt-4">
      <div className="flex-1">
        <Section bordered padding={ 2 } title={ "Selected Node" } boldTitle={ true }>
          <NodeEditor node={ node } onChange={ update } />
          <Edges edges={ edges } />
          <MetaDataEditor node={ node } />
          <AvailableReferences node={ node } />
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

function NotImplemented( props: { item?: string } ) {
  return (
    <Section title={ props.item } bordered className="mt-2">
      <p>Not implemented</p>
    </Section>
  )
}

function AvailableReferences( props: { node: Node } ) {
  const { node } = props;
  if ( !node.id ) return null;
  switch ( node.type ) {
    case "function":
      return ( <NotImplemented item="Function" /> )
    case "key_value":
      return (
        <KVPAvailableReferences id={ node.id } />
      )
    default:
      return ( <NotImplemented item="Unknown" /> )
  }
}

function MetaDataEditor( props: { node: Node } ) {
  const { node } = props;
  if ( !node ) return null;
  switch ( node.type ) {
    case "function":
      return ( <NotImplemented /> )
    case "key_value":
      return (
        <KVPMetadataEditor { ...node } />
      )
    default:
      return ( <NotImplemented /> )
  }
}


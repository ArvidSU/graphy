import { Bar } from "./core/Bar";
import { Section } from "./core/Section";
import { useGraphStore } from "../stores/useGraphStore";
import { Node } from "../logic/graphTypes";
import { Input } from "./core/Input";
import { Button, DeleteButton } from "./core/Button";
import { Expander } from "./core/Expander";
import { Edges } from "./toolbar/Edges";
import { KVPAvailableReferences, KVPMetadataEditor } from "./toolbar/KVPEditor";
import { NodeEditor } from "./toolbar/NodeEditor";
import { useNode, useLocalGraph } from "../hooks/useGraph";

export function Toolbar() {
  const localGraph = useLocalGraph();

  const {
    setSelectedNodeId,
    setCurrentRootId,
    deleteNode,
    updateNode,
  } = useGraphStore();

  return (
    <Bar position="right" className="space-y-4 text-sm">
      <Section title={ `Current view: ${localGraph.currentRoot?.label ?? 'Root'}` }>
        <div className="mt-2 space-x-2">
          { localGraph.currentRoot?.id ? <Button onClick={ () => {
            setCurrentRootId( localGraph.currentRoot?.parentId )
          } }
          >
            Up
          </Button> : null }
        </div>
      </Section>

      <Section title="Nodes" bordered className="flex flex-col justify-between">
        <ul>
          { localGraph.nodes.map( ( node ) => (
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
                className={ "flex items-center justify-between" + ( localGraph.selectedNode?.id === node.id ? " bg-gray-200" : "" ) }
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
      { localGraph.selectedNode?.id && <SelectedNode id={ localGraph.selectedNode.id } /> }
    </Bar >
  );
}

function SelectedNode( props: { id: string } ) {
  const selectedState = useNode( props.id );
  if ( !selectedState ) return null;

  const { edges, node, update } = selectedState;

  return (
    <Section bordered padding={ 2 } title={ "Selected Node" } boldTitle={ true }>
      <NodeEditor node={ node } onChange={ update } />
      <Edges edges={ edges } />
      <MetaDataEditor node={ node } />
      <AvailableReferences node={ node } />
    </Section>
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


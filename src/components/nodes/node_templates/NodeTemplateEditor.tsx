import { Section } from "@core/Section";
import { Button, CopyButton, DeleteButton } from "@core/Button";
import { Input } from "@core/Input";
import { useGraphStore } from "@stores/useGraphStore";
import { ColorEditor } from "@nodes/NodeEditor";
import { NodeTemplateID } from "@graphTypes/graphTypes";
import { Expander } from "@core/Expander";

export function NodeTypeEditor() {
  const { nodeTypes } = useGraphStore();

  return (
    <Section
      title="Node Types"
      collapsible
      bordered
      padding={ 2 }
      margin={ 2 }
      className="flex flex-col shrink-0"
    >
      {/* List of node types */ }
      <div className="space-y-2">
        { Object.values( nodeTypes ).map( ( nodeType ) => (
          <NodeTypeItem id={ nodeType.id } key={ nodeType.id } />
        ) ) }
      </div>
    </Section>
  );
}

function NodeTypeItem( props: { id: NodeTemplateID } ) {
  const { nodeTypes, deleteNodeTemplate: deleteNodeType, setDefaultNodeTemplate: setDefaultNodeType, defaultNodeTypeId, updateNodeTemplate: updateNodeType, saveNodeAsTemplate: saveNodeAsType } = useGraphStore();
  const nodeType = nodeTypes[ props.id ];

  const handleNameChange = ( newName: string ) => {
    const name = newName.trim();
    if ( name ) {
      const updatedNodeType = { ...nodeType, name: name, template: { ...nodeType.template, label: name } };
      updateNodeType( nodeType.id, updatedNodeType );
    }
  }

  const handleColorChange = ( color: string ) => {
    const updatedNodeType = {
      ...nodeType,
      template: {
        ...nodeType.template,
        shape: {
          ...nodeType.template.shape,
          color
        }
      }
    };
    updateNodeType( nodeType.id, updatedNodeType );
  }

  return (
    <Expander
      items={ [
        <Input
          id={ `node-type-name-${nodeType.id}` }
          value={ nodeType.name }
          saveOn={ [ "blur", "enter", "change" ] }
          onSave={ handleNameChange }
          className="text-sm bg-white border border-gray-300 rounded-md p-2"
        />,
        <ColorEditor color={ nodeType.template.shape.color } onChange={ handleColorChange } />,
        <CopyButton onClick={ () => saveNodeAsType( nodeType.template, nodeType.name + " (copy)" ) } />,
        <DeleteButton onClick={ () => deleteNodeType( nodeType.id ) } />
      ] }
    >
      <Button
        className="text-sm text-gray-700 w-full"
        onClick={ () => setDefaultNodeType( nodeType.id ) }
        style={ {
          backgroundColor: nodeType.template.shape.color,
          color: "#fff",
          border: props.id === defaultNodeTypeId
            ? `3px solid ${nodeType.template.shape.border.color}`
            : "3px solid transparent",
        } }
      >
        { nodeType.name }
      </Button>
    </Expander>
  )
}
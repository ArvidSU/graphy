import { useGraphStore } from "@stores/useGraphStore";
import { Section } from "@core/Section";
import { Input } from "@core/Input";
import { Button, DeleteButton } from "@core/Button";
import { Expander } from "@core/Expander";

export function NodeTypeToolbar() {
  const {
    nodeTypes,
    defaultNodeTypeId,
    setDefaultNodeType,
    deleteNodeType,
    updateNodeType
  } = useGraphStore();

  const nodeTypesArray = Object.values( nodeTypes );

  return (
    <div className="space-y-4">
      <Section title="Node Types" bordered className="flex flex-col justify-between">
        <ul>
          { nodeTypesArray.map( ( nodeType ) => (
            <Expander
              key={ nodeType.id }
              items={ [
                <Button
                  onClick={ () => setDefaultNodeType( nodeType.id ) }
                  className={ `text-xs px-2 py-1 ${defaultNodeTypeId === nodeType.id
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                    }` }
                >
                  { defaultNodeTypeId === nodeType.id ? "Default" : "Set Default" }
                </Button>,
                <DeleteButton
                  onClick={ () => deleteNodeType( nodeType.id ) }
                  disabled={ nodeTypesArray.length === 1 }
                />
              ] }
              staggerDelay={ 100 }
              itemSpacing={ 10 }
              direction="left"
            >
              <div
                key={ nodeType.id }
                className="flex items-center justify-between"
              >
                <Input
                  id={ `nodetype-name-${nodeType.id}` }
                  value={ nodeType.name }
                  saveOn={ [ "enter", "blur", "change" ] }
                  onSave={ ( newName ) =>
                    updateNodeType( nodeType.id, { ...nodeType, name: newName } )
                  }
                />
              </div>
            </Expander>
          ) ) }
        </ul>
      </Section>

      <Section title="Template Properties" bordered>
        <p>Node type template editor - coming soon</p>
      </Section>
    </div>
  );
}

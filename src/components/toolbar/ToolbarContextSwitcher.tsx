import { useGraphStore } from "@stores/useGraphStore";
import { ToolbarContext } from "@graphTypes/graphTypes";
import { Button } from "@core/Button";
import { Section } from "@core/Section";

export function ToolbarContextSwitcher() {
  const { toolbarContext, setToolbarContext: setToolbarState } = useGraphStore();

  const contexts = [
    { value: "node" as const, label: "Nodes" },
    { value: "edge" as const, label: "Edges" },
    { value: "nodeType" as const, label: "Types" },
    { value: "project" as const, label: "Project" },
  ];

  const handleContextChange = ( context: ToolbarContext ) => {
    setToolbarState( context );
  };

  return (
    <Section title="Context" bordered className="mb-4">
      <div className="flex flex-wrap gap-2">
        { contexts.map( ( { value, label } ) => (
          <Button
            key={ value }
            onClick={ () => handleContextChange( value ) }
            className={ `text-xs px-2 py-1 ${toolbarContext === value
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
              }` }
          >
            { label }
          </Button>
        ) ) }
      </div>
    </Section>
  );
}

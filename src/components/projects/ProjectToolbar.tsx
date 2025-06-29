import { useGraphStore } from "@stores/useGraphStore";
import { Section } from "@core/Section";
import { Input } from "@core/Input";
import { Button } from "@core/Button";
import { OperationEditor } from "../operation/OperationEditor";
import { Operation } from "@/types/operationTypes";

export function ProjectToolbar() {
  const {
    name,
    description,
    created,
    modified,
    setProjectName,
    setProjectDescription,
    nodes,
    edges,
    operations,
    updateProjectOperation,
    deleteProjectOperation
  } = useGraphStore();

  const formatDate = ( timestamp: number ) => {
    return new Date( timestamp ).toLocaleDateString();
  };

  const nodeCount = Object.keys( nodes ).length;
  const edgeCount = Object.keys( edges ).length;

  // Create a graph state object that implements WithOperations
  const projectWithOperations = {
    operations: operations || {}
  };

  // Create context for the operation editor - the entire graph state
  const graphContext = {
    project: {
      id: name, // Use name as a simple id for now
      name,
      description: description || "",
      created,
      modified,
      nodes,
      edges,
      nodeCount,
      edgeCount
    }
  };

  const handleOperationChange = ( operation: Operation, change: string ) => {
    switch ( change ) {
      case "delete":
        deleteProjectOperation( operation.id );
        break;
      case "save":
        updateProjectOperation( operation );
        break;
      default:
        console.warn( `Unknown operation change: ${change}` );
    }
  };

  const handleOperationOutput = ( newContext: Record<string, unknown> ) => {
    // For now, we'll just log the output since updating the entire graph state
    // would require more complex logic to determine what changed
    console.log( "Project operation output:", newContext );
  };

  return (
    <div className="space-y-4">
      <Section title="Project Details" bordered>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500">Project Name</label>
            <Input
              id="project-name"
              value={ name }
              saveOn={ [ "enter", "blur", "change" ] }
              onSave={ setProjectName }
              className="w-full mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Description</label>
            <Input
              id="project-description"
              value={ description || "" }
              saveOn={ [ "enter", "blur", "change" ] }
              onSave={ setProjectDescription }
              className="w-full mt-1"
            />
          </div>
        </div>
      </Section>

      <Section title="Statistics" bordered>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Nodes:</span>
            <span>{ nodeCount }</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Edges:</span>
            <span>{ edgeCount }</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Created:</span>
            <span>{ formatDate( created ) }</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Modified:</span>
            <span>{ formatDate( modified ) }</span>
          </div>
        </div>
      </Section>

      <Section title="Actions" bordered>
        <div className="space-y-2">
          <Button className="w-full">
            Export Project
          </Button>
          <Button className="w-full">
            Import Project
          </Button>
        </div>
      </Section>

      <OperationEditor
        withOperations={ projectWithOperations }
        inputContext={ graphContext }
        outputContext={ graphContext }
        onOutput={ handleOperationOutput }
        onChange={ handleOperationChange }
      />
    </div>
  );
}

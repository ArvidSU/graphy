import { Bar } from "@core/Bar";
import { Section } from "@core/Section";
import { useGraphStore } from "@stores/useGraphStore";
import { newProject } from "@stores/projectConstants";
import { nanoid } from "nanoid";
import { Input } from "@core/Input";
import { saveProjectToLocalStorage } from "@utils/projectUtils";
import { Button } from "@core/Button";
import { ImportButton } from "@projects/ImportButton";
import { ExportButton } from "@projects/ExportButton";
import { NodeTree } from "@projects/NodeTree";
import { Projects } from "@projects/Projects";
import { NodeTypeEditor } from "@nodeTemplates/NodeTemplateEditor";

export function Sidebar() {
  const { setProjectName, setProjectDescription } = useGraphStore();
  const { name, description, nodes, loadGraph } = useGraphStore();

  const handleCreateProject = () => {
    const now = Date.now();
    const newP = {
      ...newProject,
      id: nanoid(),
      created: now,
      modified: now
    };

    saveProjectToLocalStorage( newP );

    loadGraph( newP );
  };

  return (
    <Bar position="left" spaceBetween={ true }>
      <Section padding={ 2 } margin={ 2 }>
        <div className="flex flex-col items-center justify-between">
          <Input
            className="mb-2 font-bold text-lg text-black text-center"
            value={ name }
            saveOn={ [ "blur", "enter", "change" ] }
            onSave={ setProjectName }
          />
          <Input
            className="mb-2 text-sm text-gray-600 text-center"
            value={ description }
            saveOn={ [ "blur", "enter", "change" ] }
            onSave={ setProjectDescription }
          />
        </div>
      </Section>

      <Section
        collapsible={ true }
        title="Nodes"
        overflow="auto"
        className="grow"
      >
        <ul className="text-sm pl-2 list-disc list-inside">
          { Object.values( nodes ).filter( ( node ) => !node.parentId ).map( ( node ) => (
            <NodeTree key={ node.id } node={ node } indent={ 0 } />
          ) ) }
        </ul>
      </Section>

      <NodeTypeEditor />

      <Section title="Projects" collapsible bordered={ true } padding={ 2 } margin={ 4 } className="flex flex-col shrink-0" maxHeight="40vh">
        <Projects />
        <Button
          onClick={ handleCreateProject }>
          New Project
        </Button>
        <ImportButton />
        <ExportButton />
      </Section>
    </Bar>
  );
}
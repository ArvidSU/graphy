import { Bar } from "@core/Bar";
import { useGraphStore } from "@stores";
import { NodeToolbar } from "@nodes/NodeToolbar";
import { EdgeToolbar } from "@edges/EdgeToolbar";
import { NodeTypeToolbar } from "@nodes/node_templates/NodeTemplateToolbar";
import { ProjectToolbar } from "@projects/ProjectToolbar";
import { ToolbarContextSwitcher } from "./ToolbarContextSwitcher";

export function Toolbar() {
  const { toolbarContext } = useGraphStore();

  const renderToolbar = () => {
    switch ( toolbarContext ) {
      case "node":
        return <NodeToolbar />;
      case "edge":
        return <EdgeToolbar />;
      case "nodeType":
        return <NodeTypeToolbar />;
      case "project":
        return <ProjectToolbar />;
      default:
        return <ProjectToolbar />; // Default fallback
    }
  };

  return (
    <Bar position="right" className="text-sm h-full flex flex-col">
      <ToolbarContextSwitcher />
      { renderToolbar() }
    </Bar>
  );
}


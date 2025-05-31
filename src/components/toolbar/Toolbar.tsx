import { Bar } from "@core/Bar";
import { useGraphStore } from "@stores/useGraphStore";
import { NodeToolbar } from "@nodes/NodeToolbar";
import { EdgeToolbar } from "@edges/EdgeToolbar";
import { NodeTypeToolbar } from "@nodes/node_templates/NodeTemplateToolbar";
import { ProjectToolbar } from "@projects/ProjectToolbar";
import { RulesToolbar } from "@rules/RulesToolbar";
import { ToolbarContextSwitcher } from "./ToolbarContextSwitcher";

export function Toolbar() {
  const { toolbarState } = useGraphStore();

  const renderToolbar = () => {
    switch ( toolbarState.context ) {
      case "node":
        return <NodeToolbar />;
      case "edge":
        return <EdgeToolbar />;
      case "nodeType":
        return <NodeTypeToolbar />;
      case "project":
        return <ProjectToolbar />;
      case "rules":
        return <RulesToolbar />;
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


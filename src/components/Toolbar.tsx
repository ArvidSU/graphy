import { Bar } from "./core/Bar";
import { useGraphStore } from "../stores/useGraphStore";
import { NodeToolbar } from "./toolbar/NodeToolbar";
import { EdgeToolbar } from "./toolbar/EdgeToolbar";
import { NodeTypeToolbar } from "./toolbar/NodeTypeToolbar";
import { ProjectToolbar } from "./toolbar/ProjectToolbar";
import { RulesToolbar } from "./toolbar/RulesToolbar";
import { ToolbarContextSwitcher } from "./toolbar/ToolbarContextSwitcher";

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


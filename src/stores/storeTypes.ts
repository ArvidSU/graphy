import type { GraphState } from "@graphTypes/graphTypes";
import type { NodeStore } from "./nodeStore";
import type { EdgeStore } from "./edgeStore";
import type { ProjectStore } from "./projectStore";
import type { NodeTypeStore } from "./nodeTypeStore";
import type { ToolbarStore } from "./toolbarStore";

// Re-export GraphState for convenience
export type { GraphState } from "@graphTypes/graphTypes";

// Combined store interface that extends all domain stores
export interface GraphStore extends GraphState, NodeStore, EdgeStore, ProjectStore, NodeTypeStore, ToolbarStore { }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GraphSetState = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GraphGetState = any;

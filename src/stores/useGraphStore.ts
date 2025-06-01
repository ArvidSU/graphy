import { createWithEqualityFn } from "zustand/traditional";

// Import domain-specific stores
import { createNodeStore, type NodeInput } from "./nodeStore";
import { createEdgeStore } from "./edgeStore";
import { createProjectStore } from "./projectStore";
import { createNodeTemplateStore } from "./nodeTemplateStore";
import { createToolbarStore } from "./toolbarStore";
import { newProject } from "./projectConstants";
import type { GraphStore } from "./storeTypes";

export type { GraphStore } from "./storeTypes";

export const useGraphStore = createWithEqualityFn<GraphStore>( ( set, get ) => ( {
  ...newProject,

  // Compose all domain stores
  ...createNodeStore( set, get ),
  ...createEdgeStore( set, get ),
  ...createProjectStore( set ),
  ...createNodeTemplateStore( set ),
  ...createToolbarStore( set ),

} ) );

// Export NodeInput type for external use
export type { NodeInput };


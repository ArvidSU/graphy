/**
 * Store exports for the graph visualization application
 * 
 * This file provides a centralized export point for all store-related functionality.
 * The main store is composed of domain-specific stores for better organization.
 */

// Main store (composition of all domain stores)
export { useGraphStore } from './useGraphStore';

// Domain-specific stores (for direct access if needed)
export { createNodeStore } from './nodeStore';
export { createEdgeStore } from './edgeStore';
export { createProjectStore } from './projectStore';
export { createNodeTypeStore } from './nodeTypeStore';
export { createToolbarStore } from './toolbarStore';

// Store utilities and types
export { selectors } from './selectors';
export { newProject } from './projectConstants';
export type {
  GraphStore,
  GraphState,
  GraphSetState,
  GraphGetState
} from './storeTypes';

// Domain store interfaces (for typing)
export type { NodeStore } from './nodeStore';
export type { EdgeStore } from './edgeStore';
export type { ProjectStore } from './projectStore';
export type { NodeTypeStore } from './nodeTypeStore';
export type { ToolbarStore } from './toolbarStore';

// Re-export commonly used types
export type { NodeInput } from './useGraphStore';

// Re-export selector functions individually for convenience
export {
  selectLocalGraphView,
  selectNodeAdjacentData,
  selectKVPMetadata
} from './selectors';

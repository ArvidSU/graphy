# Store Architecture Documentation

This document describes the store architecture for the graph visualization application, which uses Zustand for state management with a domain-driven design approach.

## Overview

The store is organized using a composition pattern where domain-specific stores are combined into a single main store. This approach provides better code organization, maintainability, and type safety while preserving the benefits of a unified state tree.

## Architecture

### Main Store (`useGraphStore.ts`)

The main store combines all domain-specific stores using Zustand's store composition pattern:

```typescript
export const useGraphStore = create<GraphStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      ...createNodeStore(set, get),
      ...createEdgeStore(set, get),
      ...createProjectStore(set, get),
      ...createNodeTypeStore(set, get),
      ...createToolbarStore(set, get),
    }),
    { name: "graph-store" }
  )
);
```

### Domain Stores

#### 1. **Node Store** (`nodeStore.ts`)

Manages all node-related operations:

- Creating, updating, and deleting nodes
- Node positioning and layout
- Node selection and focus
- Node input/output management

**Key Functions:**

- `addNode()` - Creates new nodes
- `updateNode()` - Updates node properties
- `deleteNode()` - Removes nodes and their connections
- `setNodePosition()` - Updates node coordinates
- `setSelectedNodes()` - Manages node selection

#### 2. **Edge Store** (`edgeStore.ts`)

Handles all edge/connection operations:

- Creating and deleting edges
- Edge validation and constraints
- Edge styling and properties

**Key Functions:**

- `addEdge()` - Creates new connections
- `deleteEdge()` - Removes connections
- `updateEdge()` - Modifies edge properties

#### 3. **Project Store** (`projectStore.ts`)

Manages project-level operations:

- Project creation and initialization
- Loading and saving projects
- Project metadata and settings

**Key Functions:**

- `newProject()` - Creates fresh project state
- `loadProject()` - Loads project from data
- `updateProjectSettings()` - Modifies project configuration

#### 4. **Node Type Store** (`nodeTypeStore.ts`)

Manages node type templates and definitions:

- Node type registration and management
- Template creation and updates
- Default node configurations

**Key Functions:**

- `addNodeType()` - Registers new node types
- `updateNodeType()` - Modifies node type definitions
- `deleteNodeType()` - Removes node types

#### 5. **Toolbar Store** (`toolbarStore.ts`)

Handles UI toolbar state:

- Tool selection and modes
- Toolbar visibility and layout
- Tool-specific settings

**Key Functions:**

- `setSelectedTool()` - Changes active tool
- `toggleToolbar()` - Shows/hides toolbar

## Type Safety

### Store Types (`storeTypes.ts`)

Defines TypeScript interfaces for type-safe store development:

```typescript
export type GraphSetState = (
  partial:
    | GraphState
    | Partial<GraphState>
    | ((state: GraphState) => GraphState | Partial<GraphState>),
  replace?: boolean | undefined
) => void;

export type GraphGetState = () => GraphState;
```

### Interface Composition

The main `GraphStore` interface extends all domain store interfaces:

```typescript
export interface GraphStore
  extends GraphState,
    NodeStore,
    EdgeStore,
    ProjectStore,
    NodeTypeStore,
    ToolbarStore {}
```

## Usage Patterns

### 1. **Standard Usage (Recommended)**

Import from the centralized index for most operations:

```typescript
import { useGraphStore, selectors, type NodeInput } from '@stores';

const MyComponent = () => {
  const { nodes, addNode, deleteNode } = useGraphStore();
  const localView = useGraphStore(selectors.localGraphView);

  const handleAddNode = () => {
    const newNodeInput: NodeInput = {
      label: 'New Node',
      type: 'key_value'
    };
    addNode(newNodeInput);
  };

  return (
    <div>
      <p>Total nodes: {Object.keys(nodes).length}</p>
      <button onClick={handleAddNode}>Add Node</button>
    </div>
  );
};
```

### 2. **Selective Subscriptions**

Use selectors for performance optimization:

```typescript
import { useGraphStore, selectLocalGraphView } from "@stores";

const MyComponent = () => {
  const localView = useGraphStore(selectLocalGraphView);
  // Only re-renders when the local view changes
};
```

### 3. **Direct Domain Store Access**

For specialized use cases, import domain stores directly:

```typescript
import { createNodeStore, type NodeStore } from "@stores";

// Advanced usage or testing scenarios
```

### 4. **Migration from Previous Imports**

The following imports are equivalent:

```typescript
// Old approach
import { useGraphStore } from "@stores/useGraphStore";
import { newProject } from "@stores/projectConstants";

// New centralized approach (recommended)
import { useGraphStore, newProject } from "@stores";
```

## Best Practices

### 1. **Domain Separation**

- Keep domain-specific logic in respective stores
- Avoid cross-domain dependencies when possible
- Use clear interfaces between domains

### 2. **Type Safety**

- Always use proper TypeScript types
- Leverage the provided store function types
- Define clear interfaces for all store operations

### 3. **Performance**

- Use selectors for specific state subscriptions
- Avoid subscribing to entire store when only specific data is needed
- Consider memoization for expensive computations

### 4. **Testing**

- Test domain stores in isolation
- Mock store dependencies for unit tests
- Use integration tests for store composition

## File Structure

```
src/stores/
├── index.ts              # Main export file
├── useGraphStore.ts      # Main store composition
├── storeTypes.ts         # TypeScript type definitions
├── nodeStore.ts          # Node domain store
├── edgeStore.ts          # Edge domain store
├── projectStore.ts       # Project domain store
├── nodeTypeStore.ts      # Node type domain store
├── toolbarStore.ts       # Toolbar domain store
├── selectors.ts          # Store selectors
└── projectConstants.ts   # Project initialization constants
```

## Migration from Monolithic Store

The refactoring maintains backward compatibility:

- All existing function signatures remain the same
- Import paths updated to use centralized exports
- No breaking changes to component interfaces

## Future Considerations

1. **Additional Domains**: New domains can be easily added by creating new store files and including them in the main composition
2. **Middleware**: Consider adding middleware for logging, persistence, or synchronization
3. **Performance**: Monitor store performance and consider splitting further if needed
4. **Testing**: Expand test coverage for individual domain stores

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure imports use the centralized `@stores` path
2. **Type Errors**: Verify all store functions use proper `GraphSetState` and `GraphGetState` types
3. **State Updates**: Remember that Zustand requires immutable updates

### Debugging

- Use Redux DevTools integration for state inspection
- Check console for store-related warnings
- Verify store composition in development mode

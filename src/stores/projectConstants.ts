import { GraphState } from "@graphTypes/graphTypes";
import { nanoid } from "nanoid";
import { newProjectDefaultNode } from "./nodeTypeStore";

const now = Date.now();

export const newProject: GraphState = {
  id: nanoid(),
  name: "New Graph",
  description: "A new graph project",
  created: now,
  modified: now,
  currentRootId: undefined,
  nodes: {},
  selectedNodeId: undefined,
  edges: {},
  selectedEdgeId: undefined,
  nodeTypes: {
    "default": {
      id: "default",
      name: "Node",
      template: newProjectDefaultNode
    }
  },
  defaultNodeTypeId: "default",
  toolbarState: {
    context: "project"
  }
};

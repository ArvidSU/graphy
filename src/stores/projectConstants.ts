import { GraphState } from "@graphTypes/graphTypes";
import { nanoid } from "nanoid";
import { newProjectDefaultNode } from "./nodeTemplateStore";

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
  toolbarContext: {
    context: "project"
  }
};

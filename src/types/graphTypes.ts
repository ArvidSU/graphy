import { Operation } from './operationTypes';

export type NodeID = string;
export type EdgeID = string;
export type ProjectID = string;

export interface NodeShape {
  position: {
    x: number;
    y: number;
  };
  radius: number;
  border: {
    color: string;
    width: number;
  };
  color: string;
}

export type MetaDataID = string;

export type KeyValuePairMetadata = {
  key: string;
  value: string;
};

export type Node = {
  id: NodeID;
  label: string;
  shape: NodeShape;
  parentId?: NodeID;
  attributes?: Record<MetaDataID, KeyValuePairMetadata>;
  operations?: Record<MetaDataID, Operation>;
};
export interface Edge {
  id: EdgeID;
  label: string;
  source: NodeID;
  target: NodeID;
}

export type NodeTemplateID = string;

export type NodeTemplateType = Omit<Node, "id" | "parentId">;

export interface NodeTemplate {
  id: NodeTemplateID;
  name: string;
  template: NodeTemplateType;
}

export type ToolbarContext = "node" | "nodeType" | "edge" | "project" | "rules";

export interface GraphState {
  id: ProjectID;
  name: string;
  description?: string;
  created: number; // Timestamp when the graph was created
  modified: number; // Timestamp when the graph was last modified
  currentRootId?: NodeID;
  nodes: Record<NodeID, Node>;
  selectedNodeId?: NodeID;
  edges: Record<EdgeID, Edge>;
  selectedEdgeId?: EdgeID;
  nodeTypes: Record<NodeTemplateID, NodeTemplate>;
  defaultNodeTypeId: NodeTemplateID;
  toolbarContext: ToolbarContext;
  operations?: Record<MetaDataID, Operation>;
}

export interface GraphView {
  nodes: Node[];
  edges: Edge[];
  selectedNode?: Node;
  currentRoot?: Node;
}
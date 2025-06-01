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

export type FunctionMetaData = {
  function: string;
  params: KeyValuePairMetadata[];
}

export type MetaDataFunction = Record<MetaDataID, FunctionMetaData>;

export type MetaDataKeyValue = Record<MetaDataID, KeyValuePairMetadata>;

export type MetaData = MetaDataFunction | MetaDataKeyValue;

type NodeBase = {
  id: NodeID;
  label: string;
  shape: NodeShape;
  parentId?: NodeID;
};

export type FunctionNode = NodeBase & {
  type: "function";
  metadata: MetaDataFunction;
};

export type KeyValueNode = NodeBase & {
  type: "key_value";
  metadata: MetaDataKeyValue;
};

export type Node = FunctionNode | KeyValueNode;

export interface Edge {
  id: EdgeID;
  label: string;
  source: NodeID;
  target: NodeID;
  metadata?: MetaData;
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
}

export interface GraphView {
  nodes: Node[];
  edges: Edge[];
  selectedNode?: Node;
  currentRoot?: Node;
}
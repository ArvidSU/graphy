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

export type NodeTypeID = string;

export type NodeTypeTemplate = Omit<Node, "id" | "parentId">;

export interface NodeType {
  id: NodeTypeID;
  name: string;
  template: NodeTypeTemplate;
}

export interface ToolbarState {
  context: "node" | "nodeType" | "edge" | "project" | "rules";
  id?: NodeID | NodeTypeID | EdgeID | ProjectID
}

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
  nodeTypes: Record<NodeTypeID, NodeType>;
  defaultNodeTypeId: NodeTypeID;
  toolbarState: ToolbarState;
}

export interface GraphView {
  nodes: Node[];
  edges: Edge[];
  selectedNode?: Node;
  currentRoot?: Node;
}
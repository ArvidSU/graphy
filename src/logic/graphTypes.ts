export type NodeID = string;
export type EdgeID = string;
export type ProjectID = string;

export interface NodeShape {
  position: {
    x: number;
    y: number;
  };
  radius: number;
  edge: {
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
  defaultNode: Omit<Node, "id">;
}

export interface GraphView {
  nodes: Node[];
  edges: Edge[];
  selectedNode?: Node;
  currentRoot?: Node;
}
import { MetaDataID } from "./graphTypes";

export interface Reference {
  id: string; // Unique identifier for the reference
  name: string; // Name of the reference, user-friendly reference to the resolved value
  path: ( keyof Record<string, unknown> )[]; // Path of keys to reference the nested property
}

export interface Operation {
  id: MetaDataID;
  description: string;
  inputs: Record<MetaDataID, Reference>;
  expression: string;
  outputs: Record<MetaDataID, Reference>;
  active?: boolean;
  lastExecuted?: number;
}

export type WithOperations = { operations?: Record<string, Operation>; };
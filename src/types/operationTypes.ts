export type ObjectWithId = { id: string };

export interface Reference {
  name: string; // Name of the input, user-friendly reference to the resolved value
  index: string; // Used as index to reference the object in the graph
  key: string; // Key of the object to reference
  next?: Reference; // Optional next input for referencing nested properties
}

export interface Operation {
  id: string;
  description: string;
  inputs?: Reference[];
  expression: string;
  output?: Reference;
}
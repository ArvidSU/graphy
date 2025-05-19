import { Node } from "../../logic/graphTypes";
import { AutocompleteInput } from "../core/AutocompleteInput";
import { Section } from "../core/Section";

export function NodeEditor( props: { node: Node, onChange: ( node: Node ) => void } ) {
  const { node, onChange } = props;
  const handleNodeColorChange = ( color: string ) => {
    const updatedNode: Node = {
      ...node,
      shape: {
        ...node.shape,
        color
      }
    };
    onChange( updatedNode );
  };

  const handleBorderColorChange = ( color: string ) => {
    const updatedNode: Node = {
      ...node,
      shape: {
        ...node.shape,
        border: {
          ...node.shape.border,
          color
        }
      }
    };
    onChange( updatedNode );
  };

  const handleRadiusChange = ( radius: number ) => {
    const updatedNode: Node = {
      ...node,
      shape: {
        ...node.shape,
        radius
      }
    };
    onChange( updatedNode );
  };

  return (
    <Section title="Properties" bordered collapsible>
      <div className="flex flex-row space-x-2">
        <p className="text-sm text-gray-500">Node color</p>
        <ColorEditor color={ node.shape.color } onChange={ handleNodeColorChange } />
      </div>
      <div className="flex flex-row space-x-2">
        <p className="text-sm text-gray-500">Edge color</p>
        <ColorEditor color={ node.shape.border.color } onChange={ handleBorderColorChange } />
      </div>
      <RadiusEditor radius={ node.shape.radius } onChange={ handleRadiusChange } />
      <TypeEditor node={ node } onChange={ onChange } />
    </Section>
  )
}

export function TypeEditor( props: { node: Node, onChange: ( updatedNode: Node ) => void } ) {
  const { node, onChange } = props;
  const options = [ "function", "key_value" ];

  return (
    <AutocompleteInput
      id="node-type"
      placeholder={ "Type: " + node.type }
      suggestions={ options }
      saveOn={ [ "enter" ] }
      onSave={ ( value ) => {
        const newType = value;
        if ( !options.includes( newType ) ) return;
        let metadata = node.metadata;
        if ( newType !== node.type ) {
          const message = `Changing node type from ${node.type} to ${newType} will reset its metadata. Are you sure you want to proceed?`;
          const confirm = window.confirm( message );
          if ( !confirm ) return;
          metadata = {};
        }
        const updatedNode: Node = {
          ...node,
          type: newType as "function" | "key_value",
          metadata: metadata as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        };
        onChange( updatedNode );
      } }
      className="w-full border border-gray-300 rounded-md p-2 text-sm"
    />
  );
}

export function ColorEditor( props: { color: string, onChange: ( color: string ) => void } ) {
  const { color, onChange } = props;
  if ( !color ) return null;
  return (
    <div className="flex flex-row items-start justify-start size-6 rounded-md">
      <input
        type="color"
        id="color"
        value={ color }
        onChange={ ( e ) => onChange( e.target.value ) }
        className=""
      />
    </div>
  )
}

function RadiusEditor( props: { radius: number, onChange: ( radius: number ) => void } ) {
  const { radius, onChange } = props;
  return (
    <div className="flex flex-row space-x-2 items-start justify-start">
      <label htmlFor="radius" className="text-sm text-gray-500">Radius</label>
      <input
        type="number"
        id="radius"
        value={ radius }
        onChange={ ( e ) => onChange( parseFloat( e.target.value ) ) }
        className="w-1/6 border border-gray-300 rounded-md"
      />
    </div>
  )
}
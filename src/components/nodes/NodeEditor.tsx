import { Node } from "@graphTypes/graphTypes";
import { Section } from "@core/Section";

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
    </Section>
  )
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
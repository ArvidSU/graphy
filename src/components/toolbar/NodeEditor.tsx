import { Node, NodeShape } from "../../logic/graphTypes";
import { Section } from "../core/Section";

export function NodeEditor( props: { node: Node, onChange: ( node: Node ) => void } ) {
  const { node, onChange } = props;
  const handleColorChange = ( color: string ) => {
    const updatedNode: Node = {
      ...node,
      shape: {
        ...node.shape,
        color
      }
    };
    onChange( updatedNode );
  };
  return (
    <Section title="Properties" bordered collapsible>
      <ColorEditor color={ node.shape } onChange={ handleColorChange } />
    </Section>
  )
}

function ColorEditor( props: { color: Pick<NodeShape, "color">, onChange: ( color: string ) => void } ) {
  const { color, onChange } = props;
  return (
    <div className="flex flex-col items-start justify-start">
      <label htmlFor="color" className="text-sm text-gray-500">Color</label>
      <input
        type="color"
        id="color"
        value={ color.color }
        onChange={ ( e ) => onChange( e.target.value ) }
        className="w-full h-8 border border-gray-300 rounded-md"
      />
    </div>
  )
}
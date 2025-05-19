import { Edge } from "../../logic/graphTypes";
import { useGraphStore } from "../../stores/useGraphStore";
import { Section } from "../core/Section";
import { Expander } from "../core/Expander";
import { DeleteButton } from "../core/Button";

export function Edges( props: { edges?: Edge[] } ) {
  const { deleteEdge, setSelectedEdgeId, selectedEdgeId } = useGraphStore( ( state ) => state );
  const { edges } = props;
  if ( !edges || edges.length === 0 ) return null;
  return (
    <Section title="Edges" bordered collapsible className="flex flex-col justify-between">
      { edges.map( ( edge ) => (
        <Expander
          key={ edge.id }
          items={ [
            <DeleteButton onClick={ () => deleteEdge( edge.id ) } />
          ] }
          staggerDelay={ 100 }
          itemSpacing={ 10 }
          direction="left"
        >
          <div
            key={ edge.id }
            className={ "flex items-center justify-between" + ( selectedEdgeId === edge.id ? " bg-gray-200" : "" ) }
            onClick={ () => setSelectedEdgeId( edge.id ) }
          >
            <span>{ edge.label }</span>
          </div>
        </Expander>
      ) ) }
    </Section>
  )
}
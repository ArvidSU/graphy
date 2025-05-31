import { Section } from "../core/Section";
import { useGraphStore } from "../../stores/useGraphStore";
import { Input } from "../core/Input";
import { DeleteButton } from "../core/Button";
import { Expander } from "../core/Expander";

export function EdgeToolbar() {
  const { edges, selectedEdgeId, setSelectedEdgeId, deleteEdge, updateEdge } = useGraphStore();

  const edgesArray = Object.values( edges );

  return (
    <div className="space-y-4">
      <Section title="Edges" bordered className="flex flex-col justify-between">
        <ul>
          { edgesArray.map( ( edge ) => (
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
                <Input
                  id={ `edge-label-${edge.id}` }
                  value={ edge.label }
                  saveOn={ [ "enter", "blur", "change" ] }
                  onSave={ ( newLabel ) => updateEdge( edge.id, { label: newLabel } ) }
                />
              </div>
            </Expander>
          ) ) }
        </ul>
      </Section>

      { selectedEdgeId && (
        <Section title="Selected Edge" bordered>
          <div className="space-y-2">
            { ( () => {
              const selectedEdge = edges[ selectedEdgeId ];
              if ( !selectedEdge ) return <p>Edge not found</p>;

              return (
                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Label:</label>
                    <Input
                      id={ `selected-edge-label-${selectedEdgeId}` }
                      value={ selectedEdge.label }
                      saveOn={ [ "enter", "blur", "change" ] }
                      onSave={ ( newLabel ) => updateEdge( selectedEdgeId, { label: newLabel } ) }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Source:</label>
                    <p className="text-sm text-gray-600">{ selectedEdge.source }</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target:</label>
                    <p className="text-sm text-gray-600">{ selectedEdge.target }</p>
                  </div>
                </div>
              );
            } )() }
          </div>
        </Section>
      ) }
    </div>
  );
}

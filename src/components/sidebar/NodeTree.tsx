import { useGraphStore } from "../../stores/useGraphStore";
import { getChildren } from "../../logic/graphLogic";
import { Node } from "../../logic/graphTypes";

export function NodeTree( props: { node: Node, indent: number } ) {
  const state = useGraphStore( ( state ) => state );
  const { nodes } = state;
  const children = getChildren( nodes, props.node.id );

  const setSelectedNode = useGraphStore( ( state ) => state.setSelectedNodeId );
  const setCurrentRoot = useGraphStore( ( state ) => state.setCurrentRootId );
  return (
    <li key={ props.node.id } className="list-none">
      <div
        onPointerEnter={ () => {
          document.body.style.cursor = "pointer"
        } }
        onPointerLeave={ () => {
          document.body.style.cursor = "default"

        } }
        onClick={ () => {
          setSelectedNode( props.node.id );
          setCurrentRoot( props.node.parentId );
        } }
        style={ { paddingLeft: `${props.indent * 16}px` } }>
        <div className="border-l pl-2">
          <span className={
            props.node.id === state.currentRootId ? "font-bold" :
              props.node.id === state.selectedNodeId ? "bg-gray-300" : ""
          }>
            { props.node.label }
          </span>

        </div>
      </div>
      <ul key={ props.node.id + "children" }>
        { children.map( ( child ) => (
          <NodeTree key={ props.node.id + child.id } node={ child } indent={ props.indent + 1 } />
        ) ) }
      </ul>
    </li>
  );
}
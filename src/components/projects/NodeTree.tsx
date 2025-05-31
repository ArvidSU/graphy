import { useGraphStore } from "@stores/useGraphStore";
import { getChildren } from "@logic/graphLogic";
import { Node } from "@graphTypes/graphTypes";

export function NodeTree( props: { node: Node, indent: number } ) {
  const { node, indent } = props;
  const {
    selectedNodeId, setSelectedNodeId,
    currentRootId, setCurrentRootId,
    nodes
  } = useGraphStore();

  const children = getChildren( nodes, node.id );

  return (
    <li key={ node.id } className="list-none">
      <div
        onPointerEnter={ () => {
          document.body.style.cursor = "pointer"
        } }
        onPointerLeave={ () => {
          document.body.style.cursor = "default"

        } }
        onClick={ () => {
          setSelectedNodeId( node.id );
          setCurrentRootId( node.parentId );
        } }
        style={ { paddingLeft: `${indent * 16}px` } }>
        <div className="border-l pl-2 mb-2">
          <span
            className={ "rounded-md px-1 border-1" + ( node.id === selectedNodeId ? " font-bold" : "" ) + ( node.id === currentRootId ? " bg-white" : "" ) }
            style={ {
              borderColor: node.shape.color,
              boxShadow: `0 0 5px ${node.shape.color}, inset 0 0 3px ${node.shape.color}`
            } }
          >
            { node.label }
          </span>

        </div>
      </div>
      <ul key={ node.id + "children" }>
        { children.map( ( child ) => (
          <NodeTree key={ node.id + child.id } node={ child } indent={ indent + 1 } />
        ) ) }
      </ul>
    </li>
  );
}
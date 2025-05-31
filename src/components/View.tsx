import { useGraphStore } from "@stores/useGraphStore";
import { selectLocalGraphView } from "@stores/selectors";
import { shallow } from "zustand/shallow";
import { Stage, Layer, Circle, Text, Group, Arrow, Line } from "react-konva";
import { useCallback, useState, useEffect, FC } from "react";
import { KonvaEventObject } from "konva/lib/Node";
import { Node, Edge } from "@graphTypes/graphTypes";

const EDGE_COLOR = "#666";
const EDGE_WIDTH = 2;
const EDGE_POINTER_LENGTH = 10;
const EDGE_POINTER_WIDTH = 10;
const TEMP_EDGE_COLOR = "#999";
const TEMP_EDGE_WIDTH = 1.5;
const TEMP_EDGE_DASH = [ 5, 5 ];

// Types
interface NodeProps {
  node: Node;
  isSelected: boolean;
  onNodeClick: ( node: Node ) => void;
  onNodeDoubleClick: ( e: KonvaEventObject<MouseEvent>, node: Node ) => void;
  onDragMove: ( e: KonvaEventObject<DragEvent>, node: Node ) => void;
  onDragEnd: ( e: KonvaEventObject<DragEvent>, node: Node ) => void;
  onLinkClick: ( node: Node ) => void;
}

interface EdgeProps {
  edge: Edge;
  sourceNode: Node;
  targetNode: Node;
  isSelected: boolean;
  onEdgeClick: ( edge: Edge ) => void;
}

// Helper functions
const calculateEdgePoints = ( sourceNode: Node, targetNode: Node ): number[] => {
  const sourceX = sourceNode.shape.position.x;
  const sourceY = sourceNode.shape.position.y;
  const targetX = targetNode.shape.position.x;
  const targetY = targetNode.shape.position.y;

  const sourceRadius = sourceNode.shape.radius;
  const targetRadius = targetNode.shape.radius;

  // Calculate vector between nodes
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt( dx * dx + dy * dy );

  // Normalize vector
  const nx = dx / length;
  const ny = dy / length;

  // Calculate points on the circles' circumference
  const sourcePointX = sourceX + nx * sourceRadius;
  const sourcePointY = sourceY + ny * sourceRadius;
  const targetPointX = targetX - nx * targetRadius;
  const targetPointY = targetY - ny * targetRadius;

  return [ sourcePointX, sourcePointY, targetPointX, targetPointY ];
};

// Components
const NodeComponent: FC<NodeProps> = ( {
  node,
  isSelected,
  onNodeClick,
  onNodeDoubleClick,
  onDragMove,
  onDragEnd,
  onLinkClick,
} ) => {
  const { radius, border: edge, position, color } = node.shape;
  return (
    <Group
      key={ node.id }
      x={ position.x || 0 }
      y={ position.y || 0 }
      draggable={ true }
      onDragMove={ ( e ) => onDragMove( e, node ) }
      onDragEnd={ ( e ) => onDragEnd( e, node ) }
      onClick={ ( e ) => {
        e.cancelBubble = true; // Prevent event bubbling
        onNodeClick( node )
      } }
      onDblClick={ ( e ) => onNodeDoubleClick( e, node ) }
    >
      <Circle
        radius={ radius }
        fill={ color }
        stroke={ isSelected ? edge.color : color }
        strokeWidth={ isSelected ? edge.width : 0 }
      />
      <Text
        text={ node.label }
        fontSize={ 16 }
        fill="#fff"
        align="center"
        verticalAlign="middle"
        width={ radius * 2 }
        height={ radius * 2 }
        offsetX={ radius }
        offsetY={ radius }
      />
      { isSelected && (
        <Group
          key={ node.id + "selected" }
          x={ radius * 1.1 }
          y={ -( radius * 1.1 ) }
        >
          <Text
            fontStyle="900"
            text="&#xf0c1;"
            fontFamily='"Font Awesome 6 Free"'
            align="right"
            verticalAlign="top"
            fontSize={ 16 }
            onMouseEnter={ () => {
              document.body.style.cursor = "pointer";
            } }
            onMouseLeave={ () => {
              document.body.style.cursor = "default";
            } }
            onClick={ ( e ) => {
              e.cancelBubble = true; // Prevent event bubbling
              onLinkClick( node );
            } }
          />
        </Group>
      ) }
    </Group>
  );
};

const EdgeComponent: FC<EdgeProps> = ( {
  edge,
  sourceNode,
  targetNode,
  isSelected,
  onEdgeClick
} ) => {
  const points = calculateEdgePoints( sourceNode, targetNode );

  return (
    <Arrow
      key={ edge.id }
      points={ points }
      stroke={ EDGE_COLOR }
      strokeWidth={ isSelected ? EDGE_WIDTH * 1.5 : EDGE_WIDTH }
      fill={ EDGE_COLOR }
      pointerLength={ EDGE_POINTER_LENGTH }
      pointerWidth={ EDGE_POINTER_WIDTH }
      onClick={ ( e ) => {
        e.cancelBubble = true; // Prevent event bubbling
        onEdgeClick( edge )
      } }
      onMouseEnter={ () => {
        document.body.style.cursor = "pointer";
      } }
      onMouseLeave={ () => {
        document.body.style.cursor = "default";
      } }
    />
  );
};

// Main component
export function View() {
  const localGraph = useGraphStore( selectLocalGraphView, shallow );
  const {
    addNode,
    updateNode,
    setSelectedNodeId,
    addEdge,
    setSelectedEdgeId,
    setCurrentRootId,
    selectedNodeId,
    selectedEdgeId,
  } = useGraphStore( state => state );

  const [ stageSize, setStageSize ] = useState( {
    width: window.innerWidth,
    height: window.innerHeight
  } );

  const [ sourceNode, setSourceNode ] = useState<Node | null>( null );
  const [ mousePos, setMousePos ] = useState<{ x: number; y: number } | null>( null );
  // Add state to track nodes being dragged
  const [ draggingNodes, setDraggingNodes ] = useState<Record<string, { x: number, y: number }>>( {} );

  // Handle window resize
  useEffect( () => {
    const handleResize = () => {
      setStageSize( {
        width: window.innerWidth,
        height: window.innerHeight
      } );
    };

    window.addEventListener( 'resize', handleResize );

    // Initial size adjustment
    handleResize();

    // Clean up
    return () => {
      window.removeEventListener( 'resize', handleResize );
    };
  }, [] );

  // Update mouse position for drawing temp edge
  const handleMouseMove = useCallback( ( e: KonvaEventObject<MouseEvent> ) => {
    if ( sourceNode ) {
      const stage = e.target.getStage();
      if ( !stage ) return;

      const pointerPosition = stage.getPointerPosition();
      if ( pointerPosition ) {
        setMousePos( {
          x: pointerPosition.x,
          y: pointerPosition.y
        } );
      }
    }
  }, [ sourceNode ] );

  // Implement the handleDragMove function
  const handleDragMove = useCallback( ( e: KonvaEventObject<DragEvent>, node: Node ) => {
    const group = e.target;
    const newPosition = {
      x: group.x(),
      y: group.y()
    };

    // Update the temporary position in local state
    setDraggingNodes( prev => ( {
      ...prev,
      [ node.id ]: newPosition
    } ) );
  }, [] );

  // Handle double click on the stage to add a new node
  const handleStageDoubleClick = useCallback( ( e: KonvaEventObject<MouseEvent> ) => {
    // Prevent event bubbling and default behavior
    e.evt.stopPropagation();
    e.evt.preventDefault();

    // Get position relative to the stage
    const stage = e.target.getStage();
    if ( !stage ) return;

    const pointerPosition = stage.getPointerPosition();
    if ( !pointerPosition ) return;

    // Add a new node at the clicked position with just the position specified
    // The rest of the shape properties will use defaults
    addNode( {
      parentId: localGraph.currentRoot?.id,
      shape: {
        position: {
          x: pointerPosition.x,
          y: pointerPosition.y
        },
      },
    } );
  }, [ addNode, localGraph.currentRoot?.id ] );


  const handleDragEnd = useCallback( ( e: KonvaEventObject<DragEvent>, node: Node ) => {
    const stage = e.target.getStage();
    if ( !stage ) return;

    const group = e.target;
    const newPosition = {
      x: group.x(),
      y: group.y()
    };

    // Update the node's position in the store
    updateNode( {
      ...node,
      shape: {
        ...node.shape,
        position: newPosition
      }
    } );

    // Clear the dragging state for this node
    setDraggingNodes( prev => {
      const updated = { ...prev };
      delete updated[ node.id ];
      return updated;
    } );
  }, [ updateNode ] );

  // Handle node click
  const handleNodeClick = useCallback( ( node: Node ) => {
    if ( sourceNode && sourceNode.id !== node.id ) {
      addEdge( {
        label: `${sourceNode.label} -> ${node.label}`,
        source: sourceNode.id,
        target: node.id
      } );
      setSourceNode( null );
      setMousePos( null );
    } else {
      setSelectedNodeId( node.id );
    }
  }, [ addEdge, setSelectedNodeId, sourceNode ] );

  // Handle node double click
  const handleNodeDoubleClick = useCallback( ( e: KonvaEventObject<MouseEvent>, node: Node ) => {
    e.cancelBubble = true; // Prevent event bubbling
    setCurrentRootId( node.id );
    setSelectedNodeId( undefined );
  }, [ setCurrentRootId, setSelectedNodeId ] );

  // Handle edge click
  const handleEdgeClick = useCallback( ( edge: Edge ) => {
    setSelectedEdgeId( edge.id );
  }, [ setSelectedEdgeId ] );

  // Handle stage click when not on a node (to clear selection)
  const handleStageClick = useCallback( () => {
    if ( sourceNode ) {
      setSourceNode( null );
      setMousePos( null );
    } else {
      setSelectedNodeId( undefined );
      setSelectedEdgeId( undefined );
    }
  }, [ sourceNode, setSelectedNodeId, setSelectedEdgeId ] );

  return (
    <div className="flex-1 bg-white flex items-center justify-center relative">
      <Stage
        width={ stageSize.width }
        height={ stageSize.height }
        onDblClick={ handleStageDoubleClick }
        onClick={ handleStageClick }
        onMouseMove={ handleMouseMove }
      >
        <Layer preventDefault={ true }>
          {/* Render edges */ }
          { localGraph.edges.map( edge => {
            const sourceNode = localGraph.nodes.find( n => n.id === edge.source );
            const targetNode = localGraph.nodes.find( n => n.id === edge.target );

            if ( !sourceNode || !targetNode ) return null;

            // Use temporary position if node is being dragged
            const sourceNodeWithDragPosition = {
              ...sourceNode,
              shape: {
                ...sourceNode.shape,
                position: draggingNodes[ sourceNode.id ] || sourceNode.shape?.position
              }
            };

            const targetNodeWithDragPosition = {
              ...targetNode,
              shape: {
                ...targetNode.shape,
                position: draggingNodes[ targetNode.id ] || targetNode.shape?.position
              }
            };

            return (
              <EdgeComponent
                key={ edge.id }
                edge={ edge }
                sourceNode={ sourceNodeWithDragPosition }
                targetNode={ targetNodeWithDragPosition }
                isSelected={ edge.id === selectedEdgeId }
                onEdgeClick={ handleEdgeClick }
              />
            );
          } ) }

          {/* Render temporary edge when creating connections */ }
          { sourceNode && mousePos && (
            <Line
              points={ [
                draggingNodes[ sourceNode.id ]?.x || sourceNode.shape.position.x,
                draggingNodes[ sourceNode.id ]?.y || sourceNode.shape.position.y,
                mousePos.x,
                mousePos.y
              ] }
              stroke={ TEMP_EDGE_COLOR }
              strokeWidth={ TEMP_EDGE_WIDTH }
              dash={ TEMP_EDGE_DASH }
            />
          ) }

          {/* Render nodes */ }
          { localGraph.nodes.map( node => (
            <NodeComponent
              key={ node.id }
              node={ node }
              isSelected={ node.id === selectedNodeId }
              onNodeClick={ handleNodeClick }
              onNodeDoubleClick={ handleNodeDoubleClick }
              onDragMove={ handleDragMove }
              onDragEnd={ handleDragEnd }
              onLinkClick={ setSourceNode }
            />
          ) ) }
        </Layer>
      </Stage>
    </div>
  );
}
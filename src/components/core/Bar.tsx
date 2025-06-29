import { ReactNode, useRef, useState, useEffect, MouseEvent } from 'react';

export interface BarProps {
  /**
   * The content to render inside the bar
   */
  children: ReactNode;

  /**
   * The position of the bar ('left' or 'right')
   */
  position: 'left' | 'right';

  /**
   * Optional additional className for customization
   */
  className?: string;

  /**
   * Whether to use flex layout between sections
   */
  spaceBetween?: boolean;

  /**
   * Default width in percentage (1-100)
   */
  defaultWidth?: number;

  /**
   * Minimum width in percentage (1-100)
   */
  minWidth?: number;

  /**
   * Maximum width in percentage (1-100)
   */
  maxWidth?: number;
}

export function Bar( {
  children,
  position,
  className = '',
  spaceBetween = false,
  defaultWidth = 20, // Default to 20% (w-1/5)
  minWidth = 10,
  maxWidth = 40
}: BarProps ) {
  // State to track the bar width
  const [ width, setWidth ] = useState<number>( defaultWidth );
  const [ isDragging, setIsDragging ] = useState<boolean>( false );
  const barRef = useRef<HTMLDivElement>( null );

  // Border based on position
  const borderClass = position === 'left' ? 'border-r' : 'border-l';

  // Flex layout if spaceBetween is true
  const layoutClass = spaceBetween ? 'flex flex-col justify-stretch' : '';

  // Handle mouse down on the resize handle
  const handleMouseDown = ( e: MouseEvent ) => {
    e.preventDefault();
    setIsDragging( true );
  };

  // Handle mouse move and mouse up events
  useEffect( () => {
    const handleMouseMove = ( e: globalThis.MouseEvent ) => {
      if ( !isDragging ) return;

      const containerWidth = barRef.current?.parentElement?.clientWidth || 1000;
      let newWidth;

      if ( position === 'left' ) {
        newWidth = ( e.clientX / containerWidth ) * 100;
      } else {
        newWidth = ( ( containerWidth - e.clientX ) / containerWidth ) * 100;
      }

      // Clamp the width between minWidth and maxWidth
      newWidth = Math.max( minWidth, Math.min( maxWidth, newWidth ) );
      setWidth( newWidth );
    };

    const handleMouseUp = () => {
      setIsDragging( false );
    };

    if ( isDragging ) {
      document.addEventListener( 'mousemove', handleMouseMove );
      document.addEventListener( 'mouseup', handleMouseUp );
    }

    return () => {
      document.removeEventListener( 'mousemove', handleMouseMove );
      document.removeEventListener( 'mouseup', handleMouseUp );
    };
  }, [ isDragging, position, minWidth, maxWidth ] );

  // Create the resize handle element
  const resizeHandle = (
    <div
      className={ `absolute top-0 ${position === 'left' ? 'right-0' : 'left-0'} 
        h-full w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors
        ${isDragging ? 'bg-blue-500' : ''}` }
      onMouseDown={ handleMouseDown }
    />
  );

  return (
    <div
      ref={ barRef }
      className={ `h-full relative p-4 bg-gray-100 ${borderClass} border-gray-300 ${layoutClass} ${className} ` }
      style={ { width: `${width}%` } }
    >
      <div className="overflow-y-auto overflow-y-visible relative h-full flex flex-col">
        { children }
      </div>
      { resizeHandle }
    </div>
  );
}
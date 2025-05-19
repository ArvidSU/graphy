import { useState } from 'react';

type ExpanderProps = {
  items: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
  itemSpacing?: number;
  staggerDelay?: number;
  direction?: 'left' | 'right';
  expanded?: boolean;
}

export function Expander( {
  items,
  children,
  className = "",
  itemSpacing = 20,
  staggerDelay = 50,
  direction = 'right',
  expanded = false,
}: ExpanderProps ) {
  const [ isExpanded, setIsExpanded ] = useState( expanded );

  return (
    <div
      className={ `relative ${className}` }
      onMouseEnter={ () => setIsExpanded( true ) }
      onMouseLeave={ () => setIsExpanded( false ) }
    >
      {/* Main component */ }
      <div className="flex-shrink-0 box-content">
        { children }
      </div>

      {/* Expandable items with absolute positioning and proper alignment */ }
      <div
        className={ `absolute ${direction === 'left' ? 'right-full' : 'left-full'} flex ${direction === 'left' ? 'flex-row-reverse' : 'flex-row'} items-center top-1/2 -translate-y-1/2` }
        style={ {
          gap: `${itemSpacing}px`,
          zIndex: isExpanded ? 50 : 1,
          [ direction === 'left' ? 'marginRight' : 'marginLeft' ]: `${itemSpacing}px`,
        } }
      >
        { items.map( ( item, index ) => (
          <div
            key={ `flex-item-${index}` }
            className="shrink-0 transition-all duration-300 ease-in-out"
            style={ {
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded
                ? `translateX(0)`
                : `translateX(${direction === 'left' ? '20px' : '-20px'})`,
              transitionDelay: `${index * staggerDelay}ms`,
              maxWidth: isExpanded ? '100%' : '0px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            } }
          >
            { item }
          </div>
        ) ) }
      </div>
    </div>
  );
}
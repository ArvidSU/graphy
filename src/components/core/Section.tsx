import { ReactNode, useState } from 'react';

export interface SectionProps {
  /**
   * The content to render inside the section
   */
  children: ReactNode;

  /**
   * Whether to add a top border
   */
  bordered?: boolean;

  /**
   * Optional padding size
   */
  padding?: 0 | 1 | 2 | 4;

  /**
   * Optional margin size
   */
  margin?: 0 | 1 | 2 | 4;

  /**
   * Optional additional className for customization
   */
  className?: string;

  /**
   * Optional heading/title for the section
   */
  title?: string;

  /**
   * Whether title should be bold
   */
  boldTitle?: boolean;

  /**
   * Controls overflow behavior
   */
  overflow?: 'visible' | 'auto' | 'scroll' | 'hidden';

  /**
   * Optional max height value (with unit, e.g. '300px', '50vh')
   */
  maxHeight?: string;

  /**
   * Optional max width value (with unit, e.g. '100%', '500px')
   */
  maxWidth?: string;

  /**
   * Whether the section can be collapsed by clicking the title
   */
  collapsible?: boolean;

  /**
   * Initial collapsed state (only used when collapsible is true)
   */
  initialCollapsed?: boolean;
}

export function Section( {
  children,
  bordered = false,
  padding = 0,
  margin = 0,
  className = '',
  title,
  boldTitle = true,
  overflow = 'visible',
  maxHeight,
  maxWidth,
  collapsible = false,
  initialCollapsed = false
}: SectionProps ) {
  // State to track if the section is collapsed (only meaningful when collapsible is true)
  const [ isCollapsed, setIsCollapsed ] = useState( initialCollapsed && collapsible );

  // Border class if bordered is true
  const borderClass = bordered ? 'border-t border-gray-300' : '';

  // Padding and margin classes based on provided values
  const paddingClass = padding ? `p-${padding}` : '';
  const marginClass = margin ? `m-${margin}` : '';

  // Space between elements
  const spaceClass = 'space-y-2';

  // Overflow class
  const overflowClass = overflow ? `overflow-${overflow}` : '';

  // Max height and width styles
  const maxHeightStyle = maxHeight ? { maxHeight } : {};
  const maxWidthStyle = maxWidth ? { maxWidth } : {};

  // Toggle collapsed state
  const handleToggleCollapse = () => {
    if ( collapsible ) {
      setIsCollapsed( !isCollapsed );
    }
  };

  // Title with collapse functionality if enabled
  const renderTitle = () => {
    if ( !title ) return null;

    if ( collapsible ) {
      return (
        <div
          className={ `${boldTitle ? 'font-bold' : ''} mb-1 flex items-center cursor-pointer` }
          onClick={ handleToggleCollapse }
          role="button"
          aria-expanded={ !isCollapsed }
          tabIndex={ 0 }
          onKeyDown={ ( e ) => {
            if ( e.key === 'Enter' || e.key === ' ' ) {
              handleToggleCollapse();
              e.preventDefault();
            }
          } }
        >
          <span className="mr-1">{ isCollapsed ? '▶' : '▼' }</span>
          { title }
        </div>
      );
    } else {
      return (
        <h3 className={ `${boldTitle ? 'font-bold' : ''} mb-1` }>
          { title }
        </h3>
      );
    }
  };

  return (
    <div
      className={ `${borderClass} ${paddingClass} ${marginClass} ${className}` }
      style={ { ...maxHeightStyle, ...maxWidthStyle } }
    >
      { renderTitle() }
      { ( !collapsible || !isCollapsed ) && (
        <div className={ `${spaceClass} ${overflowClass} ${className} ` + `transition-all duration-300 ${isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'opacity-100'}` }
          style={ { ...maxHeightStyle, ...maxWidthStyle } }>
          { children }
        </div>
      ) }
    </div>
  );
}

export function Divider( {
  className = '',
  orientation = 'horizontal',
  size = 1,
  color = 'gray-300',
  margin = 2
}: {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: number;
  color?: string;
  margin?: number;
} ) {
  // Create the orientation styling
  const orientationClass = orientation === 'horizontal' ? 'w-full' : 'h-full';

  // Build specific tailwind classes for border
  let borderClass = orientation === 'horizontal' ? 'border-t' : 'border-l';

  // Apply border color - using direct class name rather than string interpolation
  borderClass += ` border-${color}`;

  // Apply border width based on size
  if ( size > 1 ) {
    borderClass += ` border-${size}`;
  }

  // Apply margin based on orientation and value
  const marginClass = margin ?
    ( orientation === 'horizontal' ? `my-${margin}` : `mx-${margin}` ) : '';

  return (
    <div className={ `${orientationClass} ${borderClass} ${marginClass} ${className}` } />
  );
}
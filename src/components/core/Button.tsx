import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faClone, faWrench } from "@fortawesome/free-solid-svg-icons";

export function Button( {
  children,
  className,
  onClick,
  disabled,
  type = "button",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
    type?: "button" | "submit" | "reset";
    style?: React.CSSProperties;
} ) {
  // Extract any bg-* classes from the provided className
  const hasBgClass = className?.includes( 'bg-' );

  return (
    <button
      type={ type }
      className={
        `rounded-md border border-gray-300 ${!hasBgClass ? 'bg-indigo-200' : ''} px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ${!hasBgClass ? 'hover:bg-gray-50' : ''} ${disabled ? '!bg-gray-500' : ''} ` +
        ( className || "" )
      }
      onClick={ onClick }
      disabled={ disabled }
      style={ style }
    >
      { children }
    </button>
  );
}

export function DeleteButton( {
  onClick,
  className,
  disabled,
}: {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
} ) {
  return (
    <Button
      className={
        "text-sm text-red-500 " +
        ( className || "" )
      }
      onClick={ onClick }
      disabled={ disabled }
    >
      <FontAwesomeIcon icon={ faTrash } />
    </Button>
  );
}

export function CopyButton( {
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
} ) {
  return (
    <Button
      className={
        "text-sm text-blue-500 " +
        ( className || "" )
      }
      onClick={ onClick }
    >
      <FontAwesomeIcon icon={ faClone } />
    </Button>
  );
}

export function ToolButton( {
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
} ) {
  return (
    <Button
      className={
        "text-sm text-gray-500 " +
        ( className || "" )
      }
      onClick={ onClick }
    >
      <FontAwesomeIcon icon={ faWrench } />
    </Button>
  );
}
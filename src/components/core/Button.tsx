import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faClone, faWrench, faPlus, faTerminal, faFloppyDisk, faTurnUp, faXmark } from "@fortawesome/free-solid-svg-icons";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

export function Button( {
  children,
  className,
  onClick,
  disabled,
  type = "button",
  style = {},
}: ButtonProps ) {
  // Extract any bg-* classes from the provided className
  const hasBgClass = className?.includes( 'bg-' );
  const textClass = "text-sm font-medium text-white-500 ";
  const borderClass = "border border-gray-300 rounded-md ";
  return (
    <button
      type={ type }
      className={ textClass + borderClass +
        ` ${!hasBgClass ? 'bg-indigo-200' : ''} px-4 py-2 shadow-sm ${disabled ? '!bg-gray-500 !cursor-not-allowed ' : ''} ` +
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

export function DeleteButton( props: Partial<ButtonProps> ) {
  return (
    <Button
      className="text-red-500 "
      { ...props }
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
        "text-blue-500 " +
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
        ( className || "" )
      }
      onClick={ onClick }
    >
      <FontAwesomeIcon icon={ faWrench } />
    </Button>
  );
}

export function AddButton( props: Partial<ButtonProps> ) {
  return (
    <Button
      className="bg-green-500 text-white"
      { ...props }
    >
      <FontAwesomeIcon icon={ faPlus } />
    </Button>
  );
}

export function ExecuteButton( props: Partial<ButtonProps> ) {
  return (
    <Button
      className="bg-blue-500 text-white"
      { ...props }
    >
      <FontAwesomeIcon icon={ faTerminal } />
    </Button>
  );
}

export function SaveButton( props: Partial<ButtonProps> ) {
  return (
    <Button
      className="bg-green-500 text-white"
      { ...props }
    >
      <FontAwesomeIcon icon={ faFloppyDisk } />
    </Button>
  );
}

export function TurnUpButton( props: Partial<ButtonProps> ) {
  return (
    <Button
      className="bg-yellow-500 text-white"
      { ...props }
    >
      <FontAwesomeIcon icon={ faTurnUp } />
    </Button>
  );
}

export function CloseButton( props: Partial<ButtonProps> ) {
  return (
    <Button
      className="bg-yellow-500 text-white"
      { ...props }
    >
      <FontAwesomeIcon icon={ faXmark } />
    </Button>
  );
}
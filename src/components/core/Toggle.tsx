import { useState } from 'react';

export function Toggle( props: {
  label: string;
  state: boolean;
  onChange: ( newState: boolean ) => void;
  children?: React.ReactNode;
} ) {
  const { label, state, onChange } = props;
  const [ isActive, setIsActive ] = useState( state );

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive( newState );
    onChange( newState );
  }

  return (
    <div className="flex flex-row w-full justify-between px-2">
      <span className="text-sm text-gray-700">{ label }</span>
      <div className="flex justify-end items-center space-x-2">
        <small>{ props.children }</small>
        <button
          onClick={ handleToggle }
          className={ `w-10 h-6 flex items-center rounded-full p-1 transition-colors ${isActive ? 'bg-blue-500' : 'bg-gray-300'}` }
        >
          <span
            className={ `w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isActive ? 'translate-x-4' : ''}` }
          />
        </button>
      </div>
    </div>
  );
}
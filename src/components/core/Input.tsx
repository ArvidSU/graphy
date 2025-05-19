import { useState, useEffect } from "react";

export function Input( {
  id,
  saveOn = [],
  onSave,
  onChange,
  value,
  placeholder,
  defaultValue,
  autoCorrect = "off",
  type = "text",
  className = "",
  disabled = false,
  onFocus,
  onBlur,
  onKeyDown,
  clearAfterSave = false,
}: {
  id?: string;
  saveOn?: Array<"enter" | "blur" | "change">;
  onSave?: ( value: string ) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  autoCorrect?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  clearAfterSave?: boolean;
} ) {
  // Use internal state to track the current input value
  const [ inputValue, setInputValue ] = useState( value || defaultValue || "" );

  // Update internal state when the external value changes
  useEffect( () => {
    if ( value !== undefined ) {
      setInputValue( value );
    }
  }, [ value ] );

  const handleChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    const newValue = e.target.value;
    // Update internal state
    setInputValue( newValue );
    // Call onChange prop if provided
    if ( onChange ) {
      onChange( e );
    }
    // Save if configured to save on change
    if ( saveOn?.includes( "change" ) && onSave ) {
      onSave( newValue );
      if ( clearAfterSave ) setInputValue( "" );
    }
  };

  const handleKeyUp = ( e: React.KeyboardEvent<HTMLInputElement> ) => {
    if ( saveOn?.includes( "enter" ) && e.key === "Enter" && onSave ) {
      onSave( inputValue );
      if ( clearAfterSave ) setInputValue( "" );
    }
  };

  const handleBlur = ( e: React.FocusEvent<HTMLInputElement> ) => {
    if ( saveOn?.includes( "blur" ) && onSave ) {
      onSave( inputValue );
      if ( clearAfterSave ) setInputValue( "" );
    }
    if ( onBlur ) onBlur( e );
  };

  return (
    <input
      id={ id }
      type={ type }
      value={ inputValue }
      onChange={ handleChange }
      onKeyUp={ handleKeyUp }
      onBlur={ handleBlur }
      onFocus={ onFocus }
      onKeyDown={ onKeyDown }
      placeholder={ placeholder }
      autoCorrect={ autoCorrect }
      className={ className + ( disabled ? "  bg-gray-200" : "" ) }
      disabled={ disabled }
    />
  );
}

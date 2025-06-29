import React, { useState, useEffect, useRef, JSX } from "react";
import { Input } from "@core/Input";

export function AutocompleteInput( {
  id,
  suggestions = [],
  showComponent = undefined,
  onSelect,
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
  maxSuggestions = 10,
  clearAfterSave = false,
  separator,
}: {
  id?: string;
  suggestions: string[];
  showComponent?: ( suggestion: string ) => JSX.Element;
  onSelect?: ( value: string ) => void;
  saveOn?: Array<"enter" | "blur" | "change">;
    onSave?: ( value: string ) => boolean | void;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  autoCorrect?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
  maxSuggestions?: number;
  clearAfterSave?: boolean;
    separator?: string;
} ) {
  const [ inputValue, setInputValue ] = useState( value || defaultValue || "" );
  const [ filteredSuggestions, setFilteredSuggestions ] = useState<string[]>( [] );
  const [ showSuggestions, setShowSuggestions ] = useState( false );
  const [ highlightedIndex, setHighlightedIndex ] = useState( -1 );
  const [ isMouseDown, setIsMouseDown ] = useState( false );
  const dropdownRef = useRef<HTMLDivElement>( null );
  const wrapperRef = useRef<HTMLDivElement>( null );

  // Filter suggestions based on input value
  useEffect( () => {
    // If input has value, filter based on it
    if ( inputValue ) {
      // When using separator, filter based on the last segment after the separator
      const searchValue = separator
        ? inputValue.split( separator ).pop()?.trim() || ""
        : inputValue;

      const filtered = suggestions
        .filter( suggestion =>
          suggestion.toLowerCase().includes( searchValue.toLowerCase() ) )
        .slice( 0, maxSuggestions );
      setFilteredSuggestions( filtered );
    } else {
      // If input is empty but dropdown should be shown, show all suggestions
      if ( showSuggestions ) {
        setFilteredSuggestions( suggestions.slice( 0, maxSuggestions ) );
      }
    }
    setHighlightedIndex( -1 );
  }, [ inputValue, suggestions, maxSuggestions, showSuggestions, separator ] );

  // Update internal value when external value changes
  useEffect( () => {
    if ( value !== undefined ) {
      setInputValue( value );
    }
  }, [ value ] );

  // Handle click outside to close dropdown
  useEffect( () => {
    const handleClickOutside = ( event: MouseEvent ) => {
      if ( wrapperRef.current && !wrapperRef.current.contains( event.target as Node ) ) {
        setShowSuggestions( false );
      }
    };

    document.addEventListener( "mousedown", handleClickOutside );
    return () => {
      document.removeEventListener( "mousedown", handleClickOutside );
    };
  }, [] );

  const handleInputChange = ( newValue: string ) => {
    setInputValue( newValue );
    setShowSuggestions( true );
    if ( onSave && saveOn?.includes( "change" ) ) {
      onSave( newValue );
      if ( clearAfterSave ) setInputValue( "" );
    }
  };

  // Add a new handler specifically for onChange events
  const handleChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    const newValue = e.target.value;
    // Update internal state
    setInputValue( newValue );
    // Call external onChange if provided
    if ( onChange ) onChange( e );
    setShowSuggestions( true );
    if ( onSave && saveOn?.includes( "change" ) ) {
      onSave( newValue );
      if ( clearAfterSave ) setInputValue( "" );
    }
  };

  const handleKeyDown = ( e: React.KeyboardEvent<HTMLInputElement> ) => {
    // Handle dropdown navigation even if it's not visible yet
    if ( [ "ArrowUp", "ArrowDown" ].includes( e.key ) && suggestions.length > 0 ) {
      e.preventDefault();

      // Show suggestions if they aren't already visible
      if ( !showSuggestions ) {
        setShowSuggestions( true );
        return;
      }
    }

    if ( ( showSuggestions || e.key === "ArrowDown" ) && filteredSuggestions.length > 0 ) {
      // Navigate up in the dropdown
      if ( e.key === "ArrowUp" ) {
        setHighlightedIndex( prev =>
          prev <= 0 ? filteredSuggestions.length - 1 : prev - 1 );
      }
      // Navigate down in the dropdown
      else if ( e.key === "ArrowDown" ) {
        setShowSuggestions( true );
        setHighlightedIndex( prev =>
          prev >= filteredSuggestions.length - 1 ? 0 : prev + 1 );
      }
      // Select the current highlighted item
      else if ( e.key === "Enter" && highlightedIndex >= 0 ) {
        e.preventDefault();
        const selected = filteredSuggestions[ highlightedIndex ];

        let newValue: string;
        if ( separator ) {
          // When separator is defined, append the suggestion to existing value
          const parts = inputValue.split( separator );
          parts[ parts.length - 1 ] = selected; // Replace the last part with the selected suggestion
          newValue = parts.join( separator );

          // If there are existing parts, add the separator for the next input
          if ( parts.length > 1 || inputValue.includes( separator ) ) {
            newValue += separator + " ";
          }
        } else {
          // Normal behavior: replace the entire input value
          newValue = selected;
        }

        setInputValue( newValue );
        setShowSuggestions( false );
        if ( onSelect ) onSelect( newValue );
        if ( onSave && saveOn?.includes( "enter" ) ) {
          onSave( newValue );
          if ( clearAfterSave ) setInputValue( "" );
        }
      }
      // Close the dropdown
      else if ( e.key === "Escape" ) {
        setShowSuggestions( false );
      }
    } else if ( e.key === "Enter" && onSave && saveOn?.includes( "enter" ) ) {
      // Handle Enter key press when no suggestion is highlighted or suggestions aren't showing
      e.preventDefault();
      onSave( inputValue );
      if ( clearAfterSave ) setInputValue( "" );
      setShowSuggestions( false );
    }
  };

  const handleSuggestionClick = ( suggestion: string ) => {
    let newValue: string;

    if ( separator ) {
      // When separator is defined, append the suggestion to existing value
      const parts = inputValue.split( separator );
      parts[ parts.length - 1 ] = suggestion; // Replace the last part with the selected suggestion
      newValue = parts.join( separator );

      // If there are existing parts, add the separator for the next input
      if ( parts.length > 1 || inputValue.includes( separator ) ) {
        newValue += separator + " ";
      }
    } else {
      // Normal behavior: replace the entire input value
      newValue = suggestion;
    }

    setInputValue( newValue );
    setShowSuggestions( false );
    if ( onSelect ) onSelect( newValue );
    if ( onSave ) {
      onSave( newValue );
      if ( clearAfterSave ) setInputValue( "" );
    }
  };

  const handleFocus = () => {
    // Show all suggestions when input is focused, even if empty
    setShowSuggestions( true );
  };

  const handleBlur = () => {
    // Only handle blur if we're not currently clicking inside the dropdown
    if ( !isMouseDown ) {
      setTimeout( () => {
        if ( onSave && saveOn?.includes( "blur" ) ) {
          onSave( inputValue );
          if ( clearAfterSave ) setInputValue( "" );
        }
      }, 150 );
      setShowSuggestions( false );
    }
  };

  // Track mouse state to prevent blur handling during click
  const handleMouseDown = () => {
    setIsMouseDown( true );
  };

  const handleMouseUp = () => {
    setIsMouseDown( false );
  };

  // Add event listeners for mouse down and up
  useEffect( () => {
    document.addEventListener( "mouseup", handleMouseUp );
    return () => {
      document.removeEventListener( "mouseup", handleMouseUp );
    };
  }, [] );

  return (
    <div className="relative w-full" ref={ wrapperRef }>
      <Input
        id={ id }
        saveOn={ [] }  // We'll handle save operations ourselves
        value={ inputValue }
        placeholder={ placeholder }
        type={ type }
        className={ `${className} w-full` }
        disabled={ disabled }
        autoCorrect={ autoCorrect }
        onSave={ handleInputChange }
        onChange={ handleChange }
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        onKeyDown={ handleKeyDown }
        clearAfterSave={ clearAfterSave }
      />

      { showSuggestions && (
        <div
          ref={ dropdownRef }
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          onMouseDown={ handleMouseDown }
        >
          { filteredSuggestions.length > 0 ? (
            <ul>
              { filteredSuggestions.map( ( suggestion, index ) => (
                <li
                  key={ index }
                  className={ `pl-2 py-2 cursor-pointer hover:bg-gray-100 ${index === highlightedIndex ? "bg-gray-200" : ""
                    }` }
                  onClick={ () => handleSuggestionClick( suggestion ) }
                >
                  { showComponent ? (
                    showComponent( suggestion )
                  ) : (
                    <span>{ suggestion }</span>
                  ) }
                </li>
              ) ) }
            </ul>
          ) : (
            <div className="px-4 py-2 text-gray-500">No matching suggestions</div>
          ) }
        </div>
      ) }
    </div>
  );
}
import { useRef } from "react";
import { Button } from "@core/Button";
import { useGraphStore } from "@stores/useGraphStore";

export function ImportButton() {
  const inputFileRef = useRef<HTMLInputElement>( null );
  const { loadGraph } = useGraphStore();

  const handleButtonClick = () => {
    inputFileRef.current?.click();
  };

  const handleFileChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    const file = e.target.files?.[ 0 ];
    if ( !file ) return;

    const reader = new FileReader();
    reader.onload = ( event ) => {
      try {
        const graph = JSON.parse( event.target?.result as string );
        loadGraph( graph );
      } catch ( error ) {
        console.error( "Invalid JSON file:", error );
        alert( "Invalid JSON file!" );
      }
    };
    reader.readAsText( file );

    // Reset the file input so the same file can be imported again if needed
    e.target.value = "";
  };

  return (
    <>
      <input
        type="file"
        accept=".json"
        ref={ inputFileRef }
        style={ { display: "none" } }
        onChange={ handleFileChange }
      />
      <Button
        onClick={ handleButtonClick }
      >
        Import
      </Button>
    </>
  );
}
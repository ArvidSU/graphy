import { Reference } from "@/types/operationTypes";
import { resolveValue, isReference, isNestedObject } from "@/logic/operationLogic";
import { useEffect, useState } from "react";
import { CloseButton, SaveButton, TurnUpButton } from "@core/Button";
import { AutocompleteInput } from "@core/AutocompleteInput";
import { Input } from "@core/Input";
import { nanoid } from "nanoid";
import { OperationResultDisplay } from "./OperationResultDisplay";

interface OperationReferenceEditorProps {
  title: string;
  context: Record<string, unknown>;
  editingRef?: Reference; // Optional reference to edit
  onSaveRef: ( ref: Reference ) => void;
  onDeleteRef?: ( ref: Reference ) => void; // Optional delete handler
}

const newReference = (): Reference => ( {
  id: nanoid(),
  name: '',
  path: [],
} );

export function OperationReferenceEditor( {
  title,
  context,
  editingRef,
  onSaveRef,
  onDeleteRef = () => { /* No-op by default */ },
}: OperationReferenceEditorProps ) {
  const [ ref, setRef ] = useState<Reference>( editingRef || newReference() );

  // Update state when editingRef prop changes
  useEffect( () => {
    if ( editingRef ) {
      setRef( editingRef );
    } else {
      setRef( newReference() );
    }
  }, [ editingRef ] );

  const resolvedValue = resolveValue( context, ref )?.value;
  const isObject = isNestedObject( resolvedValue );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          { title }
        </label>
        <div className="flex space-x-1 justify-end">
          { ref.path.length ? <TurnUpButton
            onClick={ () => {
              if ( ref.path.length > 0 ) {
                const newPath = ref.path.slice( 0, -1 );
                setRef( { ...ref, path: newPath } );
              }
            } }
            disabled={ ref.path.length === 0 }
          /> : null }
          { ref.path.length && ref.name ? <CloseButton
            onClick={ () => {
              setRef( newReference() ); // Reset reference
              onDeleteRef( ref ); // Call delete handler
            } }
          /> : null }
          <SaveButton
            onClick={ () => {
              onSaveRef( ref );
              setRef( newReference() ); // Reset after saving
            } }
            disabled={ !isReference( ref ) || !resolvedValue }
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2 mb-2">
        <Input
          placeholder="Name this reference"
          className="border rounded p-1 w-full text-xs bg-white"
          value={ ref?.name }
          onSave={ ( value ) => {
            setRef( prev => prev && ( { ...prev, name: value.trim().replace( ' ', '_' ).toLowerCase() } ) );
          } }
          saveOn={ [ 'change' ] }
        />

        { ref.path.map( ( key ) => (
          <div key={ key } className="flex items-center space-x-2">
            <Input
              placeholder="Key"
              className="border rounded p-1 flex-1 bg-white"
              value={ key }
              disabled={ true } // Make it read-only
            />
          </div>
        ) ) }

        { isObject && <AutocompleteInput
          suggestions={ Object.keys( resolvedValue ).filter( key => key !== 'id' ) }
          placeholder="Add new key"
          value={ '' }
          className="border rounded p-1 flex-1 bg-white"
          saveOn={ [ 'enter' ] }
          onSave={ ( key ) => {
            console.log( 'Selected key:', key );
            if ( key ) {
              setRef( { ...ref, path: [ ...ref.path, key ] } );
            }
          } }
          clearAfterSave={ true }
        />
        }

        { resolvedValue !== undefined && ref.path.length > 0 && (
          <OperationResultDisplay result={ resolvedValue } />
        ) }
      </div>
    </div >
  );
}
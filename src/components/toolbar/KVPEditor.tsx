import { useState, ChangeEvent } from "react";
import { useGraphStore } from "../../stores/useGraphStore";
import { MetaDataID, MetaDataKeyValue, KeyValueNode, Node } from "../../logic/graphTypes";
import { evaluateExpression } from "../../logic/graphLogic";
import { Input } from "../core/Input";
import { AutocompleteInput } from "../core/AutocompleteInput";
import { DeleteButton, ToolButton, CopyButton } from "../core/Button";
import { Section } from "../core/Section";
import { Expander } from "../core/Expander";
import { nanoid } from "nanoid";
import { getRef } from "../../logic/kvpLogic";
import { useNode, useKVPMetadata } from "../../hooks/useGraph";

export function CreateKVP( props: { node: KeyValueNode } ) {
  const state = useGraphStore();
  const [ newKey, setNewKey ] = useState<string>( "" );
  const [ newValue, setNewValue ] = useState<string>( "" );
  const kvpState = useNode( props.node.id );
  if ( !kvpState ) return null;
  const { node } = props;
  const { incomingNodes, children, parent } = kvpState;

  function addMetadata( key: string, value: string ): boolean {
    if ( !key || !value ) {
      console.error( "Key and value cannot be empty" );
      return false;
    }

    const newMetadata = { ...node.metadata, [ nanoid() ]: { key, value } };

    state.updateNode( {
      ...node,
      metadata: newMetadata
    } );
    return true;
  }

  const availableNodes = [ ...( incomingNodes ?? [] ), ...( children ?? [] ), ( parent ?? {} as Node ) ]


  /**
   * Evaluate the available nodes metadata and return a records with references and values
   */
  const valueReferenceSuggestions: Record<string, string> = availableNodes
    .filter( ( n ) => n.type === "key_value" )
    .reduce( ( acc, n ) => {
      const evaluatedValue = evaluateExpression( n as KeyValueNode );
      if ( evaluatedValue ) {
        Object.entries( evaluatedValue ).forEach( ( [ metadataId, kvp ] ) => {
          // Create reference based on the metadata ID, not the node ID
          const reference = getRef( metadataId );
          const displayValue = `${n.label}.${kvp.key} = ${kvp.value}`;
          acc[ reference ] = displayValue;
        } );
      }
      return acc;
    }, {} as Record<string, string> );

  const keyNameSuggestions = [ ...( incomingNodes ?? [] ), ...( children ?? [] ), ( parent ?? {} as Node ) ]
    .filter( ( n ) => n.type === "key_value" )
    .map( ( n ) => n.metadata )
    .reduce( ( acc, kvp ) => {
      Object.values( kvp ).forEach( ( k ) => {
        if ( !acc.includes( k.key ) ) {
          acc.push( k.key );
        }
      } );
      return acc;
    }, [] as string[] );

  return (
    <Section title="New" className="space-x-2">
      <AutocompleteInput
        suggestions={ keyNameSuggestions }
        value={ newKey }
        onChange={ ( e: ChangeEvent<HTMLInputElement> ) => setNewKey( e.target.value ) }
        placeholder="Key"
        className="border rounded p-1 w-1/2"
        saveOn={ [ "enter" ] }
        onSave={ key => {
          setNewKey( key )
          if ( addMetadata( key, newValue ) ) {
            setNewKey( "" );
            setNewValue( "" );
          }
        } }
      />
      <AutocompleteInput
        suggestions={ Object.keys( valueReferenceSuggestions ) }
        showComponent={ suggestion => {
          const displayValue = valueReferenceSuggestions[ suggestion ];
          return <ValueReferenceSuggestion reference={ suggestion } displayValue={ displayValue } />;
        } }
        value={ newValue }
        onChange={ ( e: ChangeEvent<HTMLInputElement> ) => setNewValue( e.target.value ) }
        placeholder="Value"
        className="border rounded p-1 w-1/2"
        saveOn={ [ "enter" ] }
        onSave={ value => {
          setNewValue( value );
          if ( addMetadata( newKey, value ) ) {
            setNewKey( "" );
            setNewValue( "" );
          }
        } }
      />
    </Section>
  );
}

function ValueReferenceSuggestion( props: { reference: string, displayValue: string } ) {
  return (
    <div className="flex flex-row items-center justify-between">
      <span className="max-w-3/4 text-sm flex-grow line-clamp-1 text-ellipsis hover:line-clamp-none">{ props.displayValue }</span>
      <span className="min-w-1/4 text-sm justify-self-end">[{ props.reference }]</span>
    </div>
  )
}

function KVPItem( props: { id: MetaDataID, readonly?: boolean } ) {
  const kvpState = useKVPMetadata( props.id );
  if ( !kvpState ) return null;
  const { id, key, value, evaluatedValue, belongsTo, update, remove } = kvpState;

  const copyReference = () => {
    const reference = getRef( id );
    navigator.clipboard.writeText( reference )
      .then( () => {
        alert( "Reference copied to clipboard:" + reference );
      } )
      .catch( ( error ) => {
        console.error( "Failed to copy reference:", error );
      } );
  }

  return (
    <div className="flex flex-row items-center justify-normal my-1">
      <Expander
        className="mr-2"
        items={ [
          <CopyButton
            className="bg-gray-300"
            onClick={ copyReference }
          />,
          <DeleteButton onClick={ () => remove() } disabled={ props.readonly } />,
          // TODO: handle edges
          // BUG: View and Toolbar not upating correctly when clicking child node
          <span className="text-sm text-gray-500">{ evaluatedValue !== value ? `= ${evaluatedValue}` : "" }</span>,
          <span className="text-sm text-gray-500">{ belongsTo?.label }</span>,
        ] }
        staggerDelay={ 100 }
        itemSpacing={ 10 }
        direction="left"
      >
        <ToolButton onClick={ copyReference } />
      </Expander>

      <Input
        disabled={ props.readonly }
        id={ `${id}-key` }
        defaultValue={ key }
        className="border rounded p-1 w-1/2"
        saveOn={ [ "enter", "blur", "change" ] }
        onSave={ ( key ) => {
          const value = ( document.getElementById( `${id}-value` ) as HTMLInputElement ).value;
          update( key, value );
        } }
      />
      <Input
        disabled={ props.readonly }
        id={ `${id}-value` }
        defaultValue={ value }
        className="border rounded p-1 w-1/2"
        saveOn={ [ "enter", "blur", "change" ] }
        onSave={ ( value ) => {
          const key = ( document.getElementById( `${id}-key` ) as HTMLInputElement ).value;
          update( key, value );
        } }
      />
    </div>
  )
}

export function KVPItems( props: { item?: MetaDataKeyValue, readonly?: boolean, title?: string } ) {
  const { item, readonly } = props;
  if ( !item ) return null;
  return (
    <div className="flex flex-col items-start justify-start">
      <p className="text-sm text-gray-500">{ props.title }</p>
      {
        Object.keys( item ).map( ( id ) => (
          <KVPItem key={ id } id={ id } readonly={ readonly } />
        ) )
      }
    </div>
  )
}


export function KVPAvailableReferences( props: { id?: string } ) {
  const selectedNodeData = useNode( props.id || "" );
  if ( !selectedNodeData ) return null;

  const { parent, children, incomingNodes } = selectedNodeData;
  const incomingKeyValue = incomingNodes ? incomingNodes.filter( ( node ) => node.type === "key_value" ) : undefined;
  const childrenKeyValue = children ? children.filter( ( node ) => node.type === "key_value" ) : undefined;
  // TODO: Update Edges to handle metadata types
  //const edgesKeyValue = sEdges ? sEdges.filter( ( edge ) => edge.type === "key_value" ) : undefined; 

  return (
    <Section title="Available References" collapsible bordered className="my-2 pl-2">
      { hasMetadata( incomingKeyValue ) && <Section title="Incoming References" collapsible>
        { incomingKeyValue?.map( incoming => <KVPItems title={ incoming.label } key={ incoming.id } item={ incoming?.metadata } readonly /> ) }
      </Section> }
      { parent?.type === "key_value" && hasMetadata( [ parent ] ) &&
        <Section title="Parent Reference" collapsible>
          <KVPItems title={ parent.label } item={ parent?.metadata } readonly />
        </Section>
      }
      { hasMetadata( childrenKeyValue ) &&
        <Section title="Children References" collapsible>
          { childrenKeyValue?.map( child => <KVPItems title={ child.label } key={ child.id } item={ child?.metadata } readonly /> ) }
        </Section>
      }
      { /* edgesKeyValue && Object.values( edgesKeyValue ).map( edge => <KVPItems item={ edge?.metadata } /> ) */ }
    </Section>
  )
}

export function KVPMetadataEditor( node: KeyValueNode ) {
  return (
    <Section title="Metadata" bordered collapsible>
      <CreateKVP node={ node } />
      <KVPItems item={ node.metadata } title="Metadata" />
    </Section>
  );
}

function hasMetadata( nodes: Node[] | undefined ): boolean {
  if ( !nodes ) return false;
  return nodes.some( ( node ) => {
    if ( node.type === "key_value" ) {
      return Object.keys( node.metadata ).length > 0;
    }
    return false;
  } );
}
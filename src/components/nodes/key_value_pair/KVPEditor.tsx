import { useState, ChangeEvent } from "react";
import { useGraphStore } from "@stores/useGraphStore";
import { KeyValuePairMetadata, MetaDataID, Node } from "@graphTypes/graphTypes";
import { Input } from "@core/Input";
import { AutocompleteInput } from "@core/AutocompleteInput";
import { DeleteButton, ToolButton } from "@core/Button";
import { Section } from "@core/Section";
import { Expander } from "@core/Expander";
import { nanoid } from "nanoid";
import { useNode, useAttributes } from "@hooks/useGraph";

export function CreateKVP( props: { node: Node } ) {
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

    const newAttributes = { ...node.attributes, [ nanoid() ]: { key, value } };

    state.updateNode( {
      ...node,
      attributes: newAttributes
    } );
    return true;
  }

  const keyNameSuggestions = [ ...( incomingNodes ?? [] ), ...( children ?? [] ), ( parent ?? {} as Node ) ]
    .map( ( n ) => n.attributes ? n.attributes : [] )
    .reduce( ( acc, kvp ) => {
      Object.values( kvp ).forEach( ( k ) => {
        if ( !acc.includes( k.key ) ) {
          acc.push( k.key );
        }
      } );
      return acc;
    }, [] as string[] );

  return (
    <Section className="space-x-2">
      <AutocompleteInput
        suggestions={ keyNameSuggestions }
        value={ newKey }
        onChange={ ( e: ChangeEvent<HTMLInputElement> ) => setNewKey( e.target.value ) }
        placeholder="Add new key"
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
      <Input
        value={ newValue }
        onChange={ ( e: ChangeEvent<HTMLInputElement> ) => setNewValue( e.target.value ) }
        placeholder="Add new value"
        className="border rounded p-1 w-full"
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

function KVPItem( props: { id: MetaDataID, readonly?: boolean } ) {
  const kvpState = useAttributes( props.id );
  if ( !kvpState ) return null;
  const { id, key, value, belongsTo, update, remove } = kvpState;

  return (
    <div className="flex flex-row items-center justify-normal my-1">
      <Expander
        className="mr-2"
        items={ [
          <DeleteButton onClick={ () => remove() } disabled={ props.readonly } />,
          // TODO: handle edges
          // BUG: View and Toolbar not upating correctly when clicking child node
          <span className="text-sm text-gray-500">{ belongsTo?.label }</span>,
        ] }
        staggerDelay={ 100 }
        itemSpacing={ 10 }
        direction="left"
      >
        <ToolButton />
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

export function KVPItems( props: { item?: Record<MetaDataID, KeyValuePairMetadata>, readonly?: boolean, title?: string } ) {
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
  const incomingKeyValue = incomingNodes;
  const childrenKeyValue = children;
  // TODO: Update Edges to handle metadata types
  //const edgesKeyValue = sEdges ? sEdges.filter( ( edge ) => edge.type === "key_value" ) : undefined; 

  return (
    <Section title="Available References" collapsible bordered className="my-2 pl-2">
      { hasMetadata( incomingKeyValue ) && <Section title="Incoming References" collapsible>
        { incomingKeyValue?.map( incoming => <KVPItems title={ incoming.label } key={ incoming.id } item={ incoming?.attributes } readonly /> ) }
      </Section> }
      { parent !== undefined && hasMetadata( [ parent ] ) &&
        <Section title="Parent Reference" collapsible>
          <KVPItems title={ parent.label } item={ parent?.attributes } readonly />
        </Section>
      }
      { hasMetadata( childrenKeyValue ) &&
        <Section title="Children References" collapsible>
          { childrenKeyValue?.map( child => <KVPItems title={ child.label } key={ child.id } item={ child?.attributes } readonly /> ) }
        </Section>
      }
      { /* edgesKeyValue && Object.values( edgesKeyValue ).map( edge => <KVPItems item={ edge?.metadata } /> ) */ }
    </Section>
  )
}

export function KVPEditor( { node }: { node: Node } ) {
  return (
    <Section title="Metadata" bordered collapsible>
      <CreateKVP node={ node } />
      <KVPItems item={ node.attributes } />
    </Section>
  );
}

function hasMetadata( nodes: Node[] | undefined ): boolean {
  if ( !nodes ) return false;
  return nodes.some( ( node ) => {
    return Object.keys( node.attributes ? node.attributes : {} ).length > 0;
    return false;
  } );
}
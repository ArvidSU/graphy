import { MetaDataID, Node } from "./graphTypes";
import { evaluate } from "mathjs";
import { KeyValuePairMetadata } from "./graphTypes";


export function getRef( id: MetaDataID ): string {
  return `_${id.substring( 0, 4 )}`;
}

export function getRefsFromValue( key: string ): string[] {
  const matches = key.match( /_[a-zA-Z0-9]{4}/g );
  return matches ? matches : [];
}

export function getMetadataById( metadata: KeyValuePairMetadata ): KeyValuePairMetadata {
  const { key, value } = metadata;
  return { key, value };
}

export function getMetadataByRef( ref: string, nodes: Record<string, Node> ): { id: string, kvp: KeyValuePairMetadata } | undefined {
  for ( const node of Object.values( nodes ) ) {
    if ( node.type === "key_value" ) {
      const metadata = node.metadata;
      const mdId = Object.keys( metadata ).find( id => getRef( id ) === ref );
      if ( mdId ) {
        return { id: mdId, kvp: metadata[ mdId ] };
      }
    }
  }
  return undefined;
}

export function evaluateMetadata( metadata: KeyValuePairMetadata, nodes: Record<string, Node> ): string {
  const { value } = metadata;
  const refs = getRefsFromValue( value );
  if ( refs.length === 0 ) return value;

  const refsMetadata = refs ? refs.map( ref => getMetadataByRef( ref, nodes ) ) : [];

  const scope: Record<string, number | string> = {};

  refsMetadata.forEach( metadata => {
    if ( metadata ) {
      const refKey = getRef( metadata.id );
      // Convert string values to numbers when possible
      const numericValue = !isNaN( Number( metadata.kvp.value ) )
        ? Number( metadata.kvp.value )
        : metadata.kvp.value;

      scope[ refKey ] = numericValue;
    }
  } );

  try {
    const result = evaluate( value, scope );
    return result.toString();
  }
  catch ( error ) {
    console.error( 'Error evaluating expression:', error );
    return `Error: ${error}`;
  }
}
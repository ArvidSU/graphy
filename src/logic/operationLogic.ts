import { Operation, Reference } from "@/types/operationTypes";


export const resolveValue = ( context: Record<string, unknown>, ref: Reference ): { value: unknown; name: string } | undefined => {
  let value: unknown = { ...context };

  try {
    for ( const key of ref.path ) {
      value = ( value as Record<string, unknown> )[ key ];
    }
  } catch ( error ) {
    console.error( 'Error resolving value:', error );
    return undefined;
  }

  return {
    value,
    name: ref.name.toLowerCase().trim().replace( /\s+/g, "_" ),
  };
};

export const assignValue = ( context: Record<string, unknown>, ref: Reference, value: unknown ): Record<string, unknown> | undefined => {
  const newContext = { ...context };
  try {
    const firstKey = ref.path[ 0 ];

    if ( !firstKey || !( firstKey in newContext ) ) {
      console.error( `Key "${firstKey}" does not exist in context` );
      return undefined; // If the key does not exist in the context, return undefined
    }

    if ( ref.path.length === 1 ) {
      return { ...newContext, [ firstKey ]: value }; // If the path has only one key, assign directly
    }

    const rest = ref.path.slice( 1 );
    const existingValue = newContext[ firstKey ] as Record<string, unknown>;
    newContext[ firstKey ] = assignValue( existingValue, { ...ref, path: rest }, value );

    if ( newContext[ firstKey ] === undefined ) {
      console.error( `Failed to assign value to path "${ref.path.join( '.' )}"` );
      return undefined; // If assignment fails, return undefined
    }

    return newContext;
  } catch ( error ) {
    console.error( 'Error assigning value:', error );
    return undefined;
  }
}

/**
 * Evaluates a operation against a set of objects.
 * 
 * @param operation - The operation to evaluate.
 * @param context - A record of objects where the key is the index and the value is the object.
 * @returns The evaluated result, which can be a value or an updated object.
 * If the operation has an output, it returns the updated object; otherwise, it returns the evaluated result.
 */
export function evaluateOperation<T extends Record<string, unknown>>( operation: Operation, context: T ): undefined | unknown | T {
  const { inputs, expression, outputs } = operation;
  const scope: Record<string, unknown> = {};

  Object.values( inputs )?.forEach( ref => {
    const resolved = resolveValue( context, ref );
    if ( resolved ) {
      const refName = resolved.name;
      if ( scope[ refName ] ) {
        console.warn( `Input with key ${ref.name} is already defined in the scope. Overwriting value.` );
      }
      scope[ refName ] = resolved.value;
    } else {
      console.error( `Failed to resolve input reference: ${ref.name}` );
      return undefined; // If any input reference fails to resolve, return undefined
    }
  } );
  let res: unknown;
  try {
    const paramNames = Object.keys( scope ).join( ',' );
    const func = new Function( paramNames, `return ${expression};` );
    res = func( ...Object.values( scope ) );
  }
  catch ( error ) {
    console.error( 'Error evaluating operation:', error );
    return undefined;
  }

  if ( Object.keys( outputs ).length > 0 && res !== undefined ) {
    return assignValue( context, Object.values( outputs )[ 0 ], res );
  }

  return res;
}

/**
 * Helpers for working with references in operations
 * 
 **/

export const isNestedObject = ( value: unknown ): value is Record<string, unknown> => {
  return value !== null &&
    typeof value === 'object' &&
    !Array.isArray( value ); // Don't drill into arrays
};

export const getValueType = ( value: unknown ): string => {
  if ( value === null ) return 'null';
  if ( Array.isArray( value ) ) return `array[${value.length}]`;
  if ( typeof value === 'object' ) return 'object';
  return typeof value;
};

export const buildReferencePath = ( reference: Reference, separator: string = '.' ): string => {
  const parts = [];
  for ( const key of reference.path ) {
    parts.push( key );
  }
  return parts.length > 0 ? parts.join( separator ) : '';
};

export const areEqualReferences = ( ref1?: Reference, ref2?: Reference ): boolean => {
  if ( !ref1 || !ref2 ) return false;
  return buildReferencePath( ref1 ) === buildReferencePath( ref2 ) &&
    ref1.name === ref2.name &&
    ref1.id === ref2.id;
};

export const isOperation = ( value: unknown ): value is Operation => {
  return typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'description' in value &&
    'expression' in value;
}

export const isReference = ( value: unknown ): value is Reference => {
  return typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    value.name !== '' &&
    'path' in value &&
    Array.isArray( value.path ) &&
    value.path.length > 0 &&
    ( value as Reference ).path.every( key => typeof key === 'string' );
}
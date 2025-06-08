import { Operation, Reference, ObjectWithId } from "@/types/operationTypes";

export function resolveValue<T extends ObjectWithId>( context: Record<string, T>, ref: Reference ): { refName: string, value: unknown } | undefined {
  const target = context[ ref.index ];
  if ( !target ) {
    console.warn( `Target with ID ${ref.index} not found.` );
    return undefined;
  }
  const value = target[ ref.key as keyof T ];
  if ( ref.next ) {
    return resolveValue( value as Record<string, T>, ref.next );
  }
  return { refName: ref.name, value };
}

/**
 * Evaluates a operation against a set of objects.
 * 
 * @param operation - The operation to evaluate.
 * @param context - A record of objects where the key is the index and the value is the object.
 * @returns The evaluated result, which can be a value or an updated object.
 * If the operation has an output, it returns the updated object; otherwise, it returns the evaluated result.
 */
export function evaluateOperation<T extends ObjectWithId>( operation: Operation, context: Record<string, T> ): undefined | unknown | T {
  const { inputs, expression, output } = operation;
  const scope: Record<string, unknown> = {};

  inputs?.forEach( ref => {
    const resolved = resolveValue( context, ref );
    if ( resolved ) {
      if ( scope[ resolved.refName ] ) {
        console.warn( `Input with ID ${ref.index} and key ${ref.key} is already defined in the scope. Overwriting value.` );
      }
      scope[ resolved.refName ] = resolved.value;
    } else {
      console.warn( `Input with ID ${ref.index} and key ${ref.key} could not be resolved.` );
    }
  } );

  try {
    const paramNames = Object.keys( scope ).join( ',' );
    const func = new Function( paramNames, `return ${expression};` );
    const res = func( ...Object.values( scope ) );

    if ( output ) {
      const outputObject = { ...context[ output.index ] };
      if ( outputObject ) {
        ( outputObject as Record<string, unknown> )[ output.key ] = res;
        return outputObject;
      } else {
        console.warn( `Output with ID ${output.index} not found in the provided nodes.` );
        return undefined;
      }
    }

    return res;
  }
  catch ( error ) {
    console.error( 'Error evaluating rule:', error );
    return undefined;
  }
}
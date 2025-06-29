interface OperationResultDisplayProps {
  result: unknown;
}

export function OperationResultDisplay( { result }: OperationResultDisplayProps ) {
  if ( result === null || result === undefined ) return null;

  return (
    <div className="p-2 text-gray-700 font-mono bg-green-100 rounded text-xs overflow-x-auto max-h-40 border border-green-300">
      <pre className="text-xs text-gray-600 mt-1">
        { JSON.stringify( result, null, 2 ) }
      </pre>
    </div>
  );
}

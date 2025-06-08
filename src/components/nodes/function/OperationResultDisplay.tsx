interface OperationResultDisplayProps {
  result: unknown;
}

export function OperationResultDisplay( { result }: OperationResultDisplayProps ) {
  if ( result === null ) return null;

  return (
    <div className="mt-4 p-2 bg-gray-100 rounded">
      <p className="text-sm font-medium text-gray-700">Result:</p>
      <pre className="text-xs text-gray-600 mt-1">
        { JSON.stringify( result, null, 2 ) }
      </pre>
    </div>
  );
}

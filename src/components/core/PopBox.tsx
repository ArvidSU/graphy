export function PopBox( {
  children,
  color = "white",
}: {
  children: React.ReactNode;
  color?: "white" | "gray" | "blue" | "green" | "red" | "yellow";
} ) {
  const colorMap = {
    white: { bg: "#f9fafb", text: "#1f2937", border: "#e5e7eb" },
    gray: { bg: "#f3f4f6", text: "#1f2937", border: "#d1d5db" },
    blue: { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
    green: { bg: "#dcfce7", text: "#166534", border: "#86efac" },
    red: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
    yellow: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  };

  return (
    <div
      className="border border-gray-200 rounded-xl p-4 shadow-sm transition-colors duration-300"
      style={ {
        backgroundColor: colorMap[ color ].bg,
        borderColor: colorMap[ color ].border,
      } }
      onMouseEnter={ e => {
        ( e.currentTarget as HTMLDivElement ).style.backgroundColor = colorMap[ color ].border;
      } }
      onMouseLeave={ e => {
        ( e.currentTarget as HTMLDivElement ).style.backgroundColor = colorMap[ color ].bg;
      } }
    >
      { children }
    </div>
  );
}
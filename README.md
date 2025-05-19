# Graph Tool

A visual tool for creating and managing graph-based data structures with interactive nodes, edges, and metadata.

## Features

- **Interactive Graph Editor**: Create, position, and connect nodes in a visual canvas
- **Node Management**:
  - Add, delete, and reposition nodes with drag-and-drop functionality
  - Double-click on nodes to navigate into them (hierarchical structure)
  - Create connections between nodes by selecting a source node and clicking on a target node
- **Metadata System**:
  - Add key-value pairs to nodes
  - Support for mathematical expressions with `mathjs` integration
  - Reference other node metadata values in expressions
- **Project Management**:
  - Create and manage multiple graph projects
  - Import/Export projects as JSON files
  - Auto-save to browser's localStorage

## Usage

### Basic Operations

- **Create a node**: Double-click on the canvas
- **Select a node**: Click on it
- **Move a node**: Drag it around the canvas
- **Connect nodes**: Click the link icon on a selected node, then click on the target node
- **Navigate into a node**: Double-click on a node to view its children
- **Navigate up**: Click the "Up" button in the toolbar

### Adding Metadata

1. Select a node
2. In the toolbar, find the "Metadata" section
3. Use the key-value input fields to add metadata to the node
4. For mathematical expressions, start with an equals sign (e.g., `=10*5`)
5. To reference other nodes' metadata, use the available references shown below the input

## Development

### Requirements

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:ArvidSU/graphy.git
cd graphy

# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Technologies Used

- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Konva/React-Konva**: Canvas rendering for the interactive graph
- **Zustand**: State management
- **TailwindCSS**: Utility-first CSS framework
- **mathjs**: Mathematical expression evaluation
- **Vite**: Build tool and dev server

## Project Structure

- `src/components`: React components
  - `core/`: Reusable UI components
  - `toolbar/`: Components for the right sidebar
  - `sidebar/`: Components for the left sidebar
  - `View.tsx`: Main canvas component with Konva integration
- `src/logic`: Core data structures and logic
- `src/stores`: Zustand stores for state management
- `src/utils`: Utility functions
- `src/hooks`: Custom React hooks

## License

MIT

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useGraphStore } from './stores/useGraphStore'
import { getMostRecentProject } from './utils/projectUtils'

// Initialize the app with the most recent project
const initializeApp = () => {
  const mostRecentProject = getMostRecentProject();
  useGraphStore.getState().loadGraph( mostRecentProject );
  console.debug( 'Loaded most recent project:', mostRecentProject.name );
};

// Initialize the store before rendering
initializeApp();

createRoot( document.getElementById( 'root' )! ).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

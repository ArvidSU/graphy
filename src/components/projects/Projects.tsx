import { useGraphStore, newProject } from "@stores/useGraphStore";
import { GraphState } from "@graphTypes/graphTypes";
import { Button, DeleteButton, CopyButton } from "@core/Button";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import {
  getProjectsFromLocalStorage,
  saveProjectToLocalStorage,
  deleteProjectFromLocalStorage,
  formatDate
} from "@utils/projectUtils";
import { Expander } from "@core/Expander";

export function Projects() {
  const state = useGraphStore();
  const { id, name, loadGraph } = state;
  const [ localProjects, setLocalProjects ] = useState<GraphState[]>( getProjectsFromLocalStorage() );

  // Save the current project/state to local storage when it changes
  // and update the local projects state to reflect the changes immediately
  useEffect( () => {
    // Create a copy of the current state to avoid reference issues
    const currentProject = { ...state };
    const updatedProject = saveProjectToLocalStorage( currentProject );

    // Update the local projects list to reflect the latest changes
    setLocalProjects( prevProjects => {
      const updatedProjects = [ ...prevProjects ];
      const existingIndex = updatedProjects.findIndex( p => p.id === updatedProject.id );

      if ( existingIndex !== -1 ) {
        updatedProjects[ existingIndex ] = updatedProject;
      } else if ( updatedProject.id ) {
        updatedProjects.push( updatedProject );
      }

      // Keep projects sorted by modified date
      return updatedProjects.sort( ( a, b ) => b.modified - a.modified );
    } );
  }, [ state ] ); // Include state as dependency to satisfy React Hook warning

  // Load projects from localStorage on component mount
  useEffect( () => {
    setLocalProjects( getProjectsFromLocalStorage() );
  }, [] );

  const handleDeleteProject = ( projectId: string ) => {
    deleteProjectFromLocalStorage( projectId );
    setLocalProjects( prevProjects => prevProjects.filter( p => p.id !== projectId ) );

    // If we deleted the current project, load another one
    if ( projectId === id ) {
      const remainingProjects = getProjectsFromLocalStorage();
      if ( remainingProjects.length > 0 ) {
        loadGraph( remainingProjects[ 0 ] ); // Load the most recently modified project
      } else {
        // Create a new project with timestamps if no projects remain
        const now = Date.now();
        loadGraph( {
          ...newProject,
          id: nanoid(),
          created: now,
          modified: now
        } );
      }
    }
  };

  return (

    <ul className="space-y-2 w-full">
      { localProjects.map( ( project ) => (
        <li key={ project.id } className="w-full">

          <Expander
            items={ [
              <DeleteButton className="bg-gray-300" onClick={ () => handleDeleteProject( project.id ) } />,
              <CopyButton
                className="bg-gray-300"
                onClick={ () => {
                  const copiedProject = { ...project, id: nanoid(), name: `${project.name} (copy)` };
                  saveProjectToLocalStorage( copiedProject );
                  setLocalProjects( prevProjects => {
                    const updatedProjects = [ ...prevProjects, copiedProject ];
                    return updatedProjects.sort( ( a, b ) => b.modified - a.modified );
                  } );
                  loadGraph( copiedProject );
                } }
              />,
              <span className="line-clamp-1 text-xs text-gray-500">
                Modified: { formatDate( project.modified ) }
              </span>
            ]
            }
            staggerDelay={ 100 }
            itemSpacing={ 10 }
            direction="right"
          >
            <Button
              className="w-full bg-gray-300"
              onClick={ () => loadGraph( project ) }
            >
              <p
                className={ `text-sm line-clamp-1 ${id === project.id ? "font-bold" : ""}` }
                title={ project.name }
              >
                { id === project.id ? name : project.name }
              </p>
            </Button>
          </Expander>
        </li>
      ) ) }
    </ul>
  );
}
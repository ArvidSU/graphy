import { GraphState } from "@graphTypes/graphTypes";
import { nanoid } from "nanoid";
import { newProject } from "@stores/projectConstants";

/**
 * Gets projects from localStorage and sorts them by modification date (newest first)
 */
export function getProjectsFromLocalStorage(): GraphState[] {
  const projects = localStorage.getItem( "projects" );
  if ( projects ) {
    const parsedProjects = JSON.parse( projects ) as GraphState[];
    // Sort projects by modified date (newest first)
    return parsedProjects.sort( ( a, b ) => ( b.modified || 0 ) - ( a.modified || 0 ) );
  }
  return [];
}

/**
 * Gets the most recently modified project or creates a new one if no projects exist
 */
export function getMostRecentProject(): GraphState {
  const projects = getProjectsFromLocalStorage();
  if ( projects.length > 0 ) {
    return projects[ 0 ]; // Already sorted by modified date (newest first)
  }

  // No projects exist, create a new one with timestamps
  const now = Date.now();
  return {
    ...newProject,
    id: nanoid(),
    created: now,
    modified: now
  };
}

export function saveProjectsToLocalStorage( projects: GraphState[] ) {
  localStorage.setItem( "projects", JSON.stringify( projects ) );
}

export function deleteProjectFromLocalStorage( id: string ) {
  const projects = getProjectsFromLocalStorage();
  const updatedProjects = projects.filter( ( project ) => project.id !== id );
  saveProjectsToLocalStorage( updatedProjects );
}

export function saveProjectToLocalStorage( project: GraphState ) {
  const projects = getProjectsFromLocalStorage();
  const existingProjectIndex = projects.findIndex( ( p ) => p.id === project.id );

  // Ensure the project has timestamps
  const now = Date.now();
  const projectWithTimestamps = {
    ...project,
    created: project.created || now,
    modified: now // Always update the modified timestamp
  };

  if ( existingProjectIndex !== -1 ) {
    projects[ existingProjectIndex ] = projectWithTimestamps;
  } else {
    projects.push( projectWithTimestamps );
  }

  saveProjectsToLocalStorage( projects );
  return projectWithTimestamps;
}

export function formatDate( timestamp: number ) {
  return new Date( timestamp ).toLocaleString();
}
import { ReactElement } from 'react';
import { IProject } from '../modules/projects';
import { Link, useLoaderData } from 'react-router-dom';
import { loadProjects } from '../modules/projects';
import { Page } from '../modules/shared/components';

export interface ProjectsPageData {
    projects: IProject[];
}

export function ProjectsPage(): ReactElement {
    const { projects } = useLoaderData() as ProjectsPageData;

    return (
        <Page
            header={
                <div className="flex justify-between">
                    Projects<button>Add a new project</button>
                </div>
            }
        >
            <div className="grid grid-cols-3 gap-4">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        className="border rounded hover:shadow cursor-pointer p-4"
                        to={`${project.id}`}
                    >
                        <div className="text-base font-bold">{project.name}</div>
                        <div className="text-xs">{project.dialect}</div>
                    </Link>
                ))}
            </div>
        </Page>
    );
}

export async function ProjectsPageLoader(): Promise<ProjectsPageData> {
    const projects = await loadProjects();
    return { projects };
}

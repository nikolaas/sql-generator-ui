import { ReactElement, useState } from 'react';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { BackButton, Page } from '../../modules/shared/components';
import { IProject, loadProject, createProjectManager } from '../../modules/projects';
import { Canvas } from './Canvas';
import { useProject, useSelectedTable } from './project-hooks';
import { ProjectView } from './ProjectView';
import { TableView } from './TableView';

export interface ProjectPageData {
    project: IProject;
}

export function ProjectPage(): ReactElement {
    const { project: initialProject } = useLoaderData() as ProjectPageData;

    const [manager] = useState(() => createProjectManager(initialProject));

    const project = useProject(manager);
    const selectedTable = useSelectedTable(manager);

    return (
        <Page
            header={
                <div className="flex justify-between">
                    <div>
                        <BackButton />
                        <span className="ml-2">{project.name}</span>
                    </div>
                    <button onClick={() => manager.createNewTable()}>Add a new table</button>
                </div>
            }
        >
            <div className="grow flex border-t">
                <Canvas className="w-3/4" projectManager={manager} />
                <div className="w-1/4 border-l">
                    {selectedTable && <TableView table={selectedTable} />}
                    {!selectedTable && <ProjectView projectManager={manager} />}
                </div>
            </div>
        </Page>
    );
}

export async function ProjectPageLoader({ params }: LoaderFunctionArgs): Promise<ProjectPageData> {
    const project = await loadProject(params.id as string);
    return { project };
}

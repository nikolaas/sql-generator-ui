import { ReactElement } from 'react';
import { useProject } from './project-hooks';
import { ProjectManager } from '../../modules/projects';

export interface ProjectViewProps {
    projectManager: ProjectManager;
}

export function ProjectView(props: ProjectViewProps): ReactElement {
    const { projectManager } = props;
    const project = useProject(projectManager);

    return (
        <div className="p-2">
            <div className="flex gap-2 mt-2">
                <div className="">Project:</div>
                <div className="font-bold">{project.name}</div>
            </div>
            <div className="flex gap-2 mt-2">
                <div className="">Dialect:</div>
                <div className="font-bold">{project.dialect}</div>
            </div>
            <div className="mt-2">
                <button>Generate SQL</button>
            </div>
        </div>
    );
}

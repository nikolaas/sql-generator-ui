import { useEffect, useMemo, useState } from 'react';
import { IProject, ITable, ProjectManager } from '../../modules/projects';

export function useProject(projectManager: ProjectManager): IProject {
    const [project, setProject] = useState(projectManager.project);
    useEffect(() => {
        return projectManager.onChangeProject(setProject);
    }, [projectManager]);
    return project;
}

export function useSelectedTable(projectManager: ProjectManager): ITable | undefined {
    const project = useProject(projectManager);
    const [selection, setSelection] = useState<string | undefined>();
    const selectedTable = useMemo(() => project.tables.find((t) => t.name === selection), [project, selection]);

    useEffect(() => {
        return projectManager.onChangeSelection(setSelection);
    }, [projectManager]);

    return selectedTable;
}

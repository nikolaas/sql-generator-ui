import { IProject, ITable } from './model';
import { createNewTable, moveTable } from './projects';

export interface ProjectManager {
    readonly project: IProject;
    onChangeSelection: (cb: Listener<string | undefined>) => () => void;
    setSelection: (table: ITable | undefined) => void;
    onChangeProject: (cb: Listener<IProject>) => () => void;
    createNewTable: () => Promise<void>;
    moveTable: (table: ITable, x: number, y: number) => Promise<void>;
}

type Listener<T> = (v: T) => void;

export function createProjectManager(project: IProject): ProjectManager {
    let selection: string | undefined;
    const selectionListeners: Set<Listener<string | undefined>> = new Set();
    const projectListeners: Set<Listener<IProject>> = new Set();

    let prj = project;
    function setProject(p: IProject): void {
        prj = p;
        projectListeners.forEach((l) => {
            l(p);
        });
    }

    return {
        get project() {
            return prj;
        },
        onChangeSelection: (cb) => {
            selectionListeners.add(cb);
            return () => selectionListeners.delete(cb);
        },
        setSelection: (table) => {
            const newSelection = table ? table.name : undefined;
            if (selection !== newSelection) {
                selection = newSelection;
                selectionListeners.forEach((l) => {
                    l(selection);
                });
            }
        },
        onChangeProject: (cb) => {
            projectListeners.add(cb);
            return () => projectListeners.delete(cb);
        },
        moveTable: (table: ITable, x: number, y: number) => {
            return moveTable(prj, table, x, y).then(setProject);
        },
        createNewTable: () => {
            return createNewTable(prj).then(setProject);
        },
    } satisfies ProjectManager;
}

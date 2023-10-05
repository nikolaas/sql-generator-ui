import { IDataType, IProject, ITable, SQLDialect } from './model';

const dataTypes: IDataType[] = [{ name: 'string' }, { name: 'number' }, { name: 'boolean' }];

function typeByName(name: string): IDataType {
    const target = dataTypes.find((t) => t.name === name);
    if (target === undefined) {
        throw new Error(`unknown type "${name}"`);
    }
    return target;
}

const projects: IProject[] = [
    {
        id: '1',
        name: 'test1',
        dialect: SQLDialect.PostgreSQL,
        tables: [
            {
                name: 'Person',
                columns: [
                    { name: 'ID', type: typeByName('string'), primaryKey: true },
                    { name: 'name', type: typeByName('string') },
                    { name: 'birthDate', type: typeByName('string') },
                ],
                view: { x: 50, y: 100 },
            },
        ],
    },
    { id: '2', name: 'test2', dialect: SQLDialect.PostgreSQL, tables: [] },
];

export function loadProjects(): Promise<IProject[]> {
    return Promise.resolve(projects);
}

export function loadColumnTypes(): Promise<IDataType[]> {
    return Promise.resolve(dataTypes);
}

export function loadProject(id: string): Promise<IProject> {
    const project = projects.find((p) => p.id === id);
    if (project === undefined) {
        return Promise.reject({ message: `Project with id "${id}" is not found` });
    }
    return Promise.resolve(project);
}

export function createNewTable(project: IProject): Promise<IProject> {
    const projectIdx = projects.findIndex((p) => p.id === project.id);
    if (projectIdx < 0) {
        throw new Error(`unknown project "${project.id}"`);
    }

    const counter = project.tables.filter((t) => t.name.match(/Table \d+/)).length;
    const newTable: ITable = {
        name: `Table ${counter + 1}`,
        columns: [],
        view: { x: 0, y: 0 },
    };

    const prj: IProject = {
        ...project,
        tables: [...project.tables, newTable],
    };
    projects[projectIdx] = prj;
    return Promise.resolve(prj);
}

export function moveTable(project: IProject, table: ITable, x: number, y: number): Promise<IProject> {
    const projectIdx = projects.findIndex((p) => p.id === project.id);
    if (projectIdx < 0) {
        throw new Error(`unknown project "${project.id}"`);
    }
    const tableIdx = project.tables.findIndex((t) => t.name === table.name);
    if (tableIdx < 0) {
        throw new Error(`unknown table "${table.name}"`);
    }

    const movedTable = { ...table, view: { x, y } };
    const tables = [...project.tables];
    tables[tableIdx] = movedTable;
    const prj: IProject = { ...project, tables };
    projects[projectIdx] = prj;
    return Promise.resolve(prj);
}

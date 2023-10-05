export interface IProject {
    id: string;
    name: string;
    dialect: SQLDialect;
    tables: ITable[];
}

export enum SQLDialect {
    PostgreSQL = 'PostgreSQL',
    MariaDB = 'MariaDB',
}

export interface ITable {
    name: string;
    columns: IColumn[];
    view: ITableView;
}

export interface IColumn {
    name: string;
    type: IDataType;
    primaryKey?: boolean;
    unique?: boolean;
    notNull?: boolean;
}

export interface IDataType {
    name: string;
}

export interface ITableView {
    x: number;
    y: number;
}

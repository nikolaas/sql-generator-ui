import { ReactElement } from 'react';
import { ITable } from '../../modules/projects';

export interface TableViewProps {
    table: ITable;
}

export function TableView(props: TableViewProps): ReactElement {
    const { table } = props;
    return (
        <div className="p-2">
            <div className="flex gap-2 mt-2">
                <div className="">Table:</div>
                <div className="font-bold">{table.name}</div>
            </div>
            <div className="flex gap-2 mt-2">
                <div className="">X:</div>
                <div className="font-bold">{table.view.x}</div>
            </div>
            <div className="flex gap-2 mt-2">
                <div className="">Y:</div>
                <div className="font-bold">{table.view.y}</div>
            </div>
        </div>
    );
}

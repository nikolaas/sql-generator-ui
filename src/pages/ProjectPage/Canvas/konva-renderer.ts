import { IProject, ITable } from '../../../modules/projects';
import Konva from 'konva';
import { Renderer } from './renderer';

interface RenderContext {
    movement: boolean;
}

export function createKonvaRenderer(): Renderer {
    let dragStartX = 0;
    let dragStartY = 0;
    let viewportX = 0;
    let viewportY = 0;
    const context: RenderContext = {
        movement: false,
    };

    return (container, width, height, projectManager) => {
        const tableNodes = renderTables(projectManager.project, context);
        const viewport = new Konva.Group({ name: 'viewport', x: viewportX, y: viewportY });
        tableNodes.forEach((n) => viewport.add(n));

        const selectionTransformer = new Konva.Transformer({
            rotateEnabled: false,
            boundBoxFunc: (oldBoundBox) => oldBoundBox,
        });

        const stage = new Konva.Stage({
            container,
            width,
            height,
        });

        stage.on('dragend', function (e) {
            const tableNode = findTableNode(e.target);
            if (tableNode === undefined) {
                return;
            }
            const table = findTable(tableNode, projectManager.project);
            projectManager.moveTable(table, e.target.x(), e.target.y());
        });

        // clicks should select/deselect shapes
        stage.on('click tap', function (e) {
            // if click on empty area - remove all selections
            const tableNode = findTableNode(e.target);
            if (tableNode !== undefined) {
                const table = findTable(tableNode, projectManager.project);
                selectionTransformer.nodes([tableNode]);
                projectManager.setSelection(table);
            } else {
                selectionTransformer.nodes([]);
                projectManager.setSelection(undefined);
            }
        });

        stage.on('mousedown', function (e) {
            const isWheelClicked = e.evt.which == 2 || e.evt.button == 4;
            if (!isWheelClicked) {
                return;
            }
            context.movement = true;
            dragStartX = e.evt.clientX;
            dragStartY = e.evt.clientY;
            viewportX = viewport.x();
            viewportY = viewport.y();
            document.body.style.cursor = 'move';
        });

        stage.on('mousemove', function (e) {
            const isWheelClicked = e.evt.which == 2 || e.evt.button == 4;
            if (!isWheelClicked) {
                return;
            }
            if (!context.movement) {
                return;
            }
            const deltaX = dragStartX - e.evt.clientX;
            const deltaY = dragStartY - e.evt.clientY;

            viewport.x(viewportX + deltaX);
            viewport.y(viewportY + deltaY);
        });

        stage.on('mouseup', function () {
            if (!context.movement) {
                return;
            }
            context.movement = false;
            viewportX = viewport.x();
            viewportY = viewport.y();
            document.body.style.cursor = 'default';
            console.log('viewport pos', viewport.x(), viewport.y());
        });

        const layer = new Konva.Layer();
        layer.add(viewport);
        layer.add(selectionTransformer);
        stage.add(layer);

        // draw the image
        layer.draw();
        console.log('viewport pos', viewport.x(), viewport.y());
    };
}

function renderTables(project: IProject, context: RenderContext): Konva.Group[] {
    return project.tables.map((t) => renderTable(t, context));
}

type ICanvasElement = IStaticCanvasElement | IAbsoluteCanvasElement;

interface ICanvasBase<N> {
    node: N;
    margin?: IOffset;
}

interface ICanvasElementBase extends ICanvasBase<Konva.Shape | Konva.Group> {}

interface IStaticCanvasElement extends ICanvasElementBase {
    position?: 'static';
}

interface IAbsoluteCanvasElement extends ICanvasElementBase {
    position: 'absolute';
    pos?: (container: ICanvasContainer, prevX: number, prevY: number) => number[];
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

type ICanvasContainer = ICanvasBase<Konva.Group> & {
    padding?: IOffset;
};

interface IOffset {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

function renderTable(table: ITable, context: RenderContext): Konva.Group {
    const tableNodeNamePrefix = `table.${table.name}`;

    // формируем группу фигур из которых состоит таблица
    const container = renderContainer(
        {
            node: new Konva.Group({
                name: tableNodeNamePrefix,
                x: table.view.x,
                y: table.view.y,
                draggable: true,
            }),
            padding: { top: 10, right: 20, bottom: 10, left: 20 },
        },
        [
            {
                node: new Konva.Rect({
                    name: `${tableNodeNamePrefix}.box`,
                    x: 0,
                    y: 0,
                    fill: 'yellow',
                    stroke: 'black',
                    strokeWidth: 2,
                }),
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            },
            {
                node: new Konva.Text({
                    name: `${tableNodeNamePrefix}.name`,
                    text: table.name,
                    fontSize: 20,
                    fontFamily: 'Calibri',
                    fill: 'black',
                }),
            },
            ...renderTableColumns(table, tableNodeNamePrefix),
        ],
    );
    container.node.on('mouseover', function () {
        if (context.movement) {
            return;
        }
        document.body.style.cursor = 'pointer';
    });
    container.node.on('mouseout', function () {
        if (context.movement) {
            return;
        }
        document.body.style.cursor = 'default';
    });

    /* нужно чтобы проще было отличать ноды-таблицы */
    /*eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    container.node.__SIGMA_TABLE__ = true;
    return container.node;
}

function renderTableColumns(table: ITable, prefix: string): ICanvasElement[] {
    if (table.columns.length === 0) {
        return [
            {
                node: new Konva.Line({
                    name: `${prefix}.headerDivider`,
                    stroke: 'black',
                    strokeWidth: 1,
                    lineCap: 'round',
                    lineJoin: 'round',
                }),
                position: 'absolute',
                pos: (container, containerWidth) => {
                    const padding = toStrongOffset(container.padding);
                    const y = padding.top + 20;
                    return [
                        0, // X of the start point,
                        y, // Y of the start point,
                        containerWidth, // X of the end point,
                        y, // Y of the end point,
                    ];
                },
            },
            {
                node: new Konva.Text({
                    name: `${prefix}.noColumns`,
                    text: 'Table contains no columns',
                    fontSize: 12,
                    fontFamily: 'Calibri',
                    fill: 'black',
                }),
                margin: { top: 10 },
            },
        ];
    }

    const children: ICanvasElement[] = [];
    const pkColumn = table.columns.find((col) => col.primaryKey);
    if (pkColumn !== undefined) {
        children.push(
            renderContainer(
                {
                    node: new Konva.Group({ name: `${prefix}.${pkColumn.name}` }),
                    padding: { top: 5, right: 10, bottom: 5, left: 10 },
                },
                [
                    {
                        node: new Konva.Rect({
                            name: `${prefix}.${pkColumn.name}.box`,
                            fill: 'yellow',
                            stroke: 'black',
                            strokeWidth: 1,
                        }),
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                    {
                        node: new Konva.Text({
                            name: `${prefix}.${pkColumn.name}.name`,
                            text: `${pkColumn.name}:${pkColumn.type.name}`,
                            fontSize: 16,
                            fontFamily: 'Calibri',
                            fill: 'black',
                        }),
                    },
                ],
            ),
        );
    }
    const restColumns = table.columns.filter((c) => c != pkColumn);
    if (restColumns.length > 0) {
        children.push(
            renderContainer(
                {
                    node: new Konva.Group({ name: `${prefix}.restColumns` }),
                    padding: { top: 5, right: 10, bottom: 5, left: 10 },
                    margin: pkColumn !== undefined ? { top: 3 } : undefined,
                },
                [
                    {
                        node: new Konva.Rect({
                            name: `${prefix}.restColumnsBox`,
                            fill: 'yellow',
                            stroke: 'black',
                            strokeWidth: 1,
                        }),
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                    ...restColumns.map((col) => {
                        return {
                            node: new Konva.Text({
                                name: `${prefix}.${col.name}.name`,
                                text: `${col.name}:${col.type.name}`,
                                fontSize: 16,
                                fontFamily: 'Calibri',
                                fill: 'black',
                            }),
                        };
                    }),
                ],
            ),
        );
    }
    return children;
}

function renderContainer(container: ICanvasContainer, children: ICanvasElement[]): ICanvasContainer {
    layoutContainer(container, children);
    children.forEach((child) => {
        container.node.add(child.node);
    });
    return container;
}

function layoutContainer(container: ICanvasContainer, children: ICanvasElement[]): void {
    const containerPadding = toStrongOffset(container.padding);
    let totalWidth = 0;
    let totalHeight = containerPadding.top;

    const staticChildren = children.filter(isStaticallyPositioned);
    staticChildren.forEach((child) => {
        if (child.node instanceof Konva.Line) {
            //пока непонятно как рендерить такую линию
        } else {
            const margin = toStrongOffset(child.margin);
            const x = containerPadding.left + margin.left;
            const y = totalHeight + margin.top;
            child.node.x(x);
            child.node.y(y);
            const childHeight = child.node.height();
            totalHeight = y + childHeight;
        }
        totalWidth = Math.max(totalWidth, child.node.width());
    });

    totalHeight += containerPadding.bottom;

    const containerHeight = totalHeight;
    const containerWidth = containerPadding.left + totalWidth + containerPadding.right;

    const absoluteChildren = children.filter(isAbsolutelyPositioned);
    absoluteChildren.forEach((child) => {
        if (child.pos) {
            const pos = child.pos(container, containerWidth, containerHeight);
            if (child.node instanceof Konva.Line) {
                child.node.points(pos);
            } else {
                const [x, y] = pos;
                child.node.x(x);
                child.node.y(y);
            }
        } else {
            const offset = toStrongOffset(child);
            child.node.x(0 + offset.left);
            child.node.y(0 + offset.top);
            child.node.width(containerWidth - offset.right);
            child.node.height(containerHeight - offset.bottom);
        }
    });

    container.node.width(containerWidth);
    container.node.height(containerHeight);
}

function findTableNode(node: Konva.Shape | Konva.Stage): Konva.Group | undefined {
    let n: Konva.Node | null = node;
    while (n) {
        if (isTableNode(n)) {
            return n;
        }
        n = n.parent;
    }
    return undefined;
}

function isTableNode(node: Konva.Node): node is Konva.Group {
    /* нужно чтобы проще было отличать ноды-таблицы */
    /*eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    return node instanceof Konva.Group && node.__SIGMA_TABLE__ === true;
}

function findTable(node: Konva.Group, project: IProject): ITable {
    const nodeName = node.name();
    const tableName = nodeName.substring('table.'.length);
    const table = project.tables.find((t) => t.name === tableName);
    if (table === undefined) {
        throw new Error(`unknown table "${tableName}"`);
    }
    return table;
}

function toStrongOffset(offset: IOffset | undefined): Required<IOffset> {
    const top = offset?.top || 0;
    const right = offset?.right || 0;
    const bottom = offset?.bottom || 0;
    const left = offset?.left || 0;
    return { top, right, bottom, left };
}

function isAbsolutelyPositioned(el: ICanvasElement): el is IAbsoluteCanvasElement {
    return el.position === 'absolute';
}

function isStaticallyPositioned(el: ICanvasElement): el is IStaticCanvasElement {
    return el.position === undefined || el.position === 'static';
}

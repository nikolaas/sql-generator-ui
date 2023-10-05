import { ReactElement, useEffect, useRef, useState } from 'react';
import { ProjectManager } from '../../../modules/projects';
import { createKonvaRenderer } from './konva-renderer';

export interface CanvasProps {
    className?: string;
    projectManager: ProjectManager;
}

export interface RenderCore {
    render: (node: HTMLDivElement, width: number, height: number) => void;
}

export function Canvas(props: CanvasProps): ReactElement {
    const { className, projectManager } = props;
    const [renderer] = useState(() => createKonvaRenderer());

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = ref.current as HTMLDivElement;
        const rect = node.getBoundingClientRect();
        renderer(node, rect.width, rect.height, projectManager);

        projectManager.onChangeProject(() => {
            const rect = node.getBoundingClientRect();
            renderer(node, rect.width, rect.height, projectManager);
        });
    }, [renderer, projectManager]);

    return <div className={className} ref={ref} />;
}

import { ProjectManager } from '../../../modules/projects';

export type Renderer = (
    container: HTMLDivElement,
    width: number,
    height: number,
    projectManager: ProjectManager,
) => void;

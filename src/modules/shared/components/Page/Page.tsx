import { ReactElement, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export interface PageProps {
    header?: ReactNode;
    children?: ReactNode;
}

export function Page(props: PageProps): ReactElement {
    return (
        <div className="grow flex flex-col">
            {props.header && <div className="mb-4">{props.header}</div>}
            <div className="grow flex flex-col">{props.children}</div>
        </div>
    );
}

export function BackButton(): ReactElement {
    const navigate = useNavigate();

    return <button onClick={() => navigate(-1)}>{'<'}</button>;
}

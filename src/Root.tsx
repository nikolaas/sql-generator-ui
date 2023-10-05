import { ReactElement } from 'react';
import { Outlet } from 'react-router-dom';

export function Root(): ReactElement {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="p-4 border-b">Sigma</header>
            <main className="p-4 grow flex flex-col">
                <Outlet />
            </main>
        </div>
    );
}

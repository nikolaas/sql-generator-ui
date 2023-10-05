import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Root } from './Root';
import { ErrorPage } from './pages/ErrorPage';
import { ProjectsPage, ProjectsPageLoader } from './pages/ProjectsPage';
import { ProjectPage, ProjectPageLoader } from './pages/ProjectPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            { path: 'projects', element: <ProjectsPage />, loader: ProjectsPageLoader },
            { path: 'projects/:id', element: <ProjectPage />, loader: ProjectPageLoader },
        ],
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;

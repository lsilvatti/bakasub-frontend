import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/templates';
import { ErrorBoundary } from '@/components/organisms';
import { APP_ROUTES } from '@/config/routes';
import { Suspense } from 'react';
import Loading from './pages/Loading';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            ...APP_ROUTES.map(route => ({
                path: route.path,
                element: <Suspense fallback={<Loading />}>{route.element}</Suspense>,
            }))
        ],
    },
]);
import { createBrowserRouter, createHashRouter } from 'react-router-dom';
import { RootLayout } from '@/components/templates';
import { ErrorBoundary } from '@/components/organisms';
import { APP_ROUTES } from '@/config/routes';
import { Suspense } from 'react';
import Loading from './pages/Loading';

const routerFactory = shouldUseHashRouter() ? createHashRouter : createBrowserRouter;

export const router = routerFactory([
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

function shouldUseHashRouter() {
    if (typeof window === 'undefined') {
        return false;
    }

    return !window.location.protocol.startsWith('http');
}
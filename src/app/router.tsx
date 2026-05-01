import { createBrowserRouter, createHashRouter } from 'react-router-dom';
import { RootLayout } from '@/components/templates';
import { ErrorBoundary } from '@/components/organisms';
import { APP_ROUTES } from '@/config/routes';
import { isSeparator } from '@/config/routeTypes';
import type { AppRoute } from '@/config/routeTypes';
import { Suspense } from 'react';
import Loading from './pages/Loading';

const routerFactory = shouldUseHashRouter() ? createHashRouter : createBrowserRouter;

export const router = routerFactory([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            ...APP_ROUTES.filter(r => !isSeparator(r)).map(route => {
                const { path, element } = route as AppRoute;
                return {
                    path,
                    element: <Suspense fallback={<Loading />}>{element}</Suspense>,
                };
            })
        ],
    },
]);

function shouldUseHashRouter() {
    if (typeof window === 'undefined') {
        return false;
    }

    return !window.location.protocol.startsWith('http');
}
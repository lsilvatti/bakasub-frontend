import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/templates';
import { ErrorBoundary } from '@/components/organisms';
import { APP_ROUTES } from '@/config/routes';
import { Suspense } from 'react';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            ...APP_ROUTES.map(route => ({
                path: route.path,
                element: <Suspense fallback={<div>Loading...</div>}>{route.element}</Suspense>,
            }))
        ],
    },
]);
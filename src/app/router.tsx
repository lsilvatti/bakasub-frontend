import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/templates';
import { ErrorBoundary } from '@/components/organisms';
import { APP_ROUTES, isSeparator } from '@/config/routes';
import { Suspense } from 'react';
import Loading from './pages/Loading';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <ErrorBoundary />,
        children: [
            ...APP_ROUTES.filter(r => !isSeparator(r)).map(route => ({
                path: (route as any).path,
                element: <Suspense fallback={<Loading />}>{(route as any).element}</Suspense>,
            }))
        ],
    },
]);
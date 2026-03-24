import { Typography } from '@/components/atoms';
import { useRouteError, isRouteErrorResponse, type ErrorResponse } from 'react-router-dom';
import styles from './ErrorBoundary.module.css';
import { GoBackButton } from '@/components/molecules';


function NotFound() {
    return (
           <div>
             <Typography variant='h1' as='h2'>
               404
            </Typography>
            <Typography variant='h2' as='h3'>
                Page Not Found
            </Typography>
           </div>
    )
}

function GenericError({ error }: { error: ErrorResponse }) {
    return (
        <div>
            <Typography variant='h1' as='h2'>
                {error.status}
            </Typography>
            <Typography variant='h2' as='h3'>
                {error.statusText}
            </Typography>
        </div>
    )
}

function DefaultError() {
    return (
           <div>
             <Typography variant='h1' as='h2'>
               Internal Server Error
            </Typography>
            <Typography variant='h2' as='h3'>
                An unexpected error has occurred.
            </Typography>
           </div>
    )
}

function ErrorLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.layout}>
            {children}
        </div>
    )
}

export function ErrorBoundary() {
    const ErrorComponent = () => {
        const error = useRouteError();

        if (isRouteErrorResponse(error)) {
            if (error.status === 404) {
                return <NotFound />
            }
            return <GenericError error={error} />
        }

        return <DefaultError />
    }

    return (
        <ErrorLayout>
            <ErrorComponent />
            <GoBackButton />
        </ErrorLayout>
    )
}
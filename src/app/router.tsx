import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from '@/components/layouts'
import { Home } from "./pages";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { 
                path: '/',
                element: <Home />
            }
        ]
    }
])
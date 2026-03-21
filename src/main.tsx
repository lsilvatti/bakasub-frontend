import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { router } from '@/app/router'

import { RouterProvider } from 'react-router-dom'

import './globals.css'
import ThemeProvider from './contexts/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
       <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)

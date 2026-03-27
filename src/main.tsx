import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/lib/i18n';

import { router } from '@/app/router'

import { RouterProvider } from 'react-router-dom'

import './globals.css'
import ThemeProvider from './contexts/ThemeContext'
import { ToastProvider } from './components/atoms/Toast';
import { QueryClientProvider } from '@tanstack/react-query';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider position='top-right'>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </ToastProvider>
  </StrictMode>,
)

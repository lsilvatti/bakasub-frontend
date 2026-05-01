
import { BookOpenText, HomeIcon, Languages, PackageOpen, Merge as MergeIcon, Bot, Settings } from 'lucide-react';
import { lazy, createElement } from 'react';
import type { RouteEntry } from './routeTypes';

export const APP_ROUTES: RouteEntry[] = [
  {
    path: '/',
    title: 'pages.home.title',
    element: createElement(lazy(() => import('@/app/pages/Home'))),
    showInSidebar: true,
    icon: HomeIcon
  },
  {
    path: '/extract',
    title: 'pages.extract.title',
    element: createElement(lazy(() => import('@/app/pages/Extract'))),
    showInSidebar: true,
    icon: PackageOpen,
    videoFeature: 'extract'
  },
  {
    path: '/translate',
    title: 'pages.translate.title',
    element: createElement(lazy(() => import('@/app/pages/Translate'))),
    showInSidebar: true,
    icon: Languages,
    requiredApiKeys: ['openrouter']
  },
  {
    path: '/merge',
    title: 'pages.merge.title',
    element: createElement(lazy(() => import('@/app/pages/Merge/Merge'))),
    showInSidebar: true,
    icon: MergeIcon,
    videoFeature: 'merge'
  },
  {
    path: '/models',
    title: 'pages.modelsPresetsLanguages.title',
    element: createElement(lazy(() => import('@/app/pages/ModelsPresetsLanguages'))),
    showInSidebar: true,
    icon: Bot
  },
  { type: 'separator' },
  {
    path: '/config',
    title: 'pages.settings.title',
    element: createElement(lazy(() => import('@/app/pages/Configs/Config'))),
    showInSidebar: true,
    icon: Settings,
  },
  {
    path: '/logs',
    title: 'pages.logs.title',
    element: createElement(lazy(() => import('@/app/pages/Logs'))),
    showInSidebar: true,
    icon: BookOpenText
  }
];
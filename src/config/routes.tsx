
import { BookOpenText, HomeIcon, Languages, PackageOpen, Merge as MergeIcon, Bot, Settings } from 'lucide-react';
import { lazy } from 'react';

const Home = lazy(() => import('@/app/pages/Home'));
const Logs = lazy(() => import('@/app/pages/Logs'));
const Merge = lazy(() => import('@/app/pages/Merge/Merge'));
const Translate = lazy(() => import('@/app/pages/Translate'));
const Config = lazy(() => import('@/app/pages/Configs/Config'));
const Extract = lazy(() => import('@/app/pages/Extract'));
const ModelsPresetsLanguages = lazy(() => import('@/app/pages/ModelsPresetsLanguages'));



export interface AppRoute {
  path: string;
  title: string;
  element: React.ReactNode;
  showInSidebar: boolean;
  icon?: React.ElementType;
}

export interface NavSeparator {
  type: 'separator';
}

export type RouteEntry = AppRoute | NavSeparator;

export function isSeparator(entry: RouteEntry): entry is NavSeparator {
  return 'type' in entry && entry.type === 'separator';
}

export const APP_ROUTES: RouteEntry[] = [
  {
    path: '/',
    title: 'pages.home.title',
    element: <Home />,
    showInSidebar: true,
    icon: HomeIcon
  },
  {
    path: '/extract',
    title: 'pages.extract.title',
    element: <Extract />,
    showInSidebar: true,
    icon: PackageOpen
  },
  {
    path: '/translate',
    title: 'pages.translate.title',
    element: <Translate />,
    showInSidebar: true,
    icon: Languages
  },
  {
    path: '/merge',
    title: 'pages.merge.title',
    element: <Merge />,
    showInSidebar: true,
    icon: MergeIcon
  },
  {
    path: '/models',
    title: 'pages.modelsPresetsLanguages.title',
    element: <ModelsPresetsLanguages />,
    showInSidebar: true,
    icon: Bot
  },
  { type: 'separator' },
  {
    path: '/config',
    title: 'pages.settings.title',
    element: <Config />,
    showInSidebar: true,
    icon: Settings,
  },
  {
    path: '/logs',
    title: 'pages.logs.title',
    element: <Logs />,
    showInSidebar: true,
    icon: BookOpenText
  }
];
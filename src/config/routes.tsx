
import { BookOpenText, HomeIcon, Languages, PackageOpen, Merge as MergeIcon } from 'lucide-react';
import { lazy } from 'react';

const Home = lazy(() => import('@/app/pages/Home'));
const Logs = lazy(() => import('@/app/pages/Logs'));
const Merge = lazy(() => import('@/app/pages/Merge/Merge'));
const Translate = lazy(() => import('@/app/pages/Translate/Translate'));
const Config = lazy(() => import('@/app/pages/Configs/Config'));
const Extract = lazy(() => import('@/app/pages/Extract'));



export interface AppRoute {
  path: string;
  title: string;
  element: React.ReactNode;
  showInSidebar: boolean;
  icon?: React.ElementType;
}

export const APP_ROUTES: AppRoute[] = [
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
    path: '/config',
    title: 'pages.settings.title',
    element: <Config />,
    showInSidebar: false,
  },
  {
    path: '/logs',
    title: 'pages.logs.title',
    element: <Logs />,
    showInSidebar: true,
    icon: BookOpenText
  }
];
import { useLocation } from "react-router-dom";
import { APP_ROUTES } from "@/config/routes";
import { isSeparator, type AppRoute } from "@/config/routeTypes";

export function useAppRoute() {
  const { pathname } = useLocation();

  const baseRoute = `/${pathname.split("/")[1]}`; 

  const navigableRoutes = APP_ROUTES.filter((entry): entry is AppRoute => !isSeparator(entry));

  const currentRoute = navigableRoutes.find(route => route.path === pathname || route.path === baseRoute);
  
  const title = currentRoute?.title || "BakaSub";

  const checkIsActive = (path: string) => baseRoute === path;

  return { title, checkIsActive };
}
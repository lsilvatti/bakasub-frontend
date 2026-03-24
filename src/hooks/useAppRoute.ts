// src/hooks/useAppRoute.ts
import { useLocation } from "react-router-dom";
import { APP_ROUTES } from "@/config/routes";

export function useAppRoute() {
  const { pathname } = useLocation();

  const baseRoute = `/${pathname.split("/")[1]}`; 

  const currentRoute = APP_ROUTES.find(r => r.path === pathname || r.path === baseRoute);
  
  const title = currentRoute?.title || "BakaSub";

  const checkIsActive = (path: string) => baseRoute === path;

  return { title, checkIsActive };
}
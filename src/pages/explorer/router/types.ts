import { LucideIcon } from "lucide-react";
import { RouteObject } from "react-router";

type ExplorerRouteAction = {
  id: string;
};

type BreadcrumbItem = {
  title: string;
  path: string;
  icon?: LucideIcon;
  isActive?: boolean;
};

type ExplorerRoute<T> = {
  key: string;
  title: string;
  icon: LucideIcon | string;
  isActive?: boolean;
  child?: ExplorerRoute<T>[];
  path: T;
  breadcrumb?: {
    title: string;
    showInBreadcrumb?: boolean;
    parent?: string; // Path to parent route
  };

  onClick?: (action: ExplorerRouteAction) => void;
} & RouteObject;

export type { ExplorerRoute, ExplorerRouteAction, BreadcrumbItem };

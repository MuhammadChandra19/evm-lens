import { LucideIcon } from 'lucide-react';
import { RouteObject } from 'react-router';

type ExplorerRouteAction = {
  id: string;
};

type ExplorerRoute<T> = {
  key: string
  title: string;
  icon: LucideIcon | string;
  isActive?: boolean;
  child?: ExplorerRoute<T>[];
  path: T;

  onClick?: (action: ExplorerRouteAction) => void;
} & RouteObject;


export type { ExplorerRoute, ExplorerRouteAction };

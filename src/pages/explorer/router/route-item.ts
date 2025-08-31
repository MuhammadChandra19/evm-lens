import { Landmark, UserSearch, Home } from 'lucide-react';
import { ExplorerRoute } from './types';

const EXPLORER_ROUTE_PATH = {
  EXPLORER: '/explorer',
  TRANSACTION: '/explorer/transactions',
  ACCOUNTS: '/explorer/accounts',
} as const;

type ExplorerRouteKeyValues = (typeof EXPLORER_ROUTE_PATH)[keyof typeof EXPLORER_ROUTE_PATH];

const ROUTES: ExplorerRoute<ExplorerRouteKeyValues>[] = [
  {
    key: EXPLORER_ROUTE_PATH.EXPLORER,
    icon: Home,
    path: EXPLORER_ROUTE_PATH.EXPLORER,
    title: 'Explorer',
    breadcrumb: {
      title: 'Explorer',
      showInBreadcrumb: true,
    },
  },
  {
    key: EXPLORER_ROUTE_PATH.TRANSACTION,
    icon: Landmark,
    path: EXPLORER_ROUTE_PATH.TRANSACTION,
    title: 'Transactions',
    breadcrumb: {
      title: 'Transactions',
      showInBreadcrumb: true,
      parent: EXPLORER_ROUTE_PATH.EXPLORER,
    },
  },
  {
    key: EXPLORER_ROUTE_PATH.ACCOUNTS,
    icon: UserSearch,
    path: EXPLORER_ROUTE_PATH.ACCOUNTS,
    title: 'Accounts',
    breadcrumb: {
      title: 'Accounts',
      showInBreadcrumb: true,
      parent: EXPLORER_ROUTE_PATH.EXPLORER,
    },
  },
];

export { EXPLORER_ROUTE_PATH, ROUTES };
export type { ExplorerRouteKeyValues };

import { Landmark, UserSearch } from 'lucide-react'
import { ExplorerRoute } from './types'

const EXPLORER_ROUTE_PATH = {
  TRANSACTION: "/transaction",
  ACCOUNTS: "/accounts"
} as const

type ExplorerRouteKeyValues = (typeof EXPLORER_ROUTE_PATH)[keyof typeof EXPLORER_ROUTE_PATH]


const ROUTES: ExplorerRoute<ExplorerRouteKeyValues>[] = [
  {
    key: EXPLORER_ROUTE_PATH.TRANSACTION,
    icon: Landmark,
    path: EXPLORER_ROUTE_PATH.TRANSACTION,
    title: "Transactions",
  },
  {
    key: EXPLORER_ROUTE_PATH.ACCOUNTS,
    icon: UserSearch,
    path: EXPLORER_ROUTE_PATH.ACCOUNTS,
    title: "Accounts",
  }
]



export { EXPLORER_ROUTE_PATH, ROUTES }
export type { ExplorerRouteKeyValues }
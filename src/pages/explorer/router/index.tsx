import { RouteObject } from "react-router";
import Layout from "../components/layout";
import Explorer from "..";
import TransactionsPage from "../transactions";
import AccountsPage from "../accounts";
import AccountDetailPage from "../accounts/[id]";

const explorerRoute: RouteObject = {
  path: "explorer",
  element: <Layout />,
  children: [
    {
      index: true,
      Component: Explorer,
    },
    {
      path: "transactions",
      Component: TransactionsPage,
    },
    {
      path: "accounts",
      Component: AccountsPage,
    },
    {
      path: "accounts/:id",
      Component: AccountDetailPage,
    },
  ],
};

export default explorerRoute;

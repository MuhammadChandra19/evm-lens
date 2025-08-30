import Landing from "@/pages/landing";
import CreateContract from "@/pages/create-contract";
import Playground from "@/pages/playground/[id]";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from '@/pages/explorer/components/layout';
import PlaygroundProvider from '@/providers/Playground';

const RouterWrapper = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      Component: Landing,
    },
    {
      path: "/create-contract",
      Component: CreateContract,
    },
    {
      path: "/playground/:id",
      Component: () => (
        <PlaygroundProvider>
          <Playground />
        </PlaygroundProvider>
      ),
    },
    {
      path: "/explorer",
      element: (
        <PlaygroundProvider>
          <Layout />
        </PlaygroundProvider>
      ),
      children: []
    },
  ]);

  return <RouterProvider router={router} />;
};

export default RouterWrapper;

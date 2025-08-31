import Landing from "@/pages/landing";
import CreateContract from "@/pages/create-contract";
import Playground from "@/pages/playground/[id]";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import PlaygroundProvider from "@/providers/Playground";
import explorerRoute from "@/pages/explorer/router";

// Root layout component that provides context to all routes
const RootLayout = () => (
  <PlaygroundProvider>
    <Outlet />
  </PlaygroundProvider>
);

const RouterWrapper = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          index: true,
          Component: Landing,
        },
        {
          path: "create-contract",
          Component: CreateContract,
        },
        {
          path: "playground/:id",
          Component: Playground,
        },
        explorerRoute,
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default RouterWrapper;

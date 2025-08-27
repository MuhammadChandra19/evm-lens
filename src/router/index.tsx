import CreateContract from '@/pages/create-contract';
import Playground from '@/pages/playground';
import PlaygroundProvider from '@/providers/Playground';
import { createBrowserRouter, RouterProvider } from 'react-router';

const RouterWrapper = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      Component: CreateContract,
    },
    {
      path: "/playground/:id",
      Component: () => (
        <PlaygroundProvider>
          <Playground />
        </PlaygroundProvider>
      )
    }
  ]);

  return <RouterProvider router={router} />
}

export default RouterWrapper
import { RouteObject } from 'react-router';
import Layout from '../components/layout';
import Explorer from '..';

const explorerRoute: RouteObject = {
  path: "explorer",
  element: <Layout />,
  children: [
    {
      index: true,
      Component: Explorer,
    },
  ]
}

export default explorerRoute;

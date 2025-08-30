import { RouteObject } from 'react-router';
import Layout from '../components/layout';

const explorerRoute: RouteObject = {
  path: "/explorer",
  element: <Layout />,
  children: []
}

export default explorerRoute;

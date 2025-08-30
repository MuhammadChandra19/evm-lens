import { SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <SidebarProvider></SidebarProvider>
  )
}

export default Layout;

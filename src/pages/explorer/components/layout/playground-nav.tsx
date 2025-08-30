import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { SquareFunction } from "lucide-react";
import SideBarNav from './sidebar-nav';
import useLayout from './use-layout';
type Props = {
  sidebar?: React.ComponentProps<typeof Sidebar>;
};
const PlaygroundNav = ({ sidebar }: Props) => {
  const { menuList } = useLayout()
  return (
    <Sidebar collapsible="icon" {...sidebar}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton size="lg" asChild>
            <div>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <SquareFunction className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">EVM Lens</span>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SideBarNav items={menuList}/>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
};

export default PlaygroundNav;

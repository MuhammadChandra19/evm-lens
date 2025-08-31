import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ExplorerRoute } from "../../router/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { useMemo } from "react";
import { ExplorerRouteKeyValues } from "../../router/route-item";

type Props = {
  items: ExplorerRoute<string | ExplorerRouteKeyValues>[];
};
const SideBarNav = ({ items }: Props) => {
  const itemsWithChild = useMemo(() => items.filter((v) => v.child), [items]);
  const itemWithoutChild = useMemo(
    () => items.filter((v) => !v.child),
    [items],
  );
  return (
    <SidebarContent>
      <SidebarMenu className="p-2">
        {itemWithoutChild.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={item.isActive}>
              <Link to={item.path} className="flex gap-2">
                {typeof item.icon === "string" ? (
                  <div className="w-4 h-4 flex items-center justify-center text-xs font-medium">
                    {item.icon}
                  </div>
                ) : (
                  <item.icon className="w-4 h-4" />
                )}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      {itemsWithChild.map((item) => (
        <Collapsible
          key={item.title}
          title={item.title}
          defaultOpen
          className="group/collapsible"
        >
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
            >
              <CollapsibleTrigger>
                <item.icon className="w-4 h-4 mr-2" />
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item?.child?.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <Link to={item.path} className="flex gap-2">
                          {typeof item.icon === "string" ? (
                            <div className="w-4 h-4 flex items-center justify-center text-xs font-medium">
                              {item.icon.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <item.icon className="w-4 h-4" />
                          )}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </SidebarContent>
  );
};

export default SideBarNav;

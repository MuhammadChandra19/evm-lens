import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar'
import { ChevronRight } from 'lucide-react'
import { MenuItem } from './types'
type Props = {
  items: MenuItem[]
}
const FunctionNav = ({ items }: Props) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Function List</SidebarGroupLabel>
      <SidebarMenu>
        {
          items.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
            >
              <SidebarMenuItem className="cursor-pointer">
                <SidebarMenuButton asChild tooltip={item.title}>
                  <div>
                    <item.icon />
                    <span>{item.title}</span>
                  </div>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight className="cursor-pointer"/>
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {
                          item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <div>
                                  <span>{subItem.title}</span>
                                </div>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))
                        }
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ): null}
              </SidebarMenuItem>
            </Collapsible>
          ))
        }
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default FunctionNav;

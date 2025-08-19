import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton } from '@/components/ui/sidebar'
import { SquareFunction } from 'lucide-react'
import React from 'react'
import useFunctionList from './use-function-list'
import FunctionNav from './function-nav'

type Props = {
  
  sidebar?: React.ComponentProps<typeof Sidebar>
}

const FunctionList = ({ sidebar }: Props) => {
  // TODO: sidebar header to switch project ref: https://ui.shadcn.com/blocks/sidebar#sidebar-07
  const { functions } = useFunctionList()
  return (
    <Sidebar collapsible="icon" { ...sidebar}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton size="lg" asChild>
            <div>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <SquareFunction className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Playground</span>
                <span className="truncate text-xs">Function List</span>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <FunctionNav items={functions}/>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  )

}

export default FunctionList;

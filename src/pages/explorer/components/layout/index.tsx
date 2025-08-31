import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Outlet, useNavigate } from "react-router";
import PlaygroundNav from "./playground-nav";
import useLayout from "./use-layout";

const Layout = () => {
  const navigate = useNavigate();
  const { breadcrumbItems } = useLayout();

  return (
    <SidebarProvider>
      <PlaygroundNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <div key={item.path} className="flex items-center">
                    {index > 0 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                    <BreadcrumbItem className="hidden md:block">
                      {item.isActive ? (
                        <BreadcrumbPage className="flex items-center gap-1">
                          {item.icon && <item.icon className="h-4 w-4" />}
                          {item.title}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          onClick={() => navigate(item.path)}
                          className="flex items-center gap-1 cursor-pointer hover:text-foreground"
                        >
                          {item.icon && <item.icon className="h-4 w-4" />}
                          {item.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 flex flex-col  gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;

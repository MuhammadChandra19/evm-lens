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
import FunctionList from "./function-list";
import { ReactNode } from "react";
import Intro from "./intro";
import BalanceForm from "../balance-form";
import NewAccountForm from "../new-account-form";
import { useNavigate } from "react-router";
import { useCurrentPlayground } from "../../use-current-playground";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const navigate = useNavigate();
  const { getConfig, accounts, activeFunction } = useCurrentPlayground();
  const config = getConfig();

  // Guard against undefined config
  if (!config) {
    return null; // or a loading state
  }

  const { ownerAddress } = config;
  return (
    <SidebarProvider>
      <FunctionList />
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink onClick={() => navigate("/explorer")}>
                    Explorer
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Playground</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between gap-4 p-3 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <NewAccountForm />
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Owner:</span>
                  <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">
                    {ownerAddress.toString().slice(0, 6)}...
                    {ownerAddress.toString().slice(-4)}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Balance:</span>
                  <span className="text-blue-600 font-semibold">
                    {Number(
                      accounts.get(ownerAddress.toString())?.balance || 0n,
                    ) / 1e18}{" "}
                    ETH
                  </span>
                </div>
              </div>
            </div>
            <BalanceForm />
          </div>
          <div className="flex-1 flex flex-col">
            {!activeFunction ? <Intro /> : children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;

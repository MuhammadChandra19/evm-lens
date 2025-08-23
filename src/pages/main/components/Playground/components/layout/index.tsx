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
import FunctionList from "../function-list";
import { ReactNode } from "react";
import usePlayground from "../../use-playground";
import Intro from "../intro";
import BalanceForm from '../balance-form';
import NewAccountForm from '../new-account-form';

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const { activeFunction, ownerAccount } = usePlayground();
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
                  <BreadcrumbLink href="#">Contract creation</BreadcrumbLink>
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
          <div className="flex justify-between gap-4">
            <NewAccountForm />            
            <div className="w-full p-4 flex1 flex gap-2 justify-between rounded-xl border shadow-sm items-center bg-gradient-to-bl from-slate-50 to-blue-50">
              <span>
                <div className="font-semibold">Owner Address</div>
                <div className="text-red-400 font-light text-sm">
                  {ownerAccount.address.toString()}
                </div>
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <div className="font-semibold">Balance: </div>
                  <div className="font-light text-blue-500 text-sm">
                    {Number(ownerAccount?.balance || 0n) / 1e18} ETH
                  </div>
                </div>
                <BalanceForm />
              </div>
            </div>
          </div>
          {!activeFunction ? <Intro /> : children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;

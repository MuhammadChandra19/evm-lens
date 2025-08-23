import { AbiType } from "@/service/evm-analyzer/abi/types";
import { LucideIcon } from "lucide-react";

type MenuAction = {
  id: string;
};

type MenuItem = {
  title: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: MenuItemChild[];

  onClick?: (action: MenuAction) => void;
};

type MenuItemChild = {
  id: string;
  title: string;
  onClick?: (action: MenuAction) => void;
  type: AbiType;
};

export type { MenuItem, MenuItemChild, MenuAction };

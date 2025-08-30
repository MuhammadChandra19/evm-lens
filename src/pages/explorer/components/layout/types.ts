import { LucideIcon } from 'lucide-react';

type NavAction = {
  id: string;
};

type NavItem = {
  title: string;
  icon: LucideIcon;
  isActive?: boolean;
  child?: NavItemChild[];
  path: string;

  onClick?: (action: NavAction) => void;
};

type NavItemChild = {
  id: string;
  title: string;
  isActive?: boolean;
  path: string;
  icon: LucideIcon | string;
  onClick?: (action: NavAction) => void;
};

export type { NavItem, NavAction, NavItemChild };

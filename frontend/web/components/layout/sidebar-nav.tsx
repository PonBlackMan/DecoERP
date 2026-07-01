"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import {
  LayoutDashboard, Kanban, FileText, HardHat, FileDiff,
  ShoppingCart, Banknote, Users, LayoutTemplate, Building2,
  HandCoins, AlertCircle,
} from "lucide-react";

const iconMap = {
  LayoutDashboard, Kanban, FileText, HardHat, FileDiff,
  ShoppingCart, Banknote, Users, LayoutTemplate, Building2,
  HandCoins, AlertCircle,
} as Record<string, React.ComponentType<{ className?: string }>>;

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map((item) => {
        const Icon = iconMap[item.icon];
        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

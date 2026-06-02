"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings,
  ArrowLeft
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Products",
      icon: Package,
      href: "/admin/products",
      active: pathname === "/admin/products",
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/admin/orders",
      active: pathname === "/admin/orders",
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      active: pathname === "/admin/users",
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card border-r">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14 hover:opacity-80 transition">
          <ArrowLeft className="h-5 w-5 mr-3 text-muted-foreground" />
          <h1 className="text-sm font-medium text-muted-foreground">Exit Admin</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-primary/10 rounded-lg transition",
                route.active ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-primary" : "text-muted-foreground")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t">
        <Link
          href="/admin/settings"
          className={cn(
            "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-primary/10 rounded-lg transition",
            pathname === "/admin/settings" ? "text-primary bg-primary/10" : "text-muted-foreground"
          )}
        >
          <div className="flex items-center flex-1">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </div>
        </Link>
      </div>
    </div>
  );
}

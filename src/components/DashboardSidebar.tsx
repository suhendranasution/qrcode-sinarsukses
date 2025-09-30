"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAdmin, canAccess } from "@/lib/auth";
import { useSidebar } from "@/contexts/SidebarContext";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: 'dashboard'
  },
  {
    name: "Manajemen Brand",
    href: "/dashboard/brands",
    icon: Package,
    permission: 'brands'
  },
  {
    name: "Manajemen Sertifikat",
    href: "/dashboard/certificates",
    icon: FileText,
    permission: 'certificates'
  },
  {
    name: "Manajemen Pengguna",
    href: "/dashboard/users",
    icon: Settings,
    permission: 'users'
  },
];

export function DashboardSidebar({ className }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useSidebar();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Check permissions on client side only
    const permissions: Record<string, boolean> = {};
    navigation.forEach(item => {
      permissions[item.permission] = canAccess(item.permission);
    });
    setHasAccess(permissions);
  }, []);

  return (
    <div className={cn(
      "border-r bg-gray-50 dark:bg-gray-900 transition-all duration-300 flex-shrink-0",
      sidebarCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex flex-col h-screen min-h-screen sticky top-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Admin</h1>
                <p className="text-xs text-muted-foreground">Certificate System</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                           (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const hasPermission = hasAccess[item.permission];

              // Don't render if no permission (but only after permissions are loaded)
              if (Object.keys(hasAccess).length > 0 && !hasPermission) return null;

              // Show loading state if permissions aren't loaded yet
              if (Object.keys(hasAccess).length === 0) {
                return (
                  <li key={item.name}>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                      <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                      {!sidebarCollapsed && <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>}
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      sidebarCollapsed
                        ? "justify-center"
                        : "justify-start",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          {/* Theme Toggle */}
          <div className={cn(
            "transition-all duration-300",
            sidebarCollapsed
              ? "flex justify-center"
              : "flex justify-start"
          )}>
            <ThemeToggle />
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            className={cn(
              "w-full transition-all duration-300",
              sidebarCollapsed
                ? "justify-center"
                : "justify-start"
            )}
            onClick={logoutAdmin}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
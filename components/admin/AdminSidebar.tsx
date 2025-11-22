"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Menu,
  X,
  Home,
  Settings,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/providers/sidebar-provider";
import DarkModeToggle from "@/components/DarkModeToggle";
import { UserButton } from "@clerk/nextjs";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Students",
    href: "/admin/students",
    icon: Users,
  },
  {
    name: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    name: "Enrollments",
    href: "/admin/enrollments",
    icon: GraduationCap,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Studio",
    href: "/studio",
    icon: Settings,
  },
  {
    name: "Back to Site",
    href: "/",
    icon: Home,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useSidebar();

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={toggle}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link
              href="/admin"
              className="flex items-center gap-2"
              onClick={close}
            >
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                Admin Panel
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={close}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1">
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <DarkModeToggle />
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


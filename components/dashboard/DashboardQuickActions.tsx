import Link from "next/link";
import { BookOpen, Compass, LineChart } from "lucide-react";

const actions = [
  {
    href: "/",
    title: "Browse catalog",
    description: "Discover new courses",
    icon: Compass,
  },
  {
    href: "/dashboard/my-courses",
    title: "My courses",
    description: "All enrollments in one place",
    icon: BookOpen,
  },
  {
    href: "/dashboard/analytics",
    title: "Your analytics",
    description: "Study time & progress",
    icon: LineChart,
  },
] as const;

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="group flex gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50 hover:border-primary/30"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <a.icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
              {a.title}
            </p>
            <p className="text-xs text-muted-foreground">{a.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

import { cn } from "../../lib/utils";

type DashboardPageShellProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function DashboardPageShell({
  title,
  description,
  actions,
  children,
  className,
}: DashboardPageShellProps) {
  return (
    <section className={cn("mx-auto max-w-[1600px] space-y-6", className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div className="dashboard-panel">{children}</div>
    </section>
  );
}

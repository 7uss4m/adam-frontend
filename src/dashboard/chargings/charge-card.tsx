import { Coins, Mail, User, UserCog } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/utils";
import {
  chargeStatusLabel,
  chargeTypeLabel,
  DashboardCharge,
  fmtCoins,
  formatChargeDate,
} from "./charge-utils";

function StatusBadge({ done }: { done: boolean }) {
  const [t] = useTranslation("global");
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        done
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
      )}
    >
      {chargeStatusLabel(done, t)}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const [t] = useTranslation("global");
  const isOnline = type === "online";
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
        isOnline
          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
          : "bg-violet-500/15 text-violet-600 dark:text-violet-400"
      )}
    >
      {chargeTypeLabel(type, t)}
    </span>
  );
}

export default function ChargeCard({ charge }: { charge: DashboardCharge }) {
  const [t, i18n] = useTranslation("global");
  const isNegative = charge.coins < 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      {!charge.done && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
      )}

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">#{charge.id}</span>
              <TypeBadge type={charge.type} />
              <StatusBadge done={charge.done} />
            </div>
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-2xl font-black tabular-nums",
                isNegative ? "text-destructive" : "text-foreground"
              )}
            >
              <Coins className="h-5 w-5 shrink-0 text-primary" />
              <span dir="ltr">
                {isNegative ? "" : charge.coins > 0 ? "+" : ""}
                {fmtCoins(charge.coins)}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
              <User className="h-3 w-3" />
              {t("users")}
            </p>
            <p className="mt-0.5 truncate font-bold text-foreground">
              {charge.user?.user_name || t("deleted")}
            </p>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              {charge.user?.email || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
              <UserCog className="h-3 w-3" />
              {t("charges_charged_by")}
            </p>
            <p className="mt-0.5 truncate font-bold text-foreground">
              {charge.charged_by?.user_name ||
                charge.charged_by?.email ||
                (charge.type !== "online" ? t("charges_admin_legacy") : "—")}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatChargeDate(charge.created_at, i18n.language)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

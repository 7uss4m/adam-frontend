import { Link } from "react-router-dom";
import { Plus, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { User } from "../../types/types";
import { cn } from "../../lib/utils";

type BalanceCardProps = {
  user: User;
  hidden?: boolean;
  onToggleHidden?: () => void;
};

export default function BalanceCard({ user, hidden, onToggleHidden }: BalanceCardProps) {
  const [t] = useTranslation("global");
  const balance = Number(user.balance ?? 0);

  return (
    <div className="relative mx-auto w-full max-w-md sm:max-w-lg">
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.75rem] shadow-2xl",
          "min-h-[210px] sm:min-h-[230px]",
          "shadow-primary/20 dark:shadow-purple-900/30"
        )}
      >
        {/* Gradient — works in light & dark */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-600 to-cyan-600 dark:from-[#1a0533] dark:via-[#0f1b4c] dark:to-[#062a4a]" />
        <div className="absolute -end-16 -top-10 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-400/25" />
        <div className="absolute -bottom-20 start-0 h-48 w-72 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-600/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,255,255,0.25),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_70%_20%,rgba(34,211,238,0.35),transparent_55%)]" />

        <div className="relative flex h-full min-h-[210px] flex-col justify-between p-6 sm:min-h-[230px] sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              {user.level?.name && (
                <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/95 backdrop-blur-sm">
                  {user.level.name}
                  {user.level.profit > 0 && ` · -${user.level.profit}%`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onToggleHidden && (
                <button
                  type="button"
                  onClick={onToggleHidden}
                  className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                  aria-label={hidden ? "Show balance" : "Hide balance"}
                >
                  {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
              <p className="text-sm font-semibold text-white/95">
                {t("balance") || "الرصيد"}
              </p>
            </div>
          </div>

          <div className="py-2">
            <p className="font-orbitron text-4xl font-black tracking-tight text-white sm:text-5xl">
              {hidden ? "••••••" : `$ ${balance.toFixed(2)}`}
            </p>
            {!hidden && (user.points > 0 || user.bonus > 0) && (
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/80">
                {user.points > 0 && (
                  <span className="rounded-md bg-white/15 px-2 py-0.5">
                    {user.points} {t("points") || "نقطة"}
                  </span>
                )}
                {user.bonus > 0 && (
                  <span className="rounded-md bg-white/15 px-2 py-0.5">
                    +{user.bonus}% {t("bonus") || "bonus"}
                  </span>
                )}
              </div>
            )}
          </div>

          <Link
            to="/add-balance"
            className="group inline-flex w-fit flex-col items-center gap-1.5 transition-transform hover:scale-105"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg shadow-black/10">
              <Plus className="h-6 w-6 text-violet-700 stroke-[3] dark:text-[#0a0e14]" />
            </div>
            <span className="text-[11px] font-semibold text-white/90">
              {t("charge_wallet") || "شحن المحفظة"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

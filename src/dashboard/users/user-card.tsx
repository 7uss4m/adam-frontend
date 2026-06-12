import { Link } from "react-router-dom";
import { UseQueryResult } from "@tanstack/react-query";
import { BadgeCheck, Mail, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import moment from "moment";

import type { User } from "../../types/types";
import { Badge } from "../../components/ui/badge";
import UserRowActions from "./user-row-actions";
import { fmtUsd, getLevelColor, userInitials } from "./user-utils";
import { cn } from "../../lib/utils";

type UserCardProps = {
  user: User;
  query: UseQueryResult;
};

export default function UserCard({ user, query }: UserCardProps) {
  const [t, i18n] = useTranslation("global");
  const color = getLevelColor(user.level?.name);
  const debit = Number(user.debit || 0);
  const verified = (user as User & { verify_admin?: boolean }).verify_admin;
  const createdAt = (user as User & { created_at?: string }).created_at;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <div
        className="pointer-events-none absolute -end-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-70"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
          >
            {userInitials(user.user_name, user.email)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground">{user.user_name}</p>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              {user.email}
            </p>
          </div>
        </div>
        <UserRowActions user={user} query={query} />
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">
            {t("balance")}
          </p>
          <p className="font-orbitron text-lg font-black text-emerald-400">
            {fmtUsd(Number(user.balance))}
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">
            {t("debit_balance")}
          </p>
          <p
            className={cn(
              "font-orbitron text-lg font-black",
              debit > 0 ? "text-rose-400" : "text-muted-foreground"
            )}
          >
            {debit > 0 ? fmtUsd(debit) : "—"}
          </p>
        </div>
      </div>

      <div className="relative mt-3 flex flex-wrap items-center gap-2">
        {user.level?.name && (
          <Badge
            variant="outline"
            className="border-0 font-bold capitalize"
            style={{
              backgroundColor: `${color}22`,
              color,
            }}
          >
            {t(user.level.name.toLowerCase())}
          </Badge>
        )}
        {verified ? (
          <Badge className="gap-1 bg-emerald-500/15 text-emerald-400">
            <BadgeCheck className="h-3 w-3" />
            {t("verified") || "موثّق"}
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <ShieldAlert className="h-3 w-3" />
            {t("pending")}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          {t("bonus")}: {Number(user.bonus).toFixed(2)}
        </span>
      </div>

      {createdAt && (
        <p className="relative mt-3 text-[11px] text-muted-foreground">
          {t("joined") || "انضم"}:{" "}
          {moment(createdAt).locale(i18n.language).format("D MMM YYYY")}
        </p>
      )}

      <div className="relative mt-4 flex gap-2 border-t border-border/40 pt-3">
        <Link
          to={`${user.id}/orders`}
          className="flex-1 rounded-lg border border-border/50 py-2 text-center text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          {t("orders")}
        </Link>
        <Link
          to={`${user.id}/debits`}
          className="flex-1 rounded-lg border border-border/50 py-2 text-center text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          {t("debts")}
        </Link>
      </div>
    </div>
  );
}

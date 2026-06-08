/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Copy, Gift, Users, History, ArrowLeft, Loader2 } from "lucide-react";

import getUser from "../api/getUser";
import type { User } from "../types/types";

import Spinner from "../components/Spinner";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "../components/ui/use-toast";

import { useReferralPointsHistory } from "./hooks";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { Pagination, PointsHistory } from "../api/getReferralHistory";
import PaginationBar from "./pagination";

function safeInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : fallback;
}

export default function ReferralPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation("global");

  const page = safeInt(searchParams.get("page"), 1);
  const limit = safeInt(searchParams.get("limit"), 10);

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
  };

  const handlePageSizeChange = (newLimit: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("limit", String(newLimit));
    next.set("page", "1");
    setSearchParams(next);
  };

  const historyQuery = useReferralPointsHistory(page, limit);

  const userQuery = useQuery<User, Error>({
    queryKey: ["user", "id"],
    queryFn: async () => {
      const response = await getUser(localStorage.getItem("token") as string);
      return response.data.result as User;
    },
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const invitedCount = userQuery.data?.invited_users?.length ?? 0;

  const invitedUsers = useMemo(() => {
    return userQuery.data?.invited_users ?? [];
  }, [userQuery.data?.invited_users]);

  const copyText = (val?: string) => {
    if (!val) return;
    window.navigator.clipboard.writeText(val);
    toast({ title: t("copied") });
  };

  if (userQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto flex items-center justify-center py-32">
          <Spinner />
        </div>
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Failed to load user.
          </div>
        </div>
      </div>
    );
  }

  const user = userQuery.data;

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <main className="container min-h-svh mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back_home") || "العودة للرئيسية"}
          </Link>

          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {t("referral") || "Referral"}
            </span>
          </div>
        </div>

        {/* Top cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Invite code */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{t("invite_code")}</h2>
                <p className="text-xs text-muted-foreground">{t("invite_code_hint") || ""}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary p-4">
              <p className="text-xs text-muted-foreground">{t("invite_code")}</p>
              <p className="mt-1 break-all font-mono text-sm text-foreground">
                {user?.invite_code ?? "-"}
              </p>

              <Button
                type="button"
                variant="secondary"
                className="mt-3 w-full"
                onClick={() => copyText(user?.invite_code)}
                disabled={!user?.invite_code}
              >
                <Copy className="me-2 h-4 w-4" />
                {t("copy") || "Copy"}
              </Button>
            </div>
          </div>

          {/* Points */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Badge className="h-5 w-5 rounded-full p-0" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{t("points_earned")}</h2>
                <p className="text-xs text-muted-foreground">{t("points_hint") || ""}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary p-4">
              <p className="text-xs text-muted-foreground">{t("total_points") || t("points_earned")}</p>
              <p className="mt-1 font-orbitron text-3xl font-black text-primary">
                {Number(user?.points || 0)}
              </p>
            </div>
          </div>

          {/* Invited count */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {t("invited_users")}
                </h2>
                <p className="text-xs text-muted-foreground">{t("invited_hint") || ""}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary p-4">
              <p className="text-xs text-muted-foreground">{t("total")}</p>
              <p className="mt-1 font-orbitron text-3xl font-black text-foreground">
                {invitedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Invited users list */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">
                {t("invited_users")}
              </h3>
            </div>
            <Badge variant="secondary" className="text-foreground">
              {invitedCount}
            </Badge>
          </div>

          {invitedCount === 0 ? (
            <div className="rounded-xl border border-border bg-secondary py-12 text-center text-sm text-muted-foreground">
              {t("no_invited_users") || "لا يوجد مستخدمون تمت دعوتهم بعد"}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {invitedUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{u.user_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">{t("history")}</h3>
          </div>

          {invitedCount === 0 ? (
            <div className="rounded-xl border border-border bg-secondary py-10 text-center text-sm text-muted-foreground">
              0 {t("user")}
            </div>
          ) : historyQuery.isError ? (
            <div className="rounded-xl border border-border bg-secondary py-10 text-center text-sm text-muted-foreground">
              Failed to load referral history.
            </div>
          ) : historyQuery.isLoading && !historyQuery.data ? (
            <div className="flex min-h-[120px] items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-secondary p-3">
                <DataTable
                  columns={columns}
                  data={historyQuery.data?.result.pointsHistory as PointsHistory[]}
                />

                <div className="mt-3">
                  <PaginationBar
                    pagination={historyQuery.data?.result.pagination as Pagination}
                    isLoading={historyQuery.isFetching}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>

                {historyQuery.isFetching ? (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("loading") || "Loading..."}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
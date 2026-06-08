/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import { Link, redirect } from "react-router-dom";
import type { AxiosError } from "axios";

import getUser from "../api/getUser";
import patchClientIp from "../api/patchClientIp";
import getClientInfo from "../api/getClientsInfo";

import type { User } from "../types/types";

import Spinner from "../components/Spinner";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../components/ui/use-toast";

import { ArrowLeft, Copy, Settings, Loader2, ShieldCheck, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ApiPage() {
  const [t, i18n] = useTranslation("global");
  const ipRef = useRef<HTMLTextAreaElement>(null);

  const userQuery = useQuery<User, Error>({
    queryKey: ["user", "id"],
    queryFn: async () => {
      const response = await getUser(localStorage.getItem("token") as string);
      const user = response.data.result as User;

      // ⚠️ keep same behavior
      if (!user?.client) redirect("/");

      return user;
    },
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const client = userQuery.data?.client;

  const defaultIps = useMemo(() => {
    const raw = client?.allowed_ips || "";
    return raw ? raw.split(",").join("\n") : "";
  }, [client?.allowed_ips]);

  const saveIpsMutation = useMutation({
    mutationFn: async () => {
      const lines = (ipRef.current?.value || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

      return patchClientIp(
        { allowed_ips: lines.join(",") },
        localStorage.getItem("token") as string
      );
    },
    onSuccess: (res) => {
      toast({
        title: t("done"),
        description: res.data.message,
      });
    },
    onError: (error: AxiosError | Error) => {
      const msg =
        (error as AxiosError)?.response?.data &&
        typeof (error as any).response?.data?.error === "string"
          ? (error as any).response.data.error
          : error.message;

      toast({
        title: t("error"),
        description: msg,
        variant: "destructive",
      });
    },
  });

  const apiInfoQuery = useQuery({
    queryKey: ["api", client?.api_key],
    queryFn: async () => {
      const res = await getClientInfo(
        localStorage.getItem("token") as string,
        client?.api_key as string
      );
      return res.data.client as {
        docs_url: string;
        base_url: string;
      };
    },
    enabled: !!client?.api_key,
    refetchOnWindowFocus: false,
  });

  const copy = (value?: string) => {
    if (!value) return;
    window.navigator.clipboard.writeText(value);
    toast({ title: t("copied") });
  };

  if (userQuery.isLoading) {
    return (
      <section className="min-h-svh flex justify-center items-center">
        <Spinner />
      </section>
    );
  }

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <main className="container min-h-svh mx-auto px-4 py-8">
        {/* header (V2 style) */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back_home") || "العودة للرئيسية"}
          </Link>

          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">API</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* API TOKEN */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{t("profile_info")}</h2>
                <p className="text-xs text-muted-foreground">{t("api_token_hint")}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">API Token</p>
                  <p className="mt-1 break-all font-mono text-sm text-foreground">
                    {client?.api_key || "-"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0"
                  onClick={() => copy(client?.api_key)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* IP ACCESS */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-foreground">{t("ip_access")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{t("ip_each_line")}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveIpsMutation.mutate();
              }}
              className="space-y-4"
            >
              <Textarea
                ref={ipRef}
                defaultValue={defaultIps}
                placeholder={t("ip_placeholder") || "1.1.1.1\n2.2.2.2"}
                className="min-h-40 bg-secondary"
              />

              <Button type="submit" disabled={saveIpsMutation.isPending} className="w-full">
                {saveIpsMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("saving") || "جارٍ الحفظ..."}
                  </span>
                ) : (
                  t("save")
                )}
              </Button>
            </form>
          </div>

          {/* PROGRAMMER NEEDS */}
          <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{t("programmer_needs")}</h2>
                <p className="text-xs text-muted-foreground">{t("api_docs_hint")}</p>
              </div>
            </div>

            {apiInfoQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("loading") || "Loading..."}
              </div>
            ) : apiInfoQuery.data ? (
              <div className="grid gap-4 md:grid-cols-2">
                {/* docs url */}
                <div className="rounded-xl border border-border bg-secondary p-4">
                  <p className="text-xs text-muted-foreground">Docs / Postman</p>
                  <p className="mt-1 break-all text-sm text-foreground">
                    {apiInfoQuery.data.docs_url}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() => copy(apiInfoQuery.data?.docs_url)}
                  >
                    <Copy className="me-2 h-4 w-4" />
                    {t("copy_link") || "Copy"}
                  </Button>
                </div>

                {/* base url */}
                <div className="rounded-xl border border-border bg-secondary p-4">
                  <p className="text-xs text-muted-foreground">Base URL</p>
                  <p className="mt-1 break-all text-sm text-foreground">
                    {apiInfoQuery.data.base_url}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={() => copy(apiInfoQuery.data?.base_url)}
                  >
                    <Copy className="me-2 h-4 w-4" />
                    {t("copy_link") || "Copy"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("something_went_wrong")}</p>
            )}

            <p className="mt-6 text-xs text-muted-foreground">
              {t("in_addition_to")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
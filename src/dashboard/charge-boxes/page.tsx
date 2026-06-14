import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  Coins,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import Spinner from "../../components/Spinner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import { ChargeBox } from "../../types/types";
import getBoxes from "../../api/getBoxes";
import { AddBoxForm } from "./add-box-form";
import BoxCard from "./box-card";

function StatCard({
  label,
  value,
  sub,
  icon,
  gradient,
  glow,
  delay = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-border/80 hover:shadow-md sm:p-5"
    >
      <div
        className={cn(
          "pointer-events-none absolute -end-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-50 group-hover:opacity-80",
          glow
        )}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-foreground sm:text-3xl">
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            gradient
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function matchesSearch(box: ChargeBox, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    box.name,
    box.box_name,
    box.account_name,
    box.account_code,
    box.wallet_address,
    box.description,
    ...box.currencies.map((c) => c.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

export default function DashboardChargeBoxes() {
  const [t, i18n] = useTranslation("global");
  const [search, setSearch] = useState("");

  const boxesQuery = useQuery({
    queryKey: ["boxes"],
    queryFn: async () => {
      const response = await getBoxes(localStorage.getItem("token") as string);
      return response.data.result as ChargeBox[];
    },
    refetchOnWindowFocus: false,
  });

  const boxes = boxesQuery.data ?? [];

  const stats = useMemo(() => {
    const currencyNames = new Set<string>();
    for (const box of boxes) {
      for (const c of box.currencies) {
        currencyNames.add(c.name);
      }
    }
    return {
      total: boxes.length,
      currencies: currencyNames.size,
    };
  }, [boxes]);

  const filtered = useMemo(
    () => boxes.filter((box) => matchesSearch(box, search)),
    [boxes, search]
  );

  if (boxesQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (boxesQuery.isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("something_went_wrong")}</p>
        <Button variant="outline" onClick={() => boxesQuery.refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("refresh")}
        </Button>
      </div>
    );
  }

  return (
    <div
      dir={i18n.language === "en" ? "ltr" : "rtl"}
      className="space-y-8 pb-10"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Box className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-orbitron text-xl font-bold text-foreground sm:text-2xl">
              {t("charge_boxes")}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t("boxes_page_subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => boxesQuery.refetch()}
            disabled={boxesQuery.isFetching}
            aria-label={t("refresh")}
          >
            <RefreshCw
              className={cn("h-4 w-4", boxesQuery.isFetching && "animate-spin")}
            />
          </Button>
          <AddBoxForm query={boxesQuery} />
        </div>
      </motion.header>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <StatCard
          label={t("boxes_total")}
          value={stats.total}
          sub={t("boxes_total_hint")}
          icon={<Box className="h-5 w-5" />}
          gradient="from-violet-500 to-purple-600"
          glow="bg-violet-500/30"
          delay={0.05}
        />
        <StatCard
          label={t("boxes_currencies_linked")}
          value={stats.currencies}
          sub={t("boxes_currencies_hint")}
          icon={<Coins className="h-5 w-5" />}
          gradient="from-amber-500 to-orange-600"
          glow="bg-amber-500/30"
          delay={0.1}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("boxes_search_placeholder")}
          className="ps-9 pe-9"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[30vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center"
        >
          <Box className="h-10 w-10 text-muted-foreground/50" />
          <p className="font-semibold text-foreground">
            {search ? t("boxes_no_search_results") : t("boxes_empty")}
          </p>
          {!search && (
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("boxes_empty_hint")}
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((box, i) => (
              <motion.div
                key={box.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: Math.min(i * 0.04, 0.24), duration: 0.25 }}
              >
                <BoxCard box={box} query={boxesQuery} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

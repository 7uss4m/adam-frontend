/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo, useRef, forwardRef } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { FaFilter } from "react-icons/fa";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  Receipt,
  XCircle,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import Spinner from "../components/Spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { cn } from "../lib/utils";

import { Note } from "../types/types";
import usePaymentsFetch from "./usePaymentsFetch";
import {
  formatPaymentAmount,
  formatPaymentDateTime,
  getPaymentStatusMeta,
  getPaymentTitle,
  parseNoteDate,
} from "../lib/payment-note-display";

function noteMoment(created_at: unknown) {
  const d = parseNoteDate(created_at);
  return d ? moment(d) : null;
}

const DATE_FILTERS: Record<string, (orders: Note[]) => Note[]> = {
  today: (orders) =>
    orders.filter((o) => {
      const m = noteMoment(o.created_at);
      return m ? m.isSame(moment(), "day") : false;
    }),
  "7": (orders) =>
    orders.filter((o) => {
      const m = noteMoment(o.created_at);
      return m
        ? m.isBetween(moment().subtract(7, "days"), moment(), undefined, "[]")
        : false;
    }),
  "30": (orders) =>
    orders.filter((o) => {
      const m = noteMoment(o.created_at);
      return m
        ? m.isBetween(moment().subtract(30, "days"), moment(), undefined, "[]")
        : false;
    }),
  all: (orders) => orders,
};

const STATUS_FILTERS = ["all", "pinding", "success", "reject"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function matchesStatus(order: Note, status: StatusFilter) {
  if (status === "all") return true;
  const s = String(order.status || "pinding").toLowerCase();
  if (status === "success") {
    return s === "success" || s === "accept" || s === "completed";
  }
  if (status === "reject") {
    return s === "reject" || s === "failed" || s === "cancelled";
  }
  return s === "pinding" || s === "pending";
}

const getPlaceholderText = (filter: string, t: (k: string) => string) => {
  switch (filter) {
    case "7":
      return t("last_7_days") || "Last 7 days";
    case "30":
      return t("last_30_days") || "Last 30 days";
    case "today":
      return t("today") || "Today";
    case "all":
      return t("all") || "All";
    default:
      return t("filter") || "Filter";
  }
};

function statusIcon(variant: "pending" | "success" | "rejected") {
  if (variant === "success") return CheckCircle;
  if (variant === "rejected") return XCircle;
  return Clock;
}

const PaymentCard = forwardRef<HTMLDivElement, { order: Note }>(
  ({ order }, ref) => {
    const [t, i18n] = useTranslation("global");
    const meta = getPaymentStatusMeta(order?.status);
    const StatusIcon = statusIcon(meta.variant);
    const { full } = formatPaymentDateTime(order?.created_at, i18n.language);

    const title = getPaymentTitle(order, t("balance_charge"));
    const amount = formatPaymentAmount(order);
    const isPending = meta.variant === "pending";

    return (
      <div ref={ref}>
        <Accordion
          type="single"
          collapsible
          className={cn(
            "overflow-hidden rounded-2xl border bg-card/80 transition-all hover:-translate-y-0.5 hover:shadow-lg",
            isPending
              ? "border-amber-500/30 hover:border-amber-500/50"
              : "border-border/50 hover:border-primary/30"
          )}
        >
          {isPending && (
            <div className="pointer-events-none h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
          )}

          <AccordionItem value={`pay-${order.id}`} className="border-none">
            <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5">
              <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary sm:h-14 sm:w-14">
                    {order?.image ? (
                      <img
                        src={order.image}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <CreditCard className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
                    )}
                  </div>

                  <div className="min-w-0 text-start">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        #{order.id}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("gap-1 text-xs", meta.className)}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {t(meta.labelKey)}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-base font-bold text-foreground sm:text-lg">
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground">{full}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                  <div className="text-start sm:text-end">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("total")}
                    </p>
                    <p className="font-orbitron text-lg font-black text-primary sm:text-xl">
                      {amount}
                    </p>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
              <div className="grid gap-3 rounded-xl border border-border/40 bg-background/50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">#ID</span>
                  <span className="font-semibold text-foreground">
                    {order?.id}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("payment_method")}</span>
                  <span className="font-semibold text-foreground">{title}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("total")}</span>
                  <span className="font-orbitron font-bold text-primary">
                    {amount}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("date")}</span>
                  <span className="font-semibold text-foreground">{full}</span>
                </div>

                {order?.image ? (
                  <div className="pt-1">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Receipt className="h-3.5 w-3.5" />
                      {t("receipt") || "إيصال"}
                    </p>
                    <img
                      src={order.image}
                      alt=""
                      className="max-h-56 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }
);

PaymentCard.displayName = "PaymentCard";

function PaymentStats({
  orders,
  t,
}: {
  orders: Note[];
  t: (k: string) => string;
}) {
  const stats = useMemo(() => {
    let pending = 0;
    let success = 0;
    let rejected = 0;

    for (const o of orders) {
      const meta = getPaymentStatusMeta(o.status);
      if (meta.variant === "success") success += 1;
      else if (meta.variant === "rejected") rejected += 1;
      else pending += 1;
    }

    return { total: orders.length, pending, success, rejected };
  }, [orders]);

  const items = [
    {
      label: t("all"),
      value: stats.total,
      className: "text-foreground",
    },
    {
      label: t("pinding"),
      value: stats.pending,
      className: "text-amber-500",
    },
    {
      label: t("success"),
      value: stats.success,
      className: "text-emerald-500",
    },
    {
      label: t("reject"),
      value: stats.rejected,
      className: "text-red-500",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border/50 bg-card/60 px-4 py-3 text-center"
        >
          <p className="text-2xl font-black tabular-nums sm:text-3xl">
            <span className={item.className}>{item.value}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function Payments() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const filter = params.get("filter") || "all";
  const statusFilter = (params.get("status") || "all") as StatusFilter;
  const payment = params.get("payment");

  const [t, i18n] = useTranslation("global");

  const { notes, loading, hasMore, loadMore } = usePaymentsFetch();

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPayRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );

  const dateFilteredOrders = useMemo(() => {
    const fn = DATE_FILTERS[filter] ?? DATE_FILTERS.all;
    return fn(notes);
  }, [notes, filter]);

  const filteredOrders = useMemo(() => {
    return dateFilteredOrders.filter((o) => matchesStatus(o, statusFilter));
  }, [dateFilteredOrders, statusFilter]);

  const onChangeFilter = (val: string) => {
    const next = new URLSearchParams(search);
    next.set("filter", val);
    next.set("page", "1");
    navigate({ search: next.toString() }, { replace: true });
  };

  const onChangeStatus = (val: StatusFilter) => {
    const next = new URLSearchParams(search);
    if (val === "all") next.delete("status");
    else next.set("status", val);
    navigate({ search: next.toString() }, { replace: true });
  };

  return (
    <>
      {loading && notes.length === 0 ? (
        <div className="flex min-h-svh items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div
          className="min-h-svh bg-background"
          dir={i18n.language === "ar" ? "rtl" : "ltr"}
        >
          <main className="container mx-auto px-4 py-6 sm:py-8">
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-orbitron text-xl font-bold text-foreground sm:text-2xl">
                    {t("my_payments")}
                  </h1>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {t("recent_charges") || t("balance_charge")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <FaFilter className="text-primary" />
                <Select value={filter} onValueChange={onChangeFilter}>
                  <SelectTrigger className="w-[160px] rounded-lg border border-border bg-card text-foreground sm:w-[170px]">
                    <SelectValue placeholder={getPlaceholderText(filter, t)} />
                  </SelectTrigger>
                  <SelectContent className="bg-card text-foreground">
                    <SelectItem value="today">{t("today")}</SelectItem>
                    <SelectItem value="7">{t("last_7_days")}</SelectItem>
                    <SelectItem value="30">{t("last_30_days")}</SelectItem>
                    <SelectItem value="all">{t("all")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {dateFilteredOrders.length > 0 && (
              <PaymentStats orders={dateFilteredOrders} t={t} />
            )}

            <div className="mb-6 flex flex-wrap gap-2">
              {STATUS_FILTERS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChangeStatus(key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
                    statusFilter === key
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {t(key === "all" ? "all" : key)}
                </button>
              ))}
            </div>

            {filteredOrders.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {filteredOrders.map((order, index) => {
                  const isLast = filteredOrders.length === index + 1;
                  return (
                    <div key={order.id} ref={isLast ? lastPayRef : null}>
                      <PaymentCard order={order} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/60 py-16 sm:py-20">
                <CreditCard className="h-14 w-14 text-muted-foreground/40 sm:h-16 sm:w-16" />
                <p className="text-base text-muted-foreground sm:text-lg">
                  {t("no_items")}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="mt-2 flex items-center gap-2 rounded-lg gradient-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
                >
                  {t("browse_products") || "تصفح المنتجات"}
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
              </div>
            )}

            {loading && notes.length > 0 && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}
          </main>

          {payment === "success" && (
            <Dialog
              defaultOpen
              onOpenChange={(open) => {
                if (!open) navigate("/wallet/payments");
              }}
            >
              <DialogContent className="bg-card text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl sm:text-2xl">
                    {t("thanks_for_buy")}
                  </DialogTitle>
                  <VisuallyHidden>
                    <DialogDescription>{t("make_changes")}</DialogDescription>
                  </VisuallyHidden>
                </DialogHeader>

                <div className="flex justify-center py-2">
                  <CheckCircle className="h-14 w-14 text-green-400" />
                </div>

                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/wallet/payments")}
                  >
                    {t("close")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </>
  );
}

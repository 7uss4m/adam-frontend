/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo, useRef, forwardRef } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { FaFilter } from "react-icons/fa";
import { ArrowRight, CheckCircle, CreditCard } from "lucide-react";
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

import { Note } from "../types/types";
import usePaymentsFetch from "./usePaymentsFetch";

// filter logic (client-side filtering)
const FILTERS: Record<string, (orders: Note[]) => Note[]> = {
  today: (orders) =>
    orders.filter((o) => moment(o.created_at).isSame(moment(), "day")),
  "7": (orders) =>
    orders.filter((o) =>
      moment(o.created_at).isBetween(
        moment().subtract(7, "days"),
        moment(),
        undefined,
        "[]"
      )
    ),
  "30": (orders) =>
    orders.filter((o) =>
      moment(o.created_at).isBetween(
        moment().subtract(30, "days"),
        moment(),
        undefined,
        "[]"
      )
    ),
  all: (orders) => orders,
};

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

function paymentStatusChip(status?: string, t?: (k: string) => string) {
  const s = String(status || "pinding").toLowerCase();

  const isCompleted = s === "success" || s === "accept" || s === "completed";
  const isCancelled = s === "reject" || s === "failed" || s === "cancelled";

  if (isCompleted) {
    return {
      label: t ? t(status || "success") : "Completed",
      Icon: CheckCircle,
      className:
        "bg-green-500/20 text-green-400 border border-green-500/30 gap-1.5",
    };
  }
  if (isCancelled) {
    return {
      label: t ? t(status || "reject") : "Cancelled",
      Icon: CheckCircle,
      className: "bg-red-500/20 text-red-400 border border-red-500/30 gap-1.5",
    };
  }
  return {
    label: t ? t(status || "pinding") : "Pending",
    Icon: CheckCircle,
    className:
      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 gap-1.5",
  };
}

function safeTimeParts(created_at?: string) {
  // supports ISO "YYYY-MM-DDTHH:mm:ss..."
  const iso = String(created_at || "");
  const [d, timeRaw] = iso.split("T");
  const time = timeRaw ? timeRaw.slice(0, 8) : "";
  return { date: d || "", time };
}

const PaymentCard = forwardRef<HTMLDivElement, { order: Note }>(
  ({ order }, ref) => {
    const [t] = useTranslation("global");
    const chip = paymentStatusChip(order?.status, t);
    const StatusIcon = chip.Icon;
    const { date, time } = safeTimeParts(order?.created_at);

    const titleLeft = `${order?.currencies?.boxes?.name ?? ""}`;
    const amount = `${order?.coins ?? ""} ${order?.currencies?.name ?? ""}`;

    return (
      <div ref={ref}>
        <Accordion
          type="single"
          collapsible
          className="rounded-xl border border-border bg-card transition-colors hover:border-primary/30"
        >
          <AccordionItem value={`pay-${order.id}`} className="border-none">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              {/* Header row like V2 list items */}
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: icon + title */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                    {order?.image ? (
                      <img
                        src={order.image}
                        alt="payment"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-0 text-start">
                    <p className="truncate font-semibold text-foreground">
                      {titleLeft}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date}
                      {time ? ` • ${time}` : ""}
                    </p>
                  </div>
                </div>

                {/* Right: amount + status */}
                <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">
                      {t("total")}
                    </p>
                    <p className="font-orbitron text-sm font-bold text-primary">
                      {amount}
                    </p>
                  </div>

                  <Badge className={chip.className}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {chip.label}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-5 pb-5 pt-1">
              {/* Details section (still accordion like your v1) */}
              <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">#ID</span>
                  <span className="font-semibold text-foreground">
                    {order?.id}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("total")}</span>
                  <span className="font-semibold text-foreground">
                    {amount}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("date")}</span>
                  <span className="font-semibold text-foreground">
                    {time ? `${time} - ` : ""}
                    {date}
                  </span>
                </div>

                {order?.image ? (
                  <div className="pt-2">
                    <img
                      src={order.image}
                      alt="payment"
                      className="h-48 w-full rounded-xl object-cover"
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

export default function Payments() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const filter = params.get("filter") || "all";
  const payment = params.get("payment");

  const [t, i18n] = useTranslation("global");

  // ✅ single source of truth
  const { notes, loading, hasMore, loadMore } = usePaymentsFetch();

  // ✅ Infinite scroll observer
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

  const filteredOrders = useMemo(() => {
    const fn = FILTERS[filter] ?? FILTERS.all;
    return fn(notes);
  }, [notes, filter]);

  const onChangeFilter = (val: string) => {
    const next = new URLSearchParams(search);
    next.set("filter", val);
    next.set("page", "1"); // ✅ reset page in URL
    navigate({ search: next.toString() }, { replace: true });
  };

  return (
    <>
      {loading && notes.length === 0 ? (
        <div className="min-h-svh flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div
          className="min-h-svh bg-background"
          dir={i18n.language === "ar" ? "rtl" : "ltr"}
        >
          <main className="container mx-auto px-4 py-8">
            {/* Header like V2 */}
            <div className="mb-8 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-7 w-7 text-primary" />
                <h1 className="font-orbitron text-2xl font-bold text-foreground">
                  {t("my_payments")}
                </h1>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-3">
                <FaFilter className="text-primary" />
                <Select value={filter} onValueChange={onChangeFilter}>
                  <SelectTrigger className="w-[170px] bg-card text-foreground rounded-lg border border-border">
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

            {/* List / Empty */}
            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
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
              <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20">
                <CreditCard className="h-16 w-16 text-muted-foreground/40" />
                <p className="text-lg text-muted-foreground">{t("no_items")}</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-2 flex items-center gap-2 rounded-lg gradient-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
                >
                  {t("browse_products") || "تصفح المنتجات"}
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
              </div>
            )}

            {/* infinite loading spinner */}
            {loading && notes.length > 0 && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}
          </main>

          {/* payment success dialog (keep V1 behavior) */}
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

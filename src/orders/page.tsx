/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Package, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { FaFilter } from "react-icons/fa";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import getUserPayments from "../api/getUserPayments";
import getUserPaymentsDepts from "../api/getUserPaymentsDepts";
import getCheckOrderStatus from "../api/getCheckOrderStatus";

import Spinner from "../components/Spinner";
import { Badge } from "../components/ui/badge";
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
import { useTranslation } from "react-i18next";

import type { Order } from "../types/types";

const FILTERS: Record<string, (orders: Order[]) => Order[]> = {
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

const getPlaceholderText = (filter: string | null, t: (k: string) => string) => {
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

function statusChip(status?: string, t?: (k: string) => string) {
  const s = String(status || "pending").toLowerCase();

  // try to map your backend statuses into 3 buckets (like V2)
  const isCompleted = s === "accept" || s === "success" || s === "completed";
  const isCancelled = s === "reject" || s === "cancelled" || s === "canceled";

  if (isCompleted) {
    return {
      label: t ? t(status || "success") : "Completed",
      Icon: CheckCircle,
      className: "bg-green-500/20 text-green-400 border border-green-500/30 gap-1.5",
    };
  }
  if (isCancelled) {
    return {
      label: t ? t(status || "reject") : "Cancelled",
      Icon: XCircle,
      className: "bg-red-500/20 text-red-400 border border-red-500/30 gap-1.5",
    };
  }
  return {
    label: t ? t(status || "pending") : "Pending",
    Icon: Clock,
    className:
      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 gap-1.5",
  };
}

type OrderRowProps = {
  order: Order;
  t: (k: string) => string;
  onCheckStatus: (id: string) => void;
  getOrderStatusQuery: UseQueryResult<{ result: string[]; status: string }, Error>;
  currOrderId: string;
};

function OrderRow({
  order,
  t,
  onCheckStatus,
  getOrderStatusQuery,
  currOrderId,
}: OrderRowProps) {
  const chip = statusChip(order.status, t);
  const StatusIcon = chip.Icon;

  const date = new Date(order.created_at as any);

  const productName = order?.product?.name || t("balance_charge");
  const productImg = (order as any)?.product?.image; // if your API provides product.image
  const showCheckBtn = Array.isArray(order?.replay_api) && order.replay_api.length === 0;

  const isThis = currOrderId === order.id;
  const checking = isThis && getOrderStatusQuery.isFetching;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between">
      {/* Left block: product */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
          {productImg ? (
            <img
              src={String(productImg)}
              alt={productName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <Package className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {productName}
          </p>
          <p className="text-xs text-muted-foreground">
            {date.toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            {" • "}
            {date.toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {/* Optional extra fields (like V1) */}
          <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
            {order?.area?.name ? (
              <p>
                <span className="text-foreground/80">{t("area")}: </span>
                {order.area.name}
              </p>
            ) : null}

            {order?.appId ? (
              <p>
                <span className="text-foreground/80">PlayerId: </span>
                {order.appId}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right block: qty, total, status */}
      <div className="flex flex-col gap-3 sm:items-end">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-left">
            <p className="text-xs text-muted-foreground">{t("quantity")}</p>
            <p className="font-orbitron text-sm font-bold text-foreground">
              {order.quantity}
            </p>
          </div>

          <div className="text-left">
            <p className="text-xs text-muted-foreground">{t("total")}</p>
            <p className="font-orbitron text-sm font-bold text-primary">
              ${Number(order.total).toFixed(2)}
            </p>
          </div>

          <Badge className={chip.className}>
            <StatusIcon className="h-3.5 w-3.5" />
            {chip.label}
          </Badge>
        </div>

        {/* V1: check status + replay_api */}
        <div className="flex flex-col gap-2">
          {showCheckBtn ? (
            <Button
              size="sm"
              onClick={() => onCheckStatus(order.id)}
              className="h-9 rounded-lg gradient-primary px-4 text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              {t("check_order_status")}
            </Button>
          ) : null}

          {/* replay_api text */}
          <div className="text-xs text-muted-foreground">
            {typeof order?.replay_api === "object" &&
            Array.isArray(order.replay_api) &&
            order.replay_api.length > 0
              ? order.replay_api.map((r: any, idx: number) => {
                  const replay = (r as any)?.replay;
                  return (
                    <div key={idx} className="mt-1">
                      {replay ? String(replay) : String(r)}
                    </div>
                  );
                })
              : typeof order?.replay_api === "string"
              ? order.replay_api
              : null}
          </div>

          {/* check status result */}
          {isThis ? (
            <div className="text-xs text-muted-foreground">
              {checking ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>{t("loading")}</span>
                </div>
              ) : (
                <>
                  {getOrderStatusQuery.data?.status ? (
                    <div className="mt-1 text-foreground">
                      {getOrderStatusQuery.data.status}
                    </div>
                  ) : null}
                  {getOrderStatusQuery.data?.result?.[0] ? (
                    <div className="mt-1">{getOrderStatusQuery.data.result[0]}</div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function Orders(): JSX.Element {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);

  const [t] = useTranslation("global");

  const filter = params.get("filter") || "all";
  const purchase = params.get("purchase");

  const [currOrderId, setCurrOrderId] = useState("");

  const userOrdersQuery = useQuery<Order[], Error>({
    queryKey: ["user", "orders"],
    queryFn: async () => {
      const res = await getUserPayments(localStorage.getItem("token")!);
      return res.data.result as Order[];
    },
    refetchOnWindowFocus: false,
  });

  const userDeptsQuery = useQuery<Order[], Error>({
    queryKey: ["user", "orders", "dept"],
    queryFn: async () => {
      const res = await getUserPaymentsDepts(localStorage.getItem("token")!);
      return (res.data.result as Order[]).map((o) => ({ ...o, isDept: true }));
    },
    refetchOnWindowFocus: false,
  });

  const getOrderStatusQuery = useQuery<{ result: string[]; status: string }, Error>({
    queryKey: ["order", "status", currOrderId],
    queryFn: async () => {
      const res = await getCheckOrderStatus(currOrderId, localStorage.getItem("token")!);
      // keep V1 behavior
      userOrdersQuery.refetch();
      return res.data.result;
    },
    enabled: false,
  });

  useEffect(() => {
    if (currOrderId) getOrderStatusQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currOrderId]);

  const isLoading = userOrdersQuery.isLoading || userDeptsQuery.isLoading;

  const allOrders = useMemo(() => {
    return [...(userOrdersQuery.data || []), ...(userDeptsQuery.data || [])];
  }, [userOrdersQuery.data, userDeptsQuery.data]);

  const filteredOrders = useMemo(() => {
    const fn = FILTERS[filter] ?? FILTERS.all;
    return fn(allOrders);
  }, [allOrders, filter]);

  return (
    <>
      {isLoading ? (
        <section className="min-h-svh flex items-center justify-center">
          <Spinner />
        </section>
      ) : (
        <div className="min-h-screen bg-background" dir={t("dir") === "ltr" ? "ltr" : "rtl"}>
          {/* If you already render Navbar in MainLayout, remove this wrapper/header */}
          <main className="container min-h-svh mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Package className="h-7 w-7 text-primary" />
                <h1 className="font-orbitron text-2xl font-bold text-foreground">
                  {t("my_orders")}
                </h1>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-3">
                <FaFilter className="text-primary" />
                <Select
                  value={filter}
                  onValueChange={(val) => {
                    const next = new URLSearchParams(search);
                    next.set("filter", val);
                    navigate({ pathname: "/orders", search: next.toString() }, { replace: true });
                  }}
                >
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

            {/* Empty / List */}
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20">
                <Package className="h-16 w-16 text-muted-foreground/40" />
                <p className="text-lg text-muted-foreground">{t("no_items")}</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-2 flex items-center gap-2 rounded-lg gradient-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
                >
                  {t("browse_products") || "تصفح المنتجات"}
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders
                  .slice()
                  // keep V1 sorting if needed (newest first):
                  .sort((a, b) => moment(b.created_at).valueOf() - moment(a.created_at).valueOf())
                  .map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      t={t}
                      currOrderId={currOrderId}
                      getOrderStatusQuery={getOrderStatusQuery}
                      onCheckStatus={setCurrOrderId}
                    />
                  ))}
              </div>
            )}
          </main>

          {/* Purchase success dialog (V1) */}
          {(purchase === "success" || purchase === "true" || purchase === "1") && (
            <Dialog
              defaultOpen
              onOpenChange={(open) => {
                if (!open) {
                  const next = new URLSearchParams(search);
                  next.delete("purchase");
                  navigate({ pathname: "/orders", search: next.toString() }, { replace: true });
                }
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
                    onClick={() => {
                      const next = new URLSearchParams(search);
                      next.delete("purchase");
                      navigate({ pathname: "/orders", search: next.toString() }, { replace: true });
                    }}
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
/* WalletPayments.tsx - same functionality, V2-ish cards */
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import moment from "moment";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Package, ArrowRight, CheckCircle } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FaCheckCircle } from "react-icons/fa";
import type { Order } from "../../types/types";

// helpers
function filterOrders(data: Order[], filter: string | null) {
  if (!data?.length) return [];

  if (filter === "7") {
    const today = moment();
    const sevenDaysAgo = moment().subtract(7, "days");
    return data.filter((o) => moment(o.created_at).isBetween(sevenDaysAgo, today, undefined, "[]"));
  }
  if (filter === "30") {
    const today = moment();
    const thirtyDaysAgo = moment().subtract(30, "days");
    return data.filter((o) => moment(o.created_at).isBetween(thirtyDaysAgo, today, undefined, "[]"));
  }
  if (filter === "today") {
    const today = moment().startOf("day");
    return data.filter((o) => moment(o.created_at).startOf("day").isSame(today));
  }
  return data; // all / default
}

export default function WalletPayments() {
  const [t, i18n] = useTranslation("global");
  const { orders } = useOutletContext() as { orders: Order[] };
  const data = orders || [];

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const filter = params.get("filter");
  const payment = params.get("payment");

  const navigate = useNavigate();

  const list = useMemo(() => filterOrders(data, filter), [data, filter]);

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <section className="space-y-4 pb-32">
        {list.length === 0 ? (
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
            {list.map((order) => {
              const productName =
                order.price?.product?.name ? order.price.product.name : t("balance_charge");
              const categoryName =
                order.price?.product?.categories?.name ? order.price.product.categories.name : "-";
              const price =
                order.price?.price ? `${order.price.price} USD` : `${t("deleted_price")} USD`;

              const created = new Date(String(order.created_at));

              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {created.toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        {" • "}
                        {created.toLocaleTimeString(i18n.language === "ar" ? "ar-EG" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {t("application")}: <span className="text-foreground">{categoryName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">{t("quantity")}</p>
                      <p className="font-orbitron text-sm font-bold text-foreground">
                        {order.quantity}
                      </p>
                    </div>

                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">{t("price")}</p>
                      <p className="font-orbitron text-sm font-bold text-foreground">{price}</p>
                    </div>

                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">{t("total")}</p>
                      <p className="font-orbitron text-sm font-bold text-primary">
                        {Number(order.total).toFixed(2)} USD
                      </p>
                    </div>

                    <Badge className="bg-primary/10 text-primary border border-primary/20 gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {t("payment") || "Payment"}
                      {" "}
                      #{order.id}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {payment === "success" && (
          <Dialog defaultOpen onOpenChange={() => navigate("/wallet/payments")}>
            <DialogContent className="bg-card text-foreground">
              <DialogHeader>
                <DialogTitle className="text-center text-xl sm:text-2xl">
                  {t("thanks_for_buy")}
                </DialogTitle>
                <VisuallyHidden>
                  <DialogDescription />
                </VisuallyHidden>
              </DialogHeader>

              <div className="flex justify-center py-2">
                <FaCheckCircle className="h-14 w-14 text-green-400" />
              </div>

              <DialogFooter>
                <Button variant="secondary" onClick={() => navigate("/wallet/payments")}>
                  {t("close")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </section>
    </div>
  );
}
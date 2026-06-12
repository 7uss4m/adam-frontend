/* WalletPayments.tsx - same functionality, V2-ish cards */
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import moment from "moment";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Package, CheckCircle } from "lucide-react";
import WalletEmptyState from "../components/WalletEmptyState";
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
          <WalletEmptyState icon={Package} />
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
                  className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-[#1a2230] p-5 transition-colors hover:border-cyan-500/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-cyan-500/10">
                      <Package className="h-7 w-7 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">{productName}</p>
                      <p className="text-sm text-gray-300">
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
                      <p className="mt-1 text-xs text-gray-400">
                        {t("application")}: <span className="font-semibold text-gray-200">{categoryName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-400">{t("quantity")}</p>
                      <p className="font-orbitron text-base font-black text-white">
                        {order.quantity}
                      </p>
                    </div>

                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-400">{t("price")}</p>
                      <p className="font-orbitron text-base font-black text-white">{price}</p>
                    </div>

                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-400">{t("total")}</p>
                      <p className="font-orbitron text-lg font-black text-cyan-400">
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
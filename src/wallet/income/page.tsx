/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import moment from "moment";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, ArrowRight } from "lucide-react";

import type { Charge } from "../../types/types";

// helpers (same logic)
function getLast7(data: Charge[]) {
  const today = moment();
  const sevenDaysAgo = moment().subtract(7, "days");
  return data.filter((c) =>
    moment(c.created_at).isBetween(sevenDaysAgo, today, undefined, "[]")
  );
}
function getLast30(data: Charge[]) {
  const today = moment();
  const thirtyDaysAgo = moment().subtract(30, "days");
  return data.filter((c) =>
    moment(c.created_at).isBetween(thirtyDaysAgo, today, undefined, "[]")
  );
}
function gettoday(data: Charge[]) {
  const today = moment().startOf("day");
  return data.filter((c) => moment(c.created_at).startOf("day").isSame(today));
}

export default function Income() {
  const [t, i18n] = useTranslation("global");

  const { income } = useOutletContext() as { income: Charge[] };
  const data = income || [];

  const { search } = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(search);
  const filter = params.get("filter");

  const list = useMemo(() => {
    if (filter === "7") return getLast7(data);
    if (filter === "30") return getLast30(data);
    if (filter === "today") return gettoday(data);
    return data; // all / default
  }, [data, filter]);

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <section className="space-y-4 pb-32">
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20">
            <TrendingUp className="h-16 w-16 text-muted-foreground/40" />
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
            {list.map((charge) => {
              const created = new Date(String(charge.created_at));
              return (
                <div
                  key={charge.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>

                    <div>
                      <p className="font-semibold text-foreground">
                        {t("income")} #{charge.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {created.toLocaleDateString(
                          i18n.language === "ar" ? "ar-EG" : "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                        {" • "}
                        {created.toLocaleTimeString(
                          i18n.language === "ar" ? "ar-EG" : "en-US",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">
                        {t("amount")}
                      </p>
                      <p className="font-orbitron text-sm font-bold text-primary">
                        {charge.coins} USD
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
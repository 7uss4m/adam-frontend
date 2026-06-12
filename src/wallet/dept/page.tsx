import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowDownCircle, Clock, Coins } from "lucide-react";
import type { Dept } from "../../types/types";
import WalletEmptyState from "../components/WalletEmptyState";

export default function Dept() {
  const [t, i18n] = useTranslation("global");
  const { dept } = useOutletContext() as { dept?: Dept | null };

  const coins = Number(dept?.coins || 0);
  const hasDebt = coins > 0;

  if (!hasDebt) {
    return (
      <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
        <section className="pb-32">
          <WalletEmptyState
            icon={ArrowDownCircle}
            message={t("no_debit_balance") || "لا يوجد رصيد دين حالياً"}
            actionLabel={t("browse_products") || "تصفح المنتجات"}
            actionTo="/"
          />
        </section>
      </div>
    );
  }

  return (
    <div dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <section className="space-y-4 pb-32">
        <div className="rounded-2xl border border-rose-500/25 bg-gradient-to-br from-rose-950/40 to-[#1a2230] p-6">
          <p className="text-sm font-semibold text-rose-300/90">
            {t("debit_balance") || "رصيد الدين"}
          </p>
          <p className="mt-2 font-orbitron text-4xl font-black tabular-nums text-white">
            {coins.toFixed(2)}{" "}
            <span className="text-lg text-gray-400">USD</span>
          </p>
          {dept?.remaining_time != null && (
            <p className="mt-2 text-sm text-gray-300">
              {t("remaining_time") || "الوقت المتبقي"}:{" "}
              <span className="font-bold text-amber-400">
                {dept.remaining_time} {t("hours") || "ساعة"}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-[#1a2230] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15">
              <Coins className="h-8 w-8 text-rose-400" />
            </div>
            <div>
              <p className="text-base font-bold text-white">
                {t("debit_balance") || "رصيد الدين"}
              </p>
              <p className="mt-1 text-sm text-gray-300">
                {t("debit_active") || "دين نشط على حسابك"}
              </p>
            </div>
          </div>
          <div className="text-start sm:text-end">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t("amount") || "المبلغ"}
            </p>
            <p className="font-orbitron text-2xl font-black text-rose-400">
              {coins.toFixed(2)} USD
            </p>
          </div>
        </div>

        {(dept?.expire_limit != null || dept?.last_used) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {dept.expire_limit != null && (
              <div className="rounded-2xl border border-white/15 bg-[#1a2230] p-5">
                <div className="mb-2 flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">
                    {t("expire_limit") || "مدة الانتهاء"}
                  </span>
                </div>
                <p className="text-xl font-black text-white">
                  {dept.expire_limit} {t("hours") || "ساعة"}
                </p>
              </div>
            )}
            {dept.temp_coins && Number(dept.temp_coins) > 0 && (
              <div className="rounded-2xl border border-white/15 bg-[#1a2230] p-5">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  {t("temp_balance") || "رصيد مؤقت"}
                </p>
                <p className="mt-2 text-xl font-black text-amber-400">
                  {Number(dept.temp_coins).toFixed(2)} USD
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

import { LucideIcon, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type WalletEmptyStateProps = {
  icon: LucideIcon;
  message?: string;
  actionLabel?: string;
  actionTo?: string;
};

export default function WalletEmptyState({
  icon: Icon,
  message,
  actionLabel,
  actionTo = "/",
}: WalletEmptyStateProps) {
  const [t] = useTranslation("global");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/15 bg-[#1a2230] px-6 py-20 shadow-inner">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
        <Icon className="h-10 w-10 text-gray-400" />
      </div>
      <p className="text-center text-lg font-semibold text-gray-200">
        {message || t("no_items")}
      </p>
      <button
        type="button"
        onClick={() => navigate(actionTo)}
        className="mt-1 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20"
      >
        {actionLabel || t("browse_products") || "تصفح المنتجات"}
        <ArrowRight className="h-4 w-4 rotate-180" />
      </button>
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

export default function WalletMobileNav() {
  const { pathname } = useLocation();
  const [t] = useTranslation("global");

  const items = [
    {
      to: "/orders",
      icon: ShoppingBag,
      label: t("my_orders") || "الطلبات",
      active: pathname.startsWith("/orders"),
    },
    {
      to: "/",
      icon: Home,
      label: t("home") || "الرئيسية",
      active: pathname === "/",
    },
    {
      to: "/wallet",
      icon: Wallet,
      label: t("my_wallet") || "المحفظة",
      active: pathname.startsWith("/wallet"),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-[#121820]/95 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, icon: Icon, label, active }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors",
              active ? "text-cyan-400" : "text-gray-500"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

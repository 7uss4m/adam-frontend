import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BiHome } from "react-icons/bi";
import { FiShoppingCart } from "react-icons/fi";
import { BsCashCoin } from "react-icons/bs";
import { Wallet, LogIn } from "lucide-react";
import { cn } from "../lib/utils";
import getUser from "../api/getUser";
import type { User } from "../types/types";

export default function BottomNav() {
  const [t] = useTranslation("global");
  const { pathname } = useLocation();
  const token = localStorage.getItem("token");

  const { data: user } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const res = await getUser(token as string);
      return res.data.result as User;
    },
    enabled: !!token,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const isAuthed = !!user;

  const guestItems = [
    { to: "/", label: t("home"), icon: BiHome, match: (p: string) => p === "/" },
    { to: "/login", label: t("login"), icon: LogIn, match: (p: string) => p === "/login" },
  ];

  const authedItems = [
    { to: "/", label: t("home"), icon: BiHome, match: (p: string) => p === "/" },
    { to: "/orders", label: t("my_orders"), icon: FiShoppingCart, match: (p: string) => p === "/orders" },
    { to: "/add-balance", label: t("add_balance"), icon: BsCashCoin, match: (p: string) => p.startsWith("/add-balance") },
    { to: "/wallet", label: t("my_wallet"), icon: Wallet, match: (p: string) => p.startsWith("/wallet") },
  ];

  const items = isAuthed ? authedItems : guestItems;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden">
      {/* fade gradient above the bar */}
      <div className="pointer-events-none h-6 bg-gradient-to-t from-background to-transparent" />

      <nav className="safe-bottom relative border-t border-primary/20 bg-card/90 backdrop-blur-2xl">
        {/* glow line on top */}
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div
          className={cn(
            "grid h-[68px]",
            items.length <= 2 ? "grid-cols-2" : "grid-cols-4"
          )}
        >
          {items.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex flex-col items-center justify-center gap-1 outline-none"
              >
                {/* active top indicator */}
                {active && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute top-0 h-[3px] w-9 rounded-full bg-primary shadow-[0_0_12px_2px_hsl(var(--primary)/0.7)]"
                  />
                )}

                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-2xl transition-colors duration-300",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-2xl bg-primary/10 blur-md" />
                  )}
                  <Icon className="relative h-[22px] w-[22px]" />
                </motion.div>

                <span
                  className={cn(
                    "text-[10px] font-bold leading-none transition-colors duration-300",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { AxiosError, AxiosResponse } from "axios";

import { Wallet, Menu, X, Sun, Moon } from "lucide-react";
import { FaRegUser } from "react-icons/fa";
import { BiHome, BiInfoCircle } from "react-icons/bi";
import { FiShoppingCart } from "react-icons/fi";
import { BsCashCoin } from "react-icons/bs";
import { VscReferences } from "react-icons/vsc";
import { MdOutlinePayment } from "react-icons/md";

import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import MobileNavSheet, { type NavItem } from "./MobileNavSheet";
import { useTheme } from "./theme-provider";

import getUser from "../api/getUser";
import putUser from "../api/putUser";
import getInfo from "../api/getInfo";

import type { User } from "../types/types";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../context/CurrencyContext";

import logo from "../assets/logo.webp";

export default function Header() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [t] = useTranslation("global");

  const token = localStorage.getItem("token");
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [editUser, setEditUser] = useState(false);

  const username = useRef<HTMLInputElement>(null);
  const company = useRef<HTMLInputElement>(null);

  const { currency, setCurrency } = useCurrency();
  const handleCurrencyChange = (newCurrency: "syrian" | "dollar") => {
    setCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  const getUserQuery = useQuery({
    queryKey: ["user", "me", currency],
    queryFn: async () => {
      const res = await getUser(token as string, currency === "syrian");
      return res.data.result as User;
    },
    enabled: !!token,
    retry: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const getWhatsappQuery = useQuery({
    queryKey: ["info", "whatsup"],
    queryFn: async () => {
      const res = await getInfo(
        localStorage.getItem("token") as string,
        "whatsup"
      );
      return res.data.date as { whatsup: string | null };
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const getFacebookQuery = useQuery({
    queryKey: ["info", "facebook"],
    queryFn: async () => {
      const res = await getInfo(
        localStorage.getItem("token") as string,
        "facebook"
      );
      return res.data.date as { facebook: string | null };
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const getTelegramQuery = useQuery({
    queryKey: ["info", "telegram"],
    queryFn: async () => {
      const res = await getInfo(
        localStorage.getItem("token") as string,
        "telegram"
      );
      return res.data.date as { telegram: string | null };
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const getPhoneQuery = useQuery({
    queryKey: ["info", "phone"],
    queryFn: async () => {
      const res = await getInfo(
        localStorage.getItem("token") as string,
        "phone"
      );
      return res.data.date as { phone: string | null };
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const isAuthed = !!getUserQuery.data && getUserQuery.isSuccess;

  const balanceLabel =
    currency === "syrian"
      ? `${getUserQuery.data?.balance?.toFixed(0) ?? 0} SYP`
      : `$${getUserQuery.data?.balance?.toFixed(2) ?? "0.00"}`;

  const handleLogout = () => {
    localStorage.removeItem("user_name");
    localStorage.removeItem("token");
    toast({
      title: t("logged_out_successfully"),
      className: "bg-accent text-white fixed top-10 right-10 w-[40%]",
    });
    navigate("/");
    navigate(0);
  };

  const editUserMutation = useMutation({
    mutationFn: async () => {
      const res = await putUser(
        token as string,
        company.current?.value as string,
        username.current?.value as string
      );
      return res;
    },
    onSuccess: (data: AxiosResponse) => {
      toast({
        title: data.data.result,
        className: "bg-accent text-white fixed top-10 right-10 w-[40%]",
      });
      setEditUser(false);
      getUserQuery.refetch();
    },
    onError: (error: AxiosError) => {
      const errorMessage = error.response?.data as { error: string };
      toast({
        title: errorMessage?.error || "Error",
        className: "bg-accent text-white fixed top-10 right-10 w-[40%]",
      });
    },
  });

  const navItems: NavItem[] = useMemo(
    () => [
      {
        label: t("home"),
        to: "/",
        icon: <BiHome className="h-4 w-4" />,
        auth: "any",
        match: (p) => p === "/",
      },
      {
        label: t("add_balance"),
        to: "/add-balance",
        icon: <BsCashCoin className="h-4 w-4" />,
        auth: "user",
        match: (p) => p === "/add-balance",
      },
      {
        label: t("my_payments"),
        to: "/payments",
        icon: <MdOutlinePayment className="h-4 w-4" />,
        auth: "user",
        match: (p) => p.startsWith("/payments"),
      },
      {
        label: t("my_wallet"),
        to: "/wallet",
        icon: <Wallet className="h-4 w-4" />,
        auth: "user",
        match: (p) => p.startsWith("/wallet"),
      },
      {
        label: t("my_orders"),
        to: "/orders",
        icon: <FiShoppingCart className="h-4 w-4" />,
        auth: "user",
        match: (p) => p === "/orders",
      },
      {
        label: t("invite_code"),
        to: "/referral",
        icon: <VscReferences className="h-4 w-4" />,
        auth: "user",
        match: (p) => p === "/referral",
      },
      {
        label: t("about_us"),
        to: "/about-us",
        icon: <BiInfoCircle className="h-4 w-4" />,
        auth: "any",
        match: (p) => p === "/about-us",
      },
    ],
    [t]
  );

  const sheetNavItems = useMemo(() => {
    return isAuthed ? navItems : navItems.filter((x) => x.auth === "any");
  }, [navItems, isAuthed]);

  const socialReady =
    getTelegramQuery.isFetched &&
    getFacebookQuery.isFetched &&
    getWhatsappQuery.isFetched &&
    !!getTelegramQuery.data &&
    !!getFacebookQuery.data &&
    !!getWhatsappQuery.data;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-primary/15 bg-background/80 backdrop-blur-xl">
        {/* glow line */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

        <div className="container mx-auto flex items-center justify-between px-4 py-2.5">
          {/* Left */}
          <div className="flex items-center gap-2">
            {isAuthed ? (
              <>
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-secondary/50 text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  aria-label="Profile"
                >
                  <FaRegUser className="h-[18px] w-[18px]" />
                </button>
                {getUserQuery.data && (
                  <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
                    <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-black tabular-nums text-emerald-400">
                      {balanceLabel}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-black text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/20 hover:shadow-[0_6px_18px_-6px_hsl(var(--primary)/0.7)]"
              >
                <FaRegUser className="h-3.5 w-3.5" />
                {t("login")}
              </Link>
            )}
          </div>

          {/* Center logo */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2"
            aria-label="AdamZone"
          >
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-primary/25 blur-lg" />
              <img src={logo} alt="AdamZone" className="relative h-9 object-contain" />
            </div>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-1.5">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-secondary/50 text-foreground transition-all hover:border-primary/40 hover:bg-primary/10"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-[18px] w-[18px] text-yellow-400" />
              ) : (
                <Moon className="h-[18px] w-[18px] text-primary" />
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-secondary/50 text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="h-[18px] w-[18px]" />
              ) : (
                <Menu className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <MobileNavSheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        navItems={sheetNavItems}
        isAuthed={isAuthed}
        isLoading={!!token && getUserQuery.isLoading}
        hasToken={!!token}
        user={getUserQuery.data}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onEditProfile={() => setEditUser(true)}
        onLogout={handleLogout}
        socialReady={socialReady}
        social={{
          facebook: getFacebookQuery.data?.facebook,
          telegram: getTelegramQuery.data?.telegram,
          whatsup: getWhatsappQuery.data?.whatsup,
          phone: getPhoneQuery.data?.phone,
        }}
      />

      <Dialog open={editUser} onOpenChange={setEditUser}>
        <DialogContent className="dialog sm:max-w-[425px] !glass-effect">
          <DialogHeader>
            <DialogTitle className="text-accent">
              {t("edit_username")}
            </DialogTitle>
            <DialogDescription className="text-white">
              {t("edit_profile_desc") ||
                "Make changes to your profile here. Click save when you're done."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right !text-accent">
                {t("username") || "Username"}
              </Label>
              <Input
                id="name"
                defaultValue={getUserQuery.data?.user_name ?? ""}
                className="col-span-3"
                ref={username}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right !text-accent">
                {t("phone") || "Phone"}
              </Label>
              <Input
                id="company"
                defaultValue={(getUserQuery.data as any)?.company ?? ""}
                className="col-span-3"
                ref={company}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={editUserMutation.isPending}
              type="button"
              className={`${
                editUserMutation.isPending ? "bg-accent/50" : "bg-accent"
              } text-white hover:bg-accent/80`}
              onClick={() => editUserMutation.mutate()}
            >
              {editUserMutation.isPending
                ? "loading.."
                : t("save_changes") || "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

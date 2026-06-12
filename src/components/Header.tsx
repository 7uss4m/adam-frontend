/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import type { AxiosError, AxiosResponse } from "axios";

import { Wallet, Menu, X, LogOut, Settings, PlusCircle, Sun, Moon } from "lucide-react";
import { BsTranslate } from "react-icons/bs";
import {
  FaRegUser,
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaWhatsapp,
  FaPhone,
} from "react-icons/fa";
import { IoDiamond } from "react-icons/io5";
import { BiEdit, BiHome, BiInfoCircle } from "react-icons/bi";
import { FiShoppingCart } from "react-icons/fi";
import { BsCashCoin } from "react-icons/bs";
import { VscReferences } from "react-icons/vsc";
import { MdOutlinePayment } from "react-icons/md";

import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";

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

import GoogleOAuth from "./GoogleAuth";
import NavLogin from "./nav-login";
import { useTheme } from "./theme-provider";

import getUser from "../api/getUser";
import putUser from "../api/putUser";
import getInfo from "../api/getInfo";

import type { User } from "../types/types";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../context/CurrencyContext";

import logo from "../assets/logo.webp";
import { Skeleton } from "./ui/skeleton";

const COLORSLIST = ["#CD7F32", "#c0c0c0", "#FFD700", "#9206f8", "#B9F2FF"];

type NavItem = {
  label: string;
  to: string;
  icon?: React.ReactNode;
  auth?: "any" | "guest" | "user";
  match?: (pathname: string) => boolean;
};

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toast } = useToast();
  const [t, i18n] = useTranslation("global");

  const token = localStorage.getItem("token");
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [editUser, setEditUser] = useState(false);

  const username = useRef<HTMLInputElement>(null);
  const company = useRef<HTMLInputElement>(null);

  // currency
  const { currency, setCurrency } = useCurrency();
  const handleCurrencyChange = (newCurrency: "syrian" | "dollar") => {
    setCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  // data
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

  // const getLevelsQuery = useQuery({
  //   queryKey: ["levels"],
  //   queryFn: async () => {
  //     const res = await getLevels();
  //     return res.data.result as Level[];
  //   },
  //   refetchOnWindowFocus: false,
  // });

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

  // const getDollarQuery = useQuery({
  //   queryKey: ["info", "dollar_exchange"],
  //   queryFn: async () => {
  //     const res = await getInfo(
  //       localStorage.getItem("token") as string,
  //       "dollar_exchange"
  //     );
  //     return res.data.date as { dollar_exchange: string | null };
  //   },
  //   enabled: !!token,
  //   refetchOnWindowFocus: false,
  // });

  const isAuthed = !!getUserQuery.data && getUserQuery.isSuccess;
  const isPending = getUserQuery.isLoading;
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
        match: (p) => p === "/wallet",
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
      // {
      //   label: t("agents"),
      //   to: "/agents",
      //   icon: <MdSupportAgent className="h-4 w-4" />,
      //   auth: "user",
      //   match: (p) => p === "/agents",
      // },
      // {
      //   label: t("security"),
      //   to: "/security",
      //   icon: <MdSecurity className="h-4 w-4" />,
      //   auth: "user",
      //   match: (p) => p === "/security",
      // },
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

  const desktopLinks = useMemo(() => {
    const any = navItems.filter((x) => x.auth === "any");
    const user = navItems.filter((x) => x.auth === "user");
    return isAuthed ? [...any, ...user] : any;
  }, [navItems, isAuthed]);

  const mobileLinks = useMemo(() => {
    const any = navItems.filter((x) => x.auth === "any");
    const user = navItems.filter((x) => x.auth === "user");
    return isAuthed ? [...any, ...user] : any;
  }, [navItems, isAuthed]);

  const levelColor = useMemo(() => {
    const lvlId = Number(getUserQuery.data?.level?.id ?? 1);
    const idx = Math.max(0, Math.min(COLORSLIST.length - 1, lvlId - 1));
    return COLORSLIST[idx];
  }, [getUserQuery.data?.level?.id]);

  const socialReady =
    getTelegramQuery.isFetched &&
    getFacebookQuery.isFetched &&
    getWhatsappQuery.isFetched &&
    !!getTelegramQuery.data &&
    !!getFacebookQuery.data &&
    !!getWhatsappQuery.data;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b-2 border-primary bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* LEFT: Profile icon */}
          {isAuthed ? (
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1 text-foreground"
              aria-label="Profile"
            >
              <FaRegUser className="h-6 w-6" />
            </button>
          ) : (
            <Link to="/login" className="p-1 text-foreground" aria-label="Login">
              <FaRegUser className="h-6 w-6" />
            </Link>
          )}

          {/* CENTER: Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img
              src={logo}
              alt="AdamZone"
              className="h-8 object-contain"
            />
          </Link>

          {/* RIGHT: Theme + Menu */}
          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="p-2 rounded-full text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-primary" />}
            </motion.button>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1 text-foreground"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Desktop dropdown menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-primary/20 bg-gradient-to-b from-background via-primary/5 to-background"
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
            >
              <div className="flex flex-col gap-3 px-4 py-5">
                {/* Auth block */}
                {!token && <NavLogin />}

                {token && getUserQuery.isLoading && (
                  <div className="text-sm text-muted-foreground">
                    Loading...
                  </div>
                )}

                {isAuthed ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 backdrop-blur-sm shadow-lg"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <Avatar className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-primary to-accent text-white shadow-lg">
                          <FaRegUser className="h-6 w-6" />
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">
                          {getUserQuery.data.user_name}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">{t("balance")}:</span>
                          <span className="text-xs font-semibold text-primary">
                            {currency === "syrian"
                              ? `${getUserQuery.data.balance.toFixed(0)} SYP`
                              : `$${getUserQuery.data.balance.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Currency Selector */}
                    <div className="mb-4 rounded-lg border border-primary/20 bg-background/50 px-3 py-2.5 backdrop-blur-sm">
                      <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                        {t("currency")}
                      </label>
                      <select
                        value={currency}
                        onChange={(e) =>
                          handleCurrencyChange(
                            e.target.value as "syrian" | "dollar"
                          )
                        }
                        aria-label={t("currency")}
                        className="w-full bg-transparent text-sm font-medium outline-none cursor-pointer"
                      >
                        <option value="syrian">{t("syrian_pound")}</option>
                        <option value="dollar">{t("usd_dollar")}</option>
                      </select>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setEditUser(true);
                          setMobileOpen(false);
                        }}
                        className="rounded-lg bg-gradient-to-r from-primary/80 to-primary p-2.5 text-xs font-bold text-white transition-all hover:from-primary hover:to-primary/90 shadow-md hover:shadow-lg"
                      >
                        <span className="inline-flex items-center justify-center gap-1.5">
                          <Settings className="h-3.5 w-3.5" />
                          {t("edit_username")}
                        </span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="rounded-lg bg-gradient-to-r from-red-500/80 to-red-600 p-2.5 text-xs font-bold text-white transition-all hover:from-red-500 hover:to-red-600 shadow-md hover:shadow-lg"
                      >
                        <span className="inline-flex items-center justify-center gap-1.5">
                          <LogOut className="h-3.5 w-3.5" />
                          {t("logout")}
                        </span>
                      </motion.button>
                    </div>

                    {/* API Button */}
                    {getUserQuery.data?.client && (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setMobileOpen(false);
                          navigate("/api");
                        }}
                        className="mt-3 w-full rounded-lg bg-gradient-to-r from-accent/80 to-accent p-2.5 text-xs font-bold text-white transition-all hover:from-accent hover:to-accent/90 shadow-md hover:shadow-lg"
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <Settings className="h-4 w-4" />
                          API {t("dashboard") || "Dashboard"}
                        </span>
                      </motion.button>
                    )}
                  </motion.div>
                ) : null}

                {/* Links */}
                {mobileLinks.map((link) => {
                  const active = link.match
                    ? link.match(pathname)
                    : pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-secondary text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-primary"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="inline-flex items-center gap-2">
                        {link.icon}
                        {link.label}
                      </span>
                    </Link>
                  );
                })}

                {/* Social */}
                {socialReady && (
                  <div className="mt-3 flex items-center justify-center gap-5">
                    <Link to={"https://www.facebook.com/share/18sYGZ5Lfk/"}>
                      <FaFacebook className="h-5 w-5 text-blue-500" />
                    </Link>
                    <Link
                      to={
                        "https://www.instagram.com/ak_store500?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                      }
                    >
                      <FaInstagram className="h-5 w-5 text-orange-500" />
                    </Link>
                    <Link to={"https://t.me/AK15Store"}>
                      <FaTelegram className="h-5 w-5 text-blue-300" />
                    </Link>
                    <Link
                      to={
                        "https://whatsapp.com/channel/0029VaxeYmZHwXbJDYfOWG3S"
                      }
                    >
                      <FaWhatsapp className="h-5 w-5 text-green-500" />
                    </Link>
                    <Link to={`tel:+963962113050`}>
                      <FaPhone className="h-5 w-5 text-foreground" />
                    </Link>
                  </div>
                )}

                {/* Language */}
                <button
                  onClick={() => {
                    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
                  }}
                  className="mt-3 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {i18n.language === "ar" ? "English" : "العربية"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* EDIT USER DIALOG */}
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

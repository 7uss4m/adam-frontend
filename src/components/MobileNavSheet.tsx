import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Code2,
  LogOut,
  Settings,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaRegUser,
  FaTelegram,
  FaWhatsapp,
  FaPhone,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

import type { User } from "../types/types";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import GoogleOAuth from "./GoogleAuth";
import NavLogin from "./nav-login";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { cn } from "../lib/utils";

export type NavItem = {
  label: string;
  to: string;
  icon?: React.ReactNode;
  auth?: "any" | "guest" | "user";
  match?: (pathname: string) => boolean;
};

const ROUTE_GRADIENTS: Record<string, string> = {
  "/": "from-sky-500 to-blue-600",
  "/add-balance": "from-emerald-500 to-teal-600",
  "/payments": "from-amber-500 to-orange-600",
  "/wallet": "from-violet-500 to-purple-600",
  "/orders": "from-blue-500 to-cyan-600",
  "/referral": "from-rose-500 to-pink-600",
  "/about-us": "from-slate-500 to-slate-600",
  "/api": "from-amber-500 to-orange-600",
};

type MobileNavSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navItems: NavItem[];
  isAuthed: boolean;
  isLoading: boolean;
  hasToken: boolean;
  user?: User;
  currency: "syrian" | "dollar";
  onCurrencyChange: (currency: "syrian" | "dollar") => void;
  onEditProfile: () => void;
  onLogout: () => void;
  socialReady: boolean;
};

function NavGridCard({
  link,
  active,
  onNavigate,
  horizontal = false,
}: {
  link: NavItem;
  active: boolean;
  onNavigate: () => void;
  horizontal?: boolean;
}) {
  const gradient = ROUTE_GRADIENTS[link.to] ?? "from-primary to-accent";

  if (horizontal) {
    return (
      <Link to={link.to} onClick={onNavigate} className="block">
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
            active
              ? "border-primary/50 bg-primary/10 shadow-md shadow-primary/10"
              : "border-border/60 bg-card/60 hover:border-primary/30 hover:bg-card hover:shadow-sm"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
              gradient
            )}
          >
            <span className="[&_svg]:h-5 [&_svg]:w-5">{link.icon}</span>
          </div>
          <span
            className={cn(
              "text-sm font-bold",
              active ? "text-primary" : "text-foreground"
            )}
          >
            {link.label}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={link.to} onClick={onNavigate} className="block">
      <div
        className={cn(
          "flex flex-col items-center gap-2 rounded-2xl border p-3.5 text-center transition-all",
          active
            ? "border-primary/50 bg-primary/10 shadow-md shadow-primary/10"
            : "border-border/60 bg-card/60 hover:border-primary/30 hover:bg-card hover:shadow-sm"
        )}
      >
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            gradient
          )}
        >
          <span className="[&_svg]:h-5 [&_svg]:w-5">{link.icon}</span>
        </div>
        <span
          className={cn(
            "text-xs font-bold leading-tight",
            active ? "text-primary" : "text-foreground"
          )}
        >
          {link.label}
        </span>
      </div>
    </Link>
  );
}

export default function MobileNavSheet({
  open,
  onOpenChange,
  navItems,
  isAuthed,
  isLoading,
  hasToken,
  user,
  currency,
  onCurrencyChange,
  onEditProfile,
  onLogout,
  socialReady,
}: MobileNavSheetProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [t, i18n] = useTranslation("global");
  const isRtl = i18n.language === "ar";

  const close = () => onOpenChange(false);

  const gridLinks = navItems.filter((x) => x.to !== "/about-us");
  const aboutLink = navItems.find((x) => x.to === "/about-us");

  const balanceLabel =
    currency === "syrian"
      ? `${user?.balance.toFixed(0) ?? 0} SYP`
      : `$${user?.balance.toFixed(2) ?? "0.00"}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isRtl ? "right" : "left"}
        dir={isRtl ? "rtl" : "ltr"}
        className="flex w-[min(100vw,360px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b border-border/50 px-5 py-4 text-start">
          <SheetTitle className="text-base font-black">UBBA</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!hasToken && (
            <div className="mb-4 space-y-3">
              <NavLogin />
              <GoogleOAuth />
            </div>
          )}

          {hasToken && isLoading && (
            <p className="mb-4 text-sm text-muted-foreground">{t("loading")}</p>
          )}

          {isAuthed && user && (
            <div className="mb-4 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="flex h-12 w-12 shrink-0 items-center justify-center bg-gradient-to-br from-primary to-accent text-white">
                  <FaRegUser className="h-6 w-6" />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">
                    {user.user_name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t("balance")}:{" "}
                    <span className="font-semibold text-primary">{balanceLabel}</span>
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("currency")}
                </label>
                <select
                  value={currency}
                  onChange={(e) =>
                    onCurrencyChange(e.target.value as "syrian" | "dollar")
                  }
                  aria-label={t("currency")}
                  className="w-full cursor-pointer bg-transparent text-sm font-medium outline-none"
                >
                  <option value="syrian">{t("syrian_pound")}</option>
                  <option value="dollar">{t("usd_dollar")}</option>
                </select>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl text-xs font-bold"
                  onClick={() => {
                    close();
                    onEditProfile();
                  }}
                >
                  <Settings className="h-3.5 w-3.5" />
                  {t("edit_username")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-9 gap-1.5 rounded-xl text-xs font-bold"
                  onClick={() => {
                    close();
                    onLogout();
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t("logout")}
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {gridLinks.map((link) => {
              const active = link.match ? link.match(pathname) : pathname === link.to;
              return (
                <NavGridCard
                  key={link.to}
                  link={link}
                  active={active}
                  onNavigate={close}
                />
              );
            })}

            {isAuthed && user?.client && (
              <button
                type="button"
                onClick={() => {
                  close();
                  navigate("/api");
                }}
                className="block w-full text-start"
              >
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-3.5 text-center transition-all hover:border-primary/30 hover:bg-card hover:shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold leading-tight text-foreground">
                    API {t("dashboard")}
                  </span>
                </div>
              </button>
            )}
          </div>

          {aboutLink && (
            <div className="mt-3">
              <NavGridCard
                link={aboutLink}
                horizontal
                active={
                  aboutLink.match
                    ? aboutLink.match(pathname)
                    : pathname === aboutLink.to
                }
                onNavigate={close}
              />
            </div>
          )}

          {socialReady && (
            <div className="mt-5 flex items-center justify-center gap-4 border-t border-border/40 pt-4">
              <Link
                to="https://www.facebook.com/share/18sYGZ5Lfk/"
                target="_blank"
                rel="noreferrer"
                onClick={close}
              >
                <FaFacebook className="h-5 w-5 text-blue-500" />
              </Link>
              <Link
                to="https://www.instagram.com/ak_store500?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noreferrer"
                onClick={close}
              >
                <FaInstagram className="h-5 w-5 text-orange-500" />
              </Link>
              <Link
                to="https://t.me/AK15Store"
                target="_blank"
                rel="noreferrer"
                onClick={close}
              >
                <FaTelegram className="h-5 w-5 text-blue-300" />
              </Link>
              <Link
                to="https://whatsapp.com/channel/0029VaxeYmZHwXbJDYfOWG3S"
                target="_blank"
                rel="noreferrer"
                onClick={close}
              >
                <FaWhatsapp className="h-5 w-5 text-green-500" />
              </Link>
              <Link to="tel:+963962113050" onClick={close}>
                <FaPhone className="h-5 w-5 text-foreground" />
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const next = i18n.language === "ar" ? "en" : "ar";
              i18n.changeLanguage(next);
              localStorage.setItem("lng", next);
            }}
            className="mt-4 w-full rounded-xl border border-border/60 bg-secondary/50 py-2.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {i18n.language === "ar" ? "English" : "العربية"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

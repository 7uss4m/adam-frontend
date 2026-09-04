import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaBox,
  FaCashRegister,
  FaInfo,
  FaLevelUpAlt,
  FaMoneyCheck,
  FaRegUser,
  FaStickyNote,
} from "react-icons/fa";
import { BiCategoryAlt } from "react-icons/bi";
import { PiSubtractDuotone } from "react-icons/pi";
import { RiAdvertisementLine } from "react-icons/ri";
import { BsCartCheck } from "react-icons/bs";
import { MdAdminPanelSettings, MdInventory } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import {
  BarChart3,
  Calendar as CalendarIcon,
  ClipboardList,
  Coins,
  HandCoins,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  LucideBox,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import logo from "../assets/logo.webp";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import getUser from "../api/getUser";
import Spinner from "../components/Spinner";
import postAdminLogin from "../api/postAdminLogin";
import postAdminVerify from "../api/postAdminVerify";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AxiosError } from "axios";
import { useToast } from "../components/ui/use-toast";
import { ModeToggle } from "../components/mode-toggle";
import type { User } from "../types/types";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { cn } from "../lib/utils";
import { restoreBodyPointerEvents } from "../lib/restore-body-pointer-events";
import { useMaintenanceMode } from "../hooks/useMaintenanceMode";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "../components/ui/sheet";

type NavItem = {
  to: string;
  labelKey: string;
  icon: React.ReactNode;
  end?: boolean;
};

type NavGroup = {
  labelKey?: string;
  items: NavItem[];
};

function buildAdminNav(d: string): NavGroup[] {
  return [
    {
      items: [
        {
          to: `/${d}`,
          labelKey: "dashboard_overview",
          icon: <LayoutDashboard className="h-4 w-4" />,
          end: true,
        },
      ],
    },
    {
      labelKey: "management",
      items: [
        { to: `/${d}/clients`, labelKey: "clients", icon: <HandCoins className="h-4 w-4" /> },
        { to: `/${d}/admins`, labelKey: "employees", icon: <MdAdminPanelSettings className="h-4 w-4" /> },
        { to: `/${d}/users`, labelKey: "users", icon: <FaRegUser className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: "catalog",
      items: [
        { to: `/${d}/categories`, labelKey: "categories", icon: <BiCategoryAlt className="h-4 w-4" /> },
        { to: `/${d}/categories/sub`, labelKey: "sub_categories", icon: <PiSubtractDuotone className="h-4 w-4" /> },
        { to: `/${d}/main-categories`, labelKey: "main_categories", icon: <LayoutGrid className="h-4 w-4" /> },
        { to: `/${d}/products`, labelKey: "products", icon: <LucideBox className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: "sales",
      items: [
        { to: `/${d}/orders`, labelKey: "orders", icon: <BsCartCheck className="h-4 w-4" /> },
        { to: `/${d}/charges`, labelKey: "charges", icon: <FaCashRegister className="h-4 w-4" /> },
        { to: `/${d}/debts`, labelKey: "debts", icon: <FaMoneyCheck className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: "content",
      items: [
        { to: `/${d}/ads`, labelKey: "ads", icon: <RiAdvertisementLine className="h-4 w-4" /> },
        { to: `/${d}/levels`, labelKey: "levels", icon: <FaLevelUpAlt className="h-4 w-4" /> },
        { to: `/${d}/currencies`, labelKey: "currencies", icon: <Coins className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: "system",
      items: [
        { to: `/${d}/inventory`, labelKey: "inventory", icon: <MdInventory className="h-4 w-4" /> },
        { to: `/${d}/reports`, labelKey: "reports", icon: <BarChart3 className="h-4 w-4" /> },
        { to: `/${d}/boxes`, labelKey: "charge_boxes", icon: <FaBox className="h-4 w-4" /> },
        { to: `/${d}/notes`, labelKey: "notes", icon: <FaStickyNote className="h-4 w-4" /> },
        { to: `/${d}/reconciliation`, labelKey: "daily_reconciliation", icon: <CalendarIcon className="h-4 w-4" /> },
        { to: `/${d}/activity-logs`, labelKey: "activity_log", icon: <ClipboardList className="h-4 w-4" /> },
        { to: `/${d}/notifications`, labelKey: "notifications", icon: <IoNotifications className="h-4 w-4" /> },
        { to: `/${d}/info`, labelKey: "info", icon: <FaInfo className="h-4 w-4" /> },
      ],
    },
  ];
}


const PAGE_TITLE_KEYS: Record<string, string> = {
  "/": "dashboard_overview",
  "/clients": "clients",
  "/admins": "admins",
  "/users": "users",
  "/main-categories": "main_categories",
  "/categories": "categories",
  "/categories/sub": "sub_categories",
  "/products": "products",
  "/orders": "orders",
  "/ads": "ads",
  "/levels": "levels",
  "/currencies": "currencies",
  "/charges": "charges",
  "/debts": "debts",
  "/inventory": "inventory",
  "/reports": "reports",
  "/boxes": "charge_boxes",
  "/notes": "notes",
  "/reconciliation": "daily_reconciliation",
  "/activity-logs": "activity_log",
  "/notifications": "notifications",
  "/info": "info",
};

function resolvePageTitle(pathname: string, dashPath: string, t: (k: string) => string) {
  const relative = pathname.replace(`/${dashPath}`, "") || "/";
  if (PAGE_TITLE_KEYS[relative]) return t(PAGE_TITLE_KEYS[relative]);
  if (relative.includes("/products")) return t("products");
  if (relative.includes("/debits")) return t("debts");
  if (relative.includes("/orders")) return t("orders");
  if (relative.includes("/sub")) return t("sub_categories");
  return t("dashboard_overview");
}

function NavLinkItem({
  item,
  t,
  onClick,
}: {
  item: NavItem;
  t: (k: string) => string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/25"
            : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/60 transition-colors",
              isActive && "bg-primary/20 text-primary"
            )}
          >
            {item.icon}
          </span>
          <span className="truncate">{t(item.labelKey)}</span>
        </>
      )}
    </NavLink>
  );
}

function SidebarNav({
  groups,
  t,
  onClickLink,
  className,
}: {
  groups: NavGroup[];
  t: (k: string) => string;
  onClickLink?: () => void;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "dashboard-nav-scroll flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4",
        className
      )}
    >
      {groups.map((group, gi) => (
        <div key={gi} className="space-y-1">
          {group.labelKey && (
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              {t(group.labelKey)}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavLinkItem key={item.to} item={item} t={t} onClick={onClickLink} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({
  t,
  i18n,
  isAdmin,
  onLogout,
  onLangChange,
  setSmallNav,
  small,
}: {
  t: (k: string) => string;
  i18n: { language: string };
  isAdmin: boolean;
  onLogout: () => void;
  onLangChange: (v: string) => void;
  setSmallNav?: React.Dispatch<React.SetStateAction<boolean>>;
  small?: boolean;
}) {
  return (
    <div className="shrink-0 space-y-2 border-t border-border/50 p-3">
      {isAdmin && (
        <DropdownMenu dir={i18n.language === "en" ? "ltr" : "rtl"}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-center text-sm">
              {i18n.language === "en" ? "English" : "العربية"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup onValueChange={onLangChange}>
              <DropdownMenuRadioItem value="en">{t("english")}</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ar">{t("arabic")}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="flex-1 gap-2 text-muted-foreground hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </Button>
        <ModeToggle setOpen={setSmallNav ?? (() => {})} small={small ?? false} />
      </div>
    </div>
  );
}

function LoginCard({
  t,
  emailRef,
  passwordRef,
  onLogin,
  isPending,
  show2FA,
  codeRef,
  onVerify,
  isVerifying,
  onBack,
}: {
  t: (k: string) => string;
  emailRef: React.RefObject<HTMLInputElement>;
  passwordRef: React.RefObject<HTMLInputElement>;
  onLogin: () => void;
  isPending: boolean;
  show2FA: boolean;
  codeRef: React.RefObject<HTMLInputElement>;
  onVerify: () => void;
  isVerifying: boolean;
  onBack: () => void;
}) {
  return (
    <section className="dashboard-mesh-bg flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-xl" />
        <Card className="relative border-border/60 bg-card/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="items-center space-y-4 pb-2 text-center">
            <img src={logo} alt="AdamZone" className="h-16 w-16 rounded-2xl object-contain" />
            <CardTitle className="text-xl">
              {show2FA ? t("verify_code") || "التحقق من الرمز" : t("admin_login")}
            </CardTitle>
            {show2FA && (
              <p className="text-sm text-muted-foreground">
                {t("code_sent_to_email") || "تم إرسال رمز التحقق إلى بريدك الإلكتروني"}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {!show2FA ? (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input ref={emailRef} id="email" className="bg-background/60" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Input
                    ref={passwordRef}
                    id="password"
                    type="password"
                    className="bg-background/60"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary font-bold"
                  disabled={isPending}
                >
                  {isPending ? t("logging") : t("login")}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" autoComplete="off" onSubmit={(e) => { e.preventDefault(); onVerify(); }}>
                {/* fake fields to absorb Chrome autofill */}
                <input type="text" name="username" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden="true" />
                <input type="password" name="password" autoComplete="current-password" className="hidden" tabIndex={-1} aria-hidden="true" />
                <div className="space-y-1.5">
                  <Label htmlFor="code">{t("verification_code") || "رمز التحقق"}</Label>
                  <Input
                    ref={codeRef}
                    id="code"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    readOnly
                    onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
                    className="bg-background/60 text-center text-2xl tracking-[0.5em] font-mono"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary font-bold"
                  disabled={isVerifying}
                >
                  {isVerifying ? t("verifying") || "جاري التحقق..." : t("verify") || "تحقق"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={onBack}
                >
                  {t("back") || "رجوع"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function DashboardLayout() {
  const token = localStorage.getItem("token");
  const d = import.meta.env.VITE_DASHBOARD;
  const dashPath = `/${d}`;

  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const getUserQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await getUser(token as string);
      return response.data.result as User;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const translateServerError = (msg: string) => {
    const key = `server_${msg.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
    const translated = t(key);
    return translated !== key ? translated : msg;
  };

  const handleLogin = () => {
    const email = emailRef.current?.value?.trim();
    const password = passwordRef.current?.value;
    if (!email || !password) {
      toast({
        title: t("error"),
        description: t("fill_all_fields"),
        variant: "destructive",
      });
      return;
    }
    adminLoginMutation.mutate();
  };

  const adminLoginMutation = useMutation({
    mutationFn: async () => {
      const email = emailRef.current?.value as string;
      const response = await postAdminLogin(
        email,
        passwordRef.current?.value as string
      );
      return { ...response, email };
    },
    onSuccess: (data) => {
      if (data.data.requires2FA) {
        setLoginEmail(data.email);
        setShow2FA(true);
        toast({
          title: t("verify_code"),
          description: t("code_sent_to_email"),
        });
        return;
      }
      localStorage.setItem("token", data.data.token);
      navigate(0);
    },
    onError: (error: AxiosError) => {
      const msg = (error.response?.data as { error: string })?.error || "";
      toast({
        title: t("error"),
        description: translateServerError(msg),
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await postAdminVerify(
        loginEmail,
        codeRef.current?.value as string
      );
      return response;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.data.token);
      setShow2FA(false);
      navigate(0);
    },
    onError: (error: AxiosError) => {
      const msg = (error.response?.data as { error: string })?.error || "";
      toast({
        title: t("error"),
        description: translateServerError(msg),
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [mobileOpen]);

  useEffect(() => {
    const timer = window.setInterval(restoreBodyPointerEvents, 800);
    return () => window.clearInterval(timer);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate(0);
  };

  const changeLang = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem("lng", value);
    navigate(0);
  };

  const userType = getUserQuery.data?.type;
  const isAdmin = userType === "admin";
  const isEmployee = userType === "employee" || userType === "orders";
  const user = getUserQuery.data;
  const userPermissions: string[] = (() => {
    if (user?.permissions) {
      if (Array.isArray(user.permissions)) return user.permissions;
      try { return JSON.parse(user.permissions as string); } catch { return []; }
    }
    return userType === "orders" ? ["orders"] : [];
  })();

  const ROUTE_PERMISSION_MAP: Record<string, string> = {
    "/clients": "clients",
    "/admins": "admins",
    "/users": "users",
    "/categories": "categories",
    "/categories/sub": "categories",
    "/main-categories": "main_categories",
    "/products": "products",
    "/orders": "orders",
    "/charges": "charges",
    "/debts": "debts",
    "/ads": "ads",
    "/levels": "levels",
    "/currencies": "currencies",
    "/inventory": "inventory",
    "/reports": "reports",
    "/boxes": "boxes",
    "/notes": "notes",
    "/reconciliation": "reconciliation",
    "/activity-logs": "activity_logs",
    "/notifications": "notifications",
    "/info": "info",
  };

  const buildFilteredNav = (groups: NavGroup[], permissions: string[]): NavGroup[] => {
    return groups
      .map((group) => {
        const filteredItems = group.items.filter((item) => {
          const relativePath = item.to.replace(`/${d}`, "") || "/";
          if (relativePath === "/" || relativePath === "") return true;
          const requiredPermission = ROUTE_PERMISSION_MAP[relativePath];
          if (!requiredPermission) return true;
          return permissions.includes(requiredPermission);
        });
        if (filteredItems.length === 0) return null;
        return { ...group, items: filteredItems };
      })
      .filter((g): g is NavGroup => g !== null);
  };

  const navGroups = useMemo(() => {
    if (isAdmin) return buildAdminNav(d);
    if (isEmployee) return buildFilteredNav(buildAdminNav(d), userPermissions);
    return buildAdminNav(d);
  }, [d, isAdmin, isEmployee, userPermissions]);

  const pageTitle = resolvePageTitle(pathname, d, t);
  const isHome = pathname === dashPath || pathname === `${dashPath}/`;
  const { data: maintenanceActive } = useMaintenanceMode({ refetchInterval: 20_000 });

  const sidebarContent = (onClickLink?: () => void, mobile = false) => (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        mobile && "h-full max-h-[100dvh] overflow-hidden"
      )}
    >
      <Link
        to={dashPath}
        onClick={onClickLink}
        className="relative flex shrink-0 items-center gap-3 border-b border-border/50 px-4 py-5"
      >
        <img src={logo} alt="AdamZone" className="h-10 w-10 rounded-xl object-contain" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-foreground">AdamZone</p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("dashboard") || "Dashboard"}
          </p>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setMobileOpen(false);
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </Link>

      <SidebarNav
        groups={navGroups}
        t={t}
        onClickLink={onClickLink}
        className={mobile ? "min-h-0 touch-pan-y" : undefined}
      />

      {user && (
        <div className="mx-3 mb-2 shrink-0 rounded-xl border border-border/40 bg-secondary/30 px-3 py-2.5">
          <p className="truncate text-xs font-bold text-foreground">
            {user.user_name || (user as any).name}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
        </div>
      )}

      <SidebarFooter
        t={t}
        i18n={i18n}
        isAdmin={isAdmin || isEmployee}
        onLogout={logout}
        onLangChange={changeLang}
        setSmallNav={mobile ? setMobileOpen : undefined}
        small={mobile}
      />
    </div>
  );

  return (
    <div className="dashboard min-h-screen bg-background">
      {getUserQuery.isLoading ? (
          <div className="flex min-h-screen items-center justify-center">
            <Spinner />
          </div>
        ) : getUserQuery.isError ? (
          <LoginCard
            t={t}
            emailRef={emailRef}
            passwordRef={passwordRef}
            onLogin={handleLogin}
            isPending={adminLoginMutation.isPending}
            show2FA={show2FA}
            codeRef={codeRef}
            onVerify={() => verifyMutation.mutate()}
            isVerifying={verifyMutation.isPending}
            onBack={() => setShow2FA(false)}
          />
        ) : isAdmin || isEmployee ? (
          <div className="min-h-screen md:flex md:h-screen md:overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="hidden h-screen w-[260px] shrink-0 flex-col border-e border-border/50 bg-card/50 backdrop-blur-xl md:flex">
              {sidebarContent()}
            </aside>

            {/* Mobile drawer — portal fixed, لا يتحرك مع scroll الصفحة */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetContent
                side={i18n.language === "ar" ? "right" : "left"}
                dir={i18n.language === "en" ? "ltr" : "rtl"}
                className={cn(
                  "flex w-[min(288px,88vw)] max-w-none flex-col gap-0 border-border/50 bg-card p-0 pb-[env(safe-area-inset-bottom)] shadow-2xl",
                  "h-[100dvh] max-h-[100dvh] overscroll-none",
                  "[&>button]:hidden"
                )}
                onCloseAutoFocus={(e) => {
                  e.preventDefault();
                  restoreBodyPointerEvents();
                }}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <SheetTitle className="sr-only">{t("dashboard")}</SheetTitle>
                {sidebarContent(() => setMobileOpen(false), true)}
              </SheetContent>
            </Sheet>

            {/* Main column */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {/* Top bar */}
              <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl md:h-16 md:px-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>

                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-base font-black text-foreground md:text-lg">
                    {pageTitle}
                  </h1>
                  {!isHome && (
                    <Link
                      to={dashPath}
                      className="text-[11px] font-medium text-muted-foreground hover:text-primary"
                    >
                      ← {t("dashboard_overview")}
                    </Link>
                  )}
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                  <div className="rounded-xl border border-border/40 bg-secondary/30 px-3 py-1.5 text-end">
                    <p className="text-xs font-bold text-foreground">
                      {user?.user_name || user?.email}
                    </p>
                    <p className="text-[10px] capitalize text-muted-foreground">{userType}</p>
                  </div>
                </div>
              </header>

              {maintenanceActive && (
                <div className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs font-semibold text-amber-700 dark:text-amber-300 md:text-sm">
                  {t("maintenance_dashboard_banner")}
                </div>
              )}

              {/* Page content — scroll مستقل عن الـ drawer */}
              <main className="dashboard-content dashboard-mesh-bg overflow-x-hidden md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-y-contain">
                <Outlet />
              </main>
            </div>
          </div>
        ) : (
          <LoginCard
            t={t}
            emailRef={emailRef}
            passwordRef={passwordRef}
            onLogin={handleLogin}
            isPending={adminLoginMutation.isPending}
            show2FA={show2FA}
            codeRef={codeRef}
            onVerify={() => verifyMutation.mutate()}
            isVerifying={verifyMutation.isPending}
            onBack={() => setShow2FA(false)}
          />
        )}

    </div>
  );
}

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
  Coins,
  HandCoins,
  LayoutDashboard,
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import getUser from "../api/getUser";
import Spinner from "../components/Spinner";
import postAdminLogin from "../api/postAdminLogin";
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
        { to: `/${d}/admins`, labelKey: "admins", icon: <MdAdminPanelSettings className="h-4 w-4" /> },
        { to: `/${d}/users`, labelKey: "users", icon: <FaRegUser className="h-4 w-4" /> },
      ],
    },
    {
      labelKey: "catalog",
      items: [
        { to: `/${d}/categories`, labelKey: "categories", icon: <BiCategoryAlt className="h-4 w-4" /> },
        { to: `/${d}/categories/sub`, labelKey: "sub_categories", icon: <PiSubtractDuotone className="h-4 w-4" /> },
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
        { to: `/${d}/notifications`, labelKey: "notifications", icon: <IoNotifications className="h-4 w-4" /> },
        { to: `/${d}/info`, labelKey: "info", icon: <FaInfo className="h-4 w-4" /> },
      ],
    },
  ];
}

function buildOrdersNav(d: string): NavGroup[] {
  return [
    {
      items: [
        {
          to: `/${d}`,
          labelKey: "dashboard_overview",
          icon: <LayoutDashboard className="h-4 w-4" />,
          end: true,
        },
        { to: `/${d}/clients`, labelKey: "clients", icon: <HandCoins className="h-4 w-4" /> },
        { to: `/${d}/orders`, labelKey: "orders", icon: <BsCartCheck className="h-4 w-4" /> },
      ],
    },
  ];
}

const PAGE_TITLE_KEYS: Record<string, string> = {
  "/": "dashboard_overview",
  "/clients": "clients",
  "/admins": "admins",
  "/users": "users",
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
}: {
  groups: NavGroup[];
  t: (k: string) => string;
  onClickLink?: () => void;
}) {
  return (
    <nav className="dashboard-nav-scroll flex-1 space-y-5 overflow-y-auto px-3 py-4">
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
  setSmallNav?: (v: boolean) => void;
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
}: {
  t: (k: string) => string;
  emailRef: React.RefObject<HTMLInputElement>;
  passwordRef: React.RefObject<HTMLInputElement>;
  onLogin: () => void;
  isPending: boolean;
}) {
  return (
    <section className="dashboard-mesh-bg flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-xl" />
        <Card className="relative border-border/60 bg-card/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="items-center space-y-4 pb-2 text-center">
            <img src={logo} alt="AdamZone" className="h-16 w-16 rounded-2xl object-contain" />
            <CardTitle className="text-xl">{t("admin_login")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
            </form>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full gradient-primary font-bold"
              disabled={isPending}
              onClick={onLogin}
            >
              {isPending ? t("logging") : t("login")}
            </Button>
          </CardFooter>
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
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  const getUserQuery = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await getUser(token as string);
      return response.data.result as User;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const adminLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await postAdminLogin(
        emailRef.current?.value as string,
        passwordRef.current?.value as string
      );
      return response;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.data.token);
      navigate(0);
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!mobileOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [mobileOpen]);

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
  const isOrders = userType === "orders";
  const user = getUserQuery.data;

  const navGroups = useMemo(
    () => (isOrders ? buildOrdersNav(d) : buildAdminNav(d)),
    [d, isOrders]
  );

  const pageTitle = resolvePageTitle(pathname, d, t);
  const isHome = pathname === dashPath || pathname === `${dashPath}/`;

  const sidebarContent = (onClickLink?: () => void) => (
    <>
      <Link
        to={dashPath}
        onClick={onClickLink}
        className="flex shrink-0 items-center gap-3 border-b border-border/50 px-4 py-5"
      >
        <img src={logo} alt="AdamZone" className="h-10 w-10 rounded-xl object-contain" />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-foreground">AdamZone</p>
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("dashboard") || "Dashboard"}
          </p>
        </div>
      </Link>

      <SidebarNav groups={navGroups} t={t} onClickLink={onClickLink} />

      {user && (
        <div className="mx-3 mb-2 rounded-xl border border-border/40 bg-secondary/30 px-3 py-2.5">
          <p className="truncate text-xs font-bold text-foreground">
            {user.user_name || user.name}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
        </div>
      )}

      <SidebarFooter
        t={t}
        i18n={i18n}
        isAdmin={isAdmin}
        onLogout={logout}
        onLangChange={changeLang}
        setSmallNav={setMobileOpen}
        small={!!onClickLink}
      />
    </>
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
            onLogin={() => adminLoginMutation.mutate()}
            isPending={adminLoginMutation.isPending}
          />
        ) : isAdmin || isOrders ? (
          <div className="flex min-h-screen">
            {/* Desktop sidebar */}
            <aside className="hidden w-[260px] shrink-0 flex-col border-e border-border/50 bg-card/50 backdrop-blur-xl md:flex">
              {sidebarContent()}
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
              <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                onClick={() => setMobileOpen(false)}
              />
            )}

            {/* Mobile sidebar */}
            <aside
              ref={mobileNavRef}
              className={cn(
                "fixed inset-y-0 start-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-e border-border/50 bg-card shadow-2xl transition-transform duration-300 md:hidden",
                mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
              )}
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
              {sidebarContent(() => setMobileOpen(false))}
            </aside>

            {/* Main column */}
            <div className="flex min-w-0 flex-1 flex-col">
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

              {/* Page content */}
              <main className="dashboard-content dashboard-mesh-bg flex-1 overflow-x-hidden">
                <Outlet />
              </main>
            </div>
          </div>
        ) : (
          <LoginCard
            t={t}
            emailRef={emailRef}
            passwordRef={passwordRef}
            onLogin={() => adminLoginMutation.mutate()}
            isPending={adminLoginMutation.isPending}
          />
        )}

    </div>
  );
}

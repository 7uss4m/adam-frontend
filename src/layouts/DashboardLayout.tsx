import { Link, Outlet, useNavigate } from "react-router-dom";
import { ThemeProvider } from "../components/theme-provider";

// assets
import {
  FaBox,
  FaCashRegister,
  FaInfo,
  FaLevelUpAlt,
  FaMoneyCheck,
  FaRegUser,
  FaStickyNote,
} from "react-icons/fa";
import { BiCategoryAlt, BiRightArrow } from "react-icons/bi";
import { PiSubtractDuotone } from "react-icons/pi";
import { RiAdvertisementLine } from "react-icons/ri";
import { BsCartCheck } from "react-icons/bs";
import { MdAdminPanelSettings, MdInventory } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";

import { HandCoins, LucideBox, X, Coins } from "lucide-react";

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
import { Toaster } from "../components/ui/toaster";
import { useMutation, useQuery } from "@tanstack/react-query";
import getUser from "../api/getUser";
import Spinner from "../components/Spinner";
import postAdminLogin from "../api/postAdminLogin";
import { useEffect, useRef, useState } from "react";
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

function NavLinks({
  d,
  t,
  onClickLink,
  variant,
}: {
  d: string;
  t: (k: string) => string;
  onClickLink?: () => void;
  variant: "admin" | "orders";
}) {
  if (variant === "orders") {
    return (
      <ul className="links flex-1 p-5 space-y-5">
        <li>
          <Link
            onClick={onClickLink}
            className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
            to={`/${d}/clients`}
          >
            <HandCoins /> {t("clients")}
          </Link>
        </li>
        <li>
          <Link
            onClick={onClickLink}
            className="flex items-center gap-2 p-2 hover:bg-secondary/5 rounded transition-all"
            to={`/${d}/orders`}
          >
            <BsCartCheck /> {t("orders")}
          </Link>
        </li>
      </ul>
    );
  }

  return (
    <ul className="links flex-1 p-5 space-y-5">
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/clients`}
        >
          <HandCoins /> {t("clients")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/admins`}
        >
          <MdAdminPanelSettings /> {t("admins")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/users`}
        >
          <FaRegUser /> {t("users")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/categories`}
        >
          <BiCategoryAlt /> {t("categories")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/categories/sub`}
        >
          <PiSubtractDuotone /> {t("sub_categories")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/products`}
        >
          <LucideBox /> {t("products")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary/5 rounded transition-all"
          to={`/${d}/orders`}
        >
          <BsCartCheck /> {t("orders")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/ads`}
        >
          <RiAdvertisementLine /> {t("ads")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/levels`}
        >
          <FaLevelUpAlt /> {t("levels")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/currencies`}
        >
          <Coins className="w-4 h-4" /> العملات
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/charges`}
        >
          <FaCashRegister /> {t("charges")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary rounded transition-all"
          to={`/${d}/debts`}
        >
          <FaMoneyCheck /> {t("debts")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary/5 rounded transition-all"
          to={`/${d}/inventory`}
        >
          <MdInventory /> {t("inventory")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary/5 rounded transition-all"
          to={`/${d}/boxes`}
        >
          <FaBox /> {t("charge_boxes")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary/5 rounded transition-all"
          to={`/${d}/notes`}
        >
          <FaStickyNote /> {t("notes")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary/5 rounded transition-all"
          to={`/${d}/notifications`}
        >
          <IoNotifications /> {t("notifications")}
        </Link>
      </li>
      <li>
        <Link
          onClick={onClickLink}
          className="flex items-center gap-2 p-2 hover:bg-secondary/5 rounded transition-all"
          to={`/${d}/info`}
        >
          <FaInfo /> {t("info")}
        </Link>
      </li>
    </ul>
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
    <section className="h-screen flex justify-center items-center col-span-12">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("admin_login")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">email</Label>
                <Input ref={emailRef} id="email" placeholder="" />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  ref={passwordRef}
                  id="password"
                  type="password"
                  placeholder=""
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              onLogin();
            }}
            variant={isPending ? "ghost" : "default"}
          >
            {isPending ? t("logging") : t("login")}
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}

export default function DashboardLayout() {
  const token = localStorage.getItem("token");
  const d = import.meta.env.VITE_DASHBOARD;

  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [smallNav, setSmallNav] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const smallNavRef = useRef<HTMLElement>(null);
  const smallNavBtnRef = useRef<HTMLButtonElement>(null);

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

  // ✅ Close small nav on outside click + ESC (ONLY when open)
  useEffect(() => {
    if (!smallNav) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const navEl = smallNavRef.current;
      const btnEl = smallNavBtnRef.current;
      const target = e.target as Node;

      if (!navEl || !btnEl) return;

      // close if click outside nav and not on button
      if (!navEl.contains(target) && !btnEl.contains(target)) {
        setSmallNav(false);
        return;
      }

      // close if click on any link inside nav
      const a = (target as HTMLElement)?.closest?.("a");
      if (a && navEl.contains(a)) setSmallNav(false);
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSmallNav(false);
    };

    window.addEventListener("click", handleOutsideClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [smallNav]);

  const logout = () => {
    localStorage.clear();
    navigate(0);
  };

  const userType = getUserQuery.data?.type;
  const isAdmin = userType === "admin";
  const isOrders = userType === "orders";

  return (
    <main className="dashboard grid grid-cols-12">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {getUserQuery.isLoading ? (
          <div className="h-screen col-span-12 flex justify-center items-center">
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
          <>
            {/* ===================== Desktop Nav ===================== */}
            <nav className="hidden md:flex relative min-h-screen flex-col justify-between col-span-2 border-r">
              <header className="p-5 border-b flex justify-center">
                <Link
                  className="text-xl flex justify-center items-center md:size-20"
                  to=""
                >
                  <img src={logo} alt="AdamZone" />
                </Link>
              </header>

              <NavLinks
                d={d}
                t={t}
                variant={isOrders ? "orders" : "admin"}
              />

              <div className="nav-footer">
                <ul className="px-5 space-y-2">
                  {isAdmin ? (
                    <DropdownMenu dir={i18n.language === "en" ? "ltr" : "rtl"}>
                      <DropdownMenuTrigger asChild>
                        <Button className="w-full" variant="outline">
                          {i18n.language === "en" ? "English" : "العربية"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          onValueChange={(value: string) => {
                            i18n.changeLanguage(value);
                            localStorage.setItem("lng", value);
                            navigate(0);
                          }}
                        >
                          <DropdownMenuRadioItem value="en">
                            {t("english")}
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="ar">
                            {t("arabic")}
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}

                  <Button className="w-full" onClick={logout}>
                    {t("logout")}
                  </Button>
                </ul>

                <div className="mode-toggle-wrap flex justify-end p-5">
                  <ModeToggle setOpen={setSmallNav} small={false} />
                </div>
              </div>
            </nav>

            {/* ===================== Mobile Menu Button ===================== */}
            <Button
              ref={smallNavBtnRef}
              className="md:hidden fixed left-0 top-0 z-50 rounded-none rounded-br"
              onClick={() => setSmallNav((v) => !v)}
              aria-label="Open menu"
            >
              <span className="absolute w-full h-full"></span>
              {smallNav ? <X className="h-5 w-5" /> : <BiRightArrow className="text-xl relative -z-10" />}
            </Button>

            {/* ===================== Mobile Overlay ===================== */}
            {smallNav && (
              <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
                onClick={() => setSmallNav(false)}
              />
            )}

            {/* ===================== Mobile Nav ===================== */}
            <nav
              ref={smallNavRef}
              className={`fixed inset-y-0 left-0 z-50 md:hidden
                w-[70%] max-w-xs
                bg-secondary text-primary border-r
                flex flex-col justify-between
                overflow-y-auto
                transition-transform duration-200
                ${smallNav ? "translate-x-0" : "-translate-x-full"}
              `}
            >
              <header className="p-5 border-b flex justify-center">
                <Link
                  onClick={() => setSmallNav(false)}
                  className="text-xl flex justify-center items-center size-14"
                  to=""
                >
                  <img src={logo} alt="AdamZone" />
                </Link>
              </header>

              <NavLinks
                d={d}
                t={t}
                variant={isOrders ? "orders" : "admin"}
                onClickLink={() => setSmallNav(false)}
              />

              <div className="nav-footer">
                <ul className="px-5 space-y-2">
                  {isAdmin ? (
                    <DropdownMenu dir={i18n.language === "en" ? "ltr" : "rtl"}>
                      <DropdownMenuTrigger asChild>
                        <Button className="w-full" variant="outline">
                          {i18n.language === "en" ? "English" : "العربية"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          onValueChange={(value: string) => {
                            i18n.changeLanguage(value);
                            localStorage.setItem("lng", value);
                            navigate(0);
                          }}
                        >
                          <DropdownMenuRadioItem value="en">
                            {t("english")}
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="ar">
                            {t("arabic")}
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}

                  <Button className="w-full" onClick={logout}>
                    {t("logout")}
                  </Button>
                </ul>

                <div className="mode-toggle-wrap flex justify-end p-5">
                  <ModeToggle setOpen={setSmallNav} small={true} />
                </div>
              </div>
            </nav>

            {/* ===================== Content ===================== */}
            <section className="min-h-screen col-span-12 md:col-span-10">
              <Outlet />
            </section>
          </>
        ) : (
          <LoginCard
            t={t}
            emailRef={emailRef}
            passwordRef={passwordRef}
            onLogin={() => adminLoginMutation.mutate()}
            isPending={adminLoginMutation.isPending}
          />
        )}

        <Toaster />
      </ThemeProvider>
    </main>
  );
}
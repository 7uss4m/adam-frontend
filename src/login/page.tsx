import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Moon,
  Package,
  ShieldCheck,
  Sun,
  User,
  Wallet,
} from "lucide-react";
import { BsTranslate } from "react-icons/bs";
import { useTranslation } from "react-i18next";

import logo from "../assets/logo.webp";
import postLogin from "../api/postLogin";
import postForgotPassword from "../api/postForgotPassword";
import getUser from "../api/getUser";
import GoogleOAuth from "../components/GoogleAuth";
import Spinner from "../components/Spinner";
import { ThemeProvider, useTheme } from "../components/theme-provider";
import MaintenanceGate from "../components/maintenance-gate";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "../components/ui/use-toast";
import { cn } from "../lib/utils";
import "../main.css";

const REMEMBER_EMAIL_KEY = "login_remember_email";

const FEATURES = [
  { key: "login_feature_secure", icon: ShieldCheck },
  { key: "login_feature_wallet", icon: Wallet },
  { key: "login_feature_products", icon: Package },
] as const;

function sanitizeRedirect(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/";
  if (path.startsWith("/login") || path.startsWith("/register")) return "/";
  return path;
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function LoginContent() {
  const [t, i18n] = useTranslation("global");

  const translateLoginError = (msg?: string) => {
    if (!msg) return t("something_wrong_happened");
    const map: Record<string, string> = {
      "User is linked with google": "server_user_is_linked_with_google",
      "User Not Found": "server_user_not_found",
      "Admin Not Found": "server_admin_not_found",
      "Password Not Correct": "server_password_not_correct",
    };
    const key = map[msg];
    if (!key) return msg;
    const translated = t(key);
    return translated === key ? msg : translated;
  };

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resolvedTheme, setTheme } = useTheme();
  const isRtl = i18n.language === "ar";
  const isDark = resolvedTheme === "dark";

  const redirectTo = useMemo(
    () => sanitizeRedirect(searchParams.get("redirect")),
    [searchParams]
  );

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    const emailParam = searchParams.get("email")?.trim();

    if (emailParam) {
      setEmail(emailParam);
      setRememberMe(true);
      return;
    }

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [searchParams]);

  const sessionQuery = useQuery({
    queryKey: ["login-session"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const response = await getUser(token);
      return response.data.result;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (sessionQuery.data) {
      navigate(redirectTo, { replace: true });
    }
  }, [sessionQuery.data, navigate, redirectTo]);

  const postLoginMutation = useMutation({
    mutationFn: async () => postLogin({ email: email.trim(), password }),
    onSuccess: (data) => {
      localStorage.setItem("token", data.data.token);
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      toast({ title: t("done") });
      navigate(redirectTo, { replace: true });
    },
    onError: (error: AxiosError) => {
      const msg = (error.response?.data as { error: string })?.error;
      if (msg === "Your Email Not Verify Please Verify it and try again") {
        navigate(`/verify?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      toast({ title: translateLoginError(msg), variant: "destructive" });
    },
  });

  const loading = postLoginMutation.isPending;
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const checkingSession =
    !!localStorage.getItem("token") &&
    (sessionQuery.isLoading || sessionQuery.isFetching);

  const toggleLanguage = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
    localStorage.setItem("lng", next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({ title: t("fill_all_fields"), variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: t("password_8"), variant: "destructive" });
      return;
    }
    postLoginMutation.mutate();
  };

  const forgotMutation = useMutation({
    mutationFn: async () => {
      const res = await postForgotPassword({ email: email.trim() });
      return res;
    },
    onSuccess: () => {
      setForgotOpen(false);
      toast({ title: t("reset_code_sent") });
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    },
    onError: (error: AxiosError) => {
      const msg = (error.response?.data as { error: string })?.error;
      toast({ title: translateLoginError(msg), variant: "destructive" });
    },
  });

  const handleForgotVerify = () => {
    if (!looksLikeEmail(email)) {
      toast({ title: t("missing_email"), variant: "destructive" });
      return;
    }
    forgotMutation.mutate();
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <Spinner />
          <p className="text-sm text-muted-foreground">{t("already_logged_in")}</p>
        </div>
      </div>
    );
  }

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="relative flex min-h-screen flex-col overflow-y-auto bg-background"
    >
      <div className="pointer-events-none fixed inset-0 app-grid-overlay opacity-40 dark:opacity-30" />
      <div className="pointer-events-none fixed -top-48 -end-32 h-[420px] w-[420px] rounded-full app-glow-cyan blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-48 -start-32 h-[480px] w-[480px] rounded-full app-glow-purple blur-[120px]" />

      <header className="relative z-20 flex items-center justify-between px-4 py-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/">
            <BackIcon className="h-4 w-4" />
            {t("home")}
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-border/60"
            onClick={toggleLanguage}
            aria-label="Toggle language"
          >
            <BsTranslate className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-border/60"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-start px-4 py-6 sm:px-6 lg:items-center lg:py-10">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_420px] lg:gap-12 xl:grid-cols-[1.1fr_440px]">
          <motion.section
            initial={{ opacity: 0, x: isRtl ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="space-y-8 pe-4">
              <div className="space-y-4">
                <img src={logo} alt="AdamZone" className="h-14 object-contain" />
                <div className="space-y-2">
                  <h1 className="text-3xl font-black tracking-tight text-foreground xl:text-4xl">
                    {t("welcome_back")}
                  </h1>
                  <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                    {t("login_subtitle")}
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {FEATURES.map(({ key, icon: Icon }, i) => (
                  <motion.li
                    key={key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/60 px-4 py-3 backdrop-blur-sm"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{t(key)}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            className="mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl shadow-primary/5 backdrop-blur-md">
              <div className="border-b border-border/50 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 px-5 py-5 text-center sm:px-8 sm:py-6">
                <img
                  src={logo}
                  alt="AdamZone"
                  className="mx-auto mb-3 h-10 object-contain lg:hidden"
                />
                <h2 className="text-2xl font-black text-foreground">{t("login")}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground lg:hidden">
                  {t("Log_in_and_enjoy_an_easy_shopping_experience")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("username_or_email")}</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="text"
                      autoComplete="username"
                      placeholder={t("username_or_email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 rounded-xl border-border/70 bg-background/80 ps-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="login-password">{t("password")}</Label>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => setForgotOpen(true)}
                    >
                      {t("forgot_password")}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder={t("password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                      className="h-11 rounded-xl border-border/70 bg-background/80 ps-10 pe-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Toggle password"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    disabled={loading}
                  />
                  <span className="text-sm text-muted-foreground">{t("remember_me")}</span>
                </label>

                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "h-11 w-full rounded-xl text-sm font-bold shadow-lg shadow-primary/20",
                    loading && "opacity-80"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t("loading")}
                    </>
                  ) : (
                    t("login")
                  )}
                </Button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t("or")}</span>
                  </div>
                </div>

                <GoogleOAuth redirectTo={redirectTo} disabled={loading} />

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t("no_account")}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl border-primary/30 font-bold text-primary hover:bg-primary/5"
                  onClick={() => navigate("/register")}
                  disabled={loading}
                >
                  {t("create_new_account")}
                </Button>
              </form>
            </div>
          </motion.section>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent dir={isRtl ? "rtl" : "ltr"} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("forgot_password_title")}</DialogTitle>
            <DialogDescription>{t("forgot_password_hint")}</DialogDescription>
          </DialogHeader>

          {email.trim() && (
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{email.trim()}</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setForgotOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleForgotVerify} disabled={forgotMutation.isPending}>
              {forgotMutation.isPending ? t("saving") : t("send_reset_code")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <MaintenanceGate>
        <LoginContent />
      </MaintenanceGate>
    </ThemeProvider>
  );
}

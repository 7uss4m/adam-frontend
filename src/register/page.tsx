import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Gift,
  Loader2,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  Ticket,
  User,
  Zap,
} from "lucide-react";
import { BsTranslate } from "react-icons/bs";
import { useTranslation } from "react-i18next";

import logo from "../assets/logo.webp";
import postRegister from "../api/postRegister";
import getUser from "../api/getUser";
import GoogleOAuth from "../components/GoogleAuth";
import Spinner from "../components/Spinner";
import { ThemeProvider, useTheme } from "../components/theme-provider";
import MaintenanceGate from "../components/maintenance-gate";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "../components/ui/use-toast";
import { cn } from "../lib/utils";
import "../main.css";

const FEATURES = [
  { key: "register_feature_verify", icon: ShieldCheck },
  { key: "register_feature_rewards", icon: Gift },
  { key: "register_feature_instant", icon: Zap },
] as const;

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  return Math.min(score, 4);
}

function RegisterContent() {
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resolvedTheme, setTheme } = useTheme();
  const isRtl = i18n.language === "ar";
  const isDark = resolvedTheme === "dark";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const invite =
      searchParams.get("invite")?.trim() ||
      searchParams.get("code")?.trim() ||
      searchParams.get("invite_code")?.trim();
    if (invite) setInviteCode(invite);
  }, [searchParams]);

  const sessionQuery = useQuery({
    queryKey: ["register-session"],
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
      navigate("/", { replace: true });
    }
  }, [sessionQuery.data, navigate]);

  const postRegisterMutation = useMutation({
    mutationFn: async () =>
      postRegister({
        email: email.trim(),
        password,
        user_name: username.trim(),
        invite_code: inviteCode.trim() || undefined,
      }),
    onSuccess: (data) => {
      localStorage.setItem("token", data.data.token);
      toast({ title: t("done") });
      navigate(`/verify?email=${encodeURIComponent(email.trim())}`);
    },
    onError: (error: AxiosError) => {
      const msg = (error.response?.data as { error: string })?.error;
      toast({ title: msg, variant: "destructive" });
    },
  });

  const loading = postRegisterMutation.isPending;
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const strength = passwordStrength(password);
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
    if (!username.trim() || !email.trim() || !password) {
      toast({ title: t("fill_all_fields"), variant: "destructive" });
      return;
    }
    if (!looksLikeEmail(email)) {
      toast({ title: t("email"), variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: t("password_8"), variant: "destructive" });
      return;
    }
    postRegisterMutation.mutate();
  };

  const strengthColors = [
    "bg-destructive/60",
    "bg-amber-500/70",
    "bg-yellow-500/70",
    "bg-emerald-500/80",
    "bg-emerald-500",
  ];

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="relative flex min-h-screen flex-col overflow-y-auto bg-background"
    >
      <div className="pointer-events-none fixed inset-0 app-grid-overlay opacity-40 dark:opacity-30" />
      <div className="pointer-events-none fixed -top-48 -start-32 h-[420px] w-[420px] rounded-full app-glow-purple blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-48 -end-32 h-[480px] w-[480px] rounded-full app-glow-cyan blur-[120px]" />

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
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_460px] lg:gap-12 xl:grid-cols-[1.1fr_480px]">
          <motion.section
            initial={{ opacity: 0, x: isRtl ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="space-y-8 pe-4">
              <div className="space-y-4">
                <img src={logo} alt="UBBA" className="h-14 object-contain" />
                <div className="space-y-2">
                  <h1 className="text-3xl font-black tracking-tight text-foreground xl:text-4xl">
                    {t("create_new_account")}
                  </h1>
                  <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                    {t("register_subtitle")}
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
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{t(key)}</span>
                  </motion.li>
                ))}
              </ul>

              <p className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                {t("register_verify_note")}
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
            className="mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl shadow-primary/5 backdrop-blur-md">
              <div className="border-b border-border/50 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 px-5 py-5 text-center sm:px-8 sm:py-6">
                <img
                  src={logo}
                  alt="UBBA"
                  className="mx-auto mb-3 h-10 object-contain lg:hidden"
                />
                <h2 className="text-2xl font-black text-foreground">
                  {t("create_new_account")}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground lg:hidden">
                  {t("register_subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6 sm:space-y-5 sm:px-8 sm:py-7">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="register-username">{t("username")}</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-username"
                        type="text"
                        autoComplete="username"
                        placeholder={t("username")}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 rounded-xl border-border/70 bg-background/80 ps-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="register-email">{t("email")}</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        placeholder={t("email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 rounded-xl border-border/70 bg-background/80 ps-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="register-password">{t("password")}</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
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
                    {password.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1 flex-1 rounded-full transition-colors",
                                strength > i
                                  ? strengthColors[strength]
                                  : "bg-muted"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">{t("password_8")}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="register-invite">{t("invite_code_optional")}</Label>
                    <div className="relative">
                      <Ticket className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="register-invite"
                        type="text"
                        placeholder={t("invite_code")}
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        disabled={loading}
                        className="h-11 rounded-xl border-border/70 bg-background/80 ps-10"
                      />
                    </div>
                  </div>
                </div>

                <p className="rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground lg:hidden">
                  {t("register_verify_note")}
                </p>

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
                    t("create_new_account")
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

                <GoogleOAuth redirectTo="/" disabled={loading} />

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">{t("have_account")}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl border-primary/30 font-bold text-primary hover:bg-primary/5"
                  onClick={() => navigate("/login")}
                  disabled={loading}
                >
                  {t("login")}
                </Button>
              </form>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <MaintenanceGate>
        <RegisterContent />
      </MaintenanceGate>
    </ThemeProvider>
  );
}

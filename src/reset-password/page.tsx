/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import logo from "../assets/logo.webp";
import postResetPassword from "../api/postResetPassword";

import { ThemeProvider } from "../components/theme-provider";
import MaintenanceGate from "../components/maintenance-gate";
import { useTranslation } from "react-i18next";
import { ChevronRight, KeyRound, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "../components/ui/use-toast";

export default function ResetPasswordPage() {
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = (searchParams.get("email") || "").trim();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const translateServerError = (msg?: string) => {
    if (!msg) return t("something_wrong_happened");
    const map: Record<string, string> = {
      "Invalid Code": "server_invalid_code",
      "User Not Found": "server_user_not_found",
      "User is linked with google": "server_user_is_linked_with_google",
    };
    const key = map[msg];
    if (!key) return msg;
    const translated = t(key);
    return translated === key ? msg : translated;
  };

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await postResetPassword({ email, code, password });
      return res;
    },
    onSuccess: () => {
      toast({ title: t("reset_done") });
      navigate("/login");
    },
    onError: (error: AxiosError) => {
      const msg = (error.response?.data as { error: string })?.error;
      toast({ title: translateServerError(msg), variant: "destructive" });
    },
  });

  const loading = resetMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({ title: t("missing_email"), variant: "destructive" });
      return;
    }
    if (code.length !== 6) {
      toast({ title: t("enter_code"), variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: t("password_8"), variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: t("passwords_not_match"), variant: "destructive" });
      return;
    }

    resetMutation.mutate();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <MaintenanceGate>
        <main
          dir={i18n.language === "ar" ? "rtl" : "ltr"}
          className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden"
        >
          {/* Animated background circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl"
              initial={{ top: "-200px", right: "-200px" }}
              animate={{
                top: ["-200px", "-100px", "-200px"],
                right: ["-200px", "-100px", "-200px"],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-96 h-96 rounded-full bg-accent/10 blur-3xl"
              initial={{ bottom: "-200px", left: "-200px" }}
              animate={{
                bottom: ["-200px", "-100px", "-200px"],
                left: ["-200px", "-100px", "-200px"],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </div>

          {/* Back button */}
          <motion.button
            onClick={() => navigate("/login")}
            className="absolute top-6 left-6 p-2 text-primary hover:text-primary/80 transition-colors z-10"
            aria-label="Back"
            whileHover={{ scale: 1.1, rotate: -90 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="h-6 w-6" />
          </motion.button>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md relative z-10 space-y-8"
          >
            {/* Logo */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <img
                src={logo}
                alt="AdamZone"
                className="h-20 object-contain drop-shadow-lg relative z-10"
              />
            </motion.div>

            {/* Icon */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div variants={itemVariants} className="text-center space-y-3">
              <h1 className="text-2xl font-bold text-foreground">
                {t("reset_password_title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("reset_password_hint")}
              </p>
              {email && (
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-4 py-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{email}</span>
                </div>
              )}
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <motion.div variants={itemVariants}>
                <input
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val.length <= 6) setCode(val);
                  }}
                  placeholder="000000"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-md py-3.5 px-4 text-center text-2xl font-bold tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all duration-300"
                />
              </motion.div>

              {/* New password */}
              <motion.div variants={itemVariants} className="relative">
                <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("new_password")}
                  className="w-full rounded-xl border-2 border-white/10 bg-white/5 backdrop-blur-md py-3 ps-10 pe-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </motion.div>

              {/* Confirm password */}
              <motion.div variants={itemVariants} className="relative">
                <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t("confirm_password")}
                  className="w-full rounded-xl border-2 border-white/10 bg-white/5 backdrop-blur-md py-3 ps-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </motion.div>

              {/* Submit */}
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-full bg-gradient-to-r from-primary to-primary/70 py-3.5 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? t("saving") : t("reset_password_title")}
              </motion.button>
            </form>

            {/* Login link */}
            <motion.div variants={itemVariants} className="text-center">
              <p className="text-sm text-muted-foreground/70">
                {i18n.language === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-primary font-bold hover:text-primary/80 transition-colors"
                >
                  {t("login")}
                </button>
              </p>
            </motion.div>
          </motion.div>
        </main>
      </MaintenanceGate>
    </ThemeProvider>
  );
}

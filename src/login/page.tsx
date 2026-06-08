/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import logo from "../assets/logo.webp";
import postLogin from "../api/postLogin";

import { useTranslation } from "react-i18next";

import { ThemeProvider } from "../components/theme-provider";
import GoogleOAuth from "../components/GoogleAuth";

import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "../components/ui/use-toast";

const LoginPage = () => {
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const postLoginMutation = useMutation({
    mutationFn: async () => {
      const res = await postLogin({ email, password });
      return res;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.data.token);
      toast({
        title: t("done"),
        variant: "default",
      });
      navigate("/");
    },
    onError: (error: AxiosError) => {
      const msg = (error.response?.data as { error: string })?.error;

      if (msg === "Your Email Not Verify Please Verify it and try again") {
        navigate(`/verify?email=${encodeURIComponent(email)}`);
        return;
      }

      toast({
        title: msg,
        variant: "destructive",
      });
    },
  });

  const loading = postLoginMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: t("fill_all_fields"),
        variant: "destructive",
      });
      return;
    }

    postLoginMutation.mutate();
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <main
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
        className="flex min-h-screen items-center justify-center bg-background px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back_home") || "العودة للرئيسية"}
          </Link>

          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-6 text-center">
              <div className="mb-4 flex justify-center">
                <img
                  src={logo}
                  alt="AdamZone"
                  className="h-16 object-contain"
                />
              </div>

              <h1 className="mt-2 text-xl font-bold text-foreground">
                {t("login") || "تسجيل الدخول"}
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder={t("email") || "البريد الإلكتروني"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password") || "كلمة المرور"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg gradient-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading
                  ? t("loading") || "جارٍ التحميل..."
                  : t("login") || "تسجيل الدخول"}
              </button>
            </form>

            {/* OR */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">
                {t("or") || "أو"}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Google */}
            <div className="flex justify-center">
              <GoogleOAuth />
            </div>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("no_account") || "ليس لديك حساب؟"}{" "}
              <Link
                to="/register"
                className="font-bold text-primary hover:underline"
              >
                {t("create_new_account") || "إنشاء حساب"}
              </Link>
            </p>
          </div>

          <Outlet />
        </motion.div>
      </main>
    </ThemeProvider>
  );
};

export default LoginPage;

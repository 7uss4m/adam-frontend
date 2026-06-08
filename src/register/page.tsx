/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import logo from "../assets/logo.webp";
import postRegister from "../api/postRegister";

import { useTranslation } from "react-i18next";

import { ThemeProvider } from "../components/theme-provider";
import GoogleOAuth from "../components/GoogleAuth";

import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Ticket } from "lucide-react";
import { toast } from "../components/ui/use-toast";

export default function RegisterPage() {
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const postRegisterMutation = useMutation({
    mutationFn: async () => {
      const res = await postRegister({
        email,
        password,
        user_name: username,
        invite_code: inviteCode?.trim() ? inviteCode.trim() : undefined,
      });
      return res;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.data.token);
      toast({
        title: t("done"),
        variant: "default",
      });
      navigate(`/verify?email=${encodeURIComponent(email)}`);
    },
    onError: (error: AxiosError) => {
      const msg = (error.response?.data as { error: string })?.error;
      toast({
        title: msg,
        variant: "destructive",
      });
    },
  });

  const loading = postRegisterMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password) {
      toast({
        title: t("fill_all_fields"),
        variant: "destructive",
      });

      return;
    }

    postRegisterMutation.mutate();
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
                {t("create_new_account") || "إنشاء حساب جديد"}
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="relative">
                <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("username") || "الاسم"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

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
                  minLength={8}
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

              {/* Invite code */}
              <div className="relative">
                <Ticket className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={`${t("invite_code") || "كود الدعوة"} (${
                    t("optional") || "اختياري"
                  })`}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Hint */}
              <p className="text-xs text-muted-foreground">
                {t("password_8") || "كلمة المرور يجب أن تكون 8 أحرف على الأقل"}
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg gradient-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading
                  ? t("loading") || "جارٍ التحميل..."
                  : t("create_new_account") || "إنشاء حساب"}
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

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("have_account") || "لديك حساب بالفعل؟"}{" "}
              <Link
                to="/login"
                className="font-bold text-primary hover:underline"
              >
                {t("login") || "تسجيل الدخول"}
              </Link>
            </p>
          </div>

          <Outlet />
        </motion.div>
      </main>
    </ThemeProvider>
  );
}

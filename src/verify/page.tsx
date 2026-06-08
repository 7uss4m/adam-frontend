/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import logo from "../assets/logo.webp";
import postVerifyEmail from "../api/postVerifyEmail";

import { ThemeProvider } from "../components/theme-provider";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "../components/ui/use-toast";

export default function VerifyEmailPage() {
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = (searchParams.get("email") || "").trim();
  const [code, setCode] = useState("");

  const postVerifyMutation = useMutation({
    mutationFn: async () => {
      const res = await postVerifyEmail({ email, code });
      return res;
    },
    onSuccess: () => {
      toast({
        title: t("done"),
        variant: "default",
      });

      navigate("/login");
    },
    onError: (error: AxiosError) => {
      const msg = (error.response?.data as { error: string })?.error;
      toast({
        title: msg,
        variant: "destructive",
      });
    },
  });

  const loading = postVerifyMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: t("missing_email"),
        variant: "destructive",
      });
      return;
    }
    if (!code.trim()) {
      toast({
        title: t("enter_code"),
        variant: "destructive",
      });

      return;
    }

    postVerifyMutation.mutate();
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

              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>

              <h1 className="text-xl font-bold text-foreground">
                {t("verify_email") || "تأكيد البريد الإلكتروني"}
              </h1>

              <p className="mt-2 text-xs text-muted-foreground">
                {t("verify_hint") ||
                  "أدخل كود التحقق المرسل إلى بريدك الإلكتروني"}
              </p>

              {email && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("email") || "البريد"}:{" "}
                  <span className="font-semibold text-foreground">{email}</span>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t("code") || "الكود"}
                  inputMode="numeric"
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg gradient-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading
                  ? t("loading") || "جارٍ التحقق..."
                  : t("verify") || "تحقق"}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t("go_login") || "الذهاب لتسجيل الدخول"}
                </Link>
              </div>
            </form>
          </div>

          <Outlet />
        </motion.div>
      </main>
    </ThemeProvider>
  );
}

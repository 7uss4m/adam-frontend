/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import logo from "../assets/logo.webp";
import postVerifyEmail from "../api/postVerifyEmail";

import { ThemeProvider } from "../components/theme-provider";
import MaintenanceGate from "../components/maintenance-gate";
import { useTranslation } from "react-i18next";
import { ChevronRight, ShieldCheck, Mail, Sparkles } from "lucide-react";
import { toast } from "../components/ui/use-toast";

export default function VerifyEmailPage() {
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = (searchParams.get("email") || "").trim();
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
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
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 p-2 text-primary hover:text-primary/80 transition-colors z-10"
          aria-label="Back"
          whileHover={{ scale: 1.1, rotate: -90 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="h-6 w-6" />
        </motion.button>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md relative z-10 space-y-8"
        >
          {/* Logo Section with rotation */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex justify-center opacity-20"
            >
              <div className="w-28 h-28 rounded-full border-2 border-primary" />
            </motion.div>
            <img
              src={logo}
              alt="UBBA"
              className="h-24 object-contain drop-shadow-lg relative z-10"
            />
          </motion.div>

          {/* Shield Icon with pulse */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30"
            >
              <ShieldCheck className="h-8 w-8 text-primary" />
            </motion.div>
          </motion.div>

          {/* Title and subtitle */}
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              {i18n.language === "ar" ? "تأكيد البريد" : "Verify Email"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {i18n.language === "ar"
                ? "أدخل كود التحقق المرسل إلى بريدك الإلكتروني"
                : "Enter the verification code sent to your email"}
            </p>
            {email && (
              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-4 py-2"
              >
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {email}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Sparkles effect */}
          <motion.div
            className="absolute top-10 right-0 text-primary/50"
            animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Input - Large and centered */}
            <motion.div
              variants={itemVariants}
              className="relative group"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition duration-500"
                animate={{
                  scale: focused ? 1.1 : 1,
                }}
              />
              <div className="relative">
                <input
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 6) setCode(val);
                  }}
                  placeholder={i18n.language === "ar" ? "000000" : "000000"}
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-md py-4 px-4 text-center text-3xl font-bold tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all duration-300"
                />
                {/* Code input indicator boxes */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i < code.length ? "bg-primary" : "bg-white/20"
                      }`}
                      animate={{
                        scale: i === code.length ? [1, 1.3, 1] : 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Hint */}
            <motion.p
              variants={itemVariants}
              className="text-xs text-muted-foreground/70 text-center"
            >
              {i18n.language === "ar"
                ? "أدخل رمز التحقق المكون من 6 أرقام"
                : "Enter the 6-digit verification code"}
            </motion.p>

            {/* Verify Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading || code.length !== 6}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(16, 185, 129, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-full bg-gradient-to-r from-primary to-primary/70 py-3.5 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative">
                {loading
                  ? (i18n.language === "ar" ? "جارٍ التحقق..." : "Verifying...")
                  : (i18n.language === "ar" ? "تحقق" : "Verify")}
              </span>
            </motion.button>
          </form>

          {/* Login Link */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground/70">
              {i18n.language === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
              <motion.button
                onClick={() => navigate("/login")}
                className="text-primary font-bold hover:text-primary/80 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                {i18n.language === "ar" ? "تسجيل الدخول" : "Login"}
              </motion.button>
            </p>
          </motion.div>

          {/* Footer animation */}
          <motion.div
            className="text-center text-xs text-muted-foreground/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✓ {i18n.language === "ar" ? "البريد الآمن" : "Secure verification"} ✓
          </motion.div>
        </motion.div>
      </main>
      </MaintenanceGate>
    </ThemeProvider>
  );
}
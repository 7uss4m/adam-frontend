/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import logo from "../assets/logo.webp";
import postLogin from "../api/postLogin";

import { useTranslation } from "react-i18next";

import { ThemeProvider } from "../components/theme-provider";

import { User, Lock, Eye, EyeOff, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "../components/ui/use-toast";

const LoginPage = () => {
  const [t, i18n] = useTranslation("global");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

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
              alt="AdamZone"
              className="h-24 object-contain drop-shadow-lg relative z-10"
            />
          </motion.div>

          {/* Sparkles effect */}
          <motion.div
            className="absolute top-10 right-0 text-primary/50"
            animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-6 w-6" />
          </motion.div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Username Input */}
            <motion.div
              variants={itemVariants}
              className="relative group"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition duration-500"
                animate={{
                  scale: focusedField === "email" ? 1.1 : 1,
                }}
              />
              <div className="relative flex items-center">
                <motion.div
                  animate={{
                    rotate: focusedField === "email" ? 360 : 0,
                  }}
                  transition={{ duration: 0.6 }}
                  className="absolute right-4"
                >
                  <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </motion.div>
                <input
                  type="text"
                  placeholder={i18n.language === "ar" ? "اسم المستخدم أو البريد الإلكتروني" : "Username or Email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-md py-3.5 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all duration-300"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              variants={itemVariants}
              className="relative group"
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition duration-500"
                animate={{
                  scale: focusedField === "password" ? 1.1 : 1,
                }}
              />
              <div className="relative flex items-center">
                <motion.div
                  animate={{
                    rotate: focusedField === "password" ? 360 : 0,
                  }}
                  transition={{ duration: 0.6 }}
                  className="absolute right-4"
                >
                  <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </motion.div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={i18n.language === "ar" ? "كلمة السر" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-full border-2 border-white/10 bg-white/5 backdrop-blur-md py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all duration-300"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-4 text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Toggle password"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Login Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
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
                  ? (i18n.language === "ar" ? "جارٍ التحميل..." : "Loading...")
                  : (i18n.language === "ar" ? "تسجيل الدخول" : "Login")}
              </span>
            </motion.button>
          </form>

          {/* Forgot Password */}
          <motion.div
            variants={itemVariants}
            className="text-center"
          >
            <motion.button
              onClick={() => navigate("#")}
              className="text-sm text-primary/80 hover:text-primary transition-colors font-medium"
              whileHover={{ scale: 1.05, textDecoration: "underline" }}
            >
              {i18n.language === "ar" ? "نسيت كلمة السر؟" : "Forgot password?"}
            </motion.button>
          </motion.div>

          {/* Register Link */}
          <motion.div
            variants={itemVariants}
          >
            <motion.button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full rounded-full border-2 border-primary/50 px-6 py-3.5 text-sm font-bold text-primary transition-all hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {i18n.language === "ar" ? "إنشاء حساب جديد" : "Create new account"}
            </motion.button>
          </motion.div>

          {/* Footer animation */}
          <motion.div
            className="text-center text-xs text-muted-foreground/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✨ {i18n.language === "ar" ? "أهلاً بك" : "Welcome"}  ✨
          </motion.div>
        </motion.div>
      </main>
    </ThemeProvider>
  );
};

export default LoginPage;
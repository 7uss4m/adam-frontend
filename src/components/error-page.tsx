import { motion } from "framer-motion";
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangle, Home, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ErrorPage() {
  const navigate = useNavigate();
  const [t, i18n] = useTranslation("global");
  const routeError = useRouteError();

  // Surface the real error to the console for diagnosis
  if (routeError) console.error("[ErrorPage] route error:", routeError);

  const is404 = isRouteErrorResponse(routeError) && routeError.status === 404;
  const errorMessage =
    routeError instanceof Error
      ? routeError.message
      : isRouteErrorResponse(routeError)
      ? `${routeError.status} ${routeError.statusText}`
      : routeError
      ? String(routeError)
      : "";

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
    <div
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="relative min-h-screen w-full bg-background flex items-center justify-center px-4 overflow-hidden"
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
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
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
        className="w-full max-w-md relative z-10 space-y-8 text-center"
      >
        {/* Error Icon with animation */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex justify-center opacity-30"
            >
              <div className="w-32 h-32 rounded-full border-2 border-destructive" />
            </motion.div>
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/30 to-destructive/10 border border-destructive/30 relative z-10">
              <AlertTriangle className="h-14 w-14 text-destructive" />
            </div>
          </motion.div>
        </motion.div>

        {/* Error Title */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-destructive to-destructive/70 bg-clip-text text-transparent">
            Oops!
          </h1>
          <p className="text-2xl font-bold text-foreground">
            {i18n.language === "ar" ? "الصفحة غير موجودة" : "Page Not Found"}
          </p>
        </motion.div>

        {/* Error Code */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-full bg-destructive/10 border border-destructive/30 px-6 py-3"
        >
          <span className="text-lg font-bold text-destructive">{is404 ? "404" : "Error"}</span>
        </motion.div>

        {/* Error Description */}
        <motion.p
          variants={itemVariants}
          className="text-muted-foreground text-base leading-relaxed"
        >
          {i18n.language === "ar"
            ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو قد تم حذفها."
            : "Sorry, the page you're looking for doesn't exist or has been removed."}
        </motion.p>

        {/* Real error message (for diagnosis) */}
        {errorMessage && !is404 && (
          <motion.pre
            variants={itemVariants}
            dir="ltr"
            className="mx-auto max-w-md overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-start text-xs text-destructive"
          >
            {errorMessage}
          </motion.pre>
        )}

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="space-y-3 pt-4">
          {/* Home Button */}
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 30px rgba(16, 185, 129, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-full bg-gradient-to-r from-primary to-primary/70 py-3.5 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-primary/50 disabled:opacity-50 transition-all relative overflow-hidden flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            <span>
              {i18n.language === "ar" ? "العودة للرئيسية" : "Go Home"}
            </span>
          </motion.button>

          {/* Go Back Button */}
          <motion.button
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-full border-2 border-primary/50 px-6 py-3.5 text-sm font-bold text-primary transition-all hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20"
          >
            {i18n.language === "ar" ? "الرجوع للصفحة السابقة" : "Go Back"}
          </motion.button>
        </motion.div>

        {/* Footer animation */}
        <motion.div
          className="text-center text-xs text-muted-foreground/50 pt-4"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ⚠️ {i18n.language === "ar" ? "خطأ في الوصول" : "Access Error"} ⚠️
        </motion.div>
      </motion.div>
    </div>
  );
}

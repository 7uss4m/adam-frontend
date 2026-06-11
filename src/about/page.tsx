import { useTranslation } from "react-i18next"
import getInfo from "../api/getInfo";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../components/Spinner";
import { motion } from "framer-motion";
import { Sparkles, Target, Heart, Zap } from "lucide-react";

export default function AboutPage() {
  // translation
  const [t] = useTranslation("global")

  // query
  const getAboutUsQuery = useQuery({
    queryKey: ["aboutus"],
    queryFn: async () => {
      const response = await getInfo(
        localStorage.getItem("token") as string,
        "aboutus"
      );
      return response.data.date as { aboutus: string | null };
    },
    refetchOnWindowFocus: false,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: t("quality") || "Quality",
      desc: t("best_quality") || "Best products & services"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: t("mission") || "Mission",
      desc: t("our_mission") || "Serve with excellence"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: t("dedication") || "Dedication",
      desc: t("customer_first") || "Customer first always"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t("innovation") || "Innovation",
      desc: t("always_improving") || "Always improving"
    },
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-background overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Content */}
      <div className="relative container max-w-[100%] md:max-w-[90%] lg:max-w-[70%] py-16 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{t("about_us")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t("about_us")}
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"></div>
        </motion.div>

        {/* Main content */}
        {getAboutUsQuery.isFetching ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* About text */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-primary/30 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl p-8 md:p-12 shadow-xl"
            >
              <p className="text-base md:text-lg leading-relaxed text-foreground/90 text-justify">
                {getAboutUsQuery.data?.aboutus}
              </p>
            </motion.div>

            {/* Features grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative">
                    {/* Icon */}
                    <div className="mb-4 inline-flex p-3 rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-lg group-hover:shadow-xl transition-shadow">
                      {feature.icon}
                    </div>

                    {/* Text */}
                    <h3 className="text-lg font-bold mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>

                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-primary via-accent to-primary bg-clip-border opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Section */}
            <motion.div
              variants={itemVariants}
              className="text-center py-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-primary via-accent to-primary text-white font-bold shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              >
                {t("start_shopping") || "Start Shopping"}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
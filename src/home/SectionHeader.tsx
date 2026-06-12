import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

type SectionHeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  accent?: string;
};

export default function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "عرض الكل",
  accent = "text-cyan-400",
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6 flex items-end justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-muted/50 backdrop-blur-sm ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {viewAllHref && (
        <Link to={viewAllHref} className="shrink-0">
          <motion.span
            whileHover={{ x: -4 }}
            className="flex items-center gap-1.5 text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
          >
            {viewAllLabel}
            <ArrowLeft className="h-4 w-4" />
          </motion.span>
        </Link>
      )}
    </motion.div>
  );
}

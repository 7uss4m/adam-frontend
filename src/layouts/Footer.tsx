import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Send,
  ShieldCheck,
  CreditCard,
  Zap,
  Headphones,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import logo from "../assets/logo.webp";
import getInfo from "../api/getInfo";

function toHref(value: unknown, kind: "url" | "phone" | "mail") {
  const v = (value == null ? "" : String(value)).trim();
  if (!v) return null;
  if (kind === "phone") return `tel:${v}`;
  if (kind === "mail") return `mailto:${v}`;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function useInfoField(field: string) {
  const token = localStorage.getItem("token") || "";
  // Shared query key ["info", field]: other consumers (Header/SupportFAB) cache
  // the whole { [field]: value } object, so normalize whatever shape we read.
  const cached = useQuery({
    queryKey: ["info", field],
    queryFn: async () => {
      const res = await getInfo(token, field);
      return res.data.date ?? null;
    },
    refetchOnWindowFocus: false,
  }).data as unknown;

  if (cached && typeof cached === "object") {
    return (cached as Record<string, unknown>)[field] ?? null;
  }
  return cached ?? null;
}

const quickLinks = [
  { to: "/about-us", label: "من نحن" },
  { to: "/wallet", label: "المحفظة" },
  { to: "/payments", label: "المدفوعات" },
  { to: "/orders", label: "الطلبات" },
  { to: "/referral", label: "كود الدعوة" },
];

const policyLinks = [
  { to: "/faqs", label: "الأسئلة الشائعة" },
  { to: "/privacy", label: "سياسة الخصوصية" },
  { to: "/terms", label: "شروط الاستخدام" },
];

const trustBadges = [
  { icon: ShieldCheck, label: "دفع آمن 100%" },
  { icon: Zap, label: "تسليم فوري" },
  { icon: Headphones, label: "دعم 24/7" },
  { icon: CreditCard, label: "أسعار تنافسية" },
];

function LinkList({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="mb-5 flex items-center gap-2 text-sm font-black text-foreground">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
        {title}
      </h4>
      <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <span className="h-1 w-1 rounded-full bg-primary/40 transition-all group-hover:w-3 group-hover:bg-primary" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Footer = () => {
  const year = new Date().getFullYear();

  const email = useInfoField("email");
  const phone = useInfoField("phone");
  const telegram = useInfoField("telegram");
  const whatsup = useInfoField("whatsup");
  const facebook = useInfoField("facebook");

  const contacts = [
    { href: toHref(email, "mail"), icon: Mail, label: email, external: false },
    { href: toHref(phone, "phone"), icon: Phone, label: phone, external: false },
    { href: toHref(telegram, "url"), icon: Send, label: "Telegram", external: true },
    { href: toHref(whatsup, "url"), icon: MessageCircle, label: "واتساب", external: true },
  ].filter((c) => c.href);

  const socials = [
    { href: toHref(facebook, "url"), icon: Facebook, label: "Facebook" },
  ].filter((s) => s.href);

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-primary/15 bg-gradient-to-b from-card/40 via-background to-background">
      {/* glow accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      {/* ambient glows */}
      <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />

      {/* trust strip */}
      <div className="relative border-b border-border/40">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4">
          {trustBadges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_20px_-6px_hsl(var(--primary)/0.6)]">
                <b.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-muted-foreground">{b.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* main grid */}
      <div className="relative container mx-auto grid gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl" />
            <img src={logo} alt="AdamZone" className="relative h-12 object-contain" />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
            متجرك الرقمي الأول لشحن الألعاب والاشتراكات والبطاقات — بسرعة وأمان،
            مع دعم مباشر وتجربة شراء سلسة.
          </p>

          {/* socials */}
          <div className="mt-6 flex items-center gap-3">
            {socials.map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-secondary/50 text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <s.icon className="h-5 w-5" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <LinkList title="روابط سريعة" links={quickLinks} />

        {/* Policies */}
        <LinkList title="السياسات" links={policyLinks} />

        {/* Contact */}
        <div>
          <h4 className="mb-5 flex items-center gap-2 text-sm font-black text-foreground">
            <span className="h-4 w-1 rounded-full bg-gradient-to-b from-primary to-accent" />
            تواصل معنا
          </h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            {contacts.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="group flex items-center gap-3 rounded-xl border border-transparent px-1 py-1.5 transition-all hover:border-border/50 hover:bg-secondary/40 hover:px-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/60 text-primary transition-colors group-hover:bg-primary/15">
                  <c.icon className="h-4 w-4" />
                </span>
                <span className="flex-1 truncate text-start transition-colors group-hover:text-foreground" dir="ltr">
                  {c.label}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-border/40 bg-background/60 backdrop-blur">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-start">
          <p>
            © {year}{" "}
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              AdamZone
            </span>
            . جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-border/50 bg-secondary/50 px-2.5 py-1 font-mono font-bold text-foreground/80">
              USD / SYP
            </span>
            <span className="text-muted-foreground/70">تسليم سريع • دعم 24/7</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

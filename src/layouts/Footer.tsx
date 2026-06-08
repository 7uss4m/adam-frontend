import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Send,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import logo from "../assets/logo.webp";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <img src={logo} alt="AdamZone" className="h-10 object-contain" />
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            متجرك الرقمي لشحن الألعاب والاشتراكات والبطاقات بسرعة وأمان، مع دعم
            مباشر وتجربة شراء سهلة.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              دفع آمن
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
              <CreditCard className="h-4 w-4 text-primary" />
              شحن سريع
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-4 text-sm font-bold text-foreground">
            روابط سريعة
          </h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link
              to="/about-us"
              className="transition-colors hover:text-primary"
            >
              من نحن
            </Link>
            <Link to="/wallet" className="transition-colors hover:text-primary">
              المحفظة
            </Link>
            <Link
              to="/payments"
              className="transition-colors hover:text-primary"
            >
              المدفوعات
            </Link>
            <Link to="/orders" className="transition-colors hover:text-primary">
              الطلبات
            </Link>
            <Link
              to="/referral"
              className="transition-colors hover:text-primary"
            >
              كود الدعوة
            </Link>
          </div>
        </div>

        {/* Policies */}
        <div>
          <h4 className="mb-4 text-sm font-bold text-foreground">السياسات</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/faqs" className="transition-colors hover:text-primary">
              الأسئلة الشائعة
            </Link>
            <Link
              to="/privacy"
              className="transition-colors hover:text-primary"
            >
              سياسة الخصوصية
            </Link>
            <Link to="/terms" className="transition-colors hover:text-primary">
              شروط الاستخدام
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <a
              href="mailto:support@adamzone.com"
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 text-primary" />
              support@adamzone.com
            </a>

            <a
              href="tel:+963962113050"
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Phone className="h-4 w-4 text-primary" />
              +963 962 113 050
            </a>

            <a
              href="https://t.me/AK15Store"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Send className="h-4 w-4 text-primary" />
              Telegram
            </a>

            <a
              href="https://whatsapp.com/channel/0029VaxeYmZHwXbJDYfOWG3S"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              واتساب (قناة الدعم)
            </a>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.facebook.com/share/18sYGZ5Lfk/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-secondary p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/ak_store500?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-secondary p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>© {year} AdamZone. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-secondary px-2 py-1">
              {`USD / SYP`}
            </span>
            <span className="text-muted-foreground/70">
              تسليم سريع • دعم 24/7
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

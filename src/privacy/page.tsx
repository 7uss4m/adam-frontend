import { motion } from "framer-motion";
import {
  ShieldCheck,
  Database,
  Wand2,
  Share2,
  Lock,
  UserCheck,
  RefreshCcw,
  MessageCircle,
} from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "المعلومات التي نجمعها",
    bullets: [
      "المعلومات الشخصية: مثل الاسم، البريد الإلكتروني، رقم الهاتف، وبيانات الدفع.",
      "معلومات المعاملات: تفاصيل عمليات الشراء، الشحن، والتحويلات المالية.",
      "بيانات الاستخدام: مثل عنوان IP، نوع الجهاز، ونشاط المستخدم داخل الموقع.",
    ],
  },
  {
    icon: Wand2,
    title: "كيفية استخدام المعلومات",
    bullets: [
      "معالجة الطلبات وتنفيذ عمليات الشحن والتحويل.",
      "تحسين تجربة المستخدم وتقديم خدمات مخصصة.",
      "الامتثال للمتطلبات القانونية والتنظيمية.",
      "منع الاحتيال وضمان أمان المعاملات المالية.",
    ],
  },
  {
    icon: Share2,
    title: "مشاركة المعلومات مع أطراف ثالثة",
    bullets: [
      "نحن لا نبيع أو نشارك معلوماتك الشخصية مع أطراف خارجية إلا في الحالات التالية:",
      "الامتثال للمتطلبات القانونية والتنظيمية.",
      "التعامل مع مقدمي الخدمات (مثل بوابات الدفع) لتنفيذ المعاملات.",
      "تحسين خدماتنا عبر شركاء موثوقين.",
    ],
  },
  {
    icon: Lock,
    title: "أمان المعلومات",
    bullets: [
      "نطبق معايير أمان مشددة لحماية بيانات المستخدم، بما في ذلك تشفير المعلومات واتخاذ تدابير لمنع الوصول غير المصرح به.",
    ],
  },
  {
    icon: UserCheck,
    title: "حقوق المستخدم",
    bullets: [
      "يمكنك طلب تعديل أو حذف بياناتك الشخصية، والاعتراض على بعض طرق المعالجة وفقًا للقوانين المعمول بها.",
    ],
  },
  {
    icon: RefreshCcw,
    title: "التعديلات على السياسة",
    bullets: [
      "قد نقوم بتحديث سياسة الخصوصية من حين لآخر، وسيتم إشعار المستخدمين عند إجراء تغييرات جوهرية.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-start gap-3"
          >
            <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                سياسة الخصوصية
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground sm:text-base leading-7">
                نحن في AdamZone نلتزم بحماية خصوصية مستخدمينا وضمان أمن معلوماتهم
                الشخصية. تحدد هذه السياسة كيفية جمع، استخدام، وحماية بياناتك عند
                استخدام خدماتنا.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <motion.section
                key={sec.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.05 }}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-base font-bold text-foreground">
                      {sec.title}
                    </h2>

                    <ul className="space-y-2 text-sm leading-7 text-muted-foreground">
                      {sec.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              </motion.section>
            );
          })}
        </div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-2xl border border-border bg-secondary/40 p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                هل لديك استفسار؟
              </h3>
              <p className="text-sm leading-7 text-muted-foreground">
                إذا كان لديك أي استفسارات أو ترغب في معرفة المزيد حول كيفية حماية
                بياناتك، يمكنك التواصل معنا عبر واتساب.
              </p>
            </div>

            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-background/80"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              تواصل عبر واتساب
            </a>
          </div>
        </motion.div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-muted-foreground">
          ملاحظة: قد تختلف حقوق المستخدم وتفاصيل الامتثال حسب القوانين المعمول بها في بلدك.
        </p>
      </div>
    </div>
  );
}
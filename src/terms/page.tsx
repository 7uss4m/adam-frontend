import { motion } from "framer-motion";
import { ShieldCheck, Clock, Bell, Ban, Scale, CreditCard, Share2, UserCheck, Image as ImageIcon } from "lucide-react";

const items = [
  {
    icon: Clock,
    title: "الوقت المحدد للمراجعة",
    text: "لا يمكن مراجعة أي طلب قبل مرور 30 دقيقة من إنشائه، ولا بعد 24 ساعة من تقديمه.",
  },
  {
    icon: Bell,
    title: "إشعارات الطلبات",
    text: "يتم إرسال إشعارات لحالة المنتجات والخدمات سواء كانت تلقائية أو يدوية، لتوضيح حالة الطلب (مقبول / مرفوض).",
  },
  {
    icon: Ban,
    title: "عدم استرجاع المعاملات",
    text: "بعد إتمام عملية الشحن أو التحويل، لا يمكن استرداد الأموال. الرجاء التأكد من التفاصيل قبل إتمام أي معاملة.",
  },
  {
    icon: Scale,
    title: "إدارة النزاعات",
    text: "في حالة وجود مشكلة في الطلب، يمكن تقديم اعتراض داخل الطلب لمراجعته من قبل فريق الدعم. يرجى عدم التواصل عبر واتساب لضمان معالجة الطلب رسميًا.",
  },
  {
    icon: CreditCard,
    title: "ضوابط الدفع",
    text: "يجب الالتزام بالمبلغ المحدد وفقًا لطرق الدفع المعتمدة. أي دفعة أقل أو أعلى من المبلغ المحدد لن يتم قبولها.",
    emphasize: true,
  },
  {
    icon: Share2,
    title: "مشاركة الأسعار",
    text: "يُمنع منعًا باتًا إرسال أسعار المنتجات أو العروض لأي طرف ثالث. أي مخالفة قد تؤدي إلى إيقاف الحساب وتجميد الأموال، ويحتفظ فريق UBBA بالحق في اتخاذ الإجراءات اللازمة.",
    emphasize: true,
  },
  {
    icon: UserCheck,
    title: "دقة البيانات الشخصية",
    text: "يُرجى تسجيل اسمك الحقيقي وبياناتك الدقيقة لضمان إمكانية مساعدتك في حال فقدان كلمة المرور أو وجود مشكلة في الحساب. لن نتمكن من تقديم الدعم إذا كانت البيانات غير صحيحة أو وهمية.",
  },
  {
    icon: ImageIcon,
    title: "إثبات التحويل",
    text: "عند إرسال حوالة مالية، يجب إرفاق صورة إشعار التحويل بشكل واضح. أي طلب دون صورة إشعار التحويل لن يتم قبوله.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
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
                الشروط والأحكام
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                يرجى قراءة البنود التالية بعناية لضمان تجربة استخدام آمنة وواضحة داخل UBBA.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {items.map((it, idx) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.04 }}
                className={[
                  "relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm",
                  it.emphasize ? "border-primary/30" : "border-border",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                      it.emphasize
                        ? "border-primary/30 bg-primary/10"
                        : "border-border bg-background",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        {it.title}
                      </h3>
                      {it.emphasize ? (
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                          مهم
                        </span>
                      ) : null}
                    </div>

                    <p className="text-sm leading-7 text-muted-foreground">
                      {it.text}
                    </p>
                  </div>
                </div>

                {/* subtle accent */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.1 }}
          className="mt-8 rounded-2xl border border-border bg-secondary/40 p-5"
        >
          <p className="text-sm leading-7 text-foreground">
            باستخدامك للتطبيق، فإنك توافق على هذه الشروط. قد يتم تحديث الشروط من حين لآخر،
            ويُنصح بمراجعتها بشكل دوري.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
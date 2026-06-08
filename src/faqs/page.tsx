import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Gamepad2,
  Ticket,
  BadgePercent,
  Headphones,
  Globe,
  Receipt,
  Repeat,
} from "lucide-react";

type FAQItem = {
  id: number;
  q: string;
  a: string;
  icon?: React.ElementType;
  tag?: string;
};

const faqs: FAQItem[] = [
  {
    id: 1,
    icon: Ticket,
    tag: "الخدمات",
    q: "ما هي الخدمات الرقمية التي تقدمها AdamZone؟",
    a: "في AdamZone، نقدم مجموعة متنوعة من الخدمات الرقمية مثل اشتراكات التطبيقات، شحن الألعاب، بيع برامج مرخصة، وبيع بطاقات هدايا للمستخدمين. يمكنك العثور على خدماتك المفضلة بكل سهولة.",
  },
  {
    id: 2,
    icon: CreditCard,
    tag: "الدفع",
    q: "كيف يمكنني شراء خدماتك الرقمية؟",
    a: "لشراء أي خدمة رقمية، ما عليك سوى اختيار الخدمة التي ترغب بها، إضافة إليها إلى سلة التسوق، ثم إتمام عملية الدفع عبر وسائل الدفع المتاحة لدينا مثل بطاقات الائتمان، PayPal، الدفع عبر الإنترنت، سيريتل كاش / شام كاش وغيرها.",
  },
  {
    id: 3,
    icon: Receipt,
    tag: "التسليم",
    q: "هل يمكنني استخدام البطاقات الرقمية مباشرة بعد الشراء؟",
    a: "نعم، بعد إتمام عملية الدفع بنجاح، سيتم إرسال تفاصيل البطاقة أو الاشتراك على بريدك الإلكتروني فورًا، ويمكنك استخدامها مباشرة.",
  },
  {
    id: 4,
    icon: Repeat,
    tag: "الاسترجاع",
    q: "هل يمكنني استبدال أو إرجاع خدمة رقمية بعد شرائها؟",
    a: "نظرًا لطبيعة المنتجات الرقمية، لا يمكن إرجاع أو استبدال الخدمات بعد تفعيلها أو تسليمها. لكن إذا كان هناك أي مشكلة أو خطأ في الطلب، يرجى التواصل مع فريق الدعم الفني فورًا.",
  },
  {
    id: 5,
    icon: Gamepad2,
    tag: "الألعاب",
    q: "كيف يمكنني شحن رصيدي في ألعاب الفيديو؟",
    a: "إذا كنت ترغب في شحن رصيدك في الألعاب، يمكنك اختيار اللعبة المفضلة لك من بين الألعاب المدعومة، واتباع الخطوات لشراء رصيد اللعبة. بعد الدفع، ستصلك تفاصيل الشحن عبر بريدك الإلكتروني أو مباشرة على حسابك.",
  },
  {
    id: 6,
    icon: Ticket,
    tag: "الاشتراكات",
    q: "هل تقدمون اشتراكات لخدمات مثل Spotify أو Netflix؟",
    a: "نعم، نحن نقدم اشتراكات لعدد من الخدمات الشهيرة مثل Spotify و Netflix وغيرها من الخدمات الرقمية. يمكنك اختيار الاشتراك المناسب لك وإتمام عملية الدفع بسهولة.",
  },
  {
    id: 7,
    icon: BadgePercent,
    tag: "العروض",
    q: "هل تقدمون خصومات على الاشتراكات أو شحن الألعاب؟",
    a: "نعم، نحن نقدم خصومات دورية على بعض الخدمات الرقمية مثل الاشتراكات في التطبيقات أو بطاقات الهدايا. تأكد من الاشتراك في النشرة الإخبارية أو متابعة صفحاتنا على وسائل التواصل الاجتماعي لتكون أول من يعلم بالعروض الجديدة.",
  },
  {
    id: 8,
    icon: CreditCard,
    tag: "الدفع",
    q: "هل يمكنني دفع ثمن الخدمات الرقمية عبر الإنترنت؟",
    a: "نعم، يمكنك الدفع بسهولة عبر الإنترنت باستخدام بطاقات الائتمان، PayPal، أو وسائل الدفع الإلكترونية الأخرى. نحن نقدم خيارات دفع آمنة وسريعة.",
  },
  {
    id: 9,
    icon: Headphones,
    tag: "الدعم",
    q: "هل تقدمون دعمًا فنيًا إذا واجهت مشكلة في استخدام الخدمة؟",
    a: "بالطبع! إذا كنت تواجه أي مشكلة في استخدام الخدمة الرقمية التي قمت بشرائها، يمكنك التواصل مع فريق الدعم الفني لدينا عبر البريد الإلكتروني أو من خلال الدردشة المباشرة / الهاتف وسنساعدك في حل المشكلة.",
  },
  {
    id: 10,
    icon: Globe,
    tag: "الاستخدام",
    q: "هل يمكنني استخدام الخدمات الرقمية في أي وقت ومن أي مكان؟",
    a: "نعم، يمكنك استخدام معظم خدماتنا الرقمية في أي وقت ومن أي مكان طالما كان لديك اتصال بالإنترنت. ولكن تأكد من التحقق من الشروط الخاصة بكل خدمة لأن بعض الخدمات قد تكون محكومة بمناطق جغرافية معينة.",
  },
  {
    id: 11,
    icon: Ticket,
    tag: "بطاقات",
    q: "هل تقدمون شحن بطاقات هدايا لألعاب معينة فقط؟",
    a: "نعم، نحن نوفر بطاقات هدايا لأكثر الألعاب والخدمات شهرة مثل PUBG، Fortnite، Steam، Xbox، PlayStation وغيرها. يمكنك اختيار البطاقة المناسبة لك من بين الخيارات المتاحة.",
  },
  {
    id: 12,
    icon: ShieldCheck,
    tag: "الاشتراك",
    q: "هل يمكنني استخدام اشتراكات التطبيقات على أكثر من جهاز؟",
    a: "تعتمد إمكانية استخدام اشتراكات التطبيقات على نوع الخدمة التي اشتريتها. في معظم الحالات، يمكن استخدام الاشتراكات على عدة أجهزة بشرط أن تكون مرتبطة بنفس الحساب. تحقق من الشروط الخاصة بكل اشتراك.",
  },
  {
    id: 13,
    icon: Receipt,
    tag: "الطلبات",
    q: "كيف يمكنني الحصول على تفاصيل الطلب الذي قمت به؟",
    a: "ستتمكن من الحصول على تفاصيل الطلب مباشرة عبر بريدك الإلكتروني بمجرد إتمام عملية الدفع. كما يمكنك دائمًا مراجعة تاريخ طلباتك في حسابك على الموقع.",
  },
  {
    id: 14,
    icon: Globe,
    tag: "الدول",
    q: "هل تتوفر خدماتكم الرقمية في جميع الدول؟",
    a: "نحن نوفر خدماتنا الرقمية في العديد من البلدان. إذا كنت غير متأكد من توفر الخدمة في منطقتك، يمكنك التحقق من ذلك أثناء عملية الدفع أو التواصل مع دعم العملاء للاستفسار.",
  },
  {
    id: 15,
    icon: ShieldCheck,
    tag: "الخصوصية",
    q: "هل لديكم سياسة خصوصية لحماية بياناتي؟",
    a: "نعم، نحن نهتم بخصوصيتك. جميع البيانات التي نقوم بجمعها يتم استخدامها فقط لتحسين تجربتك في الموقع. يمكنك الاطلاع على سياسة الخصوصية الكاملة عبر صفحة سياسة الخصوصية داخل الموقع.",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const q = query.trim();
  const parts = text.split(new RegExp(`(${q})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <mark
            key={i}
            className="rounded-md bg-primary/15 px-1 text-foreground"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function FAQRow({
  item,
  open,
  onToggle,
  query,
}: {
  item: FAQItem;
  open: boolean;
  onToggle: () => void;
  query: string;
}) {
  const Icon = item.icon ?? HelpCircle;

  return (
    <div className="rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-right"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background">
            <Icon className="h-5 w-5 text-primary" />
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-foreground sm:text-base">
                <Highlight text={item.q} query={query} />
              </h3>
              {item.tag ? (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {item.tag}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              اضغط لعرض الإجابة
            </p>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm leading-7 text-muted-foreground">
                <Highlight text={item.a} query={query} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;

    return faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        (f.tag ?? "").toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
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
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                الأسئلة الشائعة
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground sm:text-base leading-7">
                هنا ستجد إجابات لأكثر الأسئلة تكرارًا حول خدمات AdamZone وطريقة
                الشراء والدفع والدعم.
              </p>
            </div>
          </motion.div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن سؤال أو كلمة..."
                className="w-full rounded-2xl border border-border bg-card px-10 py-3 text-sm text-foreground outline-none transition focus:border-primary/40"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              النتائج: {filtered.length} / {faqs.length}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-3">
          {filtered.map((item) => (
            <FAQRow
              key={item.id}
              item={item}
              query={query}
              open={openId === item.id}
              onToggle={() =>
                setOpenId((prev) => (prev === item.id ? null : item.id))
              }
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 rounded-2xl border border-border bg-secondary/40 p-5">
          <p className="text-sm leading-7 text-muted-foreground">
            لم تجد إجابتك؟ تواصل مع الدعم وسيتم مساعدتك بأسرع وقت.
          </p>
        </div>
      </div>
    </div>
  );
}
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import postBox from "../../api/postBox";
import getCurrencies from "../../api/getCurrencies";
import { useTranslation } from "react-i18next";
import {
  Check,
  Coins,
  Plus,
  Loader2,
  Box,
  User,
  Hash,
  Wallet,
  FileText,
  ImageIcon,
  Tag,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Currency {
  id: string;
  name: string;
}

/* ── Step sections ── */
const STEPS = ["الأساسية", "الحساب", "العملات"];

/* ── Styled input ── */
function Field({
  label,
  icon,
  children,
  hint,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          {icon}
          {label}
        </label>
        {hint && <span className="text-[10px] text-muted-foreground/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function DInput({
  placeholder,
  value,
  onChange,
  type = "text",
  id,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  id?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/10"
    />
  );
}

export function AddBoxForm({ query }: { query: UseQueryResult }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedCurrencyIds, setSelectedCurrencyIds] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [boxName, setBoxName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | undefined>(undefined);
  const [provider, setProvider] = useState<string>("");
  const [gsm, setGsm] = useState("");
  const [accountAddress, setAccountAddress] = useState("");

  const imageRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [t] = useTranslation("global");

  const currenciesQuery = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const res = await getCurrencies();
      return res.data.result as Currency[];
    },
    refetchOnWindowFocus: false,
  });

  const toggleCurrency = (id: string) =>
    setSelectedCurrencyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const reset = () => {
    setName(""); setAccountName(""); setAccountCode("");
    setBoxName(""); setWalletAddress(""); setDescription("");
    setImage(undefined); setImagePreview(null);
    setSelectedCurrencyIds([]); setStep(0);
    setProvider(""); setGsm(""); setAccountAddress("");
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await postBox(localStorage.getItem("token") as string, {
        name, account_name: accountName, account_code: accountCode,
        box_name: boxName, wallet_address: walletAddress,
        description, image,
        currencyIds: selectedCurrencyIds.map(Number),
        provider: provider || undefined,
        gsm: provider === "syriatel" ? gsm : undefined,
        account_address: provider === "shamcash" ? accountAddress : undefined,
      });
      return response;
    },
    onSuccess: (data) => {
      toast({ title: "تمت الإضافة!", description: data.data.result });
      setOpen(false); reset(); query.refetch();
    },
    onError: (error: AxiosError) => {
      toast({ title: "خطأ!", description: (error.response?.data as { error: string }).error });
    },
  });

  const stepContent = [
    /* ── Step 0: Basic info ── */
    <div key="step0" className="space-y-4">
      <Field label="اسم طريقة الدفع" icon={<Box className="h-3.5 w-3.5" />}>
        <DInput placeholder="مثال: فودافون كاش، بيتكوين..." value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="اسم الصندوق" icon={<Tag className="h-3.5 w-3.5" />} hint="اختياري">
        <DInput placeholder="الاسم المعروض للعميل" value={boxName} onChange={(e) => setBoxName(e.target.value)} />
      </Field>
      <Field label="الوصف" icon={<FileText className="h-3.5 w-3.5" />} hint="اختياري">
        <DInput placeholder="وصف مختصر لطريقة الدفع..." value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>

      {/* Image upload */}
      <Field label="صورة طريقة الدفع" icon={<ImageIcon className="h-3.5 w-3.5" />} hint="اختياري">
        <div
          onClick={() => imageRef.current?.click()}
          className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background/40 p-5 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="معاينة الصورة" className="h-20 w-auto rounded-lg object-contain" />
          ) : (
            <>
              <div className="rounded-full bg-muted p-2.5">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">اضغط لرفع صورة</p>
                <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP</p>
              </div>
            </>
          )}
          <input ref={imageRef} type="file" accept="image/*" title="رفع صورة" aria-label="رفع صورة" className="hidden" onChange={handleImage} />
        </div>
      </Field>
    </div>,

    /* ── Step 1: Account info ── */
    <div key="step1" className="space-y-4">
      <Field label={t("account_name")} icon={<User className="h-3.5 w-3.5" />}>
        <DInput placeholder="الاسم المسجل في الحساب" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
      </Field>
      <Field label={t("account_code2")} icon={<Hash className="h-3.5 w-3.5" />}>
        <DInput placeholder="رقم الحساب أو الكود" value={accountCode} onChange={(e) => setAccountCode(e.target.value)} />
      </Field>
      <Field label={t("wallet_address")} icon={<Wallet className="h-3.5 w-3.5" />} hint="اختياري">
        <DInput placeholder="عنوان المحفظة (للكريبتو)" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} />
      </Field>
      <Field label="مزود التحقق التلقائي" icon={<CreditCard className="h-3.5 w-3.5" />} hint="اختياري">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/10"
        >
          <option value="">بدون</option>
          <option value="syriatel">سيريتل كاش (API Syria)</option>
          <option value="shamcash">شام كاش (API Syria)</option>
          <option value="kazawallet">Kazawallet</option>
        </select>
      </Field>
      {provider === "syriatel" && (
        <Field label="رقم/كود سيريتل كاش (GSM)" icon={<Hash className="h-3.5 w-3.5" />}>
          <DInput placeholder="0999xxxxxx" value={gsm} onChange={(e) => setGsm(e.target.value)} />
        </Field>
      )}
      {provider === "shamcash" && (
        <Field label="عنوان حساب شام كاش" icon={<Hash className="h-3.5 w-3.5" />}>
          <DInput placeholder="عنوان الحساب" value={accountAddress} onChange={(e) => setAccountAddress(e.target.value)} />
        </Field>
      )}
    </div>,

    /* ── Step 2: Currencies ── */
    <div key="step2" className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Coins className="h-3.5 w-3.5" /> العملات المقبولة
        </p>
        {selectedCurrencyIds.length > 0 && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            {selectedCurrencyIds.length} محدد
          </span>
        )}
      </div>

      {currenciesQuery.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !currenciesQuery.data?.length ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 text-muted-foreground">
          <Coins className="h-8 w-8 opacity-30" />
          <p className="text-sm">لا توجد عملات مضافة</p>
          <p className="text-xs opacity-60">أضف عملات من قسم العملات أولاً</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {currenciesQuery.data.map((cur) => {
            const selected = selectedCurrencyIds.includes(cur.id);
            return (
              <motion.button
                key={cur.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleCurrency(cur.id)}
                className={`relative flex items-center gap-2.5 overflow-hidden rounded-xl border px-3.5 py-3 text-sm font-medium transition-all
                  ${selected
                    ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                    : "border-border bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
              >
                {/* check circle */}
                <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
                  ${selected ? "border-primary bg-primary" : "border-muted-foreground/30"}`}
                >
                  <AnimatePresence>
                    {selected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <Coins className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                <span className="truncate">{cur.name}</span>
                {selected && (
                  <motion.span
                    layoutId={`glow-${cur.id}`}
                    className="pointer-events-none absolute inset-0 rounded-xl bg-primary/5"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>,
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t("add")}
        </Button>
      </DialogTrigger>

      <DialogContent
        dir="rtl"
        className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <VisuallyHidden.Root>
          <DialogDescription />
        </VisuallyHidden.Root>

        {/* Header */}
        <DialogHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground">
                إضافة صندوق شحن جديد
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                الخطوة {step + 1} من {STEPS.length} · {STEPS[step]}
              </p>
            </div>
          </div>

          {/* Step progress bar */}
          <div className="mt-4 flex gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col gap-1">
                <div className={`h-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-muted"}`} />
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Step tabs */}
        <div className="flex border-b border-border">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
                i === step
                  ? "border-b-2 border-primary text-primary"
                  : i < step
                  ? "text-muted-foreground hover:text-foreground"
                  : "cursor-not-allowed text-muted-foreground/40"
              }`}
              disabled={i > step && !name}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: "55vh" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.18 }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            السابق
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={step === 0 && !name.trim()}
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              التالي
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={mutation.isPending || !name.trim()}
              onClick={() => mutation.mutate()}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> جارٍ الحفظ...</>
              ) : (
                <><Check className="h-4 w-4" /> حفظ الصندوق</>
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
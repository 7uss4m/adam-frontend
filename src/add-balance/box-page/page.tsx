/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { AxiosError } from "axios";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  Copy,
  CheckCheck,
  ChevronLeft,
  Home,
  CreditCard,
  Coins,
  ImageIcon,
  Hash,
  FileText,
  Zap,
  Clock,
  Send,
  AlertCircle,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import getBoxById from "../../api/getBoxById";
import postNote from "../../api/postNote";
import postChargeOnlineMethod from "../../api/postChargeOnlineMethod";

import type { ChargeBox } from "../../types/types";

import Spinner from "../../components/Spinner";
import { useToast } from "../../components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

/* ── Copyable field ── */
function CopyField({
  label,
  value,
  icon,
  onCopy,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  onCopy: (v: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group rounded-xl border border-[#1a2a44] bg-[#060e1a] p-3 transition-all hover:border-cyan-500/20">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
          {icon}
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg bg-[#0a1628] border border-[#1a2a44] px-2 py-1 text-[10px] font-bold text-gray-400 transition-all hover:border-cyan-500/30 hover:text-cyan-400"
        >
          {copied ? (
            <><CheckCheck className="h-3 w-3 text-green-400" /> تم النسخ</>
          ) : (
            <><Copy className="h-3 w-3" /> نسخ</>
          )}
        </button>
      </div>
      <p
        onClick={handleCopy}
        className="cursor-pointer select-all rounded-lg bg-[#0a1628]/60 px-3 py-2 font-mono text-sm text-white break-all"
      >
        {value}
      </p>
    </div>
  );
}

/* ── Wallet QR Code ── */
function WalletQR({
  address,
  label,
  onCopy,
}: {
  address: string;
  label: string;
  onCopy: (v: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-[#1a2a44] bg-[#060e1a] p-4 transition-all hover:border-cyan-500/20">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
          <Coins className="h-3 w-3" />
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg bg-[#0a1628] border border-[#1a2a44] px-2 py-1 text-[10px] font-bold text-gray-400 transition-all hover:border-cyan-500/30 hover:text-cyan-400"
        >
          {copied ? (
            <><CheckCheck className="h-3 w-3 text-green-400" /> تم النسخ</>
          ) : (
            <><Copy className="h-3 w-3" /> نسخ</>
          )}
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        {/* QR Code */}
        <div className="rounded-2xl bg-white p-3 shadow-lg shadow-cyan-500/5">
          <QRCodeSVG
            value={address}
            size={160}
            bgColor="#ffffff"
            fgColor="#050B14"
            level="M"
            marginSize={0}
          />
        </div>
        <p className="text-[10px] text-gray-600">امسح الكود بمحفظتك للنسخ التلقائي</p>
      </div>

      {/* Address text */}
      <p
        onClick={handleCopy}
        className="mt-3 cursor-pointer select-all rounded-lg bg-[#0a1628]/60 px-3 py-2 font-mono text-xs text-cyan-400 break-all text-center leading-relaxed"
      >
        {address}
      </p>
    </div>
  );
}

/* ── Form field wrapper ── */
function FormField({
  label,
  icon,
  hint,
  required,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-300">
          {icon}
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
        {hint && <span className="text-[10px] text-gray-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-[#1a2a44] bg-[#060e1a] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10";

export default function BoxPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [t] = useTranslation("global");
  const { toast } = useToast();

  const [methodId, setMethodId] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [txId, setTxId] = useState<string>("");
  const [open, setOpen] = useState(false);

  const coinsRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const getBoxQuery = useQuery({
    queryKey: ["single box", id],
    queryFn: async () => {
      const response = await getBoxById(
        localStorage.getItem("token") as string,
        id as string
      );
      return response.data.result as ChargeBox;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const isAuto =
    (getBoxQuery.data?.account_name || "").trim() === "syriatel" ||
    (getBoxQuery.data?.account_name || "").trim() === "syriate" ||
    (getBoxQuery.data?.name || "").trim() === "سيريتل كاش" ||
    (getBoxQuery.data?.account_name || "").trim() === "shamcash";

  const isTxIdRequired =
    (getBoxQuery.data?.account_name || "").trim() === "syriatel" ||
    (getBoxQuery.data?.account_name || "").trim() === "syriate" ||
    (getBoxQuery.data?.name || "").trim() === "سيريتل كاش" ||
    (getBoxQuery.data?.account_name || "").trim() === "shamcash";

  const postNoteMutation = useMutation({
    mutationFn: async () => {
      if (isTxIdRequired && !txId.trim()) {
        throw new Error("TX_ID_REQUIRED");
      }
      const response = await postNote(localStorage.getItem("token") as string, {
        coins: coinsRef.current?.value ? Number(coinsRef.current.value) : undefined,
        currencyId: methodId as string,
        code: code.trim() || undefined,
        tx_id: txId.trim() || undefined,
        image: imageRef.current?.files ? imageRef.current.files[0] : null,
      });
      return response;
    },
    onSuccess: () => {
      toast({ title: t("done"), description: t("note_done") });
      navigate("/payments", { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (error: any) => {
      const axiosError = error as AxiosError;
      const msg = (axiosError.response?.data as { error?: string })?.error;
      toast({
        title: "Error!",
        description:
          msg === "image is required for note"
            ? t("image_is_required_for_note")
            : msg || error.message,
      });
    },
  });

  const postOnlineNoteMutation = useMutation({
    mutationFn: async () => {
      const response = await postChargeOnlineMethod(
        localStorage.getItem("token") as string,
        coinsRef.current?.value as string
      );
      return response;
    },
    onSuccess: (data) => {
      toast({ title: t("done"), description: t("note_done") });
      if (data.data.result) window.location.href = data.data.result;
    },
    onError: (error: AxiosError) => {
      toast({ title: "Error!", description: error.message });
    },
  });

  const submitting = postNoteMutation.isPending || postOnlineNoteMutation.isPending;

  const copy = (value?: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast({ title: t("copied") });
  };

  if (getBoxQuery.isLoading) {
    return (
      <section className="min-h-[60vh] flex justify-center items-center bg-[#050B14]">
        <Spinner />
      </section>
    );
  }

  if (!getBoxQuery.isSuccess || !getBoxQuery.data) {
    return (
      <section className="min-h-svh flex justify-center items-center text-cyan-400 text-xl bg-[#050B14]">
        {t("something_went_wrong")}
      </section>
    );
  }

  const box = getBoxQuery.data;

  const extractedNumbers =
    (box.description?.match(/-\s*\d{5,}\s*-/g) || []).length > 0
      ? box.description
          .split("-")
          .map((x) => x.trim())
          .filter((x) => /^\d+$/.test(x))
      : [];

  const hasDetails = box.account_code || box.box_name || box.wallet_address || box.description;

  return (
    <div dir="rtl" className="min-h-svh bg-[#050B14] relative overflow-hidden">
      {/* Ambient bg */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-cyan-500/[0.05] blur-[120px]" />
      </div>

      <main className="relative container mx-auto max-w-[95%] md:max-w-[88%] lg:max-w-[72%] px-4">

        {/* Breadcrumb */}
        <nav className="pt-6 pb-2 flex items-center gap-1.5 text-xs text-gray-600">
          <Link to="/" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
            <Home className="w-3 h-3" /> الرئيسية
          </Link>
          <ChevronLeft className="w-3 h-3" />
          <Link to="/add-balance" className="hover:text-cyan-400 transition-colors">شحن الرصيد</Link>
          <ChevronLeft className="w-3 h-3" />
          <span className="text-gray-400 truncate max-w-[160px]">{box.name}</span>
        </nav>

        {/* ── Header card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 mb-8 rounded-2xl border border-[#1a2a44] bg-[#0a1628] overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 sm:p-6">
            {/* Box image */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-[#1a2a44] bg-[#060e1a] flex-shrink-0">
              {box.image ? (
                <img src={box.image} alt={box.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <CreditCard className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-right">
              <h1 className="text-xl font-black text-white lg:text-2xl">{box.name}</h1>
              {box.account_name && (
                <p className="mt-1 text-sm text-gray-400">{box.account_name}</p>
              )}

              {/* Tags */}
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-[11px] font-bold text-green-400">
                  <ShieldCheck className="h-3 w-3" /> آمن وموثوق
                </span>
                <span className="flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-bold text-cyan-400">
                  <Zap className="h-3 w-3" /> تنفيذ سريع
                </span>
                <span className="flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-400">
                  <Clock className="h-3 w-3" /> دعم 24/7
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Main grid ── */}
        <div className={`grid gap-6 pb-12 ${hasDetails ? "lg:grid-cols-[1fr_420px]" : "max-w-xl mx-auto"}`}>

          {/* ═══ Left – Details ═══ */}
          {hasDetails && (
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-[#1a2a44] bg-[#0a1628] p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  {t("details") || "تفاصيل الدفع"}
                </h2>

                <div className="space-y-3" translate="no">
                  {box.account_code && (
                    <CopyField
                      label={t("account_code") || "رقم الحساب"}
                      value={box.account_code}
                      icon={<Hash className="h-3 w-3" />}
                      onCopy={copy}
                    />
                  )}
                  {box.box_name && (
                    <CopyField
                      label={t("box_name") || "اسم الصندوق"}
                      value={box.box_name}
                      icon={<CreditCard className="h-3 w-3" />}
                      onCopy={copy}
                    />
                  )}
                  {box.wallet_address && (
                    <WalletQR address={box.wallet_address} onCopy={copy} label={t("wallet_address") || "عنوان المحفظة"} />
                  )}
                </div>
              </div>

              {/* Description */}
              {box.description && (
                <div className="rounded-2xl border border-[#1a2a44] bg-[#0a1628] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <FileText className="h-3.5 w-3.5" />
                      {t("description") || "التعليمات"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => copy(box.description)}
                      className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                      <Copy className="h-3 w-3" /> نسخ
                    </button>
                  </div>
                  <div
                    onClick={() => copy(box.description)}
                    className="cursor-pointer rounded-xl bg-[#060e1a] border border-[#1a2a44] p-4 text-sm text-gray-400 leading-relaxed whitespace-pre-wrap"
                  >
                    {box.description}
                  </div>
                </div>
              )}

              {/* Extracted numbers */}
              {extractedNumbers.length > 0 && (
                <div className="rounded-2xl border border-[#1a2a44] bg-[#0a1628] p-5">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-3">
                    <Hash className="h-3.5 w-3.5" />
                    {t("numbers") || "أرقام التحويل"}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {extractedNumbers.map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => { copy(n); toast({ title: `${n} ${t("copied")}` }); }}
                        className="flex items-center justify-between rounded-xl border border-[#1a2a44] bg-[#060e1a] px-4 py-2.5 transition-all hover:border-cyan-500/30"
                      >
                        <span className="font-mono text-sm font-bold text-white">{n}</span>
                        <Copy className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {/* ═══ Right – Form ═══ */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="sticky top-6 rounded-2xl border border-[#1a2a44] bg-[#0a1628] overflow-hidden">
              {/* Form header */}
              <div className="border-b border-[#1a2a44] bg-[#060e1a] px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Send className="h-4 w-4 text-cyan-400" />
                  {t("add_balance") || "إرسال طلب الشحن"}
                </h2>
                <p className="mt-1 text-[11px] text-gray-500">أكمل البيانات أدناه لإرسال طلب الشحن</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  postNoteMutation.mutate();
                }}
                className="p-5 space-y-4"
              >
                {/* Amount */}
                {!isAuto && (
                  <FormField
                    label={t("amount") || "المبلغ"}
                    icon={<Coins className="h-3.5 w-3.5 text-cyan-400" />}
                    required
                  >
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min={0}
                      ref={coinsRef}
                      placeholder="أدخل المبلغ بالدولار"
                      className={INPUT_CLASS}
                    />
                  </FormField>
                )}

                {/* Currency */}
                <FormField
                  label={t("payment") || "العملة"}
                  icon={<CreditCard className="h-3.5 w-3.5 text-cyan-400" />}
                  required
                >
                  {box.currencies && box.currencies.length <= 4 ? (
                    /* Grid buttons for ≤4 currencies */
                    <div className={`grid gap-2 ${box.currencies.length <= 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
                      {box.currencies.map((cur) => (
                        <button
                          key={cur.id}
                          type="button"
                          onClick={() => setMethodId(cur.id)}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all
                            ${methodId === cur.id
                              ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-sm shadow-cyan-500/10"
                              : "border-[#1a2a44] bg-[#060e1a] text-gray-400 hover:border-cyan-500/30 hover:text-gray-300"
                            }`}
                        >
                          <Coins className="h-3.5 w-3.5" />
                          {cur.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Dropdown for >4 currencies */
                    <Select
                      open={open}
                      onOpenChange={() => setTimeout(() => setOpen((v: any) => !v), 0)}
                      onValueChange={(value) => setMethodId(value)}
                    >
                      <SelectTrigger className="w-full h-12 rounded-xl border border-[#1a2a44] bg-[#060e1a] text-sm text-white">
                        <SelectValue placeholder={t("select_payment_method") || "اختر العملة"} />
                      </SelectTrigger>
                      <SelectContent className="border-[#1a2a44] bg-[#0a1628]">
                        {box.currencies?.map((currency) => (
                          <SelectItem key={currency.id} value={currency.id} className="text-white focus:bg-[#1a2a44]">
                            {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>

                {/* Receipt image */}
                <FormField
                  label={t("note") || "إيصال الدفع"}
                  icon={<ImageIcon className="h-3.5 w-3.5 text-cyan-400" />}
                  required
                >
                  <div
                    onClick={() => imageRef.current?.click()}
                    className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#1a2a44] bg-[#060e1a] p-5 text-center transition-all hover:border-cyan-500/30 hover:bg-[#060e1a]/80"
                  >
                    <AnimatePresence mode="wait">
                      {imagePreview ? (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <img src={imagePreview} alt="إيصال" className="h-24 w-auto rounded-lg object-contain" />
                          <span className="text-[11px] text-cyan-400">اضغط لتغيير الصورة</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="rounded-full bg-[#0a1628] border border-[#1a2a44] p-3">
                            <ImageIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-300">ارفع صورة الإيصال</p>
                            <p className="text-[11px] text-gray-600">PNG, JPG, WEBP</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      ref={imageRef}
                      type="file"
                      accept="image/*"
                      title="رفع إيصال"
                      aria-label="رفع إيصال"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                </FormField>

                {/* Syriatel: Transfer code */}
                {isTxIdRequired && box.account_name === "syriatel" && (
                  <FormField
                    label="كود التحويل"
                    icon={<Hash className="h-3.5 w-3.5 text-cyan-400" />}
                    required
                  >
                    {extractedNumbers.length > 0 ? (
                      <>
                        <Select value={code} onValueChange={(v) => setCode(v)}>
                          <SelectTrigger className="w-full h-12 rounded-xl border border-[#1a2a44] bg-[#060e1a] text-sm text-white">
                            <SelectValue placeholder="اختر كود التحويل" />
                          </SelectTrigger>
                          <SelectContent className="border-[#1a2a44] bg-[#0a1628]">
                            {extractedNumbers.map((n) => (
                              <SelectItem key={n} value={n} className="text-white focus:bg-[#1a2a44] font-mono">
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-gray-600">اختر كود التحويل من الأرقام المتاحة</p>
                      </>
                    ) : (
                      <input
                        id="code"
                        name="code"
                        type="text"
                        value={code}
                        placeholder="أدخل كود التحويل"
                        onChange={(e) => setCode(e.currentTarget.value)}
                        className={INPUT_CLASS}
                      />
                    )}
                  </FormField>
                )}

                {/* TX ID */}
                {isTxIdRequired && (
                  <FormField
                    label="رقم العملية"
                    icon={<Hash className="h-3.5 w-3.5 text-cyan-400" />}
                    required
                    hint="مطلوب"
                  >
                    <input
                      id="tx_id"
                      name="tx_id"
                      type="text"
                      value={txId}
                      placeholder="أدخل رقم العملية"
                      onChange={(e) => setTxId(e.currentTarget.value)}
                      required
                      className={INPUT_CLASS}
                    />
                    <p className="flex items-center gap-1 text-[10px] text-gray-600">
                      <AlertCircle className="h-3 w-3" />
                      {t("tx_id_required_hint") || "هذا الحقل مطلوب لهذه الطريقة"}
                    </p>
                  </FormField>
                )}

                {/* Submit */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!methodId || submitting || (isTxIdRequired && !txId.trim())}
                  className="relative mt-2 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {/* Shimmer */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> جارٍ الإرسال...</>
                  ) : (
                    <><Send className="h-4 w-4" /> {t("order") || "إرسال طلب الشحن"}</>
                  )}
                </motion.button>

                {/* Security note */}
                <p className="flex items-center justify-center gap-1.5 text-center text-[10px] text-gray-600">
                  <ShieldCheck className="h-3 w-3 text-green-500/60" />
                  جميع المعاملات مشفرة ومحمية بتقنية SSL
                </p>
              </form>
            </div>
          </motion.section>
        </div>

        {/* Back */}
        <div className="py-8 border-t border-[#1a2a44]">
          <Link
            to="/add-balance"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-cyan-400"
          >
            <ArrowRight className="h-4 w-4" />
            {t("back") || "العودة لطرق الدفع"}
          </Link>
        </div>
      </main>
    </div>
  );
}
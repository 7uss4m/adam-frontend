/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import parse from "html-react-parser";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ShoppingCart,
  Shield,
  Clock,
  Zap,
  Loader2,
  Star,
  CheckCircle2,
  ChevronLeft,
  Hash,
  Layers,
  MapPin,
} from "lucide-react";

import type { Category, Product } from "../types/types";

import Spinner from "../components/Spinner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

import getAllSub from "../api/getAllSub";
import getProducts from "../api/getProducts";
import getDollar from "../api/getDollar";
import postOrder from "../api/postOrder";

import { useTranslation } from "react-i18next";
import { toast } from "../components/ui/use-toast";
import { useCurrency } from "../context/CurrencyContext";

type Area = { id: string; name: string };
type ProductWithAreas = Product & { areas?: Area[] };

function formatMoney({
  currency,
  usd,
  usdToSyp,
}: {
  currency: "dollar" | "syrian";
  usd: number;
  usdToSyp: number;
}) {
  if (currency === "dollar") return `$${usd.toFixed(2)}`;
  return `${(usd * usdToSyp).toFixed(0)} ل.س`;
}

/* ── Styled field wrapper ── */
function Field({
  label,
  badge,
  hint,
  children,
  icon,
}: {
  label: string;
  badge?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-2xl border border-[#1a2a44] bg-[#0a1628] p-5 transition-all duration-200 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0d1b2e] border border-[#1a2a44] text-cyan-400">
              {icon}
            </span>
          )}
          <span className="text-sm font-bold text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {hint && (
            <span className="rounded-md bg-[#0d1b2e] border border-[#1a2a44] px-2 py-0.5 text-[11px] text-gray-500 font-mono">
              {hint}
            </span>
          )}
          {badge}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Dark input ── */
function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-[#1a2a44] bg-[#060e1a] px-4 py-3.5 text-base text-white outline-none " +
        "placeholder:text-gray-600 transition-all duration-200 " +
        "focus:border-cyan-500/60 focus:bg-[#071320] focus:ring-2 focus:ring-cyan-500/15 " +
        (props.className ?? "")
      }
    />
  );
}

export default function Purchase() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { id, subId, productId } = useParams();
  const [t] = useTranslation("global");
  const { currency } = useCurrency();

  const [quantity, setQuantity] = useState(1);
  const [playerId, setPlayerId] = useState("");
  const [hasText, setHasText] = useState(false);
  const [hasQuantity, setHasQuantity] = useState(false);
  const [min, setMin] = useState<number | undefined>(undefined);
  const [max, setMax] = useState<number | undefined>(undefined);
  const [hasQuantityOptions, setHasQuantityOptions] = useState(false);
  const [quantityOptions, setQuantityOptions] = useState<string[]>([]);
  const [currQuantityOption, setCurrQuantityOption] = useState<string | undefined>(undefined);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  const getDolla = useQuery({
    queryKey: ["static", "dollar_exchange"],
    queryFn: async () => {
      const response = await getDollar();
      return Number(response.data.date.dollar_exchange || 0);
    },
    refetchOnWindowFocus: false,
  });

  const getAllSubQuery = useQuery({
    queryKey: ["sub", id, subId],
    queryFn: async () => {
      const response = await getAllSub();
      const category = (response.data.result as Category[]).find(
        (c) => c.id.toString() === String(subId)
      );
      return category as Category | undefined;
    },
    refetchOnWindowFocus: false,
  });

  const getProductQuery = useQuery({
    queryKey: ["getProduct", "purchase", subId, productId],
    queryFn: async () => {
      const response = await getProducts(
        subId as string,
        localStorage.getItem("token") as string
      );
      const products = response.data.result as Product[];
      const product = products.find((p) => p.id.toString() === String(productId));

      const quantityReq = product?.requires?.find(
        (req) => req.type === "quantity" || req.type === "amount"
      ) ?? null;
      const textReq = product?.requires?.find((req) => req.type === "text") ?? null;
      const selectQtyReq = product?.requires?.find((req) => req.type === "selectQty") ?? null;

      setHasText(!!textReq);
      setHasQuantityOptions(!!selectQtyReq?.type_value);
      setHasQuantity(!!quantityReq);

      const minV = Number(quantityReq?.type_value?.min);
      const maxV = Number(quantityReq?.type_value?.max);
      setMin(Number.isFinite(minV) ? minV : undefined);
      setMax(Number.isFinite(maxV) ? maxV : undefined);
      setQuantity(Number.isFinite(minV) ? minV : 1);

      const opts = (selectQtyReq?.type_value as unknown as string[]) || [];
      setQuantityOptions(opts);

      return product as Product;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (getProductQuery.isError) console.error(getProductQuery.error);
  }, [getProductQuery.isError, getProductQuery.error]);

  const product = getProductQuery.data as ProductWithAreas | undefined;
  const usdToSyp = getDolla.data || 0;

  const computedQty = useMemo(() => {
    if (hasQuantity) return quantity;
    if (hasQuantityOptions && currQuantityOption) return Number(currQuantityOption);
    return 1;
  }, [hasQuantity, quantity, hasQuantityOptions, currQuantityOption]);

  const totalPriceUSD = useMemo(() => {
    return Number(product?.price || 0) * Number(computedQty || 1);
  }, [product?.price, computedQty]);

  const postOrderMutation = useMutation({
    mutationFn: async () => {
      const inputs = document.querySelectorAll("input");
      const inputsData = Array.from(inputs)
        .slice(1)
        .reduce<Record<string, string>>((acc, input) => {
          if (input.id && input.id !== "amount") acc[input.id] = input.value;
          return acc;
        }, {});

      const area =
        product?.areas && selectedAreaId
          ? product.areas.find((a) => a.id === selectedAreaId)
          : undefined;

      const response = await postOrder(localStorage.getItem("token") as string, {
        quantity: computedQty,
        productId: productId as string,
        appId: playerId,
        ...inputsData,
        ...(area ? { area } : {}),
      });
      return response.data;
    },
    onSuccess: () => {
      toast({ title: t("p_done") });
      queryClient.invalidateQueries({ queryKey: ["user", "id"] });
      navigate("/orders?purchase=success", { replace: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (error: AxiosError) => {
      const msg = (error.response?.data as { error: string })?.error;
      toast({
        title: "Error!",
        description:
          msg === "Token verification failed"
            ? t("login_first")
            : msg === "[object Object]"
            ? t("try_again_later")
            : msg,
      });
    },
  });

  const disableBuy =
    postOrderMutation.isPending ||
    postOrderMutation.isSuccess ||
    (min !== undefined && quantity < min) ||
    (max !== undefined && quantity > max) ||
    (hasText && !playerId) ||
    (hasQuantityOptions && !currQuantityOption);

  if (getAllSubQuery.isLoading || getProductQuery.isLoading || getDolla.isLoading) {
    return (
      <section className="min-h-[60vh] flex justify-center items-center bg-[#050B14]">
        <Spinner />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="min-h-svh flex justify-center items-center text-cyan-400 text-xl bg-[#050B14]">
        {t("no_product")}
      </section>
    );
  }

  const displayPrice = formatMoney({ currency, usd: totalPriceUSD, usdToSyp });

  return (
    <div dir="rtl" className="min-h-svh bg-[#050B14]">
      {/* subtle grid bg */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <main className="relative container mx-auto max-w-[100%] md:max-w-[88%] lg:max-w-[72%] px-4 py-10">

        {/* ── Breadcrumb ── */}
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-gray-600">
          <Link to="/" className="hover:text-cyan-400 transition-colors">الرئيسية</Link>
          <ChevronLeft className="w-3 h-3" />
          <Link to={`/categories/${id}/subs`} className="hover:text-cyan-400 transition-colors">
            {getAllSubQuery.data?.name || "القسم"}
          </Link>
          <ChevronLeft className="w-3 h-3" />
          <Link to={`/categories/${id}/subs/${subId}`} className="hover:text-cyan-400 transition-colors">
            المنتجات
          </Link>
          <ChevronLeft className="w-3 h-3" />
          <span className="text-gray-400 truncate max-w-[180px]">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px]">

          {/* ══ LEFT — Image + info ══ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Image card */}
            <div className="group relative overflow-hidden rounded-3xl border border-[#1a2a44] bg-[#0a1628] shadow-2xl shadow-black/40">
              <img
                src={product.image}
                alt={product.name}
                className="h-[280px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:h-[360px] lg:h-[420px]"
              />

              {/* gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/20 to-transparent" />

              {/* category pill */}
              {getAllSubQuery.data?.name && (
                <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-[#050B14]/80 px-3 py-1 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-semibold text-cyan-300">{getAllSubQuery.data.name}</span>
                </div>
              )}

              {/* bottom info bar */}
              <div className="absolute bottom-0 inset-x-0 px-5 pb-5 pt-10">
                <h1 className="text-xl font-black text-white drop-shadow-lg sm:text-2xl">
                  {product.name}
                </h1>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`}
                      />
                    ))}
                    <span className="mr-1 text-xs text-gray-300">4.9</span>
                  </div>
                  <span className="h-3 w-px bg-white/20" />
                  <span className="text-xs text-gray-400">منتج رقمي معتمد</span>
                </div>
              </div>
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Shield className="h-5 w-5" />, color: "cyan", label: "دفع آمن 100%", sub: "SSL مشفّر" },
                { icon: <Zap className="h-5 w-5" />, color: "green", label: "تسليم فوري", sub: "خلال ثوانٍ" },
                { icon: <Clock className="h-5 w-5" />, color: "orange", label: "دعم 24/7", sub: "طوال الأسبوع" },
              ].map(({ icon, color, label, sub }) => (
                <div
                  key={label}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all
                    ${color === "cyan" ? "border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40" : ""}
                    ${color === "green" ? "border-green-500/20 bg-green-500/5 hover:border-green-500/40" : ""}
                    ${color === "orange" ? "border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40" : ""}
                  `}
                >
                  <div className={`rounded-xl p-2
                    ${color === "cyan" ? "bg-cyan-500/15 text-cyan-400" : ""}
                    ${color === "green" ? "bg-green-500/15 text-green-400" : ""}
                    ${color === "orange" ? "bg-orange-500/15 text-orange-400" : ""}
                  `}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{label}</p>
                    <p className="text-[10px] text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="rounded-2xl border border-[#1a2a44] bg-[#0a1628] p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">تفاصيل المنتج</p>
                <div className="prose prose-sm prose-invert max-w-none leading-relaxed text-gray-400">
                  {parse(product.description)}
                </div>
              </div>
            )}
          </motion.div>

          {/* ══ RIGHT — Purchase panel ══ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex flex-col gap-4"
          >
            {/* Price card */}
            <div className="relative overflow-hidden rounded-3xl border border-[#1a2a44] bg-[#0a1628] p-6 shadow-xl">
              {/* glow */}
              <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                {getAllSubQuery.data?.name || "المنتج"}
              </p>
              <h2 className="mt-1 text-lg font-black text-white">{product.name}</h2>

              <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#1a2a44] pt-5">
                <div>
                  <p className="text-[11px] text-gray-600 mb-1">السعر الإجمالي</p>
                  <p className="text-4xl font-black text-cyan-400 leading-none">
                    {displayPrice}
                  </p>
                  <p className="mt-1.5 text-xs text-gray-500">
                    الكمية: <span className="text-gray-300 font-bold">{computedQty}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-[11px] font-bold text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    متوفر
                  </span>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <form className="flex flex-col gap-3">
              {product.requires?.map((req, index) => {
                if (req.type === "text") {
                  const label = req.question === "null" ? req.name : req.question;
                  return (
                    <Field
                      key={index}
                      label={label}
                      icon={<Hash className="h-3.5 w-3.5" />}
                      badge={
                        <span className="rounded-md bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 text-[11px] font-mono font-bold text-cyan-400">
                          UID
                        </span>
                      }
                    >
                      <DarkInput
                        id={req.name}
                        type="text"
                        placeholder="أدخل الـ UID الخاص بك..."
                        onChange={(e) => {
                          if (index === 0) setPlayerId(e.currentTarget.value);
                        }}
                      />
                    </Field>
                  );
                }

                if (req.type === "quantity" || req.type === "amount") {
                  const label = req.question === "null" ? req.name : req.question;
                  return (
                    <Field
                      key={index}
                      label={label}
                      icon={<Layers className="h-3.5 w-3.5" />}
                    >
                      <DarkInput
                        id={req.name}
                        type="number"
                        min={req.type_value?.min}
                        max={req.type_value?.max}
                        value={quantity}
                        placeholder="ادخل العدد المطلوب"
                        onChange={(e) => setQuantity(Number(e.currentTarget.value))}
                      />

                      {/* min/max progress bar */}
                      {min !== undefined && max !== undefined && (
                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-500">الحد الأدنى: <span className="font-bold text-gray-300">{min}</span></span>
                            <span className={`font-bold ${quantity < min || quantity > max ? "text-red-400" : "text-cyan-400"}`}>
                              {quantity < min ? "أقل من الحد" : quantity > max ? "تجاوز الحد" : `✓ ضمن النطاق`}
                            </span>
                            <span className="text-gray-500">الحد الأقصى: <span className="font-bold text-gray-300">{max}</span></span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[#0d1b2e] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                quantity < min || quantity > max
                                  ? "bg-red-500"
                                  : "bg-gradient-to-r from-cyan-500 to-blue-500"
                              }`}
                              style={{
                                width: `${Math.min(100, Math.max(0, ((quantity - min) / (max - min)) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* only max */}
                      {min === undefined && max !== undefined && quantity > max && (
                        <p className="mt-2 text-xs text-red-400">الحد الأقصى المسموح: {max}</p>
                      )}
                    </Field>
                  );
                }

                if (req.type === "selectQty") {
                  const label = req.question === "null" ? req.name : req.question;
                  return (
                    <Field
                      key={index}
                      label={label}
                      icon={<Layers className="h-3.5 w-3.5" />}
                    >
                      <Select
                        value={currQuantityOption}
                        onValueChange={(value) => {
                          setQuantity(Number(value));
                          setCurrQuantityOption(value);
                        }}
                      >
                        <SelectTrigger className="h-12 w-full rounded-xl border border-[#1a2a44] bg-[#060e1a] text-base text-white focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15">
                          <SelectValue placeholder="اختر الكمية" />
                        </SelectTrigger>
                        <SelectContent className="border-[#1a2a44] bg-[#0a1628]">
                          <SelectGroup>
                            {quantityOptions.map((option, i) => (
                              <SelectItem key={i} value={option} className="text-base text-white focus:bg-[#1a2a44]">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  );
                }

                return null;
              })}

              {product.areas && product.areas.length > 0 && (
                <Field label={t("area") || "المنطقة"} icon={<MapPin className="h-3.5 w-3.5" />}>
                  <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                    <SelectTrigger className="h-12 w-full rounded-xl border border-[#1a2a44] bg-[#060e1a] text-base text-white focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15">
                      <SelectValue placeholder={t("select_area") || "اختر المنطقة"} />
                    </SelectTrigger>
                    <SelectContent className="border-[#1a2a44] bg-[#0a1628]">
                      <SelectGroup>
                        {product.areas.map((area) => (
                          <SelectItem key={area.id} value={area.id} className="text-base text-white focus:bg-[#1a2a44]">
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {/* Buy button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={disableBuy}
                    type="button"
                    className="relative mt-1 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-base font-black text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {/* shimmer */}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <AnimatePresence mode="wait">
                      {postOrderMutation.isPending ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="h-5 w-5 animate-spin" />
                          جارٍ المعالجة...
                        </motion.span>
                      ) : (
                        <motion.span
                          key="buy"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingCart className="h-5 w-5" />
                          {t("buy") || "شراء الآن"}
                          <span className="mr-2 rounded-lg bg-white/15 px-2 py-0.5 text-sm font-bold">
                            {displayPrice}
                          </span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </AlertDialogTrigger>

                <AlertDialogContent dir="rtl" className="border-[#1a2a44] bg-[#0a1628]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-black text-white">
                      {t("confirm_purchase") || "تأكيد الشراء"}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="mt-3 space-y-3 rounded-xl border border-[#1a2a44] bg-[#060e1a] p-4 text-right">
                        {[
                          { label: t("product") || "المنتج", value: product.name, highlight: false },
                          { label: t("quantity") || "الكمية", value: String(computedQty), highlight: false },
                          { label: t("total") || "الإجمالي", value: displayPrice, highlight: true },
                        ].map(({ label, value, highlight }) => (
                          <div key={label} className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-500">{label}</span>
                            <span className={`text-sm font-bold ${highlight ? "text-cyan-400 text-base" : "text-white"}`}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="mt-2 grid grid-cols-2 gap-3 sm:justify-start">
                    <AlertDialogCancel className="rounded-xl border-[#1a2a44] bg-[#0d1b2e] text-gray-300 hover:bg-[#1a2a44] hover:text-white">
                      {t("cancel") || "إلغاء"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={postOrderMutation.isPending}
                      onClick={(e) => {
                        e.preventDefault();
                        postOrderMutation.mutate();
                      }}
                      className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white hover:from-cyan-400 hover:to-blue-500"
                    >
                      {postOrderMutation.isPending ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        t("confirm") || "تأكيد"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="text-center text-[11px] text-gray-600 leading-relaxed">
                بالضغط على "شراء الآن" أنت توافق على{" "}
                <Link to="/terms" className="text-cyan-500 underline underline-offset-2 hover:text-cyan-300 transition-colors">
                  شروط الاستخدام
                </Link>
                {" "}و{" "}
                <Link to="/privacy" className="text-cyan-500 underline underline-offset-2 hover:text-cyan-300 transition-colors">
                  سياسة الخصوصية
                </Link>
              </p>
            </form>
          </motion.div>
        </div>

        {/* Back */}
        <div className="mt-12 border-t border-[#1a2a44] pt-6">
          <Link
            to={`/categories/${id}/subs/${subId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-cyan-400"
          >
            <ArrowRight className="h-4 w-4" />
            {t("back") || "العودة للمنتجات"}
          </Link>
        </div>
      </main>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";

import type { Category, Product } from "../types/types";

import Spinner from "../components/Spinner";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
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
  if (currency === "dollar") return `USD ${usd.toFixed(2)}`;
  return `SYP ${(usd * usdToSyp).toFixed(0)}`;
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
  const [currQuantityOption, setCurrQuantityOption] = useState<
    string | undefined
  >(undefined);

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
      const product = products.find(
        (p) => p.id.toString() === String(productId)
      );

      const quantityReq =
        product?.requires?.find(
          (req) => req.type === "quantity" || req.type === "amount"
        ) ?? null;

      const textReq =
        product?.requires?.find((req) => req.type === "text") ?? null;
      setHasText(!!textReq);

      const selectQtyReq =
        product?.requires?.find((req) => req.type === "selectQty") ?? null;
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
    if (hasQuantityOptions && currQuantityOption)
      return Number(currQuantityOption);
    return 1;
  }, [hasQuantity, quantity, hasQuantityOptions, currQuantityOption]);

  const totalPriceUSD = useMemo(() => {
    const p = Number(product?.price || 0);
    return p * Number(computedQty || 1);
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

      const response = await postOrder(
        localStorage.getItem("token") as string,
        {
          quantity: computedQty,
          productId: productId as string,
          appId: playerId,
          ...inputsData,
          ...(area ? { area } : {}),
        }
      );

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

  if (
    getAllSubQuery.isLoading ||
    getProductQuery.isLoading ||
    getDolla.isLoading
  ) {
    return (
      <section className="min-h-[40vh] flex justify-center items-center">
        <Spinner />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="min-h-svh relative flex justify-center items-center text-accent text-xl">
        {t("no_product")}
      </section>
    );
  }

  return (
    <div className="min-h-svh bg-background">
      <main className="container mx-auto max-w-[100%] md:max-w-[90%] lg:max-w-[70%] px-2 py-8">
        <Link
          to={`/categories/${id}/subs/${subId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="h-4 w-4" />
          {t("back") || "العودة"}
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative overflow-hidden rounded-2xl"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-[300px] w-full object-cover lg:h-[420px]"
            />

            {getAllSubQuery.data?.name ? (
              <div className="absolute right-4 top-4 rounded-lg bg-background/70 px-3 py-1 text-xs font-bold text-foreground backdrop-blur">
                {getAllSubQuery.data.name}
              </div>
            ) : null}

            <div className="absolute left-4 top-4 rounded-lg gradient-gold px-3 py-1 text-sm font-bold text-primary-foreground">
              {formatMoney({ currency, usd: totalPriceUSD, usdToSyp })}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            <span className="text-sm font-semibold text-primary">
              {getAllSubQuery.data?.name || t("category") || ""}
            </span>

            <h1 className="mt-2 font-orbitron text-2xl font-black text-foreground lg:text-3xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <span className="font-orbitron text-3xl font-black text-primary">
                {currency === "dollar"
                  ? `$${totalPriceUSD.toFixed(2)}`
                  : `SYP ${(totalPriceUSD * usdToSyp).toFixed(0)}`}
              </span>

              <Badge className="border border-primary/30 bg-primary/10 text-primary">
                {t("quantity") || "الكمية"}: {computedQty}
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary p-3">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-[10px] text-muted-foreground">
                  {t("secure_payment") || "دفع آمن"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary p-3">
                <Clock className="h-5 w-5 text-neon-orange" />
                <span className="text-[10px] text-muted-foreground">
                  {t("support_24_7") || "دعم 24/7"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-secondary p-3">
                <Zap className="h-5 w-5 text-neon-green" />
                <span className="text-[10px] text-muted-foreground">
                  {t("fast_delivery") || "تنفيذ سريع"}
                </span>
              </div>
            </div>

            <form className="mt-6 space-y-4">
              {product.requires?.map((req, index) => {
                if (req.type === "text") {
                  const label =
                    req.question === "null" ? req.name : req.question;

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-border bg-secondary p-4"
                    >
                      <Label className="text-xs text-muted-foreground">
                        {label}
                      </Label>
                      <Input
                        id={req.name}
                        type="text"
                        onChange={(e) => {
                          if (index === 0) setPlayerId(e.currentTarget.value);
                        }}
                        className="mt-2 bg-background/60"
                      />
                    </div>
                  );
                }

                if (req.type === "quantity" || req.type === "amount") {
                  const label =
                    req.question === "null" ? req.name : req.question;

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-border bg-secondary p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Label className="text-xs text-muted-foreground">
                          {label}
                        </Label>
                        <span className="text-[10px] text-muted-foreground">
                          {min !== undefined
                            ? `${t("min") || "Min"}: ${min}`
                            : ""}
                          {max !== undefined
                            ? `  •  ${t("max") || "Max"}: ${max}`
                            : ""}
                        </span>
                      </div>

                      <Input
                        id={req.name}
                        type="number"
                        min={req.type_value?.min}
                        max={req.type_value?.max}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Number(e.currentTarget.value))
                        }
                        className="mt-2 bg-background/60"
                      />
                    </div>
                  );
                }

                if (req.type === "selectQty") {
                  const label =
                    req.question === "null" ? req.name : req.question;

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-border bg-secondary p-4"
                    >
                      <Label className="text-xs text-muted-foreground">
                        {label}
                      </Label>

                      <div className="mt-2">
                        <Select
                          value={currQuantityOption}
                          onValueChange={(value) => {
                            setQuantity(Number(value));
                            setCurrQuantityOption(value);
                          }}
                        >
                          <SelectTrigger className="w-full bg-background/60">
                            <SelectValue placeholder={t("select")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {quantityOptions.map((option, i) => (
                                <SelectItem value={option} key={i}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                }

                return null;
              })}

              {product.areas && product.areas.length > 0 && (
                <div className="rounded-2xl border border-border bg-secondary p-4">
                  <Label className="text-xs text-muted-foreground">
                    {t("area")}
                  </Label>

                  <div className="mt-2">
                    <Select
                      value={selectedAreaId}
                      onValueChange={setSelectedAreaId}
                    >
                      <SelectTrigger className="w-full bg-background/60">
                        <SelectValue placeholder={t("select_area")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {product.areas.map((area) => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={disableBuy}
                    className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl gradient-primary py-4 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    type="button"
                  >
                    {postOrderMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t("loading") || "جارٍ المعالجة..."}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        {t("buy") || "شراء الآن"}
                      </>
                    )}
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("confirm_purchase") || "تأكيد الشراء"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2 text-right">
                      <span className="block">
                        {t("confirm_purchase_message") ||
                          "هل أنت متأكد من إتمام عملية الشراء؟"}
                      </span>
                      <span className="block">
                        {t("product") || "المنتج"}:{" "}
                        <strong className="text-foreground">
                          {product.name}
                        </strong>
                      </span>
                      <span className="block">
                        {t("quantity") || "الكمية"}:{" "}
                        <strong className="text-foreground">
                          {computedQty}
                        </strong>
                      </span>
                      <span className="block">
                        {t("total") || "الإجمالي"}:{" "}
                        <strong className="text-foreground">
                          {formatMoney({
                            currency,
                            usd: totalPriceUSD,
                            usdToSyp,
                          })}
                        </strong>
                      </span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="grid grid-cols-2 gap-2 sm:justify-start">
                    <AlertDialogCancel>
                      {t("cancel") || "إلغاء"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={postOrderMutation.isPending}
                      onClick={(e) => {
                        e.preventDefault();
                        postOrderMutation.mutate();
                      }}
                      className="gradient-primary text-primary-foreground"
                    >
                      {!postOrderMutation.isPending ? (
                        t("confirm") || "تأكيد"
                      ) : (
                        <Loader2 className="animate-spin" />
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {(min !== undefined && quantity < min) ||
              (max !== undefined && quantity > max) ? (
                <p className="text-xs text-destructive">
                  {t("quantity_out_of_range") ||
                    `الكمية يجب أن تكون بين ${min ?? "-"} و ${max ?? "-"}`}
                </p>
              ) : null}
            </form>

            <div className="mt-6 rounded-2xl border border-border bg-secondary p-4 text-sm text-muted-foreground leading-relaxed">
              {product.description ? parse(product.description) : null}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

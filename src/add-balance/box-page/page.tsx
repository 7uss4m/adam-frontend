/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import type { AxiosError } from "axios";
import { ArrowRight, Clipboard, Loader2, ShieldCheck } from "lucide-react";

import getBoxById from "../../api/getBoxById";
import postNote from "../../api/postNote";
import postChargeOnlineMethod from "../../api/postChargeOnlineMethod";

import type { ChargeBox } from "../../types/types";

import Spinner from "../../components/Spinner";
import { useToast } from "../../components/ui/use-toast";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useRef, useState } from "react";

export default function BoxPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [t, i18n] = useTranslation("global");

  const { toast } = useToast();

  const [methodId, setMethodId] = useState<string | null>(null);
  // const [amount, setAmount] = useState<number | null>(null);
  const [code, setCode] = useState<string>("");
  const [txId, setTxId] = useState<string>("");
  const [open, setOpen] = useState(false);

  const coinsRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

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
        coins: coinsRef.current?.value
          ? Number(coinsRef.current?.value)
          : undefined,
        currencyId: methodId as string,
        code: code.trim() ? code.trim() : undefined,
        tx_id: txId.trim() ? txId.trim() : undefined,
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
      // if (error?.message === "TX_ID_REQUIRED") {
      //   toast({ title: "Error!", description: t("tx_id_required") });
      //   return;
      // }

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

  const loading = getBoxQuery.isLoading;
  const submitting =
    postNoteMutation.isPending || postOnlineNoteMutation.isPending;

  const copy = (value?: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast({ title: t("copied") });
  };

  if (loading) {
    return (
      <section className="min-h-svh flex justify-center items-center">
        <Spinner />
      </section>
    );
  }

  if (!getBoxQuery.isSuccess || !getBoxQuery.data) {
    return (
      <section className="relative text-xl sm:text-4xl text-accent min-h-svh flex justify-center items-center">
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

  return (
    <main
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="bg-background"
    >
      <div className="container min-h-svh mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/payments"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            {t("back") || "رجوع"}
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <span className="font-orbitron text-lg font-bold text-foreground">
              {t("charge") || "شحن"}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-6 max-w-2xl"
        >
          <h1 className="font-orbitron text-2xl font-black text-foreground">
            {box.name}
          </h1>
          {box.account_name ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("payment_method") || "طريقة الدفع"}:{" "}
              <span className="font-semibold text-foreground">
                {box.account_name}
              </span>
            </p>
          ) : null}
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              {t("details") || "التفاصيل"}
            </h2>

            <div className="space-y-4" translate="no">
              {box.account_code && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      {t("account_code")}
                    </Label>
                    <button
                      type="button"
                      onClick={() => copy(box.account_code)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      {t("copy") || "نسخ"}
                    </button>
                  </div>
                  <Input
                    readOnly
                    defaultValue={box.account_code}
                    className="rounded-lg border-border bg-secondary"
                    onClick={(e) =>
                      copy((e.currentTarget as HTMLInputElement).value)
                    }
                  />
                </div>
              )}

              {box.box_name && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      {t("box_name")}
                    </Label>
                    <button
                      type="button"
                      onClick={() => copy(box.box_name)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      {t("copy") || "نسخ"}
                    </button>
                  </div>
                  <Input
                    readOnly
                    defaultValue={box.box_name}
                    className="rounded-lg border-border bg-secondary"
                    onClick={(e) =>
                      copy((e.currentTarget as HTMLInputElement).value)
                    }
                  />
                </div>
              )}

              {box.wallet_address && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      {t("wallet_address")}
                    </Label>
                    <button
                      type="button"
                      onClick={() => copy(box.wallet_address)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      {t("copy") || "نسخ"}
                    </button>
                  </div>
                  <Input
                    readOnly
                    defaultValue={box.wallet_address}
                    className="rounded-lg border-border bg-secondary"
                    onClick={(e) =>
                      copy((e.currentTarget as HTMLInputElement).value)
                    }
                  />
                </div>
              )}

              {box.description && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      {t("description")}
                    </Label>
                    <button
                      type="button"
                      onClick={() => copy(box.description)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Clipboard className="h-3.5 w-3.5" />
                      {t("copy") || "نسخ"}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    defaultValue={box.description}
                    className="min-h-36 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground focus:outline-none"
                    onClick={(e) =>
                      copy((e.currentTarget as HTMLTextAreaElement).value)
                    }
                  />
                </div>
              )}

              {extractedNumbers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {t("numbers")}
                  </Label>

                  <div className="space-y-2">
                    {extractedNumbers.map((n) => (
                      <div
                        key={n}
                        className="flex items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2"
                      >
                        <span className="text-sm font-semibold text-foreground">
                          {n}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            copy(n);
                            toast({ title: `${n} ${t("copied")}` });
                          }}
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              {t("add_balance") || "إرسال طلب الشحن"}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                postNoteMutation.mutate();
              }}
              className="space-y-4"
            >
              {!isAuto && (
                <div className="space-y-2">
                  <Label
                    className="text-xs text-muted-foreground"
                    htmlFor="amount"
                  >
                    {t("amount")}
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min={0}
                    ref={coinsRef}
                    // onChange={(e) => setAmount(Number(e.currentTarget.value))}
                    className="rounded-lg border-border bg-secondary"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label
                  className="text-xs text-muted-foreground"
                  htmlFor="payment"
                >
                  {t("payment")}
                </Label>

                <Select
                  open={open}
                  onOpenChange={() => {
                    setTimeout(() => setOpen((v: any) => !v), 0);
                  }}
                  onValueChange={(value) => setMethodId(value)}
                >
                  <SelectTrigger className="w-full rounded-lg border border-border bg-secondary text-foreground">
                    <SelectValue placeholder={t("select_payment_method")} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-background">
                    {box.currencies?.map((currency) => (
                      <SelectItem value={currency.id} key={currency.id}>
                        {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground" htmlFor="note">
                  {t("note")}
                </Label>
                <Input
                  id="note"
                  name="note"
                  type="file"
                  ref={imageRef}
                  className="cursor-pointer rounded-lg border-border bg-secondary file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
                />
              </div>

              {isTxIdRequired && box.account_name == "syriatel" ? (
                <>
                  <div className="space-y-2">
                    <Label
                      className="text-xs text-muted-foreground"
                      htmlFor="code"
                    >
                      كود التحويل
                    </Label>

                    {extractedNumbers.length > 0 ? (
                      <>
                        <Select value={code} onValueChange={(v) => setCode(v)}>
                          <SelectTrigger className="w-full rounded-lg border border-border bg-secondary text-foreground">
                            <SelectValue placeholder={"اختر كود التحويل"} />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            className="bg-background"
                          >
                            {extractedNumbers.map((n) => (
                              <SelectItem key={n} value={n}>
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">
                          اختر كود التحويل من الأرقام المتاحة.
                        </p>
                      </>
                    ) : (
                      <Input
                        id="code"
                        name="code"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.currentTarget.value)}
                        className="rounded-lg border-border bg-secondary"
                      />
                    )}
                  </div>
                </>
              ) : null}

              {isTxIdRequired ? (
                <>
                  <div className="space-y-2">
                    <Label
                      className="text-xs text-muted-foreground"
                      htmlFor="tx_id"
                    >
                      رقم العملية
                    </Label>
                    <Input
                      id="tx_id"
                      name="tx_id"
                      type="text"
                      value={txId}
                      onChange={(e) => setTxId(e.currentTarget.value)}
                      required
                      className="rounded-lg border-border bg-secondary"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {t("tx_id_required_hint") ||
                        "هذا الحقل مطلوب لهذه الطريقة."}
                    </p>
                  </div>
                </>
              ) : null}

              <Button
                type="submit"
                disabled={
                  !methodId || submitting || (isTxIdRequired && !txId.trim())

                  //  !methodId || !amount || submitting
                  // ||
                  // (isTxIdRequired && !txId.trim())
                }
                className="w-full rounded-lg gradient-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("loading") || "جارٍ الإرسال..."}
                  </span>
                ) : (
                  t("order")
                )}
              </Button>

              {/* 
              <Button
                type="button"
                variant="secondary"
                disabled={!amount || submitting}
                onClick={() => postOnlineNoteMutation.mutate()}
                className="w-full rounded-lg"
              >
                {t("pay_online") || "دفع أونلاين"}
              </Button>
              */}
            </form>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

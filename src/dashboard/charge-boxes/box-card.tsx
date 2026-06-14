import { useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import {
  Box,
  CheckCheck,
  Copy,
  CreditCard,
  Hash,
  User,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { ChargeBox } from "../../types/types";
import { cn } from "../../lib/utils";
import EditBoxForm from "./edit-box-form";
import DeleteBoxForm from "./delete-box-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

type BoxCardProps = {
  box: ChargeBox;
  query: UseQueryResult;
};

function CopyField({
  label,
  icon,
  value,
  emptyLabel,
}: {
  label: string;
  icon: React.ReactNode;
  value?: string | null;
  emptyLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const display = value?.trim() || emptyLabel;
  const canCopy = Boolean(value?.trim());

  const copy = () => {
    if (!canCopy) return;
    navigator.clipboard.writeText(value!.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2.5">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p
          className={cn(
            "min-w-0 truncate text-sm font-bold",
            canCopy ? "text-foreground" : "text-muted-foreground"
          )}
          title={display}
        >
          {display}
        </p>
        {canCopy && (
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="copy"
          >
            {copied ? (
              <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function BoxCard({ box, query }: BoxCardProps) {
  const [t, i18n] = useTranslation("global");
  const [imageOpen, setImageOpen] = useState(false);
  const hasImage = Boolean(box.image);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
      <div className="pointer-events-none absolute -end-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Image header */}
      <div className="relative h-36 overflow-hidden bg-muted/40">
        {hasImage ? (
          <button
            type="button"
            onClick={() => setImageOpen(true)}
            className="block h-full w-full"
          >
            <img
              src={box.image as string}
              alt={box.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-muted/30">
            <Box className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="truncate text-lg font-black text-foreground">{box.name}</h3>
          {box.box_name && (
            <p className="truncate text-xs text-muted-foreground">{box.box_name}</p>
          )}
        </div>
      </div>

      <div className="relative space-y-3 p-4 pt-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <CopyField
            label={t("account_name").replace(":", "")}
            icon={<User className="h-3 w-3" />}
            value={box.account_name}
            emptyLabel={t("no_account_name")}
          />
          <CopyField
            label={t("account_code2")}
            icon={<Hash className="h-3 w-3" />}
            value={box.account_code}
            emptyLabel={t("no_account_code")}
          />
        </div>

        <CopyField
          label={t("wallet_address")}
          icon={<Wallet className="h-3 w-3" />}
          value={box.wallet_address}
          emptyLabel={t("not_available")}
        />

        {box.description?.trim() && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {box.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
            <CreditCard className="h-3 w-3" />
            {t("currencies")}
          </span>
          {box.currencies.length > 0 ? (
            box.currencies.map((c) => (
              <span
                key={c.id}
                className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary"
              >
                {c.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">{t("not_available")}</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3">
          <EditBoxForm query={query} box={box} />
          <DeleteBoxForm query={query} id={box.id} compact />
        </div>
      </div>

      {hasImage && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent
            dir={i18n.language === "en" ? "ltr" : "rtl"}
            className="max-w-lg p-0 overflow-hidden"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>{box.name}</DialogTitle>
            </DialogHeader>
            <img
              src={box.image as string}
              alt={box.name}
              className="max-h-[70vh] w-full object-contain bg-muted/20"
            />
          </DialogContent>
        </Dialog>
      )}
    </article>
  );
}

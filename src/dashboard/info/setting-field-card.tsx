import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Copy, Loader2, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

import putInfo from "../../api/putInfo";
import putMoonPay from "../../api/putMoonPay";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "../../components/ui/use-toast";
import { cn } from "../../lib/utils";
import { truncateText } from "./info-utils";

type FieldType = "text" | "number" | "textarea" | "moonpay";

type SettingFieldCardProps = {
  label: string;
  value: string;
  fieldKey: string;
  type?: FieldType;
  icon?: React.ReactNode;
  copyable?: boolean;
  onSaved: () => void;
};

export default function SettingFieldCard({
  label,
  value,
  fieldKey,
  type = "text",
  icon,
  copyable = false,
  onSaved,
}: SettingFieldCardProps) {
  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token") as string;
      if (fieldKey === "moonPay_code") {
        return putMoonPay(token, draft);
      }
      return putInfo(token, draft, fieldKey);
    },
    onSuccess: () => {
      toast({
        title: t("done") || "Done!",
        description: t("info_saved_success") || "Settings updated successfully",
      });
      setOpen(false);
      onSaved();
    },
    onError: (error: AxiosError) => {
      toast({
        title: t("error") || "Error",
        description: (error.response?.data as { error?: string })?.error,
        variant: "destructive",
      });
    },
  });

  const openEditor = () => {
    setDraft(value);
    setOpen(true);
  };

  const copyValue = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast({ description: t("copied") || "Copied" });
    } catch {
      toast({ description: t("copy_failed") || "Copy failed", variant: "destructive" });
    }
  };

  const displayValue =
    type === "textarea" ? truncateText(value, 160) : value || "—";

  return (
    <>
      <div className="group rounded-2xl border border-border/50 bg-card/80 p-4 transition-all hover:border-primary/30 hover:shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p
                className={cn(
                  "mt-1 break-words text-sm font-medium text-foreground",
                  type === "textarea" && "line-clamp-4 whitespace-pre-wrap"
                )}
              >
                {displayValue}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-1">
            {copyable && value && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={copyValue}
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={openEditor}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          dir={i18n.language === "en" ? "ltr" : "rtl"}
          className="sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor={`edit-${fieldKey}`}>{label}</Label>
            {type === "textarea" ? (
              <Textarea
                id={`edit-${fieldKey}`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={8}
                className="min-h-40 bg-background/60"
              />
            ) : (
              <Input
                id={`edit-${fieldKey}`}
                type={type === "number" ? "number" : "text"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="bg-background/60"
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {saveMutation.isPending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

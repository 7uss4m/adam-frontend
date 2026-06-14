import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AlertTriangle, CheckCircle2, Construction, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import updateMaintenanceMode from "../../api/updateMaintenanceMode";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Switch } from "../../components/ui/switch";
import { useToast } from "../../components/ui/use-toast";
import { cn } from "../../lib/utils";
import { useMaintenanceMode } from "../../hooks/useMaintenanceMode";

const CONFIRM_POINTS = [
  "maintenance_confirm_point_visitors",
  "maintenance_confirm_point_auth",
  "maintenance_confirm_point_api",
  "maintenance_confirm_point_dashboard",
  "maintenance_confirm_point_disable",
] as const;

export default function MaintenanceModeCard() {
  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token") || "";
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: isMaintenance = false, isLoading } = useMaintenanceMode({
    refetchInterval: 15_000,
  });

  const mutation = useMutation({
    mutationFn: (enabled: boolean) => updateMaintenanceMode(token, enabled),
    onSuccess: (_res, enabled) => {
      queryClient.setQueryData(["maintenance-mode"], enabled);
      setConfirmOpen(false);
      toast({
        title: enabled ? t("maintenance_enabled_toast") : t("maintenance_disabled_toast"),
        description: enabled
          ? t("maintenance_enabled_desc")
          : t("maintenance_disabled_desc"),
      });
    },
    onError: (err: AxiosError) => {
      toast({
        title: t("something_went_wrong"),
        description: (err.response?.data as { error?: string })?.error || "",
        variant: "destructive",
      });
    },
  });

  const active = isMaintenance;

  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      setConfirmOpen(true);
      return;
    }
    mutation.mutate(false);
  };

  const handleConfirmEnable = () => {
    mutation.mutate(true);
  };

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-colors sm:col-span-2 xl:col-span-3",
          active
            ? "border-amber-500/40 bg-amber-500/5"
            : "border-border/50 bg-card/80"
        )}
      >
        {active && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                active ? "bg-amber-500/15 text-amber-600" : "bg-primary/10 text-primary"
              )}
            >
              {active ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Construction className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-bold text-foreground">{t("maintenance_mode")}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {t("maintenance_mode_hint")}
              </p>
              {active && (
                <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {t("maintenance_active_badge")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-sm font-medium text-muted-foreground">
              {active ? t("maintenance_on") : t("maintenance_off")}
            </span>
            <Switch
              checked={active}
              disabled={isLoading || mutation.isPending}
              onCheckedChange={handleSwitchChange}
              aria-label={t("maintenance_mode")}
            />
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent
          dir={i18n.language === "en" ? "ltr" : "rtl"}
          className="max-w-md gap-0 overflow-hidden p-0 sm:max-w-lg"
        >
          <AlertDialogHeader className="space-y-0 border-b border-amber-500/20 bg-amber-500/10 px-5 py-4 text-start">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <AlertDialogTitle className="text-start text-base font-bold text-foreground sm:text-lg">
                  {t("maintenance_confirm_title")}
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-start text-xs text-muted-foreground sm:text-sm">
                  {t("maintenance_confirm_intro")}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              {t("maintenance_confirm_read_carefully")}
            </p>

            <ul className="space-y-2.5 rounded-xl border border-border/50 bg-muted/30 p-3.5">
              {CONFIRM_POINTS.map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>

            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs leading-relaxed text-destructive">
              {t("maintenance_confirm_warning")}
            </p>
          </div>

          <AlertDialogFooter className="flex-col gap-2 border-t border-border/50 bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end">
            <AlertDialogCancel disabled={mutation.isPending} className="gap-1.5 sm:mt-0">
              <XCircle className="h-4 w-4" />
              {t("maintenance_confirm_cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmEnable();
              }}
              className="gap-1.5 bg-amber-600 text-white hover:bg-amber-600/90"
            >
              {mutation.isPending ? t("logging") : t("maintenance_confirm_agree")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

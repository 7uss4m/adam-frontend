import { UseQueryResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { AxiosError } from "axios";
import {
  CheckCircle2,
  ImageIcon,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import patchNote from "../../api/patchNote";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useToast } from "../../components/ui/use-toast";
import type { DashboardNote } from "./note-utils";
import { noteImageUrl } from "./note-utils";
import PatchNoteForm from "./patch-note-form";

type NoteRowActionsProps = {
  note: DashboardNote;
  query: UseQueryResult;
  compact?: boolean;
};

export default function NoteRowActions({
  note,
  query,
  compact = false,
}: NoteRowActionsProps) {
  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isRtl = i18n.language === "ar";

  const [imageOpen, setImageOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const isPending = note.status === "pinding";
  const isSuccess = note.status === "success";
  const canApprove = !isSuccess;
  const imageUrl = noteImageUrl(note.image);

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      patchNote(localStorage.getItem("token") as string, note.id, status),
    onSuccess: (data) => {
      toast({ title: t("success"), description: data.data.result });
      query.refetch();
      queryClient.invalidateQueries({ queryKey: ["note-stats"] });
      setApproveOpen(false);
      setRejectOpen(false);
    },
    onError: (e: AxiosError) => {
      toast({
        title: t("error") || "Error",
        description: (e.response?.data as { error: string })?.error,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <div className="flex items-center gap-2">
        {canApprove && !compact && (
          <>
            <Button
              size="sm"
              className="gap-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={statusMutation.isPending}
              onClick={() => setApproveOpen(true)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("note_approve")}
            </Button>
            {isPending && (
              <Button
                size="sm"
                variant="destructive"
                className="gap-1"
                disabled={statusMutation.isPending}
                onClick={() => setRejectOpen(true)}
              >
                <XCircle className="h-3.5 w-3.5" />
                {t("note_reject")}
              </Button>
            )}
          </>
        )}

        <DropdownMenu dir={isRtl ? "rtl" : "ltr"}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={compact ? "ghost" : "outline"}
              size="icon"
              className={compact ? "h-8 w-8" : "h-9 w-9"}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {imageUrl && (
              <DropdownMenuItem onClick={() => setImageOpen(true)}>
                <ImageIcon className="h-4 w-4 me-2" />
                {t("view_image")}
              </DropdownMenuItem>
            )}
            {!isSuccess && (
              <>
                <DropdownMenuSeparator />
                {canApprove && compact && (
                  <>
                    <DropdownMenuItem onClick={() => setApproveOpen(true)}>
                      <CheckCircle2 className="h-4 w-4 me-2 text-emerald-500" />
                      {t("note_approve")}
                    </DropdownMenuItem>
                    {isPending && (
                      <DropdownMenuItem onClick={() => setRejectOpen(true)}>
                        <XCircle className="h-4 w-4 me-2 text-destructive" />
                        {t("note_reject")}
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <PatchNoteForm
                  id={note.id}
                  status={note.status}
                  query={query}
                  asMenuItem
                />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {imageUrl && (
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("view_image")}</DialogTitle>
            </DialogHeader>
            <img
              src={imageUrl}
              alt={`Receipt #${note.id}`}
              className="w-full rounded-xl border border-border object-contain"
            />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent dir={isRtl ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("note_approve_confirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("note_approve_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => statusMutation.mutate("success")}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? t("loading") : t("note_approve")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent dir={isRtl ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("note_reject_confirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("note_reject_desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => statusMutation.mutate("reject")}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? t("loading") : t("note_reject")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

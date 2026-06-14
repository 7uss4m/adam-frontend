import { useState } from "react";
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
} from "../../components/ui/alert-dialog"
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { Button } from "../../components/ui/button";
import deleteBox from "../../api/deleteBox";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function DeleteBoxForm({
  id,
  query,
  compact = false,
}: {
  id: string;
  query: UseQueryResult;
  compact?: boolean;
}) {
  // state
  const [open, setOpen] = useState(false);

  // toast
  const { toast } = useToast()


  // mutation
  const deleteBoxMutation = useMutation({
    mutationFn: async () => {
      const response = await deleteBox(localStorage.getItem("token") as string, id);
      return response
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result
      })
      setOpen(false);
      query.refetch()
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error
      })
    }
  });

  // translation
  const [t, i18n] = useTranslation("global")



  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {compact ? (
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("delete")}
          </Button>
        ) : (
          <Button variant="destructive">{t("delete")}</Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent dir={i18n.language == "en" ? "ltr" : "rtl"}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start text-primary">{t("are_you_absolutely_sure")}</AlertDialogTitle>
          <AlertDialogDescription className="text-start">
            {t("actions")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={deleteBoxMutation.isPending} onClick={(e) => {
            e.preventDefault()
            deleteBoxMutation.mutate()
          }}>{deleteBoxMutation.isPending ? t("deleting") : t("delete")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useMutation, UseQueryResult } from "@tanstack/react-query";
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
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/use-toast";
import { useState } from "react";
import { AxiosError } from "axios";
import deleteAdmin from "../../api/deleteAdmin";
import { useTranslation } from "react-i18next";
export default function DeleteAdminForm({
  userId,
  query,
}: {
  userId: string;
  query: UseQueryResult;
}) {
  // state
  const [open, setOpen] = useState(false);

  // toast
  const { toast } = useToast();

  // translations
  const [t, i18n] = useTranslation("global")

  // mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async () => {
      const response = await deleteAdmin(
        localStorage.getItem("token") as string,
        userId
      );
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result,
      });
      setOpen(false);
      query.refetch();
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen} >
      <AlertDialogTrigger asChild>
        <Button variant={"destructive"}>{t("delete")}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="text-start" dir={i18n.language == "en" ? "ltr" : "rtl"}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start">{t("are_you_absolutely_sure")}</AlertDialogTitle>
          <AlertDialogDescription className="text-start">
          {t("actions")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={deleteAdminMutation.isPending}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteAdminMutation.mutate()}
            disabled={deleteAdminMutation.isPending}
          >
            {deleteAdminMutation.isPending ? t("deleting") : t("continue")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

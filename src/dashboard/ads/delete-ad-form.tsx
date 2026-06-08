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
} from "../../components/ui/alert-dialog";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { Button } from "../../components/ui/button";
import deleteAd from "../../api/deleteAd";
import { useTranslation } from "react-i18next";

export default function DeleteAdForm({
  id,
  query,
}: {
  id: string;
  query: UseQueryResult;
}) {
  // state
  const [open, setOpen] = useState(false);

  // toast
  const { toast } = useToast();

  // mutation
  const deleteAdMutation = useMutation({
    mutationFn: async () => {
      const response = await deleteAd(
        localStorage.getItem("token") as string,
        id
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

  // translation
  const [t, i18n] = useTranslation("global")
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"destructive"}>{t("delete")}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir={i18n.language == "en" ? "ltr" : "rtl"}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start text-primary">{t("are_you_absolutely_sure")}</AlertDialogTitle>
          <AlertDialogDescription className="text-start">
            {t("actions")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteAdMutation.isPending}
            onClick={(e) => {
              e.preventDefault();
              deleteAdMutation.mutate();
            }}
          >
            {deleteAdMutation.isPending ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useMutation, UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { AxiosError } from "axios";
import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

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
import { useToast } from "../../components/ui/use-toast";
import deleteMainCategory from "../../api/deleteMainCategory";
import putMainCategory from "../../api/putMainCategory";
import type { MainCategory } from "../../types/types";
import EditMainCategoryForm from "./edit-main-category-form";

type MainCategoryRowActionsProps = {
  mainCategory: MainCategory;
  query: UseQueryResult;
};

export default function MainCategoryRowActions({
  mainCategory,
  query,
}: MainCategoryRowActionsProps) {
  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isRtl = i18n.language === "ar";
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const isActive = mainCategory.active !== false;

  const toggleMutation = useMutation({
    mutationFn: () =>
      putMainCategory(localStorage.getItem("token") as string, String(mainCategory.id), {
        name: mainCategory.name,
        order: Number(mainCategory.order),
        active: !isActive,
      }),
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      query.refetch();
    },
    onError: (e: AxiosError) => {
      toast({
        title: "Error",
        description: (e.response?.data as { error: string })?.error,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteMainCategory(localStorage.getItem("token") as string, String(mainCategory.id)),
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      setDeleteOpen(false);
      query.refetch();
      queryClient.invalidateQueries({ queryKey: ["main-categories"] });
    },
    onError: (e: AxiosError) => {
      toast({
        title: "Error",
        description: (e.response?.data as { error: string })?.error,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <DropdownMenu dir={isRtl ? "rtl" : "ltr"}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 me-2" />
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
          >
            {isActive ? (
              <>
                <EyeOff className="h-4 w-4 me-2" />
                {t("cat_hide")}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 me-2" />
                {t("cat_show")}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 me-2" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditMainCategoryForm
        mainCategory={mainCategory}
        query={query}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir={isRtl ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("are_you_absolutely_sure")}</AlertDialogTitle>
            <AlertDialogDescription>{t("actions")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("deleting") : t("continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { Link } from "react-router-dom";
import { useMutation, UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { AxiosError } from "axios";
import {
  Eye,
  EyeOff,
  FolderTree,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
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
import deleteCategory from "../../api/deleteCategory";
import putCategory from "../../api/putCategory";
import type { DashboardCategory } from "./category-utils";
import EditCategoryForm from "./edit-category-form";

type CategoryRowActionsProps = {
  category: DashboardCategory;
  query: UseQueryResult;
  compact?: boolean;
};

export default function CategoryRowActions({
  category,
  query,
  compact = false,
}: CategoryRowActionsProps) {
  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isRtl = i18n.language === "ar";
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const isActive = category.active !== false;

  const toggleMutation = useMutation({
    mutationFn: () =>
      putCategory(localStorage.getItem("token") as string, String(category.id), {
        name: category.name,
        order: Number(category.order),
        active: !isActive,
      }),
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      query.refetch();
      queryClient.invalidateQueries({ queryKey: ["category-stats"] });
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
      deleteCategory(localStorage.getItem("token") as string, String(category.id)),
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      setDeleteOpen(false);
      query.refetch();
      queryClient.invalidateQueries({ queryKey: ["category-stats"] });
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
          <Button
            variant={compact ? "ghost" : "outline"}
            size="icon"
            className={compact ? "h-8 w-8 shrink-0" : "h-9 w-9"}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to={`${category.id}/sub`} className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              {t("sub_categories")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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

      <EditCategoryForm
        category={category}
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

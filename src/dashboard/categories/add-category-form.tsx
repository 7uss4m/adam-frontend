import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import postCategory from "../../api/postCategory";
import getMainCategories from "../../api/getMainCategories";
import type { MainCategory } from "../../types/types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

export function AddCategoryForm() {
  // state
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState("none");
  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  // toast
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mainCategoriesQuery = useQuery({
    queryKey: ["main-categories"],
    queryFn: async () => {
      const res = await getMainCategories({
        token: localStorage.getItem("token") as string,
      });
      return (res.data?.result ?? []) as MainCategory[];
    },
  });

  // mutation
  const postCategoryMutation = useMutation({
    mutationFn: async () => {
      const response = await postCategory(
        localStorage.getItem("token") as string,
        nameRef.current?.value as string,
        Number(order),
        imageRef.current?.files ? imageRef.current?.files[0] : undefined,
        mainCategoryId === "none" ? null : Number(mainCategoryId)
      );
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result,
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category-stats"] });
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
      });
    },
  });
  // translations
  const [t, i18n] = useTranslation("global");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{t("add")}</Button>
      </DialogTrigger>
      <DialogContent
        dir={i18n.language == "en" ? "ltr" : "rtl"}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="text-start text-primary">
            {t("add_category")}
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription></DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("name")}
            </Label>
            <Input id="name" className="col-span-3" ref={nameRef} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              {t("image")}
            </Label>
            <Input
              id="image"
              type="file"
              className="col-span-3"
              ref={imageRef}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right">
              {t("cat_sort_order")}
            </Label>
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="main_category" className="text-right">
              {t("main_categories")}
            </Label>
            <Select onValueChange={setMainCategoryId} value={mainCategoryId}>
              <SelectTrigger id="main_category" className="col-span-3">
                <SelectValue placeholder={t("main_categories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("no_main_category")}</SelectItem>
                {mainCategoriesQuery.data?.map((mc) => (
                  <SelectItem key={mc.id} value={String(mc.id)}>
                    {mc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={postCategoryMutation.isPending}
            variant={postCategoryMutation.isPending ? "ghost" : "default"}
            onClick={(e) => {
              e.preventDefault();
              postCategoryMutation.mutate();
            }}
          >
            {postCategoryMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

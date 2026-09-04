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
import type { MainCategory } from "../../types/types";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import putMainCategory from "../../api/putMainCategory";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type EditMainCategoryFormProps = {
  mainCategory: MainCategory;
  query: UseQueryResult;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function EditMainCategoryForm({
  mainCategory,
  query,
  open: controlledOpen,
  onOpenChange,
}: EditMainCategoryFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [order, setOrder] = useState(String(mainCategory.order));

  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const editMainCategoryMutation = useMutation({
    mutationFn: async () => {
      const response = await putMainCategory(
        localStorage.getItem("token") as string,
        mainCategory.id.toString(),
        {
          order: Number(order),
          name: nameRef.current?.value as string,
          image: imageRef.current?.files ? imageRef.current.files[0] : undefined,
        }
      );
      return response;
    },
    onSuccess: (data) => {
      toast({ title: "Done!", description: data.data.result });
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

  const [t, i18n] = useTranslation("global");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="default">{t("edit")}</Button>
        </DialogTrigger>
      )}
      <DialogContent
        dir={i18n.language == "en" ? "ltr" : "rtl"}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="text-primary text-start">
            {t("edit_main_category")}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              Make changes to main category here. Click save when you're done.
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("name")}
            </Label>
            <Input
              ref={nameRef}
              id="name"
              type="text"
              defaultValue={mainCategory.name}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              {t("image")}
            </Label>
            <Input ref={imageRef} id="image" type="file" className="col-span-3" />
          </div>
          {mainCategory.image && (
            <div className="flex justify-center">
              <img
                src={mainCategory.image}
                alt={mainCategory.name}
                className="h-16 w-16 rounded-xl object-cover border border-border"
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right">
              {t("cat_sort_order")}
            </Label>
            <Input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={editMainCategoryMutation.isPending}
            variant={editMainCategoryMutation.isPending ? "ghost" : "default"}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              editMainCategoryMutation.mutate();
            }}
          >
            {editMainCategoryMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

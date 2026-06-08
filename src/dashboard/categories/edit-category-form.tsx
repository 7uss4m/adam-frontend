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
import { Category } from "../../types/types";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import putCategory from "../../api/putCategory";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function EditCategoryForm({
  category,
  query,
}: {
  category: Category;
  query: UseQueryResult;
}) {
  // state
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(category.order);

  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  // toast
  const { toast } = useToast();

  // mutation
  const editCategoryMutation = useMutation({
    mutationFn: async () => {
      const response = await putCategory(
        localStorage.getItem("token") as string,
        category.id.toString(),
        Number(order),
        nameRef.current?.value as string,
        imageRef.current?.files ? imageRef.current?.files[0] : undefined
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
  const [t, i18n] = useTranslation("global");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{t("edit")}</Button>
      </DialogTrigger>
      <DialogContent
        dir={i18n.language == "en" ? "ltr" : "rtl"}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="text-primary text-start">
            {t("edit_category")}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              Make changes to category here. Click save when you're done.
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
              defaultValue={category.name}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              {t("image")}
            </Label>
            <Input
              ref={imageRef}
              id="image"
              type="file"
              src={category.image}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right">
              order
            </Label>
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={editCategoryMutation.isPending}
            variant={editCategoryMutation.isPending ? "ghost" : "default"}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              editCategoryMutation.mutate();
            }}
          >
            {editCategoryMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

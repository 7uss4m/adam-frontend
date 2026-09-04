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
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import postMainCategory from "../../api/postMainCategory";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

export function AddMainCategoryForm() {
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const postMainCategoryMutation = useMutation({
    mutationFn: async () => {
      const image = imageRef.current?.files?.[0];
      if (!image) {
        throw new Error("image is required");
      }
      const response = await postMainCategory(
        localStorage.getItem("token") as string,
        nameRef.current?.value as string,
        Number(order),
        image
      );
      return response;
    },
    onSuccess: (data) => {
      toast({ title: "Done!", description: data.data.result });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["main-categories"] });
    },
    onError: (error: AxiosError | Error) => {
      const axiosError = error as AxiosError;
      toast({
        title: "Error!",
        description: axiosError.response?.data
          ? (axiosError.response.data as { error: string }).error
          : error.message,
      });
    },
  });

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
            {t("add_main_category")}
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
            <Input id="image" type="file" className="col-span-3" ref={imageRef} />
          </div>
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
            type="submit"
            disabled={postMainCategoryMutation.isPending}
            variant={postMainCategoryMutation.isPending ? "ghost" : "default"}
            onClick={(e) => {
              e.preventDefault();
              postMainCategoryMutation.mutate();
            }}
          >
            {postMainCategoryMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

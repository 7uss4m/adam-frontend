import { useRef, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Category } from "../../../types/types";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../../../components/ui/use-toast";
import { AxiosError } from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import putSubCategory from "../../../api/putSubCategory";
import getCategories from "../../../api/getCategories";
import { useTranslation } from "react-i18next";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import getAllSub from "../../../api/getAllSub";

export default function EditSubForm({
  sub,
  query,
  open: controlledOpen,
  onOpenChange,
}: {
  sub: Category;
  query: UseQueryResult;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [categoryType, setCategoryType] = useState(sub.type);
  const [order, setOrder] = useState(String(sub.order ?? ""));
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [profit, setProfit] = useState(String(sub.profit ?? 0));

  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const bonusRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const [t, i18n] = useTranslation("global");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getCategories();
      return response.data.result as Category[];
    },
  });

  const getAllSubQuery = useQuery({
    queryKey: ["subs"],
    queryFn: async () => {
      const response = await getAllSub();
      return response.data.result as Category[];
    },
  });

  const editSubMutation = useMutation({
    mutationFn: async () => {
      const response = await putSubCategory({
        token: localStorage.getItem("token") as string,
        id: sub.id.toString(),
        name: nameRef.current?.value as string,
        type: categoryType,
        bonus: Number(bonusRef.current?.value),
        image: imageRef.current?.files?.[0],
        order: Number(order),
        profit: Number(profit),
      });
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
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="default">{t("edit")}</Button>
        </DialogTrigger>
      )}
      <DialogContent
        dir={i18n.language === "en" ? "ltr" : "rtl"}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="text-start text-primary">
            {t("edit_sub_category")}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
              {t("edit_sub_category_description")}
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
              defaultValue={sub.name}
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
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              {t("type")}
            </Label>
            <Select
              defaultValue={sub.type}
              onValueChange={(value) => {
                setCategoryType(value as "one" | "bundle");
              }}
            >
              <SelectTrigger
                dir={i18n.language === "en" ? "ltr" : "rtl"}
                className="w-[280px]"
              >
                <SelectValue placeholder={t("select_type")} />
              </SelectTrigger>
              <SelectContent dir={i18n.language === "en" ? "ltr" : "rtl"}>
                <SelectItem value="one">{t("one")}</SelectItem>
                <SelectItem value="bundle">{t("bundle")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bonus" className="text-right">
              {t("bonus")}
            </Label>
            <Input
              ref={bonusRef}
              type="number"
              min={0}
              defaultValue={sub.bonus}
              className="col-span-3"
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
            <Label htmlFor="profit" className="text-right">
              {t("cat_margin_percent")}
            </Label>
            <Input
              id="profit"
              type="number"
              step="0.01"
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
              className="col-span-3"
            />
            <p className="col-span-4 text-xs text-muted-foreground text-start">
              {t("cat_margin_hint")}
            </p>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("select_category")}</Label>
            <Select
              onValueChange={(value) => setParentId(value)}
              defaultValue={parentId}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder={t("select_category")} />
              </SelectTrigger>
              <SelectContent>
                {categoriesQuery.isLoading ? (
                  <SelectItem value="" disabled>
                    {t("loading")}...
                  </SelectItem>
                ) : categoriesQuery.data?.length ? (
                  <>
                    {categoriesQuery.data.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    {getAllSubQuery.data?.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        <div className="flex items-center gap-5">
                          <img
                            src={`${import.meta.env.VITE_PUBLIC_DOMAIN}${
                              sub.image
                            }`}
                            alt={sub.name}
                            className="size-[30px] rounded"
                          />
                          <span>{sub.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <SelectItem value="" disabled>
                    {t("no_categories")}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={editSubMutation.isPending}
            variant={editSubMutation.isPending ? "ghost" : "default"}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              editSubMutation.mutate();
            }}
          >
            {editSubMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

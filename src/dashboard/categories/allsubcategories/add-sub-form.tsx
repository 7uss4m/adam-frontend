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
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useQuery, useMutation, UseQueryResult } from "@tanstack/react-query";
import { useToast } from "../../../components/ui/use-toast";
import { AxiosError } from "axios";
import postSub from "../../../api/postSub";
import getCategories from "../../../api/getCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useTranslation } from "react-i18next";
import { Category } from "../../../types/types";
import getAllSub from "../../../api/getAllSub";

export function AddSubForm({ query }: { query: UseQueryResult }) {
  const [open, setOpen] = useState(false);
  const [categoryType, setCategoryType] = useState("one");
  const [order, setOrder] = useState("");
  const [parentId, setParentId] = useState<string>("");

  const nameRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const bonusRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const [t, i18n] = useTranslation("global");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getCategories();
      const categories: Category[] = response.data.result;
      return categories;
    },
  });
  const getAllSubQuery = useQuery({
    queryKey: ["subs"],
    queryFn: async () => {
      const response = await getAllSub();
      return response.data.result as Category[];
    },
  });

  const postSubMutation = useMutation({
    mutationFn: async () => {
      const response = await postSub({
        token: localStorage.getItem("token") as string,
        parent_id: Number(parentId),
        name: nameRef.current?.value as string,
        type: categoryType,
        bonus: Number(bonusRef.current?.value),
        image: imageRef.current?.files?.[0],
        order: Number(order),
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
      <DialogTrigger asChild>
        <Button variant="default">{t("add")}</Button>
      </DialogTrigger>
      <DialogContent
        dir={i18n.language === "en" ? "ltr" : "rtl"}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="text-start text-primary">
            {t("add_sub_category")}
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription />
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
            <Label className="text-right">{t("type")}</Label>
            <Select
              defaultValue={categoryType}
              onValueChange={(value) => setCategoryType(value)}
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
            <Label className="text-right">{t("bonus")}</Label>
            <Input
              ref={bonusRef}
              type="number"
              min={0}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">order</Label>
            <Input
              type="number"
              min={1}
              className="col-span-3"
              onChange={(e) => setOrder(e.currentTarget.value)}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("select_category")}</Label>
            <Select
              onValueChange={(value) => setParentId(value)}
              defaultValue=""
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
            type="submit"
            disabled={postSubMutation.isPending}
            variant={postSubMutation.isPending ? "ghost" : "default"}
            onClick={(e) => {
              e.preventDefault();
              postSubMutation.mutate();
            }}
          >
            {postSubMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

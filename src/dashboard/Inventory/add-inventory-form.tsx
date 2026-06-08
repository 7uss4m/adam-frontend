import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useRef, useState } from "react";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import postInventory from "../../api/postInventory";
import { Category } from "../../types/types";
import getAllSub from "../../api/getAllSub";
import Spinner from "../../components/Spinner";
import { useTranslation } from "react-i18next";

export default function AddInventoryForm({ query }: { query: UseQueryResult }) {
  // state
  const [open, setOpen] = useState(false);
  const [subId, setSubId] = useState<null | number>(null);
  // refs
  const totalQuantityRef = useRef<HTMLInputElement>(null);
  const totalPriceRef = useRef<HTMLInputElement>(null);
  // toast
  const { toast } = useToast();

  // query
  const getAllSubQuery = useQuery({
    queryKey: ["add inventory"],
    queryFn: async () => {
      const response = await getAllSub();
      const sub = response.data.result as Category[];
      return sub;
    },
    refetchOnWindowFocus: false
  });
  // mutation
  const postInventoryMutation = useMutation({
    mutationFn: async () => {
      const response = await postInventory(
        localStorage.getItem("token") as string,
        {
          sub_categoryId: subId as number,
          total_price: Number(totalPriceRef.current?.value),
          total_quantity: Number(totalQuantityRef.current?.value),
        }
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
    <Dialog open={open} onOpenChange={() => {
      setSubId(null);
      setOpen(!open)
    }}>
      <DialogTrigger asChild>
        <div className="w-full flex items-center justify-end">
          <Button>{t("add")}</Button>
        </div>
      </DialogTrigger>
      <DialogContent dir={i18n.language == "en" ? "ltr" : "rtl"} className="sm:max-w-[425px]">
        {getAllSubQuery.isLoading ? (
          <Spinner />
        ) : getAllSubQuery.isSuccess && getAllSubQuery.data ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-start text-primary">{t("add_inventory")}</DialogTitle>
              <VisuallyHidden>
                <DialogDescription></DialogDescription>
              </VisuallyHidden>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  {t("total_quantity")}
                </Label>
                <Input
                  ref={totalQuantityRef}
                  id="name"
                  type="number"
                  className="col-span-3"
                  min={1}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  {t("total_price")}
                </Label>
                <Input
                  ref={totalPriceRef}
                  id="price"
                  type="number"
                  className="col-span-3"
                  min={1}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sub" className="text-right">
                  {t("sub_category")}
                </Label>
                <Select
                  dir={i18n.language == "en" ? "ltr" : "rtl"}
                  onValueChange={(value) => {
                    setSubId(Number(value));
                  }}
                >
                  <SelectTrigger className="!max-w-full !w-full col-span-3">
                    <SelectValue placeholder={t("select_sub_category")} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllSubQuery.data.map((sub) => (
                      <SelectItem value={sub.id.toLocaleString()} key={sub.id}>
                        <div className="w-full flex items-center gap-5">
                          <img src={sub.image} alt="" className="size-[20px] rounded" />
                          <span>{sub.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={postInventoryMutation.isPending}
                variant={postInventoryMutation.isPending ? "ghost" : "default"}
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  postInventoryMutation.mutate();
                }}
              >
                {postInventoryMutation.isPending ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

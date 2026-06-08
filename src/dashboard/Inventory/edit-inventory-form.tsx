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


import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useRef, useState } from "react";
import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { Category, Inventory } from "../../types/types";
import getAllSub from "../../api/getAllSub";
import Spinner from "../../components/Spinner";
import putInventory from "../../api/putInventory";
import { useTranslation } from "react-i18next";

export default function EditInventoryForm({ inventory, query }: { inventory: Inventory, query: UseQueryResult }) {
  // state
  const [open, setOpen] = useState(false);
  // refs
  const totalQuantityRef = useRef<HTMLInputElement>(null);
  const totalPriceRef = useRef<HTMLInputElement>(null);
  // toast
  const { toast } = useToast();

  // query
  const getAllSubQuery = useQuery({
    queryKey: ["edit inventory"],
    queryFn: async () => {
      const response = await getAllSub();
      const sub = response.data.result as Category[];
      return sub;
    },
    refetchOnWindowFocus: false
  });

  // mutation
  const putInventoryMutation = useMutation({
    mutationFn: async () => {
      const response = await putInventory(
        localStorage.getItem("token") as string,
        inventory.id,
        {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full flex items-center justify-end">
          <Button>{t("edit")}</Button>
        </div>
      </DialogTrigger>
      <DialogContent dir={i18n.language == "en" ? "ltr" : "rtl"} className="sm:max-w-[425px]">
        {getAllSubQuery.isLoading ? (
          <Spinner />
        ) : getAllSubQuery.isSuccess && getAllSubQuery.data ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-start text-primary">{t("edit_inventory")}</DialogTitle>
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
                  defaultValue={inventory.total_quantity}
                  ref={totalQuantityRef}
                  id="quantity"
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
                  defaultValue={inventory.total_price}
                  ref={totalPriceRef}
                  id="price"
                  type="number"
                  className="col-span-3"
                  min={1}
                />
              </div>

            </div>
            <DialogFooter>
              <Button
                disabled={putInventoryMutation.isPending}
                variant={putInventoryMutation.isPending ? "ghost" : "default"}
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  putInventoryMutation.mutate();
                }}
              >
                {putInventoryMutation.isPending ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

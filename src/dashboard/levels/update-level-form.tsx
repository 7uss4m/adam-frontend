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
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { Level } from "../../types/types";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import putLevel from "../../api/putLevel";
import { useTranslation } from "react-i18next";

export default function EditLevelForm({
  query,
  level,
}: {
  query: UseQueryResult;
  level: Level;
}) {
  // state
  const [open, setOpen] = useState(false);
  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  const profit = useRef<HTMLInputElement>(null);
  // toast
  const { toast } = useToast();
  // state
  // const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  // query

  // mutation
  const putLevelMutation = useMutation({
    mutationFn: async () => {
      const response = await putLevel(
        localStorage.getItem("token") as string,
        level.id,
        nameRef.current?.value as string,
        Number(maxRef.current?.value),
        Number(profit.current?.value)
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
        <Button>{t("edit")}</Button>
      </DialogTrigger>
      <DialogContent
        dir={i18n.language == "en" ? "ltr" : "rtl"}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="text-start text-primary">
            {t("edit_level")}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("name")}
            </Label>
            <Input
              defaultValue={level.name}
              ref={nameRef}
              id="name"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="max" className="text-right">
              {t("max")}
            </Label>
            <Input
              defaultValue={level.max}
              ref={maxRef}
              id="max"
              type="number"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profit" className="text-right">
              {t("profit")}
            </Label>
            <Input
              defaultValue={level.profit}
              ref={profit}
              id="profit"
              type="text"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={putLevelMutation.isPending}
            variant={putLevelMutation.isPending ? "ghost" : "default"}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              putLevelMutation.mutate();
            }}
          >
            {putLevelMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

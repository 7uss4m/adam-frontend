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

import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import putMoonPay from "../../api/putMoonPay";

export default function EditMoonForm({
  query,
  data
}: {
  query: UseQueryResult
  data: string | undefined
}) {
  // state
  const [open, setOpen] = useState(false);


  // refs
  const textRef = useRef<HTMLInputElement>(null);



  // toast
  const { toast } = useToast();

  // query

  // mutation
  const editMoonMutation = useMutation({
    mutationFn: async () => {
      const response = await putMoonPay(
        localStorage.getItem("token") as string,
        textRef.current?.value as string,
      );
      return response
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result
      })
      setOpen(false);
      query.refetch()

    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error
      })
    }
  });

  // translation
  const [t, i18n] = useTranslation("global")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{t("edit")}</Button>
      </DialogTrigger>
      <DialogContent dir={i18n.language == "en" ? "ltr" : "rtl"} className="sm:max-w-[425px] max-h-[100%] overflow-y-auto">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle className="text-start text-primary">{t("edit_box")}</DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden>
            <DialogDescription>
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="info" className="text-right">
              {t("wallet_address")}
            </Label>
            <Input
              id="info"
              defaultValue={data}
              className="col-span-3"
              ref={textRef}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={editMoonMutation.isPending} variant={editMoonMutation.isPending ? "ghost" : "default"} onClick={(e) => {
            e.preventDefault()
            editMoonMutation.mutate()
          }}>{editMoonMutation.isPending ? t("saving") : t("save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

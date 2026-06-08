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
import { Client } from "../../types/types";
import { UseQueryResult, useMutation } from "@tanstack/react-query";

import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import patchClient from "../../api/putClient";

export default function EditClientForm({
  client,
  query,
}: {
  client: Client;
  query: UseQueryResult;
}) {
  // state
  const [open, setOpen] = useState(false);

  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const balanceRef = useRef<HTMLInputElement>(null);

  // toast
  const { toast } = useToast();

  // mutation
  const editClientMutation = useMutation({
    mutationFn: async () => {
      const response = await patchClient(
        {
          name: nameRef.current?.value as string,
          balance: Number(balanceRef.current?.value),
        },
        client.id.toString(),
        localStorage.getItem("token") as string
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
              defaultValue={client.name}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="balance" className="text-right">
              {t("balance")}
            </Label>
            <Input
              defaultValue={client.balance}
              ref={balanceRef}
              id="balance"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={editClientMutation.isPending}
            variant={editClientMutation.isPending ? "ghost" : "default"}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              editClientMutation.mutate();
            }}
          >
            {editClientMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

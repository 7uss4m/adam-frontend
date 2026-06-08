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
import { useMutation, UseQueryResult } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import postBox from "../../api/postBox";
import { useTranslation } from "react-i18next";

export function AddBoxForm({ query }: { query: UseQueryResult }) {
  // state
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<0[]>([]);

  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const accountNameRef = useRef<HTMLInputElement>(null);
  const accountCodeRef = useRef<HTMLInputElement>(null);
  const boxNameRef = useRef<HTMLInputElement>(null);
  const walletAddressRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);

  // toast
  const { toast } = useToast();

  // mutation
  const postAdminMutation = useMutation({
    mutationFn: async () => {
      const currency: { id: number; name: string }[] = [];
      currencyRef.current?.childNodes.forEach((c) => {
        currency.push({
          name: (c.childNodes[1] as HTMLInputElement).value,
          id: 0,
        });
      });

      const response = await postBox(localStorage.getItem("token") as string, {
        name: nameRef.current?.value as string,
        account_name: accountNameRef.current?.value as string,
        account_code: accountCodeRef.current?.value as string,
        box_name: boxNameRef.current?.value,
        wallet_address: walletAddressRef.current?.value,
        description: descriptionRef.current?.value as string,
        image: imageRef.current?.files ? imageRef.current?.files[0] : undefined,
        currencies: currency,
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

  // translation
  const [t, i18n] = useTranslation("global");

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
        setCurrency([]);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default">{t("add")}</Button>
      </DialogTrigger>
      <DialogContent
        dir={i18n.language == "en" ? "ltr" : "rtl"}
        className="sm:max-w-[425px] max-h-[100%] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-start text-primary">
            {t("add_box")}
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
            <Label htmlFor="account_name" className="text-right">
              {t("account_name")}
            </Label>
            <Input
              id="account_name"
              type="text"
              className="col-span-3"
              ref={accountNameRef}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account_code" className="text-right">
              {t("account_code2")}
            </Label>
            <Input
              id="account_code"
              type="text"
              className="col-span-3"
              ref={accountCodeRef}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="box_name" className="text-right">
              {t("box_name")}
            </Label>
            <Input
              id="box_name"
              type="text"
              className="col-span-3"
              ref={boxNameRef}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="wallet_address" className="text-right">
              {t("wallet_address")}
            </Label>
            <Input
              id="wallet_address"
              type="text"
              className="col-span-3"
              ref={walletAddressRef}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {t("description")}
            </Label>
            <Input
              id="description"
              type="text"
              className="col-span-3"
              ref={descriptionRef}
            />
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
            <div className="grid grid-cols-4 col-span-4 items-center gap-4">
              <Label className="text-right ">{t("currencies")}</Label>
            </div>
            <div
              ref={currencyRef}
              className="currencies flex flex-col justify-center items-center gap-5 col-span-4"
            >
              <div className="w-full grid grid-cols-4 items-center gap-4">
                <Label className="text-right "></Label>
                <Input type="text" className="col-span-3" />
              </div>
              {currency.map(() => (
                <div className="w-full grid grid-cols-4 items-center gap-4">
                  <Label className="text-right "></Label>
                  <Input type="text" className="col-span-3" />
                </div>
              ))}
            </div>
            <div className="w-full grid grid-cols-4 col-span-4">
              <Button
                className="col-start-3 col-end-5"
                size={"sm"}
                onClick={() => {
                  setCurrency((prev) => [...prev, 0]);
                }}
              >
                {t("add_currency")}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={postAdminMutation.isPending}
            variant={postAdminMutation.isPending ? "ghost" : "default"}
            onClick={(e) => {
              e.preventDefault();
              postAdminMutation.mutate();
            }}
          >
            {postAdminMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { ChargeBox } from "../../types/types";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";


import putBox from "../../api/putBox";
import { useTranslation } from "react-i18next";

export default function EditBoxForm({
  query,
  box,
}: {
  query: UseQueryResult;
  box: ChargeBox;
}) {
  // state
  const [open, setOpen] = useState(false);


  const [allCurrency, setAllCurrency] = useState([...box.currencies])

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

  // query

  // mutation
  const putBoxMutation = useMutation({
    mutationFn: async () => {
      const currency: { id: string, name: string }[] = []

      currencyRef.current?.childNodes.forEach((c, index) => {
        currency.push({ id: box.currencies[index] ? box.currencies[index].id : "0", name: (c.childNodes[1] as HTMLInputElement).value })
      })

      const response = await putBox(
        localStorage.getItem("token") as string,
        box.id,
        {
          name: nameRef.current?.value as string,
          account_name: accountNameRef.current?.value as string,
          account_code: accountCodeRef.current?.value as string,
          box_name: boxNameRef.current?.value,
          wallet_address: walletAddressRef.current?.value,
          description: descriptionRef.current?.value as string,
          image: imageRef.current?.files ? imageRef.current?.files[0] : box.image as string,
          currencies: currency
        }

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
          <DialogTitle className="text-start text-primary">{t("edit_box")}</DialogTitle>
          <VisuallyHidden>
            <DialogDescription>
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("name")}
            </Label>
            <Input
              id="name"
              defaultValue={box.name}
              className="col-span-3"
              ref={nameRef}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account_name" className="text-right">
              {t("account_name")}
            </Label>
            <Input
              defaultValue={box.account_name}
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
              defaultValue={box.account_code}
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
              defaultValue={box.box_name}
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
              defaultValue={box.wallet_address}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              {t("description")}
            </Label>
            <Input
              defaultValue={box.description}
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
              <Label className="text-right ">
                {t("currencies")}
              </Label>
            </div>
            <div ref={currencyRef} className="currencies flex flex-col justify-center items-center gap-5 col-span-4">

              {allCurrency.map((currency, index) => (
                <div id={index.toString()} key={currency.id} className="w-full grid grid-cols-4 items-center gap-4">
                  <Label className="text-right ">

                  </Label>
                  <Input
                    defaultValue={currency.name}
                    type="text"
                    className="col-span-2"
                  />
                  {allCurrency.length >= 2 && <Button id={index.toString()} className="col-span-1" variant={"destructive"} size={"sm"} onClick={(e) => {
                    setAllCurrency(() => {
                      return allCurrency.filter((currency, index) => {
                        if (index.toString() != e.currentTarget.id) {
                          return currency
                        }
                      })
                    })
                  }}>{t("delete")}</Button>}

                </div>
              ))}

            </div>
            <div className="w-full grid grid-cols-4 col-span-4">

              <Button className="col-start-4 col-end-4" size={"sm"} onClick={() => {
                setAllCurrency((prev) =>
                  [...prev, { boxsId: "0", id: "0", name: "" }]
                )
              }}>{t("add_currency")}</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={putBoxMutation.isPending} variant={putBoxMutation.isPending ? "ghost" : "default"} onClick={(e) => {
            e.preventDefault()
            putBoxMutation.mutate()
          }}>{putBoxMutation.isPending ? t("saving") : t("save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

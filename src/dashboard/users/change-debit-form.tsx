import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { useToast } from "../../components/ui/use-toast"
import { AxiosError } from "axios"
import postDebit from "../../api/postDebit"
import { useTranslation } from "react-i18next"

export default function ChangeUserDebit({ userId, query }: { userId: number, query: UseQueryResult }) {
  // refs
  const amountRef = useRef<HTMLInputElement>(null)
  const expireRef = useRef<HTMLInputElement>(null)
  // toast
  const { toast } = useToast();
  // state
  const [open, setOpen] = useState(false)
  const [prevent, setPrevent] = useState(false)
  // mutation
  const changeUserDebitMutation = useMutation({
    mutationFn: async () => {
      if (prevent == false) {
        const response = postDebit(localStorage.getItem("token") as string, Number(amountRef.current?.value), Number(userId), Number(expireRef.current?.value))
        return response
      }
      else {
        const response = postDebit(localStorage.getItem("token") as string, 0, Number(userId), 1)
        return response
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result
      })
      setPrevent(false)
      query.refetch()
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error
      })
    }
  })
  // translation
  const [t, i18n] = useTranslation("global");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} className="w-1/2" >{t("edit_debit")}</Button>
      </DialogTrigger>
      <DialogContent dir={i18n.language == "en" ? "ltr" : "rtl"} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-start">{t("edit_debit")}</DialogTitle>
          <DialogDescription className="text-start">
            {t("edit_debit_line_1")}
            <br />
            {t("edit_debit_line_2")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              {t("amount")}
            </Label>
            <Input
              ref={amountRef}
              id="amount"
              type="number"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expire" className="text-right">
              {t("expire_limit")}
            </Label>
            <Input
              ref={expireRef}
              id="expire"
              type="number"
              className="col-span-3"
            />
          </div>

        </div>
        <DialogFooter className="gap-2">
          <Button disabled={changeUserDebitMutation.isPending} type="submit" onClick={() => {
            changeUserDebitMutation.mutate()
          }}>{changeUserDebitMutation.isPending ? t("editing") : t("edit")}</Button>
          <Button disabled={changeUserDebitMutation.isPending} type="submit" onClick={() => {
            setPrevent(true)
            changeUserDebitMutation.mutate()
          }}>{changeUserDebitMutation.isPending ? t("preventing") : t("prevent")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
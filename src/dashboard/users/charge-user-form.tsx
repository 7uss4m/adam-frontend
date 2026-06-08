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
import postUserCharge from "../../api/postUserCharge"
import { useRef, useState } from "react"
import { useToast } from "../../components/ui/use-toast"
import { AxiosError } from "axios"
import { useTranslation } from "react-i18next"

export default function ChargeUserForm({ userId, query }: { userId: number, query: UseQueryResult }) {
  // refs
  const coinsRef = useRef<HTMLInputElement>(null)
  // toast
  const { toast } = useToast();
  // state
  const [open, setOpen] = useState(false)
  // mutation
  const chargeUserMutation = useMutation({
    mutationFn: async () => {
      const response = postUserCharge(localStorage.getItem("token") as string, Number(coinsRef.current?.value), Number(userId))
      return response
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result
      })
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
  const [t, i18n] = useTranslation("global")
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} className="w-1/2" >{t("change_balance")}</Button>
      </DialogTrigger>
      <DialogContent dir={i18n.language == "en" ? "ltr" : "rtl"} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-start">{t("change_balance")}</DialogTitle>
          <DialogDescription className="text-start">
            {t("charge_note")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              {t("amount")}
            </Label>
            <Input
              ref={coinsRef}
              id="amount"
              type="number"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={chargeUserMutation.isPending} type="submit" onClick={() => {
            chargeUserMutation.mutate()
          }}>{chargeUserMutation.isPending ? t("changing") : t("change")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
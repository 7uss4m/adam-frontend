import { AxiosError } from "axios"
import { Button } from "../../components/ui/button"
import patchNote from "../../api/patchNote"
import { useMutation, UseQueryResult } from "@tanstack/react-query"
import { useToast } from "../../components/ui/use-toast"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { useState } from "react"

export default function PatchNoteForm({ query, id, status }: { query: UseQueryResult, id: string, status: string }) {
  // toast
  const { toast } = useToast()
  
  // state
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  // translation
  const [t] = useTranslation("global")

  // mutation 
  const patchNoteMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await patchNote(localStorage.getItem("token") as string, id, newStatus)
      return response.data
    },
    onSuccess: (data) => {
      toast({
        title: t("success"),
        description: data.result
      })
      query.refetch()
      setOpen(false)
    },
    onError: (error: AxiosError) => {
      console.error(error)
      toast({
        title: t("error"),
        description: (error.response?.data as { error: string }).error
      })
    }
  })

  const handleStatusChange = () => {
    if (selectedStatus) {
      patchNoteMutation.mutate(selectedStatus)
    }
  }

  // Get Arabic translations for status
  const getStatusLabel = (status: string) => {
    if (status === "success") return "نجاح"
    if (status === "reject") return "رفض"
    return status
  }

  const getOppositeStatus = (currentStatus: string) => {
    return currentStatus === "reject" ? "success" : "reject"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={patchNoteMutation.isPending}>
          {patchNoteMutation.isPending ? t("loading") : t("change_status")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("change_status")}</DialogTitle>
          <DialogDescription>
            {t("select_new_status") || "اختر الحالة الجديدة للملاحظة"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant={selectedStatus === "success" ? "default" : "outline"}
            onClick={() => setSelectedStatus("success")}
            className="h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg font-semibold">✅</span>
              <span className="text-sm">{getStatusLabel("success")}</span>
            </div>
          </Button>
          
          <Button
            variant={selectedStatus === "reject" ? "default" : "outline"}
            onClick={() => setSelectedStatus("reject")}
            className="h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg font-semibold">❌</span>
              <span className="text-sm">{getStatusLabel("reject")}</span>
            </div>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          {t("current_status") || "الحالة الحالية"}: <strong>{getStatusLabel(status)}</strong>
          <br />
          {t("suggested_change") || "مقترح التغيير"}: <strong>{getStatusLabel(getOppositeStatus(status))}</strong>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={patchNoteMutation.isPending}
          >
            {t("cancel") || "إلغاء"}
          </Button>
          <Button
            onClick={handleStatusChange}
            disabled={!selectedStatus || patchNoteMutation.isPending}
          >
            {patchNoteMutation.isPending ? t("loading") : t("confirm") || "تأكيد"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
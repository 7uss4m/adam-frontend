import { useMutation, UseQueryResult } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import patchOrderStatus from "../../api/patchOrderStatus";
import { AxiosError } from "axios";
import { useToast } from "../../components/ui/use-toast";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../../components/ui/input";
export default function ChangeOrderStatusForm({
  orderId,
  status,
  query,
}: {
  orderId: string;
  status: string;
  query: UseQueryResult;
}) {
  // state
  const [open, setOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>(status);
  const [replay, setReplay] = useState<string>("");
  // toast
  const { toast } = useToast();

  // mutation
  const patchOrderStatusMutation = useMutation({
    mutationFn: async () => {
      const response = await patchOrderStatus(
        localStorage.getItem("token") as string,
        orderId,
        orderStatus,
        replay
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
        <Button>{t("change_status")}</Button>
      </DialogTrigger>
      <DialogContent dir={i18n.language == "en" ? "ltr" : "rtl"}>
        <DialogHeader>
          <DialogTitle className="text-start">
            {t("change_order_status")}
          </DialogTitle>
          <DialogDescription className="text-start">
            {t("choose_status")}:
          </DialogDescription>
        </DialogHeader>
        <RadioGroup
          dir={i18n.language == "en" ? "ltr" : "rtl"}
          defaultValue={
            orderStatus == "pinding" || orderStatus == "pending"
              ? "pinding"
              : orderStatus == "reject"
              ? "reject"
              : "success"
          }
          onValueChange={(value) => {
            setOrderStatus(value);
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pinding" id="pinding" />
            <Label htmlFor="pinding">{t("pending")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="reject" id="reject" />
            <Label htmlFor="reject">{t("rejected")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="success" id="success" />
            <Label htmlFor="success">{t("succeed")}</Label>
          </div>
        </RadioGroup>

        <div className="space-y-2">
          <Label htmlFor="replay">الرد</Label>
          <Input
            onChange={(e) => {
              setReplay(e.currentTarget.value);
            }}
          />
        </div>
        <Button
          disabled={patchOrderStatusMutation.isPending}
          onClick={() => {
            patchOrderStatusMutation.mutate();
          }}
        >
          {patchOrderStatusMutation.isPending ? t("saving") : t("save")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

import { AxiosError } from "axios";
import { Button } from "../../components/ui/button";
import patchNote from "../../api/patchNote";
import { useMutation, UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { DropdownMenuItem } from "../../components/ui/dropdown-menu";
import { useState } from "react";

type PatchNoteFormProps = {
  query: UseQueryResult;
  id: string;
  status: string;
  asMenuItem?: boolean;
};

export default function PatchNoteForm({
  query,
  id,
  status,
  asMenuItem = false,
}: PatchNoteFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [t] = useTranslation("global");

  const patchNoteMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await patchNote(
        localStorage.getItem("token") as string,
        id,
        newStatus
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast({ title: t("success"), description: data.result });
      query.refetch();
      queryClient.invalidateQueries({ queryKey: ["note-stats"] });
      setOpen(false);
    },
    onError: (error: AxiosError) => {
      toast({
        title: t("error") || "Error",
        description: (error.response?.data as { error: string }).error,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = () => {
    if (selectedStatus) patchNoteMutation.mutate(selectedStatus);
  };

  const isSuccess = status === "success";

  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      {!asMenuItem && (
        <DialogTrigger asChild>
          <Button variant="outline" disabled={patchNoteMutation.isPending || isSuccess}>
            {patchNoteMutation.isPending ? t("loading") : t("change_status")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("change_status")}</DialogTitle>
          <DialogDescription>{t("select_new_status")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant={selectedStatus === "success" ? "default" : "outline"}
            onClick={() => setSelectedStatus("success")}
            className="h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2Icon />
              <span className="text-sm">{t("succeed")}</span>
            </div>
          </Button>
          <Button
            variant={selectedStatus === "reject" ? "destructive" : "outline"}
            onClick={() => setSelectedStatus("reject")}
            className="h-auto py-4"
          >
            <div className="flex flex-col items-center gap-2">
              <XCircleIcon />
              <span className="text-sm">{t("rejected")}</span>
            </div>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={patchNoteMutation.isPending}>
            {t("cancel")}
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
  );

  if (asMenuItem) {
    return (
      <>
        <DropdownMenuItem
          disabled={isSuccess}
          onSelect={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
        >
          {t("change_status")}
        </DropdownMenuItem>
        {dialog}
      </>
    );
  }

  return dialog;
}

function CheckCircle2Icon() {
  return <span className="text-lg">✅</span>;
}

function XCircleIcon() {
  return <span className="text-lg">❌</span>;
}

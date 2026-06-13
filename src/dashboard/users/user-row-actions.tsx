import { Link } from "react-router-dom";
import { useMutation, UseQueryResult } from "@tanstack/react-query";
import { useRef, useState } from "react";
import type { AxiosError } from "axios";
import {
  Coins,
  CreditCard,
  MoreHorizontal,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { useToast } from "../../components/ui/use-toast";
import postUserCharge from "../../api/postUserCharge";
import postDebit from "../../api/postDebit";
import putUserProgress from "../../api/putUserProgress";
import deleteUser from "../../api/deleteUser";
import getLevels from "../../api/getLevels";
import { useQuery } from "@tanstack/react-query";
import type { Level, User } from "../../types/types";
import Spinner from "../../components/Spinner";

type UserRowActionsProps = {
  user: User;
  query: UseQueryResult;
};

export default function UserRowActions({ user, query }: UserRowActionsProps) {
  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();
  const isRtl = i18n.language === "ar";

  const [chargeOpen, setChargeOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [debitOpen, setDebitOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const coinsRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const expireRef = useRef<HTMLInputElement>(null);
  const [levelId, setLevelId] = useState(String(user.level?.id ?? "1"));

  const levelsQuery = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const res = await getLevels();
      return res.data.result as Level[];
    },
    enabled: levelOpen,
  });

  const chargeMutation = useMutation({
    mutationFn: () =>
      postUserCharge(
        localStorage.getItem("token") as string,
        Number(coinsRef.current?.value),
        Number(user.id)
      ),
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      setChargeOpen(false);
      query.refetch();
    },
    onError: (e: AxiosError) => {
      toast({
        title: "Error",
        description: (e.response?.data as { error: string })?.error,
        variant: "destructive",
      });
    },
  });

  const levelMutation = useMutation({
    mutationFn: () => {
      const levels = levelsQuery.data || [];
      const selected = levels.find((l) => Number(l.id) === Number(levelId));
      const progressToSend =
        Number(selected?.id) === 1
          ? 1
          : (levels.find((l) => Number(l.id) === Number(levelId) - 1)?.max ?? 0) + 1;
      return putUserProgress(
        localStorage.getItem("token") as string,
        String(user.id),
        progressToSend
      );
    },
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      setLevelOpen(false);
      query.refetch();
    },
    onError: (e: AxiosError) => {
      toast({
        title: "Error",
        description: (e.response?.data as { error: string })?.error,
        variant: "destructive",
      });
    },
  });

  const debitMutation = useMutation({
    mutationFn: (prevent: boolean) =>
      postDebit(
        localStorage.getItem("token") as string,
        prevent ? 0 : Number(amountRef.current?.value),
        Number(user.id),
        prevent ? 1 : Number(expireRef.current?.value)
      ),
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      setDebitOpen(false);
      query.refetch();
    },
    onError: (e: AxiosError) => {
      toast({
        title: "Error",
        description: (e.response?.data as { error: string })?.error,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteUser(localStorage.getItem("token") as string, String(user.id)),
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      setDeleteOpen(false);
      query.refetch();
    },
    onError: (e: AxiosError) => {
      toast({
        title: "Error",
        description: (e.response?.data as { error: string })?.error,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <DropdownMenu dir={isRtl ? "rtl" : "ltr"}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to={`/${import.meta.env.VITE_DASHBOARD}/notes?user=${user.id}`} className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {t("user_deposits")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={`${user.id}/orders`} className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              {t("orders")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`${user.id}/debits`} className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t("debts")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setChargeOpen(true)}>
            <Wallet className="h-4 w-4 me-2" />
            {t("change_balance")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLevelOpen(true)}>
            <TrendingUp className="h-4 w-4 me-2" />
            {t("change_progress")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDebitOpen(true)}>
            <Coins className="h-4 w-4 me-2" />
            {t("edit_debit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 me-2" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={chargeOpen} onOpenChange={setChargeOpen}>
        <DialogContent dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("change_balance")}</DialogTitle>
            <DialogDescription>{t("charge_note")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t("amount")}</Label>
            <Input ref={coinsRef} type="number" />
          </div>
          <DialogFooter>
            <Button
              onClick={() => chargeMutation.mutate()}
              disabled={chargeMutation.isPending}
            >
              {chargeMutation.isPending ? t("changing") : t("change")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={levelOpen} onOpenChange={setLevelOpen}>
        <DialogContent dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("change_progress")}</DialogTitle>
          </DialogHeader>
          {levelsQuery.isLoading ? (
            <Spinner />
          ) : (
            <RadioGroup value={levelId} onValueChange={setLevelId}>
              {(levelsQuery.data || []).map((level) => (
                <div key={level.id} className="flex items-center gap-2">
                  <RadioGroupItem value={String(level.id)} id={`lvl-${level.id}`} />
                  <Label htmlFor={`lvl-${level.id}`}>
                    {t(level.name.toLowerCase())}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
          <DialogFooter>
            <Button
              onClick={() => levelMutation.mutate()}
              disabled={levelMutation.isPending}
            >
              {levelMutation.isPending ? t("loading") : t("save") || "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={debitOpen} onOpenChange={setDebitOpen}>
        <DialogContent dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("edit_debit")}</DialogTitle>
            <DialogDescription>
              {t("edit_debit_line_1")}
              <br />
              {t("edit_debit_line_2")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{t("amount")}</Label>
              <Input ref={amountRef} type="number" />
            </div>
            <div className="space-y-1">
              <Label>{t("expire_limit")}</Label>
              <Input ref={expireRef} type="number" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => debitMutation.mutate(false)}
              disabled={debitMutation.isPending}
            >
              {t("edit")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => debitMutation.mutate(true)}
              disabled={debitMutation.isPending}
            >
              {t("prevent")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir={isRtl ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("are_you_absolutely_sure")}</AlertDialogTitle>
            <AlertDialogDescription>{t("actions")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("deleting") : t("continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

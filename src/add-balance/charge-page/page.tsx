import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import getPaymentsMethods from "../../api/getPaymentsMethods";
import { PaymentMethod } from "../../types/types";
import Spinner from "../../components/Spinner";
import { Button } from "../../components/ui/button";
import { useRef, useState } from "react";
import postAddBalance from "../../api/postAddBalance";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

export default function ChargePage() {
  // state
  const [methodId, setMethodId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  // refs
  const coinsRef = useRef<HTMLInputElement>(null);
  // toast
  const { toast } = useToast();
  // query
  const getPaymentsMethodsQuery = useQuery({
    queryKey: ["methods"],
    queryFn: async () => {
      const response = await getPaymentsMethods();
      return response.data.result as PaymentMethod[];
    },
    refetchOnWindowFocus: false,
  });
  
  // mutation
  const postAddBalanceMutation = useMutation({
    mutationFn: async () => {
      const response = await postAddBalance(
        localStorage.getItem("token") as string,
        coinsRef.current?.value as string,
        methodId as string
      );
      return response.data;
    },
    onSuccess: (data) => {
      window.location.href = data.result;
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
      });
    },
  });
  // translation
  const [t] = useTranslation("global");
  return (
    <>
      {getPaymentsMethodsQuery.isLoading ? (
        <section className="min-h-svh flex justify-center items-center">
          <Spinner />
        </section>
      ) : (
        <section className="relative container space-y-5 pb-20 max-w-[100%] md:max-w-[90%] lg:max-w-[70%] max-xs:min-h-[15vh] min-h-[10vh] sm:min-h-[15vh] px-1 justify-between items-center">
          <h2 className="text-white text-xl sm:text-2xl">{t("add_balance")}</h2>

          <div className="add-balance-form container max-w-[100%] md:max-w-[70%] lg:max-w-[50%] !p-5 sm:p-10 bg-main-third rounded shadow-lg space-y-5">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white text-sm sm:text-lg">
                {t("amount")}
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min={0}
                ref={coinsRef}
                className="p-7 bg-main-primary rounded-full text-white border-none focus-visible:!ring-offset-0 focus-visible:!ring-transparent shadow-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-white text-sm sm:text-lg">
                {t("payment")}
              </Label>
              <Select
                open={open}
                onOpenChange={() => {
                  setTimeout(() => {
                    setOpen(!open);
                  }, 0);
                }}
                onValueChange={(value) => {
                  setMethodId(value);
                }}
              >
                <SelectTrigger className="z-20 w-full rounded-full bg-main-primary text-white p-7 border-none !ring-offset-0 !ring-0 shadow-lg">
                  <SelectValue placeholder={t("select_payment_method")} />
                </SelectTrigger>
                <SelectContent position="popper" className="bg-main-primary">
                  {getPaymentsMethodsQuery.data?.map((method) =>
                    method.active && method.name != "offline" ? (
                      <SelectItem
                        className="w-full bg-main-primary text-white capitalize"
                        value={method.id}
                        key={method.id}
                      >
                        <div className="flex items-center w-full gap-2 min-w-[200px]">
                          <img
                            className="size-[25px] rounded"
                            src={method.image}
                            alt=""
                          />
                          <span>{method.name}</span>
                        </div>
                      </SelectItem>
                    ) : null
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center items-center !mt-10">
              <Button
                disabled={postAddBalanceMutation.isPending}
                size={"lg"}
                className={`rounded-full w-full bg-accent hover:bg-accent hover:opacity-50 transition-opacity`}
                onClick={() => {
                  postAddBalanceMutation.mutate();
                }}
              >
                {postAddBalanceMutation.isPending ? t("adding") : t("add")}
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

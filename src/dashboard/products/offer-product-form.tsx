import { useMemo, useState, useEffect } from "react";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Product } from "../../types/types";
import putProductOffer, {
  ProductOfferPayload,
} from "../../api/putProductOffer";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { useToast } from "../../components/ui/use-toast";
import { cn } from "../../lib/utils";

function previewOfferPrice(
  basePrice: number,
  offerActive: boolean,
  offerType: "percent" | "fixed",
  discountPercent: string,
  offerPrice: string
) {
  if (!offerActive) return basePrice;

  if (offerType === "percent") {
    const percent = Number(discountPercent);
    if (!percent || percent <= 0 || percent > 99) return basePrice;
    return +(basePrice * (1 - percent / 100));
  }

  const fixed = Number(offerPrice);
  if (!fixed || fixed <= 0) return basePrice;
  return fixed;
}

export default function OfferProductForm({
  product,
  query,
  compact = false,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: {
  product: Product;
  query: UseQueryResult;
  compact?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [t] = useTranslation("global");
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [offerActive, setOfferActive] = useState(product.offer_active ?? false);
  const [offerType, setOfferType] = useState<"percent" | "fixed">(
    product.offer_type === "fixed" ? "fixed" : "percent"
  );
  const [discountPercent, setDiscountPercent] = useState(
    product.discount_percent?.toString() ?? ""
  );
  const [offerPrice, setOfferPrice] = useState(
    product.offer_price?.toString() ?? ""
  );
  const [startDate, setStartDate] = useState<Date | undefined>(
    product.offer_start_at ? new Date(product.offer_start_at) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    product.offer_end_at ? new Date(product.offer_end_at) : undefined
  );

  useEffect(() => {
    if (!open) return;
    setOfferActive(product.offer_active ?? false);
    setOfferType(product.offer_type === "fixed" ? "fixed" : "percent");
    setDiscountPercent(product.discount_percent?.toString() ?? "");
    setOfferPrice(product.offer_price?.toString() ?? "");
    setStartDate(
      product.offer_start_at ? new Date(product.offer_start_at) : undefined
    );
    setEndDate(
      product.offer_end_at ? new Date(product.offer_end_at) : undefined
    );
  }, [open, product]);

  const basePrice = Number(product.price) || 0;
  const previewAfter = useMemo(
    () =>
      previewOfferPrice(
        basePrice,
        offerActive,
        offerType,
        discountPercent,
        offerPrice
      ),
    [basePrice, offerActive, offerType, discountPercent, offerPrice]
  );

  const offerMutation = useMutation({
    mutationFn: async (payload: ProductOfferPayload) => {
      return putProductOffer(
        localStorage.getItem("token") as string,
        product.id.toString(),
        payload
      );
    },
    onSuccess: (res) => {
      toast({
        title: "Done!",
        description: res.data.result,
      });
      query.refetch();
      setOpen(false);
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string })?.error,
      });
    },
  });

  const handleSubmit = () => {
    const payload: ProductOfferPayload = {
      offer_active: offerActive,
    };

    if (offerActive) {
      payload.offer_type = offerType;
      if (offerType === "percent") {
        payload.discount_percent = Number(discountPercent);
      } else {
        payload.offer_price = Number(offerPrice);
      }
      payload.offer_start_at = startDate ? startDate.toISOString() : null;
      payload.offer_end_at = endDate ? endDate.toISOString() : null;
    }

    offerMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          {compact ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" title={t("offer")}>
              <Tag className="h-4 w-4 text-cyan-600" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-1">
              <Tag className="h-3.5 w-3.5" />
              {t("offer")}
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("offer_manage")} — {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={`offer-active-${product.id}`}>{t("offer_active")}</Label>
            <Switch
              id={`offer-active-${product.id}`}
              checked={offerActive}
              onCheckedChange={setOfferActive}
            />
          </div>

          {offerActive && (
            <>
              <div className="space-y-2">
                <Label>{t("offer_type")}</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={offerType === "percent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOfferType("percent")}
                  >
                    {t("offer_percent")}
                  </Button>
                  <Button
                    type="button"
                    variant={offerType === "fixed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOfferType("fixed")}
                  >
                    {t("offer_fixed_price")}
                  </Button>
                </div>
              </div>

              {offerType === "percent" ? (
                <div className="space-y-2">
                  <Label htmlFor={`discount-${product.id}`}>
                    {t("discount_percent")}
                  </Label>
                  <Input
                    id={`discount-${product.id}`}
                    type="number"
                    min={1}
                    max={99}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="20"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor={`offer-price-${product.id}`}>
                    {t("offer_price")}
                  </Label>
                  <Input
                    id={`offer-price-${product.id}`}
                    type="number"
                    min={0.01}
                    step="0.01"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="4.99"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("offer_start")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        {startDate ? format(startDate, "yyyy-MM-dd") : "—"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>{t("offer_end")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        {endDate ? format(endDate, "yyyy-MM-dd") : "—"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
              >
                {t("clear_dates")}
              </Button>

              <div className="rounded-md border p-3 text-sm space-y-1">
                <p className="font-medium">{t("offer_preview")}</p>
                <p>
                  {t("offer_before")}: ${basePrice.toFixed(2)}
                </p>
                <p>
                  {t("offer_after")}: ${previewAfter.toFixed(2)}
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={offerMutation.isPending}
          >
            {t("save_offer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

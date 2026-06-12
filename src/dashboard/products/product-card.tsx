import { memo, useState } from "react";
import { Eye, Pencil, Tag, Trash2 } from "lucide-react";
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";

import { Product } from "../../types/types";
import putProductState from "../../api/putProductState";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "../../components/ui/use-toast";
import { cn } from "../../lib/utils";
import {
  getOfferStatusKey,
  getOfferStatusText,
  getProductImageUrl,
  isOfferCurrentlyActive,
} from "./product-utils";

const offerBadgeClass: Record<string, string> = {
  offer_active_status:
    "border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-700 dark:text-cyan-300",
  offer_scheduled:
    "border-blue-500/30 bg-gradient-to-r from-blue-500/15 to-indigo-500/10 text-blue-700 dark:text-blue-300",
  offer_expired: "border-border bg-muted/80 text-muted-foreground",
  offer_none: "border-border/60 bg-muted/40 text-muted-foreground",
};

type ProductCardProps = {
  product: Product;
  query: UseQueryResult;
  onOffer: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function ProductCard({
  product,
  query,
  onOffer,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [t] = useTranslation("global");
  const { toast } = useToast();
  const [imgSrc, setImgSrc] = useState(getProductImageUrl(product.image));

  const offerKey = getOfferStatusKey(product);
  const hasLiveOffer = isOfferCurrentlyActive(product);
  const hasDiscount =
    product.mainPrice &&
    Number(product.mainPrice) > Number(product.price);

  const toggleMutation = useMutation({
    mutationFn: async (active: number) => {
      return putProductState(
        localStorage.getItem("token") as string,
        product.id.toString(),
        active
      );
    },
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      query.refetch();
    },
    onError: (error: AxiosError) => {
      toast({
        title: t("error") || "Error!",
        description: (error.response?.data as { error: string })?.error,
        variant: "destructive",
      });
      query.refetch();
    },
  });

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative h-44 cursor-pointer overflow-hidden bg-muted/30">
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgSrc(getProductImageUrl(null))}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/30">
                <Eye className="h-5 w-5 text-white" />
              </div>
            </div>

            <div
              className={cn(
                "absolute start-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-lg backdrop-blur-md",
                product.active
                  ? "bg-emerald-500/90 text-white ring-1 ring-emerald-400/30"
                  : "bg-rose-500/90 text-white ring-1 ring-rose-400/30"
              )}
            >
              {product.active ? t("active") : t("inactive") || "معطل"}
            </div>

            <div className="absolute end-3 top-3 rounded-lg bg-black/40 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-md ring-1 ring-white/10">
              #{product.id}
            </div>

            {hasLiveOffer && (
              <div className="absolute bottom-3 start-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                <Tag className="h-3 w-3" />
                {t("special_offer")}
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="overflow-hidden rounded-2xl border-border/50 p-2 sm:max-w-md">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>{product.name}</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full rounded-xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getProductImageUrl(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-sm font-bold tracking-tight text-foreground">
            {product.name}
          </h3>
          {product.categories?.name && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {product.categories.name}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xl font-black tabular-nums text-primary">
              ${Number(product.price).toFixed(2)}
            </p>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through tabular-nums">
                ${Number(product.mainPrice).toFixed(2)}
              </p>
            )}
          </div>
          {product.source && (
            <Badge
              variant="outline"
              className="rounded-lg border-border/60 bg-muted/30 text-[10px] font-semibold"
            >
              {product.source}
            </Badge>
          )}
        </div>

        <span
          className={cn(
            "inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold",
            offerBadgeClass[offerKey] || offerBadgeClass.offer_none
          )}
        >
          {getOfferStatusText(product, (k) => t(k))}
        </span>

        <div className="mt-auto flex items-center justify-between border-t border-border/30 pt-3">
          <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-2.5 py-1.5">
            <Switch
              dir="ltr"
              checked={product.active}
              disabled={toggleMutation.isPending}
              onCheckedChange={(checked) => {
                toggleMutation.mutate(checked ? 1 : 0);
              }}
              id={`product-switch-${product.id}`}
            />
            <span className="text-[11px] font-medium text-muted-foreground">
              {t("active")}
            </span>
          </div>

          <div className="flex items-center gap-0.5 opacity-80 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-cyan-600 hover:bg-cyan-500/10 hover:text-cyan-700"
              title={t("offer")}
              onClick={() => onOffer(product)}
            >
              <Tag className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl hover:bg-primary/10"
              title="Edit"
              onClick={() => onEdit(product)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              title="Delete"
              onClick={() => onDelete(product)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);

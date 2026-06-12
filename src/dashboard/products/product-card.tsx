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
import {
  getOfferStatusKey,
  getProductImageUrl,
  isOfferCurrentlyActive,
} from "./product-utils";

const offerBadgeClass: Record<string, string> = {
  offer_active_status: "bg-cyan-500/90 text-white",
  offer_scheduled: "bg-blue-500/90 text-white",
  offer_expired: "bg-muted text-muted-foreground",
  offer_none: "bg-secondary text-muted-foreground",
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
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative h-40 cursor-pointer overflow-hidden bg-muted/30">
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgSrc(getProductImageUrl(null))}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <Eye className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <div
              className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm ${
                product.active
                  ? "bg-emerald-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
            >
              {product.active ? t("active") : t("inactive") || "معطل"}
            </div>

            <div className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-sm">
              #{product.id}
            </div>

            {hasLiveOffer && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-cyan-600/90 px-2 py-1 text-[10px] font-bold text-white">
                <Tag className="h-3 w-3" />
                {t("special_offer")}
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>{product.name}</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getProductImageUrl(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-sm font-bold text-foreground">
            {product.name}
          </h3>
          {product.categories?.name && (
            <p className="text-xs text-muted-foreground">
              {product.categories.name}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-black text-primary">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.source && (
            <Badge variant="outline" className="text-[10px]">
              {product.source}
            </Badge>
          )}
        </div>

        <div
          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${offerBadgeClass[offerKey] || offerBadgeClass.offer_none}`}
        >
          {t(offerKey)}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-2">
            <Switch
              dir="ltr"
              checked={product.active}
              disabled={toggleMutation.isPending}
              onCheckedChange={(checked) => {
                toggleMutation.mutate(checked ? 1 : 0);
              }}
              id={`product-switch-${product.id}`}
            />
            <span className="text-[11px] text-muted-foreground">
              {t("active")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={t("offer")}
              onClick={() => onOffer(product)}
            >
              <Tag className="h-4 w-4 text-cyan-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Edit"
              onClick={() => onEdit(product)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
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

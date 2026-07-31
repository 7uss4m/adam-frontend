import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Tag, Zap } from "lucide-react";
import { Product } from "../types/types";
import { useCurrency } from "../context/CurrencyContext";
import getDollar from "../api/getDollar";
import {
  getProductImageUrl,
  getProductPath,
  isOfferActive,
} from "./home-utils";

type ProductCardProps = {
  product: Product;
  index?: number;
};

/** Format a number with just enough decimals so a positive value never rounds to 0. */
function smartNumber(v: number, baseDecimals: number) {
  if (!Number.isFinite(v) || v === 0) return "0";
  let d = baseDecimals;
  while (d < 6 && Number(v.toFixed(d)) === 0) d++;
  return v.toFixed(d);
}

/** True when the product's price depends on a quantity the customer enters. */
function isQuantityBased(product: Product) {
  return (product.requires || []).some(
    (r) => r.type === "quantity" || r.type === "amount" || r.type === "selectQty"
  );
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(getProductImageUrl(product.image));
  const { currency } = useCurrency();
  const [t] = useTranslation("global");

  const { data: usdToSyp = 0 } = useQuery({
    queryKey: ["static", "dollar_exchange"],
    queryFn: async () => {
      const res = await getDollar();
      return Number(res.data.date.dollar_exchange || 0);
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const formatMoney = (usd: number | string) => {
    const n = Number(usd);
    if (currency === "syrian" && usdToSyp > 0) {
      return `${smartNumber(n * usdToSyp, 0)} ل.س`;
    }
    return `$${smartNumber(n, 2)}`;
  };

  const quantityBased = isQuantityBased(product);
  const price = Number(product.price);
  const mainPrice = Number(product.mainPrice || 0);
  const hasDiscount =
    product.hasOffer ||
    isOfferActive(product) ||
    (mainPrice > price && mainPrice > 0);
  const originalPrice = product.originalPrice ?? (hasDiscount ? mainPrice : null);

  return (
    <Link to={getProductPath(product)} className="block h-full">
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.25, type: "spring", stiffness: 320 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            onError={() => setImgSrc(getProductImageUrl(null))}
            className={`h-full w-full transition-transform duration-500 group-hover:scale-110 ${
              imgSrc.includes("logo") ? "object-contain p-6" : "object-cover"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/90 via-transparent to-transparent" />

          {hasDiscount && (
            <div className="absolute start-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-2.5 py-1 text-[10px] font-bold text-foreground shadow-lg">
              <Tag className="h-3 w-3" />
              {product.offer_type === "percent" && product.discount_percent
                ? `-${product.discount_percent}%`
                : "عرض"}
            </div>
          )}

          {index < 3 && !hasDiscount && (
            <div className="absolute start-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-2.5 py-1 text-[10px] font-bold text-black shadow-lg">
              <Zap className="h-3 w-3" />
              مميز
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          {product.categories?.name && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-500/80">
              {product.categories.name}
            </p>
          )}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-foreground">
            {product.name}
          </h3>

          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <div>
              {quantityBased ? (
                <p className="text-sm font-black text-cyan-400">
                  {t("price_by_quantity")}
                </p>
              ) : (
                <>
                  <p className="text-lg font-black tabular-nums text-cyan-400">
                    {formatMoney(price)}
                  </p>
                  {originalPrice && Number(originalPrice) > price && (
                    <p className="text-xs tabular-nums text-muted-foreground line-through">
                      {formatMoney(originalPrice)}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-foreground shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-110">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

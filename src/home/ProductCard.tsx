import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, Tag, Zap } from "lucide-react";
import { Product } from "../types/types";
import {
  formatUsd,
  getProductImageUrl,
  getProductPath,
  isOfferActive,
} from "./home-utils";

type ProductCardProps = {
  product: Product;
  index?: number;
};

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(getProductImageUrl(product.image));
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
              <p className="text-lg font-black tabular-nums text-cyan-400">
                {formatUsd(price)}
              </p>
              {originalPrice && Number(originalPrice) > price && (
                <p className="text-xs tabular-nums text-muted-foreground line-through">
                  {formatUsd(originalPrice)}
                </p>
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

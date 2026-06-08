import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  instant?: boolean;
}

const ProductCard = ({
  name,
  category,
  price,
  originalPrice,
  image,
  badge,
  instant,
}: ProductCardProps) => {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const [imgSrc, setImgSrc] = useState(image || "/placeholder.svg");

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30"
    >
      {badge && (
        <div className="absolute right-3 top-3 z-10 rounded-md gradient-gold px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          {badge}
        </div>
      )}

      {discount > 0 && (
        <div className="absolute left-3 top-3 z-10 rounded-md bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
          -{discount}%
        </div>
      )}

      <div className="relative h-40 overflow-hidden bg-secondary">
        <img
          src={imgSrc}
          alt={name}
          loading="lazy"
          onError={() => setImgSrc("/placeholder.svg")}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
      </div>

      <div className="p-4">
        <p className="text-[10px] font-semibold text-primary">{category}</p>
        <h3 className="mt-1 line-clamp-1 text-sm font-bold text-foreground">
          {name}
        </h3>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-orbitron text-lg font-black text-primary">
            ${price}
          </span>
          {originalPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              ${originalPrice}
            </span>
          ) : null}
        </div>

        {instant && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-neon-green">
            <Zap className="h-3 w-3" />
            <span>تسليم فوري</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
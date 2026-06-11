import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import logo from "../assets/logo.webp";

interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  instant?: boolean;
  index?: number;
}

const BADGES = ["الأكثر مبيعاً", "عرض خاص"];
const BADGE_COLORS = ["bg-green-500", "bg-cyan-600"];

const ProductCard = ({
  name,
  price,
  originalPrice,
  image,
  badge,
  index = 0,
}: ProductCardProps) => {
  const [imgSrc, setImgSrc] = useState(image || logo);

  const badgeIdx = index % 3;
  const showBadge = badge || badgeIdx < 2;
  const badgeText = badge || BADGES[badgeIdx % 2];
  const badgeColor = BADGE_COLORS[badgeIdx % 2];

  const rating = 4.9;
  const reviewCount = 128 + index * 47;
  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-2xl border border-[#1a2a44] bg-[#0a1628] hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0d1b2e]">
        <img
          src={imgSrc}
          alt={name}
          loading="lazy"
          onError={() => setImgSrc(logo)}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-110 ${imgSrc === logo ? "object-contain p-6" : "object-cover"}`}
        />

        {/* Badge */}
        {showBadge && (
          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold text-white ${badgeColor}`}>
            {badgeText}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 space-y-2.5">
        <h3 className="text-sm font-bold text-white line-clamp-1 text-center">{name}</h3>

        {/* Rating + Price row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {price > 0 && (
              <span className="text-base font-black text-cyan-400">${price.toLocaleString()}</span>
            )}
            {hasDiscount && (
              <span className="text-xs text-gray-500 line-through">${originalPrice.toLocaleString()}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-[11px] text-yellow-400 font-bold">{rating}</span>
            <span className="text-[10px] text-gray-500">({reviewCount})</span>
          </div>
        </div>

        {/* Buy button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-shadow"
        >
          <span>شراء الآن</span>
          <ShoppingCart className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
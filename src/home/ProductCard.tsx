import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Zap } from "lucide-react";
import logo from "../assets/logo.webp";

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
  image,
  badge,
  instant,
}: ProductCardProps) => {
  const [imgSrc, setImgSrc] = useState(image || logo);


  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-transparent cursor-pointer shadow-md hover:shadow-yellow-500/20 hover:shadow-xl hover:border-yellow-400/50 transition-all duration-300"
    >
      {/* Shimmer */}
      <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>

      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imgSrc}
          alt={name}
          loading="lazy"
          onError={() => setImgSrc("/placeholder.svg")}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1">
          {/* Featured star */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-400/90 backdrop-blur-sm shadow-md">
            <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
            <span className="text-[10px] font-black text-yellow-900">مميز</span>
          </div>

          {/* Instant delivery badge */}
          {instant && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/90 backdrop-blur-sm shadow-md">
              <Zap className="w-3 h-3 text-white fill-white" />
              <span className="text-[10px] font-bold text-white">فوري</span>
            </div>
          )}
        </div>

        {/* Custom badge */}
        {badge && (
          <div className="absolute top-9 left-2.5">
            <span className="px-2 py-0.5 rounded-full bg-primary/90 text-[10px] font-bold text-white backdrop-blur-sm">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Label */}
      <div className="px-3 py-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent">
        <h3 className="text-xs font-bold text-white line-clamp-1 text-center tracking-wide">
          {name}
        </h3>
      </div>
    </motion.div>
  );
};

export default ProductCard;

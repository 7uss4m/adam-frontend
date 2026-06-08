import { useState } from "react";
import { motion } from "framer-motion";

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
}: ProductCardProps) => {
  const [imgSrc, setImgSrc] = useState(image || "/placeholder.svg");

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="group relative aspect-square overflow-hidden rounded-2xl border border-white/5 bg-card"
    >
      <img
        src={imgSrc}
        alt={name}
        loading="lazy"
        onError={() => setImgSrc("/placeholder.svg")}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
        <h3 className="text-sm font-bold text-white drop-shadow-lg line-clamp-1">
          {name}
        </h3>
      </div>
    </motion.div>
  );
};

export default ProductCard;

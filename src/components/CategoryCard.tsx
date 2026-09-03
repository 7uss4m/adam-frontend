import { useState } from "react";
import { Link } from "react-router-dom";
import type { Category } from "../types/types";
import logo from "../assets/logo.webp";

export default function CategoryCard({ cat }: { cat: Category }) {
  const [imgSrc, setImgSrc] = useState(cat.image || logo);

  return (
    <Link to={`/categories/${cat.id}/subs`}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200 hover:border-primary/40 cursor-pointer">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imgSrc}
            alt={cat.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgSrc(logo)}
          />
        </div>

        <div className="px-3 py-2.5">
          <p className="text-sm font-bold text-foreground line-clamp-1 text-center">
            {cat.name}
          </p>
        </div>
      </div>
    </Link>
  );
}

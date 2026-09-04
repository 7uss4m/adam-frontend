import { useState } from "react";
import { Link } from "react-router-dom";
import type { MainCategory } from "../types/types";
import logo from "../assets/logo.webp";

export default function MainCategoryCard({ mc }: { mc: MainCategory }) {
  const [imgSrc, setImgSrc] = useState(mc.image || logo);

  return (
    <Link to={`/main-categories/${mc.id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200 hover:border-primary/40 cursor-pointer">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imgSrc}
            alt={mc.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgSrc(logo)}
          />
        </div>

        <div className="px-3 py-2.5">
          <p className="text-sm font-bold text-foreground line-clamp-1 text-center">
            {mc.name}
          </p>
        </div>
      </div>
    </Link>
  );
}
